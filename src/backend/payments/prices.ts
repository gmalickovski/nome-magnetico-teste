/**
 * Busca preços e promoção ativa via API pública do HQ.
 * Fallback: busca preços diretamente do Stripe se HQ estiver indisponível.
 */

import { stripe } from './stripe';
import type { ProductType } from './stripe';

export interface StripePrices {
  nome_social: string;
  nome_bebe: string;
  nome_empresa: string;
}

export interface PriceInfo {
  cents: number;
  formatted: string;
  priceId?: string;
  productId?: string;
  productName?: string;
  discountedCents?: number;
  discountedFormatted?: string;
  hasDiscount: boolean;
}

export interface ActivePromotion {
  id: string;
  name: string;
  bannerText: string | null;
  productType: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  endDate: string;
  stripeCouponId: string | null;
  stripePromoCode: string | null;
}

export interface HqPricesResponse {
  prices: Record<string, PriceInfo>;
  promotion: ActivePromotion | null;
}

// Fallback — IDs de preço individuais caso HQ esteja offline
const PRICE_IDS: Record<ProductType, string> = {
  nome_social:  process.env.STRIPE_PRICE_NOME_SOCIAL  ?? '',
  nome_bebe:    process.env.STRIPE_PRICE_NOME_BEBE    ?? '',
  nome_empresa: process.env.STRIPE_PRICE_NOME_EMPRESA ?? '',
};

function formatBRL(unitAmount: number | null): string {
  if (unitAmount == null) return '';
  return `R$ ${(unitAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Busca preços + promoção ativa via HQ (preferido) ou Stripe (fallback) */
export async function getHqPricesAndPromo(saasId = 'nome-magnetico'): Promise<HqPricesResponse> {
  const hqUrl = process.env.HQ_API_URL;
  if (hqUrl) {
    try {
      const res = await fetch(`${hqUrl}/promotions/public?saasId=${saasId}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return await res.json() as HqPricesResponse;
      }
    } catch {
      // HQ indisponível → fallback Stripe abaixo
    }
  }

  // Fallback: busca preços diretamente do Stripe sem promoção
  const prices: Record<string, PriceInfo> = {};
  const ids = Object.values(PRICE_IDS).filter(Boolean);
  if (ids.length > 0) {
    const [nm, nb, ne] = await Promise.all([
      PRICE_IDS.nome_social  ? stripe.prices.retrieve(PRICE_IDS.nome_social)  : null,
      PRICE_IDS.nome_bebe    ? stripe.prices.retrieve(PRICE_IDS.nome_bebe)    : null,
      PRICE_IDS.nome_empresa ? stripe.prices.retrieve(PRICE_IDS.nome_empresa) : null,
    ]);
    if (nm) prices.nome_social  = { cents: nm.unit_amount ?? 0, formatted: formatBRL(nm.unit_amount), hasDiscount: false };
    if (nb) prices.nome_bebe    = { cents: nb.unit_amount ?? 0, formatted: formatBRL(nb.unit_amount), hasDiscount: false };
    if (ne) prices.nome_empresa = { cents: ne.unit_amount ?? 0, formatted: formatBRL(ne.unit_amount), hasDiscount: false };
  }

  return { prices, promotion: null };
}

/** Compatibilidade retroativa — retorna apenas strings de preço */
export async function getStripePrices(): Promise<StripePrices> {
  const FALLBACK: StripePrices = { nome_social: 'R$ 97', nome_bebe: 'R$ 147', nome_empresa: 'R$ 197' };
  try {
    const { prices } = await getHqPricesAndPromo();
    return {
      nome_social:  prices.nome_social?.formatted  || FALLBACK.nome_social,
      nome_bebe:    prices.nome_bebe?.formatted    || FALLBACK.nome_bebe,
      nome_empresa: prices.nome_empresa?.formatted || FALLBACK.nome_empresa,
    };
  } catch {
    return FALLBACK;
  }
}
