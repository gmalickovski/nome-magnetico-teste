import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { label: 'Todos', slug: '' },
  { label: 'Numerologia', slug: 'numerologia' },
  { label: 'Bloqueios', slug: 'bloqueios' },
  { label: 'Nome Social', slug: 'nome-social' },
  { label: 'Nome Bebê', slug: 'nome-bebe' },
  { label: 'Empresarial', slug: 'nome-empresa' },
  { label: 'Espiritualidade', slug: 'espiritualidade' },
];

interface Props {
  activeCategory?: string;
}

export function BlogHeader({ activeCategory = '' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#111111]/95 backdrop-blur-md border-b border-[#D4AF37]/15 py-3'
          : 'bg-[#111111]/85 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Linha principal */}
        <div className="flex items-center justify-between">
          {/* Logo + Blog */}
          <div className="flex items-center gap-2 min-w-0">
            <a
              href="/"
              className="font-cinzel text-sm font-bold text-[#D4AF37] tracking-wider hover:opacity-75 transition-opacity whitespace-nowrap"
            >
              NOME MAGNÉTICO
            </a>
            <span className="text-[#D4AF37]/30 text-sm" aria-hidden="true">·</span>
            <a
              href="/blog"
              className="font-cinzel text-sm font-bold text-[#e5e2e1] hover:text-[#D4AF37] transition-colors tracking-wide whitespace-nowrap"
            >
              Blog
            </a>
          </div>

          {/* Categorias — desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-4" aria-label="Categorias do blog">
            {CATEGORIES.map(cat => (
              <a
                key={cat.slug}
                href={cat.slug ? `/blog?categoria=${cat.slug}` : '/blog'}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                    : 'text-gray-500 hover:text-[#e5e2e1] hover:bg-white/5'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </nav>

          {/* CTAs direita — desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="/calcular-numero"
              className="text-[#D4AF37] text-xs font-medium hover:text-[#f2ca50] transition-colors whitespace-nowrap"
            >
              Teste de Bloqueios Grátis →
            </a>
            <span className="text-white/10 text-sm">|</span>
            <a
              href="/"
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors whitespace-nowrap"
            >
              Site Principal
            </a>
          </div>

          {/* Toggle mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-[#D4AF37] hover:text-[#f2ca50] transition-colors ml-2 flex-shrink-0"
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

        {/* Menu mobile expandido */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/8 pt-3 mt-3 pb-1">
            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <a
                  key={cat.slug}
                  href={cat.slug ? `/blog?categoria=${cat.slug}` : '/blog'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'bg-white/5 text-gray-400 hover:text-[#D4AF37]'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </a>
              ))}
            </div>
            {/* Links */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <a
                href="/calcular-numero"
                className="text-[#D4AF37] text-xs font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Teste de Bloqueios Grátis →
              </a>
              <a
                href="/"
                className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Site Principal
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
