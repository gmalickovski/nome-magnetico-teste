import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabaseBrowser } from '../../lib/supabase-browser';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    const { error: err } = await supabaseBrowser.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => { window.location.href = '/app'; }, 2000);
  }

  if (success) {
    return (
      <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-cinzel text-2xl font-bold text-white mb-3">Senha Redefinida</h2>
        <p className="text-gray-400">Redirecionando para o app...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8">
      <h2 className="font-cinzel text-2xl font-bold text-white text-center mb-6">
        Nova Senha
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nova Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          hint="Mínimo de 8 caracteres"
        />
        <Input
          label="Confirmar Senha"
          type="password"
          placeholder="Repita a nova senha"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Redefinir Senha
        </Button>
      </form>
    </div>
  );
}
