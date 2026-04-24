import { useState } from 'react';
import type { PriceInfo, ActivePromotion } from '../../../backend/payments/prices';
import { track } from '../../lib/analytics';
import { PixModal } from './PixModal';

type ProductType = 'nome_social' | 'nome_bebe' | 'nome_empresa';

interface Props {
  productType: ProductType | null;
  isLoggedIn: boolean;
  isOwned: boolean;
  paymentLinks: Record<ProductType, string>;
  hqPrices?: Record<string, PriceInfo>;
  promotion?: ActivePromotion | null;
}

const ALL_PRODUCTS: ProductType[] = ['nome_social', 'nome_bebe', 'nome_empresa'];

const PRODUCT_STATIC: Record<ProductType, {
  name: string;
  subtitle: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}> = {
  nome_social: {
    name: 'Nome Social',
    subtitle: 'A Jornada de Transformação Pessoal',
    period: 'acesso por 30 dias',
    description: 'Análise cabalística profunda com IA especializada para descobrir a sua frequência correta e remover seus bloqueios energéticos.',
    features: [
      '5 números principais e interpretação',
      '4 triângulos cabalísticos detalhados',
      'Guia de Nova Assinatura Magnética',
      'Top 3 variações do seu nome rankeadas',
      'Lições Kármicas e Tendências Ocultas',
      'Descubra o seu Arquétipo Junguiano',
      'Relatório PDF Premium Imersivo',
    ],
    cta: 'Quero Meu Nome Social',
    popular: true,
  },
  nome_bebe: {
    name: 'Nome de Bebê',
    subtitle: 'A Decisão Mais Importante do Seu Filho',
    period: 'acesso por 30 dias',
    description: 'Tenha a certeza matemática de dar o melhor começo vibracional e livre de bloqueios ao destino do seu filho.',
    features: [
      'Verifica compatibilidade entre nomes',
      'Identifica bloqueios nos candidatos',
      'Descobre O Nome de Ouro',
      'Identifica o Arquétipo da Criança',
      'Guia dos pais para lidar com o perfil',
      'Relatório PDF para imprimir',
    ],
    cta: 'Analisar Nome do Bebê',
    popular: false,
  },
  nome_empresa: {
    name: 'Nome Empresarial',
    subtitle: 'Branding com Fundamento Vibracional',
    period: 'acesso por 30 dias',
    description: 'Um nome magnético atrai fluxo de negócios. Um nome qualquer afasta prosperidade. Obtenha um posicionamento certeiro.',
    features: [
      'Cruza vibração do nome com a do sócio',
      'Riscos ocultos mapeados',
      'Posicionamento de Mercado natural',
      'Arquétipo da Marca revelado',
      'Calendário ativo anual para vendas',
    ],
    cta: 'Analisar Minha Empresa',
    popular: false,
  },
};

const FALLBACK_PRICES: Record<string, PriceInfo> = {
  nome_social:  { cents: 9700,  formatted: 'R$ 97',  hasDiscount: false },
  nome_bebe:    { cents: 14700, formatted: 'R$ 147', hasDiscount: false },
  nome_empresa: { cents: 19700, formatted: 'R$ 197', hasDiscount: false },
};

function PriceDisplay({ priceInfo, promotion, productId }: { priceInfo: PriceInfo; promotion?: ActivePromotion | null; productId: string }) {
  const appliesToThis = !promotion?.productType || promotion.productType === productId;
  const showDiscount = promotion && appliesToThis && priceInfo.hasDiscount && priceInfo.discountedFormatted;

  if (showDiscount) {
    return (
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-cinzel text-2xl font-bold text-gray-500 line-through opacity-60">
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

export function CheckoutFlow({ productType, isLoggedIn, isOwned, paymentLinks, hqPrices, promotion }: Props) {
  const [showAll, setShowAll] = useState(productType === null);
  const [loading, setLoading] = useState<ProductType | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponCode, setCouponCode] = useState('');

  interface PixData {
    chargeId: string;
    pixCopiaECola: string;
    qrCodeImage: string;
    expiresAt: string;
    productType: ProductType;
  }
  const [pixData, setPixData]     = useState<PixData | null>(null);
  const [pixLoading, setPixLoading] = useState<ProductType | null>(null);
  const [pixError, setPixError]   = useState('');

  // Sem auto-trigger: usuário escolhe cartão ou PIX na página

  const prices = hqPrices ?? FALLBACK_PRICES;

  async function triggerCheckout(type: ProductType) {
    setLoading(type);
    setErrorMsg('');
    try {
      // Auto-aplica cupom da promoção se o usuário não digitou um código manual
      const appliesToThis = !promotion?.productType || promotion.productType === type;
      const effectiveCoupon = couponCode.trim() || (promotion && appliesToThis ? promotion.stripePromoCode : null) || undefined;

      const priceInfo = prices[type] ?? FALLBACK_PRICES[type];
      track('checkout_start', {
        produto: type,
        preco: priceInfo.cents / 100,
        promocao: promotion?.name ?? null,
      });

      // Se cupom foi digitado manualmente, registrar evento
      if (couponCode.trim()) {
        track('coupon_applied', {
          codigo_cupom: couponCode.trim(),
          produto: type,
        });
      }

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: type,
          couponCode: effectiveCoupon ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao criar sessão');
      if (data.bypass) {
        window.location.href = data.redirectUrl;
      } else {
        if (!data.url) throw new Error('URL de pagamento não retornada');
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento';
      track('checkout_failed', { produto: type, erro: errMsg });
      setErrorMsg(errMsg);
      setLoading(null);
    }
  }

  async function triggerPix(type: ProductType) {
    setPixLoading(type);
    setPixError('');
    try {
      track('pix_start', { produto: type });
      const res = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: type }),
      });
      const data = await res.json() as {
        bypass?: boolean;
        redirectUrl?: string;
        chargeId?: string;
        pixCopiaECola?: string;
        qrCodeImage?: string;
        expiresAt?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar PIX');
      if (data.bypass && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setPixData({
        chargeId:      data.chargeId!,
        pixCopiaECola: data.pixCopiaECola!,
        qrCodeImage:   data.qrCodeImage!,
        expiresAt:     data.expiresAt!,
        productType:   type,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar PIX';
      track('pix_failed', { produto: type, erro: msg });
      setPixError(msg);
    } finally {
      setPixLoading(null);
    }
  }

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
        {promotion && (
          <div className="inline-flex items-center gap-2 mt-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-1.5">
            <span className="text-[#D4AF37] text-sm font-semibold">🎉 {promotion.name} — desconto ativo!</span>
          </div>
        )}
      </div>
    );
  }

  function ProductCard({ type, showPayButton, forceHighlight = false }: { type: ProductType; showPayButton: boolean; forceHighlight?: boolean }) {
    const p = PRODUCT_STATIC[type];
    const priceInfo = prices[type] ?? FALLBACK_PRICES[type];
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
          <PriceDisplay priceInfo={priceInfo} promotion={promotion} productId={type} />
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
          <>
            <div className="mb-4">
              <label className="block text-xs text-[#76746a] font-medium uppercase tracking-widest mb-1.5">
                Código promocional <span className="normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={promotion?.stripePromoCode ? `Auto: ${promotion.stripePromoCode}` : 'Ex: VERAO20'}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
              />
            </div>
            {/* Cartão */}
            <button
              onClick={() => triggerCheckout(type)}
              disabled={!!loading || !!pixLoading}
              className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                isHighlighted
                  ? 'bg-[#D4AF37] text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-500/20'
                  : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {isLoadingThis ? 'Aguarde...' : 'Pagar com Cartão'}
            </button>
            {/* Divisor */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-gray-700 text-xs">ou</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            {/* PIX */}
            <button
              onClick={() => triggerPix(type)}
              disabled={!!loading || !!pixLoading}
              className="w-full flex items-center justify-center gap-2 border border-[#D4AF37]/30 text-[#D4AF37] font-bold py-3.5 rounded-xl hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
            >
              {pixLoading === type ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Gerando QR Code…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 01.032 0l8.73 4.998a.75.75 0 01.39.658V16.17a.75.75 0 01-.39.658l-8.73 4.998a.75.75 0 01-.064.002.75.75 0 01-.064-.002l-8.73-4.998A.75.75 0 013 16.17V7.826a.75.75 0 01.39-.658l8.094-4.996z" clipRule="evenodd" />
                  </svg>
                  Pagar com PIX
                </>
              )}
            </button>
            {pixError && (
              <p className="text-red-400 text-xs text-center mt-1">{pixError}</p>
            )}
          </>
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

  if (isOwned && productType) {
    const p = PRODUCT_STATIC[productType];
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

  if (!isLoggedIn) {
    const type = productType ?? 'nome_social';
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

  if (showAll) {
    return (
      <>
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
                {ALL_PRODUCTS.map(t => (
                  <ProductCard key={t} type={t} showPayButton={true} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {pixData && (
          <PixModal
            productType={pixData.productType}
            pixCopiaECola={pixData.pixCopiaECola}
            qrCodeImage={pixData.qrCodeImage}
            expiresAt={pixData.expiresAt}
            chargeId={pixData.chargeId}
            onClose={() => setPixData(null)}
          />
        )}
      </>
    );
  }

  const type = productType!;

  // Produto específico (logado, não possui) — mostrar card com seleção de método
  return (
    <>
      <div className="min-h-screen bg-[#111111]">
        <StickyHeader />
        <div className="pt-10 pb-20 px-4">
          <div className="max-w-md mx-auto">
            <PageHeader singular={true} />
            {errorMsg && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                {errorMsg}
                <button
                  onClick={() => setErrorMsg('')}
                  className="block mt-3 mx-auto text-[#D4AF37] hover:underline text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            )}
            <ProductCard type={type} showPayButton={true} forceHighlight={true} />
          </div>
        </div>
      </div>
      {pixData && (
        <PixModal
          productType={pixData.productType}
          pixCopiaECola={pixData.pixCopiaECola}
          qrCodeImage={pixData.qrCodeImage}
          expiresAt={pixData.expiresAt}
          chargeId={pixData.chargeId}
          onClose={() => setPixData(null)}
        />
      )}
    </>
  );
}
