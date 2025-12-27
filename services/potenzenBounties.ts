/**
 * Potenzen & Reelle Zahlen - Bounty-Aufgaben
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 1 (2025-26)
 * Aufgaben 2, 3, 4, 21-25: Beweise, Heron-Verfahren, Anwendungen
 */

import { Task } from '../types';

/**
 * Der Beweis: √3 ist irrational (Aufgabe 2)
 */
export const BEWEIS_BOUNTIES: Task[] = [
  {
    id: 'potenzen-bounty-beweis-sqrt3',
    type: 'shorttext',
    question:
      'Beweise, dass √3 irrational ist. Verwende die Widerspruchsannahme: Angenommen, √3 = p/q, wobei p und q teilerfremde ganze Zahlen sind. Zeige den Widerspruch.',
    correctAnswer: 'widerspruch',
    explanation:
      'Aus √3 = p/q folgt 3 = p²/q², also 3q² = p². Da p² durch 3 teilbar ist, muss auch p durch 3 teilbar sein (p = 3k). Einsetzen: 3q² = 9k², also q² = 3k². Dann ist auch q durch 3 teilbar - Widerspruch zur Teilerfremdheit!',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['widerspruch', '3', 'p', 'q'],
      keywordsAny: ['teilerfremd', 'teilbar', 'p²', 'q²'],
    },
  },
];

/**
 * Heron-Verfahren: √7 und √13 (Aufgaben 3, 4)
 */
export const HERON_BOUNTIES: Task[] = [
  {
    id: 'potenzen-bounty-heron-sqrt7',
    type: 'input',
    question:
      'Bestimme √7 mithilfe des Heron-Verfahrens auf 3 Nachkommastellen genau. Startwert: x₀ = 2. Führe mindestens 3 Iterationen durch. Gib das Ergebnis an (z.B. 2.646).',
    correctAnswer: '2.646',
    explanation:
      'x₁ = (2 + 7/2)/2 = 2.75, x₂ = (2.75 + 7/2.75)/2 ≈ 2.648, x₃ = (2.648 + 7/2.648)/2 ≈ 2.646. Nach 3-4 Iterationen erhältst du √7 ≈ 2.646.',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'numericTolerance',
      numericAnswer: 2.646,
      tolerance: 0.001,
    },
  },
  {
    id: 'potenzen-bounty-heron-sqrt13',
    type: 'input',
    question:
      'Bestimme √13 mithilfe des Heron-Verfahrens auf 3 Nachkommastellen genau. Startwert: x₀ = 3. Führe mindestens 3 Iterationen durch. Gib das Ergebnis an (z.B. 3.606).',
    correctAnswer: '3.606',
    explanation:
      'x₁ = (3 + 13/3)/2 = 3.667, x₂ = (3.667 + 13/3.667)/2 ≈ 3.606, x₃ = (3.606 + 13/3.606)/2 ≈ 3.606. Nach 3-4 Iterationen erhältst du √13 ≈ 3.606.',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'numericTolerance',
      numericAnswer: 3.606,
      tolerance: 0.001,
    },
  },
];

/**
 * Real World Science: Anwendungsaufgaben (Aufgaben 21-25)
 */
export const SCIENCE_BOUNTIES: Task[] = [
  {
    id: 'potenzen-bounty-science-volumen',
    type: 'input',
    question:
      'Das Volumen der Erde beträgt etwa 1,41 · 10¹⁸ km³, das Volumen der Sonne etwa 1,08 · 10²¹ m³. Wie viele Erden passen in die Sonne? (Gib das Ergebnis als ganze Zahl an)',
    correctAnswer: '1305556',
    explanation:
      'Zuerst Einheiten angleichen: 1,41 · 10¹⁸ km³ = 1,41 · 10²⁷ m³. Dann: (1,41 · 10²⁷) / (1,08 · 10²¹) ≈ 1.305.556 Erden passen in die Sonne.',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'numericTolerance',
      numericAnswer: 1305556,
      tolerance: 10000,
    },
  },
  {
    id: 'potenzen-bounty-science-atome',
    type: 'input',
    question:
      'Ein Kohlenstoffatom wiegt etwa 2 · 10⁻²⁷ g. Wie viele Kohlenstoffatome befinden sich in 6 g Kohle? (Gib das Ergebnis in wissenschaftlicher Schreibweise an, z.B. 3 · 10²⁷ oder 3e27)',
    correctAnswer: '3 · 10²⁷',
    explanation:
      'Anzahl = 6 g / (2 · 10⁻²⁷ g) = 3 · 10²⁷. Es befinden sich also 3 · 10²⁷ Kohlenstoffatome in 6 g Kohle.',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['3', '10', '27'],
      keywordsAny: ['·', '*', 'e'],
    },
  },
  {
    id: 'potenzen-bounty-science-scientific-notation',
    type: 'input',
    question:
      'Schreibe in wissenschaftlicher Schreibweise:\na) 0,000025\nb) -8500\nc) 0,0009\nd) 851,09\n\nGib die Antworten getrennt durch Semikolon an (z.B. 2,5·10^-5; -8,5·10^3; 9·10^-4; 8,5109·10^2)',
    correctAnswer: '2,5·10^-5; -8,5·10^3; 9·10^-4; 8,5109·10^2',
    explanation:
      'a) 0,000025 = 2,5 · 10⁻⁵\nb) -8500 = -8,5 · 10³\nc) 0,0009 = 9 · 10⁻⁴\nd) 851,09 = 8,5109 · 10²',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'a',
        label: 'a) 0,000025',
        validator: {
          type: 'keywords',
          keywordsAll: ['2', '5', '10', '-5'],
          keywordsAny: ['·', '*', 'e'],
        },
      },
      {
        id: 'b',
        label: 'b) -8500',
        validator: {
          type: 'keywords',
          keywordsAll: ['-8', '5', '10', '3'],
          keywordsAny: ['·', '*', 'e'],
        },
      },
      {
        id: 'c',
        label: 'c) 0,0009',
        validator: {
          type: 'keywords',
          keywordsAll: ['9', '10', '-4'],
          keywordsAny: ['·', '*', 'e'],
        },
      },
      {
        id: 'd',
        label: 'd) 851,09',
        validator: {
          type: 'keywords',
          keywordsAll: ['8', '5109', '10', '2'],
          keywordsAny: ['·', '*', 'e'],
        },
      },
    ],
  },
];

