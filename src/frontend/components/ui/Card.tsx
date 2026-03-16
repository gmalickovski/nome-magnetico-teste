import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div
      className={`
        bg-[#111111] border border-white/10 rounded-2xl p-6
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-cinzel text-lg font-bold text-gray-100">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
