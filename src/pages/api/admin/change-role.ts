import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  // Verificar se quem chama é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return new Response(JSON.stringify({ error: 'Faltam parâmetros' }), { status: 400 });
    }

    if (!['admin', 'user'].includes(newRole)) {
      return new Response(JSON.stringify({ error: 'Role inválida' }), { status: 400 });
    }

    // Não permitir remover o próprio admin se for o único, mas como é simples, vamos só atualizar
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message: 'Role atualizada com sucesso.' }), { status: 200 });
  } catch (error: any) {
    console.error('Erro ao atualizar role:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno server' }), { status: 500 });
  }
};
