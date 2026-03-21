import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
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
  // O cliente service role (admin) não dispara emails.
  const supabaseAnon = createClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const appUrl = process.env.APP_URL ?? 'http://localhost:4321';

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      data: { nome },
      emailRedirectTo: `${appUrl}/auth/confirmar-email`,
    },
  });

  if (error) {
    console.error('[register] erro no signUp:', error.message);
    const msg = error.message.includes('already been registered')
      ? 'already_registered'
      : error.message;
    return json({ error: msg }, 400);
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
