import type { APIRoute } from 'astro';
import { verifyWebhookToken } from '../../backend/payments/asaas';
import { createSubscription } from '../../backend/db/subscriptions';
import { getProfile } from '../../backend/db/users';
import { notify } from '../../backend/notifications/notify';
import type { ProductType } from '../../backend/payments/stripe';

const PRODUCT_NAMES: Record<string, string> = {
  nome_social:  'Nome Social',
  nome_bebe:    'Nome de Bebê',
  nome_empresa: 'Nome Empresarial',
};

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('asaas-access-token') ?? '';
  if (!verifyWebhookToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { event, payment } = payload as {
    event: string;
    payment?: {
      id: string;
      externalReference: string;
      value: number;
    };
  };

  // Processar apenas pagamentos confirmados
  if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
    return new Response('OK', { status: 200 });
  }

  if (!payment?.externalReference) {
    console.warn('[asaas-webhook] externalReference ausente');
    return new Response('OK', { status: 200 });
  }

  // Formato: "nomemagnetico:userId:productType"
  const parts = payment.externalReference.split(':');
  const [saasPrefix, userId, productType] = parts.length === 3
    ? parts
    : [null, parts[0], parts[1]]; // compatibilidade com formato legado

  if (!userId || !productType) {
    console.error('[asaas-webhook] externalReference inválido:', payment.externalReference);
    return new Response('OK', { status: 200 });
  }

  // Ignorar pagamentos de outros SaaS que usem a mesma conta Asaas
  if (saasPrefix && saasPrefix !== 'nomemagnetico') {
    return new Response('OK', { status: 200 });
  }

  try {
    await createSubscription({
      userId,
      productType: productType as ProductType,
      stripeSessionId: `asaas_${payment.id}`,
      amountPaid: Math.round(payment.value * 100),
      currency: 'brl',
    });
  } catch (err: unknown) {
    // Idempotência: unique constraint violation → pagamento já processado
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === '23505'
    ) {
      return new Response('OK', { status: 200 });
    }
    console.error('[asaas-webhook] Erro ao criar subscription:', err);
    return new Response('Internal Server Error', { status: 500 });
  }

  // Notificações via n8n (falha silenciosa — não bloqueia o webhook)
  try {
    const profile = await getProfile(userId);
    const email = profile?.email ?? '';
    const firstName = profile?.nome?.split(' ')[0] ?? email.split('@')[0];

    await notify('payment.confirmed', {
      email,
      firstName,
      accessUrl: 'https://nomemagnetico.com.br/app',
      productType,
      productName: PRODUCT_NAMES[productType] ?? productType,
      amount: payment.value,
    });

    await notify('admin.new_payment', {
      userId,
      email,
      productType,
      amount: payment.value,
      currency: 'brl',
      paymentMethod: 'pix',
    });
  } catch (notifyErr) {
    console.error('[asaas-webhook] Falha ao notificar:', notifyErr);
  }

  return new Response('OK', { status: 200 });
};
