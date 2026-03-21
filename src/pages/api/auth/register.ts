import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';
import { supabase } from '../../../backend/db/supabase';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

const APP_ID = 'nome_magnetico';

/**
 * POST /api/auth/register
 *
 * Fluxo em 2 etapas:
 * 1. supabaseAnon.auth.signUp() — única API que aciona o envio do email de
 *    confirmação via SMTP (Amazon SES). admin.createUser() é silenciosa.
 * 2. supabase.auth.admin.updateUserById() — seta app_metadata para isolamento
 *    de app (requer service role, não disponível no cliente anon).
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Dados inválidos';
    return json({ error: msg }, 400);
  }

  const { nome, email, password } = parsed.data;

  // Cliente anon — necessário para signUp() que aciona o email de confirmação.
  // URL: usa SUPABASE_URL (runtime, definida no .env da VPS igual à do backend).
  // Anon key: usa import.meta.env (embutida em build-time pelo Vite, pois é chave pública).
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[register] env vars ausentes:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
    return json({ error: 'Configuração do servidor inválida' }, 500);
  }

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch },
  });

  const appUrl = process.env.APP_URL ?? 'http://localhost:4321';

  let data: Awaited<ReturnType<typeof supabaseAnon.auth.signUp>>['data'] | null = null;
  let error: Awaited<ReturnType<typeof supabaseAnon.auth.signUp>>['error'] | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: `${appUrl}/auth/confirmar-email`,
      },
    });
    data = result.data;
    error = result.error;

    if (!error) break;

    const isTimeout = !error.message || error.message.includes('timeout') ||
      error.message.startsWith('{') || error.status === 504;

    if (!isTimeout) break;

    console.warn(`[register] timeout no signUp (tentativa ${attempt}/3):`, error.message);
    if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt));
  }

  if (error) {
    console.error('[register] erro no signUp:', error.message);
    const isTimeout = !error.message || error.message.includes('timeout') ||
      error.message.startsWith('{') || error.status === 504;
    const msg = error.message?.includes('already been registered')
      ? 'already_registered'
      : isTimeout
        ? 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.'
        : error.message;
    return json({ error: msg }, isTimeout ? 503 : 400);
  }

  // signUp() com email já cadastrado não retorna erro — retorna identities vazio.
  // Também ocorre quando o email existe mas ainda não foi confirmado (reenvia o email).
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    const { data: adminData } = await supabase.auth.admin.getUserById(data.user.id);
    if (adminData?.user?.email_confirmed_at) {
      return json({ error: 'already_registered' }, 400);
    }
    // Pendente de confirmação → signUp() reenviou o email automaticamente
    return json({ success: true }, 200);
  }

  console.log('[register] usuário criado:', {
    id: data.user?.id,
    email: data.user?.email,
    confirmed: data.user?.email_confirmed_at ?? 'pendente — email enviado',
  });

  // Taggear app_metadata via service role para isolamento multi-app.
  if (data.user?.id) {
    const { error: tagError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { app_metadata: { apps: [APP_ID] } }
    );
    if (tagError) {
      console.error('[register] falha ao taggear app_metadata:', tagError.message);
      // Não bloquear o cadastro — a tag pode ser aplicada no próximo login via ensure-profile
    }
  }

  return json({ success: true }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
