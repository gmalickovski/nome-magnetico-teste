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

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/nova-senha`,
    });
    if (!error) break;
    const isTimeout = !error.message || error.message.includes('timeout') ||
      error.message.startsWith('{') || error.status === 504;
    if (!isTimeout) break;
    console.warn(`[forgot-password] timeout (tentativa ${attempt}/3):`, error.message);
    if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt));
  }

  return json({ ok: true }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
