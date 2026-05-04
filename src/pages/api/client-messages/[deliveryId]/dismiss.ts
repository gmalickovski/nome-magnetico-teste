import type { APIRoute } from 'astro';
import { supabase } from '../../../../backend/db/supabase';

export const POST: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  const deliveryId = params.deliveryId;

  if (!user) {
    return new Response(JSON.stringify({ message: 'Nao autenticado' }), { status: 401 });
  }

  if (!deliveryId) {
    return new Response(JSON.stringify({ message: 'deliveryId e obrigatorio' }), { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('client_message_deliveries')
    .update({ popup_status: 'dismissed', dismissed_at: now, seen_at: now })
    .eq('id', deliveryId)
    .eq('user_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
