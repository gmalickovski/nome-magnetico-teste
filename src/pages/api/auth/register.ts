import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';
import { notify } from '../../../backend/notifications/notify';
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
 * Signup server-side com app tagging imediato.
 * Usa admin API para criar o usuário e marcar o app_metadata.apps
 * antes de qualquer confirmação de email — garantindo isolamento
 * de autenticação entre apps que compartilham a mesma instância Supabase.
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

  // Criar usuário via admin API (envia email de confirmação automaticamente)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // false = envia email de confirmação
    user_metadata: { nome },
  });

  if (error) {
    // Normalizar mensagens de erro do GoTrue
    const msg = error.message.includes('already been registered')
      ? 'already_registered'
      : error.message;
    return json({ error: msg }, 400);
  }

  // Taggear usuário para este app — usando admin API (jamais exposto ao cliente)
  const { error: tagError } = await supabase.auth.admin.updateUserById(
    data.user.id,
    { app_metadata: { apps: [APP_ID] } }
  );

  if (tagError) {
    console.error('[register] falha ao taggear usuário:', tagError.message);
    // Não bloquear o signup — a tag pode ser aplicada no próximo login via ensure-profile
  }

  notify('user.welcome', { email, firstName: nome }).catch(() => {});

  return json({ success: true }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
