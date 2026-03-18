/**
 * KarmicLessons — exibe as lições kármics do nome.
 * Lições = números de 1 a 8 ausentes no nome.
 */

import { useState } from 'react';

interface LicaoCarmica {
  numero: number;
  titulo: string;
  descricao: string;
  comoTrabalhar: string;
}

interface Props {
  licoes: LicaoCarmica[];
  nomeCompleto: string;
}

const NUMERO_CORES: Record<number, string> = {
  1: 'text-red-400 border-red-500/30 bg-red-500/10',
  2: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  3: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  4: 'text-green-400 border-green-500/30 bg-green-500/10',
  5: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
  6: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  7: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  8: 'text-gold border-gold/30 bg-gold/10',
};

function LicaoCard({ licao }: { licao: LicaoCarmica }) {
  const [expandido, setExpandido] = useState(false);
  const cor = NUMERO_CORES[licao.numero] ?? 'text-gray-400 border-gray-500/30 bg-gray-500/10';

  return (
    <div className={`rounded-xl border overflow-hidden ${cor}`}>
      <button
        className="w-full text-left p-4 flex items-center gap-4"
        onClick={() => setExpandido(!expandido)}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold font-mono shrink-0 border ${cor}`}>
          {licao.numero}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-200 text-sm leading-snug">{licao.titulo}</p>
        </div>
        <span className="text-gray-400 shrink-0">{expandido ? '▲' : '▼'}</span>
      </button>

      {expandido && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5">
          <p className="text-gray-300 text-sm leading-relaxed pt-4">{licao.descricao}</p>
          <div className="rounded-lg p-3 bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Como Trabalhar</p>
            <p className="text-emerald-200 text-sm leading-relaxed">{licao.comoTrabalhar}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KarmicLessons({ licoes, nomeCompleto }: Props) {
  const primeiroNome = nomeCompleto.split(' ')[0] ?? nomeCompleto;

  if (licoes.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <div className="text-4xl">✨</div>
        <h3 className="text-lg font-semibold text-gold">Energia Completa</h3>
        <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
          {primeiroNome} não possui lições kármics — todos os números de 1 a 8 estão presentes
          no nome. Isso indica uma energia numerológica completa e equilibrada nesta encarnação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-gold">{licoes.length} lição(ões) kármic(s)</strong> — números ausentes de 1 a 8 no nome de {primeiroNome}.
          Cada ausência indica uma qualidade a ser desenvolvida nesta encarnação.
        </p>
      </div>

      {licoes.map((l, i) => <LicaoCard key={i} licao={l} />)}
    </div>
  );
}
