import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TocItem { id: string; text: string; }

export function TOCSidebar({ items }: { items: TocItem[] }) {
  const navRef    = useRef<HTMLElement>(null);
  const [showTop, setShowTop]       = useState(false);
  const [showBot, setShowBot]       = useState(false);
  const [activeId, setActiveId]     = useState('');

  // ── Detecta se há conteúdo acima / abaixo ─────────────────────────────────
  const checkScroll = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const threshold = 12; // px de tolerância
    setShowTop(nav.scrollTop > threshold);
    setShowBot(nav.scrollTop < nav.scrollHeight - nav.clientHeight - threshold);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // Verifica após render (itens carregados podem mudar o scrollHeight)
    const raf = requestAnimationFrame(checkScroll);
    nav.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      nav.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, items]);

  // ── Destacar seção ativa ao rolar o artigo ────────────────────────────────
  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  // ── Rola o índice ao clicar nas setas ─────────────────────────────────────
  function scrollUp()   { navRef.current?.scrollBy({ top: -110, behavior: 'smooth' }); }
  function scrollDown() { navRef.current?.scrollBy({ top:  110, behavior: 'smooth' }); }

  if (!items.length) return null;

  return (
    <div
      className="sticky top-24 flex flex-col gap-0"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Título */}
      <p className="flex-shrink-0 text-gray-600 text-xs font-medium uppercase tracking-widest mb-3">
        Neste artigo
      </p>

      {/* ── Seta SUPERIOR ─────────────────────────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 flex justify-center overflow-hidden
          transition-all duration-500 ease-in-out
          ${showTop ? 'max-h-7 opacity-100 mb-1' : 'max-h-0 opacity-0'}
        `}
        aria-hidden={!showTop}
      >
        <button
          onClick={scrollUp}
          title="Rolar índice para cima"
          aria-label="Rolar índice para cima"
          className="group flex items-center justify-center w-full h-6 text-[#D4AF37]/40
                     hover:text-[#D4AF37]/80 transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 toc-arrow-up"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* ── Lista de itens ────────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="toc-nav flex-1 overflow-y-auto space-y-0.5 mr-2"
        aria-label="Índice do artigo"
      >
        {items.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`
              block text-xs leading-relaxed py-1.5
              border-l-2 pl-3
              transition-all duration-200 line-clamp-2
              ${activeId === item.id
                ? 'text-[#D4AF37] border-[#D4AF37]/50 font-semibold'
                : 'text-gray-500 border-white/5 hover:text-[#D4AF37] hover:border-[#D4AF37]/35'
              }
            `}
          >
            {item.text}
          </a>
        ))}
      </nav>

      {/* ── Seta INFERIOR ─────────────────────────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 flex justify-center overflow-hidden
          transition-all duration-500 ease-in-out
          ${showBot ? 'max-h-7 opacity-100 mt-1' : 'max-h-0 opacity-0'}
        `}
        aria-hidden={!showBot}
      >
        <button
          onClick={scrollDown}
          title="Rolar índice para baixo"
          aria-label="Rolar índice para baixo"
          className="group flex items-center justify-center w-full h-6 text-[#D4AF37]/40
                     hover:text-[#D4AF37]/80 transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 toc-arrow-down"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
