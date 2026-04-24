import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../backend/db/supabase';
import { createPixCharge } from '../../backend/payments/asaas';
import type { ProductType } from '../../backend/payments/stripe';

const schema = z.object({
  product_type: z.enum(['nome_social', 'nome_bebe', 'nome_empresa']),
});

const PRICE_MAP_BRL: Record<ProductType, number> = {
  nome_social:   97.00,
  nome_bebe:    127.00,
  nome_empresa:  77.00,
};

const PRODUCT_DESCRIPTIONS: Record<ProductType, string> = {
  nome_social:  'Nome Magnético — Nome Social',
  nome_bebe:    'Nome Magnético — Nome de Bebê',
  nome_empresa: 'Nome Magnético — Nome Empresarial',
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  const accessToken = locals.accessToken;

  if (!user || !accessToken) {
    return new Response(
      JSON.stringify({ error: 'Autenticação necessária' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Produto inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { product_type } = parsed.data;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_test, test_ends_at, nome')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isTest =
    profile?.is_test === true &&
    (profile.test_ends_at === null || new Date(profile.test_ends_at) > new Date());

  if (isAdmin || isTest) {
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      product_type,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      stripe_session_id: `bypass_${isAdmin ? 'admin' : 'test'}_${Date.now()}`,
      amount_paid: 0,
    });
    return new Response(
      JSON.stringify({ bypass: true, redirectUrl: '/app?acesso=liberado' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const userName = profile?.nome || user.email?.split('@')[0] || 'Cliente';
    const userEmail = user.email ?? '';

    const result = await createPixCharge({
      userId: user.id,
      productType: product_type,
      userEmail,
      userName,
      value: PRICE_MAP_BRL[product_type as ProductType],
      description: PRODUCT_DESCRIPTIONS[product_type as ProductType],
    });

    return new Response(
      JSON.stringify({
        chargeId:      result.chargeId,
        pixCopiaECola: result.pixCopiaECola,
        qrCodeImage:   result.qrCodeImage,
        expiresAt:     result.expirationDate,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[create-pix] Erro:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao gerar cobrança PIX. Tente novamente.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
