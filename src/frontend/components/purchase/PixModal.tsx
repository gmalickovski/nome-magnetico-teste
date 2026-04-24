import { useState, useEffect, useRef } from 'react';

const PRODUCT_LABELS: Record<string, { name: string; price: string }> = {
  nome_social:  { name: 'Nome Social',      price: 'R$ 97,00'  },
  nome_bebe:    { name: 'Nome de Bebê',     price: 'R$ 127,00' },
  nome_empresa: { name: 'Nome Empresarial', price: 'R$ 77,00'  },
};

interface Props {
  productType: string;
  pixCopiaECola: string;
  qrCodeImage: string;
  expiresAt: string;
  chargeId: string;
  onClose: () => void;
}

export function PixModal({ productType, pixCopiaECola, qrCodeImage, expiresAt, chargeId, onClose }: Props) {
  const product = PRODUCT_LABELS[productType] ?? { name: 'Produto', price: '' };
  const [copied, setCopied]     = useState(false);
  const [paid, setPaid]         = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const exp = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((exp - Date.now()) / 1000));
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Polling para detectar pagamento
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-pix-status?chargeId=${encodeURIComponent(chargeId)}`);
        const data = await res.json() as { paid: boolean };
        if (data.paid) {
          setPaid(true);
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setTimeout(() => {
            window.location.href = `/app?checkout=success&produto=${productType}`;
          }, 1500);
        }
      } catch {
        // Silencioso — continua tentando
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chargeId, productType]);

  function copyPix() {
    navigator.clipboard.writeText(pixCopiaECola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const hours   = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const expiredTimer = secondsLeft === 0;
  const timeLabel = hours > 0
    ? `${hours}h ${String(minutes).padStart(2, '0')}m`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(17,17,17,0.97)',
          border: '1px solid rgba(212,175,55,0.22)',
          boxShadow: '0 28px 72px rgba(0,0,0,0.75)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
            </svg>
            <span className="font-cinzel text-sm font-bold text-[#D4AF37]">Pagar com PIX</span>
          </div>
          {!paid && (
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

        <div className="px-5 py-5 space-y-5">
          {/* Sucesso */}
          {paid && (
            <div className="text-center py-4 space-y-2">
              <svg className="w-12 h-12 text-[#D4AF37] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-cinzel text-base font-bold text-[#D4AF37]">Pagamento confirmado!</p>
              <p className="text-gray-400 text-sm">Redirecionando para o app…</p>
            </div>
          )}

          {!paid && (
            <>
              {/* Produto + valor */}
              <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Nome Magnético</p>
                  <p className="text-sm font-semibold text-[#e5e2e1] mt-0.5">{product.name}</p>
                </div>
                <span className="font-cinzel text-lg font-bold text-[#D4AF37]">{product.price}</span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-xl overflow-hidden bg-white p-2.5">
                  <img
                    src={`data:image/png;base64,${qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 block"
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                {expiredTimer ? (
                  <p className="text-red-400 text-xs text-center">
                    QR Code expirado — feche e gere um novo.
                  </p>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-500 text-xs">Expira em </span>
                    <span className="text-[#D4AF37] text-xs font-mono font-semibold">{timeLabel}</span>
                  </>
                )}
              </div>

              {/* Copia e cola */}
              <div className="space-y-2">
                <p className="text-gray-600 text-xs text-center">Ou copie o código abaixo:</p>
                <div
                  className="bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
                  onClick={copyPix}
                  title="Clique para copiar"
                >
                  {pixCopiaECola.slice(0, 60)}…
                </div>
                <button
                  onClick={copyPix}
                  disabled={expiredTimer}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#131313] text-xs font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-[#f2ca50] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar código PIX
                    </>
                  )}
                </button>
              </div>

              {/* Instrução + aviso beneficiário */}
              <div className="space-y-1.5 text-center">
                <p className="text-gray-600 text-xs leading-relaxed">
                  Após o pagamento, seu acesso é liberado automaticamente em até 1 minuto.
                </p>
                <p className="text-gray-700 text-[11px] leading-relaxed">
                  O beneficiário pode aparecer com o nome do MEI — isso é normal e seu pagamento está seguro. ✦
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
