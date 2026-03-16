import React from 'react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#111111]">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mb-8">
          <span className="text-[#D4AF37] text-xs">✦</span>
          <span className="text-[#D4AF37] text-sm font-medium">Numerologia Cabalística</span>
          <span className="text-[#D4AF37] text-xs">✦</span>
        </div>

        {/* Headline */}
        <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Seu Nome Carrega{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #E8C84A, #B8960E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bloqueios
          </span>
          {' '}Energéticos?
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          A numerologia cabalística revela como as vibrações do seu nome de nascimento
          podem estar limitando sua prosperidade, relacionamentos e realização pessoal.
          Descubra — e transforme — com seu <strong className="text-gray-200">Nome Magnético</strong>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#teste"
            className="w-full sm:w-auto bg-[#D4AF37] text-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-xl shadow-yellow-500/20"
          >
            Testar Meu Nome Grátis
          </a>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto border border-[#D4AF37]/50 text-[#D4AF37] font-medium text-lg px-8 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300"
          >
            Como Funciona
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">2.847</div>
            <div>análises realizadas</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">97%</div>
            <div>de satisfação</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">30</div>
            <div>dias de acesso</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-[#D4AF37]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
