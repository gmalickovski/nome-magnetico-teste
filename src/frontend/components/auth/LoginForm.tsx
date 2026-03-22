import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabaseBrowser } from '../../lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('msg') === 'conta-existente') {
      setInfoMsg('Use seu email e senha para entrar.');
    } else if (params.get('msg') === 'sem-acesso') {
      setInfoMsg('Este email não está cadastrado no Nome Magnético. Crie uma conta para começar.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: signInData, error: err } = await supabaseBrowser.auth.signInWithPassword({
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

    // Verificar isolamento de app: usuário deve ter a tag 'nome_magnetico'
    // em app_metadata.apps (escrito via service role no cadastro).
    const apps = signInData.user?.app_metadata?.apps as string[] | undefined;
    if (apps !== undefined && !apps.includes('nome_magnetico')) {
      await supabaseBrowser.auth.signOut();
      setError('Este email não está cadastrado no Nome Magnético. Crie uma conta para começar.');
      setLoading(false);
      return;
    }

    // Garantir que o usuário tem perfil neste app (necessário para usuários
    // que já existiam em auth.users via outro app, ex: Sincro).
    // Passa o token no header porque a sessão fica em localStorage (não em cookie).
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    console.log('[LoginForm] sessão obtida após login:', session ? `token=${session.access_token.slice(0, 20)}...` : 'null');

    const epRes = await fetch('/api/auth/ensure-profile', {
      method: 'POST',
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });
    const epData = await epRes.json();
    console.log('[LoginForm] ensure-profile status:', epRes.status, epData);

    // Admin bypassa o fluxo de compra
    if (epData?.profile?.role === 'admin') {
      if (session) {
        document.cookie = `nome-magnetico-auth-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `nome-magnetico-auth-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      }
      window.location.href = '/app';
      return;
    }

    // Setar cookies para que o middleware SSR encontre o token
    if (session) {
      document.cookie = `nome-magnetico-auth-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `nome-magnetico-auth-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }

    // Redirecionar: produto tem prioridade (vindo do funil landing → cadastro → login)
    const searchParams = new URLSearchParams(window.location.search);
    const produto = searchParams.get('produto');
    window.location.href = produto
      ? `/comprar?produto=${produto}`
      : (searchParams.get('redirect') ?? '/app');
  }

  return (
    <div className="glass border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl shadow-black/50">
      <h2 className="font-cinzel text-2xl font-bold text-white text-center mb-6">
        Entrar
      </h2>

      {infoMsg && (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-3 text-[#D4AF37] text-sm mb-6">
          {infoMsg}
        </div>
      )}

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
