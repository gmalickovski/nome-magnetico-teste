import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getHqPricesAndPromo } from '../../backend/payments/prices';
import { stripe } from '../../backend/payments/stripe';

const schema = z.object({
  coupon_code:  z.string().min(1),
  product_type: z.enum(['nome_social', 'nome_bebe', 'nome_empresa']),
});

const FALLBACK_CENTS: Record<string, number> = {
  nome_social:   9800,
  nome_bebe:     8000,
  nome_empresa: 12500,
};

function formatBRL(cents: number) {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try { body = await request.json(); } catch {
    return json({ valid: false, error: 'Body inválido' }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ valid: false, error: 'Dados inválidos' }, 400);
  }

  const { coupon_code, product_type } = parsed.data;
  const code = coupon_code.trim().toUpperCase();

  try {
    const { prices, promotion } = await getHqPricesAndPromo();
    const originalCents = prices[product_type]?.cents ?? FALLBACK_CENTS[product_type] ?? 9800;

    // Verifica se cupom bate com a promoção ativa no HQ
    if (promotion && promotion.stripePromoCode?.toUpperCase() === code) {
      const appliesToThis = !promotion.productType || promotion.productType === product_type;
      if (!appliesToThis) {
        return json({ valid: false, error: 'Cupom não se aplica a este produto' });
      }

      let discountedCents: number;
      let discountLabel: string;
      if (promotion.discountType === 'percent') {
        discountedCents = Math.round(originalCents * (1 - promotion.discountValue / 100));
        discountLabel = `${promotion.discountValue}% OFF`;
      } else {
        discountedCents = Math.max(0, originalCents - promotion.discountValue * 100);
        discountLabel = `−${formatBRL(promotion.discountValue * 100)}`;
      }

      return json({
        valid: true,
        originalCents,
        discountedCents,
        originalFormatted:   formatBRL(originalCents),
        discountedFormatted: formatBRL(discountedCents),
        discountLabel,
        promotionName: promotion.name,
      });
    }

    // Fallback: verifica no Stripe se é um promotion_code válido
    try {
      const promos = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
      if (promos.data.length > 0) {
        const promo = promos.data[0];
        const coupon = promo.coupon;
        let discountedCents: number;
        let discountLabel: string;

        if (coupon.percent_off) {
          discountedCents = Math.round(originalCents * (1 - coupon.percent_off / 100));
          discountLabel = `${coupon.percent_off}% OFF`;
        } else if (coupon.amount_off) {
          discountedCents = Math.max(0, originalCents - coupon.amount_off);
          discountLabel = `−${formatBRL(coupon.amount_off)}`;
        } else {
          return json({ valid: false, error: 'Cupom inválido ou expirado' });
        }

        return json({
          valid: true,
          originalCents,
          discountedCents,
          originalFormatted:   formatBRL(originalCents),
          discountedFormatted: formatBRL(discountedCents),
          discountLabel,
          promotionName: coupon.name ?? 'Desconto',
          stripePromoCodeId: promo.id,
        });
      }
    } catch {
      // Stripe indisponível — não encontrado
    }

    return json({ valid: false, error: 'Cupom inválido ou expirado' });
  } catch {
    return json({ valid: false, error: 'Erro ao validar cupom. Tente novamente.' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
