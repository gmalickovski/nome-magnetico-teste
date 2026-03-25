import type { APIRoute } from 'astro';
import { supabase } from '../../../backend/db/supabase';
import { getProfile } from '../../../backend/db/users';
import { notify } from '../../../backend/notifications/notify';
import { PRODUCT_NAMES } from '../../../backend/payments/stripe';
import type { ProductType } from '../../../backend/payments/stripe';

/**
 * POST /api/internal/notify-expiring
 *
 * Chamado diariamente pelo n8n (Schedule Trigger 09:00) para disparar
 * emails de expiração de assinatura. Protegido por X-Internal-Secret.
 *
 * Configuração n8n: Schedule Trigger → HTTP Request POST com header
 *   X-Internal-Secret: <valor de INTERNAL_API_SECRET>
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || request.headers.get('X-Internal-Secret') !== secret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:4321';
  const renewUrl = `${appUrl}/comprar`;
  const now = new Date();

  const results = { expiring7d: 0, expiring1d: 0, expired: 0 };

  // Grupo A: expira em ~7 dias (janela de 1 hora)
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in7dPlus1h = new Date(in7d.getTime() + 60 * 60 * 1000);

  // Grupo B: expira em ~1 dia (janela de 1 hora)
  const in1d = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const in1dPlus1h = new Date(in1d.getTime() + 60 * 60 * 1000);

  // Grupo C: expirou entre ontem e agora
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [{ data: group7d }, { data: group1d }, { data: groupExpired }] = await Promise.all([
    supabase
      
      .from('subscriptions')
      .select('user_id, product_type')
      .gte('ends_at', in7d.toISOString())
      .lt('ends_at', in7dPlus1h.toISOString()),
    supabase
      
      .from('subscriptions')
      .select('user_id, product_type')
      .gte('ends_at', in1d.toISOString())
      .lt('ends_at', in1dPlus1h.toISOString()),
    supabase
      
      .from('subscriptions')
      .select('user_id, product_type')
      .gte('ends_at', yesterday.toISOString())
      .lt('ends_at', now.toISOString()),
  ]);

  async function notifyUser(userId: string, daysLeft: 7 | 1 | null, productType: ProductType) {
    const profile = await getProfile(userId);
    if (!profile?.email) return;

    const productName = PRODUCT_NAMES[productType];

    if (daysLeft !== null) {
      await notify('subscription.expiring_soon', {
        email: profile.email,
        firstName: profile.nome ?? undefined,
        daysLeft,
        renewUrl,
        productType,
        productName,
      }).catch(() => {});
    } else {
      await notify('subscription.expired', {
        email: profile.email,
        firstName: profile.nome ?? undefined,
        renewUrl,
        productType,
        productName,
      }).catch(() => {});
    }
  }

  const tasks: Promise<void>[] = [];

  for (const row of group7d ?? []) {
    tasks.push(notifyUser(row.user_id, 7, (row.product_type ?? 'nome_social') as ProductType));
    results.expiring7d++;
  }
  for (const row of group1d ?? []) {
    tasks.push(notifyUser(row.user_id, 1, (row.product_type ?? 'nome_social') as ProductType));
    results.expiring1d++;
  }
  for (const row of groupExpired ?? []) {
    tasks.push(notifyUser(row.user_id, null, (row.product_type ?? 'nome_social') as ProductType));
    results.expired++;
  }

  await Promise.allSettled(tasks);

  const sent = results.expiring7d + results.expiring1d + results.expired;
  return json({ sent, groups: results }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
