import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

const bodySchema = z.object({
  ticket_id: z.string().uuid(),
  conversation_id: z.number().or(z.string()),
});

const SYSTEM_PROMPT = `Você é um assistente de suporte especializado do Nome Magnético, plataforma de numerologia cabalística.
Sua função é analisar tickets de suporte e produzir um rascunho de resposta para o agente humano revisar.

Responda SEMPRE em JSON válido (sem markdown) com exatamente estes campos:
{
  "tipo": string (Bug | Dúvida | Sugestão | Financeiro | Urgente | Outro),
  "urgencia": number (1-5, sendo 5 o mais urgente),
  "resposta": string (rascunho de resposta em PT-BR, tom cordial e profissional),
  "auto_resolve": boolean (true APENAS se: dúvida simples com resposta definitiva, sem ação humana necessária)
}

Contexto do produto:
- Nome Magnético analisa o nome de nascimento pela numerologia cabalística
- Detecta bloqueios energéticos (sequências repetidas nos triângulos numerológicos)
- Sugere variações do nome mais harmoniosas
- Produtos: Nome Social, Nome para Bebê, Nome Empresarial
- Pagamento único por ciclo de 30 dias (não é assinatura recorrente)
- Suporte técnico e de produto apenas — sem aconselhamento espiritual pessoal`;

// Nginx remove headers com underscore — token passado como query param
const JSON_HEADERS = { 'Content-Type': 'application/json' };
function cwUrl(base: string, path: string, token: string): string {
  return `${base}${path}?api_access_token=${encodeURIComponent(token)}`;
}

export const POST: APIRoute = async ({ request }) => {
  // Validar segredo interno
  const internalSecret = (process.env.INTERNAL_API_SECRET ?? '').trim();
  const reqSecret = request.headers.get('X-Internal-Secret') ?? '';
  if (!internalSecret || reqSecret !== internalSecret) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 });
  }

  const { ticket_id, conversation_id } = body;

  // Ler ticket + mensagem do Supabase
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('subject, contact_name, contact_email, priority, user_id')
    .eq('id', ticket_id)
    .single();

  if (!ticket) {
    return new Response(JSON.stringify({ error: 'Ticket não encontrado.' }), { status: 404 });
  }

  const { data: messages } = await supabase
    .from('support_messages')
    .select('content')
    .eq('ticket_id', ticket_id)
    .order('created_at', { ascending: true })
    .limit(5);

  const mensagem = messages?.map(m => m.content).join('\n---\n') ?? '';

  // Verificar plano ativo do usuário
  let temPlano = false;
  if (ticket.user_id) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', ticket.user_id)
      .gt('ends_at', new Date().toISOString())
      .limit(1);
    temPlano = (subs?.length ?? 0) > 0;
  }

  // Verificar qual provider de IA usar
  const anthropicKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  const groqKey = (process.env.GROQ_API_KEY ?? '').trim();
  const appEnv = (process.env.APP_ENV ?? 'development').trim();

  const userContent = `Assunto: ${ticket.subject}
Nome do usuário: ${ticket.contact_name ?? 'Desconhecido'}
Tem plano ativo: ${temPlano ? 'Sim' : 'Não'}
Prioridade: ${ticket.priority ?? 'normal'}

Mensagem:
${mensagem}`;

  let triageResult: { tipo: string; urgencia: number; resposta: string; auto_resolve: boolean } | null = null;

  // Tentar Claude primeiro em produção, Groq em dev
  if (appEnv === 'production' && anthropicKey && !anthropicKey.includes('PREENCHER')) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userContent }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.content?.[0]?.text ?? '';
        triageResult = JSON.parse(text);
      }
    } catch (err) {
      console.error('[claude-triage] Erro Claude:', err);
    }
  }

  // Fallback: Groq
  if (!triageResult && groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? '';
        triageResult = JSON.parse(text);
      }
    } catch (err) {
      console.error('[claude-triage] Erro Groq:', err);
    }
  }

  if (!triageResult) {
    return new Response(JSON.stringify({ error: 'IA indisponível para triagem.' }), { status: 503 });
  }

  // Postar nota privada no Chatwoot
  const token    = (process.env.CHATWOOT_API_TOKEN ?? '').trim();
  const accountId = (process.env.CHATWOOT_ACCOUNT_ID ?? '1').trim();
  const baseUrl  = (process.env.CHATWOOT_BASE_URL ?? '').trim();

  if (token && baseUrl) {
    const CHATWOOT_BASE = `${baseUrl.replace(/\/$/, '')}/api/v1`;
    const nota = `🤖 Triagem Automática | Tipo: ${triageResult.tipo} | Urgência: ${triageResult.urgencia}/5${triageResult.auto_resolve ? ' | ✅ Auto-resolve sugerido' : ''}

---
**Rascunho de resposta:**

${triageResult.resposta}`;

    fetch(
      cwUrl(CHATWOOT_BASE, `/accounts/${accountId}/conversations/${conversation_id}/messages`, token),
      {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ content: nota, message_type: 'outgoing', private: true }),
      }
    ).catch(() => {});
  }

  // Se auto_resolve, marcar ticket como resolvido
  if (triageResult.auto_resolve) {
    supabase
      .from('support_tickets')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', ticket_id)
      .then(() => {})
      .catch(() => {});
  }

  return new Response(JSON.stringify({ success: true, triage: triageResult }), { status: 200 });
};
