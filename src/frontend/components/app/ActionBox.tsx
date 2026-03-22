import type { ReactNode } from 'react';

interface ActionBoxProps {
  title?: string;
  children: ReactNode;
}

export default function ActionBox({ title = 'O que fazer agora', children }: ActionBoxProps) {
  return (
    <div className="mt-5 rounded-2xl bg-[#D4AF37]/8 border border-[#D4AF37]/25 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#D4AF37] text-lg leading-none">✦</span>
        <span className="font-cinzel text-xs uppercase tracking-[0.15em] text-[#D4AF37]">{title}</span>
      </div>
      <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
