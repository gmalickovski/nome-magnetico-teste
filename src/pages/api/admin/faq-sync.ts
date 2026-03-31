import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

// GET  ?source=chatwoot  → importa artigos do Chatwoot Help Center → UPSERT no Supabase
// POST { action: 'migrate-to-chatwoot' } → envia FAQs do Supabase → Chatwoot via N8N

async function requireAdmin(locals: App.Locals) {
  const user = locals.user;
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? user : null;
}

function getChatwootCfg() {
  const base = (process.env.CHATWOOT_BASE_URL ?? '').replace(/\/$/, '');
  const token = process.env.CHATWOOT_API_TOKEN ?? '';
  const accountId = process.env.CHATWOOT_ACCOUNT_ID ?? '';
  if (!base || !token || !accountId) return null;
  return { base, token, accountId };
}

function cwUrl(cfg: { base: string; token: string; accountId: string }, path: string, extra = '') {
  return `${cfg.base}/api/v1/accounts/${cfg.accountId}${path}?api_access_token=${cfg.token}${extra}`;
}

// ── GET: importar artigos do Chatwoot → Supabase ─────────────────────────────
export const GET: APIRoute = async ({ url, locals }) => {
  const admin = await requireAdmin(locals);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
  }

  const source = url.searchParams.get('source') ?? 'chatwoot';
  if (source !== 'chatwoot') {
    return new Response(JSON.stringify({ error: 'source inválido (use: chatwoot)' }), { status: 400 });
  }

  const cfg = getChatwootCfg();
  const portalSlug = (process.env.CHATWOOT_PORTAL_SLUG ?? '').trim();

  if (!cfg || !portalSlug) {
    return new Response(
      JSON.stringify({ error: 'Chatwoot não configurado.' }),
      { status: 503 },
    );
  }

  let allArticles: Array<Record<string, unknown>> = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      cwUrl(cfg, `/portals/${portalSlug}/articles`, `&page=${page}&locale=pt_BR`),
      { headers: { 'Content-Type': 'application/json' } },
    );
    if (!res.ok) break;
    const data = await res.json();
    const articles: Array<Record<string, unknown>> = data?.payload ?? [];
    if (!articles.length) break;
    allArticles = allArticles.concat(articles);
    if (articles.length < 25) break;
    page++;
  }

  if (!allArticles.length) {
    return new Response(
      JSON.stringify({ synced: 0, message: 'Nenhum artigo encontrado no Chatwoot Help Center.' }),
      { status: 200 },
    );
  }

  const { data: categories } = await supabase
    .from('faq_categories')
    .select('id, slug, title');

  let synced = 0;
  let errors = 0;

  for (const article of allArticles) {
    const articleId  = String(article.id ?? '');
    const title      = String(article.title ?? '');
    // Chatwoot armazena conteúdo em markdown
    const content    = String(article.content ?? '');
    const status     = String(article.status ?? 'published');
    const isActive   = status === 'published';
    const slug       = article.slug != null ? String(article.slug) : null;
    const meta       = article.meta as Record<string, unknown> | null;
    const metaTitle  = meta?.title ? String(meta.title) : null;
    const metaDesc   = meta?.description ? String(meta.description) : null;
    const metaTags   = Array.isArray(meta?.tags) ? (meta!.tags as unknown[]).map(String) : null;

    if (!articleId || !title) continue;

    let supabaseCategoryId: string | null = null;
    if (categories?.length) {
      const matched = categories.find(c => c.slug === slug || c.title.toLowerCase() === title.toLowerCase());
      supabaseCategoryId = matched?.id ?? categories[0]?.id ?? null;
    }

    const { error } = await supabase
      .from('faq_items')
      .upsert(
        {
          chatwoot_article_id: articleId,
          question:            title,
          answer_markdown:     content,
          slug,
          is_active:           isActive,
          category_id:         supabaseCategoryId,
          updated_at:          new Date().toISOString(),
          ...(metaTitle  && { meta_title:       metaTitle }),
          ...(metaDesc   && { meta_description: metaDesc }),
          ...(metaTags   && { meta_tags:        metaTags }),
        },
        { onConflict: 'chatwoot_article_id' },
      );

    if (error) {
      console.error('[faq-sync] Erro ao upsert artigo:', articleId, error);
      errors++;
    } else {
      synced++;
    }
  }

  return new Response(JSON.stringify({ synced, errors, total: allArticles.length }), { status: 200 });
};

// ── POST: migrar itens do Supabase → Chatwoot via N8N ────────────────────────
export const POST: APIRoute = async ({ request, locals }) => {
  const admin = await requireAdmin(locals);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 });
  }

  if (body.action !== 'migrate-to-chatwoot') {
    return new Response(JSON.stringify({ error: 'action inválida (use: migrate-to-chatwoot)' }), { status: 400 });
  }

  const n8nUrl = (process.env.N8N_WEBHOOK_FAQ_SYNC ?? '').trim();
  if (!n8nUrl) {
    return new Response(
      JSON.stringify({ error: 'N8N_WEBHOOK_FAQ_SYNC não configurado.' }),
      { status: 503 },
    );
  }

  const { data: items, error: fetchErr } = await supabase
    .from('faq_items')
    .select('id, question, answer_markdown, chatwoot_article_id, is_active, order_index, category_id, slug')
    .is('chatwoot_article_id', null)
    .eq('is_active', true);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar items do Supabase.' }), { status: 500 });
  }

  if (!items?.length) {
    return new Response(
      JSON.stringify({ triggered: 0, message: 'Nenhum item pendente de sincronização.' }),
      { status: 200 },
    );
  }

  let triggered = 0;
  let errors = 0;

  for (const item of items) {
    const payload = {
      type:       'INSERT',
      table:      'faq_items',
      schema:     'public',
      record:     item,
      old_record: null,
    };

    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      triggered++;
    } else {
      console.error('[faq-sync] N8N retornou erro para item:', item.id, res.status);
      errors++;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  return new Response(
    JSON.stringify({ triggered, errors, total: items.length }),
    { status: 200 },
  );
};
