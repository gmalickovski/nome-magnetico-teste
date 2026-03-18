import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Informe seu Nome e Data',
    description:
      'Digite seu nome completo de nascimento e data de nascimento. Esses são os dados base para a análise cabalística.',
    icon: '✍️',
  },
  {
    number: '02',
    title: 'Calculamos os 4 Triângulos Cabalísticos',
    description:
      'Nossa engine converte cada letra em vibrações numéricas e constrói os 4 triângulos cabalísticos (Vida, Pessoal, Social e Destino), detectando sequências de bloqueio em cada dimensão.',
    icon: '🔢',
  },
  {
    number: '03',
    title: 'IA Interpreta os Padrões',
    description:
      'Uma IA especializada em numerologia cabalística analisa seus 5 números principais e revela o impacto dos bloqueios.',
    icon: '🤖',
  },
  {
    number: '04',
    title: 'Receba seu Nome Ideal',
    description:
      'Sugerimos variações do nome que eliminam os bloqueios, compatíveis com os números de Expressão e Destino — para você, seu bebê ou sua empresa.',
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
            Em minutos, você terá uma análise completa da energia do nome — seja pessoal,
            de bebê ou empresarial — com sugestões personalizadas sem bloqueios.
          </p>
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
