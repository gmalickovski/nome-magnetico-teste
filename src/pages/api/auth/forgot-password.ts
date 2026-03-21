import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * POST /api/auth/forgot-password
 *
 * Envia email de recuperação de senha via Supabase/SES nativo.
 * Mesmo padrão do register.ts: anon client dispara o envio automático.
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

  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.APP_URL ?? 'http://localhost:4321';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[forgot-password] env vars ausentes');
    return json({ ok: true }, 200);
  }

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch },
  });

  try {
    await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/nova-senha`,
    });
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
