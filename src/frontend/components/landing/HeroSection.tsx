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
          <span className="text-[#D4AF37] text-sm font-medium">Numerologia Cabalística Premium</span>
          <span className="text-[#D4AF37] text-xs">✦</span>
        </div>

        {/* Super Headline */}
        <p className="text-[#D4AF37] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
          A MATEMÁTICA DO SEU DESTINO
        </p>

        {/* Headline */}
        <h1 className="font-cinzel text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          O Seu Nome <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #E8C84A, #B8960E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Define a Sua Realidade
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Tudo no universo é número e vibração. Descubra como a matemática da Cabala revela os bloqueios invisíveis da sua vida, desperta seu Arquétipo adormecido e como o nome certo alinha sua Expressão ao seu verdadeiro Destino.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="#teste"
            className="w-full sm:w-auto bg-[#D4AF37] text-[#1A1A1A] font-medium text-lg px-8 py-4 rounded-xl hover:bg-[#f2ca50] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#D4AF37]/20"
          >
            Quero Descobrir a Força do Meu Nome
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#D4AF37]/80 uppercase tracking-wider font-semibold mb-10">
          <span>✓ Análise Profunda via IA</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ 4 Triângulos Numéricos</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Relatório Premium em PDF</span>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">3</div>
            <div>produtos disponíveis</div>
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
