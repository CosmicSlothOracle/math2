/**
 * Potenzen & Reelle Zahlen - Quest-Aufgaben (Standard)
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 1 (2025-26)
 * Aufgaben 5-20: Potenzgesetze, Terme, Wurzeln, Wurzelgleichungen
 */

import { Task } from '../types';

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * POWER-WORKOUT: Potenzgesetze (Aufgaben 5-8)
 */
export function createPotenzgesetzeQuest(index: number, seed: number): Task {
  const id = `potenzen-power-${index}-${seed}`;
  const scenarioIndex = index % 6;

  // Gemeinsame Zufallswerte
  const base = getRandomInt(2, 9);
  const m = getRandomInt(2, 8);
  const n = getRandomInt(2, 6);
  const a = getRandomInt(2, 5);
  const b = getRandomInt(2, 5);

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Potenzen multiplizieren (a^m · a^n = a^(m+n))
      const result = Math.pow(base, m + n);
      question = `Fasse zusammen und berechne: ${base}^${m} · ${base}^${n}`;
      answer = result.toString();
      explanation = `Potenzen mit gleicher Basis multiplizieren: Exponenten addieren. ${base}^${m} · ${base}^${n} = ${base}^${m + n} = ${result}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.01 };
      break;
    }
    case 1: {
      // Potenzen dividieren (a^m : a^n = a^(m-n))
      const result = Math.pow(base, m - n);
      question = `Fasse zusammen und berechne: ${base}^${m} : ${base}^${n}`;
      answer = result.toString();
      explanation = `Potenzen mit gleicher Basis dividieren: Exponenten subtrahieren. ${base}^${m} : ${base}^${n} = ${base}^${m - n} = ${result}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.01 };
      break;
    }
    case 2: {
      // Potenz potenzieren ((a^m)^n = a^(m·n))
      const result = Math.pow(base, m * n);
      question = `Fasse zusammen und berechne: (${base}^${m})^${n}`;
      answer = result.toString();
      explanation = `Potenz potenzieren: Exponenten multiplizieren. (${base}^${m})^${n} = ${base}^${m * n} = ${result}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.01 };
      break;
    }
    case 3: {
      // Negative Exponenten (a^(-n) = 1/(a^n))
      const smallBase = getRandomInt(2, 6);
      const smallN = getRandomInt(2, 4);
      const denominator = Math.pow(smallBase, smallN);
      question = `Berechne: ${smallBase}^(-${smallN}). Gib das Ergebnis als Bruch an (z.B. 1/8).`;
      answer = `1/${denominator}`;
      explanation = `Negativer Exponent: Kehrwert bilden. ${smallBase}^(-${smallN}) = 1/(${smallBase}^${smallN}) = 1/${denominator}`;
      validator = {
        type: 'keywords',
        keywordsAll: ['1', String(denominator)],
        keywordsAny: [`1/${denominator}`, String(1 / denominator)],
      };
      break;
    }
    case 4: {
      // Produkt potenzieren ((a·b)^n = a^n · b^n)
      const smallN = getRandomInt(2, 4);
      const result = Math.pow(a * b, smallN);
      question = `Fasse zusammen und berechne: (${a} · ${b})^${smallN}`;
      answer = result.toString();
      explanation = `Produkt potenzieren: Jeden Faktor einzeln potenzieren. (${a} · ${b})^${smallN} = ${a}^${smallN} · ${b}^${smallN} = ${Math.pow(a, smallN)} · ${Math.pow(b, smallN)} = ${result}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.01 };
      break;
    }
    default: {
      // Quotient potenzieren ((a/b)^n = a^n / b^n)
      const smallN = getRandomInt(2, 3);
      const numerator = Math.pow(a, smallN);
      const denominator = Math.pow(b, smallN);
      const numResult = numerator / denominator;
      question = `Fasse zusammen und berechne: (${a}/${b})^${smallN}. Gib das Ergebnis als ganze Zahl oder Bruch an.`;
      answer = numResult % 1 === 0 ? numResult.toString() : `${numerator}/${denominator}`;
      explanation = `Quotient potenzieren: Zähler und Nenner einzeln potenzieren. (${a}/${b})^${smallN} = ${a}^${smallN}/${b}^${smallN} = ${numerator}/${denominator}`;
      if (numResult % 1 === 0) {
        validator = { type: 'numericTolerance', numericAnswer: numResult, tolerance: 0.01 };
      } else {
        validator = { type: 'keywords', keywordsAll: [String(numerator), String(denominator)] };
      }
      break;
    }
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer,
    explanation,
    difficultyLevel: 'Mittel',
    validator,
  };
}

/**
 * TERM-TUNER: Terme mit Variablen vereinfachen (Aufgaben 9-11)
 */
export function createTermTunerQuest(index: number, seed: number): Task {
  const id = `potenzen-term-${index}-${seed}`;
  const scenarioIndex = index % 4;

  const a = getRandomInt(2, 9);
  const m = getRandomInt(2, 6);
  const n = getRandomInt(2, 5);
  const b = getRandomInt(2, 5);

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Term in Form a^n umformen (Multiplikation)
      const exponent = m + n;
      question = `Forme um: ${a}^${m} · ${a}^${n} = ? (Schreibe als Potenz: a^exponent)`;
      answer = `${a}^${exponent}`;
      explanation = `Gleiche Basis: Exponenten addieren. ${a}^${m} · ${a}^${n} = ${a}^${exponent}`;
      validator = { type: 'keywords', keywordsAll: [String(a), String(exponent)] };
      break;
    }
    case 1: {
      // Potenz potenzieren als a^n
      const exponent = m * n;
      question = `Forme um: (${a}^${m})^${n} = ? (Schreibe als Potenz: a^exponent)`;
      answer = `${a}^${exponent}`;
      explanation = `Potenz potenzieren: Exponenten multiplizieren. (${a}^${m})^${n} = ${a}^${exponent}`;
      validator = { type: 'keywords', keywordsAll: [String(a), String(exponent)] };
      break;
    }
    case 2: {
      // Positive Exponenten schreiben
      const base = getRandomInt(2, 8);
      question = `Schreibe mit positivem Exponenten: ${base}x^(-${n})`;
      answer = `${base}/x^${n}`;
      explanation = `Negativer Exponent wird zu Bruch: ${base}x^(-${n}) = ${base}/(x^${n})`;
      validator = { type: 'keywords', keywordsAll: [String(base), String(n)], keywordsAny: ['/', 'x'] };
      break;
    }
    default: {
      // Produkt potenzieren
      const product = a * b;
      question = `Forme um: (${a}^${n} · ${b}^${n}) = ? (Schreibe als Potenz: (a*b)^n)`;
      answer = `(${product})^${n}`;
      explanation = `Gleicher Exponent: Basis multiplizieren. ${a}^${n} · ${b}^${n} = (${a}·${b})^${n} = ${product}^${n}`;
      validator = { type: 'keywords', keywordsAll: [String(product), String(n)] };
      break;
    }
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer,
    explanation,
    difficultyLevel: 'Mittel',
    validator,
  };
}

/**
 * WURZEL-LABOR: Wurzeln und Potenzen mit rationalen Exponenten (Aufgaben 12, 13, 15, 18, 19)
 */
export function createWurzelLaborQuest(index: number, seed: number): Task {
  const id = `potenzen-wurzel-${index}-${seed}`;
  const scenarioIndex = index % 4;

  // Perfekte Potenzen für saubere Ergebnisse
  const perfectPowers = [4, 8, 9, 16, 25, 27, 32, 64, 81, 125];
  const a = perfectPowers[getRandomInt(0, perfectPowers.length - 1)];
  const n = [2, 3, 4][getRandomInt(0, 2)];
  const m = getRandomInt(1, 3);

  const rootSymbol = (root: number) => (root === 2 ? '√' : `${root}√`);

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Wurzel als Potenz schreiben (ⁿ√a = a^(1/n))
      question = `Schreibe als Potenz: ${rootSymbol(n)}${a}`;
      answer = `${a}^(1/${n})`;
      explanation = `n-te Wurzel als Potenz: ${rootSymbol(n)}${a} = ${a}^(1/${n})`;
      validator = { type: 'keywords', keywordsAll: [String(a), String(n), '1'] };
      break;
    }
    case 1: {
      // Potenz als Wurzel schreiben (a^(1/n) = ⁿ√a)
      question = `Schreibe als Wurzel: ${a}^(1/${n})`;
      answer = `${rootSymbol(n)}${a}`;
      explanation = `Potenz als Wurzel: ${a}^(1/${n}) = ${rootSymbol(n)}${a}`;
      validator = { type: 'keywords', keywordsAll: [String(a)], keywordsAny: ['√', String(n)] };
      break;
    }
    case 2: {
      // Rationale Exponenten (a^(m/n))
      question = `Schreibe als Wurzel: ${a}^(${m}/${n})`;
      answer = m === 1 ? `${rootSymbol(n)}${a}` : `${rootSymbol(n)}(${a}^${m})`;
      explanation = `Rationale Exponenten: ${a}^(${m}/${n}) = ${rootSymbol(n)}(${a}^${m}) = (${rootSymbol(n)}${a})^${m}`;
      validator = { type: 'keywords', keywordsAll: [String(a), String(n)], keywordsAny: [String(m), '√'] };
      break;
    }
    default: {
      // n-te Wurzel berechnen
      const numResult = Math.pow(a, 1 / n);
      const isExact = numResult % 1 === 0;
      question = `Berechne: ${rootSymbol(n)}${a}`;
      answer = isExact ? numResult.toString() : numResult.toFixed(2);
      explanation = `${rootSymbol(n)}${a} = ${a}^(1/${n}) ${isExact ? '=' : '≈'} ${answer}`;
      validator = { type: 'numericTolerance', numericAnswer: numResult, tolerance: 0.05 };
      break;
    }
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer,
    explanation,
    difficultyLevel: 'Mittel',
    validator,
  };
}

/**
 * GLEICHUNGSKNACKER: Wurzelgleichungen lösen (Aufgabe 20)
 */
export function createGleichungsknackerQuest(index: number, seed: number): Task {
  const id = `potenzen-gleichung-${index}-${seed}`;
  const useTyp2 = index % 2 === 1;

  let question: string;
  let answer: number;
  let explanation: string;
  let validator: any;

  if (useTyp2) {
    // Typ 2: √(ax + b) = √(cx + d)
    let a = getRandomInt(2, 8);
    const b = getRandomInt(-15, 15);
    let c = getRandomInt(2, 8);
    const d = getRandomInt(-20, 20);

    // Stelle sicher, dass a ≠ c
    if (a === c) c = c + 1;

    answer = (d - b) / (a - c);
    const leftRadicand = a * answer + b;
    const rightRadicand = c * answer + d;

    const bSign = b >= 0 ? '+' : '';
    const dSign = d >= 0 ? '+' : '';

    question = `Löse die Gleichung: √(${a}x ${bSign} ${b}) = √(${c}x ${dSign} ${d})`;

    if (leftRadicand < 0 || rightRadicand < 0) {
      explanation = `Quadrieren: ${a}x ${bSign} ${b} = ${c}x ${dSign} ${d}, also x = ${answer}. Probe: Radikanden müssen ≥ 0 sein! Keine Lösung.`;
    } else {
      explanation = `Quadrieren: ${a}x ${bSign} ${b} = ${c}x ${dSign} ${d}, also x = ${answer.toFixed(2)}. Probe: √${leftRadicand.toFixed(1)} = √${rightRadicand.toFixed(1)} ✓`;
    }

    validator = { type: 'numericTolerance', numericAnswer: answer, tolerance: 0.01 };
  } else {
    // Typ 1: √(ax + b) = c
    const a = getRandomInt(2, 10);
    const c = getRandomInt(2, 10);
    const b = getRandomInt(-30, 30);

    answer = (c * c - b) / a;
    const radicand = a * answer + b;

    const bSign = b >= 0 ? '+' : '';

    question = `Löse die Gleichung: √(${a}x ${bSign} ${b}) = ${c}`;

    if (radicand < 0) {
      explanation = `Quadrieren: ${a}x ${bSign} ${b} = ${c * c}, also ${a}x = ${c * c - b}, daher x = ${answer.toFixed(2)}. Probe: Radikand ist negativ, daher keine Lösung!`;
      validator = { type: 'keywords', keywordsAny: ['keine', 'lösung', 'ungültig', 'nicht definiert'] };
    } else {
      explanation = `Quadrieren: ${a}x ${bSign} ${b} = ${c * c}, also ${a}x = ${c * c - b}, daher x = ${answer.toFixed(2)}. Probe: √(${a}·${answer.toFixed(2)} ${bSign} ${b}) = √${radicand.toFixed(1)} = ${c} ✓`;
      validator = { type: 'numericTolerance', numericAnswer: answer, tolerance: 0.01 };
    }
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer.toString(),
    explanation,
    difficultyLevel: 'Schwer',
    validator,
    instructions: 'Wichtig: Nach dem Quadrieren immer eine Probe durchführen!',
  };
}
