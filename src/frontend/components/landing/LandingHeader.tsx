import React, { useState, useEffect } from 'react';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#111111]/90 backdrop-blur-md border-b border-[#D4AF37]/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-cinzel text-xl font-bold text-[#D4AF37] tracking-wider">
          Nome Magnético
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
            Como Funciona
          </a>
          <a href="#teste" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
            Teste Grátis
          </a>
          <a href="#precos" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
            Preços
          </a>
          <a href="/auth/login" className="text-gray-400 hover:text-gray-200 transition-colors text-sm">
            Entrar
          </a>
          <a
            href="/comprar"
            className="bg-[#D4AF37] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/20"
          >
            Começar Agora
          </a>
        </nav>

        {/* Menu mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white p-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile aberto */}
      {menuOpen && (
        <div className="md:hidden bg-[#111111]/95 backdrop-blur-md border-t border-[#D4AF37]/20 px-4 py-6 space-y-4">
          <a href="#como-funciona" className="block text-gray-400 hover:text-[#D4AF37] py-2" onClick={() => setMenuOpen(false)}>Como Funciona</a>
          <a href="#teste" className="block text-gray-400 hover:text-[#D4AF37] py-2" onClick={() => setMenuOpen(false)}>Teste Grátis</a>
          <a href="#precos" className="block text-gray-400 hover:text-[#D4AF37] py-2" onClick={() => setMenuOpen(false)}>Preços</a>
          <a href="/auth/login" className="block text-gray-400 hover:text-gray-200 py-2">Entrar</a>
          <a href="/comprar" className="block bg-[#D4AF37] text-black font-bold text-center py-3 rounded-xl hover:bg-yellow-300 transition-colors">
            Começar Agora
          </a>
        </div>
      )}
    </header>
  );
}
