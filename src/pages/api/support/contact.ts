import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

const schema = z.object({
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  mensagem: z.string().min(10, 'Mensagem deve ter ao menos 10 caracteres'),
  // nome e email: obrigatórios apenas para usuários públicos (validado abaixo)
  nome: z.string().min(2, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }),
      { status: 400 }
    );
  }

  const webhookUrl = process.env.N8N_WEBHOOK_SUPORTE_FORMS;
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'Serviço indisponível.' }), { status: 503 });
  }

  const user = locals.user;

  // Resolver nome, email e user_id conforme a origem
  let nome: string;
  let email: string;
  let user_id: string | null = null;

  if (user) {
    // Usuário logado: buscar nome no perfil server-side (nunca confiar no frontend)
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single();

    nome = profile?.nome ?? '';
    email = user.email ?? '';
    user_id = user.id;
  } else {
    // Usuário público: nome e email são obrigatórios no body
    if (!parsed.data.nome?.trim()) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório.' }), { status: 400 });
    }
    if (!parsed.data.email?.trim()) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório.' }), { status: 400 });
    }

    nome = parsed.data.nome.trim();
    email = parsed.data.email.trim();
  }

  // Payload sempre idêntico em estrutura — n8n usa as mesmas variáveis independente da origem
  const payload = {
    nome,
    email,
    assunto: parsed.data.assunto,
    mensagem: parsed.data.mensagem,
    origem: user ? 'app' : 'publico',
    user_id,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('[support/contact] n8n webhook retornou', res.status);
      return new Response(JSON.stringify({ error: 'Erro ao enviar mensagem.' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[support/contact] Falha ao chamar webhook:', err);
    return new Response(JSON.stringify({ error: 'Erro de conexão.' }), { status: 500 });
  }
};

