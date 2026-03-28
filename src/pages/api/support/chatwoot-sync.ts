/**
 * POST /api/support/chatwoot-sync
 *
 * Recebe trigger (do Supabase DB Webhook ou chamada interna) e cria/atualiza
 * a conversa no Chatwoot para o ticket correspondente.
 *
 * Payload aceito:
 *   { ticket_id: string }                    ← chamada interna (X-Internal-Secret)
 *   Supabase DB Webhook payload completo      ← { type, table, record: { id, ... } }
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';
import {
  getChatwootConfig,
  findOrCreateContact,
  createConversation,
  postMessage,
  applyLabels,
  LABEL_MAP,
} from '../../../backend/support/chatwootClient';

const PRODUCT_LABEL = (process.env.PRODUCT_SLUG ?? 'nm-nome-magnetico').trim();

export const POST: APIRoute = async ({ request }) => {
  // ── Autenticação: internal secret ou Supabase webhook secret ──────────────
  const internalSecret  = (process.env.INTERNAL_API_SECRET ?? '').trim();
  const supabaseSecret  = (process.env.SUPABASE_WEBHOOK_SECRET ?? '').trim();
  const authHeader      = request.headers.get('X-Internal-Secret') ?? '';
  const supabaseToken   = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

  const isInternal = internalSecret && authHeader === internalSecret;
  const isSupabase = supabaseSecret && supabaseToken === supabaseSecret;

  if (!isInternal && !isSupabase) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  // ── Extrair ticket_id do payload ──────────────────────────────────────────
  let ticketId: string | null = null;
  try {
    const body = await request.json();
    // Chamada interna: { ticket_id: '...' }
    if (body?.ticket_id) {
      ticketId = body.ticket_id;
    }
    // Supabase DB Webhook: { type: 'INSERT', table: 'support_tickets', record: { id: '...' } }
    else if (body?.type === 'INSERT' && body?.table === 'support_tickets' && body?.record?.id) {
      ticketId = body.record.id;
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Payload inválido.' }), { status: 400 });
  }

  if (!ticketId) {
    return new Response(JSON.stringify({ error: 'ticket_id ausente.' }), { status: 400 });
  }

  // ── Verificar se já tem conversa no Chatwoot ──────────────────────────────
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('subject, contact_email, contact_name, priority, user_id, chatwoot_conversation_id')
    .eq('id', ticketId)
    .single();

  if (!ticket) {
    return new Response(JSON.stringify({ error: 'Ticket não encontrado.' }), { status: 404 });
  }

  if (ticket.chatwoot_conversation_id) {
    // Já sincronizado — idempotente
    return new Response(JSON.stringify({ success: true, already_synced: true }), { status: 200 });
  }

  // ── Verificar config Chatwoot ─────────────────────────────────────────────
  const cwConfig = getChatwootConfig();
  if (!cwConfig) {
    return new Response(JSON.stringify({ error: 'Chatwoot não configurado.' }), { status: 503 });
  }

  // ── Buscar mensagem inicial do ticket ─────────────────────────────────────
  // Aguarda até 2s para que o INSERT de support_messages seja concluído
  let mensagem = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: msgs } = await supabase
      .from('support_messages')
      .select('content')
      .eq('ticket_id', ticketId)
      .eq('is_admin', false)
      .order('created_at', { ascending: true })
      .limit(1);
    if (msgs?.[0]?.content) {
      mensagem = msgs[0].content;
      break;
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 700));
  }

  // ── Verificar VIP (subscription ativa) ───────────────────────────────────
  let isVip = false;
  if (ticket.user_id) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', ticket.user_id)
      .gt('ends_at', new Date().toISOString())
      .limit(1);
    isVip = (subs?.length ?? 0) > 0;
  }

  const inboxId    = (isVip && cwConfig.inboxIdClientes) ? cwConfig.inboxIdClientes : cwConfig.inboxIdGeral;
  const cwPriority = isVip ? 'urgent' : (ticket.user_id ? 'medium' : 'low') as 'low' | 'medium' | 'urgent';

  // ── Criar conversa no Chatwoot ────────────────────────────────────────────
  try {
    const contactId = await findOrCreateContact(
      cwConfig,
      ticket.contact_email ?? 'anonimo@nomemagnetico.com.br',
      ticket.contact_name ?? 'Visitante',
    );

    const convId = await createConversation(cwConfig, contactId, inboxId, cwPriority, {
      assunto:   ticket.subject,
      ticket_id: ticketId,
    });

    if (mensagem) {
      await postMessage(cwConfig, convId, mensagem, 'incoming', false);
    }

    const labels: string[] = [];
    if (ticket.subject && LABEL_MAP[ticket.subject]) labels.push(LABEL_MAP[ticket.subject]);
    labels.push(PRODUCT_LABEL);
    if (isVip) labels.push('nm-vip');
    applyLabels(cwConfig, convId, labels);

    // Salvar conversation_id no ticket
    await supabase
      .from('support_tickets')
      .update({ chatwoot_conversation_id: String(convId) })
      .eq('id', ticketId);

    return new Response(JSON.stringify({ success: true, chatwoot_conversation_id: convId }), { status: 200 });
  } catch (err) {
    console.error('[chatwoot-sync] Erro ao criar conversa:', err);
    return new Response(JSON.stringify({ error: 'Falha ao criar conversa no Chatwoot.' }), { status: 500 });
  }
};
