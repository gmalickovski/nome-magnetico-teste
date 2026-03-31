/**
 * POST /api/webhooks/chatwoot-articles
 *
 * Recebe eventos do Chatwoot Help Center e sincroniza com o Supabase.
 * Configurar em: Chatwoot → Settings → Integrations → Webhooks
 * Selecionar apenas eventos: article_published, article_updated, article_archived
 *
 * Sentido: Chatwoot Help Center → Supabase faq_items
 */
import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const POST: APIRoute = async ({ request }) => {
  // Validação mínima do secret (opcional mas recomendado)
  const secret = process.env.CHATWOOT_WEBHOOK_SECRET ?? '';
  if (secret) {
    const incomingSecret = request.headers.get('x-chatwoot-signature') ?? '';
    if (incomingSecret !== secret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const body = await request.json().catch(() => null);
  if (!body?.event) return new Response('OK', { status: 200 });

  const { event, data: article } = body as {
    event: string;
    data: Record<string, unknown>;
  };

  // Ignora eventos que não são de artigos do Help Center
  const ARTICLE_EVENTS = ['article_published', 'article_updated', 'article_archived'];
  if (!ARTICLE_EVENTS.includes(event) || !article) {
    return new Response('OK', { status: 200 });
  }

  const articleId      = String(article.id ?? '');
  const title          = String(article.title ?? '');
  const content        = String(article.content ?? ''); // Chatwoot armazena markdown
  const status         = String(article.status ?? 'published');
  const isActive       = status === 'published';
  const slug           = article.slug ? String(article.slug) : null;
  const meta           = article.meta as Record<string, unknown> | null;
  const metaTitle      = meta?.title ? String(meta.title) : null;
  const metaDesc       = meta?.description ? String(meta.description) : null;
  const metaTags       = Array.isArray(meta?.tags) ? (meta!.tags as unknown[]).map(String) : null;

  if (!articleId || !title) return new Response('OK', { status: 200 });

  // Tenta mapear categoria do Chatwoot para a categoria local
  let categoryId: string | null = null;
  const chatwootCatId = (article.category as Record<string, unknown>)?.id;
  if (chatwootCatId) {
    const { data: cat } = await supabase
      .from('faq_categories')
      .select('id')
      .eq('chatwoot_category_id', Number(chatwootCatId))
      .maybeSingle();
    if (cat) categoryId = cat.id;
  }
  // Fallback: tenta por nome da categoria
  if (!categoryId) {
    const catName = (article.category as Record<string, unknown>)?.name;
    if (catName) {
      const { data: cat } = await supabase
        .from('faq_categories')
        .select('id')
        .ilike('title', String(catName))
        .maybeSingle();
      if (cat) categoryId = cat.id;
    }
  }

  const upsertData: Record<string, unknown> = {
    chatwoot_article_id: articleId,
    question:            title,
    answer_markdown:     content,
    is_active:           isActive,
    updated_at:          new Date().toISOString(),
  };
  if (slug)        upsertData.slug             = slug;
  if (categoryId)  upsertData.category_id      = categoryId;
  if (metaTitle)   upsertData.meta_title        = metaTitle;
  if (metaDesc)    upsertData.meta_description  = metaDesc;
  if (metaTags)    upsertData.meta_tags         = metaTags;

  const { error } = await supabase
    .from('faq_items')
    .upsert(upsertData, { onConflict: 'chatwoot_article_id' });

  if (error) {
    console.error('[webhooks/chatwoot-articles] Erro ao upsert:', articleId, error);
    return new Response('Internal Error', { status: 500 });
  }

  console.log(`[webhooks/chatwoot-articles] ${event} → artigo ${articleId} sincronizado`);
  return new Response('OK', { status: 200 });
};
