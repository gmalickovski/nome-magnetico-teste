import React, { useState, useEffect, useRef } from 'react';
import { track } from '../../lib/analytics';

interface Props {
  analysisId: string;
  productType: string;
  isFree?: boolean;
  fabOnly?: boolean;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function PDFFeedbackButton({ analysisId, productType, isFree = false, fabOnly = false }: Props) {
  const [modalOpen, setModalOpen]       = useState(false);
  const [status, setStatus]             = useState<Status>('idle');
  const [elapsed, setElapsed]           = useState(0);
  const [rating, setRating]             = useState(0);
  const [hover, setHover]               = useState(0);
  const [comment, setComment]           = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const fabRef       = useRef<HTMLButtonElement | null>(null);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opacidade do FAB ao rolar / interagir (só na instância fabOnly)
  useEffect(() => {
    if (!fabOnly) return;
    const btn = fabRef.current;
    if (!btn) return;

    const fade = () => {
      btn.style.opacity = '0.3';
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
      restoreTimer.current = setTimeout(() => { btn.style.opacity = '1'; }, 800);
    };

    ['scroll', 'touchstart', 'touchmove'].forEach(ev =>
      window.addEventListener(ev, fade, { passive: true }),
    );
    return () => {
      ['scroll', 'touchstart', 'touchmove'].forEach(ev =>
        window.removeEventListener(ev, fade),
      );
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
    };
  }, [fabOnly]);

  // Timer de segundos decorridos durante o loading
  useEffect(() => {
    if (status === 'loading') {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  // Modal permanece aberto após concluir — usuário fecha manualmente

  // Reseta estado ao fechar
  function closeModal() {
    setModalOpen(false);
    setTimeout(() => {
      if (status !== 'loading') {
        setStatus('idle');
        setElapsed(0);
        setRating(0);
        setComment('');
        setFeedbackSent(false);
        setFeedbackError(false);
      }
    }, 300);
  }

  async function handleDownload() {
    setModalOpen(true);
    setStatus('loading');
    setFeedbackSent(false);
    setFeedbackError(false);

    try {
      const res = await fetch(`/api/generate-pdf?id=${analysisId}`);
      if (!res.ok) throw new Error('pdf_error');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      const label = productType === 'analise-gratuita' ? 'analise-gratuita' : productType;
      a.download = `analise-${label}-nome-magnetico.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('done');
      track('pdf_downloaded', { produto: productType as never });
    } catch {
      setStatus('error');
    }
  }

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!rating && !comment.trim()) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id:  analysisId || undefined,
          product_type: productType,
          is_free:      isFree,
          rating:       rating || undefined,
          comment:      comment.trim() || undefined,
        }),
      });
      setFeedbackSent(true);
    } catch {
      setFeedbackError(true);
    }
  }

  const downloadIcon = (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  return (
    <>
      {/* ── Botão desktop (omitido quando fabOnly) ── */}
      {!fabOnly && (
        <button
          onClick={handleDownload}
          className="hidden md:inline-flex items-center gap-2 bg-[#D4AF37] text-[#131313] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-[0_2px_16px_rgba(212,175,55,0.35)] hover:bg-[#f2ca50] hover:shadow-[0_4px_24px_rgba(212,175,55,0.5)] active:scale-95 transition-all duration-300"
        >
          {downloadIcon}
          Baixar Análise
        </button>
      )}

      {/* ── FAB mobile ── */}
      <button
        ref={fabRef}
        onClick={handleDownload}
        className="md:hidden fixed bottom-[116px] left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 bg-[#D4AF37] text-[#131313] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full shadow-[0_4px_24px_rgba(212,175,55,0.4)] hover:bg-[#f2ca50] hover:shadow-[0_4px_32px_rgba(212,175,55,0.55)] active:scale-95 transition-all duration-300"
        style={{ opacity: 1, transition: 'opacity 0.4s ease, background-color 0.3s, box-shadow 0.3s, transform 0.1s' }}
        id="pdf-download-btn"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Baixar Análise
      </button>

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && status !== 'loading') closeModal(); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{
              background: 'rgba(17,17,17,0.96)',
              border: '1px solid rgba(212,175,55,0.20)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            }}
          >
            {/* ── Status: loading / done / error ── */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {status === 'loading' && (
                  <svg className="w-8 h-8 text-[#D4AF37] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {status === 'done' && (
                  <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {status === 'error' && (
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                {status === 'loading' && (
                  <>
                    <p className="font-cinzel text-sm font-bold text-[#e5e2e1]">Preparando seu documento…</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {elapsed < 3 ? 'Iniciando geração do PDF' : elapsed < 10 ? 'Montando as seções da análise' : 'Quase lá, finalizando…'}
                      {' '}<span className="text-gray-700">({elapsed}s)</span>
                    </p>
                  </>
                )}
                {status === 'done' && (
                  <>
                    <p className="font-cinzel text-sm font-bold text-[#D4AF37]">Documento pronto!</p>
                    <p className="text-gray-500 text-xs mt-0.5">Download iniciado automaticamente.</p>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <p className="font-cinzel text-sm font-bold text-red-400">Erro ao gerar PDF</p>
                    <p className="text-gray-500 text-xs mt-0.5">Tente novamente ou entre em contato com o suporte.</p>
                  </>
                )}
              </div>
              {status === 'loading' ? (
                <div className="w-7 h-7 flex-shrink-0" aria-hidden="true" />
              ) : (
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5"
                  aria-label="Fechar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* ── Divider ── */}
            {status !== 'error' && (
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent" />
            )}

            {/* ── Formulário de feedback ── */}
            {status !== 'error' && !feedbackSent && (
              <form onSubmit={handleFeedback} className="space-y-4">
                <div>
                  <p className="text-[#e5e2e1] text-xs font-semibold uppercase tracking-widest mb-1">
                    Enquanto isso, nos diga o que achou
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Sua opinião nos ajuda a melhorar as análises e a experiência da plataforma.
                  </p>
                </div>

                {/* Estrelas */}
                <div className="flex items-center gap-1" role="group" aria-label="Avaliação de 1 a 5 estrelas">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="p-0.5 transition-transform duration-150 hover:scale-110"
                      aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                    >
                      <svg
                        className="w-6 h-6 transition-colors duration-150"
                        fill={(hover || rating) >= star ? '#D4AF37' : 'none'}
                        stroke={(hover || rating) >= star ? '#D4AF37' : '#4b4b4b'}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-[#D4AF37] text-xs ml-1 font-medium">
                      {['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente!'][rating]}
                    </span>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Deixe um comentário ou sugestão (opcional)…"
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-[#e5e2e1] placeholder-gray-600 resize-none focus:outline-none focus:border-[#D4AF37]/40 transition-colors duration-200"
                />

                <button
                  type="submit"
                  disabled={!rating && !comment.trim()}
                  className="w-full border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xl hover:bg-[#D4AF37]/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Enviar feedback
                </button>
              </form>
            )}

            {/* ── Feedback enviado ── */}
            {feedbackSent && (
              <div className="text-center py-2 space-y-1">
                <p className="text-[#D4AF37] text-sm font-semibold">Obrigado pelo feedback! ✦</p>
                <p className="text-gray-600 text-xs">Sua opinião é muito importante para nós.</p>
              </div>
            )}

            {/* ── Erro ao enviar feedback ── */}
            {feedbackError && (
              <p className="text-red-400 text-xs text-center">Não foi possível enviar o feedback agora.</p>
            )}

            {/* ── Botão fechar (aparece após PDF pronto) ── */}
            {status === 'done' && (
              <button
                onClick={closeModal}
                className="w-full text-gray-500 hover:text-gray-300 text-xs py-2 transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
