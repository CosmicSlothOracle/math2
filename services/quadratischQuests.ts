/**
 * Quadratische Funktionen - Quest-Aufgaben (Standard)
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 2 (2025-26) und Lern_kanon PDFs
 * Themen: Parabeln, Scheitelpunktform, Streckung/Stauchung, Formumwandlung, Nullstellen
 */

import { Task } from '../types';

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * PARABEL-BASICS: Einführung quadratische Funktionen
 * Normalparabel f(x) = x² erkennen, Öffnung bestimmen
 */
export function createParabelBasicsQuest(index: number, seed: number): Task {
  const id = `quadratisch-parabel-${index}-${seed}`;
  const scenarioIndex = index % 4;

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Normalparabel erkennen
      question = 'Welche Funktion beschreibt eine Normalparabel?';
      answer = 'f(x) = x²';
      explanation = 'Die Normalparabel ist die einfachste quadratische Funktion: f(x) = x². Sie ist nach oben geöffnet und hat ihren Scheitelpunkt genau im Koordinatenursprung S(0|0). Sie ist außerdem symmetrisch zur y-Achse.';
      validator = {
        type: 'keywords',
        keywordsAll: ['x²', 'x^2'],
        keywordsAny: ['f(x)', 'y'],
      };
      break;
    }
    case 1: {
      // Öffnung nach oben/unten
      const a = getRandomInt(1, 3);
      const sign = index % 2 === 0 ? 1 : -1;
      const aValue = sign * a;
      question = `Ist die Parabel f(x) = ${aValue}x² nach oben oder unten geöffnet?`;
      answer = aValue > 0 ? 'oben' : 'unten';
      explanation = `Der Koeffizient vor x² ist ${aValue}. Merke dir: Wenn a > 0 (positiv), ist die Parabel nach oben geöffnet (wie ein lächelnder Mund 😊). Wenn a < 0 (negativ), ist sie nach unten geöffnet (wie ein trauriger Mund 😞).`;
      validator = {
        type: 'keywords',
        keywordsAny: [answer],
      };
      break;
    }
    case 2: {
      // Scheitelpunkt der Normalparabel
      question = 'Wo liegt der Scheitelpunkt der Normalparabel f(x) = x²?';
      answer = 'S(0|0)';
      explanation = 'Die Normalparabel f(x) = x² hat ihren Scheitelpunkt im Ursprung, also bei S(0|0).';
      validator = {
        type: 'coordinatePair',
        coordinateAnswer: { x: 0, y: 0 },
        coordinateTolerance: 0.1,
      };
      break;
    }
    default: {
      // Parabelform erkennen
      const forms = [
        { q: 'f(x) = x²', a: 'Normalparabel', correct: true },
        { q: 'f(x) = 2x²', a: 'gestreckte Parabel', correct: true },
        { q: 'f(x) = 0.5x²', a: 'gestauchte Parabel', correct: true },
        { q: 'f(x) = -x²', a: 'nach unten geöffnete Parabel', correct: true },
      ];
      const form = forms[getRandomInt(0, forms.length - 1)];
      question = `Welche Art von Parabel ist ${form.q}?`;
      answer = form.a;
      explanation = `${form.q} ist eine ${form.a}. Die Normalparabel wird durch den Faktor vor x² verändert.`;
      validator = {
        type: 'keywords',
        keywordsAny: [form.a.split(' ')[0], 'parabel'],
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
 * SCHEITELPUNKT-STUDIO: Scheitelpunktform f(x) = (x - d)² + e
 * Scheitelpunkt aus Formel ablesen
 */
export function createScheitelpunktQuest(index: number, seed: number): Task {
  const id = `quadratisch-scheitel-${index}-${seed}`;
  const scenarioIndex = index % 5;

  const d = getRandomInt(-5, 5);
  const e = getRandomInt(-5, 5);
  const a = index % 3 === 0 ? getRandomInt(1, 3) : 1; // Manchmal mit Streckfaktor

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Scheitel aus SPF ablesen (ohne Streckfaktor)
      question = `Gib den Scheitelpunkt der Parabel f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} an. Format: S(x|y)`;
      answer = `S(${d}|${e})`;
      explanation = `In der Scheitelpunktform f(x) = (x - d)² + e ist der Scheitelpunkt S(d|e). Hier: S(${d}|${e}).`;
      validator = {
        type: 'coordinatePair',
        coordinateAnswer: { x: d, y: e },
        coordinateTolerance: 0.1,
      };
      break;
    }
    case 1: {
      // Scheitel aus SPF mit Streckfaktor
      question = `Gib den Scheitelpunkt der Parabel f(x) = ${a}(x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} an. Format: S(x|y)`;
      answer = `S(${d}|${e})`;
      explanation = `Der Streckfaktor ${a} ändert nichts am Scheitelpunkt. Der Scheitelpunkt ist S(${d}|${e}).`;
      validator = {
        type: 'coordinatePair',
        coordinateAnswer: { x: d, y: e },
        coordinateTolerance: 0.1,
      };
      break;
    }
    case 2: {
      // Formel aus Scheitelpunkt erstellen
      question = `Gib die Scheitelpunktform der Parabel mit Scheitelpunkt S(${d}|${e}) an. Format: f(x) = (x-d)²+e`;
      const dSign = d >= 0 ? '-' : '+';
      const eSign = e >= 0 ? '+' : '-';
      answer = `f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}`;
      explanation = `Die Scheitelpunktform lautet f(x) = (x - d)² + e mit Scheitelpunkt S(d|e). Hier: f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}.`;
      validator = {
        type: 'keywords',
        keywordsAll: [String(d), String(e)],
        keywordsAny: ['(', ')', '²', '^2'],
      };
      break;
    }
    case 3: {
      // Verschiebung erkennen
      const shiftX = d;
      const shiftY = e;
      question = `Die Normalparabel f(x) = x² wurde verschoben zu f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)}. Um wie viele Einheiten wurde sie in x-Richtung und y-Richtung verschoben?`;
      const xRichtung = `${Math.abs(shiftX)} Einheiten nach ${shiftX >= 0 ? 'rechts' : 'links'}`;
      const yRichtung = `${Math.abs(shiftY)} Einheiten nach ${shiftY >= 0 ? 'oben' : 'unten'}`;
      answer = `${xRichtung}, ${yRichtung}`;
      explanation = `In der Scheitelpunktform f(x) = (x - d)² + e zeigt d die Verschiebung nach rechts (d > 0) oder links (d < 0) an, und e die Verschiebung nach oben (e > 0) oder unten (e < 0). Hier: ${xRichtung} und ${yRichtung}.`;
      validator = {
        type: 'keywords',
        keywordsAll: [String(Math.abs(shiftX)), String(Math.abs(shiftY))],
        keywordsAny: ['verschoben', 'rechts', 'links', 'oben', 'unten'],
      };
      break;
    }
    default: {
      // Scheitelpunkt aus Graph ablesen (simuliert durch Koordinaten)
      question = `Eine Parabel hat den Scheitelpunkt S(${d}|${e}). Wie lautet die Scheitelpunktform?`;
      const dSign = d >= 0 ? '-' : '+';
      const eSign = e >= 0 ? '+' : '-';
      answer = `f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}`;
      explanation = `Aus dem Scheitelpunkt S(${d}|${e}) ergibt sich die Form f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}.`;
      validator = {
        type: 'keywords',
        keywordsAll: [String(d), String(e)],
        keywordsAny: ['(', ')', '²'],
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
 * STRETCH-LAB: Streckung und Stauchung f(x) = a(x - d)² + e
 * Streckfaktor a bestimmen und interpretieren
 */
export function createStreckungQuest(index: number, seed: number): Task {
  const id = `quadratisch-stretch-${index}-${seed}`;
  const scenarioIndex = index % 4;

  const a = [0.5, 1, 2, 3, -1, -2][getRandomInt(0, 5)];
  const d = getRandomInt(-3, 3);
  const e = getRandomInt(-3, 3);

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Streckfaktor aus Formel ablesen
      question = `Wie lautet der Streckfaktor a der Parabel f(x) = ${a}(x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)}?`;
      answer = a.toString();
      explanation = `Der Streckfaktor a ist der Koeffizient vor der Klammer. Hier: a = ${a}.`;
      validator = {
        type: 'numericTolerance',
        numericAnswer: a,
        tolerance: 0.01,
      };
      break;
    }
    case 1: {
      // Gestreckt oder gestaucht?
      const absA = Math.abs(a);
      question = `Ist die Parabel f(x) = ${a}x² gestreckt oder gestaucht?`;
      if (absA > 1) {
        answer = 'gestreckt';
        explanation = `Da |a| = ${absA} > 1 ist, ist die Parabel gestreckt (schmaler als die Normalparabel).`;
      } else if (absA < 1 && absA > 0) {
        answer = 'gestaucht';
        explanation = `Da |a| = ${absA} < 1 ist, ist die Parabel gestaucht (breiter als die Normalparabel).`;
      } else {
        answer = 'weder noch';
        explanation = `Da |a| = 1 ist, handelt es sich um die Normalparabel.`;
      }
      validator = {
        type: 'keywords',
        keywordsAny: [answer, absA > 1 ? 'gestreckt' : absA < 1 ? 'gestaucht' : 'normal'],
      };
      break;
    }
    case 2: {
      // Öffnung bestimmen
      question = `Ist die Parabel f(x) = ${a}x² nach oben oder unten geöffnet?`;
      answer = a > 0 ? 'oben' : 'unten';
      explanation = `Da a = ${a} ${a > 0 ? '>' : '<'} 0 ist, ist die Parabel nach ${answer} geöffnet.`;
      validator = {
        type: 'keywords',
        keywordsAny: [answer],
      };
      break;
    }
    default: {
      // Kombination: Streckfaktor und Scheitelpunkt
      question = `Gib den Streckfaktor a und den Scheitelpunkt S der Parabel f(x) = ${a}(x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} an. Format: a = X, S(X|Y)`;
      answer = `a = ${a}, S(${d}|${e})`;
      explanation = `Der Streckfaktor ist a = ${a} und der Scheitelpunkt ist S(${d}|${e}).`;
      validator = {
        type: 'keywords',
        keywordsAll: [String(a), String(d), String(e)],
        keywordsAny: ['a =', 'S('],
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
 * FORM-TRANSFORMER: Umwandlung zwischen Allgemeiner Form und Scheitelpunktform
 * f(x) = ax² + bx + c <-> f(x) = a(x - d)² + e
 * Erweitert für a ≠ 1 (Quadratische Ergänzung mit a ausklammern)
 */
export function createFormTransformQuest(index: number, seed: number): Task {
  const id = `quadratisch-transform-${index}-${seed}`;
  // Für index >= 3 (u_quadratisch_05) verwende a ≠ 1
  const useComplexA = index >= 3;
  const scenarioIndex = useComplexA ? (index - 3) % 4 : index % 3;

  // Einfache Werte für saubere Umwandlung
  const d = getRandomInt(-3, 3);
  const e = getRandomInt(-3, 3);
  const a = useComplexA ? getRandomInt(2, 4) : 1; // Für u_quadratisch_05: a = 2, 3 oder 4

  // Allgemeine Form: a(x-d)² + e = a(x² - 2dx + d²) + e = ax² - 2adx + ad² + e
  const b = -2 * a * d;
  const c = a * d * d + e;

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  if (useComplexA) {
    // Erweiterte Aufgaben mit a ≠ 1 (für u_quadratisch_05)
    switch (scenarioIndex) {
      case 0: {
        // SPF -> AF mit a ≠ 1
        question = `Wandle die Scheitelpunktform f(x) = ${a}(x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} in die allgemeine Form f(x) = ax² + bx + c um.`;
        answer = `f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;
        explanation = `Ausmultiplizieren: ${a}(x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} = ${a}(x² ${-2 * d >= 0 ? '+' : ''} ${-2 * d}x + ${d * d}) ${e >= 0 ? '+' : ''} ${e} = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}.`;
        validator = {
          type: 'keywords',
          keywordsAll: [String(a), String(b), String(c)],
          keywordsAny: ['x²', 'x^2'],
        };
        break;
      }
      case 1: {
        // AF -> SPF mit a ≠ 1 (Quadratische Ergänzung - Schritt für Schritt)
        question = `Wandle die allgemeine Form f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} in die Scheitelpunktform um. (Tipp: Klammere zuerst ${a} aus!)`;
        const dSign = d >= 0 ? '-' : '+';
        const eSign = e >= 0 ? '+' : '-';
        answer = `f(x) = ${a}(x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}`;
        explanation = `Schritt 1: ${a} ausklammern: ${a}(x² ${b / a >= 0 ? '+' : ''} ${b / a}x) ${c >= 0 ? '+' : ''} ${c}. Schritt 2: Quadratische Ergänzung: ${a}[(x ${dSign} ${Math.abs(d)})² - ${d * d}] ${c >= 0 ? '+' : ''} ${c} = ${a}(x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}. Scheitelpunkt: S(${d}|${e}).`;
        validator = {
          type: 'keywords',
          keywordsAll: [String(a), String(d), String(e)],
          keywordsAny: ['(', ')', '²'],
        };
        break;
      }
      case 2: {
        // Koeffizienten aus AF mit a ≠ 1 ablesen
        question = `Gib die Koeffizienten a, b und c der Funktion f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} an. Format: a = X, b = Y, c = Z`;
        answer = `a = ${a}, b = ${b}, c = ${c}`;
        explanation = `In der allgemeinen Form f(x) = ax² + bx + c sind: a = ${a} (Koeffizient vor x²), b = ${b} (Koeffizient vor x), c = ${c} (konstanter Term).`;
        validator = {
          type: 'keywords',
          keywordsAll: [String(a), String(b), String(c)],
          keywordsAny: ['a =', 'b =', 'c ='],
        };
        break;
      }
      default: {
        // Scheitelpunkt aus AF mit a ≠ 1 berechnen (vereinfacht)
        question = `Eine quadratische Funktion hat die Form f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Der Scheitelpunkt liegt bei x_S = -b/(2a). Berechne x_S.`;
        const xS = -b / (2 * a);
        answer = xS.toString();
        explanation = `Formel: x_S = -b/(2a) = -(${b})/(2·${a}) = ${-b}/${2 * a} = ${xS}. Der Scheitelpunkt liegt bei x = ${xS}.`;
        validator = {
          type: 'numericTolerance',
          numericAnswer: xS,
          tolerance: 0.01,
        };
        break;
      }
    }
  } else {
    // Einfache Aufgaben mit a = 1 (für u_quadratisch_04)
    switch (scenarioIndex) {
      case 0: {
        // SPF -> AF
        question = `Wandle die Scheitelpunktform f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} in die allgemeine Form f(x) = ax² + bx + c um.`;
        answer = `f(x) = x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;
        explanation = `Ausmultiplizieren: (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)} = x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}.`;
        validator = {
          type: 'keywords',
          keywordsAll: [String(b), String(c)],
          keywordsAny: ['x²', 'x^2'],
        };
        break;
      }
      case 1: {
        // AF -> SPF (Quadratische Ergänzung)
        question = `Wandle die allgemeine Form f(x) = x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} in die Scheitelpunktform um.`;
        const dSign = d >= 0 ? '-' : '+';
        const eSign = e >= 0 ? '+' : '-';
        answer = `f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}`;
        explanation = `Quadratische Ergänzung: x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}. Der Scheitelpunkt ist S(${d}|${e}).`;
        validator = {
          type: 'keywords',
          keywordsAll: [String(d), String(e)],
          keywordsAny: ['(', ')', '²'],
        };
        break;
      }
      default: {
        // Koeffizienten aus AF ablesen
        question = `Gib die Koeffizienten a, b und c der Funktion f(x) = x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} an. Format: a = X, b = Y, c = Z`;
        answer = `a = 1, b = ${b}, c = ${c}`;
        explanation = `In der allgemeinen Form f(x) = ax² + bx + c sind: a = 1 (Koeffizient vor x²), b = ${b} (Koeffizient vor x), c = ${c} (konstanter Term).`;
        validator = {
          type: 'keywords',
          keywordsAll: ['1', String(b), String(c)],
          keywordsAny: ['a =', 'b =', 'c ='],
        };
        break;
      }
    }
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer,
    explanation,
    difficultyLevel: useComplexA ? 'Schwer' : 'Mittel',
    validator,
  };
}

/**
 * NULLSTELLEN-FINDER: Nullstellen berechnen
 * Mit pq-Formel oder durch Ablesen aus SPF
 */
export function createNullstellenQuest(index: number, seed: number): Task {
  const id = `quadratisch-nullstellen-${index}-${seed}`;
  const scenarioIndex = index % 4;

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Nullstellen aus SPF ablesen (wenn e negativ)
      const d = getRandomInt(-2, 2);
      const e = -getRandomInt(1, 4); // Negativ, damit Nullstellen existieren
      const sqrtE = Math.sqrt(-e);
      const x1 = d - sqrtE;
      const x2 = d + sqrtE;
      question = `Berechne die Nullstellen der Funktion f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² ${e >= 0 ? '+' : '-'} ${Math.abs(e)}. Format: x1 = X, x2 = Y`;
      answer = `x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`;
      explanation = `Setze f(x) = 0: (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² = ${-e}, also x ${d >= 0 ? '-' : '+'} ${Math.abs(d)} = ±${sqrtE.toFixed(2)}. Daher: x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}.`;
      validator = {
        type: 'keywords',
        keywordsAll: [x1.toFixed(1), x2.toFixed(1)],
        keywordsAny: ['x1', 'x2'],
      };
      break;
    }
    case 1: {
      // Nullstellen mit pq-Formel
      const p = getRandomInt(-5, 5);
      const q = getRandomInt(-3, 3);
      const discriminant = (p / 2) * (p / 2) - q;
      if (discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        const x1 = -p / 2 - sqrtD;
        const x2 = -p / 2 + sqrtD;
        question = `Berechne die Nullstellen der Funktion f(x) = x² ${p >= 0 ? '+' : ''} ${p}x ${q >= 0 ? '+' : ''} ${q} mit der pq-Formel. Format: x1 = X, x2 = Y`;
        answer = `x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`;
        explanation = `pq-Formel: x₁,₂ = -p/2 ± √((p/2)² - q) = -${p}/2 ± √(${(p / 2) * (p / 2)} - ${q}) = -${p}/2 ± ${sqrtD.toFixed(2)}. Also: x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}.`;
        validator = {
          type: 'keywords',
          keywordsAll: [x1.toFixed(1), x2.toFixed(1)],
          keywordsAny: ['x1', 'x2'],
        };
      } else {
        // Keine reellen Nullstellen
        question = `Wie viele reelle Nullstellen hat die Funktion f(x) = x² ${p >= 0 ? '+' : ''} ${p}x ${q >= 0 ? '+' : ''} ${q}?`;
        answer = '0';
        explanation = `Die Diskriminante D = (p/2)² - q = ${discriminant.toFixed(2)} < 0, daher hat die Funktion keine reellen Nullstellen.`;
        validator = {
          type: 'keywords',
          keywordsAny: ['0', 'keine', 'null'],
        };
      }
      break;
    }
    case 2: {
      // Anzahl der Nullstellen (Diskriminante)
      const p = getRandomInt(-4, 4);
      const q = getRandomInt(-2, 2);
      const discriminant = (p / 2) * (p / 2) - q;
      let numSolutions: number;
      let answerText: string;
      if (discriminant > 0) {
        numSolutions = 2;
        answerText = '2';
      } else if (discriminant === 0) {
        numSolutions = 1;
        answerText = '1';
      } else {
        numSolutions = 0;
        answerText = '0';
      }
      question = `Wie viele reelle Nullstellen hat die Funktion f(x) = x² ${p >= 0 ? '+' : ''} ${p}x ${q >= 0 ? '+' : ''} ${q}?`;
      answer = answerText;
      explanation = `Die Diskriminante ist D = (p/2)² - q = ${discriminant.toFixed(2)}. ${discriminant > 0 ? 'D > 0 → 2 Nullstellen' : discriminant === 0 ? 'D = 0 → 1 Nullstelle' : 'D < 0 → keine reellen Nullstellen'}.`;
      validator = {
        type: 'keywords',
        keywordsAny: [answerText, numSolutions === 2 ? 'zwei' : numSolutions === 1 ? 'eine' : 'keine'],
      };
      break;
    }
    default: {
      // Doppelte Nullstelle (Berührpunkt)
      const d = getRandomInt(-3, 3);
      question = `Berechne die Nullstelle der Funktion f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})².`;
      answer = `x = ${d}`;
      explanation = `Da f(x) = (x ${d >= 0 ? '-' : '+'} ${Math.abs(d)})² = 0 nur für x = ${d} gilt, ist x = ${d} eine doppelte Nullstelle (Berührpunkt).`;
      validator = {
        type: 'numericTolerance',
        numericAnswer: d,
        tolerance: 0.1,
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
    difficultyLevel: 'Schwer',
    validator,
  };
}

/**
 * ANWENDUNG: Textaufgaben mit quadratischen Funktionen
 * Wurfparabeln, Optimierungsprobleme, etc.
 * Erweitert basierend auf: Lern_kanon 2025-12-09, 2025-12-11
 */
export function createAnwendungQuest(index: number, seed: number): Task {
  const id = `quadratisch-anwendung-${index}-${seed}`;
  const scenarioIndex = index % 5; // Erweitert von 3 auf 5

  let question: string;
  let answer: string;
  let explanation: string;
  let validator: any;

  switch (scenarioIndex) {
    case 0: {
      // Wurfparabel - maximale Höhe
      const v0 = getRandomInt(10, 20); // Anfangsgeschwindigkeit
      const h0 = getRandomInt(0, 5); // Starthöhe
      // Vereinfachtes Modell: h(t) = -5t² + v0*t + h0
      // Maximum bei t = v0/10
      const tMax = v0 / 10;
      const hMax = -5 * tMax * tMax + v0 * tMax + h0;
      question = `Ein Ball wird mit einer Anfangsgeschwindigkeit von ${v0} m/s von einer Höhe von ${h0} m geworfen. Die Höhe wird beschrieben durch h(t) = -5t² + ${v0}t + ${h0}. Wie hoch fliegt der Ball maximal? (in m)`;
      answer = hMax.toFixed(1);
      explanation = `Die maximale Höhe wird erreicht, wenn die Ableitung (Geschwindigkeit) null ist: v(t) = -10t + ${v0} = 0 → t = ${tMax.toFixed(1)} s. Einsetzen: h(${tMax.toFixed(1)}) = ${hMax.toFixed(1)} m.`;
      validator = {
        type: 'numericTolerance',
        numericAnswer: hMax,
        tolerance: 0.5,
      };
      break;
    }
    case 1: {
      // Optimierungsproblem - Rechteck mit maximalem Flächeninhalt
      const umfang = getRandomInt(20, 40);
      // Rechteck: U = 2a + 2b = umfang, also b = (umfang - 2a)/2
      // Fläche: A(a) = a * b = a * (umfang - 2a)/2 = (umfang*a - 2a²)/2
      // Maximum bei a = umfang/4 (Quadrat)
      const aOpt = umfang / 4;
      const bOpt = umfang / 4;
      const aMax = aOpt * bOpt;
      question = `Ein Rechteck hat einen Umfang von ${umfang} m. Welchen maximalen Flächeninhalt kann es haben? (in m²)`;
      answer = aMax.toFixed(1);
      explanation = `Für maximalen Flächeninhalt bei gegebenem Umfang muss das Rechteck ein Quadrat sein. Seitenlänge: a = ${umfang}/4 = ${aOpt.toFixed(1)} m. Fläche: A = ${aOpt.toFixed(1)}² = ${aMax.toFixed(1)} m².`;
      validator = {
        type: 'numericTolerance',
        numericAnswer: aMax,
        tolerance: 0.5,
      };
      break;
    }
    case 2: {
      // Wurfparabel - Flugzeit berechnen
      const v0 = getRandomInt(10, 20); // Anfangsgeschwindigkeit
      const h0 = 0; // Starthöhe
      // h(t) = -5t² + v0*t + h0
      // Nullstellen bei t = 0 und t = v0/5
      const tLanding = v0 / 5;
      question = `Ein Ball wird senkrecht nach oben geworfen. Die Höhe ist gegeben durch h(t) = -5t² + ${v0}t. Nach wie vielen Sekunden landet der Ball wieder am Boden? (auf eine Nachkommastelle runden)`;
      answer = tLanding.toFixed(1);
      explanation = `Setze h(t) = 0: -5t² + ${v0}t = 0. Ausklammern: t(-5t + ${v0}) = 0. Also t = 0 (Start) oder t = ${v0}/5 = ${tLanding.toFixed(1)} s (Landung).`;
      validator = {
        type: 'numericTolerance',
        numericAnswer: tLanding,
        tolerance: 0.1,
      };
      break;
    }
    case 3: {
      // Brückenbogen - Scheitelpunkt
      const spannweite = getRandomInt(20, 40);
      const höhe = getRandomInt(5, 15);
      // Parabel mit Scheitelpunkt in der Mitte: f(x) = -a(x - spannweite/2)² + höhe
      // Nullstellen bei x = 0 und x = spannweite
      const d = spannweite / 2;
      question = `Ein Brückenbogen hat eine Spannweite von ${spannweite} m und eine maximale Höhe von ${höhe} m. Wo liegt der Scheitelpunkt der Parabel? Format: S(X|Y)`;
      answer = `S(${d}|${höhe})`;
      explanation = `Der Scheitelpunkt liegt in der Mitte der Spannweite bei x = ${spannweite}/2 = ${d} m und in der maximalen Höhe y = ${höhe} m. Also: S(${d}|${höhe}).`;
      validator = {
        type: 'coordinatePair',
        coordinateAnswer: { x: d, y: höhe },
        coordinateTolerance: 0.5,
      };
      break;
    }
    default: {
      // Parabel durch drei Punkte - Scheitelpunktform finden
      const d = getRandomInt(-3, 3);
      const e = getRandomInt(-3, 3);
      const a = 1; // Vereinfacht
      // Parabel durch (0, y0), (d, e), (2d, y2)
      const y0 = a * d * d + e;
      question = `Eine Parabel verläuft durch die Punkte (0|${y0.toFixed(0)}), (${d}|${e}) und (${2 * d}|${y0.toFixed(0)}). Der Scheitelpunkt liegt bei S(${d}|${e}). Gib die Scheitelpunktform an. Format: f(x) = (x-d)²+e`;
      const dSign = d >= 0 ? '-' : '+';
      const eSign = e >= 0 ? '+' : '-';
      answer = `f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}`;
      explanation = `Da der Scheitelpunkt S(${d}|${e}) ist, lautet die Scheitelpunktform: f(x) = (x ${dSign} ${Math.abs(d)})² ${eSign} ${Math.abs(e)}.`;
      validator = {
        type: 'keywords',
        keywordsAll: [String(d), String(e)],
        keywordsAny: ['(', ')', '²'],
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
    difficultyLevel: 'Schwer',
    validator,
  };
}

