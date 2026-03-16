/**
 * TriangleVisualization — exibe os 4 triângulos numerológicos com abas.
 * Recebe dados serializados via props (vindos do servidor Astro).
 */

import { useState } from 'react';

interface Bloqueio {
  codigo: string;
  titulo: string;
  descricao: string;
  aspectoSaude: string;
  triangulos: string[];
}

interface TrianguloData {
  tipo: string;
  linhas: number[][];
  arcanoRegente: number | null;
  arcanosDoMinantes: number[];
  sequenciasNegativas: string[];
}

interface Props {
  vida: TrianguloData;
  pessoal: TrianguloData;
  social: TrianguloData;
  destino: TrianguloData;
  bloqueios: Bloqueio[];
}

const TIPO_LABEL: Record<string, { label: string; descricao: string; emoji: string }> = {
  vida:    { label: 'Triângulo da Vida',    descricao: 'Aspectos gerais da vida e padrões de existência',   emoji: '🔺' },
  pessoal: { label: 'Triângulo Pessoal',    descricao: 'Vida íntima, reações internas e sentimentos',        emoji: '💛' },
  social:  { label: 'Triângulo Social',     descricao: 'Influências externas e como o mundo te percebe',     emoji: '🌐' },
  destino: { label: 'Triângulo do Destino', descricao: 'Resultados esperados, missão e previsões de vida',   emoji: '⭐' },
};

function SequenciaBadge({ seq }: { seq: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
      {seq}
    </span>
  );
}

function TrianguloGrid({ triangulo }: { triangulo: TrianguloData }) {
  const { linhas, arcanoRegente, arcanosDoMinantes, sequenciasNegativas } = triangulo;
  const temBloqueio = sequenciasNegativas.length > 0;

  return (
    <div className="space-y-6">
      {/* Grid visual das linhas */}
      <div className="bg-black/30 rounded-xl p-4 border border-gold/10">
        <div className="space-y-2">
          {linhas.map((linha, i) => (
            <div key={i} className="flex justify-center gap-2">
              {linha.map((num, j) => (
                <div
                  key={j}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold font-mono
                    transition-all duration-200
                    ${i === 0
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : i === linhas.length - 1
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 scale-110'
                        : 'bg-white/5 text-gray-300 border border-white/10'}
                  `}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Informações do triângulo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Arcano Regente</p>
          <p className="text-3xl font-bold text-gold font-mono">{arcanoRegente ?? '—'}</p>
        </div>

        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Arcanos Dominantes</p>
          <div className="flex flex-wrap gap-1">
            {arcanosDoMinantes.length > 0
              ? arcanosDoMinantes.slice(0, 8).map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-gold/10 text-gold text-sm font-mono">
                    {a}
                  </span>
                ))
              : <span className="text-gray-500 text-sm">—</span>
            }
          </div>
        </div>
      </div>

      {/* Sequências negativas */}
      {temBloqueio ? (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-2">⚠ Sequências Negativas</p>
          <div className="flex flex-wrap gap-2">
            {sequenciasNegativas.map((s, i) => <SequenciaBadge key={i} seq={s} />)}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-400">✓ Sem sequências negativas neste triângulo</p>
        </div>
      )}
    </div>
  );
}

function BloqueioCard({ bloqueio }: { bloqueio: Bloqueio }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-start justify-between gap-4"
        onClick={() => setExpandido(!expandido)}
      >
        <div>
          <span className="font-mono text-red-400 text-sm font-bold mr-2">{bloqueio.codigo}</span>
          <span className="text-gray-200 font-medium">{bloqueio.titulo}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {bloqueio.triangulos.map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">
                {TIPO_LABEL[t]?.label ?? t}
              </span>
            ))}
          </div>
        </div>
        <span className="text-gold shrink-0">{expandido ? '▲' : '▼'}</span>
      </button>

      {expandido && (
        <div className="px-4 pb-4 space-y-3 border-t border-red-500/10">
          <p className="text-gray-300 text-sm leading-relaxed pt-3">{bloqueio.descricao}</p>
          <div className="rounded-lg p-3 bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Aspecto de Saúde</p>
            <p className="text-yellow-200 text-sm">{bloqueio.aspectoSaude}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TriangleVisualization({ vida, pessoal, social, destino, bloqueios }: Props) {
  const tabs = ['vida', 'pessoal', 'social', 'destino'] as const;
  const [aba, setAba] = useState<typeof tabs[number]>('vida');

  const triangulosMap = { vida, pessoal, social, destino };
  const triangulo = triangulosMap[aba];

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const info = TIPO_LABEL[t]!;
          const tri = triangulosMap[t];
          const temBloqueio = tri.sequenciasNegativas.length > 0;
          return (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${aba === t
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'}
              `}
            >
              <span>{info.emoji}</span>
              <span className="hidden sm:inline">{info.label}</span>
              <span className="sm:hidden">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              {temBloqueio && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Possui bloqueios" />
              )}
            </button>
          );
        })}
      </div>

      {/* Descrição da aba ativa */}
      <div className="glass rounded-xl p-4">
        <p className="text-sm text-gray-400">{TIPO_LABEL[aba]?.descricao}</p>
      </div>

      {/* Conteúdo do triângulo */}
      <TrianguloGrid triangulo={triangulo} />

      {/* Bloqueios consolidados (apenas na aba vida) */}
      {aba === 'vida' && bloqueios.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Bloqueios Detectados ({bloqueios.length})
          </h3>
          {bloqueios.map((b, i) => <BloqueioCard key={i} bloqueio={b} />)}
        </div>
      )}
    </div>
  );
}
