import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

// URL base é lida em runtime dentro do handler — evita módulo-level avaliação antes do env estar pronto

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

function chatwootHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'api_access_token': token,
  };
}

async function findOrCreateContact(
  chatwootBase: string,
  token: string,
  accountId: string,
  email: string,
  name: string
): Promise<number> {
  // 1. Buscar contato existente pelo email
  const searchRes = await fetch(
    `${chatwootBase}/accounts/${accountId}/contacts/search?q=${encodeURIComponent(email)}&include_contacts=true`,
    { headers: chatwootHeaders(token) }
  );
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const found = searchData?.payload?.find((c: any) => c.email === email);
    if (found?.id) return found.id;
  }

  // 2. Criar novo contato
  const createRes = await fetch(
    `${chatwootBase}/accounts/${accountId}/contacts`,
    {
      method: 'POST',
      headers: chatwootHeaders(token),
      body: JSON.stringify({ email, name }),
    }
  );
  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('[chatwoot] Erro na API ao criar contato:', createRes.status, JSON.stringify(createData));
    throw new Error(`Chatwoot retornou ${createRes.status}: ${JSON.stringify(createData)}`);
  }
  const contactId = createData?.id ?? createData?.payload?.contact?.id;
  if (!contactId) {
    console.error('[chatwoot] Contato criado mas ID ausente no payload:', JSON.stringify(createData));
    throw new Error('Falha ao criar contato no Chatwoot');
  }
  return contactId;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const token           = (process.env.CHATWOOT_API_TOKEN ?? '').trim();
  const accountId       = (process.env.CHATWOOT_ACCOUNT_ID ?? '1').trim();
  const inboxIdGeral    = (process.env.CHATWOOT_INBOX_ID ?? '').trim();
  const inboxIdClientes = (process.env.CHATWOOT_INBOX_ID_CLIENTES ?? '').trim() || undefined;
  const baseUrl         = (process.env.CHATWOOT_BASE_URL ?? '').trim();
  const CHATWOOT_BASE = `${baseUrl.replace(/\/$/, '')}/api/v1`;

  console.log(`[chatwoot] token len=${token.length} starts="${token.slice(0,4)}" base="${CHATWOOT_BASE}" inbox="${inboxIdGeral}"`);

  if (!token || !inboxIdGeral || !baseUrl) {
    console.error('[chatwoot] Variáveis de ambiente não configuradas');
    return new Response(
      JSON.stringify({ error: 'Suporte temporariamente indisponível.' }),
      { status: 503 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 });
  }

  const { assunto, mensagem } = body;

  // Resolver nome e email: usuário autenticado > dados do body
  let contactName = body.nome ?? 'Visitante';
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
      if (profile?.nome) contactName = profile.nome;
      else contactName = contactEmail.split('@')[0];
    } catch { /* silencioso */ }
  }

  if (!contactEmail) {
    return new Response(
      JSON.stringify({ error: 'Email é obrigatório.' }),
      { status: 400 }
    );
  }

  // Determinar inbox e prioridade: clientes com plano ativo têm prioridade
  let selectedInboxId = inboxIdGeral;
  let conversationPriority = authUser ? 'medium' : 'low';
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
      }
    } catch { /* silencioso */ }
  }

  try {
    // 1. Buscar ou criar contato
    const contactId = await findOrCreateContact(CHATWOOT_BASE, token, accountId, contactEmail, contactName);

    // 2. Criar conversa
    const convRes = await fetch(
      `${CHATWOOT_BASE}/accounts/${accountId}/conversations`,
      {
        method: 'POST',
        headers: chatwootHeaders(token),
        body: JSON.stringify({
          inbox_id: Number(selectedInboxId),
          contact_id: contactId,
          priority: conversationPriority,
          additional_attributes: { assunto },
        }),
      }
    );
    if (!convRes.ok) throw new Error(`Conversa: ${convRes.status}`);
    const convData = await convRes.json();
    const conversationId = convData?.id;
    if (!conversationId) throw new Error('conversation_id ausente');

    // 3. Criar mensagem do usuário
    await fetch(
      `${CHATWOOT_BASE}/accounts/${accountId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: chatwootHeaders(token),
        body: JSON.stringify({
          content: mensagem,
          message_type: 'incoming',
          private: false,
        }),
      }
    );

    // 4. Aplicar labels (assunto → slug e nm-vip) — falha silenciosa
    const tagsToApply: string[] = [];
    if (LABEL_MAP[assunto]) tagsToApply.push(LABEL_MAP[assunto]);
    
    // Se a inbox selecionada foi a de clientes (tem assinatura ativa), anexa nm-vip
    if (selectedInboxId === inboxIdClientes) {
      tagsToApply.push('nm-vip');
    }

    if (tagsToApply.length > 0) {
      fetch(
        `${CHATWOOT_BASE}/accounts/${accountId}/conversations/${conversationId}/labels`,
        {
          method: 'POST',
          headers: chatwootHeaders(token),
          body: JSON.stringify({ labels: tagsToApply }),
        }
      ).catch(() => {});
    }

    return new Response(JSON.stringify({ success: true, conversationId }), { status: 200 });
  } catch (err) {
    console.error('[chatwoot] Erro ao criar conversa:', err);
    return new Response(
      JSON.stringify({ error: 'Falha ao abrir conversa. Tente novamente.' }),
      { status: 500 }
    );
  }
};
