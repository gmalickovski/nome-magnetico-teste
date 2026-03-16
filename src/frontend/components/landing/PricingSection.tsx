import React from 'react';

const plans = [
  {
    id: 'nome_magnetico',
    name: 'Nome Magnético',
    subtitle: 'Análise Pessoal',
    price: 'R$ 97',
    period: 'acesso por 30 dias',
    description: 'Análise completa do seu nome de nascimento com IA cabalística.',
    features: [
      '5 números completos + interpretação',
      'Triângulo da Vida detalhado',
      'Análise de bloqueios energéticos',
      '3 Nomes Magnéticos personalizados',
      'Guia de implementação (30 dias)',
      'Afirmações e rituais de ativação',
      'PDF para download (dark + light)',
      'Suporte por 30 dias',
    ],
    cta: 'Quero Meu Nome Magnético',
    popular: true,
  },
  {
    id: 'nome_bebe',
    name: 'Nome do Bebê',
    subtitle: 'Em breve',
    price: 'R$ 147',
    period: 'acesso por 30 dias',
    description: 'Encontre o nome perfeito para o seu bebê — sem bloqueios e alinhado ao destino.',
    features: [
      'Análise de múltiplos nomes candidatos',
      'Compatibilidade com sobrenome da família',
      'Alinhamento com data de nascimento prevista',
      'Ranking de nomes por harmonia',
      'Relatório para os pais',
    ],
    cta: 'Lista de Espera',
    popular: false,
    comingSoon: true,
  },
];

export function PricingSection() {
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
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-white/5 border-2 border-[#D4AF37]/50 shadow-xl shadow-yellow-500/10'
                  : 'bg-white/3 border border-white/10'
              } ${plan.comingSoon ? 'opacity-70' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                  MAIS POPULAR
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  EM BREVE
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

              <ul className="space-y-3 mb-8">
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
                href={plan.comingSoon ? '#' : '/comprar'}
                className={`block text-center font-bold py-3.5 rounded-xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                    : 'border border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
                } ${plan.comingSoon ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🔒 Pagamento seguro via Stripe · 7 dias de garantia</p>
        </div>
      </div>
    </section>
  );
}
