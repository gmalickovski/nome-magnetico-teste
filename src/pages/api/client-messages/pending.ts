import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ message: 'Nao autenticado' }), { status: 401 });
  }

  const { data: deliveries, error } = await supabase
    .from('client_message_deliveries')
    .select('id, message_id, seen_at, created_at, rendered_title, rendered_body_markdown')
    .eq('user_id', user.id)
    .contains('channels', ['popup'])
    .is('dismissed_at', null)
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }

  for (const delivery of deliveries ?? []) {
    const { data: message } = await supabase
      .from('client_messages')
      .select('id, public_title, body_markdown, status, sent_at')
      .eq('id', delivery.message_id)
      .eq('status', 'sent')
      .single();

    if (!message) continue;

    if (!delivery.seen_at) {
      await supabase
        .from('client_message_deliveries')
        .update({ popup_status: 'seen', seen_at: new Date().toISOString() })
        .eq('id', delivery.id);
    }

    return new Response(
      JSON.stringify({
        deliveryId: delivery.id,
        messageId: message.id,
        title: delivery.rendered_title || message.public_title,
        bodyMarkdown: delivery.rendered_body_markdown || message.body_markdown,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ message: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
