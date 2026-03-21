import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase-browser';

type State = 'loading' | 'success' | 'error' | 'no-token';

export function EmailConfirmation() {
  const [state, setState] = useState<State>('loading');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get('token_hash');

    if (!token_hash) {
      setState('no-token');
      return;
    }

    supabaseBrowser.auth
      .verifyOtp({ token_hash, type: 'email' })
      .then(({ error }) => {
        if (error) {
          console.error('[EmailConfirmation]', error.message);
          setState('error');
        } else {
          setState('success');
        }
      });
  }, []);

  useEffect(() => {
    if (state !== 'success') return;
    if (countdown <= 0) {
      window.location.href = '/auth/login';
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  if (state === 'loading') {
    return (
      <div className="text-center">
        <div className="mb-6 text-5xl">⏳</div>
        <h1 className="font-cinzel text-2xl font-bold text-[#D4AF37] mb-3">
          Confirmando...
        </h1>
        <p className="text-gray-400">Verificando seu email, aguarde um momento.</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="text-center">
        <div className="mb-6 text-5xl">✅</div>
        <h1 className="font-cinzel text-2xl font-bold text-[#D4AF37] mb-3">
          Email confirmado!
        </h1>
        <p className="text-gray-300 mb-2">
          Sua conta está ativa e pronta para uso.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Redirecionando para o login em{' '}
          <span className="text-[#D4AF37] font-semibold">{countdown}s</span>...
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-[#D4AF37] text-[#111111] font-bold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity duration-300 tracking-wide"
        >
          FAZER LOGIN AGORA
        </a>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center">
        <div className="mb-6 text-5xl">❌</div>
        <h1 className="font-cinzel text-2xl font-bold text-[#D4AF37] mb-3">
          Link inválido
        </h1>
        <p className="text-gray-400 mb-2">
          Este link de confirmação expirou ou já foi utilizado.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Crie uma nova conta para receber um novo link de confirmação.
        </p>
        <a
          href="/auth/cadastro"
          className="inline-block border border-[#D4AF37] text-[#D4AF37] font-bold text-sm px-8 py-3 rounded-xl hover:bg-[#D4AF37] hover:text-[#111111] transition-all duration-300 tracking-wide"
        >
          CRIAR NOVA CONTA
        </a>
      </div>
    );
  }

  // no-token: usuário chegou na página sem token (ex: após o cadastro, antes de confirmar)
  return (
    <div className="text-center">
      <div className="mb-6 text-5xl">📧</div>
      <h1 className="font-cinzel text-2xl font-bold text-[#D4AF37] mb-3">
        Verifique seu email
      </h1>
      <p className="text-gray-300 mb-2">
        Enviamos um link de confirmação para o seu email.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Clique no link no email para ativar sua conta. Verifique também a pasta
        de spam.
      </p>
      <a
        href="/auth/login"
        className="text-[#D4AF37] hover:underline text-sm"
      >
        Já confirmei, ir para o login →
      </a>
    </div>
  );
}
