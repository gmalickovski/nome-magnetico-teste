interface ArcanoData {
  numero: number;
  nome: string;
  palavraChave: string;
  descricao: string;
}

interface ArcanoCardProps {
  arcano: ArcanoData;
  label?: string;
}

export default function ArcanoCard({ arcano, label = 'Arcano Regente' }: ArcanoCardProps) {
  return (
    <div className="flex items-start gap-5 rounded-2xl bg-white/5 p-5 md:p-6">
      <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25">
        <span className="font-cinzel text-2xl font-bold text-[#D4AF37] leading-none">{arcano.numero}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-cinzel text-xs uppercase tracking-[0.15em] text-[#76746a]">{label}</span>
        </div>
        <h3 className="font-cinzel text-xl font-bold text-white mb-0.5">{arcano.nome}</h3>
        <p className="text-[#D4AF37] text-sm font-medium mb-2">{arcano.palavraChave}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{arcano.descricao}</p>
      </div>
    </div>
  );
}
