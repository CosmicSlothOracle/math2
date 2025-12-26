/**
 * Geometrie Bounty-Aufgaben basierend auf MUNDO-Inhalten (Klasse 9/10)
 *
 * Diese Datei enthält konkrete Bounty-Aufgaben, die in bountyCatalog.ts integriert werden können.
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

/**
 * TRIGONOMETRIE - Bounty-Aufgaben für u2 oder u6
 */
export const TRIGONOMETRIE_BOUNTIES: Task[] = [
  {
    id: 'u2-bounty-einheitskreis',
    type: 'input',
    question:
      'Einheitskreis: Punkt P liegt bei Winkel α = 30°.\n a) sin(30°) (auf 3 Dezimalstellen)?\n b) cos(30°) (auf 3 Dezimalstellen)?',
    correctAnswer: '0,500; 0,866',
    explanation:
      'Am Einheitskreis entspricht die y-Koordinate dem Sinus, die x-Koordinate dem Cosinus. sin(30°)=0,5, cos(30°)=√3/2≈0,866.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'sin',
        label: 'a) sin(30°)',
        validator: { type: 'numericTolerance', numericAnswer: 0.5, tolerance: 0.01 },
      },
      {
        id: 'cos',
        label: 'b) cos(30°)',
        validator: { type: 'numericTolerance', numericAnswer: 0.866, tolerance: 0.01 },
      },
    ],
  },
  {
    id: 'u6-bounty-leiter',
    type: 'input',
    question:
      'Leiter lehnt an Wand: Länge 8 m, Winkel zur Wand 60°.\n a) Wie hoch reicht die Leiter? (sin(60°) ≈ 0,866)\n b) Wie weit steht der Fuß von der Wand? (cos(60°) ≈ 0,500)',
    correctAnswer: '≈6,93 m; ≈4,00 m',
    explanation: 'Höhe = l × sin(α) = 8 × 0,866 ≈ 6,93 m. Abstand = l × cos(α) = 8 × 0,500 = 4,00 m.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'height',
        label: 'a) Höhe (m)',
        validator: { type: 'numericTolerance', numericAnswer: 6.93, tolerance: 0.1 },
      },
      {
        id: 'distance',
        label: 'b) Abstand (m)',
        validator: { type: 'numericTolerance', numericAnswer: 4.0, tolerance: 0.1 },
      },
    ],
  },
  {
    id: 'u2-bounty-winkelfunktionen',
    type: 'input',
    question:
      'Rechtwinkliges Dreieck: sin(α) = 0,707, cos(α) = 0,707.\n a) Berechne tan(α) = sin(α)/cos(α) (auf 2 Dezimalstellen).\n b) Bestimme den Winkel α (auf ganze Grad gerundet).',
    correctAnswer: '1,00; 45',
    explanation: 'tan(α) = 0,707/0,707 = 1,00. Mit tan(α)=1 folgt α=45°.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'tan',
        label: 'a) tan(α)',
        validator: { type: 'numericTolerance', numericAnswer: 1.0, tolerance: 0.05 },
      },
      {
        id: 'angle',
        label: 'b) Winkel α (°)',
        validator: { type: 'numeric', numericAnswer: 45 },
      },
    ],
  },
];

/**
 * PYTHAGORAS ERWEITERT - Bounty-Aufgaben für u6
 */
export const PYTHAGORAS_BOUNTIES: Task[] = [
  {
    id: 'u6-bounty-satzgruppe',
    type: 'input',
    question:
      'Rechtwinkliges Dreieck: Hypotenuse c = 13 cm, Hypotenusenabschnitte p = 4 cm, q = 9 cm.\n a) Höhe h (Höhensatz)?\n b) Kathete a (Kathetensatz)?\n c) Kathete b (Kathetensatz)?',
    correctAnswer: '6; 7,21; 10,82',
    explanation:
      'Höhensatz: h² = p×q = 4×9 = 36 → h = 6 cm. Kathetensatz: a² = p×c = 4×13 = 52 → a ≈ 7,21 cm. b² = q×c = 9×13 = 117 → b ≈ 10,82 cm.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'height',
        label: 'a) Höhe h (cm)',
        validator: { type: 'numeric', numericAnswer: 6 },
      },
      {
        id: 'cathetus_a',
        label: 'b) Kathete a (cm)',
        validator: { type: 'numericTolerance', numericAnswer: 7.21, tolerance: 0.1 },
      },
      {
        id: 'cathetus_b',
        label: 'c) Kathete b (cm)',
        validator: { type: 'numericTolerance', numericAnswer: 10.82, tolerance: 0.1 },
      },
    ],
  },
  {
    id: 'u6-bounty-dachflaeche',
    type: 'input',
    question:
      'Dachfläche berechnen: Hausbreite 10 m, Firsthöhe 3 m über Traufe, Dachlänge 12 m.\n a) Länge einer Dachseite (auf 0,1 m gerundet)?\n b) Gesamte Dachfläche beider Seiten (auf ganze m² gerundet)?',
    correctAnswer: '5,8; 140',
    explanation:
      'Dachseite = √((10/2)² + 3²) = √(25+9) = √34 ≈ 5,83 m. Gesamtfläche = 2 × 5,83 × 12 ≈ 140 m².',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'side',
        label: 'a) Dachseite (m)',
        validator: { type: 'numericTolerance', numericAnswer: 5.83, tolerance: 0.1 },
      },
      {
        id: 'area',
        label: 'b) Gesamtfläche (m²)',
        validator: { type: 'numericTolerance', numericAnswer: 140, tolerance: 5 },
      },
    ],
  },
];

/**
 * KÖRPERGEOMETRIE ERWEITERT - Bounty-Aufgaben für u4
 */
export const KOERPER_BOUNTIES: Task[] = [
  {
    id: 'u4-bounty-zusammengesetzt',
    type: 'input',
    question:
      'Körper: Quader (10×8×6 cm) + Pyramide oben (Grundfläche 10×8 cm, Höhe 4 cm).\n a) Gesamtvolumen (cm³)?\n b) Gesamtoberfläche ohne Kontaktfläche (cm², auf ganze Zahl)?',
    correctAnswer: '587; 520',
    explanation:
      'Volumen: Quader 480 + Pyramide (10×8×4)/3 ≈ 106,67 → ≈587 cm³. Oberfläche: Quader 376 + Pyramidenmantel ≈ 144 → ≈520 cm².',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'volume',
        label: 'a) Volumen (cm³)',
        validator: { type: 'numericTolerance', numericAnswer: 587, tolerance: 5 },
      },
      {
        id: 'surface',
        label: 'b) Oberfläche (cm²)',
        validator: { type: 'numericTolerance', numericAnswer: 520, tolerance: 10 },
      },
    ],
  },
  {
    id: 'u4-bounty-kegelstumpf',
    type: 'input',
    question:
      'Kegelstumpf: r₁ = 8 cm, r₂ = 4 cm, h = 10 cm.\n a) Volumen (π≈3,14, auf ganze cm³)?\n b) Mantelfläche (auf ganze cm²)?',
    correctAnswer: '1173; 314',
    explanation:
      'V = (πh/3)(r₁² + r₁r₂ + r₂²) = (3,14×10/3)(64+32+16) ≈ 1173 cm³. Mantel = π(r₁+r₂)s mit s = √((8-4)²+10²) = √116 ≈ 10,77 → M ≈ 314 cm².',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'volume',
        label: 'a) Volumen (cm³)',
        validator: { type: 'numericTolerance', numericAnswer: 1173, tolerance: 10 },
      },
      {
        id: 'mantel',
        label: 'b) Mantelfläche (cm²)',
        validator: { type: 'numericTolerance', numericAnswer: 314, tolerance: 10 },
      },
    ],
  },
];

/**
 * STRAHLENSÄTZE ERWEITERT - Bounty-Aufgaben für u5
 */
export const STRAHLENSATZ_BOUNTIES: Task[] = [
  {
    id: 'u5-bounty-baumhoehe',
    type: 'input',
    question:
      'Baumhöhe bestimmen: Person 1,70 m hoch, Schatten 2,5 m. Baum-Schatten 10 m.\n a) Baumhöhe (auf 0,1 m gerundet)?\n b) Welcher Strahlensatz? (Erster/Zweiter)',
    correctAnswer: '6,8; Erster',
    explanation:
      'h_Baum / h_Person = s_Baum / s_Person → h_Baum = (1,70 × 10) / 2,5 = 6,8 m. Erster Strahlensatz: Verhältnis der Strahlabschnitte.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'height',
        label: 'a) Baumhöhe (m)',
        validator: { type: 'numericTolerance', numericAnswer: 6.8, tolerance: 0.1 },
      },
      {
        id: 'satz',
        label: 'b) Strahlensatz',
        validator: { type: 'keywords', keywordsAny: ['erster', 'erstes', 'strahlensatz'] },
      },
    ],
  },
  {
    id: 'u5-bounty-umkehrung',
    type: 'input',
    question:
      'Zwei Strahlen, zwei Geraden. Abschnitte: Strahl 1: 5 cm / 10 cm, Strahl 2: 6 cm / 12 cm.\n a) Verhältnis Strahl 1?\n b) Sind die Geraden parallel? (ja/nein)',
    correctAnswer: '0,5; ja',
    explanation:
      'Verhältnis Strahl 1: 5/10 = 0,5. Verhältnis Strahl 2: 6/12 = 0,5. Da die Verhältnisse gleich sind, sind die Geraden parallel (Umkehrung des Strahlensatzes).',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'ratio',
        label: 'a) Verhältnis',
        validator: { type: 'numericTolerance', numericAnswer: 0.5, tolerance: 0.01 },
      },
      {
        id: 'parallel',
        label: 'b) Parallel?',
        validator: { type: 'keywords', keywordsAny: ['ja', 'j', 'yes', 'parallel'] },
      },
    ],
  },
];

/**
 * KONGRUENTE DREIECKE - Bounty-Aufgaben für u2
 */
export const KONGRUENZ_BOUNTIES: Task[] = [
  {
    id: 'u2-bounty-kongruenz',
    type: 'input',
    question:
      'Dreieck ABC: a=6 cm, b=8 cm, γ=90°. Dreieck DEF: d=6 cm, e=8 cm, ε=90°.\n a) Welcher Kongruenzsatz? (SSS/SWS/WSW/SSW)\n b) Sind die Dreiecke kongruent? (ja/nein)\n c) Begründung kurz?',
    correctAnswer: 'SWS; ja; zwei Seiten und eingeschlossener Winkel gleich',
    explanation:
      'SWS-Satz: Zwei Seiten (a=d, b=e) und der eingeschlossene Winkel (γ=ε=90°) sind gleich → Dreiecke kongruent.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'satz',
        label: 'a) Kongruenzsatz',
        validator: { type: 'keywords', keywordsAny: ['sws', 's-w-s'] },
      },
      {
        id: 'kongruent',
        label: 'b) Kongruent?',
        validator: { type: 'keywords', keywordsAny: ['ja', 'j', 'yes'] },
      },
      {
        id: 'reason',
        label: 'c) Begründung',
        validator: {
          type: 'keywords',
          keywordsAny: ['seiten', 'winkel', 'eingeschlossen', 'sws', 'gleich'],
        },
      },
    ],
  },
];

/**
 * VIELEcke - Bounty-Aufgaben für u3
 */
export const VIELEcke_BOUNTIES: Task[] = [
  {
    id: 'u3-bounty-achteck',
    type: 'input',
    question:
      'Regelmäßiges Achteck: Seitenlänge a = 6 cm.\n a) Umfang (cm)?\n b) Flächeninhalt? (Formel: A ≈ 4,83 × a², auf ganze cm² gerundet)',
    correctAnswer: '48; 174',
    explanation: 'Umfang = 8 × a = 8 × 6 = 48 cm. Fläche ≈ 4,83 × 6² = 4,83 × 36 ≈ 174 cm².',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'perimeter',
        label: 'a) Umfang (cm)',
        validator: { type: 'numeric', numericAnswer: 48 },
      },
      {
        id: 'area',
        label: 'b) Fläche (cm²)',
        validator: { type: 'numericTolerance', numericAnswer: 174, tolerance: 5 },
      },
    ],
  },
];

/**
 * 3D-GEOMETRIE - Bounty-Aufgaben für u4
 */
export const DREID_BOUNTIES: Task[] = [
  {
    id: 'u4-bounty-3d-abstand',
    type: 'input',
    question: 'Punkt A(2|3|4), Punkt B(5|7|9). Abstand im Raum? (auf 1 Dezimalstelle gerundet)',
    correctAnswer: '7,1',
    explanation: 'Abstand = √((5-2)² + (7-3)² + (9-4)²) = √(9+16+25) = √50 ≈ 7,1.',
    difficultyLevel: 'Mittel',
    validator: { type: 'numericTolerance', numericAnswer: 7.1, tolerance: 0.1 },
  },
  {
    id: 'u4-bounty-schnitt-wuerfel',
    type: 'input',
    question:
      'Würfel (Kante 8 cm) wird von einer Ebene geschnitten, die durch drei Eckpunkte geht.\n a) Welche Form hat der Schnitt? (Dreieck/Quadrat/Rechteck/Fünfeck)\n b) Umfang des Schnitts? (auf 0,1 cm gerundet)',
    correctAnswer: 'Dreieck; 33,9',
    explanation:
      'Schnitt durch drei Eckpunkte eines Würfels ergibt ein Dreieck. Seitenlänge = Raumdiagonale einer Seitenfläche = 8√2 ≈ 11,31 cm. Umfang = 3 × 11,31 ≈ 33,9 cm.',
    difficultyLevel: 'Schwer',
    multiInputFields: [
      {
        id: 'form',
        label: 'a) Form',
        validator: { type: 'keywords', keywordsAny: ['dreieck', 'triangle'] },
      },
      {
        id: 'perimeter',
        label: 'b) Umfang (cm)',
        validator: { type: 'numericTolerance', numericAnswer: 33.9, tolerance: 0.5 },
      },
    ],
  },
];

/**
 * Alle neuen Bounty-Aufgaben kombiniert nach Units
 *
 * Diese können in bountyCatalog.ts integriert werden:
 *
 * import { TRIGONOMETRIE_BOUNTIES, PYTHAGORAS_BOUNTIES, ... } from './geometrieMundoBounties';
 *
 * const BASE_BOUNTIES: Record<UnitId, Task[]> = {
 *   ...
 *   u2: [...existing, ...TRIGONOMETRIE_BOUNTIES.filter(t => t.id.startsWith('u2-')), ...KONGRUENZ_BOUNTIES],
 *   u3: [...existing, ...VIELEcke_BOUNTIES],
 *   u4: [...existing, ...KOERPER_BOUNTIES, ...DREID_BOUNTIES],
 *   u5: [...existing, ...STRAHLENSATZ_BOUNTIES],
 *   u6: [...existing, ...PYTHAGORAS_BOUNTIES, ...TRIGONOMETRIE_BOUNTIES.filter(t => t.id.startsWith('u6-'))],
 * };
 */
export const ALL_MUNDO_BOUNTIES = {
  trigonometrie: TRIGONOMETRIE_BOUNTIES,
  pythagoras: PYTHAGORAS_BOUNTIES,
  koerper: KOERPER_BOUNTIES,
  strahlensatz: STRAHLENSATZ_BOUNTIES,
  kongruenz: KONGRUENZ_BOUNTIES,
  vielecke: VIELEcke_BOUNTIES,
  dreid: DREID_BOUNTIES,
};

