import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TesteResult {
  nome: string;
  arcanoRegente: number | null;
  quantidadeBloqueios: number;
  bloqueios: Array<{ codigo: string; titulo: string; descricao: string }>;
  numerosBasicos: { expressao: number; destino: number };
  temBloqueios: boolean;
  cta: { mensagem: string; url: string };
}

interface FormErrors {
  nome?: string;
  data?: string;
}

export function TesteBloqueio() {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TesteResult | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');

  function handleDataInput(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/[^\d/]/g, '');
    value = value.replace(/\//g, '');
    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    setData(value);
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!nome.trim() || nome.trim().length < 2) {
      errs.nome = 'Informe seu nome completo';
    }
    if (!data || !/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      errs.data = 'Data no formato DD/MM/AAAA';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    setApiError('');

    try {
      const response = await fetch('/api/teste-bloqueio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_completo: nome, data_nascimento: data }),
      });

      const data_result = await response.json();

      if (!response.ok) {
        setApiError(data_result.error ?? 'Erro ao processar análise');
        return;
      }

      setResult(data_result);
    } catch {
      setApiError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="teste" className="py-20 md:py-32 bg-[#111111]">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            Gratuito
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Teste Seu Nome Agora
          </h2>
          <p className="text-gray-400">
            Descubra em segundos se seu nome possui bloqueios energéticos.
          </p>
        </div>

        {/* Formulário */}
        {!result ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8 space-y-6"
          >
            <Input
              label="Nome Completo"
              placeholder="Seu nome completo de nascimento"
              value={nome}
              onChange={e => setNome(e.target.value)}
              error={errors.nome}
              required
            />
            <Input
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              value={data}
              onChange={handleDataInput}
              maxLength={10}
              error={errors.data}
              hint="Digite apenas os números"
              required
            />

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {apiError}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full text-lg py-4"
            >
              {loading ? 'Analisando...' : 'Analisar Meu Nome'}
            </Button>

            <p className="text-center text-gray-600 text-xs">
              Análise parcial gratuita. Sem cadastro necessário.
            </p>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Resultado */}
            <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="font-cinzel text-2xl font-bold text-[#D4AF37] mb-1">
                  {result.nome}
                </h3>
                <p className="text-gray-400 text-sm">Resultado da análise parcial</p>
              </div>

              {/* Números */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-black/30 rounded-xl p-3">
                  <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">
                    {result.numerosBasicos.expressao}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Expressão</div>
                </div>
                <div className="text-center bg-black/30 rounded-xl p-3">
                  <div className="font-cinzel text-2xl font-bold text-[#D4AF37]">
                    {result.numerosBasicos.destino}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Destino</div>
                </div>
                <div className="text-center bg-black/30 rounded-xl p-3">
                  <div className="font-cinzel text-2xl font-bold text-purple-400">
                    {result.arcanoRegente ?? '?'}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Arcano</div>
                </div>
              </div>

              {/* Bloqueios */}
              {result.temBloqueios ? (
                <div className="space-y-3">
                  <h4 className="font-cinzel text-sm font-bold text-red-400 uppercase tracking-wider">
                    ⚠ {result.quantidadeBloqueios} Bloqueio(s) Detectado(s)
                  </h4>
                  {result.bloqueios.map(b => (
                    <div key={b.codigo} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h5 className="font-bold text-red-400 text-sm mb-1">{b.titulo}</h5>
                      <p className="text-gray-400 text-sm">{b.descricao}</p>
                      <p className="text-gray-600 text-xs mt-2 italic">
                        A análise completa revela o caminho de transformação...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 text-2xl mb-2">✓</div>
                  <p className="text-emerald-400 font-medium">Sem bloqueios detectados!</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Sua análise completa revelará como potencializar ainda mais essa energia.
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center">
              <p className="text-gray-200 font-medium mb-2">{result.cta.mensagem}</p>
              <p className="text-gray-400 text-sm mb-5">
                A análise completa inclui: interpretação dos 5 números, guia de implementação e seu Nome Magnético personalizado.
              </p>
              <a
                href={result.cta.url}
                className="inline-block bg-[#D4AF37] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/20"
              >
                Ver Análise Completa →
              </a>
            </div>

            <button
              onClick={() => { setResult(null); setNome(''); setData(''); }}
              className="w-full text-gray-600 hover:text-gray-400 text-sm transition-colors py-2"
            >
              Testar outro nome
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
