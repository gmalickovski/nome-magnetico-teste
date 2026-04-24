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
  const [couponCode, setCouponCode]   = useState('');
  const [showCoupon, setShowCoupon]   = useState(false);

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  async function handlePix() {
    setStep('pix-loading');
    setPixError('');
    try {
      const res = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType }),
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
    const appliesToThis = !promotion?.productType || promotion.productType === productType;
    const effectiveCoupon = couponCode.trim() || (promotion && appliesToThis ? promotion.stripePromoCode : undefined) || undefined;
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
  const priceLabel   = priceInfo.formatted;

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
            <span className="font-cinzel text-lg font-bold text-[#D4AF37]">{priceLabel}</span>
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
              <button
                onClick={handlePix}
                className="w-full group flex items-center gap-4 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl px-5 py-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  {/* Ícone PIX */}
                  <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.2 369.2C359.7 389.7 389.5 394.4 414.9 384.9L470.9 440.9C485.3 455.3 485.3 478.7 470.9 493.1C456.5 507.5 433.1 507.5 418.7 493.1L363.2 437.6C341.9 446.9 317.4 444.8 298.1 430.6L241.7 374.3C236.3 368.9 236.3 359.6 241.7 354.2L242.4 292.5zM444.3 98.7C451.9 94.09 461.7 95.17 468.1 101.6L411.4 158.3C395.8 173.9 395.8 199.5 411.4 215.1L452.8 256.5C468.4 272.1 494 272.1 509.6 256.5C525.1 240.9 525.1 215.4 509.6 199.8L469.5 159.7C462.5 152.7 462.5 141.3 469.5 134.3C476.5 127.3 487.9 127.3 494.9 134.3L535 174.4C568.5 207.9 568.5 262.3 535 295.8L492.9 337.9C459.4 371.4 405 371.4 371.5 337.9L330.1 296.5C296.6 263 296.6 208.6 330.1 175.1L372.2 133C395.8 109.4 431.2 102.7 461.4 116.7C465.8 118.7 469.8 121.4 473.4 124.7L444.3 98.7z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm text-[#e5e2e1]">PIX</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Aprovação instantânea · ~1 min</p>
                </div>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Promoção ativa */}
              {promotion && (!promotion.productType || promotion.productType === productType) && (
                <div className="flex items-center justify-center gap-2 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl px-3 py-2">
                  <span className="text-[#D4AF37] text-xs font-semibold">🎉 {promotion.name} — desconto aplicado!</span>
                </div>
              )}

              {/* Cupom promocional */}
              <div className="text-center">
                {!showCoupon ? (
                  <button
                    onClick={() => setShowCoupon(true)}
                    className="text-gray-600 hover:text-gray-400 text-[11px] underline underline-offset-2 transition-colors"
                  >
                    Tenho um código promocional
                  </button>
                ) : (
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 transition-colors text-center"
                    autoFocus
                  />
                )}
              </div>

              {/* Rodapé segurança */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-gray-700 text-[11px]">Pagamento 100% seguro e criptografado</span>
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
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-xl overflow-hidden bg-white p-2.5 shadow-lg shadow-black/30">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 block"
                  />
                </div>
              </div>

              {/* Timer */}
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

              {/* Copia e cola */}
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

              {/* Avisos */}
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
