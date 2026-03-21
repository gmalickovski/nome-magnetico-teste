import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

const ConfigItemSchema = z.object({
  task: z.enum(['analysis', 'suggestions', 'guide']),
  provider: z.enum(['groq', 'openai', 'claude']),
  model: z.string().min(1).max(100),
});

const BodySchema = z.object({
  configs: z.array(ConfigItemSchema).min(1).max(10),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Autenticação necessária' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = new Date().toISOString();

  const upserts = parsed.data.configs.map(cfg => ({
    task: cfg.task,
    provider: cfg.provider,
    model: cfg.model,
    updated_by: user.id,
    updated_at: now,
  }));

  const { error } = await supabase
    
    .from('ai_config')
    .upsert(upserts, { onConflict: 'task' });

  if (error) {
    console.error('[api/admin/ai-config] Upsert error:', error);
    return new Response(JSON.stringify({ error: 'Erro ao salvar configuração' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
