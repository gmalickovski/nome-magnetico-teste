import type { APIRoute } from 'astro';
import { z } from 'zod';

const schema = z.object({
  assunto: z.string().min(1),
  mensagem: z.string().min(10),
  nome: z.string().optional(),
  email: z.string().email().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Dados inválidos.' }), { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_SUPORTE_FORMS;
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'Serviço indisponível.' }), { status: 503 });
  }

  const user = locals.user;
  const payload: Record<string, unknown> = {
    assunto: parsed.data.assunto,
    mensagem: parsed.data.mensagem,
    origem: user ? 'app' : 'publico',
    timestamp: new Date().toISOString(),
  };

  if (user) {
    payload.email = user.email;
    payload.user_id = user.id;
  } else {
    payload.nome = parsed.data.nome ?? '';
    payload.email = parsed.data.email ?? '';
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('[support/contact] n8n webhook retornou', res.status);
      return new Response(JSON.stringify({ error: 'Erro ao enviar mensagem.' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[support/contact] Falha ao chamar webhook:', err);
    return new Response(JSON.stringify({ error: 'Erro de conexão.' }), { status: 500 });
  }
};
