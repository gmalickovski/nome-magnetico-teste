import React from 'react';

const products = [
  {
    id: 'nome_social',
    icon: '✨',
    name: 'Nome Social',
    tagline: 'A Jornada de Transformação Pessoal',
    description: 'Para adultos que sentem que algo no nome não ressoa com quem realmente são — ou com o que querem atrair na vida e na carreira.',
    benefits: [
      'Identificação de Bloqueios Energéticos e Tendências Ocultas.',
      'Revelação do seu Arquétipo Junguiano.',
      'Top 3 sugestões de nomes magnéticos e harmonizados.',
      'Guia prático de 30 dias para implementar sua nova assinatura.'
    ],
    highlight: true,
  },
  {
    id: 'nome_bebe',
    icon: '👶',
    name: 'Nome de Bebê',
    tagline: 'A Decisão Mais Importante do Seu Filho',
    description: 'A certeza de dar ao seu filho o melhor começo vibracional possível. Sem bloqueios. Com um nome que ressoará com o destino dele para sempre.',
    benefits: [
      'Análise cruzada dos nomes candidatos com o Destino da criança.',
      'Ranking objetivo do pior ao "Nome de Ouro".',
      'Identificação do Arquétipo da Criança (perfil e talentos naturais).',
      'Guia dos pais para criar o bebê segundo sua natureza numérica original.'
    ],
    highlight: false,
  },
  {
    id: 'nome_empresa',
    icon: '🏢',
    name: 'Nome Empresarial',
    tagline: 'Branding com Fundamento Vibracional',
    description: 'A diferença entre uma marca que as pessoas esquecem e uma que atrai clientes, sócios e oportunidades com magnetismo natural.',
    benefits: [
      'Avaliação da sinergia entre o Destino dos sócios e o nome da marca.',
      'Verificação rigorosa de riscos ocultos operacionais e financeiros.',
      'Guia de Posicionamento e Arquétipo de Marca (como a Apple ou a Nike têm).',
      'Sugestões de tom de voz e ativação anual para a empresa.'
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
            Três Produtos, Uma Missão: Remover o que Bloqueia Seu Potencial
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Seja para você, para o seu filho ou para sua empresa — cada nome carrega uma vibração única
            que pode abrir ou fechar caminhos. A análise revela qual é o seu caso.
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
