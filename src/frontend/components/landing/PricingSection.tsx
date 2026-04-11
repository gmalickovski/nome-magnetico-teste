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
  period: string;
  description: string;
  features: string[];
  cta: string;
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
    period: 'acesso por 30 dias',
    description: 'Análise completa do seu nome de nascimento com os 4 triângulos cabalísticos e IA especializada.',
    features: [
      '5 números principais + interpretação',
      '4 triângulos cabalísticos detalhados',
      'Lições kármics e tendências ocultas',
      'Débitos kármicos detectados',
      'Análise de bloqueios energéticos',
      'Descubra seu Arquétipo Junguiano',
      '3 variações do nome personalizadas',
      'Guia de implementação (30 dias)',
      'PDF para download',
      'Suporte por 30 dias',
    ],
    cta: 'Quero Meu Nome Social',
    popular: true,
  },
  {
    id: 'nome_bebe',
    name: 'Nome de Bebê',
    subtitle: 'Para seu filho',
    period: 'acesso por 30 dias',
    description: 'Encontre o nome perfeito para o seu bebê — sem bloqueios e alinhado ao destino da família.',
    features: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com sobrenome da família',
      'Alinhamento com data de nascimento',
      '4 triângulos cabalísticos por candidato',
      'Ranking com score 0–100 por harmonia',
      'Identificação do Arquétipo da Criança',
      'Relatório completo para os pais',
      'PDF para download',
      'Suporte por 30 dias',
    ],
    cta: 'Analisar Nome do Bebê',
    popular: false,
  },
  {
    id: 'nome_empresa',
    name: 'Nome Empresarial',
    subtitle: 'Para sua empresa',
    period: 'acesso por 30 dias',
    description: 'Avalie nomes empresariais pela compatibilidade com o fundador e o destino da empresa.',
    features: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com destino do fundador',
      'Análise da data de fundação',
      'Alerta de tendência oculta do 8',
      'Ranking com score 0–100',
      'Revelação do Arquétipo da Marca',
      'Relatório estratégico completo',
      'PDF para download',
      'Suporte por 30 dias',
    ],
    cta: 'Analisar Minha Empresa',
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
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="font-cinzel text-2xl font-bold text-gray-500 line-through opacity-60"
            aria-label={`Preço original: ${priceInfo.formatted}`}
          >
            {priceInfo.formatted}
          </span>
          <span className="font-cinzel text-4xl font-bold text-[#D4AF37]">
            {priceInfo.discountedFormatted}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {promotion!.discountType === 'percent'
              ? `−${promotion!.discountValue}%`
              : `−R$ ${promotion!.discountValue}`}
          </span>
          <span className="text-[#D4AF37] text-xs font-medium">{promotion!.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="font-cinzel text-4xl font-bold text-[#D4AF37]">{priceInfo.formatted}</span>
    </div>
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

  // Resolve prices: prefer hqPrices, then build from legacy stripePrices, then use fallback
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
    <section id="precos" className="py-20 md:py-32 bg-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            Investimento
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Seu Investimento em Clareza e Magnetismo
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Pagamento único. Sem assinatura. Acesso completo por 30 dias à análise mais profunda que você já fez sobre o seu nome.
          </p>
          {promotion && (
            <div className="inline-flex items-center gap-2 mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-1.5">
              <span className="text-[#D4AF37] text-sm font-semibold">🎉 {promotion.name} — desconto ativo!</span>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map(plan => {
            const isHighlighted = highlight ? plan.id === highlight : plan.popular;
            const priceInfo = resolvedPrices[plan.id] ?? FALLBACK_PRICES[plan.id];
            return (
              <div
                key={plan.id}
                id={`plano-${plan.id}`}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  isHighlighted
                    ? 'bg-white/5 border-2 border-[#D4AF37]/50 shadow-xl shadow-yellow-500/10'
                    : 'bg-white/3 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/5'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                {highlight && plan.id === highlight && !plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    SELECIONADO
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.subtitle}</p>
                </div>

                <div className="mb-6">
                  <PriceDisplay priceInfo={priceInfo} promotion={promotion} productId={plan.id} />
                  <p className="text-gray-500 text-sm mt-1">{plan.period}</p>
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => window.location.assign(`/auth/cadastro?produto=${plan.id}`)}
                  className={`w-full block text-center font-medium px-6 py-3 rounded-lg transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#f2ca50] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20'
                      : 'border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Garantia */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🔒 Pagamento seguro via Stripe · Garantia de 7 dias · Suporte incluso</p>
        </div>
      </div>
    </section>
  );
}
