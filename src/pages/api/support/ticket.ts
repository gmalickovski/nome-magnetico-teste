import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';

const LABEL_MAP: Record<string, string> = {
  'Bug': 'nm-bug',
  'Sugestão': 'nm-sugestao',
  'Primeiros Passos': 'nm-primeiros-passos',
  'Assinatura e Planos': 'nm-assinaturas-e-planos',
  'Conta e Segurança': 'nm-conta-e-seguranca',
  'Solução de Problemas': 'nm-solucao-de-problemas',
  'Dúvida sobre os planos': 'nm-duvida-sobre-planos',
  'Como funciona a numerologia': 'nm-como-funciona',
  'Informações gerais': 'nm-informacoes-gerais',
  'Parceria ou imprensa': 'nm-parceria',
  'Outros': 'nm-outros',
};

const bodySchema = z.object({
  assunto: z.string().min(1),
  mensagem: z.string().min(10),
  nome: z.string().optional(),
  email: z.string().email().optional(),
});

// Nginx remove headers com underscore por padrão — token passado como query param
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function cwUrl(base: string, path: string, token: string, extra = ''): string {
  return `${base}${path}?api_access_token=${encodeURIComponent(token)}${extra}`;
}

async function findOrCreateContact(
  base: string,
  token: string,
  accountId: string,
  email: string,
  name: string
): Promise<number> {
  const searchRes = await fetch(
    cwUrl(base, `/accounts/${accountId}/contacts/search`, token, `&q=${encodeURIComponent(email)}&include_contacts=true`),
    { headers: JSON_HEADERS }
  );
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const found = searchData?.payload?.find((c: { email: string; id: number }) => c.email === email);
    if (found?.id) return found.id;
  }

  const createRes = await fetch(cwUrl(base, `/accounts/${accountId}/contacts`, token), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, name }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`Chatwoot contato: ${createRes.status}`);
  const contactId = createData?.id ?? createData?.payload?.contact?.id;
  if (!contactId) throw new Error('Contato criado sem ID no payload');
  return contactId;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const internalSecret = (process.env.INTERNAL_API_SECRET ?? '').trim();
  const token          = (process.env.CHATWOOT_API_TOKEN ?? '').trim();
  const accountId      = (process.env.CHATWOOT_ACCOUNT_ID ?? '1').trim();
  const inboxIdGeral   = (process.env.CHATWOOT_INBOX_ID ?? '').trim();
  const inboxIdClientes = (process.env.CHATWOOT_INBOX_ID_CLIENTES ?? '').trim() || undefined;
  const baseUrl        = (process.env.CHATWOOT_BASE_URL ?? '').trim();
  const CHATWOOT_BASE  = `${baseUrl.replace(/\/$/, '')}/api/v1`;

  console.log(`[ticket] chatwoot cfg: token_len=${token.length} token_start="${token.slice(0,6)}" account="${accountId}" inbox="${inboxIdGeral}" base="${CHATWOOT_BASE}"`);

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

  // Verificar subscription para determinar prioridade e inbox
  let conversationPriority = authUser ? 'medium' : 'low';
  let selectedInboxId = inboxIdGeral;
  let isVip = false;

  if (authUser && inboxIdClientes) {
    try {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', authUser.id)
        .gt('ends_at', new Date().toISOString())
        .limit(1);
      if ((subs?.length ?? 0) > 0) {
        selectedInboxId = inboxIdClientes;
        conversationPriority = 'urgent';
        isVip = true;
      }
    } catch { /* silencioso */ }
  }

  // 1. Persistir no Supabase (fonte de verdade) — retorna ticketId imediatamente
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert({
      user_id: authUser?.id ?? null,
      contact_email: contactEmail,
      contact_name: contactName,
      subject: assunto,
      status: 'open',
      priority: isVip ? 'urgent' : (authUser ? 'normal' : 'low'),
    })
    .select('id')
    .single();

  if (ticketErr || !ticket?.id) {
    console.error('[ticket] Erro ao salvar no Supabase:', ticketErr);
    return new Response(
      JSON.stringify({ error: 'Falha ao registrar ticket. Tente novamente.' }),
      { status: 500 }
    );
  }

  const ticketId = ticket.id as string;

  // Salvar mensagem inicial
  supabase.from('support_messages').insert({
    ticket_id: ticketId,
    author_id: authUser?.id ?? null,
    is_admin: false,
    content: mensagem,
  }).then(() => {}).catch(() => {});

  // Retornar ao usuário imediatamente
  const responseBody = JSON.stringify({ success: true, ticketId });

  // --- Operações assíncronas best-effort ---

  // 2. Chatwoot
  if (token && inboxIdGeral && baseUrl) {
    (async () => {
      try {
        const contactId = await findOrCreateContact(
          CHATWOOT_BASE, token, accountId, contactEmail, contactName
        );

        const convRes = await fetch(cwUrl(CHATWOOT_BASE, `/accounts/${accountId}/conversations`, token), {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({
            inbox_id: Number(selectedInboxId || inboxIdGeral),
            contact_id: contactId,
            priority: conversationPriority,
            additional_attributes: { assunto, ticket_id: ticketId },
          }),
        });
        if (!convRes.ok) throw new Error(`Conversa: ${convRes.status}`);
        const convData = await convRes.json();
        const conversationId = convData?.id;
        if (!conversationId) throw new Error('conversation_id ausente');

        // Mensagem do usuário
        await fetch(
          cwUrl(CHATWOOT_BASE, `/accounts/${accountId}/conversations/${conversationId}/messages`, token),
          {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ content: mensagem, message_type: 'incoming', private: false }),
          }
        );

        // Labels
        const labels: string[] = [];
        if (LABEL_MAP[assunto]) labels.push(LABEL_MAP[assunto]);
        if (isVip) labels.push('nm-vip');
        if (labels.length > 0) {
          fetch(
            cwUrl(CHATWOOT_BASE, `/accounts/${accountId}/conversations/${conversationId}/labels`, token),
            {
              method: 'POST',
              headers: JSON_HEADERS,
              body: JSON.stringify({ labels }),
            }
          ).catch(() => {});
        }

        // Salvar chatwoot_conversation_id no ticket
        await supabase
          .from('support_tickets')
          .update({ chatwoot_conversation_id: String(conversationId) })
          .eq('id', ticketId);

        // 4. Claude triage
        if (internalSecret) {
          const appUrl = (process.env.APP_URL ?? 'http://localhost:4321').replace(/\/$/, '');
          fetch(`${appUrl}/api/support/claude-triage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': internalSecret,
            },
            body: JSON.stringify({ ticket_id: ticketId, conversation_id: conversationId }),
          }).catch(() => {});
        }

      } catch (err) {
        console.error('[ticket] Erro async Chatwoot:', err);
      }
    })();
  }

  // 3. Email de confirmação via N8N
  notify('support.ticket_created', {
    email: contactEmail,
    firstName: contactName.split(' ')[0],
    ticketId,
    assunto,
  }).catch(() => {});

  return new Response(responseBody, { status: 200 });
};
