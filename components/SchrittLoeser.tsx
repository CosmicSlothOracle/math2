/**
 * SchrittLoeser - Tool für schrittweise Lösungen
 *
 * Features:
 * - Potenzgesetze: Schrittweise Vereinfachung
 * - Wurzelgleichungen: Quadrieren, Umformen, Probe
 * - Quadratische Ergänzung: Jeder Schritt visualisiert
 * - Nullstellen-Berechnung: pq-Formel mit Zwischenschritten
 */

import React, { useState } from 'react';

interface SchrittLoeserProps {
  onClose?: () => void;
}

type SolutionMode = 'potenz' | 'wurzelgleichung' | 'quadratische_ergaenzung' | 'nullstellen';

export const SchrittLoeser: React.FC<SchrittLoeserProps> = ({ onClose }) => {
  const [mode, setMode] = useState<SolutionMode>('potenz');
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState<Array<{ step: number; description: string; formula: string }>>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const solvePotenz = (expr: string) => {
    const solutionSteps: Array<{ step: number; description: string; formula: string }> = [];
    let stepNum = 1;

    try {
      // Beispiel: (2^3)^4
      if (expr.includes(')^')) {
        const match = expr.match(/\((\d+)\^(\d+)\)\^(\d+)/);
        if (match) {
          const base = parseInt(match[1]);
          const exp1 = parseInt(match[2]);
          const exp2 = parseInt(match[3]);
          solutionSteps.push({
            step: stepNum++,
            description: 'Potenzgesetz: (a^n)^m = a^(n·m)',
            formula: `(${base}^${exp1})^${exp2} = ${base}^(${exp1} · ${exp2})`,
          });
          const newExp = exp1 * exp2;
          solutionSteps.push({
            step: stepNum++,
            description: 'Exponenten multiplizieren',
            formula: `= ${base}^${newExp}`,
          });
          const result = Math.pow(base, newExp);
          solutionSteps.push({
            step: stepNum++,
            description: 'Ergebnis berechnen',
            formula: `= ${result}`,
          });
        }
      }
      // Beispiel: 2^5 · 2^3
      else if (expr.includes('*')) {
        const parts = expr.split('*').map(p => p.trim());
        if (parts.length === 2) {
          const leftMatch = parts[0].match(/(\d+)\^(\d+)/);
          const rightMatch = parts[1].match(/(\d+)\^(\d+)/);
          if (leftMatch && rightMatch && leftMatch[1] === rightMatch[1]) {
            const base = parseInt(leftMatch[1]);
            const exp1 = parseInt(leftMatch[2]);
            const exp2 = parseInt(rightMatch[2]);
            solutionSteps.push({
              step: stepNum++,
              description: 'Potenzgesetz: a^n · a^m = a^(n+m)',
              formula: `${base}^${exp1} · ${base}^${exp2} = ${base}^(${exp1} + ${exp2})`,
            });
            const newExp = exp1 + exp2;
            solutionSteps.push({
              step: stepNum++,
              description: 'Exponenten addieren',
              formula: `= ${base}^${newExp}`,
            });
            const result = Math.pow(base, newExp);
            solutionSteps.push({
              step: stepNum++,
              description: 'Ergebnis berechnen',
              formula: `= ${result}`,
            });
          }
        }
      }
    } catch (e) {
      solutionSteps.push({
        step: 1,
        description: 'Fehler',
        formula: 'Ungültige Eingabe',
      });
    }

    setSteps(solutionSteps);
    setCurrentStep(0);
  };

  const solveWurzelgleichung = (expr: string) => {
    const solutionSteps: Array<{ step: number; description: string; formula: string }> = [];
    let stepNum = 1;

    try {
      // Beispiel: √(x+3) = 5
      const match = expr.match(/√\(([^)]+)\)\s*=\s*(\d+)/);
      if (match) {
        const inner = match[1];
        const right = parseInt(match[2]);
        solutionSteps.push({
          step: stepNum++,
          description: 'Gegebene Gleichung',
          formula: `√(${inner}) = ${right}`,
        });
        solutionSteps.push({
          step: stepNum++,
          description: 'Beide Seiten quadrieren',
          formula: `(√(${inner}))² = ${right}²`,
        });
        solutionSteps.push({
          step: stepNum++,
          description: 'Wurzel und Quadrat heben sich auf',
          formula: `${inner} = ${right * right}`,
        });
        // Vereinfachen falls möglich
        if (inner.includes('x')) {
          const xMatch = inner.match(/x\s*([+-])\s*(\d+)/);
          if (xMatch) {
            const op = xMatch[1];
            const num = parseInt(xMatch[2]);
            const target = right * right;
            const xValue = op === '+' ? target - num : target + num;
            solutionSteps.push({
              step: stepNum++,
              description: 'Nach x auflösen',
              formula: `x = ${xValue}`,
            });
            solutionSteps.push({
              step: stepNum++,
              description: 'Probe durchführen',
              formula: `√(${xValue}${op === '+' ? '+' : '-'}${num}) = √${target} = ${right} ✓`,
            });
          }
        }
      }
    } catch (e) {
      solutionSteps.push({
        step: 1,
        description: 'Fehler',
        formula: 'Ungültige Eingabe',
      });
    }

    setSteps(solutionSteps);
    setCurrentStep(0);
  };

  const solveQuadratischeErgaenzung = (expr: string) => {
    const solutionSteps: Array<{ step: number; description: string; formula: string }> = [];
    let stepNum = 1;

    try {
      // Beispiel: x² + 6x + 5
      const match = expr.match(/x²\s*([+-]\d+)x\s*([+-]\d+)/);
      if (match) {
        const p = parseInt(match[1]);
        const q = parseInt(match[2]);
        solutionSteps.push({
          step: stepNum++,
          description: 'Gegebener Term',
          formula: `x² ${p >= 0 ? '+' : ''}${p}x ${q >= 0 ? '+' : ''}${q}`,
        });
        const halfP = p / 2;
        const squareHalfP = halfP * halfP;
        solutionSteps.push({
          step: stepNum++,
          description: 'Quadratische Ergänzung: (p/2)²',
          formula: `(p/2)² = (${p}/2)² = ${halfP}² = ${squareHalfP}`,
        });
        solutionSteps.push({
          step: stepNum++,
          description: 'Addieren und subtrahieren',
          formula: `x² ${p >= 0 ? '+' : ''}${p}x + ${squareHalfP} - ${squareHalfP} ${q >= 0 ? '+' : ''}${q}`,
        });
        solutionSteps.push({
          step: stepNum++,
          description: 'Binomische Formel anwenden',
          formula: `(x ${halfP >= 0 ? '+' : ''}${halfP})² - ${squareHalfP} ${q >= 0 ? '+' : ''}${q}`,
        });
        const constant = -squareHalfP + q;
        solutionSteps.push({
          step: stepNum++,
          description: 'Konstante zusammenfassen',
          formula: `(x ${halfP >= 0 ? '+' : ''}${halfP})² ${constant >= 0 ? '+' : ''}${constant}`,
        });
      }
    } catch (e) {
      solutionSteps.push({
        step: 1,
        description: 'Fehler',
        formula: 'Ungültige Eingabe',
      });
    }

    setSteps(solutionSteps);
    setCurrentStep(0);
  };

  const solveNullstellen = (expr: string) => {
    const solutionSteps: Array<{ step: number; description: string; formula: string }> = [];
    let stepNum = 1;

    try {
      // Beispiel: x² + 6x + 5 = 0
      const match = expr.match(/x²\s*([+-]\d+)x\s*([+-]\d+)\s*=\s*0/);
      if (match) {
        const p = parseInt(match[1]);
        const q = parseInt(match[2]);
        solutionSteps.push({
          step: stepNum++,
          description: 'Gegebene Gleichung',
          formula: `x² ${p >= 0 ? '+' : ''}${p}x ${q >= 0 ? '+' : ''}${q} = 0`,
        });
        solutionSteps.push({
          step: stepNum++,
          description: 'pq-Formel: x₁,₂ = -p/2 ± √((p/2)² - q)',
          formula: `x₁,₂ = -(${p})/2 ± √((${p}/2)² - ${q})`,
        });
        const halfP = p / 2;
        const discriminant = halfP * halfP - q;
        solutionSteps.push({
          step: stepNum++,
          description: 'Diskriminante berechnen',
          formula: `D = (${halfP})² - ${q} = ${discriminant}`,
        });
        if (discriminant >= 0) {
          const sqrtD = Math.sqrt(discriminant);
          const x1 = -halfP + sqrtD;
          const x2 = -halfP - sqrtD;
          solutionSteps.push({
            step: stepNum++,
            description: 'Wurzel ziehen',
            formula: `√${discriminant} = ${sqrtD.toFixed(4)}`,
          });
          solutionSteps.push({
            step: stepNum++,
            description: 'Lösungen berechnen',
            formula: `x₁ = ${-halfP} + ${sqrtD.toFixed(4)} = ${x1.toFixed(4)}`,
          });
          solutionSteps.push({
            step: stepNum++,
            description: '',
            formula: `x₂ = ${-halfP} - ${sqrtD.toFixed(4)} = ${x2.toFixed(4)}`,
          });
        } else {
          solutionSteps.push({
            step: stepNum++,
            description: 'Keine reellen Lösungen',
            formula: `D < 0 → keine Lösung`,
          });
        }
      }
    } catch (e) {
      solutionSteps.push({
        step: 1,
        description: 'Fehler',
        formula: 'Ungültige Eingabe',
      });
    }

    setSteps(solutionSteps);
    setCurrentStep(0);
  };

  const handleSolve = () => {
    setSteps([]);
    setCurrentStep(0);

    switch (mode) {
      case 'potenz':
        solvePotenz(input);
        break;
      case 'wurzelgleichung':
        solveWurzelgleichung(input);
        break;
      case 'quadratische_ergaenzung':
        solveQuadratischeErgaenzung(input);
        break;
      case 'nullstellen':
        solveNullstellen(input);
        break;
    }
  };

  const getModePlaceholder = () => {
    switch (mode) {
      case 'potenz':
        return 'z.B. (2^3)^4 oder 2^5 * 2^3';
      case 'wurzelgleichung':
        return 'z.B. √(x+3) = 5';
      case 'quadratische_ergaenzung':
        return 'z.B. x² + 6x + 5';
      case 'nullstellen':
        return 'z.B. x² + 6x + 5 = 0';
      default:
        return '';
    }
  };

  const visibleSteps = steps.slice(0, currentStep + 1);

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
      <h2 className="text-2xl font-bold mb-4">Schritt-für-Schritt-Loeser 📝</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Modus:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as SolutionMode)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="potenz">Potenzgesetze</option>
          <option value="wurzelgleichung">Wurzelgleichungen</option>
          <option value="quadratische_ergaenzung">Quadratische Ergänzung</option>
          <option value="nullstellen">Nullstellen (pq-Formel)</option>
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
          onKeyPress={(e) => e.key === 'Enter' && handleSolve()}
        />
      </div>

      <button
        onClick={handleSolve}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        Lösen
      </button>

      {steps.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Schritt {currentStep + 1} von {steps.length}</span>
            <div>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 mr-2"
              >
                ← Vorheriger
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Nächster →
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded space-y-2">
            {visibleSteps.map((s, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Schritt {s.step}: {s.description}
                </div>
                <div className="text-base font-mono">{s.formula}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

