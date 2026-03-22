import React, { useState } from 'react';

type ProductType = 'nome_magnetico' | 'nome_bebe' | 'nome_empresa';

interface Props {
  productType: ProductType | null;
  isLoggedIn: boolean;
  isOwned: boolean;
  paymentLinks: Record<ProductType, string>;
}

const ALL_PRODUCTS: ProductType[] = ['nome_magnetico', 'nome_bebe', 'nome_empresa'];

const PRODUCT_DATA: Record<ProductType, {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}> = {
  nome_magnetico: {
    name: 'Nome Social',
    subtitle: 'Análise Pessoal',
    price: 'R$ 97',
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
  nome_bebe: {
    name: 'Nome de Bebê',
    subtitle: 'Para seu filho',
    price: 'R$ 77',
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
  nome_empresa: {
    name: 'Nome Empresarial',
    subtitle: 'Para sua empresa',
    price: 'R$ 127',
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
};

export function CheckoutFlow({ productType, isLoggedIn, isOwned, paymentLinks }: Props) {
  const [showAll, setShowAll] = useState(productType === null);
  const [loading, setLoading] = useState<ProductType | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function triggerCheckout(type: ProductType) {
    setLoading(type);
    setErrorMsg('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: type }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Erro ao criar sessão');
      window.location.href = data.url;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento');
      setLoading(null);
    }
  }

  // Header sticky — adapta navegação ao estado atual
  function StickyHeader() {
    return (
      <header className="sticky top-0 z-50 border-b border-[#D4AF37]/20 bg-[#111111]/95 backdrop-blur-sm py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-cinzel text-xl font-bold text-[#D4AF37] tracking-wider shrink-0">
            Nome Magnético
          </a>
          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <a 
                href="/app" 
                className="group flex items-center gap-2 text-sm transition-colors text-gray-400 hover:text-[#D4AF37] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[#D4AF37] after:transition-all after:duration-300 after:w-0 hover:after:w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Voltar para Meus Produtos</span>
                <span className="sm:hidden">Meus Produtos</span>
              </a>
              {!showAll && productType && (
                <button
                  onClick={() => setShowAll(true)}
                  className="bg-[#D4AF37] text-[#1A1A1A] font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/20 text-sm"
                >
                  Ver todos os produtos
                </button>
              )}
              {showAll && productType && (
                <button
                  onClick={() => setShowAll(false)}
                  className="bg-[#D4AF37] text-[#1A1A1A] font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/20 text-sm"
                >
                  Voltar
                </button>
              )}
            </div>
          ) : (
            <a
              href={`/auth/login?redirect=/comprar${productType ? `?produto=${productType}` : ''}`}
              className="border border-[#D4AF37]/40 text-[#D4AF37] font-medium px-5 py-2 rounded-lg hover:bg-[#D4AF37]/10 transition-all text-sm"
            >
              Entrar
            </a>
          )}
        </div>
      </header>
    );
  }

  function PageHeader({ singular }: { singular: boolean }) {
    return (
      <div className="text-center mb-10">
        <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
          Investimento
        </p>
        <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-3">
          {singular ? 'Plano' : 'Planos'}
        </h2>
        <p className="text-gray-400">
          Pagamento único. Sem assinatura. Acesso completo por 30 dias.
        </p>
      </div>
    );
  }

  function ProductCard({ type, showPayButton, forceHighlight = false }: { type: ProductType; showPayButton: boolean; forceHighlight?: boolean }) {
    const p = PRODUCT_DATA[type];
    const isLoadingThis = loading === type;
    const isHighlighted = forceHighlight || p.popular;

    return (
      <div className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
        isHighlighted
          ? 'bg-white/5 border-2 border-[#D4AF37]/50 shadow-xl shadow-yellow-500/10'
          : 'bg-white/3 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/5'
      }`}>
        {p.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full">
            MAIS POPULAR
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-cinzel text-xl font-bold text-white mb-1">{p.name}</h3>
          <p className="text-gray-500 text-sm">{p.subtitle}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="font-cinzel text-4xl font-bold text-[#D4AF37]">{p.price}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{p.period}</p>
        </div>

        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{p.description}</p>

        <ul className="space-y-3 mb-8 flex-1">
          {p.features.map(feature => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
              <svg className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {showPayButton ? (
          <button
            onClick={() => triggerCheckout(type)}
            disabled={!!loading}
            className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
              isHighlighted
                ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70'
            }`}
          >
            {isLoadingThis ? 'Aguarde...' : 'Comprar'}
          </button>
        ) : (
          <a
            href={paymentLinks[type]}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center font-bold py-3.5 rounded-xl transition-all duration-300 ${
              isHighlighted
                ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70'
            }`}
          >
            {p.cta}
          </a>
        )}
      </div>
    );
  }

  // Produto já adquirido
  if (isOwned && productType) {
    const p = PRODUCT_DATA[productType];
    return (
      <div className="min-h-screen bg-[#111111]">
        <StickyHeader />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full">
            <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl p-8 text-center shadow-2xl">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-3">Produto Ativo</h2>
              <p className="text-gray-300 mb-2">
                Você já possui o produto{' '}
                <strong className="text-[#D4AF37]">{p.name}</strong>{' '}
                ativo em sua conta.
              </p>
              <p className="text-gray-400 text-sm mb-8">Acesse o app para começar sua análise.</p>
              <button
                onClick={() => { window.location.href = '/app'; }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3.5 rounded-xl hover:bg-yellow-300 transition-all duration-300"
              >
                Ir para o App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Não logado — card único com link para entrar
  if (!isLoggedIn) {
    const type = productType ?? 'nome_magnetico';
    return (
      <div className="min-h-screen bg-[#111111]">
        <StickyHeader />
        <div className="pt-10 pb-20 px-4">
          <div className="max-w-md mx-auto">
            <PageHeader singular={true} />
            <ProductCard type={type} showPayButton={false} forceHighlight={true} />
          </div>
        </div>
      </div>
    );
  }

  // Logado — visão de todos os produtos
  if (showAll) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <StickyHeader />
        <div className="pt-10 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <PageHeader singular={false} />
            {errorMsg && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-8">
              {ALL_PRODUCTS.map(type => (
                <ProductCard key={type} type={type} showPayButton={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logado — visão de produto único
  const type = productType!;
  return (
    <div className="min-h-screen bg-[#111111]">
      <StickyHeader />
      <div className="pt-10 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <PageHeader singular={true} />
          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {errorMsg}
            </div>
          )}
          <ProductCard type={type} showPayButton={true} forceHighlight={true} />
        </div>
      </div>
    </div>
  );
}
