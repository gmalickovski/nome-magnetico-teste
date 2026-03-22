type Compat = 'total' | 'complementar' | 'aceitavel' | 'incompativel';

interface CompatibilityBadgeProps {
  compatibilidade: Compat;
  size?: 'sm' | 'md';
}

const CONFIG: Record<Compat, { label: string; className: string }> = {
  total:        { label: 'Harmonia Total',         className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  complementar: { label: 'Harmonia Complementar',  className: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' },
  aceitavel:    { label: 'Aceitável',               className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' },
  incompativel: { label: 'Incompatível',            className: 'bg-red-500/15 text-red-400 border border-red-500/30' },
};

export default function CompatibilityBadge({ compatibilidade, size = 'md' }: CompatibilityBadgeProps) {
  const { label, className } = CONFIG[compatibilidade] ?? CONFIG.incompativel;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${padding} ${className}`}>
      {label}
    </span>
  );
}
