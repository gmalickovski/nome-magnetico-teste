import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../backend/db/supabase';
import { z } from 'zod';
import { isDisposableEmail } from '../../../backend/security/disposableEmail';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  produto: z.string().optional(),
  redirect: z.string().optional(),
  birth_name: z.string().min(2).max(150).optional(),
  birth_date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).optional(),
});

const APP_ID = 'nome_magnetico';

/**
 * POST /api/auth/register
 *
 * Cria a conta sem disparar email no primeiro acesso. O Auth fica confirmado
 * para liberar login imediato; a validação comercial do email fica em
 * profiles.email_verified_at, preenchida pelo banner ou por pagamento aprovado.
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

  const { nome, email, password, birth_name, birth_date } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  if (isDisposableEmail(normalizedEmail)) {
    return json({
      error: 'Use um email permanente para criar sua conta e receber seu acesso.',
    }, 400);
  }

  // Pré-check: email já existe? (service role bypassa RLS — pega confirmados, pendentes e admins)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return json({ error: 'already_registered' }, 400);
  }

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
  });

  const { data: createdData, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { nome },
    app_metadata: { apps: [APP_ID] },
  });

  if (createError) {
    console.error('[register] erro ao criar usuario:', createError.message);
    const msg = createError.message?.includes('already been registered') ||
      createError.message?.includes('already registered') ||
      createError.message?.includes('User already registered')
      ? 'already_registered'
      : createError.message;
    return json({ error: msg }, 400);
  }

  const createdUser = createdData?.user;
  if (!createdUser) {
    return json({ error: 'Não foi possível criar a conta. Tente novamente.' }, 500);
  }

  console.log('[register] usuário criado:', {
    id: createdUser.id,
    email: createdUser.email,
    confirmed: createdUser.email_confirmed_at ?? 'liberado',
  });

  const { error: profileError } = await supabase.rpc('ensure_profile', {
    p_user_id: createdUser.id,
    p_email: normalizedEmail,
    p_nome: nome,
  });
  if (profileError) {
    console.error('[register] falha ao garantir profile:', profileError.message);
  }

  if (birth_name && birth_date) {
    const parts = birth_date.split('/');
    const birthDateDb = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : birth_date;
    const { error: birthProfileError } = await supabase
      .from('profiles')
      .update({
        birth_name: birth_name.trim(),
        birth_date: birthDateDb,
        updated_at: new Date().toISOString(),
      })
      .eq('id', createdUser.id);

    if (birthProfileError) {
      console.error('[register] falha ao salvar dados de nascimento:', birthProfileError.message);
    }
  }

  const signIn = await supabaseAnon.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (signIn.error) {
    console.error('[register] falha no login imediato:', signIn.error.message);
  }
  const session = signIn.data.session ?? null;

  return json({
    success: true,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
        }
      : null,
  }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
