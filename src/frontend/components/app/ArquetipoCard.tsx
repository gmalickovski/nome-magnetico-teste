import React, { useState } from 'react';
import type { Arquetipo } from '../../../backend/numerology/archetypes';

interface ArquetipoCardProps {
  arquetipo: Arquetipo;
  mode?: 'pessoa' | 'empresa' | 'bebe';
}

export default function ArquetipoCard({ arquetipo, mode = 'pessoa' }: ArquetipoCardProps) {
  const [shadowOpen, setShadowOpen] = useState(false);

  const labels: Record<typeof mode, { titulo: string; subtitulo: string }> = {
    pessoa: {
      titulo: 'Seu Arquétipo',
      subtitulo: 'A identidade mítica revelada pelo número de Expressão',
    },
    bebe: {
      titulo: 'Arquétipo da Criança',
      subtitulo: 'A identidade mítica que este nome desperta',
    },
    empresa: {
      titulo: 'Arquétipo da Marca',
      subtitulo: 'A personalidade profunda que o mercado perceberá',
    },
  };

  const { titulo, subtitulo } = labels[mode];

  return (
    <div className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
          <span className="text-[#D4AF37] font-bold text-xl">{arquetipo.numero}</span>
        </div>
        <div>
          <p className="text-[#D4AF37]/60 text-xs uppercase tracking-widest mb-1">{titulo}</p>
          <h3 className="font-cinzel text-2xl font-bold text-[#D4AF37]">{arquetipo.nome}</h3>
          <p className="text-gray-500 text-xs mt-1">{subtitulo}</p>
        </div>
      </div>

      {/* Essência */}
      <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl px-5 py-4 mb-5">
        <p className="text-[#D4AF37] font-cinzel text-sm italic text-center leading-relaxed">
          "{arquetipo.essencia}"
        </p>
      </div>

      {/* Descrição */}
      <p className="text-gray-300 text-sm leading-relaxed mb-5">{arquetipo.descricao}</p>

      {/* Manifestações positivas */}
      <div className="mb-4">
        <p className="text-[#10b981] text-xs font-medium uppercase tracking-wider mb-3">
          Expressão Positiva
        </p>
        <ul className="space-y-2">
          {arquetipo.expressaoPositiva.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-[#10b981] mt-0.5 flex-shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Figuras míticas / marcas de referência */}
      {mode === 'empresa' ? (
        <div className="mb-4">
          <p className="text-[#c084fc] text-xs font-medium uppercase tracking-wider mb-2">
            Marcas de Referência
          </p>
          <div className="flex flex-wrap gap-2">
            {arquetipo.marcasReferencia.map((m, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] text-xs"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-3 leading-relaxed">{arquetipo.posicionamento}</p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-[#D4AF37]/60 text-xs font-medium uppercase tracking-wider mb-2">
            Figuras Míticas
          </p>
          <div className="flex flex-wrap gap-2">
            {arquetipo.figurasMiticas.map((f, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]/80 text-xs"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sombra (colapsável) */}
      <button
        onClick={() => setShadowOpen(!shadowOpen)}
        className="w-full flex items-center justify-between text-left text-xs text-gray-500 hover:text-gray-300 transition-colors pt-4 border-t border-white/5"
      >
        <span className="uppercase tracking-wider">
          A Sombra — {arquetipo.sombra}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${shadowOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {shadowOpen && (
        <div className="mt-3 space-y-2">
          {arquetipo.expressaoSombra.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-[#FF6B6B] mt-0.5 flex-shrink-0">⚠</span>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
