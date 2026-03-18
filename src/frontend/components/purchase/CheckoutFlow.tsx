import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

type ProductType = 'nome_magnetico' | 'nome_bebe' | 'nome_empresa';

interface Props {
  productType: ProductType;
  isLoggedIn: boolean;
  isOwned: boolean;
}

const PRODUCT_NAMES: Record<ProductType, string> = {
  nome_magnetico: 'Nome Social',
  nome_bebe: 'Nome de Bebê',
  nome_empresa: 'Nome Empresarial',
};

const PRODUCT_ICONS: Record<ProductType, string> = {
  nome_magnetico: '✨',
  nome_bebe: '👶',
  nome_empresa: '🏢',
};

const PRODUCT_DESCRIPTIONS: Record<ProductType, string> = {
  nome_magnetico: 'Análise completa do seu nome com os 4 triângulos cabalísticos, lições kármics e sugestões de nome sem bloqueios.',
  nome_bebe: 'Encontre o nome ideal para seu filho — sem bloqueios, compatível com o sobrenome da família e alinhado ao destino do bebê.',
  nome_empresa: 'Avalie nomes de empresa pela compatibilidade com o Destino do fundador e da data de fundação.',
};

const PRODUCT_PRICES: Record<ProductType, string> = {
  nome_magnetico: 'R$ 97,00',
  nome_bebe: 'R$ 77,00',
  nome_empresa: 'R$ 127,00',
};

const PRODUCT_BENEFITS: Record<ProductType, string[]> = {
  nome_magnetico: [
    '4 triângulos numerológicos completos',
    'Detecção de bloqueios energéticos',
    'Lições kármics e tendências ocultas',
    'Sugestões de nome sem bloqueios',
    'Guia de implementação da assinatura',
    'Acesso por 30 dias',
  ],
  nome_bebe: [
    'Ranking de compatibilidade dos nomes candidatos',
    'Análise de bloqueios por candidato',
    'Compatibilidade com sobrenome da família',
    'Alinhamento com o Destino do bebê',
    'Acesso por 30 dias',
  ],
  nome_empresa: [
    'Análise de compatibilidade com o Destino do fundador',
    'Verificação da data de fundação',
    'Score 0–100 por candidato',
    'Acesso por 30 dias',
  ],
};

type State = 'idle' | 'confirm' | 'loading' | 'error' | 'owned';

export function CheckoutFlow({ productType, isLoggedIn, isOwned }: Props) {
  const [state, setState] = useState<State>(() => {
    if (!isLoggedIn) return 'idle';
    if (isOwned) return 'owned';
    return 'confirm';
  });
  const [errorMsg, setErrorMsg] = useState('');

  async function triggerCheckout() {
    setState('loading');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Erro ao criar sessão');
      }
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento';
      setErrorMsg(msg);
      setState('error');
    }
  }

  function handleWantProduct() {
    window.location.href = `/auth/cadastro?produto=${productType}`;
  }

  if (state === 'idle') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-5">{PRODUCT_ICONS[productType]}</div>
            <h1 className="font-cinzel text-2xl font-bold text-white mb-2">
              {PRODUCT_NAMES[productType]}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {PRODUCT_DESCRIPTIONS[productType]}
            </p>
            <Button onClick={handleWantProduct} className="w-full">
              Quero este produto
            </Button>
            <p className="text-gray-500 text-xs mt-4">
              Você será direcionado para criar sua conta
            </p>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem conta?{' '}
            <a
              href={`/auth/login?redirect=/comprar?produto=${productType}`}
              className="text-[#D4AF37] hover:underline"
            >
              Entrar
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (state === 'confirm') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{PRODUCT_ICONS[productType]}</div>
              <h1 className="font-cinzel text-2xl font-bold text-white mb-2">
                {PRODUCT_NAMES[productType]}
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                {PRODUCT_DESCRIPTIONS[productType]}
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {PRODUCT_BENEFITS[productType].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-[#D4AF37] flex-shrink-0">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-5 mb-6 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Investimento único</p>
              <p className="font-cinzel text-3xl font-bold text-[#D4AF37]">
                {PRODUCT_PRICES[productType]}
              </p>
            </div>

            <Button onClick={triggerCheckout} className="w-full">
              Pagar {PRODUCT_PRICES[productType]}
            </Button>
            <p className="text-gray-500 text-xs text-center mt-3">
              Pagamento seguro via Stripe
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6" />
          <p className="font-cinzel text-lg text-white mb-2">Preparando checkout...</p>
          <p className="text-gray-400 text-sm">Você será redirecionado para o Stripe em instantes.</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-cinzel text-xl font-bold text-white mb-3">Algo deu errado</h2>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <Button onClick={() => setState('confirm')} className="w-full">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // owned
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">{PRODUCT_ICONS[productType]}</div>
          <h2 className="font-cinzel text-2xl font-bold text-white mb-3">
            Produto Ativo
          </h2>
          <p className="text-gray-300 mb-2">
            Você já possui o produto{' '}
            <strong className="text-[#D4AF37]">{PRODUCT_NAMES[productType]}</strong>{' '}
            ativo em sua conta.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Acesse o app para começar sua análise.
          </p>
          <Button
            onClick={() => { window.location.href = '/app'; }}
            className="w-full"
          >
            Prosseguir para o App
          </Button>
        </div>
      </div>
    </div>
  );
}
