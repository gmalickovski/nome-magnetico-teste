import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { label: 'Todos os artigos', slug: '' },
  { label: 'Numerologia', slug: 'numerologia' },
  { label: 'Bloqueios Energéticos', slug: 'bloqueios' },
  { label: 'Nome Social', slug: 'nome-social' },
  { label: 'Nome para Bebê', slug: 'nome-bebe' },
  { label: 'Nome Empresarial', slug: 'nome-empresa' },
  { label: 'Espiritualidade', slug: 'espiritualidade' },
];

interface Props {
  activeCategory?: string;
}

export function BlogHeader({ activeCategory = '' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const activeCatLabel = CATEGORIES.find(c => c.slug === activeCategory)?.label;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#111111]/95 backdrop-blur-md border-b border-[#D4AF37]/15 py-3'
          : 'bg-[#111111]/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <a
          href="/blog"
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <span className="font-cinzel text-sm font-bold text-[#D4AF37] tracking-wider group-hover:opacity-80 transition-opacity">
            NOME MAGNÉTICO
          </span>
          <span className="text-[#D4AF37]/30 text-sm" aria-hidden="true">·</span>
          <span className="font-cinzel text-sm font-bold text-[#e5e2e1] group-hover:text-[#D4AF37] transition-colors tracking-wide">
            Blog
          </span>
        </a>

        {/* ── Nav desktop ── */}
        <nav className="hidden md:flex items-center gap-2 ml-auto">

          {/* Dropdown Categorias */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                catOpen || activeCategory
                  ? 'bg-[#D4AF37]/12 text-[#D4AF37] border border-[#D4AF37]/25'
                  : 'text-gray-400 hover:text-[#e5e2e1] hover:bg-white/6 border border-transparent'
              }`}
              aria-expanded={catOpen}
            >
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
              </svg>
              {activeCategory && activeCatLabel ? activeCatLabel : 'Categorias'}
              <svg
                className={`w-3 h-3 opacity-50 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] border border-[#D4AF37]/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden py-1.5 z-50">
                {CATEGORIES.map(cat => (
                  <a
                    key={cat.slug}
                    href={cat.slug ? `/blog?categoria=${cat.slug}` : '/blog'}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      activeCategory === cat.slug
                        ? 'text-[#D4AF37] bg-[#D4AF37]/8'
                        : 'text-gray-400 hover:text-[#e5e2e1] hover:bg-white/5'
                    }`}
                    onClick={() => setCatOpen(false)}
                  >
                    {cat.label}
                    {activeCategory === cat.slug && (
                      <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Separador */}
          <span className="w-px h-4 bg-white/10" aria-hidden="true" />

          {/* Análise Gratuita */}
          <a
            href="/calcular-numero"
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#1A1A1A] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#f2ca50] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Análise Gratuita
          </a>

          {/* Home */}
          <a
            href="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#e5e2e1] text-xs font-medium px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
            title="Voltar ao site principal"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
        </nav>

        {/* ── Mobile toggle ── */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden text-[#D4AF37] hover:text-[#f2ca50] transition-colors flex-shrink-0"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {menuOpen && (
        <div className="md:hidden bg-[#111111]/98 border-t border-[#D4AF37]/12 px-4 py-5 space-y-4">

          {/* Botões principais */}
          <div className="flex gap-3">
            <a
              href="/calcular-numero"
              className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] text-[#1A1A1A] font-semibold text-sm py-3 rounded-xl hover:bg-[#f2ca50] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Análise Gratuita
            </a>
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-gray-400 text-sm py-3 px-4 rounded-xl border border-white/10 hover:border-[#D4AF37]/25 hover:text-[#D4AF37] transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a>
          </div>

          {/* Categorias */}
          <div>
            <p className="text-gray-700 text-xs font-medium uppercase tracking-widest mb-2.5">Categorias</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <a
                  key={cat.slug}
                  href={cat.slug ? `/blog?categoria=${cat.slug}` : '/blog'}
                  className={`text-xs font-medium px-3 py-2.5 rounded-xl text-center transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25'
                      : 'bg-white/4 text-gray-400 hover:text-[#D4AF37] border border-white/5'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
