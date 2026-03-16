import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-yellow-400 mb-2"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={`
          w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-white
          focus:outline-none focus:ring-2 focus:border-transparent
          transition duration-300 placeholder-gray-500
          ${error
            ? 'border-red-500/70 focus:ring-red-500/50'
            : 'border-gray-700 focus:ring-[#D4AF37]/50 hover:border-gray-600'
          }
          ${className}
        `}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
