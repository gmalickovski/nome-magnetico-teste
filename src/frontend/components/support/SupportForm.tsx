import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ToastContainer, useToast } from '../ui/Toast';

interface SupportFormProps {
  userEmail?: string;
  userName?: string;
}

interface FormState {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  tipo_dispositivo: string;
  versao_app: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  assunto?: string;
  mensagem?: string;
}

export function SupportForm({ userEmail = '', userName = '' }: SupportFormProps) {
  const [form, setForm] = useState<FormState>({
    nome: userName,
    email: userEmail,
    assunto: '',
    mensagem: '',
    tipo_dispositivo: '',
    versao_app: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 2) errs.nome = 'Nome obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email inválido';
    if (!form.assunto.trim() || form.assunto.trim().length < 3) errs.assunto = 'Assunto obrigatório';
    if (!form.mensagem.trim() || form.mensagem.trim().length < 10)
      errs.mensagem = 'Descreva o problema com pelo menos 10 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        assunto: form.assunto.trim(),
        mensagem: form.mensagem.trim(),
      };
      if (form.tipo_dispositivo.trim()) payload.tipo_dispositivo = form.tipo_dispositivo.trim();
      if (form.versao_app.trim()) payload.versao_app = form.versao_app.trim();

      const res = await fetch('/api/support/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSent(true);
        addToast('Mensagem enviada! Responderemos em breve.', 'success');
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

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  }

  if (sent) {
    return (
      <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-cinzel text-xl font-bold text-white mb-2">Mensagem enviada!</h3>
        <p className="text-gray-400 text-sm">
          Nossa equipe responderá em até 24 horas no email <strong className="text-gray-300">{form.email}</strong>.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setForm({ nome: userName, email: userEmail, assunto: '', mensagem: '', tipo_dispositivo: '', versao_app: '' });
          }}
          className="mt-6 text-sm text-[#D4AF37] hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">📋</div>
          <div>
            <h3 className="font-cinzel text-lg font-bold text-white">Abrir Ticket</h3>
            <p className="text-gray-500 text-xs">Resposta em até 24h</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={form.nome}
            onChange={setField('nome')}
            error={errors.nome}
            placeholder="Seu nome"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="seu@email.com"
            required
          />
        </div>

        <Input
          label="Assunto"
          value={form.assunto}
          onChange={setField('assunto')}
          error={errors.assunto}
          placeholder="Descreva brevemente o problema"
          required
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-yellow-400 mb-2">
            Mensagem <span className="text-red-400 ml-1">*</span>
          </label>
          <textarea
            value={form.mensagem}
            onChange={setField('mensagem')}
            placeholder="Descreva seu problema com detalhes..."
            rows={4}
            className={`w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-white resize-none
              focus:outline-none focus:ring-2 focus:border-transparent
              transition duration-300 placeholder-gray-500
              ${errors.mensagem
                ? 'border-red-500/70 focus:ring-red-500/50'
                : 'border-gray-700 focus:ring-[#D4AF37]/50 hover:border-gray-600'
              }`}
          />
          {errors.mensagem && (
            <p className="mt-1.5 text-xs text-red-400">{errors.mensagem}</p>
          )}
        </div>

        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors select-none">
            Informações técnicas (opcional)
          </summary>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <Input
              label="Tipo de dispositivo"
              value={form.tipo_dispositivo}
              onChange={setField('tipo_dispositivo')}
              placeholder="Ex: iPhone 15 / iOS 17"
            />
            <Input
              label="Versão do app"
              value={form.versao_app}
              onChange={setField('versao_app')}
              placeholder="Ex: 1.2.0"
            />
          </div>
        </details>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
