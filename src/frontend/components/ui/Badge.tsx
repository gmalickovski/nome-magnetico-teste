import React from 'react';

type BadgeVariant = 'gold' | 'success' | 'error' | 'spiritual' | 'neutral' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  gold: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  spiritual: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
