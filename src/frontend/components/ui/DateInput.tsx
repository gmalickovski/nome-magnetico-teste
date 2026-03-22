import React, { useRef } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChangeValue: (val: string) => void;
}

export function DateInput({ value, onChangeValue, className = '', disabled, placeholder = 'DD/MM/AAAA', ...props }: DateInputProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    val = val.replace(/\//g, '');
    if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
    if (val.length > 5) val = `${val.slice(0, 5)}/${val.slice(5, 9)}`;
    onChangeValue(val);
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // YYYY-MM-DD
    if (!raw) return;
    const [y, m, d] = raw.split('-');
    if (y && m && d) {
      onChangeValue(`${d}/${m}/${y}`);
    }
  };

  // Convert DD/MM/YYYY back to YYYY-MM-DD for the native date input to stay synced
  let dateValue = '';
  if (value && value.length === 10) {
    const [d, m, y] = value.split('/');
    if (d && m && y && y.length === 4) {
      dateValue = `${y}-${m}-${d}`;
    }
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        maxLength={10}
        placeholder={placeholder}
        className={`${className} pr-12`} // Padding for calendar icon
        {...props}
      />
      <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center pointer-events-none text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <input
        aria-hidden="true"
        type="date"
        ref={dateInputRef}
        value={dateValue}
        onChange={handleDatePick}
        disabled={disabled}
        className="absolute right-0 top-0 w-12 h-full opacity-0 cursor-pointer"
        style={{ zIndex: 10, visibility: disabled ? 'hidden' : 'visible' }}
        tabIndex={-1}
      />
    </div>
  );
}
