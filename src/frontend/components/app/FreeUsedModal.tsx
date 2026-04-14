import React, { useState, useEffect } from 'react';

export default function FreeUsedModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Component only renders if query param is present (handled via Astro).
    // Anima a entrada.
    setIsOpen(true);
    
    // Limpa a URL params sem refresh para não recarregar a página
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-[#D4AF37]/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-5 border border-[#D4AF37]/20">
            <span className="text-3xl text-[#D4AF37]">✨</span>
          </div>
          
          <h2 className="font-cinzel text-2xl font-bold text-white mb-3">
            Análise Gratuita Concluída
          </h2>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Você já realizou o seu diagnóstico gratuito do nome de nascimento. Siga a sua jornada numerológica acessando seu relatório ou conhecendo o <strong>Nome Social Harmonizado</strong> para eliminar seus bloqueios.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 px-8 pb-8">
          
          <a
            href="/app/analises"
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-4 rounded-xl text-center transition-all duration-300"
          >
            Ver Relatório Gerado
          </a>

          <a
            href="/nome-social"
            className="w-full bg-[#d7c6ff]/10 hover:bg-[#d7c6ff]/15 border border-[#d7c6ff]/30 text-[#d7c6ff] font-medium py-3 px-4 rounded-xl text-center transition-all duration-300"
          >
            Saber mais sobre Nome Social
          </a>

          <a
            href="/api/create-checkout?product=nome_social"
            className="w-full bg-[#D4AF37] hover:bg-[#f2ca50] text-[#1A1A1A] font-bold py-3.5 px-4 rounded-xl text-center transition-all duration-300 shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02]"
          >
            Adquirir Nome Social
          </a>

        </div>
      </div>
    </div>
  );
}
