/**
 * KarmicDebts — exibe os débitos kármicos do nome.
 * Débitos = 13, 14, 16, 19.
 */

import { useState } from 'react';

interface DebitoCarmico {
  numero: number;
  titulo: string;
  descricao: string;
}

interface Props {
  debitos: DebitoCarmico[];
  nomeCompleto: string;
}

function DebitoCard({ debito }: { debito: DebitoCarmico }) {
  const [expandido, setExpandido] = useState(false);
  // Cor fixa em roxo místico para débitos kármicos
  const cor = 'text-[#c084fc] border-purple-500/30 bg-purple-500/10';

  const tituloCapitalizado = debito.titulo ? debito.titulo.charAt(0).toUpperCase() + debito.titulo.slice(1) : '';

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-center gap-4"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold font-mono shrink-0 bg-purple-500/20 border border-purple-500/30 text-purple-300">
          {debito.numero}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-200 text-sm leading-snug">{tituloCapitalizado}</p>
        </div>
        <span className="text-gray-400 shrink-0 transition-transform duration-300 transform">
          {expandido ? '▲' : '▼'}
        </span>
      </button>

      {expandido && (
        <div className="px-4 pb-4 space-y-4 border-t border-purple-500/10 bg-purple-500/5">
          <p className="text-gray-300 text-sm leading-relaxed pt-4 break-words">
            {debito.descricao}
          </p>
        </div>
      )}
    </div>
  );
}

export default function KarmicDebts({ debitos, nomeCompleto }: Props) {
  const primeiroNome = nomeCompleto.split(' ')[0] ?? nomeCompleto;

  if (debitos.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-4">
        <div className="text-emerald-400 text-3xl">✓</div>
        <div>
          <p className="text-emerald-400 font-semibold">Nenhum débito kármico detectado</p>
          <p className="text-gray-400 text-sm mt-1">
            Seu nome não carrega pendências de encarnações passadas — uma vantagem significativa na sua jornada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-[#c084fc]">{debitos.length} {debitos.length === 1 ? 'Débito Kármico' : 'Débitos Kármicos'}</strong> — o nome de {primeiroNome} aponta para tendências de encarnações passadas que precisam ser redimidas nesta vida. Cada débito exige conscientização e ação focada para não repetir os velhos padrões.
        </p>
      </div>

      {debitos.map((d, i) => <DebitoCard key={i} debito={d} />)}
    </div>
  );
}
