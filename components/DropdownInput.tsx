import React from 'react';

interface DropdownInputProps {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isBountyMode?: boolean;
  placeholder?: string;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  isBountyMode = false,
  placeholder = '-- Bitte wählen --'
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-4 text-lg font-medium rounded-xl border-2 outline-none transition-all ${
          isBountyMode
            ? 'bounty-input border-amber-200 focus:border-amber-400 bg-amber-50'
            : 'border-slate-200 focus:border-indigo-500 bg-slate-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

