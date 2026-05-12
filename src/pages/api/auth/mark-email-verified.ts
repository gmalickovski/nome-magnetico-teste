import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const POST: APIRoute = async ({ locals, request }) => {
  let user = (locals as any).user;

  if (!user) {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }
  }

  if (!user?.id) {
    return json({ error: 'Autenticação necessária' }, 401);
  }

  const verifiedAt = new Date().toISOString();

  const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata ?? {}),
      email_verified_at: verifiedAt,
    },
  });

  if (authError) {
    console.error('[mark-email-verified] auth metadata:', authError.message);
    return json({ error: 'Não foi possível confirmar agora.' }, 500);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email_verified_at: verifiedAt })
    .eq('id', user.id)
    .is('email_verified_at', null);

  if (profileError) {
    console.warn('[mark-email-verified] profile marker skipped:', profileError.message);
  }

  return json({ success: true });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
