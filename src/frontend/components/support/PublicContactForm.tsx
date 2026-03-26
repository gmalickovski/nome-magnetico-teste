import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ToastContainer, useToast } from '../ui/Toast';

const SUBJECT_OPTIONS = [
  'Dúvida sobre os planos',
  'Como funciona a numerologia',
  'Informações gerais',
  'Parceria ou imprensa',
  'Outros',
];

export function PublicContactForm() {
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const isValid =
    form.nome.trim() !== '' &&
    form.email.trim() !== '' &&
    form.assunto !== '' &&
    form.mensagem.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          assunto: form.assunto,
          mensagem: form.mensagem.trim(),
        }),
      });

      if (res.ok) {
        setSent(true);
        addToast('Mensagem enviada! Retornaremos em até 24 horas.', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error ?? 'Erro ao enviar. Tente novamente.', 'error');
      }
    } catch {
      addToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-cinzel text-2xl font-bold text-white mb-3">Dúvida enviada!</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          Recebemos sua mensagem e responderemos em até 24 horas úteis no email informado.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setForm({ nome: '', email: '', assunto: '', mensagem: '' });
          }}
          className="mt-8 text-sm text-[#D4AF37] hover:underline"
        >
          Enviar outra dúvida
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#D4AF37] mb-2">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Seu nome completo"
              className="w-full bg-[#111111] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent
                placeholder-gray-600 transition-colors hover:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#D4AF37] mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              className="w-full bg-[#111111] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent
                placeholder-gray-600 transition-colors hover:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#D4AF37] mb-2">
            Assunto <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              title="Selecione o assunto"
              value={form.assunto}
              onChange={e => setForm(prev => ({ ...prev, assunto: e.target.value }))}
              className="w-full appearance-none bg-[#111111] border border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent
                transition-colors hover:border-gray-600"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em',
              }}
            >
              <option value="" disabled>Selecione um assunto</option>
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#D4AF37] mb-2">
            Mensagem <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.mensagem}
            onChange={e => setForm(prev => ({ ...prev, mensagem: e.target.value }))}
            placeholder="Como podemos ajudar? Descreva sua dúvida com detalhes..."
            rows={5}
            className="w-full bg-[#111111] border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent
              placeholder-gray-600 transition-colors hover:border-gray-600"
          />
          {form.mensagem.length > 0 && form.mensagem.length < 10 && (
            <p className="text-xs text-red-400 mt-1">Mínimo de 10 caracteres</p>
          )}
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!isValid || loading}
          className={`w-full py-3 ${!isValid ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          {loading ? 'Enviando...' : 'Enviar Dúvida'}
        </Button>
      </form>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
