import React from 'react';

export interface StripePrices {
  nome_magnetico: string;
  nome_bebe: string;
  nome_empresa: string;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

const FALLBACK_PRICES: StripePrices = {
  nome_magnetico: 'R$ 97',
  nome_bebe: 'R$ 147',
  nome_empresa: 'R$ 197',
};

function buildPlans(prices: StripePrices): Plan[] {
  return [
  {
    id: 'nome_magnetico',
    name: 'Nome Social',
    subtitle: 'Análise Pessoal',
    price: prices.nome_magnetico,
    period: 'acesso por 30 dias',
    description: 'Análise completa do seu nome de nascimento com os 4 triângulos cabalísticos e IA especializada.',
    features: [
      '5 números principais + interpretação',
      '4 triângulos cabalísticos detalhados',
      'Lições kármics e tendências ocultas',
      'Débitos kármicos detectados',
      'Análise de bloqueios energéticos',
      '3 variações do nome personalizadas',
      'Guia de implementação (30 dias)',
      'PDF para download (dark + light)',
      'Suporte por 30 dias',
    ],
    cta: 'Quero Meu Nome Social',
    popular: true,
  },
  {
    id: 'nome_bebe',
    name: 'Nome de Bebê',
    subtitle: 'Para seu filho',
    price: prices.nome_bebe,
    period: 'acesso por 30 dias',
    description: 'Encontre o nome perfeito para o seu bebê — sem bloqueios e alinhado ao destino da família.',
    features: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com sobrenome da família',
      'Alinhamento com data de nascimento',
      '4 triângulos cabalísticos por candidato',
      'Ranking com score 0–100 por harmonia',
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
    price: prices.nome_empresa,
    period: 'acesso por 30 dias',
    description: 'Avalie nomes empresariais pela compatibilidade com o fundador e o destino da empresa.',
    features: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com destino do fundador',
      'Análise da data de fundação',
      'Alerta de tendência oculta do 8',
      'Ranking com score 0–100',
      'Relatório estratégico completo',
      'PDF para download',
      'Suporte por 30 dias',
    ],
    cta: 'Analisar Minha Empresa',
    popular: false,
  },
  ];
}

interface PricingSectionProps {
  highlight?: string;
  stripePrices?: StripePrices;
}

export function PricingSection({ highlight, stripePrices }: PricingSectionProps) {
  const plans = buildPlans(stripePrices ?? FALLBACK_PRICES);
  return (
    <section id="precos" className="py-20 md:py-32 bg-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            Investimento
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Planos
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Pagamento único. Sem assinatura. Acesso completo por 30 dias.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map(plan => {
            const isHighlighted = highlight ? plan.id === highlight : plan.popular;
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
                <div className="flex items-baseline gap-2">
                  <span className="font-cinzel text-4xl font-bold text-[#D4AF37]">{plan.price}</span>
                </div>
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

              <a
                href={`/comprar?produto=${plan.id}`}
                className={`block text-center font-bold py-3.5 rounded-xl transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                    : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70'
                }`}
              >
                {plan.cta}
              </a>
            </div>
            );
          })}
        </div>

        {/* Garantia */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🔒 Pagamento seguro via Stripe · 7 dias de garantia</p>
        </div>
      </div>
    </section>
  );
}
