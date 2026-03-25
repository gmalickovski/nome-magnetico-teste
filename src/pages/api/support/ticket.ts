import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { assunto, mensagem } = body;

    if (!assunto || !mensagem) {
      return new Response(JSON.stringify({ error: 'Campos incorretos ou em falta' }), { status: 400 });
    }

    // Buscar profile com nome real
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Buscar planos ativos
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('product_type')
      .eq('user_id', user.id)
      .gt('ends_at', new Date().toISOString());

    const activeProducts = [...new Set((subs || []).map(s => {
      switch (s.product_type) {
        case 'nome_social': return 'Nome Social';
        case 'nome_bebe': return 'Nome de Bebê';
        case 'nome_empresa': return 'Nome de Empresa';
        default: return s.product_type;
      }
    }))];

    // Payload que o N8N espera
    const webhookPayload = {
      nome: profile?.full_name ?? user.user_metadata?.full_name ?? 'Usuário',
      email: user.email,
      assunto: assunto,
      mensagem: mensagem,
      produtosAtivos: activeProducts.length > 0 ? activeProducts : null
    };

    const webhookUrl = process.env.N8N_WEBHOOK_SUPORTE;
    if (!webhookUrl) {
      console.error('[SUporte] Webhook URL não configurada');
      // Resolve com 500 caso o dono não tenha configurado no admin
      return new Response(JSON.stringify({ error: 'Erro de configuração interna do webhook.' }), { status: 500 });
    }

    // Faz o POST pro N8N
    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!n8nRes.ok) {
      throw new Error(`N8N retornou ${n8nRes.status}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar ticket de suporte para webhook:', error);
    return new Response(JSON.stringify({ error: 'Falha ao comunicar com o servidor de suporte.' }), { status: 500 });
  }
};
