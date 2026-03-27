import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedReply?: string;
}

interface SupportAiPanelProps {
  ticketId: string;
}

const QUICK_ACTIONS = [
  { label: 'Sugerir resposta', prompt: 'Analise este ticket e sugira uma resposta completa e profissional para enviar ao cliente.' },
  { label: 'Resumir ticket', prompt: 'Faça um resumo conciso do problema do cliente e o que foi discutido até agora.' },
  { label: 'Buscar nas FAQs', prompt: 'Existe alguma resposta nas FAQs que cubra a dúvida deste cliente? Se sim, adapte para uma resposta personalizada.' },
  { label: 'Diagnóstico', prompt: 'Com base no histórico, qual é a causa mais provável do problema e quais passos recomenda para resolver?' },
];

export function SupportAiPanel({ ticketId }: SupportAiPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/support/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          message:   text,
          history:   messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Erro: ${data.error ?? 'Falha ao conectar com o assistente.'}`,
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role:             'assistant',
        content:          data.reply,
        suggestedReply:   data.suggestedTicketReply,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: '❌ Erro de conexão. Verifique sua rede e tente novamente.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function useThisReply(text: string) {
    // Dispara evento customizado para preencher o textarea de resposta do ticket
    window.dispatchEvent(new CustomEvent('fill-reply', { detail: text }));
  }

  function renderMessage(msg: Message, idx: number) {
    const isUser = msg.role === 'user';

    // Renderizar markdown básico: **bold**, *italic*, blocos de código
    function renderContent(text: string) {
      const parts = text.split(/(📝 \*\*RESPOSTA SUGERIDA:\*\*\s*---[\s\S]*?---)/g);
      return parts.map((part, i) => {
        const sugMatch = part.match(/📝 \*\*RESPOSTA SUGERIDA:\*\*\s*---\s*([\s\S]*?)\s*---/);
        if (sugMatch) {
          return (
            <div key={i} className="mt-3 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
              <p className="text-[#D4AF37] text-xs font-medium mb-2">📝 Resposta sugerida</p>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{sugMatch[1]}</p>
            </div>
          );
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      });
    }

    return (
      <div key={idx} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs">🤖</span>
          </div>
        )}
        <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/20 text-gray-200'
            : 'bg-white/5 border border-white/10 text-gray-300'
        }`}>
          {renderContent(msg.content)}
          {msg.suggestedReply && (
            <button
              onClick={() => useThisReply(msg.suggestedReply!)}
              className="mt-2 w-full text-xs px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-medium hover:bg-[#f2ca50] transition-colors"
            >
              Usar esta resposta →
            </button>
          )}
        </div>
        {isUser && (
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs">👤</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/3 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
        <span className="text-sm font-medium text-gray-300">Assistente Claude</span>
      </div>

      {/* Ações rápidas (exibe só quando não há mensagens) */}
      {messages.length === 0 && (
        <div className="px-3 pt-3 pb-2 space-y-1.5">
          <p className="text-xs text-gray-500 mb-2">Ações rápidas:</p>
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
              className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Thread de mensagens */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-white/10">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao assistente... (Enter para enviar)"
            rows={2}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 resize-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            →
          </button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mt-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Limpar conversa
          </button>
        )}
      </div>
    </div>
  );
}
