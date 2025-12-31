/**
 * Potenzen & Reelle Zahlen - Quest-Aufgaben (Standard)
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 1 (2025-26)
 * Aufgaben 5-20: Potenzgesetze, Terme, Wurzeln, Wurzelgleichungen
 * Lern_kanon: Zehnerpotenzen, wissenschaftliche Schreibweise
 */

import { Task } from '../types';

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * ZAHLEN-SORTIERER: Zahlbereiche erkennen und zuordnen
 * Basierend auf: Diagnosebogen HSG 9 KA 1 - Aufgabe 1
 */
export function createZahlbereicheQuest(index: number, seed: number): Task {
  const id = `potenzen-zahlbereiche-${index}-${seed}`;
  const scenarioIndex = index % 6;

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;
  let options: string[] | undefined;
  let taskType: 'input' | 'choice' = 'choice';

  switch (scenarioIndex) {
    case 0: {
      // Zahl einem Zahlbereich zuordnen
      question = 'Zu welchem kleinsten Zahlbereich gehört die Zahl √5?';
      options = ['N (Natürliche Zahlen)', 'Z (Ganze Zahlen)', 'Q (Rationale Zahlen)', 'I (Irrationale Zahlen)'];
      answer = '3'; // Index 3 = Irrationale Zahlen
      explanation = '√5 ist irrational, da 5 keine Quadratzahl ist. √5 ≈ 2,236... ist eine nicht-abbrechende, nicht-periodische Dezimalzahl.';
      validator = { type: 'exactIndex', correctIndex: 3 };
      break;
    }
    case 1: {
      // Irrationale Zahlen erkennen
      question = 'Welche dieser Zahlen ist irrational?';
      options = ['3/4', '√9', '√7', '-5'];
      answer = '2'; // Index 2 = √7
      explanation = '√7 ist irrational, da 7 keine Quadratzahl ist. √9 = 3 ist rational. 3/4 und -5 sind ebenfalls rational.';
      validator = { type: 'exactIndex', correctIndex: 2 };
      break;
    }
    case 2: {
      // Mengeninklusion verstehen
      question = 'Welche Aussage ist korrekt?';
      options = ['Q ⊂ Z (Q ist Teilmenge von Z)', 'N ⊂ Z ⊂ Q (N ist Teilmenge von Z, Z ist Teilmenge von Q)', 'I ⊂ Q (I ist Teilmenge von Q)', 'R ⊂ Q (R ist Teilmenge von Q)'];
      answer = '1'; // Index 1 = N ⊂ Z ⊂ Q
      explanation = 'Die Zahlbereiche bilden eine Hierarchie: N ⊂ Z ⊂ Q ⊂ R. Jede natürliche Zahl ist auch ganz, jede ganze auch rational, usw.';
      validator = { type: 'exactIndex', correctIndex: 1 };
      break;
    }
    case 3: {
      // Rationale Zahlen erkennen
      question = 'Ist die Zahl -9/4 rational oder irrational?';
      options = ['Rational', 'Irrational'];
      answer = '0'; // Index 0 = Rational
      explanation = '-9/4 ist ein Bruch aus zwei ganzen Zahlen, daher rational. Rationale Zahlen sind alle Zahlen, die als Bruch darstellbar sind.';
      validator = { type: 'exactIndex', correctIndex: 0 };
      break;
    }
    case 4: {
      // √9 richtig einordnen
      question = 'Zu welchem Zahlbereich gehört √9?';
      options = ['Nur zu R (Reelle Zahlen)', 'Zu N, Z, Q und R', 'Nur zu I (Irrationale Zahlen)', 'Nur zu Q (Rationale Zahlen)'];
      answer = '1'; // Index 1 = N, Z, Q, R
      explanation = '√9 = 3 ist eine natürliche Zahl. Natürliche Zahlen gehören auch zu Z, Q und R. Also: N ⊂ Z ⊂ Q ⊂ R.';
      validator = { type: 'exactIndex', correctIndex: 1 };
      break;
    }
    default: {
      // Null einordnen
      question = 'Zu welchen Zahlbereichen gehört die Zahl 0?';
      options = ['Nur zu N und Z', 'Zu Z, Q und R, aber nicht zu N', 'Zu N, Z, Q und R', 'Nur zu R'];
      // Hinweis: In manchen Definitionen gehört 0 zu N, in anderen nicht. Wir folgen der deutschen Schuldefinition (0 ∈ N).
      answer = '2'; // Index 2 = N, Z, Q, R nach deutscher Schuldefinition
      explanation = 'Die Zahl 0 gehört nach der deutschen Schuldefinition zu den natürlichen Zahlen (0 ∈ N). Sie gehört also zu N, Z, Q und R. Achtung: In manchen Ländern wird 0 nicht zu N gezählt, aber hier verwenden wir die deutsche Definition.';
      validator = { type: 'exactIndex', correctIndex: 2 }; // N, Z, Q, R nach deutscher Schuldefinition
      break;
    }
  }

  if (options) {
    return {
      id,
      type: 'choice',
      question,
      options,
      correctAnswer: parseInt(answer),
      explanation,
      difficultyLevel: 'Mittel',
    };
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
 * ZEHNERPOTENZEN-MASTER: Wissenschaftliche Schreibweise und Zehnerpotenzen
 * Basierend auf: Lern_kanon 2025-09-09, 2025-10-09
 */
export function createZehnerpotenzenQuest(index: number, seed: number): Task {
  const id = `potenzen-zehner-${index}-${seed}`;
  const scenarioIndex = index % 6;

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Normale Zahl → wissenschaftliche Schreibweise (große Zahlen)
      const num = getRandomInt(1000, 999999);
      const numStr = num.toString();
      const firstDigit = parseInt(numStr[0]);
      const restDigits = numStr.substring(1).replace(/^0+/, '');
      const exponent = numStr.length - 1;
      const mantissa = parseFloat(`${firstDigit}.${restDigits || '0'}`).toFixed(restDigits ? restDigits.length : 0);
      question = `Schreibe in wissenschaftlicher Schreibweise: ${num.toLocaleString('de-DE')}`;
      answer = `${mantissa} · 10^${exponent}`;
      explanation = `Die wissenschaftliche Schreibweise hat immer die Form: Zahl zwischen 1 und 10 (Mantisse) · 10^Exponent. Für ${num}: Verschiebe das Komma so, dass eine Zahl zwischen 1 und 10 entsteht (${mantissa}). Du musstest das Komma ${exponent} Stellen nach links verschieben, daher Exponent ${exponent}. Ergebnis: ${mantissa} · 10^${exponent}`;
      validator = {
        type: 'keywords',
        keywordsAll: [mantissa.split('.')[0], '10', String(exponent)],
        keywordsAny: ['·', '*', 'e', '^'],
      };
      break;
    }
    case 1: {
      // Normale Zahl → wissenschaftliche Schreibweise (kleine Zahlen)
      const num = getRandomInt(1, 999) / 10000; // 0,0001 bis 0,0999
      const numStr = num.toString().replace('0.', '');
      const firstNonZero = numStr.search(/[1-9]/);
      const exponent = -(firstNonZero + 1);
      const mantissa = parseFloat(numStr.substring(firstNonZero, firstNonZero + 1) + '.' + numStr.substring(firstNonZero + 1)).toFixed(4);
      question = `Schreibe in wissenschaftlicher Schreibweise: ${num.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
      answer = `${mantissa} · 10^${exponent}`;
      explanation = `Für kleine Zahlen (kleiner als 1): Verschiebe das Komma so, dass die erste Ziffer ungleich 0 direkt nach dem Komma steht (${mantissa}). Du musstest das Komma ${Math.abs(exponent)} Stellen nach rechts verschieben, daher negativer Exponent ${exponent}. Ergebnis: ${mantissa} · 10^${exponent}`;
      validator = {
        type: 'keywords',
        keywordsAll: [mantissa.split('.')[0], '10', String(exponent)],
        keywordsAny: ['·', '*', 'e', '^'],
      };
      break;
    }
    case 2: {
      // Wissenschaftliche Schreibweise → normale Zahl
      const mantissa = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const exponent = getRandomInt(2, 6);
      const result = mantissa * Math.pow(10, exponent);
      question = `Schreibe aus: ${mantissa.toFixed(1)} · 10^${exponent}`;
      answer = Math.round(result).toString();
      explanation = `${mantissa.toFixed(1)} · 10^${exponent} = ${mantissa.toFixed(1)} · ${Math.pow(10, exponent)} = ${result.toFixed(0)}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 1 };
      break;
    }
    case 3: {
      // Wissenschaftliche Schreibweise → normale Zahl (negativer Exponent)
      const mantissa = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const exponent = -getRandomInt(2, 5);
      const result = mantissa * Math.pow(10, exponent);
      question = `Schreibe aus: ${mantissa.toFixed(1)} · 10^${exponent}`;
      answer = result.toFixed(4);
      explanation = `${mantissa.toFixed(1)} · 10^${exponent} = ${mantissa.toFixed(1)} · ${Math.pow(10, exponent)} = ${result.toFixed(4)}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.0001 };
      break;
    }
    case 4: {
      // Rechnen mit Zehnerpotenzen (Multiplikation)
      const m1 = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const e1 = getRandomInt(2, 5);
      const m2 = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const e2 = getRandomInt(2, 5);
      const result = m1 * m2 * Math.pow(10, e1 + e2);
      const resultMantissa = (m1 * m2).toFixed(1);
      const resultExponent = e1 + e2;
      question = `Berechne: ${m1.toFixed(1)} · 10^${e1} · ${m2.toFixed(1)} · 10^${e2}. Gib das Ergebnis in wissenschaftlicher Schreibweise an.`;
      answer = `${resultMantissa} · 10^${resultExponent}`;
      explanation = `Multiplikation: (${m1.toFixed(1)} · ${m2.toFixed(1)}) · 10^${e1 + e2} = ${resultMantissa} · 10^${resultExponent}`;
      validator = {
        type: 'keywords',
        keywordsAll: [resultMantissa.split('.')[0], '10', String(resultExponent)],
        keywordsAny: ['·', '*', 'e', '^'],
      };
      break;
    }
    default: {
      // Rechnen mit Zehnerpotenzen (Division)
      const m1 = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const e1 = getRandomInt(3, 6);
      const m2 = getRandomInt(1, 9) + getRandomInt(0, 9) / 10;
      const e2 = getRandomInt(2, 4);
      const result = (m1 / m2) * Math.pow(10, e1 - e2);
      const resultMantissa = (m1 / m2).toFixed(1);
      const resultExponent = e1 - e2;
      question = `Berechne: (${m1.toFixed(1)} · 10^${e1}) : (${m2.toFixed(1)} · 10^${e2}). Gib das Ergebnis in wissenschaftlicher Schreibweise an.`;
      answer = `${resultMantissa} · 10^${resultExponent}`;
      explanation = `Division: (${m1.toFixed(1)} / ${m2.toFixed(1)}) · 10^${e1 - e2} = ${resultMantissa} · 10^${resultExponent}`;
      validator = {
        type: 'keywords',
        keywordsAll: [resultMantissa.split('.')[0], '10', String(resultExponent)],
        keywordsAny: ['·', '*', 'e', '^'],
      };
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
 * POWER-WORKOUT: Potenzgesetze (Aufgaben 5-8)
 * Erweitert basierend auf: Lern_kanon 2025-09-11, 2025-09-16
 */
export function createPotenzgesetzeQuest(index: number, seed: number): Task {
  const id = `potenzen-power-${index}-${seed}`;
  const scenarioIndex = index % 8; // Erweitert von 6 auf 8 für mehr Variationen

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
    case 5: {
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
    case 6: {
      // Potenzen mit negativen Exponenten kombinieren (a^(-m) · a^(-n))
      const smallBase = getRandomInt(2, 5);
      const m = getRandomInt(2, 4);
      const n = getRandomInt(2, 4);
      const result = Math.pow(smallBase, -(m + n));
      const denominator = Math.pow(smallBase, m + n);
      question = `Fasse zusammen: ${smallBase}^(-${m}) · ${smallBase}^(-${n})`;
      answer = `1/${denominator}`;
      explanation = `Potenzen mit gleicher Basis multiplizieren: Exponenten addieren. ${smallBase}^(-${m}) · ${smallBase}^(-${n}) = ${smallBase}^(-${m + n})) = 1/${denominator}`;
      validator = {
        type: 'keywords',
        keywordsAll: ['1', String(denominator)],
        keywordsAny: [`1/${denominator}`],
      };
      break;
    }
    default: {
      // Komplexe Potenzgesetze: (a^n)^m mit negativen Exponenten
      const smallBase = getRandomInt(2, 5);
      const m = getRandomInt(2, 3);
      const n = getRandomInt(2, 3);
      const result = Math.pow(smallBase, m * n);
      question = `Fasse zusammen und berechne: (${smallBase}^${m})^${n}`;
      answer = result.toString();
      explanation = `Potenz potenzieren: Exponenten multiplizieren. (${smallBase}^${m})^${n} = ${smallBase}^${m * n} = ${result}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.01 };
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
 * Erweitert basierend auf: Lern_kanon 2025-09-11, 2025-09-16
 */
export function createTermTunerQuest(index: number, seed: number): Task {
  const id = `potenzen-term-${index}-${seed}`;
  const scenarioIndex = index % 6; // Erweitert von 4 auf 6

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
    case 3: {
      // Produkt potenzieren
      const product = a * b;
      question = `Forme um: (${a}^${n} · ${b}^${n}) = ? (Schreibe als Potenz: (a*b)^n)`;
      answer = `(${product})^${n}`;
      explanation = `Gleicher Exponent: Basis multiplizieren. ${a}^${n} · ${b}^${n} = (${a}·${b})^${n} = ${product}^${n}`;
      validator = { type: 'keywords', keywordsAll: [String(product), String(n)] };
      break;
    }
    case 4: {
      // Division von Potenzen mit Variablen (x^m : x^n)
      const x = 'x';
      const exponent = m - n;
      question = `Forme um: ${x}^${m} : ${x}^${n} = ? (Schreibe als Potenz: x^exponent)`;
      answer = exponent === 1 ? 'x' : `${x}^${exponent}`;
      explanation = `Gleiche Basis: Exponenten subtrahieren. ${x}^${m} : ${x}^${n} = ${x}^${exponent}`;
      validator = { type: 'keywords', keywordsAll: ['x', String(exponent)] };
      break;
    }
    default: {
      // Komplexe Terme: (x^a · y^b) : (x^c · y^d)
      const xExp = m - getRandomInt(1, m - 1);
      const yExp = n;
      question = `Forme um: (x^${m} · y^${n}) : x^${m - xExp} = ? (Schreibe als Potenz: x^a · y^b)`;
      answer = `x^${xExp} · y^${yExp}`;
      explanation = `Division: x^${m} : x^${m - xExp} = x^${xExp}, y^${n} bleibt. Ergebnis: x^${xExp} · y^${yExp}`;
      validator = { type: 'keywords', keywordsAll: ['x', String(xExp), 'y', String(yExp)] };
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
 * Erweitert basierend auf: Lern_kanon 2025-09-23, 2025-09-25, 2025-09-30
 */
export function createWurzelLaborQuest(index: number, seed: number): Task {
  const id = `potenzen-wurzel-${index}-${seed}`;
  const scenarioIndex = index % 6; // Erweitert von 4 auf 6

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
    case 3: {
      // n-te Wurzel berechnen
      const numResult = Math.pow(a, 1 / n);
      const isExact = numResult % 1 === 0;
      question = `Berechne: ${rootSymbol(n)}${a}`;
      answer = isExact ? numResult.toString() : numResult.toFixed(2);
      explanation = `${rootSymbol(n)}${a} = ${a}^(1/${n}) ${isExact ? '=' : '≈'} ${answer}`;
      validator = { type: 'numericTolerance', numericAnswer: numResult, tolerance: 0.05 };
      break;
    }
    case 4: {
      // Wurzelgesetze: √(a · b) = √a · √b
      const a1 = getRandomInt(4, 16);
      const b1 = getRandomInt(4, 16);
      const product = a1 * b1;
      const sqrtA = Math.sqrt(a1);
      const sqrtB = Math.sqrt(b1);
      const result = sqrtA * sqrtB;
      question = `Vereinfache: √(${product})`;
      answer = result % 1 === 0 ? result.toString() : `${sqrtA.toFixed(1)} · ${sqrtB.toFixed(1)}`;
      explanation = `Wurzelgesetz: √(${product}) = √(${a1} · ${b1}) = √${a1} · √${b1} = ${result.toFixed(2)}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.1 };
      break;
    }
    default: {
      // Wurzelgesetze: √(a / b) = √a / √b
      const a1 = getRandomInt(9, 25);
      const b1 = getRandomInt(4, 16);
      const quotient = a1 / b1;
      const sqrtA = Math.sqrt(a1);
      const sqrtB = Math.sqrt(b1);
      const result = sqrtA / sqrtB;
      question = `Vereinfache: √(${a1}/${b1})`;
      answer = result % 1 === 0 ? result.toString() : result.toFixed(2);
      explanation = `Wurzelgesetz: √(${a1}/${b1}) = √${a1} / √${b1} = ${sqrtA.toFixed(1)} / ${sqrtB.toFixed(1)} = ${result.toFixed(2)}`;
      validator = { type: 'numericTolerance', numericAnswer: result, tolerance: 0.1 };
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
      explanation = `Schritt 1 - Quadrieren: (√(${a}x ${bSign} ${b}))² = (√(${c}x ${dSign} ${d}))², also ${a}x ${bSign} ${b} = ${c}x ${dSign} ${d}. Schritt 2 - Auflösen: x = ${answer.toFixed(2)}. Schritt 3 - Probe: Setze x = ${answer.toFixed(2)} ein. Radikand links: ${leftRadicand.toFixed(1)}; rechts: ${rightRadicand.toFixed(1)}. ⚠️ Mindestens einer ist negativ → keine Lösung!`;
    } else {
      explanation = `Schritt 1 - Quadrieren: (√(${a}x ${bSign} ${b}))² = (√(${c}x ${dSign} ${d}))², also ${a}x ${bSign} ${b} = ${c}x ${dSign} ${d}. Schritt 2 - Auflösen: x = ${answer.toFixed(2)}. Schritt 3 - Probe: Setze x = ${answer.toFixed(2)} ein: √${leftRadicand.toFixed(1)} = √${rightRadicand.toFixed(1)} ✓ Beide Radikanden sind ≥ 0 und die Gleichung stimmt!`;
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
      explanation = `Schritt 1 - Quadrieren: (√(${a}x ${bSign} ${b}))² = ${c}², also ${a}x ${bSign} ${b} = ${c * c}. Schritt 2 - Auflösen: ${a}x = ${c * c - b}, daher x = ${answer.toFixed(2)}. Schritt 3 - Probe: Setze x = ${answer.toFixed(2)} ein: √(${a}·${answer.toFixed(2)} ${bSign} ${b}) = √${radicand.toFixed(1)} → Fehler! Der Radikand ist negativ, die Wurzel ist nicht definiert. Daher: Keine Lösung! ⚠️`;
      validator = { type: 'keywords', keywordsAny: ['keine', 'lösung', 'ungültig', 'nicht definiert'] };
    } else {
      explanation = `Schritt 1 - Quadrieren: (√(${a}x ${bSign} ${b}))² = ${c}², also ${a}x ${bSign} ${b} = ${c * c}. Schritt 2 - Auflösen: ${a}x = ${c * c - b}, daher x = ${answer.toFixed(2)}. Schritt 3 - Probe: Setze x = ${answer.toFixed(2)} ein: √(${a}·${answer.toFixed(2)} ${bSign} ${b}) = √${radicand.toFixed(1)} = ${c} ✓ Die Lösung ist korrekt!`;
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
