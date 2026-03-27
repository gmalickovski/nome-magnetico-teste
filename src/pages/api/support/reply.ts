import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';
import { getChatwootConfig, postMessage, toggleConversationStatus } from '../../../backend/support/chatwootClient';

const bodySchema = z.object({
  ticket_id: z.string().uuid(),
  content:   z.string().min(1),
  resolve:   z.boolean().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Apenas admin
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 });
  }

  const { ticket_id, content, resolve } = body;

  // Buscar ticket incluindo chatwoot_conversation_id
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('contact_email, contact_name, subject, status, chatwoot_conversation_id')
    .eq('id', ticket_id)
    .single();

  if (!ticket) {
    return new Response(JSON.stringify({ error: 'Ticket não encontrado.' }), { status: 404 });
  }

  // Salvar resposta no Supabase
  const { error: msgErr } = await supabase.from('support_messages').insert({
    ticket_id,
    author_id: user.id,
    is_admin:  true,
    content,
  });

  if (msgErr) {
    return new Response(JSON.stringify({ error: 'Erro ao salvar resposta.' }), { status: 500 });
  }

  // Atualizar status do ticket
  const newStatus = resolve ? 'resolved' : 'in_progress';
  await supabase
    .from('support_tickets')
    .update({
      status: newStatus,
      ...(resolve ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq('id', ticket_id);

  // ── Espelhar resposta no Chatwoot (fire-and-forget) ───────────────────────
  // O webhook do Chatwoot cuida da notificação de email ao usuário ao receber esta mensagem.
  const cwConvIdStr = ticket.chatwoot_conversation_id as string | null;
  if (cwConvIdStr) {
    const cwConvId = parseInt(cwConvIdStr, 10);
    if (!isNaN(cwConvId)) {
      const cwConfig = getChatwootConfig();
      if (cwConfig) {
        postMessage(cwConfig, cwConvId, content, 'outgoing', false);
        if (resolve) {
          toggleConversationStatus(cwConfig, cwConvId, 'resolved');
        }
      }
    }
  }

  return new Response(JSON.stringify({ success: true, status: newStatus }), { status: 200 });
};
