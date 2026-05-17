import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Obter token de acesso
    const tokenCookie = cookies.get('nome-magnetico-auth-access-token');
    
    if (!tokenCookie?.value) {
      return new Response(JSON.stringify({ error: 'Nao autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(tokenCookie.value);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessao invalida ou expirada.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Coletar dados de várias tabelas
    // - profiles
    // - analyses
    // - subscriptions
    
    const [profileRes, analysesRes, subscriptionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    // 4. Montar o payload final de exportação
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profileRes.data || null,
      analyses: analysesRes.data || [],
      subscriptions: subscriptionsRes.data || [],
    };

    // 5. Retornar como arquivo JSON (download)
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dados-nome-magnetico-${user.id}.json"`,
      },
    });

  } catch (error: any) {
    console.error('[Export API] Erro critico ao exportar dados:', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
