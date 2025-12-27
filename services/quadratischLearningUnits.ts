/**
 * Quadratische Funktionen - Learning Units
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 2 (2025-26) und Lern_kanon PDFs
 * Integration in constants.tsx als LEARNING_UNITS
 */

import { LearningUnit, BountyTask } from '../types';
import { QUADRATISCH_BOUNTIES } from './quadratischBounties';

/**
 * Learning Units für Quadratische Funktionen
 */
export const QUADRATISCH_LEARNING_UNITS: LearningUnit[] = [
  {
    id: 'u_quadratisch_01',
    group: 'A',
    category: 'Basics',
    title: 'Parabel-Basics',
    description: 'Lerne die Normalparabel und ihre Eigenschaften kennen',
    detailedInfo:
      'Die Normalparabel f(x) = x² ist die Grundform aller quadratischen Funktionen. Sie ist nach oben geöffnet, hat ihren Scheitelpunkt im Ursprung S(0|0) und ist symmetrisch zur y-Achse.',
    examples: ['f(x) = x² ist die Normalparabel', 'Öffnung nach oben: a > 0', 'Öffnung nach unten: a < 0'],
    difficulty: 'Mittel',
    coinsReward: 60,
    bounty: 180,
    keywords: ['normalparabel', 'parabel', 'öffnung', 'scheitelpunkt', 'symmetrie'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_02',
    group: 'A',
    category: 'Basics',
    title: 'Scheitelpunkt-Studio',
    description: 'Scheitelpunktform f(x) = (x - d)² + e verstehen',
    detailedInfo:
      'Die Scheitelpunktform f(x) = (x - d)² + e zeigt dir direkt den Scheitelpunkt S(d|e). Die Parabel wird um d Einheiten nach rechts (d > 0) oder links (d < 0) und um e Einheiten nach oben (e > 0) oder unten (e < 0) verschoben.',
    examples: ['f(x) = (x-2)² + 3 hat Scheitelpunkt S(2|3)', 'f(x) = (x+1)² - 4 hat Scheitelpunkt S(-1|-4)'],
    difficulty: 'Mittel',
    coinsReward: 70,
    bounty: 200,
    keywords: ['scheitelpunktform', 'verschiebung', 'scheitelpunkt', 'd', 'e'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_03',
    group: 'B',
    category: 'Transformation',
    title: 'Stretch-Lab',
    description: 'Streckung und Stauchung: f(x) = a(x - d)² + e',
    detailedInfo:
      'Der Streckfaktor a bestimmt, ob die Parabel gestreckt (|a| > 1, schmaler) oder gestaucht (|a| < 1, breiter) ist. Wenn a < 0, ist die Parabel nach unten geöffnet.',
    examples: ['f(x) = 2x² ist gestreckt (schmaler)', 'f(x) = 0.5x² ist gestaucht (breiter)', 'f(x) = -x² ist nach unten geöffnet'],
    difficulty: 'Mittel',
    coinsReward: 80,
    bounty: 220,
    keywords: ['streckfaktor', 'gestreckt', 'gestaucht', 'öffnung', 'a'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_04',
    group: 'B',
    category: 'Berechnung',
    title: 'Form-Transformer',
    description: 'Allgemeine Form f(x) = ax² + bx + c verstehen',
    detailedInfo:
      'Die allgemeine Form f(x) = ax² + bx + c zeigt dir die Koeffizienten direkt. a ist der Streckfaktor, b und c beeinflussen die Verschiebung. Aus der allgemeinen Form kannst du den Scheitelpunkt berechnen.',
    examples: ['f(x) = x² + 4x + 3 hat a=1, b=4, c=3', 'Der Scheitelpunkt liegt bei x = -b/(2a)'],
    difficulty: 'Mittel',
    coinsReward: 90,
    bounty: 240,
    keywords: ['allgemeine form', 'koeffizienten', 'a', 'b', 'c', 'ax²+bx+c'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_05',
    group: 'B',
    category: 'Berechnung',
    title: 'Quadratische Ergänzung',
    description: 'Umwandlung zwischen allgemeiner Form und Scheitelpunktform',
    detailedInfo:
      'Mit der quadratischen Ergänzung wandelst du die allgemeine Form in die Scheitelpunktform um. Das ist wichtig, um den Scheitelpunkt zu finden oder die Funktion zu analysieren.',
    examples: ['x² + 6x + 5 = (x+3)² - 4', '2x² - 8x + 6 = 2(x-2)² - 2'],
    difficulty: 'Schwer',
    coinsReward: 100,
    bounty: 280,
    keywords: ['quadratische ergänzung', 'umwandlung', 'scheitelpunktform', 'allgemeine form'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_06',
    group: 'B',
    category: 'Berechnung',
    title: 'Nullstellen-Finder',
    description: 'Nullstellen berechnen mit pq-Formel und anderen Methoden',
    detailedInfo:
      'Die Nullstellen einer quadratischen Funktion sind die x-Werte, für die f(x) = 0 gilt. Du kannst sie mit der pq-Formel, der Mitternachtsformel oder durch Ablesen aus der Scheitelpunktform finden.',
    examples: ['pq-Formel: x₁,₂ = -p/2 ± √((p/2)² - q)', 'Diskriminante D bestimmt Anzahl der Lösungen'],
    difficulty: 'Schwer',
    coinsReward: 110,
    bounty: 300,
    keywords: ['nullstellen', 'pq-formel', 'mitternachtsformel', 'diskriminante', 'lösungen'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'quadratisch',
  },
  {
    id: 'u_quadratisch_07',
    group: 'C',
    category: 'Modellierung',
    title: 'Real-World Parabeln',
    description: 'Anwendungsaufgaben: Wurfparabeln, Brückenbögen, Optimierung',
    detailedInfo:
      'Quadratische Funktionen beschreiben viele reale Phänomene: Wurfparabeln beim Sport, Brückenbögen in der Architektur, oder Optimierungsprobleme in der Wirtschaft. Hier lernst du, wie du diese Probleme mathematisch lösen kannst.',
    examples: [
      'Wurfparabel: h(t) = -5t² + v₀t + h₀',
      'Brückenbogen: Parabel mit Scheitelpunkt in der Mitte',
      'Optimierung: Maximum/Minimum einer quadratischen Funktion finden',
    ],
    difficulty: 'Schwer',
    coinsReward: 0, // Nur Bounty-Reward
    bounty: 350,
    keywords: [
      'anwendung',
      'wurfparabel',
      'brückenbogen',
      'optimierung',
      'maximum',
      'minimum',
      'textaufgabe',
      'sachaufgabe',
    ],
    tasks: [],
    bountyTasks: QUADRATISCH_BOUNTIES as BountyTask[],
    definitionId: 'quadratisch',
  },
];

