import type { APIRoute } from 'astro';
import { supabase } from '../../backend/db/supabase';
import { getProfile } from '../../backend/db/users';

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

  // Busca a análise antes de deletar para checar permissão
  const { data: analysis } = await supabase
    .from('analyses')
    .select('id, user_id, product_type, is_free')
    .eq('id', body.id)
    .eq('user_id', user.id)
    .single();

  if (!analysis) {
    return new Response(JSON.stringify({ error: 'Análise não encontrada' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Análise gratuita: apenas admins podem excluir
  const isGratuita = analysis.product_type === 'analise_gratuita' || analysis.is_free === true;
  if (isGratuita) {
    const profile = await getProfile(user.id);
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Análise gratuita não pode ser excluída.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
