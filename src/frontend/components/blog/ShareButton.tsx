import React, { useState } from 'react';

interface Props {
  title: string;
  description?: string;
  url?: string;
}

export function ShareButton({ title, description = '', url }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  async function handleShare() {
    const shareData = {
      title,
      text: description,
      url: shareUrl,
    };

    // Web Share API — abre a sheet nativa do dispositivo (WhatsApp, Instagram, etc.)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // Usuário cancelou — não é erro real
        if ((err as DOMException).name !== 'AbortError') {
          fallbackCopy();
        }
      }
    } else {
      // Fallback desktop: copia o link
      fallbackCopy();
    }
  }

  async function fallbackCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Navegadores muito antigos
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
          shared || copied
            ? 'border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/8'
            : 'border-white/15 text-gray-500 hover:border-[#D4AF37]/35 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
        }`}
        title="Compartilhar artigo"
        aria-label="Compartilhar este artigo"
      >
        {shared ? (
          /* Ícone de check — compartilhou */
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : copied ? (
          /* Ícone de link copiado */
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          /* Ícone clássico de compartilhamento */
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
        <span>
          {shared ? 'Compartilhado!' : copied ? 'Link copiado!' : 'Compartilhar'}
        </span>
      </button>
    </div>
  );
}
