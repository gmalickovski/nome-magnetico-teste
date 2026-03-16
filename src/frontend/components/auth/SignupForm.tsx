import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabaseBrowser } from '../../lib/supabase-browser';

export function SignupForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    setLoading(true);

    const { error: err } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });

    if (err) {
      if (err.message === 'User already registered') {
        // Usuário já existe em auth.users (possivelmente via outro app na
        // mesma instância Supabase, ex: Sincro). Redirecionar para login.
        console.log('[SignupForm] email já existe em auth.users — redirecionando para login');
        window.location.href = '/auth/login?msg=conta-existente';
        return;
      }
      console.error('[SignupForm] erro no signUp:', err.message);
      setError(err.message);
      setLoading(false);
      return;
    }

    console.log('[SignupForm] cadastro bem-sucedido — aguardando confirmação de email');

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="font-cinzel text-2xl font-bold text-white mb-3">
          Verifique seu Email
        </h2>
        <p className="text-gray-400 mb-6">
          Enviamos um link de confirmação para <strong className="text-gray-200">{email}</strong>.
          Clique no link para ativar sua conta.
        </p>
        <a href="/auth/login" className="text-[#D4AF37] hover:underline text-sm">
          Voltar ao login
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8">
      <h2 className="font-cinzel text-2xl font-bold text-white text-center mb-6">
        Criar Conta
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nome"
          placeholder="Seu primeiro nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
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
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres"
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Criar Conta Grátis
        </Button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Já tem conta?{' '}
        <a href="/auth/login" className="text-[#D4AF37] hover:underline">
          Entrar
        </a>
      </p>
    </div>
  );
}
