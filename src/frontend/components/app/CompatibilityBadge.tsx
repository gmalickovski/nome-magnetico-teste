type Compat = 'total' | 'complementar' | 'aceitavel' | 'incompativel';

interface CompatibilityBadgeProps {
  compatibilidade: Compat;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

interface CompatConfig {
  label: string;
  className: string;
  title: string;
  description: string;
}

const CONFIG: Record<Compat, CompatConfig> = {
  total: {
    label: '✦ Ressonância Total',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    title: 'Ressonância Total',
    description:
      'O número de Expressão compartilha a mesma vibração do Destino. Alinhamento perfeito — nome e missão de vida falam a mesma língua.',
  },
  complementar: {
    label: '◈ Vibração Complementar',
    className: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
    title: 'Vibração Complementar',
    description:
      'A soma de Expressão e Destino resulta em 9, 11 ou 22 — números de maestria. Nome e missão se amplificam mutuamente.',
  },
  aceitavel: {
    label: '◎ Vibração Neutra',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    title: 'Vibração Neutra',
    description:
      'Expressão e Destino diferem em 1 unidade vibracional. Convivência sem tensão, mas sem sinergia especial.',
  },
  incompativel: {
    label: '⚠ Tensão Vibracional',
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
    title: 'Tensão Vibracional',
    description:
      'Frequências de Expressão e Destino são díspares. Pode gerar resistência energética — a penalidade já está refletida no score.',
  },
};

const LEGEND_ITEMS: { className: string; text: string }[] = [
  { className: 'text-emerald-400', text: '✦ Ressonância Total — mesma vibração final' },
  { className: 'text-[#D4AF37]',   text: '◈ Vibração Complementar — somam 9, 11 ou 22' },
  { className: 'text-amber-400',   text: '◎ Vibração Neutra — diferença de 1' },
  { className: 'text-red-400',     text: '⚠ Tensão Vibracional — frequências díspares' },
];

export default function CompatibilityBadge({
  compatibilidade,
  size = 'md',
  showTooltip = false,
}: CompatibilityBadgeProps) {
  const { label, className, title, description } = CONFIG[compatibilidade] ?? CONFIG.incompativel;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  /* Tooltip via CSS hover — sem <button> aninhado, compatível com cards clicáveis */
  return (
    <span className="relative group/compat inline-block">
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${className} ${showTooltip ? 'cursor-default' : ''}`}>
        {label}
        {showTooltip && <span className="opacity-50 text-[10px]">ⓘ</span>}
      </span>

      {showTooltip && (
        <span className="
          pointer-events-none absolute left-0 bottom-full mb-2 z-50
          w-72 rounded-xl bg-[#1e1c1a] border border-white/10
          shadow-2xl shadow-black/60 p-4 text-xs text-gray-300 leading-relaxed
          opacity-0 group-hover/compat:opacity-100
          transition-opacity duration-200
        ">
          <span className="block font-semibold text-white mb-1.5">{title}</span>
          <span className="block text-gray-400 mb-3">{description}</span>
          <span className="block border-t border-white/10 pt-2">
            <span className="block font-medium text-gray-400 mb-1">Tipos de Compatibilidade</span>
            {LEGEND_ITEMS.map(item => (
              <span key={item.text} className={`block ${item.className}`}>{item.text}</span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
