import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY é obrigatório');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

export type ProductType = 'nome_social' | 'nome_bebe' | 'nome_empresa';

const PRICE_IDS: Record<ProductType, string> = {
  nome_social: process.env.STRIPE_PRICE_NOME_SOCIAL ?? '',
  nome_bebe: process.env.STRIPE_PRICE_NOME_BEBE ?? '',
  nome_empresa: process.env.STRIPE_PRICE_NOME_EMPRESA ?? '',
};

const PRODUCT_NAMES: Record<ProductType, string> = {
  nome_social: 'Nome Social',
  nome_bebe: 'Nome de Bebê',
  nome_empresa: 'Nome Empresarial',
};

const PRODUCT_CUSTOM_TEXT: Record<ProductType, { submit: { message: string } }> = {
  nome_social: { submit: { message: 'Você receberá acesso por 30 dias após o pagamento.' } },
  nome_bebe: { submit: { message: 'Acesso por 30 dias. Analise quantos nomes candidatos quiser.' } },
  nome_empresa: { submit: { message: 'Acesso por 30 dias. Avalie nomes de empresa sem limite.' } },
};

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  productType: ProductType;
  successUrl: string;
  cancelUrl: string;
  discounts?: { promotion_code: string }[];
}

/**
 * Cria uma sessão de checkout no Stripe.
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const priceId = PRICE_IDS[params.productType];

  if (!priceId) {
    throw new Error(`Price ID não configurado para o produto: ${params.productType}`);
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: params.userEmail,
    metadata: {
      user_id: params.userId,
      product_type: params.productType,
      access_duration_days: '30',
    },
    custom_text: PRODUCT_CUSTOM_TEXT[params.productType],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    locale: 'pt-BR',
    ...(params.discounts ? { discounts: params.discounts } : {}),
    payment_intent_data: {
      metadata: {
        user_id: params.userId,
        product_type: params.productType,
      },
    },
  });
}

/**
 * Verifica e constrói o evento do webhook Stripe.
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET é obrigatório');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { PRODUCT_NAMES };
