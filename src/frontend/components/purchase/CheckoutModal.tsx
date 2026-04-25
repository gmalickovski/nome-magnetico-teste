import { useState, useEffect, useRef } from 'react';
import type { PriceInfo, ActivePromotion } from '../../../backend/payments/prices';

type ProductType = 'nome_social' | 'nome_bebe' | 'nome_empresa';
type Step = 'method' | 'card-loading' | 'pix-loading' | 'pix-qr' | 'pix-success';

interface PixData {
  chargeId: string;
  pixCopiaECola: string;
  qrCodeImage: string;
  expiresAt: string;
}

interface CouponResult {
  valid: true;
  originalCents: number;
  discountedCents: number;
  originalFormatted: string;
  discountedFormatted: string;
  discountLabel: string;
  promotionName: string;
  stripePromoCodeId?: string;
}

const PRODUCT_NAMES: Record<ProductType, string> = {
  nome_social:  'Nome Social',
  nome_bebe:    'Nome de Bebê',
  nome_empresa: 'Nome Empresarial',
};

interface Props {
  productType: ProductType;
  priceInfo: PriceInfo;
  promotion?: ActivePromotion | null;
  onClose: () => void;
  onTriggerCard: (type: ProductType, couponCode?: string) => void;
}

export function CheckoutModal({ productType, priceInfo, promotion, onClose, onTriggerCard }: Props) {
  const [step, setStep]         = useState<Step>('method');
  const [pixData, setPixData]   = useState<PixData | null>(null);
  const [pixError, setPixError] = useState('');
  const [copied, setCopied]     = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Cupom
  const [couponCode, setCouponCode]       = useState('');
  const [showCoupon, setShowCoupon]       = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult]   = useState<CouponResult | null>(null);
  const [couponError, setCouponError]     = useState('');

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Promoção automática do HQ (sem digitar cupom)
  useEffect(() => {
    if (!promotion) return;
    const appliesToThis = !promotion.productType || promotion.productType === productType;
    if (appliesToThis && promotion.stripePromoCode) {
      setCouponCode(promotion.stripePromoCode);
    }
  }, [promotion, productType]);

  // Countdown quando QR está visível
  useEffect(() => {
    if (step !== 'pix-qr' || !pixData) return;
    const exp = new Date(pixData.expiresAt).getTime();
    setSecondsLeft(Math.max(0, Math.floor((exp - Date.now()) / 1000)));
    timerRef.current = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, pixData]);

  // Polling para detectar pagamento
  useEffect(() => {
    if (step !== 'pix-qr' || !pixData) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-pix-status?chargeId=${encodeURIComponent(pixData.chargeId)}`);
        const data = await res.json() as { paid: boolean };
        if (data.paid) {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setStep('pix-success');
          setTimeout(() => {
            window.location.href = `/app?checkout=success&produto=${productType}`;
          }, 1800);
        }
      } catch { /* silencioso */ }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, pixData, productType]);

  async function validateCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponResult(null);
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: code, product_type: productType }),
      });
      const data = await res.json() as CouponResult | { valid: false; error: string };
      if (data.valid) {
        setCouponResult(data as CouponResult);
      } else {
        setCouponError((data as { valid: false; error: string }).error);
      }
    } catch {
      setCouponError('Erro ao validar cupom. Tente novamente.');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handlePix() {
    setStep('pix-loading');
    setPixError('');
    try {
      const res = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType,
          coupon_code: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json() as {
        bypass?: boolean; redirectUrl?: string;
        chargeId?: string; pixCopiaECola?: string;
        qrCodeImage?: string; expiresAt?: string;
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
      });
      setStep('pix-qr');
    } catch (err) {
      setPixError(err instanceof Error ? err.message : 'Erro ao gerar PIX');
      setStep('method');
    }
  }

  function handleCard() {
    setStep('card-loading');
    const effectiveCoupon = couponCode.trim() || undefined;
    onTriggerCard(productType, effectiveCoupon);
  }

  function copyPix() {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.pixCopiaECola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const canClose = step !== 'card-loading' && step !== 'pix-loading' && step !== 'pix-success';
  const productLabel = PRODUCT_NAMES[productType];

  // Preço exibido: usa desconto do cupom se válido, senão preço original
  const displayPrice = couponResult
    ? couponResult.discountedFormatted
    : priceInfo.formatted;
  const originalPrice = couponResult ? couponResult.originalFormatted : null;

  const hours   = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const secs    = secondsLeft % 60;
  const timeLabel = hours > 0
    ? `${hours}h ${String(minutes).padStart(2, '0')}m`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const expired = secondsLeft === 0 && step === 'pix-qr';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && canClose) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,15,15,0.98)',
          border: '1px solid rgba(212,175,55,0.20)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Nome Magnético</p>
            <p className="font-cinzel text-sm font-bold text-[#e5e2e1] mt-0.5">{productLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {originalPrice && (
                <p className="text-xs text-gray-600 line-through">{originalPrice}</p>
              )}
              <span className="font-cinzel text-lg font-bold text-[#D4AF37]">{displayPrice}</span>
            </div>
            {canClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5"
                aria-label="Fechar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-6">

          {/* ── Step: method ── */}
          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-5">
                Como prefere pagar?
              </p>

              {pixError && (
                <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-400 text-xs text-center">
                  {pixError}
                </div>
              )}

              {/* Cartão */}
              <button
                onClick={handleCard}
                className="w-full group flex items-center gap-4 bg-[#D4AF37] hover:bg-[#f2ca50] text-[#131313] rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-yellow-500/20"
              >
                <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Cartão de Crédito</p>
                  <p className="text-[11px] opacity-70 mt-0.5">Visa, Mastercard, Elo, Amex</p>
                </div>
                <svg className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* PIX */}
              {/* Logo PIX: Por Banco Central do Brasil (BACEN) — CC BY 3.0 https://www.bcb.gov.br/ */}
              <button
                onClick={handlePix}
                className="w-full group flex items-center gap-4 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/Logo_-_pix_powered_by_Banco_Central_(Brazil,_2020).png"
                    alt="PIX"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm text-[#e5e2e1]">PIX</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Aprovação instantânea · ~1 min</p>
                </div>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Cupom promocional */}
              <div className="space-y-2">
                {!showCoupon ? (
                  <div className="text-center">
                    <button
                      onClick={() => setShowCoupon(true)}
                      className="text-gray-600 hover:text-gray-400 text-[11px] underline underline-offset-2 transition-colors"
                    >
                      Tenho um código promocional
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponResult(null);
                          setCouponError('');
                        }}
                        onKeyDown={e => e.key === 'Enter' && validateCoupon()}
                        placeholder="Digite o código"
                        className="flex-1 bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-white/8 hover:bg-white/12 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponResult && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                        <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400 text-xs font-semibold">{couponResult.discountLabel}</span>
                        <span className="text-gray-400 text-xs">— {couponResult.promotionName}</span>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-red-400 text-xs text-center">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Rodapé segurança */}
              <div className="flex flex-col items-center gap-2.5 pt-1">
                <div className="flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-700 text-[11px]">Pagamento 100% seguro e criptografado</span>
                </div>
                {/* Logos dos meios de pagamento aceitos */}
                {/* PIX: Por Banco Central do Brasil (BACEN) — CC BY 3.0 https://www.bcb.gov.br/ */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-[11px] font-extrabold tracking-tight" style={{ color: '#635BFF' }}>stripe</span>
                  <span className="text-[10px] font-black tracking-widest text-white/35">VISA</span>
                  <svg viewBox="0 0 24 16" className="h-3.5 w-auto" aria-label="Mastercard">
                    <circle cx="8" cy="8" r="7" fill="#EB001B" opacity="0.65"/>
                    <circle cx="16" cy="8" r="7" fill="#F79E1B" opacity="0.65"/>
                  </svg>
                  <div className="bg-white/10 rounded px-1 py-0.5">
                    <img
                      src="/Logo_-_pix_powered_by_Banco_Central_(Brazil,_2020).png"
                      alt="PIX"
                      className="h-3.5 object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-white/35">G<span className="text-blue-400/70">Pay</span></span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step: card-loading ── */}
          {step === 'card-loading' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
              <p className="font-cinzel text-sm font-bold text-[#e5e2e1]">Redirecionando para o pagamento…</p>
              <p className="text-gray-600 text-xs">Você será levado ao Stripe em instantes.</p>
            </div>
          )}

          {/* ── Step: pix-loading ── */}
          {step === 'pix-loading' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
              <p className="font-cinzel text-sm font-bold text-[#e5e2e1]">Gerando seu QR Code PIX…</p>
              <p className="text-gray-600 text-xs">Aguarde alguns segundos.</p>
            </div>
          )}

          {/* ── Step: pix-qr ── */}
          {step === 'pix-qr' && pixData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-xl overflow-hidden bg-white p-2.5 shadow-lg shadow-black/30">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 block"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                {expired ? (
                  <p className="text-red-400 text-xs">QR Code expirado — feche e gere um novo.</p>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500 text-xs">Expira em</span>
                    <span className="text-[#D4AF37] text-xs font-mono font-semibold">{timeLabel}</span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 text-xs text-center">Ou use o código PIX Copia e Cola:</p>
                <div
                  className="bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
                  onClick={copyPix}
                >
                  {pixData.pixCopiaECola.slice(0, 56)}…
                </div>
                <button
                  onClick={copyPix}
                  disabled={expired}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#131313] text-xs font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-[#f2ca50] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
                >
                  {copied ? (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copiado!</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copiar código PIX</>
                  )}
                </button>
              </div>

              <div className="space-y-1 text-center pt-1">
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Após o pagamento, seu acesso é liberado automaticamente em até 1 minuto.
                </p>
                <p className="text-gray-700 text-[10px] leading-relaxed">
                  O beneficiário pode aparecer com o nome do MEI — isso é normal e seu pagamento está seguro.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: pix-success ── */}
          {step === 'pix-success' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <svg className="w-14 h-14 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-cinzel text-base font-bold text-[#D4AF37]">Pagamento confirmado!</p>
              <p className="text-gray-500 text-sm">Redirecionando para o app…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
