import React from 'react';

const products = [
  {
    id: 'nome_magnetico',
    icon: '✨',
    name: 'Nome Social',
    tagline: 'Desbloqueie a energia do seu nome',
    description: 'Análise cabalística completa do seu nome de nascimento e data. O Estudo revela as energias ocultas e mostra exatamente como elas afetam sua vida diária.',
    benefits: [
      'Identifica bloqueios na vida financeira, relacionamentos e saúde.',
      'Revela seus 5 números principais e os 4 triângulos de destino.',
      'Apresenta 3 opções de Nomes Magnéticos harmonizados para você usar na sua assinatura e redes.',
      'Acompanha um guia em PDF detalhado para manifestação diária.'
    ],
    highlight: true,
  },
  {
    id: 'nome_bebe',
    icon: '👶',
    name: 'Nome de Bebê',
    tagline: 'O melhor começo começa pelo nome',
    description: 'Garanta um futuro sem bloqueios limitadores para seu filho. O Estudo cruza os sobrenomes da família com nomes pretendidos para encontrar a opção ideal.',
    benefits: [
      'Evita números kármicos e sequências negativas na vida do seu filho.',
      'Avalia múltiplos nomes candidatos enviando um ranking claro de harmonia (0-100).',
      'Harmoniza o nome com a data de nascimento e com o destino energético dos pais.',
      'Traz paz mental de saber que está dando a melhor base energética desde o nascimento.'
    ],
    highlight: false,
  },
  {
    id: 'nome_empresa',
    icon: '🏢',
    name: 'Nome Empresarial',
    tagline: 'Um nome que projeta prosperidade',
    description: 'Um nome empresarial mal escolhido pode travar suas vendas desde o dia 1. A análise cruza a vibração da marca com a essência do fundador.',
    benefits: [
      'Alinha a assinatura energética da empresa ao destino e missão do fundador.',
      'Evita o excesso do número 8 (risco de ganância corporativa) e faltas graves.',
      'Avalia múltiplos candidatos mostrando a harmonia de cada opção no mercado.',
      'Desenvolvido para atrair de forma mais natural um fluxo de negócios e prosperidade.'
    ],
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
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#D4AF37]/20 ${
                product.highlight
                  ? 'bg-white/5 border-2 border-[#D4AF37]/50'
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

              <p className="text-gray-300 text-sm leading-relaxed mb-4 font-medium">{product.description}</p>

              <div className="flex-1 space-y-2">
                {product.benefits.map(benefit => (
                  <p key={benefit} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-[#D4AF37] font-bold">-</span>
                    <span className="leading-snug">{benefit}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
