import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';
import {
  getChatwootConfig,
  findOrCreateContact,
  createConversation,
  postMessage,
  applyLabels,
  LABEL_MAP,
} from '../../../backend/support/chatwootClient';

const bodySchema = z.object({
  assunto:  z.string().min(1),
  mensagem: z.string().min(10),
  nome:     z.string().optional(),
  email:    z.string().email().optional(),
});

// Produto identificado por env var — extensível para multi-SaaS
const PRODUCT_LABEL = (process.env.PRODUCT_SLUG ?? 'nm-nome-magnetico').trim();

export const POST: APIRoute = async ({ request, locals }) => {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 });
  }

  const { assunto, mensagem } = body;

  // Resolver identidade: autenticado > body
  let contactName  = body.nome ?? 'Visitante';
  let contactEmail = body.email ?? '';

  const authUser = locals.user;
  if (authUser) {
    contactEmail = authUser.email ?? contactEmail;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', authUser.id)
        .single();
      contactName = profile?.nome ?? contactEmail.split('@')[0];
    } catch { /* silencioso */ }
  }

  if (!contactEmail) {
    return new Response(JSON.stringify({ error: 'Email é obrigatório.' }), { status: 400 });
  }

  // Verificar subscription para determinar prioridade
  let isVip = false;
  if (authUser) {
    try {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', authUser.id)
        .gt('ends_at', new Date().toISOString())
        .limit(1);
      isVip = (subs?.length ?? 0) > 0;
    } catch { /* silencioso */ }
  }

  const priority = isVip ? 'urgent' : (authUser ? 'normal' : 'low');

  // ── 1. Persistir no Supabase ──────────────────────────────────────────────
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert({
      user_id:       authUser?.id ?? null,
      contact_email: contactEmail,
      contact_name:  contactName,
      subject:       assunto,
      status:        'open',
      priority,
    })
    .select('id')
    .single();

  if (ticketErr || !ticket?.id) {
    console.error('[ticket] Erro ao salvar no Supabase:', ticketErr);
    return new Response(
      JSON.stringify({ error: 'Falha ao registrar ticket. Tente novamente.' }),
      { status: 500 },
    );
  }

  const ticketId = ticket.id as string;

  // Salvar mensagem inicial (await para que a triagem possa lê-la imediatamente)
  await supabase.from('support_messages').insert({
    ticket_id: ticketId,
    author_id: authUser?.id ?? null,
    is_admin:  false,
    content:   mensagem,
  });

  // ── 2. Criar conversa no Chatwoot ─────────────────────────────────────────
  let chatwootConversationId: number | null = null;
  const cwConfig = getChatwootConfig();

  if (cwConfig) {
    try {
      // Escolher inbox: clientes VIP têm inbox dedicada (se configurada)
      const inboxId   = (isVip && cwConfig.inboxIdClientes) ? cwConfig.inboxIdClientes : cwConfig.inboxIdGeral;
      const cwPriority: 'low' | 'medium' | 'urgent' = isVip ? 'urgent' : (authUser ? 'medium' : 'low');

      const contactId = await findOrCreateContact(cwConfig, contactEmail, contactName);

      chatwootConversationId = await createConversation(
        cwConfig,
        contactId,
        inboxId,
        cwPriority,
        { assunto, ticket_id: ticketId },
      );

      await postMessage(cwConfig, chatwootConversationId, mensagem, 'incoming', false);

      // Labels: assunto + produto + vip
      const labels: string[] = [];
      if (LABEL_MAP[assunto]) labels.push(LABEL_MAP[assunto]);
      labels.push(PRODUCT_LABEL);
      if (isVip) labels.push('nm-vip');
      applyLabels(cwConfig, chatwootConversationId, labels);

      // Salvar conversation_id no ticket
      await supabase
        .from('support_tickets')
        .update({ chatwoot_conversation_id: String(chatwootConversationId) })
        .eq('id', ticketId);
    } catch (err) {
      // Graceful degradation — ticket salvo no Supabase; Chatwoot falhou mas não bloqueamos o usuário
      console.error('[ticket] Erro ao criar conversa no Chatwoot:', err);
      chatwootConversationId = null;
    }
  }

  // ── 3. Notificar usuário por email via N8N ────────────────────────────────
  notify('support.ticket_created', {
    email:     contactEmail,
    firstName: contactName.split(' ')[0],
    nome:      contactName,
    ticketId,
    assunto,
    mensagem,
    priority,
    isVip,
  }).catch(() => {});

  // ── 4. Triagem IA (best-effort assíncrono) ────────────────────────────────
  const internalSecret = (process.env.INTERNAL_API_SECRET ?? '').trim();
  if (internalSecret) {
    const appUrl = (process.env.APP_URL ?? 'http://localhost:4321').replace(/\/$/, '');
    fetch(`${appUrl}/api/support/claude-triage`, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'X-Internal-Secret': internalSecret,
      },
      body: JSON.stringify({
        ticket_id:                ticketId,
        chatwoot_conversation_id: chatwootConversationId,
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ success: true, ticketId }), { status: 200 });
};
