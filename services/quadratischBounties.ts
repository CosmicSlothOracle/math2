/**
 * Quadratische Funktionen - Bounty-Aufgaben
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 2 (2025-26) und Anwendungsaufgaben
 * Themen: Wurfparabeln, Optimierungsprobleme, Brückenbögen, komplexe Umwandlungen
 */

import { Task } from '../types';

/**
 * Real-World Parabeln: Anwendungsaufgaben (Bounty)
 */
export const ANWENDUNG_BOUNTIES: Task[] = [
  {
    id: 'quadratisch-bounty-wurfparabel',
    type: 'input',
    question:
      'Ein Ball wird mit einer Anfangsgeschwindigkeit von 20 m/s von einer Höhe von 2 m senkrecht nach oben geworfen. Die Höhe wird beschrieben durch h(t) = -5t² + 20t + 2.\na) Nach welcher Zeit erreicht der Ball seine maximale Höhe?\nb) Wie hoch fliegt der Ball maximal?\nc) Nach welcher Zeit landet der Ball auf dem Boden?\n\nGib die Antworten in der Form: a) X s, b) Y m, c) Z s',
    correctAnswer: 'a) 2 s, b) 22 m, c) 4,1 s',
    explanation:
      'a) Die maximale Höhe liegt beim Scheitelpunkt. Für h(t) = -5t² + 20t + 2 gilt: t_S = -b/(2a) = -20/(2·(-5)) = 2 s. Alternativ: Scheitelpunktform h(t) = -5(t-2)² + 22.\nb) h(2) = -5·4 + 20·2 + 2 = -20 + 40 + 2 = 22 m\nc) h(t) = 0: -5t² + 20t + 2 = 0. Mit pq-Formel (nach Division durch -5): t² - 4t - 0,4 = 0 → t ≈ 4,1 s',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['2', '22', '4'],
      keywordsAny: ['s', 'm', 'sekunde'],
    },
    multiInputFields: [
      {
        id: 'a',
        label: 'a) Maximale Höhe nach welcher Zeit?',
        validator: {
          type: 'numericTolerance',
          numericAnswer: 2,
          tolerance: 0.1,
        },
      },
      {
        id: 'b',
        label: 'b) Maximale Höhe in m?',
        validator: {
          type: 'numericTolerance',
          numericAnswer: 22,
          tolerance: 0.5,
        },
      },
      {
        id: 'c',
        label: 'c) Landung nach welcher Zeit?',
        validator: {
          type: 'numericTolerance',
          numericAnswer: 4.1,
          tolerance: 0.2,
        },
      },
    ],
  },
  {
    id: 'quadratisch-bounty-brueckenbogen',
    type: 'input',
    question:
      'Ein Brückenbogen hat eine Spannweite von 40 m und eine maximale Höhe von 10 m. Die Parabel verläuft durch die Punkte (0|0), (20|10) und (40|0).\na) Gib die Scheitelpunktform der Parabel an.\nb) Wie hoch ist der Bogen 10 m vom linken Rand entfernt?\n\nFormat: a) f(x) = ..., b) Y m',
    correctAnswer: 'a) f(x) = -0,025(x-20)² + 10, b) 7,5 m',
    explanation:
      'a) Scheitelpunkt S(20|10), Parabel nach unten geöffnet. Durch (0|0): 0 = a·400 + 10 → a = -0,025. Also: f(x) = -0,025(x-20)² + 10\nb) f(10) = -0,025·100 + 10 = 7,5 m',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['-0,025', '20', '10', '7,5'],
      keywordsAny: ['f(x)', 'm'],
    },
  },
  {
    id: 'quadratisch-bounty-optimierung',
    type: 'input',
    question:
      'Ein Bauer möchte einen rechteckigen Hühnerstall mit einem Zaun von 60 m Länge bauen. Eine Seite wird durch eine Scheune begrenzt, sodass nur 3 Seiten eingezäunt werden müssen.\na) Welche Abmessungen maximieren die Fläche?\nb) Wie groß ist die maximale Fläche?\n\nFormat: a) Breite X m, Länge Y m, b) Z m²',
    correctAnswer: 'a) Breite 15 m, Länge 30 m, b) 450 m²',
    explanation:
      'Sei x die Breite (parallel zur Scheune), dann ist die Länge 60 - 2x. Fläche: A(x) = x(60-2x) = 60x - 2x² = -2x² + 60x. Das ist eine nach unten geöffnete Parabel. Maximum bei x = -b/(2a) = -60/(2·(-2)) = 15 m. Länge: 60 - 2·15 = 30 m. Maximale Fläche: A(15) = 15 · 30 = 450 m².',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['15', '30', '450'],
      keywordsAny: ['m', 'breite', 'länge', 'fläche'],
    },
  },
];

/**
 * Komplexe Formumwandlung: Herausfordernde Aufgaben
 */
export const UMWANDLUNG_BOUNTIES: Task[] = [
  {
    id: 'quadratisch-bounty-umwandlung-1',
    type: 'input',
    question:
      'Wandle die allgemeine Form f(x) = 2x² - 12x + 16 in die Scheitelpunktform um. Verwende die quadratische Ergänzung.\n\nFormat: f(x) = a(x-d)²+e',
    correctAnswer: 'f(x) = 2(x-3)² - 2',
    explanation:
      'Ausklammern: f(x) = 2(x² - 6x) + 16. Quadratische Ergänzung: x² - 6x + 9 - 9 = (x-3)² - 9. Also: f(x) = 2((x-3)² - 9) + 16 = 2(x-3)² - 18 + 16 = 2(x-3)² - 2. Scheitelpunkt: S(3|-2)',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['2', '3', '-2'],
      keywordsAny: ['(', ')', '²', '^2'],
    },
  },
  {
    id: 'quadratisch-bounty-umwandlung-2',
    type: 'input',
    question:
      'Wandle die Scheitelpunktform f(x) = -3(x+2)² + 5 in die allgemeine Form um.\n\nFormat: f(x) = ax² + bx + c',
    correctAnswer: 'f(x) = -3x² - 12x - 7',
    explanation:
      'Ausmultiplizieren: f(x) = -3(x+2)² + 5 = -3(x² + 4x + 4) + 5 = -3x² - 12x - 12 + 5 = -3x² - 12x - 7',
    difficultyLevel: 'Schwer',
    validator: {
      type: 'keywords',
      keywordsAll: ['-3', '-12', '-7'],
      keywordsAny: ['x²', 'x^2'],
    },
  },
];

/**
 * Kombinierte Bounties: Alle Anwendungsaufgaben
 */
export const QUADRATISCH_BOUNTIES = [
  ...ANWENDUNG_BOUNTIES,
  ...UMWANDLUNG_BOUNTIES,
];

