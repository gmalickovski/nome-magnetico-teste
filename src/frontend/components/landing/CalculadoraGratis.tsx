import React, { useState } from 'react';
import { track } from '../../lib/analytics';

interface CalcResult {
  nome_primeiro: string;
  numero_expressao: number;
  numero_destino: number;
  arcano_nome: string | null;
  interpretacao_basica: string;
  cta_url: string;
}

function formatDate(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function CalculadoraGratis() {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CalcResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/calcular-numero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_completo: nome.trim(), data_nascimento: data }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Erro ao calcular. Tente novamente.');
        setLoading(false);
        return;
      }

      setResult(json as CalcResult);
      track('calculadora_submit', { origem: document.referrer || 'direto' });
    } catch {
      setError('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="animate-fade-in">
        {/* Resultado */}
        <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-8 mb-6 shadow-xl shadow-black/40">
          <div className="text-center mb-8">
            <p className="text-[#D4AF37] text-xs font-medium tracking-widest uppercase mb-2">Resultado</p>
            <h3 className="font-cinzel text-2xl font-bold text-white mb-1">
              {result.nome_primeiro}
            </h3>
            <p className="text-gray-500 text-sm">Análise parcial do nome</p>
          </div>

          {/* Números */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/30 rounded-xl p-5 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Número de Expressão</p>
              <p className="font-cinzel text-4xl font-bold text-[#D4AF37]">{result.numero_expressao}</p>
              {result.arcano_nome && (
                <p className="text-gray-400 text-xs mt-1">{result.arcano_nome}</p>
              )}
            </div>
            <div className="bg-black/30 rounded-xl p-5 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Número de Destino</p>
              <p className="font-cinzel text-4xl font-bold text-[#D4AF37]">{result.numero_destino}</p>
              <p className="text-gray-400 text-xs mt-1">Data de nascimento</p>
            </div>
          </div>

          {/* Interpretação */}
          <div className="mb-8">
            <p className="text-gray-300 text-sm leading-relaxed">{result.interpretacao_basica}</p>
          </div>

          {/* Teaser */}
          <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl p-5 mb-6">
            <p className="text-[#D4AF37] text-xs font-medium uppercase tracking-widest mb-2">Análise incompleta</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Seu nome carrega padrões mais profundos que esses dois números. A análise completa revela os{' '}
              <strong className="text-white">4 Triângulos Cabalísticos</strong>, os{' '}
              <strong className="text-white">bloqueios energéticos</strong> presentes em cada dimensão do seu nome, suas{' '}
              <strong className="text-white">Lições Kármicas</strong> e as{' '}
              <strong className="text-white">3 variações do seu nome</strong> já harmonizadas — impossível de calcular manualmente.
            </p>
          </div>

          <a
            href={result.cta_url}
            className="block w-full text-center bg-[#D4AF37] text-[#1A1A1A] font-bold py-4 rounded-xl hover:bg-[#f2ca50] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20 text-base"
          >
            Ver Minha Análise Completa →
          </a>
        </div>

        {/* Recalcular */}
        <button
          onClick={() => { setResult(null); setNome(''); setData(''); }}
          className="w-full text-center text-gray-600 hover:text-gray-400 text-sm transition-colors py-2"
        >
          Calcular outro nome
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-[#76746a] font-medium uppercase tracking-widest mb-2">
          Nome Completo de Nascimento
        </label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Ex: Maria Aparecida Santos"
          required
          minLength={2}
          maxLength={100}
          className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm"
        />
        <p className="text-gray-600 text-xs mt-1.5">Use o nome exatamente como registrado em cartório</p>
      </div>

      <div>
        <label className="block text-xs text-[#76746a] font-medium uppercase tracking-widest mb-2">
          Data de Nascimento
        </label>
        <input
          type="text"
          value={data}
          onChange={e => setData(formatDate(e.target.value))}
          placeholder="DD/MM/AAAA"
          required
          maxLength={10}
          className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm font-mono"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || nome.trim().length < 2 || data.length < 10}
        className="w-full bg-[#D4AF37] text-[#1A1A1A] font-bold py-4 rounded-xl hover:bg-[#f2ca50] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-[#D4AF37]/20 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculando...
          </span>
        ) : (
          'Calcular Meu Número de Expressão'
        )}
      </button>

      <p className="text-center text-gray-600 text-xs">
        Gratuito · Sem cadastro · Resultado imediato
      </p>
    </form>
  );
}
