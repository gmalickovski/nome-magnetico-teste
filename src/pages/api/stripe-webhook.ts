import type { APIRoute } from 'astro';
import { constructWebhookEvent, PRODUCT_NAMES } from '../../backend/payments/stripe';
import { createSubscription } from '../../backend/db/subscriptions';
import { getProfile } from '../../backend/db/users';
import { notify } from '../../backend/notifications/notify';
import type { ProductType } from '../../backend/payments/stripe';

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Assinatura ausente', { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error('[stripe-webhook] Assinatura inválida:', err);
    return new Response('Assinatura inválida', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          metadata?: { user_id?: string; product_type?: string };
          id: string;
          payment_intent?: string | { id: string } | null;
          amount_total?: number | null;
          currency?: string;
          customer_email?: string;
        };

        const userId = session.metadata?.user_id;
        const productType = session.metadata?.product_type as ProductType;

        if (!userId || !productType) {
          console.error('[stripe-webhook] Metadados ausentes na sessão');
          break;
        }

        // Criar subscription
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        await createSubscription({
          userId,
          productType,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          amountPaid: session.amount_total ?? undefined,
          currency: session.currency ?? 'brl',
        });

        // Enviar evento Stripe bruto para o n8n (trigger do workflow)
        const n8nUrl = process.env.N8N_WEBHOOK_TRANSACIONAL;
        if (n8nUrl) {
          fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stripeEvent: event,
              userId,
              productType,
              customerEmail: session.customer_email,
              amountPaid: session.amount_total,
              currency: session.currency,
              stripeSessionId: session.id,
            }),
          }).catch(err => console.error('[stripe-webhook] Falha ao notificar n8n:', err));
        }

        // Notificar usuário
        const profile = await getProfile(userId);
        if (profile) {
          await notify('payment.confirmed', {
            email: profile.email,
            firstName: profile.nome ?? profile.email.split('@')[0],
            accessUrl: `${process.env.APP_URL}/app`,
            productType,
            productName: PRODUCT_NAMES[productType],
          });
        }

        // Notificar admin
        await notify('admin.new_payment', {
          userId,
          productType,
          amount: session.amount_total ?? undefined,
        });

        // Evento Umami server-side — purchase_complete
        const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;
        const umamiApiUrl = process.env.UMAMI_API_URL;
        if (umamiWebsiteId && umamiApiUrl) {
          fetch(`${umamiApiUrl}/api/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: {
                website: umamiWebsiteId,
                name: 'purchase_complete',
                data: {
                  produto: productType,
                  valor: (session.amount_total ?? 0) / 100,
                },
              },
            }),
          }).catch(() => {}); // analytics nunca quebra o webhook

        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as {
          metadata?: { user_id?: string; product_type?: string };
        };
        const userId = pi.metadata?.user_id;
        const failedProductType = (pi.metadata?.product_type ?? 'nome_social') as ProductType;
        if (userId) {
          const profile = await getProfile(userId);
          if (profile) {
            await notify('payment.failed', {
              email: profile.email,
              firstName: profile.nome ?? profile.email.split('@')[0],
              productType: failedProductType,
              productName: PRODUCT_NAMES[failedProductType],
            });
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error('[stripe-webhook] Erro ao processar evento:', event.type, err);
    // Retornar 200 para o Stripe não reenviar — logar o erro internamente
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
