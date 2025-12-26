import React, { useState } from 'react';
import { MultiInputField, InputValidatorConfig } from '../types';
import { validateAnswer } from '../utils/answerValidators';

interface MultiFieldInputProps {
  fields: MultiInputField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  disabled?: boolean;
  isBountyMode?: boolean;
}

export const MultiFieldInput: React.FC<MultiFieldInputProps> = ({
  fields,
  values,
  onChange,
  disabled = false,
  isBountyMode = false
}) => {
  const handleFieldChange = (fieldId: string, value: string) => {
    onChange({
      ...values,
      [fieldId]: value
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {field.label}
          </label>
          {field.options && field.options.length > 0 ? (
            <select
              value={values[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              className={`w-full p-4 text-lg font-medium rounded-xl border-2 outline-none transition-all ${
                isBountyMode
                  ? 'bounty-input border-amber-200 focus:border-amber-400 bg-amber-50'
                  : 'border-slate-200 focus:border-indigo-500 bg-slate-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="">{field.placeholder || '-- Bitte wählen --'}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.validator.type === 'boolean' ? (
            <select
              value={values[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              className={`w-full p-4 text-lg font-medium rounded-xl border-2 outline-none transition-all ${
                isBountyMode
                  ? 'bounty-input border-amber-200 focus:border-amber-400 bg-amber-50'
                  : 'border-slate-200 focus:border-indigo-500 bg-slate-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="">-- Bitte wählen --</option>
              <option value="richtig">Richtig</option>
              <option value="falsch">Falsch</option>
              <option value="ja">Ja</option>
              <option value="nein">Nein</option>
            </select>
          ) : (
            <input
              type="text"
              value={values[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'Antwort eingeben...'}
              disabled={disabled}
              className={`w-full p-4 text-lg font-medium rounded-xl border-2 outline-none transition-all ${
                isBountyMode
                  ? 'bounty-input border-amber-200 focus:border-amber-400 bg-amber-50'
                  : 'border-slate-200 focus:border-indigo-500 bg-slate-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

