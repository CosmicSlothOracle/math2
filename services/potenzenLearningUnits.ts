/**
 * Potenzen & Reelle Zahlen - Learning Units
 *
 * Basierend auf: Diagnosebogen HSG 9 KA 1 (2025-26)
 * Integration in constants.tsx als LEARNING_UNITS
 */

import { LearningUnit, BountyTask, PreTask } from '../types';
import { BEWEIS_BOUNTIES, HERON_BOUNTIES, SCIENCE_BOUNTIES } from './potenzenBounties';

/**
 * PreTask: Zahlen-Sortierer (Drag & Drop)
 * Aufgabe 1: Zahlen den Zahlbereichen N, Z, Q, I, R zuordnen
 */
const zahlbereichePreTask: PreTask = {
  id: 'potenzen-pretask-zahlbereiche',
  title: 'Zahlen-Sortierer',
  description: 'Ordne die Zahlen den richtigen Zahlbereichen zu',
  uiType: 'dragDrop',
  meta: {
    dragDropData: {
      shapes: [
        { id: 'n1', path: '', shapeType: 'number', label: '9' },
        { id: 'n2', path: '', shapeType: 'number', label: '-26' },
        { id: 'n3', path: '', shapeType: 'number', label: '√9' },
        { id: 'n4', path: '', shapeType: 'number', label: '168' },
        { id: 'n5', path: '', shapeType: 'number', label: '√5' },
        { id: 'n6', path: '', shapeType: 'number', label: '3/4' },
        { id: 'n7', path: '', shapeType: 'number', label: '-9/4' },
        { id: 'n8', path: '', shapeType: 'number', label: '-1/7' },
        { id: 'n9', path: '', shapeType: 'number', label: '0' },
        { id: 'n10', path: '', shapeType: 'number', label: '-√2' },
        { id: 'n11', path: '', shapeType: 'number', label: '1,01001...' },
      ],
      categories: [
        {
          id: 'N',
          label: 'ℕ (Natürliche Zahlen)',
          accepts: ['n1', 'n3', 'n4'], // 9, √9=3, 168
        },
        {
          id: 'Z',
          label: 'ℤ (Ganze Zahlen)',
          accepts: ['n1', 'n2', 'n3', 'n4', 'n9'], // 9, -26, √9=3, 168, 0
        },
        {
          id: 'Q',
          label: 'ℚ (Rationale Zahlen)',
          accepts: ['n1', 'n2', 'n3', 'n4', 'n6', 'n7', 'n8', 'n9'], // 9, -26, √9=3, 168, 3/4, -9/4, -1/7, 0
        },
        {
          id: 'I',
          label: '𝕀 (Irrationale Zahlen)',
          accepts: ['n5', 'n10'], // √5, -√2
        },
        {
          id: 'R',
          label: 'ℝ (Reelle Zahlen)',
          accepts: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11'], // Alle
        },
      ],
    },
  },
  correctAnswer: {
    N: ['n1', 'n3', 'n4'],
    Z: ['n1', 'n2', 'n3', 'n4', 'n9'],
    Q: ['n1', 'n2', 'n3', 'n4', 'n6', 'n7', 'n8', 'n9'],
    I: ['n5', 'n10'],
    R: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11'],
  },
  explanation:
    'Wichtig: Eine Zahl kann in mehreren Mengen enthalten sein! Beispiel: 9 ∈ N, Z, Q, R. √5 ist irrational (kann nicht als Bruch dargestellt werden).',
};

/**
 * Learning Units für Potenzen & Reelle Zahlen
 */
export const POTENZEN_LEARNING_UNITS: LearningUnit[] = [
  {
    id: 'u_potenzen_01',
    group: 'A',
    category: 'Basics',
    title: 'Zahlen-Sortierer',
    description: 'Ordne Zahlen den richtigen Zahlbereichen zu',
    detailedInfo:
      'Lerne, wie die Zahlbereiche N, Z, Q, I und R aufgebaut sind und welche Zahlen wo hineinpassen. Wichtig: Jede Zahl kann in mehreren Mengen enthalten sein!',
    examples: ['9 ∈ N, Z, Q, R', '√5 ∈ I, R', '-9/4 ∈ Z, Q, R'],
    difficulty: 'Mittel',
    coinsReward: 50,
    bounty: 120,
    keywords: ['zahlbereiche', 'n', 'z', 'q', 'i', 'r', 'zuordnung', 'mengen'],
    tasks: [], // Werden dynamisch generiert
    preTasks: [zahlbereichePreTask],
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_02',
    group: 'B',
    category: 'Berechnung',
    title: 'Power-Workout',
    description: 'Trainiere die Basis-Potenzgesetze',
    detailedInfo:
      'Perfektioniere die grundlegenden Potenzgesetze: Multiplikation, Division, Potenzieren von Potenzen und negative Exponenten. Das ist die Basis für alles Weitere!',
    examples: ['2³ · 2⁷ = 2¹⁰', '5⁹ : 5¹² = 5⁻³ = 1/5³', '(4⁻²)⁻⁴ = 4⁸'],
    difficulty: 'Mittel',
    coinsReward: 80,
    bounty: 200,
    keywords: ['potenzen', 'exponenten', 'potenzgesetze', 'basis', 'multiplizieren', 'dividieren'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_03',
    group: 'B',
    category: 'Transformation',
    title: 'Term-Tuner',
    description: 'Vereinfache komplexe Terme mit Variablen',
    detailedInfo:
      'Wende die Potenzgesetze auf Terme mit Variablen an. Lerne, wie man Terme elegant vereinfacht und in die Form a^n bringt.',
    examples: ['5⁶ · 2⁶ = (5·2)⁶ = 10⁶', '2x⁻² = 2/x²', '(5b)⁻³ = 1/(125b³)'],
    difficulty: 'Mittel',
    coinsReward: 90,
    bounty: 220,
    keywords: ['terme', 'vereinfachen', 'variablen', 'algebra', 'umformen'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_04',
    group: 'B',
    category: 'Berechnung',
    title: 'Wurzel-Labor',
    description: 'Wurzeln und Potenzen mit rationalen Exponenten',
    detailedInfo:
      'Verstehe den Zusammenhang zwischen Wurzeln und Potenzen. Jede Wurzel ist auch eine Potenz - lerne, wie man zwischen beiden Darstellungen wechselt!',
    examples: ['√a = a^(1/2)', '³√(a²) = a^(2/3)', 'a^(1/n) = ⁿ√a'],
    difficulty: 'Mittel',
    coinsReward: 100,
    bounty: 250,
    keywords: ['wurzeln', 'rationale exponenten', 'n-te wurzel', 'umrechnung', 'berechnung'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_05',
    group: 'B',
    category: 'Berechnung',
    title: 'Gleichungsknacker',
    description: 'Löse Wurzelgleichungen sicher',
    detailedInfo:
      'Wurzelgleichungen lösen erfordert Vorsicht! Nach dem Quadrieren können Scheinlösungen entstehen. Die Probe ist nicht optional - sie ist Pflicht!',
    examples: ['√(7x + 63) = 7 → x = -2 (mit Probe!)', '√(4x - 8) = √(10x - 56) → x = 8 (mit Probe!)'],
    difficulty: 'Schwer',
    coinsReward: 120,
    bounty: 300,
    keywords: ['wurzelgleichungen', 'quadrieren', 'probe', 'lösungsmenge', 'definitionsmenge'],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_bounty_proof',
    group: 'C',
    category: 'Basics',
    title: 'Der Beweis',
    description: 'Beweise: √3 ist irrational',
    detailedInfo:
      'Ein echter Mathematiker-Beweis! Zeige durch Widerspruch, dass √3 keine rationale Zahl sein kann. Das ist klassische Beweisführung auf hohem Niveau.',
    examples: ['Widerspruchsannahme: √3 = p/q', 'Zeige: p und q müssen beide durch 3 teilbar sein', 'Widerspruch zur Teilerfremdheit!'],
    difficulty: 'Schwer',
    coinsReward: 0, // Nur Bounty-Reward
    bounty: 350,
    keywords: ['beweis', 'irrationalität', 'widerspruch', 'theorie', 'mathematik'],
    tasks: [],
    bountyTasks: BEWEIS_BOUNTIES as BountyTask[],
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_bounty_heron',
    group: 'C',
    category: 'Berechnung',
    title: 'Heron-Verfahren',
    description: 'Berechne irrationale Wurzeln auf 3 Nachkommastellen genau',
    detailedInfo:
      'Lerne das klassische Näherungsverfahren von Heron, um Wurzeln zu berechnen, die nicht exakt darstellbar sind. Iteration für Iteration näherst du dich der Lösung an!',
    examples: ['Start: x₀ = 2', 'Iteration: x₁ = (x₀ + a/x₀)/2', 'Wiederhole bis gewünschte Genauigkeit'],
    difficulty: 'Schwer',
    coinsReward: 0, // Nur Bounty-Reward
    bounty: 320,
    keywords: ['heron', 'näherungsverfahren', 'wurzeln', 'iteration', 'algorithmus'],
    tasks: [],
    bountyTasks: [...HERON_BOUNTIES, ...SCIENCE_BOUNTIES.slice(0, 1)] as BountyTask[], // 3 Tasks: √7, √13, + 1 Science
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_06',
    group: 'B',
    category: 'Berechnung',
    title: 'Zehnerpotenzen-Master',
    description: 'Wissenschaftliche Schreibweise und Zehnerpotenzen',
    detailedInfo:
      'Lerne die wissenschaftliche Schreibweise kennen und beherrsche Rechenoperationen mit Zehnerpotenzen. Das ist essenziell für Naturwissenschaften und Technik!',
    examples: [
      '123.000 = 1,23 · 10⁵',
      '0,0045 = 4,5 · 10⁻³',
      '(2 · 10³) · (3 · 10⁴) = 6 · 10⁷',
    ],
    difficulty: 'Mittel',
    coinsReward: 85,
    bounty: 200,
    keywords: [
      'zehnerpotenzen',
      'wissenschaftliche schreibweise',
      'mantisse',
      'exponent',
      'multiplikation',
      'division',
      'potenzen',
    ],
    tasks: [], // Werden dynamisch generiert
    definitionId: 'potenzen',
  },
  {
    id: 'u_potenzen_bounty_science',
    group: 'C',
    category: 'Modellierung',
    title: 'Real World Science',
    description: 'Anwendungsaufgaben aus Astronomie und Physik',
    detailedInfo:
      'Mathe trifft Realität! Volumen von Planeten, Anzahl von Atomen, wissenschaftliche Schreibweise - hier siehst du, wofür Potenzen in der echten Welt gebraucht werden.',
    examples: [
      'Erde-Volumen: 1,41 · 10¹⁸ km³',
      'Kohlenstoffatom: 2 · 10⁻²⁷ g',
      'Wissenschaftliche Schreibweise: 0,000025 = 2,5 · 10⁻⁵',
    ],
    difficulty: 'Schwer',
    coinsReward: 0, // Nur Bounty-Reward
    bounty: 380,
    keywords: [
      'anwendung',
      'wissenschaft',
      'zehnerpotenzen',
      'wissenschaftliche schreibweise',
      'astronomie',
      'physik',
      'volumen',
      'atommasse',
    ],
    tasks: [],
    bountyTasks: SCIENCE_BOUNTIES as BountyTask[],
    definitionId: 'potenzen',
  },
];

