import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabaseBrowser } from '../../lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos'
        : err.message);
      setLoading(false);
      return;
    }

    // Redirecionar para o app ou para onde veio
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get('redirect') ?? '/app';
  }

  return (
    <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8">
      <h2 className="font-cinzel text-2xl font-bold text-white text-center mb-6">
        Entrar
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <a href="/auth/esqueci-senha" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">
            Esqueci minha senha
          </a>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Não tem conta?{' '}
        <a href="/auth/cadastro" className="text-[#D4AF37] hover:underline">
          Cadastre-se
        </a>
      </p>
    </div>
  );
}
