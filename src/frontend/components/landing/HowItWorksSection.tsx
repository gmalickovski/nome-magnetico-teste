import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Os 5 Números Fundamentais',
    description:
      'Calculamos sua Expressão, Destino, Motivação, Missão e Impressão para formar o seu mapa base a partir de seu nome.',
    icon: '📝',
  },
  {
    number: '02',
    title: 'Os 4 Triângulos',
    description:
      'Desenhamos os Triângulos da Vida, Pessoal, Social e Destino para encontrar travamentos invisíveis em diversas áreas.',
    icon: '📐',
  },
  {
    number: '03',
    title: 'Arquétipos Junguianos',
    description:
      'Nossa IA especializada traduz os seus resultados numéricos para narrativas psicológicas reais para o seu perfil.',
    icon: '🎭',
  },
  {
    number: '04',
    title: 'A Nova Assinatura',
    description:
      'Identificamos e sugerimos variações luxuosas do seu nome sem bloqueios, com um score perfeito de harmonia vibracional.',
    icon: '✨',
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 md:py-32 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            O Processo
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Como Funciona
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Diferente da astrologia genérica, o Nome Magnético une milênios de tradição matemática
            da Cabala com tecnologia de Inteligência Artificial para destravar o seu verdadeiro potencial.
          </p>>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent z-0 -translate-y-1/2" />
              )}

              <div className="relative z-10 bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-6 hover:border-[#D4AF37]/40 hover:bg-white/8 transition-all duration-300">
                <div className="font-cinzel text-4xl font-bold text-[#D4AF37]/20 mb-3">
                  {step.number}
                </div>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="font-cinzel text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
