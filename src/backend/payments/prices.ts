/**
 * Busca os preços reais dos produtos diretamente do Stripe.
 * Usado server-side na landing page para garantir que os preços exibidos
 * estejam sempre sincronizados com o que está configurado no Stripe.
 */

import { stripe } from './stripe';
import type { ProductType } from './stripe';

export interface StripePrices {
  nome_magnetico: string;
  nome_bebe: string;
  nome_empresa: string;
}

const PRICE_IDS: Record<ProductType, string> = {
  nome_magnetico: process.env.STRIPE_PRICE_NOME_MAGNETICO ?? '',
  nome_bebe: process.env.STRIPE_PRICE_NOME_BEBE ?? '',
  nome_empresa: process.env.STRIPE_PRICE_NOME_EMPRESA ?? '',
};

function formatBRL(unitAmount: number | null): string {
  if (unitAmount == null) return '';
  // Stripe armazena em centavos
  const reais = unitAmount / 100;
  return `R$ ${reais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export async function getStripePrices(): Promise<StripePrices> {
  const ids = Object.values(PRICE_IDS).filter(Boolean);
  if (ids.length < 3) throw new Error('Price IDs do Stripe não configurados');

  const [nm, nb, ne] = await Promise.all([
    stripe.prices.retrieve(PRICE_IDS.nome_magnetico),
    stripe.prices.retrieve(PRICE_IDS.nome_bebe),
    stripe.prices.retrieve(PRICE_IDS.nome_empresa),
  ]);

  return {
    nome_magnetico: formatBRL(nm.unit_amount),
    nome_bebe: formatBRL(nb.unit_amount),
    nome_empresa: formatBRL(ne.unit_amount),
  };
}
