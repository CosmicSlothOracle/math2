/**
 * Geometrie Quest-Aufgaben (Standard) basierend auf MUNDO-Inhalten (Klasse 9/10)
 *
 * Diese Aufgaben können in taskFactory.ts integriert werden.
 * Basierend auf: MUNDO Geometrie-Inhalte für Klasse 9/10
 *
 * Zuordnung zu bestehenden Units:
 * - Trigonometrie → u2 (Winkel & Beziehungen) oder u6 (Alltags-Geometrie)
 * - Pythagoras erweitert → u6 (Alltags-Geometrie)
 * - Körpergeometrie erweitert → u4 (Körper & Oberflächen)
 * - Strahlensätze erweitert → u5 (Ähnlichkeit & Skalierung)
 * - Kongruente Dreiecke → u2 (Winkel & Beziehungen)
 * - Vielecke → u3 (Flächen & Terme)
 * - 3D-Geometrie → u4 (Körper & Oberflächen)
 */

import { Task } from '../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * TRIGONOMETRIE - Quest-Aufgaben für u2 oder u6
 */
export function createTrigonometrieQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (a: number, c: number) =>
        `Rechtwinkliges Dreieck: Gegenkathete = ${a} cm, Hypotenuse = ${c} cm. Berechne sin(α) (auf 2 Dezimalstellen gerundet).`,
      a: (a: number, c: number) => Math.round((a / c) * 100) / 100,
      e: 'Sinus = Gegenkathete / Hypotenuse',
    },
    {
      type: 'input' as const,
      q: (b: number, c: number) =>
        `Rechtwinkliges Dreieck: Ankathete = ${b} cm, Hypotenuse = ${c} cm. Berechne cos(α) (auf 2 Dezimalstellen gerundet).`,
      a: (b: number, c: number) => Math.round((b / c) * 100) / 100,
      e: 'Cosinus = Ankathete / Hypotenuse',
    },
    {
      type: 'input' as const,
      q: (a: number, b: number) =>
        `Rechtwinkliges Dreieck: Gegenkathete = ${a} cm, Ankathete = ${b} cm. Berechne tan(α) (auf 2 Dezimalstellen gerundet).`,
      a: (a: number, b: number) => Math.round((a / b) * 100) / 100,
      e: 'Tangens = Gegenkathete / Ankathete',
    },
    {
      type: 'choice' as const,
      q: 'In einem rechtwinkligen Dreieck ist sin(α) = 0,5. Wie groß ist der Winkel α?',
      o: ['30°', '45°', '60°', '90°'],
      a: 0,
      e: 'sin(30°) = 0,5. Das ist ein wichtiger Wert aus der Trigonometrie.',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const unitId = index % 2 === 0 ? 'u2' : 'u6'; // Abwechselnd u2 und u6
  const id = `${unitId}-quest-trig-${index}-${seed}`;

  if (scenario.type === 'choice') {
    return {
      id,
      type: 'choice',
      question: scenario.q,
      options: scenario.o!,
      correctAnswer: scenario.a as number,
      explanation: scenario.e,
      difficultyLevel: 'Mittel',
    };
  } else {
    const a = getRandomInt(6, 12);
    const c = getRandomInt(Math.max(a + 2, 10), 20);
    const b = getRandomInt(8, 15);

    let question: string;
    let answer: number;

    if (index % scenarios.length === 0) {
      question = scenario.q(a, c);
      answer = scenario.a(a, c);
    } else if (index % scenarios.length === 1) {
      question = scenario.q(b, c);
      answer = scenario.a(b, c);
    } else {
      question = scenario.q(a, b);
      answer = scenario.a(a, b);
    }

    return {
      id,
      type: 'input',
      question,
      correctAnswer: answer.toString(),
      explanation: scenario.e,
      difficultyLevel: 'Mittel',
      validator: {
        type: 'numericTolerance',
        numericAnswer: answer,
        tolerance: 0.05,
      },
    };
  }
}

/**
 * PYTHAGORAS ERWEITERT - Quest-Aufgaben für u6
 */
export function createPythagorasQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (c: number, a: number) =>
        `Rechtwinkliges Dreieck: Hypotenuse c = ${c} cm, Kathete a = ${a} cm. Berechne die andere Kathete b (auf ganze cm gerundet).`,
      a: (c: number, a: number) => Math.round(Math.sqrt(c * c - a * a)),
      e: 'b = √(c² - a²) nach Pythagoras umgestellt.',
    },
    {
      type: 'input' as const,
      q: (p: number, q: number) =>
        `Rechtwinkliges Dreieck: Hypotenusenabschnitte p = ${p} cm, q = ${q} cm. Berechne die Höhe h auf die Hypotenuse (auf 1 Dezimalstelle gerundet).`,
      a: (p: number, q: number) => Math.round(Math.sqrt(p * q) * 10) / 10,
      e: 'Höhensatz: h² = p × q',
    },
    {
      type: 'input' as const,
      q: (c: number, p: number) =>
        `Rechtwinkliges Dreieck: Hypotenuse c = ${c} cm, Hypotenusenabschnitt p = ${p} cm. Berechne Kathete a (auf 1 Dezimalstelle gerundet).`,
      a: (c: number, p: number) => Math.round(Math.sqrt(p * c) * 10) / 10,
      e: 'Kathetensatz: a² = p × c',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u6-quest-pythagoras-${index}-${seed}`;

  let question: string;
  let answer: number;

  if (index % scenarios.length === 0) {
    const c = getRandomInt(10, 20);
    const a = getRandomInt(6, Math.min(c - 2, 12));
    question = scenario.q(c, a);
    answer = scenario.a(c, a);
  } else if (index % scenarios.length === 1) {
    const p = getRandomInt(4, 9);
    const q = getRandomInt(6, 12);
    question = scenario.q(p, q);
    answer = scenario.a(p, q);
  } else {
    const c = getRandomInt(10, 20);
    const p = getRandomInt(3, Math.min(c - 2, 8));
    question = scenario.q(c, p);
    answer = scenario.a(c, p);
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer.toString(),
    explanation: scenario.e,
    difficultyLevel: index % scenarios.length === 0 ? 'Mittel' : 'Schwer',
    validator: {
      type: 'numericTolerance',
      numericAnswer: answer,
      tolerance: index % scenarios.length === 0 ? 0.5 : 0.1,
    },
  };
}

/**
 * KÖRPERGEOMETRIE ERWEITERT - Quest-Aufgaben für u4
 */
export function createKoerperQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (a: number, h: number) =>
        `Quadratische Pyramide: Grundkante a = ${a} cm, Höhe h = ${h} cm. Volumen? (auf ganze cm³ gerundet)`,
      a: (a: number, h: number) => Math.round((a * a * h) / 3),
      e: 'V = (Grundfläche × Höhe) / 3 = (a² × h) / 3',
    },
    {
      type: 'input' as const,
      q: (r: number, h: number) =>
        `Kegel: Radius r = ${r} cm, Höhe h = ${h} cm. Volumen? (π≈3,14, auf ganze cm³ gerundet)`,
      a: (r: number, h: number) => Math.round((3.14 * r * r * h) / 3),
      e: 'V = (π × r² × h) / 3',
    },
    {
      type: 'input' as const,
      q: (r: number, s: number) =>
        `Kegel: Radius r = ${r} cm, Mantellinie s = ${s} cm. Oberfläche? (π≈3,14, auf ganze cm² gerundet)`,
      a: (r: number, s: number) => Math.round(3.14 * r * r + 3.14 * r * s),
      e: 'O = Grundfläche + Mantelfläche = πr² + πrs',
    },
    {
      type: 'input' as const,
      q: (r: number) => `Kugel: Radius r = ${r} cm. Volumen? (π≈3,14, auf ganze cm³ gerundet)`,
      a: (r: number) => Math.round((4 / 3) * 3.14 * r * r * r),
      e: 'V = (4/3) × π × r³',
    },
    {
      type: 'input' as const,
      q: (r: number) => `Kugel: Radius r = ${r} cm. Oberfläche? (π≈3,14, auf ganze cm² gerundet)`,
      a: (r: number) => Math.round(4 * 3.14 * r * r),
      e: 'O = 4 × π × r²',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u4-quest-koerper-${index}-${seed}`;

  let question: string;
  let answer: number;

  if (index % scenarios.length === 0) {
    const a = getRandomInt(6, 12);
    const h = getRandomInt(8, 15);
    question = scenario.q(a, h);
    answer = scenario.a(a, h);
  } else if (index % scenarios.length === 1) {
    const r = getRandomInt(3, 8);
    const h = getRandomInt(6, 12);
    question = scenario.q(r, h);
    answer = scenario.a(r, h);
  } else if (index % scenarios.length === 2) {
    const r = getRandomInt(4, 8);
    const s = getRandomInt(8, 15);
    question = scenario.q(r, s);
    answer = scenario.a(r, s);
  } else {
    const r = getRandomInt(5, 10);
    question = scenario.q(r);
    answer = scenario.a(r);
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer.toString(),
    explanation: scenario.e,
    difficultyLevel: 'Mittel',
    validator: {
      type: 'numeric',
      numericAnswer: answer,
    },
  };
}

/**
 * STRAHLENSÄTZE ERWEITERT - Quest-Aufgaben für u5
 */
export function createStrahlensatzQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (a1: number, a2: number, b1: number) =>
        `Zwei Strahlen werden von zwei parallelen Geraden geschnitten. Abschnitt auf Strahl 1: ${a1} cm / ${a2} cm. Abschnitt auf Strahl 2: ${b1} cm. Berechne den fehlenden Abschnitt (auf ganze cm gerundet).`,
      a: (a1: number, a2: number, b1: number) => Math.round((b1 * a2) / a1),
      e: 'Erster Strahlensatz: a₁/a₂ = b₁/b₂ → b₂ = (b₁ × a₂) / a₁',
    },
    {
      type: 'input' as const,
      q: (s1: number, s2: number, p1: number) =>
        `Zwei Strahlen werden von zwei parallelen Geraden geschnitten. Strahlabschnitt ${s1} cm, Gesamtstrahl ${s2} cm. Parallele Abschnitte: ${p1} cm / ? cm. Berechne den fehlenden Abschnitt (auf ganze cm gerundet).`,
      a: (s1: number, s2: number, p1: number) => Math.round((p1 * s2) / s1),
      e: 'Zweiter Strahlensatz: s₁/s₂ = p₁/p₂ → p₂ = (p₁ × s₂) / s₁',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u5-quest-strahlensatz-${index}-${seed}`;

  let question: string;
  let answer: number;

  if (index % scenarios.length === 0) {
    const a1 = getRandomInt(3, 6);
    const a2 = getRandomInt(6, 12);
    const b1 = getRandomInt(4, 8);
    question = scenario.q(a1, a2, b1);
    answer = scenario.a(a1, a2, b1);
  } else {
    const s1 = getRandomInt(4, 8);
    const s2 = getRandomInt(8, 16);
    const p1 = getRandomInt(3, 6);
    question = scenario.q(s1, s2, p1);
    answer = scenario.a(s1, s2, p1);
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer.toString(),
    explanation: scenario.e,
    difficultyLevel: 'Mittel',
    validator: {
      type: 'numeric',
      numericAnswer: answer,
    },
  };
}

/**
 * KONGRUENTE DREIECKE - Quest-Aufgaben für u2
 */
export function createKongruenzQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'choice' as const,
      q: 'Zwei Dreiecke haben: Seite a gleich, Seite b gleich, Winkel α gleich (nicht zwischen den Seiten). Welcher Kongruenzsatz gilt?',
      o: ['SSS', 'SWS', 'WSW', 'SSW'],
      a: 3,
      e: 'SSW-Satz: Zwei Seiten und der der größeren Seite gegenüberliegende Winkel sind gleich.',
    },
    {
      type: 'choice' as const,
      q: 'Zwei Dreiecke haben: Winkel α gleich, Seite a gleich, Winkel β gleich (an Seite a). Welcher Kongruenzsatz gilt?',
      o: ['SSS', 'SWS', 'WSW', 'SSW'],
      a: 2,
      e: 'WSW-Satz: Zwei Winkel und die eingeschlossene Seite sind gleich.',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u2-quest-kongruenz-${index}-${seed}`;

  return {
    id,
    type: 'choice',
    question: scenario.q,
    options: scenario.o,
    correctAnswer: scenario.a,
    explanation: scenario.e,
    difficultyLevel: 'Mittel',
  };
}

/**
 * VIELEcke - Quest-Aufgaben für u3
 */
export function createVieleckQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (a: number) =>
        `Regelmäßiges Fünfeck: Seitenlänge a = ${a} cm. Flächeninhalt? (Formel: A ≈ 1,72 × a², auf ganze cm² gerundet)`,
      a: (a: number) => Math.round(1.72 * a * a),
      e: 'Näherungsformel für regelmäßiges Fünfeck: A ≈ 1,72 × a²',
    },
    {
      type: 'input' as const,
      q: (a: number) =>
        `Regelmäßiges Sechseck: Seitenlänge a = ${a} cm. Flächeninhalt? (Formel: A = (3√3/2) × a², √3≈1,73, auf ganze cm² gerundet)`,
      a: (a: number) => Math.round((3 * 1.73 / 2) * a * a),
      e: 'A = (3√3/2) × a² für regelmäßiges Sechseck',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u3-quest-vieleck-${index}-${seed}`;
  const a = getRandomInt(4, 10);

  return {
    id,
    type: 'input',
    question: scenario.q(a),
    correctAnswer: scenario.a(a).toString(),
    explanation: scenario.e,
    difficultyLevel: 'Mittel',
    validator: {
      type: 'numeric',
      numericAnswer: scenario.a(a),
    },
  };
}

/**
 * 3D-GEOMETRIE - Quest-Aufgaben für u4
 */
export function createDreidQuest(index: number, seed: number): Task {
  const scenarios = [
    {
      type: 'input' as const,
      q: (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) =>
        `Punkt A(${x1}|${y1}|${z1}), Punkt B(${x2}|${y2}|${z2}). Abstand im Raum? (auf 1 Dezimalstelle gerundet)`,
      a: (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) =>
        Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2) * 10) / 10,
      e: 'Abstand = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)',
    },
    {
      type: 'input' as const,
      q: (a: number, b: number, h: number) =>
        `Dreiecksprisma: Grundfläche rechtwinkliges Dreieck (Katheten ${a} cm und ${b} cm), Höhe h = ${h} cm. Volumen? (auf ganze cm³ gerundet)`,
      a: (a: number, b: number, h: number) => Math.round((a * b / 2) * h),
      e: 'V = Grundfläche × Höhe = (a×b/2) × h',
    },
  ];

  const scenario = scenarios[index % scenarios.length];
  const id = `u4-quest-dreid-${index}-${seed}`;

  let question: string;
  let answer: number;

  if (index % scenarios.length === 0) {
    const x1 = getRandomInt(1, 5);
    const y1 = getRandomInt(1, 5);
    const z1 = getRandomInt(1, 5);
    const x2 = getRandomInt(6, 10);
    const y2 = getRandomInt(6, 10);
    const z2 = getRandomInt(6, 10);
    question = scenario.q(x1, y1, z1, x2, y2, z2);
    answer = scenario.a(x1, y1, z1, x2, y2, z2);
  } else {
    const a = getRandomInt(4, 8);
    const b = getRandomInt(6, 10);
    const h = getRandomInt(8, 12);
    question = scenario.q(a, b, h);
    answer = scenario.a(a, b, h);
  }

  return {
    id,
    type: 'input',
    question,
    correctAnswer: answer.toString(),
    explanation: scenario.e,
    difficultyLevel: 'Mittel',
    validator: {
      type: 'numericTolerance',
      numericAnswer: answer,
      tolerance: 0.1,
    },
  };
}

/**
 * Export aller Quest-Generatoren
 *
 * Diese können in taskFactory.ts integriert werden:
 *
 * import { createTrigonometrieQuest, createPythagorasQuest, ... } from './geometrieMundoQuests';
 *
 * getTaskPool(unitId: string): Task[] {
 *   const pool = [...existing tasks...];
 *
 *   // Neue Generatoren hinzufügen:
 *   if (unitId === 'u2') {
 *     pool.push(...Array.from({length: 4}, (_, i) => createTrigonometrieQuest(i, Date.now())));
 *     pool.push(...Array.from({length: 2}, (_, i) => createKongruenzQuest(i, Date.now())));
 *   }
 *   if (unitId === 'u3') {
 *     pool.push(...Array.from({length: 2}, (_, i) => createVieleckQuest(i, Date.now())));
 *   }
 *   if (unitId === 'u4') {
 *     pool.push(...Array.from({length: 5}, (_, i) => createKoerperQuest(i, Date.now())));
 *     pool.push(...Array.from({length: 2}, (_, i) => createDreidQuest(i, Date.now())));
 *   }
 *   if (unitId === 'u5') {
 *     pool.push(...Array.from({length: 2}, (_, i) => createStrahlensatzQuest(i, Date.now())));
 *   }
 *   if (unitId === 'u6') {
 *     pool.push(...Array.from({length: 4}, (_, i) => createTrigonometrieQuest(i, Date.now())));
 *     pool.push(...Array.from({length: 3}, (_, i) => createPythagorasQuest(i, Date.now())));
 *   }
 *
 *   return pool;
 * }
 */
export const QUEST_GENERATORS = {
  trigonometrie: createTrigonometrieQuest,
  pythagoras: createPythagorasQuest,
  koerper: createKoerperQuest,
  strahlensatz: createStrahlensatzQuest,
  kongruenz: createKongruenzQuest,
  vielecke: createVieleckQuest,
  dreid: createDreidQuest,
};

