import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../../backend/db/supabase';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, 400);
  }

  const email = parsed.data.email.trim().toLowerCase();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[check-email] falha ao consultar perfil:', error.message);
    return json({ error: 'Erro ao validar e-mail.' }, 500);
  }

  return json({ exists: !!data }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
