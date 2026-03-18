import React, { useState } from 'react';

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
  answerHtml?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map(item => (
        <div
          key={item.id}
          className="border border-[#D4AF37]/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm"
        >
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
          >
            <span className="font-medium text-gray-200 pr-4">{item.question}</span>
            <svg
              className={`w-5 h-5 text-[#D4AF37] flex-shrink-0 transition-transform duration-300 ${
                openId === item.id ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openId === item.id ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="px-5 pb-4 border-t border-white/5 pt-3">
              {item.answerHtml ? (
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
