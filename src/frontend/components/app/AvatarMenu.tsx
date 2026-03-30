import React, { useState, useRef, useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase-browser';

interface AvatarMenuProps {
  nome: string;
}

export default function AvatarMenu({ nome }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = nome ? nome.charAt(0).toUpperCase() : 'U';

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    document.cookie = 'nome-magnetico-auth-access-token=; path=/; max-age=0';
    document.cookie = 'nome-magnetico-auth-refresh-token=; path=/; max-age=0';
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.reset();
    }
    window.location.href = '/auth/login';
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111111] border border-[#D4AF37]/50 text-[#D4AF37] font-cinzel font-bold text-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:scale-105 transition-all duration-300 focus:outline-none"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#D4AF37]/20 shadow-xl shadow-black/50 z-50 transform origin-top-right transition-all duration-200">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-[#D4AF37]/10 mb-2">
              <p className="text-sm text-gray-400 truncate">Olá, {nome || 'Usuário'}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#D4AF37]/10 hover:text-red-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
