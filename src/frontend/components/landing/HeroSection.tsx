import React from 'react';

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#111111]"
      aria-label="Seção principal — Nome Magnético"
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 pb-16">
        {/* Badge de posicionamento */}
        <div
          className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mb-8"
          role="note"
          aria-label="Categoria do produto"
        >
          <span className="text-[#D4AF37] text-xs" aria-hidden="true">✦</span>
          <span className="text-[#D4AF37] text-sm font-medium">Método Nome Magnético — Numerologia Cabalística</span>
          <span className="text-[#D4AF37] text-xs" aria-hidden="true">✦</span>
        </div>

        {/* Super Headline — keyword SEO + gancho emocional */}
        <p className="text-[#D4AF37] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
          Branding Pessoal com Fundamento Vibracional
        </p>

        {/* H1 Headline principal */}
        <h1 className="font-cinzel text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          O Seu Nome Vibra.{' '}
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #E8C84A, #B8960E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            A Questão É: Para Quê?
          </span>
        </h1>

        {/* Subheadline — foco no resultado, não no processo */}
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-4 leading-relaxed font-light">
          Cada letra do seu nome de nascimento carrega uma frequência matemática. Na numerologia cabalística, quando essas frequências colidem, surgem bloqueios invisíveis que sabotam sua carreira, seus relacionamentos e sua prosperidade.
        </p>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          O <strong className="text-[#D4AF37]">Método Nome Magnético</strong> usa análise vibracional avançada para revelar esses bloqueios e encontrar a variação do seu nome que <em>alinha sua Expressão ao seu Destino</em> — com precisão matemática impossível de fazer manualmente.
        </p>

        {/* CTA Principal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="#teste"
            id="cta-hero-principal"
            className="w-full sm:w-auto bg-[#D4AF37] text-[#1A1A1A] font-semibold text-lg px-8 py-4 rounded-xl hover:bg-[#f2ca50] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#D4AF37]/20"
            aria-label="Descobrir a frequência do meu nome gratuitamente"
          >
            Descobrir a Frequência do Meu Nome →
          </a>
        </div>

        {/* Micro-copy de confiança */}
        <p className="text-gray-600 text-sm mb-8">
          Teste gratuito · Sem cadastro · Resultado imediato
        </p>

        {/* Trust Indicators atualizados */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#D4AF37]/80 uppercase tracking-wider font-semibold mb-10"
          aria-label="Diferenciais do produto"
        >
          <span>✓ Mapa Numerológico Completo</span>
          <span className="hidden sm:inline" aria-hidden="true">•</span>
          <span>✓ 4 Triângulos Cabalísticos</span>
          <span className="hidden sm:inline" aria-hidden="true">•</span>
          <span>✓ Método Cabalístico com Precisão Analítica</span>
          <span className="hidden sm:inline" aria-hidden="true">•</span>
          <span>✓ Relatório em PDF para Download</span>
        </div>

        {/* Social proof com números reais */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500" role="list" aria-label="Indicadores de qualidade">
          <div className="text-center" role="listitem">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]" aria-label="3 produtos de análise">3</div>
            <div>produtos de análise</div>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />
          <div className="text-center" role="listitem">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]" aria-label="97% de satisfação">97%</div>
            <div>de satisfação</div>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />
          <div className="text-center" role="listitem">
            <div className="font-cinzel text-2xl font-bold text-[#D4AF37]" aria-label="30 dias de acesso completo">30</div>
            <div>dias de acesso completo</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg className="w-6 h-6 text-[#D4AF37]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
