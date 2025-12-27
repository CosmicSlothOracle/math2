import React, { useMemo, useState } from 'react';

interface SpickerTrainerProps {
  onClose?: () => void;
}

type Challenge = {
  id: string;
  prompt: string;
  answer: string;
  hint?: string;
};

type SpickerSection = {
  id: string;
  title: string;
  timeframe: string;
  summary: string;
  bullets: string[];
  challenges: Challenge[];
};

const SECTIONS: SpickerSection[] = [
  {
    id: 'potenz',
    title: 'Potenzgesetze & Zahlbereiche',
    timeframe: '11.09 – 30.09',
    summary: 'Multiplikation, Division und Potenzieren mit rationalen Exponenten. Fokus der Lernkanon-Wochen 09.11, 09.16 und 09.25.',
    bullets: [
      'Gleiche Basis ⇒ Exponenten addieren/subtrahieren',
      'Negative Exponenten erzeugen den Kehrwert',
      'Zahlbereiche: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, Irrationale Zahlen (𝕀) entstehen durch Wurzeln wie √5',
      'Wissenschaftliche Schreibweise: 1 ≤ |a| < 10 mit Zehnerpotenz',
    ],
    challenges: [
      { id: 'pot1', prompt: 'Berechne 3⁴ · 3² ohne Taschenrechner.', answer: '3⁶ = 729', hint: 'Exponenten addieren: 4 + 2' },
      { id: 'pot2', prompt: 'Schreibe 0,00052 in wissenschaftlicher Schreibweise.', answer: '5,2 · 10⁻⁴' },
      { id: 'pot3', prompt: 'Ordne √2, 7/3, -5 den Zahlbereichen zu.', answer: '√2 ∈ 𝕀, ℝ | 7/3 ∈ ℚ, ℝ | -5 ∈ ℤ, ℚ, ℝ' },
    ],
  },
  {
    id: 'wurzel',
    title: 'Wurzelgleichungen & Heron-Verfahren',
    timeframe: '23.09 – 02.10',
    summary: 'Heron-Methode (09.23) und Wurzelgleichungen mit Probe (10.02). Wichtig: Definitionsmenge kontrollieren!',
    bullets: [
      'Heron: x_{n+1} = (x_n + a/x_n) / 2, Startwert x₀ ≈ a/2',
      'Bei Wurzelgleichungen immer beide Seiten quadrieren und danach Probe',
      'n-te Wurzeln als Potenz mit Exponent 1/n schreiben',
      'Wurzelgesetze gelten nur für nichtnegative Radikanden',
    ],
    challenges: [
      { id: 'wur1', prompt: 'Führe einen Heron-Schritt für √7 mit x₀ = 2 durch.', answer: 'x₁ = (2 + 7/2)/2 = 2,75' },
      { id: 'wur2', prompt: 'Löse √(5x + 9) = x + 1.', answer: 'x = 2 (Probe: √19 = 3 +? Nein ⇒ keine Lösung) ⇒ keine reelle Lösung', hint: 'Definitionsmenge: x ≥ -1' },
      { id: 'wur3', prompt: 'Umformen: ³√(a²) als Potenz.', answer: 'a^(2/3)' },
    ],
  },
  {
    id: 'scheitel',
    title: 'Quadratische Ergänzung & Anwendungen',
    timeframe: '18.11 – 11.12',
    summary: 'Von der allgemeinen Form zur Scheitelpunktform (23.11, 02.12, 04.12) und Anwendungen (09.12, 11.12).',
    bullets: [
      'Scheitel direkt aus SPF: f(x) = a(x - d)² + e ⇒ S(d|e)',
      'Allgemeine Form: Scheitel bei x = -b/(2a), danach y = f(x)',
      'Diskriminante bestimmt die Anzahl der Nullstellen',
      'Gestreckte/gestauchte Parabeln: |a| > 1 schmal, |a| < 1 breit, a < 0 ⇒ Spiegelung',
    ],
    challenges: [
      { id: 'sch1', prompt: 'Bestimme die Scheitelpunktform von f(x) = x² + 4x + 2.', answer: '(x + 2)² - 2' },
      { id: 'sch2', prompt: 'Wie viele Nullstellen hat f(x) = 2x² + 20x + 50?', answer: 'Keine, da Δ = 20² - 4·2·50 = 0 ⇒ eine Nullstelle x = -5, aber Parabel berührt x-Achse (S(-5|0)).' },
      { id: 'sch3', prompt: 'Was passiert mit der Parabel, wenn a = -1,5?', answer: 'Spiegelung an der x-Achse und Streckung (schmaler, nach unten geöffnet).' },
    ],
  },
];

const createPotenzTry = () => {
  const base = Math.floor(Math.random() * 6) + 2; // 2..7
  const exp1 = Math.floor(Math.random() * 4) + 1; // 1..4
  const exp2 = Math.floor(Math.random() * 5) - 2; // -2..2
  const op = Math.random() > 0.5 ? '·' : ':';
  return { base, exp1, exp2, op };
};

export const SpickerTrainer: React.FC<SpickerTrainerProps> = ({ onClose }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [potenzTry, setPotenzTry] = useState(createPotenzTry());
  const [showTrySolution, setShowTrySolution] = useState(false);

  const potenzTrySolution = useMemo(() => {
    const { base, exp1, exp2, op } = potenzTry;
    const exponent = op === '·' ? exp1 + exp2 : exp1 - exp2;
    const value = Math.pow(base, exponent);
    const step = op === '·'
      ? `${base}^${exp1} · ${base}^${exp2} = ${base}^(${exp1} + ${exp2}) = ${base}^${exponent}`
      : `${base}^${exp1} : ${base}^${exp2} = ${base}^(${exp1} - ${exp2}) = ${base}^${exponent}`;
    const finalStep = exponent < 0 ? `= 1/${base}^${Math.abs(exponent)} = ${value}` : `= ${value}`;
    return { step, finalStep };
  }, [potenzTry]);

  const toggleReveal = (id: string) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-4 border-slate-200 dark:border-slate-800 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Spicker-Coach</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Für schnelle Checks aus dem Lernkanon (Potenzen & Quadratische Funktionen, 09. – 12.2025)
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white text-slate-500 border-2 border-slate-200 font-bold hover:bg-rose-500 hover:text-white">
            ✕
          </button>
        )}
      </div>

      <div className="space-y-5">
        {SECTIONS.map(section => (
          <div key={section.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">{section.timeframe}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <span className="text-xs font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
                Lernkanon
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">{section.summary}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.bullets.map((bullet, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-200 font-semibold bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-4 py-2">
                  • {bullet}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              {section.challenges.map(challenge => {
                const id = `${section.id}-${challenge.id}`;
                const isRevealed = revealed[id];
                return (
                  <div key={challenge.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-900/60">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{challenge.prompt}</p>
                      <button
                        onClick={() => toggleReveal(id)}
                        className="text-xs uppercase font-black px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        {isRevealed ? 'Antwort verbergen' : 'Antwort zeigen'}
                      </button>
                    </div>
                    {challenge.hint && <p className="text-xs text-slate-400 mt-1">Hint: {challenge.hint}</p>}
                    {isRevealed && (
                      <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800 text-sm font-black text-emerald-600 dark:text-emerald-300">
                        {challenge.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-[2rem] text-white p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-200">Try-Modus</p>
            <h3 className="text-2xl font-black uppercase tracking-widest">Potenz Quick Checks</h3>
          </div>
          <button
            onClick={() => {
              setPotenzTry(createPotenzTry());
              setShowTrySolution(false);
            }}
            className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/30"
          >
            Neue Aufgabe
          </button>
        </div>
        <div className="bg-indigo-900/40 rounded-2xl p-4 font-mono text-lg text-center">
          {potenzTry.base}^{potenzTry.exp1} {potenzTry.op} {potenzTry.base}^{potenzTry.exp2}
        </div>
        {!showTrySolution ? (
          <button
            onClick={() => setShowTrySolution(true)}
            className="w-full py-3 rounded-xl bg-white text-indigo-700 font-black uppercase tracking-widest hover:bg-indigo-50"
          >
            Lösung anzeigen
          </button>
        ) : (
          <div className="bg-white text-slate-900 rounded-2xl p-4 font-mono text-sm space-y-1">
            <p>{potenzTrySolution.step}</p>
            <p>{potenzTrySolution.finalStep}</p>
          </div>
        )}
      </div>
    </div>
  );
};

