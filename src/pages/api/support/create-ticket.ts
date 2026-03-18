import type { APIRoute } from 'astro';
import { z } from 'zod';
import { notify } from '../../../backend/notifications/notify';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  assunto: z.string().min(3, 'Assunto obrigatório'),
  mensagem: z.string().min(10, 'Mensagem muito curta'),
  tipo_dispositivo: z.string().optional(),
  versao_app: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Dados inválidos', details: result.error.flatten().fieldErrors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { nome, email, assunto, mensagem, tipo_dispositivo, versao_app } = result.data;
  const user_id = (locals as any).user?.id ?? null;

  // Fire and forget — não bloquear o usuário por falha do webhook
  notify('support.ticket_created', {
    nome,
    email,
    assunto,
    mensagem,
    ...(tipo_dispositivo ? { tipo_dispositivo } : {}),
    ...(versao_app ? { versao_app } : {}),
    user_id,
  }).catch(err => console.error('[support] Falha ao notificar:', err));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
