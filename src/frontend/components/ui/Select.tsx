import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, className = '', placeholder = 'Selecione...' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-gray-900/50 border rounded-xl pl-5 pr-4 py-3.5 text-left text-white
          focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent
          transition duration-300 flex items-center justify-between
          ${isOpen ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]' : 'border-gray-700 hover:border-gray-500'}
        `}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 mr-2 ${isOpen ? 'rotate-180 text-[#D4AF37]' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden glass-dark">
          <ul className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
            {options.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-5 py-3 text-sm transition-colors
                    ${value === option.value
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-medium'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
