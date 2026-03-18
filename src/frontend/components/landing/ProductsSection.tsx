import React from 'react';

const products = [
  {
    id: 'nome_magnetico',
    icon: '✨',
    name: 'Nome Social',
    tagline: 'Desbloqueie a energia do seu nome',
    description: 'Análise completa do seu nome de nascimento com os 4 triângulos cabalísticos, lições kármics e sugestões de nome sem bloqueios.',
    benefits: [
      '5 números + 4 triângulos + lições kármicas e tendências ocultas',
      'Bloqueios e débitos kármicos com aspectos de saúde',
      '3 Nomes Magnéticos alinhados ao Expressão e Destino',
    ],
    cta: 'Analisar Meu Nome',
    highlight: true,
  },
  {
    id: 'nome_bebe',
    icon: '👶',
    name: 'Nome de Bebê',
    tagline: 'O melhor começo começa pelo nome',
    description: 'Encontre o nome ideal para seu filho — sem bloqueios, compatível com o sobrenome da família e alinhado ao destino do bebê.',
    benefits: [
      '4 triângulos cabalísticos + lições kármicas por candidato',
      'Compatibilidade com sobrenome e Destino do bebê',
      'Ranking score 0–100 — melhor nome automaticamente destacado',
    ],
    cta: 'Analisar Nome do Bebê',
    highlight: false,
  },
  {
    id: 'nome_empresa',
    icon: '🏢',
    name: 'Nome Empresarial',
    tagline: 'Um nome que projeta prosperidade',
    description: 'Avalie nomes de empresa pela compatibilidade com o Destino do fundador e da data de fundação, evitando bloqueios de crescimento.',
    benefits: [
      'Dupla compatibilidade: Destino do fundador + Destino da empresa',
      'Débitos kármicos e bloqueios de crescimento detectados',
      'Alerta de excesso do 8 — risco de materialismo no negócio',
    ],
    cta: 'Analisar Minha Empresa',
    highlight: false,
  },
];

export function ProductsSection() {
  return (
    <section id="produtos" className="py-20 md:py-32 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            Produtos
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Três Análises, Uma Missão
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Seja para você, para o seu filho ou para sua empresa — cada nome carrega uma vibração única
            que pode abrir ou fechar caminhos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                product.highlight
                  ? 'bg-white/5 border-2 border-[#D4AF37]/50 shadow-xl shadow-yellow-500/10'
                  : 'bg-white/3 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/5'
              }`}
            >
              {product.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                  MAIS POPULAR
                </div>
              )}

              <div className="text-5xl mb-5">{product.icon}</div>

              <h3 className="font-cinzel text-xl font-bold text-white mb-1">{product.name}</h3>
              <p className={`text-sm mb-4 ${product.highlight ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                {product.tagline}
              </p>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {product.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              <a
                href={`/comprar?produto=${product.id}`}
                className={`block text-center font-bold py-3.5 rounded-xl transition-all duration-300 ${
                  product.highlight
                    ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                    : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70'
                }`}
              >
                {product.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
