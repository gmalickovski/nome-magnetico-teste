import type { APIRoute } from 'astro';
import { supabase } from '../../backend/db/supabase';

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Autenticação necessária' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const chargeId = url.searchParams.get('chargeId');
  if (!chargeId) {
    return new Response(
      JSON.stringify({ error: 'chargeId obrigatório' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('stripe_session_id', `asaas_${chargeId}`)
    .limit(1);

  const paid = (data?.length ?? 0) > 0;

  return new Response(
    JSON.stringify({ paid }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
