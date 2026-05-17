import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Obter token de acesso do cookie
    const tokenCookie = cookies.get('nome-magnetico-auth-access-token');
    
    if (!tokenCookie?.value) {
      return new Response(JSON.stringify({ error: 'Nao autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Obter o usuário atual
    const { data: { user }, error: authError } = await supabase.auth.getUser(tokenCookie.value);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessao invalida ou expirada.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Deletar a conta (Admin API)
    // Usamos o supabase admin (SERVICE ROLE) para forçar a deleção do auth.users.
    // As Foreign Keys com ON DELETE CASCADE farão o expurgo da PII nas outras tabelas.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[Account API] Erro ao deletar conta no Supabase:', deleteError);
      return new Response(JSON.stringify({ error: 'Erro ao processar a exclusao da conta. Tente novamente mais tarde.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Limpar cookies de sessão local
    cookies.delete('nome-magnetico-auth-access-token', { path: '/' });
    cookies.delete('nome-magnetico-auth-refresh-token', { path: '/' });

    return new Response(JSON.stringify({ success: true, message: 'Conta e dados excluidos com sucesso.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Account API] Erro critico:', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
