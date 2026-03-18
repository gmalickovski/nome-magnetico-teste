import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * POST /api/auth/forgot-password
 *
 * Gera link de recuperação via admin API (sem enviar email pelo Supabase),
 * depois dispara notify() para que o n8n envie o email com template brandado.
 * Retorna sempre 200 para não revelar se o email existe.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: true }, 200);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: true }, 200);
  }

  const { email } = parsed.data;
  const appUrl = import.meta.env.APP_URL ?? 'http://localhost:4321';

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${appUrl}/auth/nova-senha` },
    });

    if (!error && data?.properties?.action_link) {
      notify('user.password_reset', {
        email,
        resetUrl: data.properties.action_link,
      }).catch(() => {});
    }
  } catch {
    // Silenciar — não revelar erros ao cliente
  }

  return json({ ok: true }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
