import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../backend/db/supabase';

const schema = z.object({
  trialCode: z.string().min(1),
  trialDays: z.number().int().min(0),
  productType: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Parâmetros inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { trialCode, trialDays, productType } = parsed.data;

  // Verificar se o código já foi resgatado por este usuário
  const { data: existing } = await supabase
    .from('trial_redemptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('trial_code', trialCode)
    .single();

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Código já resgatado por este usuário' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // trialDays === 0 → sem expiração
  const endsAt =
    trialDays === 0
      ? null
      : new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

  // 1. Marcar usuário como teste no profile
  await supabase
    .from('profiles')
    .update({ is_test: true, test_ends_at: endsAt })
    .eq('id', user.id);

  // 2. Criar assinatura(s) trial
  const products =
    productType && productType !== 'all'
      ? [productType]
      : ['nome_social', 'nome_bebe', 'nome_empresa'];

  const subscriptionEndsAt =
    endsAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  for (const pt of products) {
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      product_type: pt,
      starts_at: new Date().toISOString(),
      ends_at: subscriptionEndsAt,
      stripe_session_id: `trial_${trialCode}`,
      amount_paid: 0,
    });
  }

  // 3. Registrar o resgate para rastreabilidade
  await supabase.from('trial_redemptions').insert({
    user_id: user.id,
    trial_code: trialCode,
    trial_days: trialDays,
    product_type: productType || 'all',
    source: 'link',
  });

  return new Response(JSON.stringify({ success: true, endsAt }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
