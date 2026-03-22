/**
 * TriangleVisualization — exibe os 4 triângulos numerológicos com abas.
 * SVG gerado seguindo a lógica de formula.js: letras no topo, números centrados
 * por linha, bloqueios destacados com fundo colorido e texto em negrito.
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
  nome: string;
}

const TIPO_LABEL: Record<string, { label: string; descricao: string; emoji: string }> = {
  vida:    { label: 'Triângulo da Vida',    descricao: 'Aspectos gerais da vida e padrões de existência',   emoji: '🔺' },
  pessoal: { label: 'Triângulo Pessoal',    descricao: 'Vida íntima, reações internas e sentimentos',        emoji: '💛' },
  social:  { label: 'Triângulo Social',     descricao: 'Influências externas e como o mundo te percebe',     emoji: '🌐' },
  destino: { label: 'Triângulo do Destino', descricao: 'Resultados esperados, missão e previsões de vida',   emoji: '⭐' },
};

const BLOQUEIO_SEQUENCIAS = ['111','222','333','444','555','666','777','888','999'];

/**
 * Constrói um Set de posições "linha,coluna" que pertencem a alguma sequência negativa.
 * Segue a lógica de formula.js: verifica cada tripla consecutiva em cada linha.
 */
function buildBloqueioPositions(linhas: number[][]): Set<string> {
  const positions = new Set<string>();
  for (let r = 0; r < linhas.length; r++) {
    const linha = linhas[r]!;
    for (let i = 0; i <= linha.length - 3; i++) {
      const tripla = `${linha[i]}${linha[i + 1]}${linha[i + 2]}`;
      if (BLOQUEIO_SEQUENCIAS.includes(tripla)) {
        // Destacar todas as ocorrências consecutivas do mesmo dígito
        const digit = String(linha[i]);
        let end = i + 3;
        while (end < linha.length && String(linha[end]) === digit) end++;
        for (let k = i; k < end; k++) positions.add(`${r},${k}`);
        i = end - 1; // Pula os já processados
      }
    }
  }
  return positions;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG do triângulo (lógica portada de formula.js)
// ─────────────────────────────────────────────────────────────────────────────
function TrianguloSVG({ triangulo, nome }: { triangulo: TrianguloData; nome: string }) {
  const { linhas } = triangulo;
  const nomeSemEspacos = nome.replace(/\s+/g, '').toUpperCase();
  const letras = nomeSemEspacos.split('');
  const N = linhas[0]?.length ?? 1;

  const ELEM = 50;         // px entre elementos (igual ao formula.js)
  const textWidth = (N - 1) * ELEM;
  const largura = textWidth + 120; // 60px padding on each side
  const altura = 80 + linhas.length * 30;
  const viewBox = `0 0 ${largura} ${altura}`;
  
  const midX = largura / 2;

  const bloqueioPos = buildBloqueioPositions(linhas);

  // Centro horizontal da primeira linha
  const xBase = midX - textWidth / 2;

  return (
    <div className="overflow-x-auto py-2 flex justify-center w-full">
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', maxWidth: `${largura}px` }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Linha das letras ── */}
        {letras.map((letra, idx) => (
          <text
            key={`letter-${idx}`}
            x={xBase + idx * ELEM}
            y={28}
            fontSize="15"
            fontWeight="700"
            textAnchor="middle"
            fill="#D4AF37"
            fontFamily="Cinzel, Georgia, 'Times New Roman', serif"
          >
            {letra}
          </text>
        ))}

        {/* ── Linhas numéricas ── */}
        {linhas.map((linha, r) => {
          const yNum = 55 + r * 30;
          const xRowStart = midX - ((linha.length - 1) * ELEM) / 2;
          const isLastRow = r === linhas.length - 1;

          return linha.map((num, c) => {
            const x = xRowStart + c * ELEM;
            const key = `${r},${c}`;
            const isBloq = bloqueioPos.has(key);

            // Cores por camada
            const fill = isBloq
              ? '#FF6B6B'
              : isLastRow
                ? '#c084fc'
                : r === 0
                  ? '#fbbf24'   // amber-400 (base: valores das letras)
                  : '#9ca3af';  // gray-400 (camadas intermediárias)

            return (
              <g key={key}>
                {isBloq && (
                  <rect
                    x={x - 13}
                    y={yNum - 14}
                    width="26"
                    height="20"
                    rx="4"
                    fill="rgba(239,68,68,0.20)"
                    stroke="rgba(239,68,68,0.55)"
                    strokeWidth="1"
                  />
                )}
                {isLastRow && !isBloq && (
                  <circle
                    cx={x}
                    cy={yNum - 5}
                    r="13"
                    fill="rgba(192,132,252,0.15)"
                    stroke="rgba(192,132,252,0.40)"
                    strokeWidth="1"
                  />
                )}
                <text
                  x={x}
                  y={yNum}
                  fontSize={isLastRow ? '17' : '14'}
                  fontWeight={isBloq || isLastRow ? '700' : '400'}
                  textAnchor="middle"
                  fill={fill}
                  fontFamily="'Courier New', Courier, monospace"
                >
                  {num}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Painel de informações abaixo do SVG
// ─────────────────────────────────────────────────────────────────────────────
function TrianguloInfo({ triangulo }: { triangulo: TrianguloData }) {
  const { arcanoRegente, arcanosDoMinantes, sequenciasNegativas } = triangulo;

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Arcano Regente */}
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Arcano Regente</p>
          <p className="text-3xl font-bold text-purple-300 font-mono">{arcanoRegente ?? '—'}</p>
        </div>

        {/* Arcanos Dominantes */}
        <div className="bg-white/5 border border-[#D4AF37]/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Arcanos Dominantes</p>
          <div className="flex flex-wrap gap-1">
            {arcanosDoMinantes.length > 0
              ? arcanosDoMinantes.slice(0, 10).map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-mono">
                    {a}
                  </span>
                ))
              : <span className="text-gray-500 text-sm">—</span>
            }
          </div>
        </div>
      </div>

      {/* Sequências negativas */}
      {sequenciasNegativas.length > 0 ? (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-2">⚠ Sequências Negativas</p>
          <div className="flex flex-wrap gap-2">
            {sequenciasNegativas.map((s, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30"
              >
                {s}
              </span>
            ))}
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

// ─────────────────────────────────────────────────────────────────────────────
// Card de bloqueio expandível
// ─────────────────────────────────────────────────────────────────────────────
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
        <span className="text-[#D4AF37] shrink-0">{expandido ? '▲' : '▼'}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function TriangleVisualization({ vida, pessoal, social, destino, bloqueios, nome }: Props) {
  const tabs = ['vida', 'pessoal', 'social', 'destino'] as const;
  const [aba, setAba] = useState<typeof tabs[number]>('vida');

  const triangulosMap = { vida, pessoal, social, destino };
  const triangulo = triangulosMap[aba];

  return (
    <div className="space-y-6">
      {/* Legenda de cores */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400/60 inline-block" />
          Valores das letras
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-400/40 inline-block" />
          Reduções intermediárias
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-400/60 inline-block" />
          Arcano Regente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/60 inline-block" />
          Bloqueio energético
        </span>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap justify-center gap-2 w-full">
        {tabs.map(t => {
          const info = TIPO_LABEL[t]!;
          const tri = triangulosMap[t];
          const temBloqueio = tri.sequenciasNegativas.length > 0;
          return (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`
                flex-auto flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 min-w-[130px] whitespace-nowrap
                ${aba === t
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'}
              `}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Descrição da aba */}
      <div className="bg-white/5 border border-[#D4AF37]/10 rounded-xl p-4">
        <p className="text-sm text-gray-400">{TIPO_LABEL[aba]?.descricao}</p>
      </div>

      {/* SVG do triângulo */}
      <div className="rounded-xl flex justify-center">
        <TrianguloSVG triangulo={triangulo} nome={nome} />
      </div>

      {/* Info: arcano + sequências */}
      <TrianguloInfo triangulo={triangulo} />

      {/* Bloqueios consolidados (visíveis em todas as abas) */}
      {bloqueios.length > 0 && (
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
