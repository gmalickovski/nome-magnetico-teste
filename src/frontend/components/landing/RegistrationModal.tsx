import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  nomeCompleto: string;
  dataNascimento: string;
  prefilledEmail: string;
  redirectUrl?: string;
  onClose: () => void;
}

function firstName(nome: string) {
  return nome.trim().split(/\s+/)[0] || nome.trim();
}

export function RegistrationModal({
  open,
  nomeCompleto,
  dataNascimento,
  prefilledEmail,
  redirectUrl = '/app?gen_free_pdf=1',
  onClose,
}: Props) {
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    if (open) setEmail(prefilledEmail);
  }, [open, prefilledEmail]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNeedsConfirmation(false);

    if (!email.trim()) {
      setError('Informe seu e-mail para receber e acessar o PDF.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          nome_completo: nomeCompleto.trim(),
          data_nascimento: dataNascimento,
        }),
      }).catch(() => {});

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: firstName(nomeCompleto),
          email: email.trim(),
          password,
          redirect: redirectUrl,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'already_registered') {
          window.location.href = `/auth/login?email=${encodeURIComponent(email.trim())}&redirect=${encodeURIComponent(redirectUrl)}&msg=conta-existente`;
          return;
        }
        if (data.error === 'email_pending_confirmation') {
          setError('Este e-mail já está cadastrado e aguarda confirmação. Reenviamos o link para sua caixa de entrada.');
          return;
        }
        throw new Error(data.error ?? 'Erro ao criar conta.');
      }

      if (data.session?.access_token && data.session?.refresh_token) {
        document.cookie = `nome-magnetico-auth-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `nome-magnetico-auth-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        window.location.href = redirectUrl;
        return;
      }

      setNeedsConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">PDF gratuito</p>
            <h2 className="font-cinzel text-2xl font-bold text-[#e5e2e1]">Concluir e baixar</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Crie seu acesso para gerar o PDF do nome de nascimento e manter seu relatório salvo no painel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
            aria-label="Fechar"
          >
            x
          </button>
        </div>

        {needsConfirmation ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Sua conta foi criada. Enviamos um link de confirmação para <strong>{email}</strong>. Se a sessão imediata estiver ativa no Supabase, basta acessar o painel; caso contrário, confirme o e-mail para ativar a conta.
            <a href={`/auth/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectUrl)}`} className="mt-4 block font-bold text-[#D4AF37] hover:underline">
              Já confirmei, entrar aqui
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-[#e5e2e1] outline-none transition focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/40"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-[#e5e2e1] outline-none transition focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/40"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#D4AF37] px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-[#f2ca50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Criando acesso...' : 'Criar conta e baixar análise'}
            </button>
          </form>
        )}

        <a
          href={`/auth/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectUrl)}`}
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-slate-950/40 px-5 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
        >
          Já tenho uma conta
        </a>
      </div>
    </div>
  );
}
