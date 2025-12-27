import React, { useState } from 'react';

interface ScheitelCoachProps {
  onClose?: () => void;
}

interface AnalysisResult {
  vertexForm: string;
  scheitel: { x: number; y: number };
  discriminant: number;
  solutions: string[];
  steps: string[];
}

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const rounded = Math.round(value * 1000) / 1000;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(3).replace(/\.?0+$/, '');
};

const EXAMPLES = [
  { id: 'a', general: 'x² + 8x + 15', vertex: '(x + 4)² - 1', scheitel: 'S(-4|-1)' },
  { id: 'b', general: 'x² - 6x + 8,5', vertex: '(x - 3)² - 0,5', scheitel: 'S(3|-0,5)' },
  { id: 'c', general: 'x² + 5x + 11,25', vertex: '(x + 2,5)² + 5', scheitel: 'S(-2,5|5)' },
  { id: 'd', general: '-0,5x² + 2x - 1', vertex: '-0,5(x - 2)² + 1', scheitel: 'S(2|1)' },
];

export const ScheitelCoach: React.FC<ScheitelCoachProps> = ({ onClose }) => {
  const [coeffs, setCoeffs] = useState({ a: 1, b: 4, c: 2 });
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = () => {
    const { a, b, c } = coeffs;
    if (a === 0) {
      setResult(null);
      return;
    }
    const d = -b / (2 * a);
    const e = c - (b * b) / (4 * a);
    const discriminant = b * b - 4 * a * c;
    let solutions: string[] = [];
    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      solutions = [formatNumber(x1), formatNumber(x2)];
    } else if (discriminant === 0) {
      const xS = -b / (2 * a);
      solutions = [formatNumber(xS)];
    }

    const aPrefix = a === 1 ? '' : a === -1 ? '-' : formatNumber(a);
    const innerSign = d >= 0 ? '-' : '+';
    const eSign = e >= 0 ? '+ ' : '- ';
    const vertexForm = `f(x) = ${aPrefix}(x ${innerSign} ${formatNumber(Math.abs(d))})² ${e === 0 ? '' : `${eSign}${formatNumber(Math.abs(e))}`}`.replace(/\s+/g, ' ').trim();

    const steps = [
      `Normieren: ${a !== 1 ? `Teile durch ${formatNumber(a)} → f(x) = x² + ${formatNumber(b / a)}x + ${formatNumber(c / a)}` : 'a = 1, daher kein Normieren nötig.'}`,
      `Quadratische Ergänzung: x² + ${formatNumber(b / a)}x = (x + ${formatNumber(b / (2 * a))})² - (${formatNumber(b / (2 * a))})²`,
      `Scheitelpunkt: S(${formatNumber(d)} | ${formatNumber(e)})`,
      `Diskriminante: Δ = b² - 4ac = ${formatNumber(discriminant)} ⇒ ${discriminant > 0 ? 'zwei Nullstellen' : discriminant === 0 ? 'doppelte Nullstelle' : 'keine reellen Nullstellen'}`,
    ];

    setResult({
      vertexForm,
      scheitel: { x: d, y: e },
      discriminant,
      solutions,
      steps,
    });
  };

  const handleCoeffChange = (key: 'a' | 'b' | 'c', value: string) => {
    const parsed = parseFloat(value.replace(',', '.'));
    setCoeffs(prev => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-indigo-100 dark:border-indigo-900 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Scheitel-Coach</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Für die Lernkanon-Termine 20.11 – 11.12: gestreckte Parabeln, Scheitelpunktform & Anwendungen.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white font-bold">
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['a', 'b', 'c'] as const).map(key => (
          <label key={key} className="flex flex-col gap-2 text-sm font-bold text-slate-500">
            Koeffizient {key.toUpperCase()}
            <input
              type="number"
              step="0.25"
              value={coeffs[key]}
              onChange={e => handleCoeffChange(key, e.target.value)}
              className="rounded-2xl border-2 border-slate-200 px-4 py-2 text-slate-900 font-black bg-white focus:border-indigo-500 focus:outline-none"
            />
          </label>
        ))}
      </div>

      <button
        onClick={analyze}
        className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors"
      >
        Analyse starten
      </button>

      {result && (
        <div className="space-y-4 bg-indigo-50 dark:bg-indigo-950/60 p-5 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-lg font-black text-indigo-800 dark:text-indigo-200 uppercase tracking-widest">Ergebnis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-inner">
              <p className="text-xs font-black uppercase text-slate-400">Scheitelpunktform</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{result.vertexForm}</p>
            </div>
            <div className="p-4 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-inner">
              <p className="text-xs font-black uppercase text-slate-400">Scheitel</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                S({formatNumber(result.scheitel.x)} | {formatNumber(result.scheitel.y)})
              </p>
              <p className="text-xs text-slate-500 mt-1">Δ = {formatNumber(result.discriminant)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase text-slate-400 mb-2">Nullstellen</p>
              {result.solutions.length === 0 && (
                <p className="text-sm font-semibold text-slate-500">Keine reellen Nullstellen (Δ &lt; 0)</p>
              )}
              {result.solutions.length === 1 && (
                <p className="text-sm font-semibold text-slate-700">x = {result.solutions[0]}</p>
              )}
              {result.solutions.length === 2 && (
                <ul className="text-sm font-semibold text-slate-700 space-y-1">
                  <li>x₁ = {result.solutions[0]}</li>
                  <li>x₂ = {result.solutions[1]}</li>
                </ul>
              )}
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase text-slate-400 mb-2">Steps (Quadratische Ergänzung)</p>
              <ol className="text-sm text-slate-600 font-semibold list-decimal list-inside space-y-1">
                {result.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
          Beispiele (Training 18.11 – 02.12)
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLES.map(example => (
            <div key={example.id} className="p-4 rounded-2xl border-2 border-slate-100 bg-white">
              <p className="text-xs font-black uppercase text-slate-400">AF</p>
              <p className="font-black text-slate-800">{example.general}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-2">SPF</p>
              <p className="font-black text-emerald-600">{example.vertex}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-2">Scheitel</p>
              <p className="font-black text-slate-700">{example.scheitel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

