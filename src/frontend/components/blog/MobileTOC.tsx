import React, { useState, useEffect, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
}

interface Props {
  items: TocItem[];
}

export function MobileTOC({ items }: Props) {
  const [open, setOpen]           = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [activeId, setActiveId]   = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Marca no sessionStorage que o usuário já interagiu (botão fica opaco)
  useEffect(() => {
    const seen = sessionStorage.getItem('toc-seen');
    if (seen) setInteracted(true);
  }, []);

  // IntersectionObserver para highlight do item ativo
  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
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

  // Fecha ao clicar fora do drawer
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function handleOpen() {
    setOpen(true);
    if (!interacted) {
      setInteracted(true);
      sessionStorage.setItem('toc-seen', '1');
    }
  }

  function handleLinkClick() {
    setOpen(false);
  }

  if (!items.length) return null;

  return (
    <>
      {/* ── Botão flutuante ────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        aria-label="Ver índice do artigo"
        title="Índice do artigo"
        className={`
          lg:hidden fixed bottom-20 right-4 z-40
          flex items-center justify-center w-10 h-10 rounded-full
          bg-[#1a1a1a] border border-[#D4AF37]/25
          shadow-[0_8px_24px_rgba(0,0,0,0.5)]
          transition-all duration-700
          hover:border-[#D4AF37]/50 hover:bg-[#222]
          active:scale-95
          ${interacted ? 'opacity-40 hover:opacity-90' : 'opacity-90'}
        `}
      >
        {/* Ícone de lista/índice */}
        <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M4 6h16M4 10h10M4 14h12M4 18h8" />
        </svg>
      </button>

      {/* ── Overlay ────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* ── Drawer bottom sheet ─────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Índice do artigo"
        aria-modal="true"
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-50
          bg-[#161616] rounded-t-3xl
          shadow-[0_-20px_60px_rgba(0,0,0,0.7)]
          transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? 'translate-y-0' : 'translate-y-full'}
          max-h-[72vh] flex flex-col
        `}
      >
        {/* Handle de arrasto visual */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Cabeçalho */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3">
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
            Neste Artigo
          </p>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-gray-300 p-1 -mr-1 transition-colors"
            aria-label="Fechar índice"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de itens — com scroll independente */}
        <nav className="flex-1 overflow-y-auto px-5 pb-8 space-y-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={handleLinkClick}
              className={`
                flex items-start gap-3 py-3 text-sm leading-snug
                border-l-2 pl-3 transition-all duration-200
                ${activeId === item.id
                  ? 'text-[#D4AF37] border-[#D4AF37]/60 font-medium'
                  : 'text-gray-400 border-white/8 hover:text-[#e5e2e1] hover:border-white/25'
                }
              `}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
