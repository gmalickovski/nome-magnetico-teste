import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

const bodySchema = z.object({
  ticket_id: z.string().uuid(),
  message:   z.string().min(1).max(2000),
  history:   z.array(z.object({
    role:    z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

const SYSTEM_PROMPT = `Você é um assistente especializado de suporte do Nome Magnético, auxiliando o agente humano (admin) a responder tickets.

Você TEM ACESSO ao contexto completo do cliente incluído abaixo. Use essas informações para:
- Sugerir respostas específicas e personalizadas para o cliente
- Identificar a causa raiz do problema
- Cruzar informações do histórico do cliente com a dúvida atual
- Buscar nas FAQs respostas relevantes

REGRAS:
- Responda sempre em Português BR
- Seja direto e útil para o agente
- Quando sugerir uma resposta para enviar ao cliente, formate assim:
  📝 **RESPOSTA SUGERIDA:**
  ---
  [texto da resposta]
  ---
- Quando NÃO estiver sugerindo uma resposta direta, apenas analise/explique para o agente
- Nunca invente informações — use apenas o contexto fornecido
- Se não tiver informação suficiente, diga claramente`;

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

  const { ticket_id, message, history } = body;

  // ── Carregar contexto completo do ticket ──────────────────────────────────

  const [ticketRes, messagesRes, faqRes] = await Promise.all([
    // Ticket + dados do contato
    supabase
      .from('support_tickets')
      .select('id, subject, status, priority, contact_name, contact_email, contact_user_id:user_id, created_at, chatwoot_conversation_id')
      .eq('id', ticket_id)
      .single(),

    // Últimas 10 mensagens
    supabase
      .from('support_messages')
      .select('content, is_admin, created_at')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true })
      .limit(10),

    // FAQs relevantes para contexto
    supabase
      .from('faq_items')
      .select('question, answer')
      .eq('is_active', true)
      .limit(10),
  ]);

  const ticket = ticketRes.data;
  if (!ticket) {
    return new Response(JSON.stringify({ error: 'Ticket não encontrado.' }), { status: 404 });
  }

  // Perfil e subscriptions do usuário (se autenticado)
  let customerContext = '';
  if (ticket.contact_user_id) {
    const [profileRes, subsRes, analysesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('nome, role')
        .eq('id', ticket.contact_user_id as string)
        .single(),

      supabase
        .from('subscriptions')
        .select('starts_at, ends_at, is_active')
        .eq('user_id', ticket.contact_user_id as string)
        .order('created_at', { ascending: false })
        .limit(3),

      supabase
        .from('analyses')
        .select('status, created_at, product_type:type')
        .eq('user_id', ticket.contact_user_id as string)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const sub = subsRes.data?.[0];
    const analyses = analysesRes.data ?? [];

    customerContext = `
DADOS DO CLIENTE (usuário autenticado):
  Nome no sistema: ${profileRes.data?.nome ?? 'N/A'}
  ${sub ? `Plano ativo: ${sub.is_active ? 'SIM' : 'NÃO'} | Expira: ${sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('pt-BR') : 'N/A'}` : 'Sem plano cadastrado'}
  Análises geradas: ${analyses.length > 0 ? analyses.map(a => `${a.product_type ?? 'nome_social'} (${a.status}) em ${new Date(a.created_at).toLocaleDateString('pt-BR')}`).join(', ') : 'Nenhuma'}`;
  } else {
    customerContext = `DADOS DO CLIENTE: Usuário não autenticado (contato via formulário público)`;
  }

  // ── Montar contexto para o sistema ───────────────────────────────────────

  const threadText = (messagesRes.data ?? [])
    .map(m => `[${m.is_admin ? 'ADMIN' : 'CLIENTE'}] ${m.content}`)
    .join('\n\n');

  const faqText = (faqRes.data ?? [])
    .slice(0, 5)
    .map(f => `P: ${f.question}\nR: ${f.answer}`)
    .join('\n---\n');

  const contextBlock = `
=== CONTEXTO DO TICKET ===
ID: ${ticket.id}
Assunto: ${ticket.subject}
Status: ${ticket.status}
Prioridade: ${ticket.priority}
Contato: ${ticket.contact_name} <${ticket.contact_email}>
Aberto em: ${new Date(ticket.created_at).toLocaleString('pt-BR')}

${customerContext}

=== HISTÓRICO DA CONVERSA ===
${threadText || '(sem mensagens ainda)'}

=== FAQs RELEVANTES ===
${faqText || '(sem FAQs disponíveis)'}
===========================`;

  // ── Chamar Claude ─────────────────────────────────────────────────────────

  const anthropicKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!anthropicKey || anthropicKey.includes('PREENCHER')) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada.' }), { status: 503 });
  }

  const messages = [
    // Injetar contexto como primeira mensagem do usuário
    { role: 'user' as const, content: `${contextBlock}\n\n---\n${message}` },
    // Histórico da conversa (sem o contexto — para não repetir)
    ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
  ];

  // Se há histórico, reformatar: contexto vai no system prompt, histórico fica limpo
  const cleanMessages = history.length > 0
    ? [
        ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user' as const, content: message },
      ]
    : messages;

  const systemWithContext = history.length > 0
    ? `${SYSTEM_PROMPT}\n\n${contextBlock}`
    : SYSTEM_PROMPT;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system:     systemWithContext,
      messages:   cleanMessages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[ai-assistant] Claude error:', res.status, errText);
    return new Response(JSON.stringify({ error: 'Assistente IA indisponível.' }), { status: 503 });
  }

  const data = await res.json();
  const reply = data?.content?.[0]?.text ?? '';

  // Detectar se Claude gerou uma resposta para enviar ao cliente
  const suggestedMatch = reply.match(/📝 \*\*RESPOSTA SUGERIDA:\*\*\s*---\s*([\s\S]*?)\s*---/);
  const suggestedTicketReply = suggestedMatch ? suggestedMatch[1].trim() : undefined;

  return new Response(
    JSON.stringify({ reply, suggestedTicketReply }),
    { status: 200 },
  );
};
