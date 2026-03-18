import type { APIRoute } from 'astro';
import { supabase } from '../../backend/db/supabase';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Autenticação necessária' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { id?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.id) {
    return new Response(JSON.stringify({ error: 'ID ausente' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .schema('nome_magnetico')
    .from('analyses')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id); // garante que só exclui análise própria

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
