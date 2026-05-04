import { useEffect, useState } from 'react';

interface PendingMessage {
  deliveryId: string;
  messageId: string;
  title: string;
  bodyMarkdown: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="text-[#D4AF37] underline underline-offset-4">$1</a>',
    );
}

function markdownToHtml(markdown: string): string {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        const items = lines
          .map((line) => `<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('');
        return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
      }

      return `<p>${inlineMarkdown(lines.join('<br />'))}</p>`;
    })
    .join('');
}

export default function ClientMessagePopup() {
  const [message, setMessage] = useState<PendingMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMessage() {
      try {
        const res = await fetch('/api/client-messages/pending', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.deliveryId) setMessage(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessage();
    return () => {
      cancelled = true;
    };
  }, []);

  async function dismiss() {
    const current = message;
    setMessage(null);
    if (!current) return;

    await fetch(`/api/client-messages/${current.deliveryId}/dismiss`, {
      method: 'POST',
      credentials: 'same-origin',
    });
  }

  if (loading || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-label="Fechar aviso"
        onClick={dismiss}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#111111] shadow-2xl shadow-black/60">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#D4AF37]/12 to-transparent pointer-events-none" />

        <button
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 text-gray-500 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
            <span className="text-2xl">!</span>
          </div>

          <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
            {message.title}
          </h2>

          <div
            className="space-y-4 text-sm leading-relaxed text-gray-300"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(message.bodyMarkdown) }}
          />

          <button
            onClick={dismiss}
            className="mt-7 w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#1A1A1A] transition-all duration-300 hover:bg-[#f2ca50] hover:scale-[1.01] active:scale-[0.99]"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
