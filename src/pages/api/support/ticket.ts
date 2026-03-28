import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';

const bodySchema = z.object({
  assunto:  z.string().min(1),
  mensagem: z.string().min(10),
  nome:     z.string().optional(),
  email:    z.string().email().optional(),
});


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

  const internalSecret = (process.env.INTERNAL_API_SECRET ?? '').trim();
  const appUrl = (process.env.APP_URL ?? 'http://localhost:4321').replace(/\/$/, '');

  // ── 2. Notificar usuário por email via N8N ────────────────────────────────
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

  // ── 3. Triagem IA (best-effort assíncrono) ────────────────────────────────
  if (internalSecret) {
    fetch(`${appUrl}/api/support/claude-triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': internalSecret },
      body: JSON.stringify({ ticket_id: ticketId, chatwoot_conversation_id: null }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ success: true, ticketId }), { status: 200 });
};
