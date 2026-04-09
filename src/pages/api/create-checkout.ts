import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createCheckoutSession, stripe, type ProductType } from '../../backend/payments/stripe';
import { supabase } from '../../backend/db/supabase';
import { getHqPricesAndPromo } from '../../backend/payments/prices';

const schema = z.object({
  product_type: z.enum(['nome_social', 'nome_bebe', 'nome_empresa']),
  couponCode: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals, url }) => {
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

  const { product_type, couponCode } = parsed.data;
  const baseUrl = process.env.APP_URL || url.origin;

  // Verificar se é admin ou usuário teste → bypass do Stripe
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_test, test_ends_at')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isTest =
    profile?.is_test === true &&
    (profile.test_ends_at === null ||
      new Date(profile.test_ends_at) > new Date());

  if (isAdmin || isTest) {
    const endsAt = new Date(Date.now() + 30 * 86400000).toISOString();
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      product_type,
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      stripe_session_id: `bypass_${isAdmin ? 'admin' : 'test'}_${Date.now()}`,
      amount_paid: 0,
    });

    return new Response(
      JSON.stringify({ bypass: true, redirectUrl: '/app?acesso=liberado' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Determinar código de cupom: manual (do usuário) ou automático (promoção ativa no HQ)
    let effectiveCouponCode = couponCode;
    if (!effectiveCouponCode) {
      try {
        const { promotion } = await getHqPricesAndPromo();
        if (promotion?.stripePromoCode) {
          const appliesToThis = !promotion.productType || promotion.productType === product_type;
          if (appliesToThis) effectiveCouponCode = promotion.stripePromoCode;
        }
      } catch {
        // HQ indisponível — prosseguir sem desconto automático
      }
    }

    // Resolver o promotion_code ID do Stripe
    let discounts: { promotion_code: string }[] | undefined;
    if (effectiveCouponCode) {
      const promos = await stripe.promotionCodes.list({
        code: effectiveCouponCode,
        active: true,
        limit: 1,
      });
      if (promos.data.length > 0) {
        discounts = [{ promotion_code: promos.data[0].id }];
      }
    }

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email ?? '',
      productType: product_type as ProductType,
      successUrl: `${baseUrl}/app?checkout=success`,
      cancelUrl: `${baseUrl}/comprar?checkout=cancel`,
      discounts,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[create-checkout] Erro:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao criar sessão de pagamento' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
