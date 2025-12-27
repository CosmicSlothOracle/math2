/**
 * FormelRechner - Tool für automatische Berechnungen
 *
 * Features:
 * - Potenzgesetze anwenden
 * - Wurzeln berechnen
 * - Quadratische Funktionen analysieren
 * - Wissenschaftliche Schreibweise umwandeln
 */

import React, { useState } from 'react';

interface FormelRechnerProps {
  onClose?: () => void;
}

type CalculationMode = 'potenz' | 'wurzel' | 'parabel' | 'wissenschaftlich';

export const FormelRechner: React.FC<FormelRechnerProps> = ({ onClose }) => {
  const [mode, setMode] = useState<CalculationMode>('potenz');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const calculatePotenz = (expr: string) => {
    // Einfache Potenzberechnung: z.B. "2^5 * 2^3" oder "5^9 / 5^4"
    const steps: string[] = [];
    let res: number | null = null;

    try {
      // Multiplikation: a^n * a^m = a^(n+m)
      if (expr.includes('*')) {
        const parts = expr.split('*').map(p => p.trim());
        if (parts.length === 2) {
          const [left, right] = parts;
          const leftMatch = left.match(/(\d+)\^(\d+)/);
          const rightMatch = right.match(/(\d+)\^(\d+)/);
          if (leftMatch && rightMatch && leftMatch[1] === rightMatch[1]) {
            const base = parseInt(leftMatch[1]);
            const exp1 = parseInt(leftMatch[2]);
            const exp2 = parseInt(rightMatch[2]);
            const newExp = exp1 + exp2;
            steps.push(`${base}^${exp1} · ${base}^${exp2} = ${base}^(${exp1} + ${exp2})`);
            steps.push(`= ${base}^${newExp}`);
            res = Math.pow(base, newExp);
            steps.push(`= ${res}`);
          }
        }
      }
      // Division: a^n / a^m = a^(n-m)
      else if (expr.includes('/')) {
        const parts = expr.split('/').map(p => p.trim());
        if (parts.length === 2) {
          const [left, right] = parts;
          const leftMatch = left.match(/(\d+)\^(\d+)/);
          const rightMatch = right.match(/(\d+)\^(\d+)/);
          if (leftMatch && rightMatch && leftMatch[1] === rightMatch[1]) {
            const base = parseInt(leftMatch[1]);
            const exp1 = parseInt(leftMatch[2]);
            const exp2 = parseInt(rightMatch[2]);
            const newExp = exp1 - exp2;
            steps.push(`${base}^${exp1} : ${base}^${exp2} = ${base}^(${exp1} - ${exp2})`);
            steps.push(`= ${base}^${newExp}`);
            if (newExp < 0) {
              steps.push(`= 1/${base}^${Math.abs(newExp)}`);
            }
            res = Math.pow(base, newExp);
            steps.push(`= ${res}`);
          }
        }
      }
      // Einfache Potenz: a^n
      else {
        const match = expr.match(/(\d+)\^(\d+)/);
        if (match) {
          const base = parseInt(match[1]);
          const exp = parseInt(match[2]);
          steps.push(`${base}^${exp}`);
          res = Math.pow(base, exp);
          steps.push(`= ${res}`);
        }
      }
    } catch (e) {
      steps.push('Fehler: Ungültige Eingabe');
    }

    setSteps(steps);
    setResult(res !== null ? res.toString() : null);
  };

  const calculateWurzel = (expr: string) => {
    const steps: string[] = [];
    let res: number | null = null;

    try {
      // Quadratwurzel: √a
      if (expr.startsWith('√')) {
        const num = parseFloat(expr.substring(1).trim());
        steps.push(`√${num}`);
        res = Math.sqrt(num);
        steps.push(`= ${res.toFixed(4)}`);
      }
      // n-te Wurzel: ⁿ√a
      else {
        const match = expr.match(/(\d+)√(\d+)/);
        if (match) {
          const n = parseInt(match[1]);
          const num = parseFloat(match[2]);
          steps.push(`${n}√${num}`);
          res = Math.pow(num, 1 / n);
          steps.push(`= ${num}^(1/${n})`);
          steps.push(`= ${res.toFixed(4)}`);
        }
      }
    } catch (e) {
      steps.push('Fehler: Ungültige Eingabe');
    }

    setSteps(steps);
    setResult(res !== null ? res.toString() : null);
  };

  const calculateParabel = (expr: string) => {
    const steps: string[] = [];
    let res: string | null = null;

    try {
      // Scheitelpunktform: f(x) = a(x-d)² + e
      if (expr.includes('(x') && expr.includes(')²')) {
        const match = expr.match(/f\(x\)\s*=\s*(\d+)?\s*\(x\s*([+-]?\d+)\)²\s*([+-]\d+)?/);
        if (match) {
          const a = match[1] ? parseInt(match[1]) : 1;
          const d = parseInt(match[2]);
          const e = match[3] ? parseInt(match[3]) : 0;
          steps.push(`f(x) = ${a}(x${d >= 0 ? '+' : ''}${d})²${e >= 0 ? '+' : ''}${e}`);
          steps.push(`Scheitelpunkt: S(${d}|${e})`);
          steps.push(`Öffnung: ${a > 0 ? 'nach oben' : 'nach unten'}`);
          steps.push(`Streckung: ${Math.abs(a) > 1 ? 'gestreckt' : Math.abs(a) < 1 ? 'gestaucht' : 'normal'}`);
          res = `S(${d}|${e})`;
        }
      }
      // Allgemeine Form: f(x) = ax² + bx + c
      else if (expr.includes('x²')) {
        const match = expr.match(/f\(x\)\s*=\s*(\d+)?x²\s*([+-]\d+)?x\s*([+-]\d+)?/);
        if (match) {
          const a = match[1] ? parseInt(match[1]) : 1;
          const b = match[2] ? parseInt(match[2]) : 0;
          const c = match[3] ? parseInt(match[3]) : 0;
          const xS = -b / (2 * a);
          const yS = a * xS * xS + b * xS + c;
          steps.push(`f(x) = ${a}x²${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}`);
          steps.push(`Scheitelpunkt: x_S = -b/(2a) = -${b}/(2·${a}) = ${xS}`);
          steps.push(`y_S = f(${xS}) = ${yS}`);
          res = `S(${xS.toFixed(2)}|${yS.toFixed(2)})`;
        }
      }
    } catch (e) {
      steps.push('Fehler: Ungültige Eingabe');
    }

    setSteps(steps);
    setResult(res);
  };

  const calculateWissenschaftlich = (num: string) => {
    const steps: string[] = [];
    let res: string | null = null;

    try {
      const value = parseFloat(num);
      if (isNaN(value)) {
        steps.push('Fehler: Keine gültige Zahl');
      } else {
        const absValue = Math.abs(value);
        const exponent = Math.floor(Math.log10(absValue));
        const mantissa = value / Math.pow(10, exponent);
        steps.push(`${value}`);
        steps.push(`= ${mantissa.toFixed(2)} · 10^${exponent}`);
        res = `${mantissa.toFixed(2)} · 10^${exponent}`;
      }
    } catch (e) {
      steps.push('Fehler: Ungültige Eingabe');
    }

    setSteps(steps);
    setResult(res);
  };

  const handleCalculate = () => {
    setSteps([]);
    setResult(null);

    switch (mode) {
      case 'potenz':
        calculatePotenz(input);
        break;
      case 'wurzel':
        calculateWurzel(input);
        break;
      case 'parabel':
        calculateParabel(input);
        break;
      case 'wissenschaftlich':
        calculateWissenschaftlich(input);
        break;
    }
  };

  const getModePlaceholder = () => {
    switch (mode) {
      case 'potenz':
        return 'z.B. 2^5 * 2^3 oder 5^9 / 5^4';
      case 'wurzel':
        return 'z.B. √16 oder 3√125';
      case 'parabel':
        return 'z.B. f(x) = 2(x-3)² + 5 oder f(x) = x² + 4x + 3';
      case 'wissenschaftlich':
        return 'z.B. 23500 oder 0.000123';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 max-w-2xl mx-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ✕ Schließen
        </button>
      )}
      <h2 className="text-2xl font-bold mb-4">Formel-Rechner 🧮</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Modus:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as CalculationMode)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="potenz">Potenzgesetze</option>
          <option value="wurzel">Wurzeln</option>
          <option value="parabel">Parabel-Analyse</option>
          <option value="wissenschaftlich">Wissenschaftliche Schreibweise</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Eingabe:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getModePlaceholder()}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <button
        onClick={handleCalculate}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        Berechnen
      </button>

      {steps.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <h3 className="font-semibold mb-2">Zwischenschritte:</h3>
          {steps.map((step, idx) => (
            <div key={idx} className="text-sm font-mono mb-1">
              {step}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded">
          <h3 className="font-semibold mb-2">Ergebnis:</h3>
          <div className="text-xl font-bold">{result}</div>
        </div>
      )}
    </div>
  );
};

