import React from 'react';

export function LandingFooter() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-cinzel text-xl font-bold text-[#D4AF37] mb-3">
              Nome Magnético
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Numerologia cabalística para transformar a vibração do seu nome
              e remover bloqueios energéticos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-300 font-medium mb-4 text-sm">Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Início</a></li>
              <li><a href="#como-funciona" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Como Funciona</a></li>
              <li><a href="#precos" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Preços</a></li>
              <li><a href="/app/suporte" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Suporte</a></li>
              <li><a href="/auth/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Entrar</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-300 font-medium mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacidade" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Política de Privacidade</a></li>
              <li><a href="/termos" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Termos de Uso</a></li>
              <li><a href="/reembolso" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Política de Reembolso</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Nome Magnético. Todos os direitos reservados.
            </p>
            <p className="text-gray-700 text-xs mt-1">
              Studio MLK — CNPJ 63.865.049/0001-27
            </p>
          </div>
          <p className="text-gray-700 text-xs">
            Numerologia cabalística — fins educacionais e de autoconhecimento.
          </p>
        </div>
      </div>
    </footer>
  );
}
