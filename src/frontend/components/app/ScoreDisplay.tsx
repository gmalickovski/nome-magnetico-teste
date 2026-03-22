interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ScoreDisplay({ score, size = 'md', showLabel = true }: ScoreDisplayProps) {
  const clamped = Math.max(0, Math.min(100, score));

  const color =
    clamped >= 70
      ? { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', label: 'Excelente' }
      : clamped >= 40
      ? { bar: 'from-[#D4AF37] to-[#f2ca50]', text: 'text-[#D4AF37]', label: 'Bom' }
      : { bar: 'from-red-500 to-red-400', text: 'text-red-400', label: 'Atenção' };

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  const numSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-1.5">
        <span className={`font-cinzel font-bold ${numSizes[size]} ${color.text}`}>
          {clamped}
          <span className={`${textSizes[size]} font-inter font-normal text-gray-500 ml-0.5`}>/100</span>
        </span>
        {showLabel && (
          <span className={`${textSizes[size]} font-medium ${color.text}`}>{color.label}</span>
        )}
      </div>
      <div className={`w-full bg-white/10 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
