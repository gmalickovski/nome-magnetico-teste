import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl p-6
        bg-white/5 backdrop-blur-[10px]
        border border-[#D4AF37]/20
        transition-all duration-300
        ${hover ? 'hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:scale-[1.02] cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
