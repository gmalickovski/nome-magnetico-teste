import React, { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase-browser';
import { DateInput } from '../ui/DateInput';

interface AvatarMenuProps {
  nome: string;
}

type ProfileForm = {
  nome: string;
  email: string;
  phone: string;
  birth_name: string;
  birth_date: string;
  gender: string;
};

const EMPTY_PROFILE: ProfileForm = {
  nome: '',
  email: '',
  phone: '',
  birth_name: '',
  birth_date: '',
  gender: '',
};

export default function AvatarMenu({ nome }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(EMPTY_PROFILE);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile.nome || nome || 'Usuario';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadProfile() {
    setError('');
    try {
      const res = await fetch('/api/user/save-base-profile');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar cadastro.');
      setProfile({ ...EMPTY_PROFILE, ...data.profile });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cadastro.');
    }
  }

  async function openSettings() {
    setIsOpen(false);
    setSettingsOpen(true);
    setMessage('');
    setError('');
    await loadProfile();
  }

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    document.cookie = 'nome-magnetico-auth-access-token=; path=/; max-age=0';
    document.cookie = 'nome-magnetico-auth-refresh-token=; path=/; max-age=0';
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.reset();
    }
    window.location.href = '/auth/login';
  };

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/user/save-base-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: profile.nome, phone: profile.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar cadastro.');
      setMessage('Cadastro atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cadastro.');
    } finally {
      setLoading(false);
    }
  }

  async function saveBirthData(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/user/save-base-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_name: profile.birth_name,
          birth_date: profile.birth_date,
          gender: profile.gender || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar dados de analise.');
      setMessage('Dados de analise atualizados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados de analise.');
    } finally {
      setLoading(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
      if (password !== passwordConfirm) throw new Error('As senhas nao coincidem.');

      const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
      if (updateError) throw updateError;

      setPassword('');
      setPasswordConfirm('');
      setMessage('Senha atualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#111111] font-cinzel text-lg font-bold text-[#D4AF37] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] focus:outline-none"
        aria-label="Abrir menu da conta"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl border border-[#D4AF37]/20 bg-[#1a1a1a]/95 shadow-xl shadow-black/50 backdrop-blur-xl">
          <div className="p-2">
            <div className="mb-1 border-b border-[#D4AF37]/10 px-3 py-3">
              <p className="truncate text-sm text-gray-400">Ola, {displayName}</p>
              {profile.email && <p className="mt-1 truncate text-xs text-gray-600">{profile.email}</p>}
            </div>

            <button
              type="button"
              onClick={openSettings}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              <span className="text-[#D4AF37]">⚙</span>
              Configuracoes
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-[#D4AF37]/20 bg-[#151515] p-5 shadow-2xl shadow-black/60 sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">Conta</p>
                <h2 className="mt-1 font-cinzel text-2xl font-bold text-[#e5e2e1]">Configuracoes</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-white/5 hover:text-[#e5e2e1]"
                aria-label="Fechar configuracoes"
              >
                x
              </button>
            </div>

            {(message || error) && (
              <div className={`mb-5 rounded-2xl p-3 text-sm ring-1 ${error ? 'bg-red-500/10 text-red-300 ring-red-500/25' : 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25'}`}>
                {error || message}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <form onSubmit={saveAccount} className="rounded-2xl bg-[#202020]/80 p-4 ring-1 ring-white/10">
                <h3 className="mb-4 font-cinzel text-lg font-bold text-[#D4AF37]">Dados de cadastro</h3>
                <label className="mb-2 block text-sm font-medium text-gray-300">Nome</label>
                <input
                  value={profile.nome}
                  onChange={e => setProfile(prev => ({ ...prev, nome: e.target.value }))}
                  className="input-dark mb-4 w-full"
                  required
                />
                <label className="mb-2 block text-sm font-medium text-gray-300">Telefone</label>
                <input
                  value={profile.phone}
                  onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-dark mb-4 w-full"
                  placeholder="Opcional"
                />
                <label className="mb-2 block text-sm font-medium text-gray-500">E-mail</label>
                <input value={profile.email} className="input-dark mb-5 w-full opacity-70" disabled />
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                  Salvar cadastro
                </button>
              </form>

              <form onSubmit={saveBirthData} className="rounded-2xl bg-[#202020]/80 p-4 ring-1 ring-[#D4AF37]/15">
                <h3 className="mb-4 font-cinzel text-lg font-bold text-[#D4AF37]">Dados de analise</h3>
                <label className="mb-2 block text-sm font-medium text-gray-300">Nome completo de nascimento</label>
                <input
                  value={profile.birth_name}
                  onChange={e => setProfile(prev => ({ ...prev, birth_name: e.target.value }))}
                  className="input-dark mb-4 w-full"
                  required
                />
                <label className="mb-2 block text-sm font-medium text-gray-300">Data de nascimento</label>
                <DateInput
                  value={profile.birth_date}
                  onChangeValue={value => setProfile(prev => ({ ...prev, birth_date: value }))}
                  className="input-dark mb-4 w-full"
                  required
                />
                <label className="mb-2 block text-sm font-medium text-gray-300">Genero</label>
                <select
                  value={profile.gender}
                  onChange={e => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  className="input-dark mb-5 w-full"
                >
                  <option value="">Nao informar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Neutro">Neutro</option>
                </select>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                  Salvar dados de analise
                </button>
              </form>
            </div>

            <form onSubmit={savePassword} className="mt-4 rounded-2xl bg-[#202020]/80 p-4 ring-1 ring-white/10">
              <h3 className="mb-4 font-cinzel text-lg font-bold text-[#D4AF37]">Alterar senha</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Nova senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dark w-full"
                    placeholder="Minimo 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Confirmar senha</label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    className="input-dark w-full"
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="mt-5 rounded-full border border-[#D4AF37]/50 px-5 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37]/10 disabled:opacity-60">
                Atualizar senha
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
