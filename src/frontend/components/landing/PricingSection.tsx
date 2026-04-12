import React, { useEffect } from 'react';
import { track } from '../../lib/analytics';
import type { PriceInfo, ActivePromotion } from '../../../backend/payments/prices';

export interface StripePrices {
  nome_social: string;
  nome_bebe: string;
  nome_empresa: string;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  period: string;
  highlights: string[];
  cta: string;
  href: string;
  popular: boolean;
}

const FALLBACK_PRICES: Record<string, PriceInfo> = {
  nome_social:  { cents: 9700,  formatted: 'R$ 97',  hasDiscount: false },
  nome_bebe:    { cents: 14700, formatted: 'R$ 147', hasDiscount: false },
  nome_empresa: { cents: 19700, formatted: 'R$ 197', hasDiscount: false },
};

const PLANS: Plan[] = [
  {
    id: 'nome_social',
    name: 'Nome Social',
    subtitle: 'Análise Pessoal',
    emoji: '✦',
    period: 'pagamento único',
    highlights: [
      '4 triângulos cabalísticos + bloqueios',
      'Lições kármicas e tendências ocultas',
      '3 variações do nome harmonizadas',
    ],
    cta: 'Quero Meu Nome Social',
    href: '/nome-social',
    popular: true,
  },
  {
    id: 'nome_bebe',
    name: 'Nome de Bebê',
    subtitle: 'Para seu filho',
    emoji: '👶',
    period: 'pagamento único',
    highlights: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com sobrenome e destino',
      'Ranking com score 0–100 por harmonia',
    ],
    cta: 'Analisar Nome do Bebê',
    href: '/nome-bebe',
    popular: false,
  },
  {
    id: 'nome_empresa',
    name: 'Nome Empresarial',
    subtitle: 'Para sua empresa',
    emoji: '🏢',
    period: 'pagamento único',
    highlights: [
      'Compatibilidade com destino do fundador',
      'Análise da data de fundação',
      'Ranking dos candidatos com score',
    ],
    cta: 'Analisar Minha Empresa',
    href: '/nome-empresarial',
    popular: false,
  },
];

interface PricingSectionProps {
  highlight?: string;
  /** @deprecated use hqPrices instead */
  stripePrices?: StripePrices;
  hqPrices?: Record<string, PriceInfo>;
  promotion?: ActivePromotion | null;
}

function PriceDisplay({ priceInfo, promotion, productId }: { priceInfo: PriceInfo; promotion?: ActivePromotion | null; productId: string }) {
  const appliesToThis = !promotion?.productType || promotion.productType === productId;
  const showDiscount = promotion && appliesToThis && priceInfo.hasDiscount && priceInfo.discountedFormatted;

  if (showDiscount) {
    return (
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-cinzel text-base font-bold text-gray-500 line-through opacity-60">
            {priceInfo.formatted}
          </span>
          <span className="font-cinzel text-3xl font-bold text-[#D4AF37]">
            {priceInfo.discountedFormatted}
          </span>
        </div>
        <span className="inline-block bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full mt-1">
          {promotion!.discountType === 'percent' ? `−${promotion!.discountValue}%` : `−R$ ${promotion!.discountValue}`}
        </span>
      </div>
    );
  }

  return (
    <span className="font-cinzel text-3xl font-bold text-[#D4AF37]">{priceInfo.formatted}</span>
  );
}

export function PricingSection({ highlight, stripePrices, hqPrices, promotion }: PricingSectionProps) {
  useEffect(() => {
    const el = document.getElementById('precos');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track('pricing_view', { produto: (highlight as 'nome_social' | 'nome_bebe' | 'nome_empresa' | undefined) ?? undefined });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [highlight]);

  const resolvedPrices: Record<string, PriceInfo> = hqPrices ?? (
    stripePrices
      ? {
          nome_social:  { cents: 0, formatted: stripePrices.nome_social,  hasDiscount: false },
          nome_bebe:    { cents: 0, formatted: stripePrices.nome_bebe,    hasDiscount: false },
          nome_empresa: { cents: 0, formatted: stripePrices.nome_empresa, hasDiscount: false },
        }
      : FALLBACK_PRICES
  );

  return (
    <section id="precos" className="py-20 md:py-28 bg-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs font-medium tracking-widest uppercase mb-3">Produtos</p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-[#e5e2e1] mb-4">
            Escolha Sua Análise
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
            Pagamento único. Sem assinatura. Acesso completo à análise mais profunda que você já fez sobre um nome.
          </p>
          {promotion && (
            <div className="inline-flex items-center gap-2 mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-1.5">
              <span className="text-[#D4AF37] text-sm font-semibold">🎉 {promotion.name} — desconto ativo!</span>
            </div>
          )}
        </div>

        {/* Cards compactos */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const isHighlighted = highlight ? plan.id === highlight : plan.popular;
            const priceInfo = resolvedPrices[plan.id] ?? FALLBACK_PRICES[plan.id];
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-white/5 border-2 border-[#D4AF37]/50 shadow-[0_20px_50px_rgba(212,175,55,0.10)]'
                    : 'bg-white/3 border border-white/8 hover:border-[#D4AF37]/25 hover:bg-white/4'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                    MAIS POPULAR
                  </div>
                )}

                {/* Nome + preço */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg leading-none">{plan.emoji}</span>
                    <h3 className="font-cinzel text-lg font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-gray-500 text-xs mb-4">{plan.subtitle}</p>
                  <PriceDisplay priceInfo={priceInfo} promotion={promotion} productId={plan.id} />
                  <p className="text-gray-600 text-xs mt-1">{plan.period}</p>
                </div>

                {/* 3 destaques */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.highlights.map(h => (
                    <li key={h} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => window.location.assign(`/auth/cadastro?produto=${plan.id}`)}
                  className={`w-full text-center font-medium px-6 py-3 rounded-xl transition-all duration-300 text-sm mb-3 ${
                    isHighlighted
                      ? 'bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#f2ca50] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20'
                      : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Link para detalhes */}
                <a
                  href={plan.href}
                  className="block text-center text-gray-600 hover:text-[#D4AF37] text-xs transition-colors"
                >
                  Ver todos os detalhes →
                </a>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="text-center mt-10 space-y-2">
          <p className="text-gray-600 text-xs">🔒 Pagamento seguro via Stripe · Garantia de 7 dias · Suporte incluso</p>
          <a href="/precos" className="inline-block text-[#D4AF37]/70 hover:text-[#D4AF37] text-xs transition-colors underline underline-offset-2">
            Comparar planos e ver todos os detalhes →
          </a>
        </div>
      </div>
    </section>
  );
}
