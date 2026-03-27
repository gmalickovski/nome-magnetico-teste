import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';

// ── Helpers para artigos do Help Center ──────────────────────────────────────

async function upsertFaqArticle(article: Record<string, unknown>, isActive: boolean) {
  const articleId = String(article.id ?? '');
  const title     = String(article.title ?? '');
  const content   = String(article.content ?? '');
  const slug      = article.slug != null ? String(article.slug) : null;

  if (!articleId || !title) return;

  // Buscar categoria_id no Supabase (fallback: primeira categoria)
  const { data: categories } = await supabase
    .from('faq_categories')
    .select('id')
    .eq('is_active', true)
    .order('order_index')
    .limit(1);
  const fallbackCategoryId = categories?.[0]?.id ?? null;

  await supabase.from('faq_items').upsert(
    {
      chatwoot_article_id:  articleId,
      chatwoot_category_id: article.category_id != null ? String(article.category_id) : null,
      question:             title,
      answer:               content.replace(/<[^>]*>/g, ''),
      answer_html:          content,
      slug,
      is_active:            isActive,
      category_id:          fallbackCategoryId,
      updated_at:           new Date().toISOString(),
    },
    { onConflict: 'chatwoot_article_id' },
  ).catch((err: unknown) => console.error('[chatwoot-webhook] upsert faq_item falhou:', err));
}

// Mapeamento de status Chatwoot → Supabase
const STATUS_MAP: Record<string, string> = {
  open:     'open',
  resolved: 'resolved',
  pending:  'open',
  snoozed:  'in_progress',
};

function verifySignature(secret: string, rawBody: string, sig: string | null): boolean {
  if (!sig) return false;
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const sigBuf      = Buffer.from(sig, 'utf8');
    if (expectedBuf.length !== sigBuf.length) return false;
    return timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Ler body como texto para verificação HMAC
  const rawBody = await request.text();

  const webhookSecret = (process.env.CHATWOOT_WEBHOOK_SECRET ?? '').trim();
  if (webhookSecret) {
    const sig = request.headers.get('X-Chatwoot-Signature');
    if (!verifySignature(webhookSecret, rawBody, sig)) {
      console.warn('[chatwoot-webhook] Assinatura inválida');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  // Chatwoot espera 200 — sempre retornar 200 para evitar retenativas infinitas
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const event        = payload.event as string | undefined;
  const conversation = payload.conversation as Record<string, unknown> | undefined;
  const message      = payload.message      as Record<string, unknown> | undefined;
  const article      = payload.article      as Record<string, unknown> | undefined;

  if (!event) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // ── Eventos do Help Center (artigos de FAQ) ───────────────────────────────
  if (event === 'article_published' && article) {
    await upsertFaqArticle(article, true);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event === 'article_updated' && article) {
    const isActive = String(article.status ?? 'published') === 'published';
    await upsertFaqArticle(article, isActive);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event === 'article_archived' && article) {
    const articleId = String(article.id ?? '');
    if (articleId) {
      await supabase
        .from('faq_items')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('chatwoot_article_id', articleId);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // ── Eventos de conversa requerem conversation ─────────────────────────────
  if (!conversation) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const chatwootConvId = String(conversation.id ?? '');
  if (!chatwootConvId) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Buscar ticket pelo chatwoot_conversation_id
  async function findTicket() {
    const { data } = await supabase
      .from('support_tickets')
      .select('id, contact_email, contact_name, subject, status')
      .eq('chatwoot_conversation_id', chatwootConvId)
      .single();
    return data;
  }

  // ── message_created ─────────────────────────────────────────────────────────
  if (event === 'message_created' && message) {
    const msgType   = message.message_type as string;
    const isPrivate = message.private === true;

    // Ignorar: notas privadas (triagem IA, notas internas) e mensagens incoming (do usuário)
    if (isPrivate || msgType !== 'outgoing') {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Ignorar respostas de bots para evitar loops
    const sender = message.sender as Record<string, unknown> | undefined;
    if (sender?.type === 'agent_bot') {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const ticket = await findTicket();
    if (!ticket) {
      console.warn(`[chatwoot-webhook] Ticket não encontrado para conversation_id=${chatwootConvId}`);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Atualizar status para in_progress se ainda estiver open
    if (ticket.status === 'open') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', ticket.id);
    }

    // Salvar mensagem do agente no Supabase
    const content = (message.content as string) ?? '';
    supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      author_id: null,
      is_admin: true,
      content: `[Resposta via Chatwoot]\n${content}`,
    }).then(() => {}).catch(() => {});

    // Notificar usuário por email via N8N
    notify('support.ticket_reply', {
      email:     ticket.contact_email,
      firstName: (ticket.contact_name ?? 'Cliente').split(' ')[0],
      ticketId:  ticket.id,
      assunto:   ticket.subject,
      mensagem:  content,
    }).catch(() => {});

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // ── conversation_resolved ────────────────────────────────────────────────────
  if (event === 'conversation_resolved') {
    const ticket = await findTicket();
    if (!ticket) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    await supabase
      .from('support_tickets')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', ticket.id);

    notify('support.ticket_resolved', {
      email:     ticket.contact_email,
      firstName: (ticket.contact_name ?? 'Cliente').split(' ')[0],
      ticketId:  ticket.id,
      assunto:   ticket.subject,
    }).catch(() => {});

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // ── conversation_status_changed ──────────────────────────────────────────────
  if (event === 'conversation_status_changed') {
    const chatwootStatus = conversation.status as string | undefined;
    const supabaseStatus = chatwootStatus ? STATUS_MAP[chatwootStatus] : undefined;

    if (supabaseStatus) {
      const ticket = await findTicket();
      if (ticket) {
        const update: Record<string, unknown> = { status: supabaseStatus };
        if (supabaseStatus === 'resolved') {
          update.resolved_at = new Date().toISOString();
        }
        await supabase.from('support_tickets').update(update).eq('id', ticket.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Evento desconhecido — retornar 200 mesmo assim
  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
