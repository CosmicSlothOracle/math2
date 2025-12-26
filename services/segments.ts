/**
 * Segment-Konfigurationen
 *
 * Jedes Segment enthält:
 * - Voraufgaben: Interaktive Mini-Games
 * - Bounty-Aufgaben: Klassische Prüfungsaufgaben
 *
 * Struktur ermöglicht einfaches Hinzufügen weiterer Segmente.
 */

import { PreTask, BountyTask } from '../types';

export interface SegmentConfig {
  id: string;
  unitId: string; // Verknüpfung zur LearningUnit
  preTasks: PreTask[];
  bountyTasks: BountyTask[];
}

/**
 * Segment 1: Figuren verstehen
 */
export const SEGMENT_FIGUREN_VERSTEHEN: SegmentConfig = {
  id: 'figuren_verstehen',
  unitId: 'u1', // Verknüpft mit "Figuren verstehen" Unit

  preTasks: [
    {
      id: 'alien-scanner',
      title: 'Alien-Scanner',
      description: 'Eigenschaften werden eingeblendet - welche Figurenklassen sind möglich?',
      uiType: 'interactive',
      meta: {
        type: 'alienScanner',
        properties: [
          { id: 'p1', text: 'Parallele Gegenseiten', revealed: false },
          { id: 'p2', text: 'Rechte Winkel', revealed: false },
          { id: 'p3', text: 'Gleich lange Seiten', revealed: false },
          { id: 'p4', text: 'Symmetrieachsen', revealed: false }
        ],
        possibleShapes: [
          { id: 'viereck', label: 'Viereck', possible: true },
          { id: 'parallelogramm', label: 'Parallelogramm', possible: true },
          { id: 'rechteck', label: 'Rechteck', possible: true },
          { id: 'quadrat', label: 'Quadrat', possible: true },
          { id: 'raute', label: 'Raute', possible: true },
          { id: 'trapez', label: 'Trapez', possible: true }
        ],
        correctAnswers: {
          // Beispiel: Wenn alle Eigenschaften → Quadrat
          all: ['quadrat'],
          // Wenn nur parallele Gegenseiten → Parallelogramm, Rechteck, Quadrat, Raute
          parallelOnly: ['parallelogramm', 'rechteck', 'quadrat', 'raute']
        }
      },
      correctAnswer: 'quadrat', // Beispiel
      explanation: 'Mit allen Eigenschaften kann es nur ein Quadrat sein!'
    },
    {
      id: 'formen-designer',
      title: 'Formen-Designer',
      description: 'Entwerfe eine Figur mit den gegebenen Bedingungen',
      uiType: 'interactive',
      meta: {
        type: 'shapeDesigner',
        conditions: [
          { id: 'c1', text: 'Mindestens zwei Symmetrieachsen', required: true },
          { id: 'c2', text: 'Keine rechten Winkel', required: true },
          { id: 'c3', text: 'Gleich lange Seiten', required: false }
        ],
        availableProperties: [
          { id: 'symmetry', label: 'Symmetrieachsen', count: 0 },
          { id: 'rightAngles', label: 'Rechte Winkel', count: 0 },
          { id: 'equalSides', label: 'Gleich lange Seiten', count: 0 }
        ]
      },
      correctAnswer: 'raute', // Beispiel: Raute hat Symmetrieachsen, keine rechten Winkel (außer Quadrat)
      explanation: 'Eine Raute erfüllt die Bedingungen!'
    },
    {
      id: 'klassifikations-matrix',
      title: 'Klassifikations-Matrix',
      description: 'Ordne die Figuren in die Matrix ein',
      uiType: 'dragDrop',
      meta: {
        type: 'classificationMatrix',
        shapes: [
          { id: 's1', path: 'M 30,30 L 170,30 L 170,120 L 30,120 Z', shapeType: 'square', label: 'Quadrat' },
          { id: 's2', path: 'M 40,30 L 160,30 L 160,120 L 40,120 Z', shapeType: 'rectangle', label: 'Rechteck' },
          { id: 's3', path: 'M 50,50 L 150,30 L 150,120 L 50,100 Z', shapeType: 'parallelogram', label: 'Parallelogramm' },
          { id: 's4', path: 'M 100,30 L 150,80 L 100,130 L 50,80 Z', shapeType: 'rhombus', label: 'Raute' }
        ],
        matrix: {
          rows: ['Rechte Winkel', 'Keine rechten Winkel'],
          cols: ['Parallele Gegenseiten', 'Keine parallelen Gegenseiten']
        }
      },
      correctAnswer: JSON.stringify({
        's1': 'row0-col0', // Quadrat: Rechte Winkel + Parallele Gegenseiten
        's2': 'row0-col0', // Rechteck: Rechte Winkel + Parallele Gegenseiten
        's3': 'row1-col0', // Parallelogramm: Keine rechten Winkel + Parallele Gegenseiten
        's4': 'row1-col0' // Raute: Keine rechten Winkel + Parallele Gegenseiten
      }),
      explanation: 'Perfekt eingeordnet!'
    }
  ],

  bountyTasks: [
    {
      id: 'bounty-1',
      question: 'Ein Viereck hat parallele Gegenseiten und gleich lange Seiten. a) Welcher Figurenklasse gehört es an? b) Begründe deine Antwort. c) Nenne eine Eigenschaft, die nicht zwingend gilt.',
      type: 'input',
      context: 'Klassifikation von Vierecken: Ein Viereck mit parallelen Gegenseiten und gleich langen Seiten.',
      given: [
        'Das Viereck hat parallele Gegenseiten (mindestens ein Paar).',
        'Alle vier Seiten sind gleich lang.'
      ],
      asked: [
        'a) Zu welcher Figurenklasse gehört dieses Viereck?',
        'b) Begründe deine Antwort kurz.',
        'c) Nenne eine Eigenschaft, die für diese Figurenklasse nicht zwingend gilt.'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Figurenklasse', type: 'dropdown', options: ['Quadrat', 'Raute', 'Parallelogramm', 'Rechteck'] },
          { id: 'b', label: 'b) Begründung', type: 'text' },
          { id: 'c', label: 'c) Nicht zwingende Eigenschaft', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: 'raute',
        b: 'parallele gegenseiten und gleich lange seiten',
        c: 'rechte winkel'
      }),
      explanation: 'Es könnte ein Quadrat oder eine Raute sein. Rechte Winkel sind nicht zwingend.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Figurenklasse',
          placeholder: 'z.B. Raute oder Quadrat',
          validator: { type: 'keywords', keywordsAny: ['raute', 'rhombus', 'quadrat', 'square'] }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Warum gehört es zu dieser Klasse?',
          validator: { type: 'keywords', keywordsAny: ['parallele gegenseiten', 'gleich lange seiten', 'vier seiten gleich'] }
        },
        {
          id: 'c',
          label: 'c) Nicht zwingende Eigenschaft',
          placeholder: 'z.B. rechte Winkel',
          validator: { type: 'keywords', keywordsAny: ['rechte winkel', 'rechten winkel', 'rechtwinklig', '90°', '90 grad'], requireNegation: true }
        }
      ]
    },
    {
      id: 'bounty-2',
      question: 'Die Aussage "Jedes Rechteck ist ein Quadrat" ist: a) richtig oder falsch? b) Begründe. c) Formuliere die korrekte Aussage.',
      type: 'input',
      context: 'Beurteilung einer mathematischen Aussage über die Beziehung zwischen Rechtecken und Quadraten.',
      given: [
        'Die Aussage lautet: "Jedes Rechteck ist ein Quadrat".',
        'Ein Rechteck hat vier rechte Winkel und parallele Gegenseiten.',
        'Ein Quadrat hat vier rechte Winkel, parallele Gegenseiten und vier gleich lange Seiten.'
      ],
      asked: [
        'a) Ist die Aussage richtig oder falsch?',
        'b) Begründe deine Antwort kurz.',
        'c) Formuliere die korrekte Aussage (falls die gegebene falsch ist).'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Bewertung', type: 'dropdown', options: ['Richtig', 'Falsch'] },
          { id: 'b', label: 'b) Begründung', type: 'text' },
          { id: 'c', label: 'c) Korrekte Aussage', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: 'falsch',
        b: 'nicht jedes rechteck hat gleich lange seiten',
        c: 'jedes quadrat ist ein rechteck'
      }),
      explanation: 'Falsch! Nicht jedes Rechteck ist ein Quadrat, aber jedes Quadrat ist ein Rechteck.',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Bewertung',
          placeholder: 'richtig / falsch',
          validator: { type: 'boolean', booleanExpected: 'false' }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Warum ist die Aussage falsch?',
          validator: { type: 'keywords', keywordsAny: ['rechte winkel', 'rechten winkel', 'gleich lange seiten', 'nicht jedes'], requireNegation: true }
        },
        {
          id: 'c',
          label: 'c) Korrekte Aussage',
          placeholder: 'z.B. Jedes Quadrat ist ein Rechteck',
          validator: { type: 'keywords', keywordsAny: ['jedes quadrat ist ein rechteck', 'jedes quadrat ist ein parallelogramm', 'jedes quadrat ist ein rechteck und eine raute'] }
        }
      ]
    },
    {
      id: 'bounty-3',
      question: 'Ordne die Begriffe logisch: Viereck – Parallelogramm – Rechteck – Quadrat. a) Nenne die richtige Reihenfolge. b) Begründe die Ordnung.',
      type: 'input',
      context: 'Hierarchische Klassifikation von Vierecken: Von allgemein zu speziell.',
      given: [
        'Viereck: Allgemeine Form mit vier Seiten.',
        'Parallelogramm: Viereck mit parallelen Gegenseiten.',
        'Rechteck: Parallelogramm mit vier rechten Winkeln.',
        'Quadrat: Rechteck mit vier gleich langen Seiten.'
      ],
      asked: [
        'a) Nenne die Begriffe in der richtigen Reihenfolge (von allgemein zu speziell).',
        'b) Begründe, warum diese Ordnung logisch ist.'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Reihenfolge', type: 'text', hint: 'z.B. Viereck, Parallelogramm, Rechteck, Quadrat' },
          { id: 'b', label: 'b) Begründung', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: 'viereck parallelogramm rechteck quadrat',
        b: 'jede form ist spezialisierung der vorherigen'
      }),
      explanation: 'Viereck → Parallelogramm (parallele Gegenseiten) → Rechteck (rechte Winkel) → Quadrat (gleich lange Seiten).',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Reihenfolge',
          placeholder: 'z.B. Viereck, Parallelogramm, Rechteck, Quadrat',
          validator: { type: 'keywords', keywordsAll: ['viereck', 'parallelogramm', 'rechteck', 'quadrat'] }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Warum ist diese Ordnung logisch?',
          validator: { type: 'keywords', keywordsAny: ['spezialisierung', 'hierarchie', 'jede form ist', 'erfüllt alle bedingungen', 'zusätzliche eigenschaft'] }
        }
      ]
    }
  ]
};

/**
 * Segment 2: Winkel & Beziehungen
 */
export const SEGMENT_WINKEL_BEZIEHUNGEN: SegmentConfig = {
  id: 'winkel_beziehungen',
  unitId: 'u2', // Verknüpft mit "Winkel & Beziehungen" Unit

  preTasks: [
    {
      id: 'laser-parcours',
      title: 'Laser-Parcours',
      description: 'Bewege den Laser-Strahl und erkenne Winkelbeziehungen!',
      uiType: 'interactive',
      meta: {
        type: 'laserParcours',
        parallelLines: 2,
        initialAngle: 45,
        relationships: ['nebenwinkel', 'scheitelwinkel', 'stufenwinkel', 'wechselwinkel']
      },
      correctAnswer: JSON.stringify({
        nebenwinkel: true,
        scheitelwinkel: true,
        stufenwinkel: true,
        wechselwinkel: true
      }),
      explanation: 'Super! Du hast alle Winkelbeziehungen erkannt!'
    },
    {
      id: 'escape-dreieck',
      title: 'Escape-Dreieck',
      description: 'Schalte die Winkel Schritt für Schritt frei und prüfe die Winkelsumme!',
      uiType: 'interactive',
      meta: {
        type: 'escapeTriangle',
        scenarios: [
          {
            id: 's1',
            angles: [60, 80, 40],
            description: 'Dreieck mit Winkeln 60°, 80°, 40°'
          },
          {
            id: 's2',
            angles: [47, 63, 70],
            description: 'Dreieck mit Winkeln 47°, 63°, 70°'
          },
          {
            id: 's3',
            angles: [90, 45, 45],
            description: 'Dreieck mit Winkeln 90°, 45°, 45°'
          }
        ],
        currentScenarioIndex: 0
      },
      correctAnswer: 'allRevealed',
      explanation: 'Perfekt! Die Winkelsumme im Dreieck beträgt immer 180°!'
    },
    {
      id: 'reality-check',
      title: 'Reality-Check',
      description: 'Finde die falschen Messwerte - welche Werte sind nicht plausibel?',
      uiType: 'interactive',
      meta: {
        type: 'realityCheck',
        scenarios: [
          {
            id: 'scenario1',
            measurements: [
              {
                id: 'm1',
                label: 'Winkel α',
                value: 38,
                unit: '°',
                isCorrect: true
              },
              {
                id: 'm2',
                label: 'Winkel β',
                value: 142,
                unit: '°',
                isCorrect: true,
                explanation: 'Nebenwinkel zu 38° = 180° - 38° = 142°'
              },
              {
                id: 'm3',
                label: 'Winkel γ',
                value: 38,
                unit: '°',
                isCorrect: true,
                explanation: 'Scheitelwinkel zu α = 38°'
              },
              {
                id: 'm4',
                label: 'Winkel δ',
                value: 145,
                unit: '°',
                isCorrect: false,
                correctValue: 142,
                explanation: 'Sollte 142° sein (Nebenwinkel zu γ)'
              }
            ]
          },
          {
            id: 'scenario2',
            measurements: [
              {
                id: 'm1',
                label: 'Dreieck Winkel 1',
                value: 47,
                unit: '°',
                isCorrect: true
              },
              {
                id: 'm2',
                label: 'Dreieck Winkel 2',
                value: 63,
                unit: '°',
                isCorrect: true
              },
              {
                id: 'm3',
                label: 'Dreieck Winkel 3',
                value: 72,
                unit: '°',
                isCorrect: false,
                correctValue: 70,
                explanation: 'Summe muss 180° sein: 47 + 63 = 110, also 180 - 110 = 70°'
              }
            ]
          }
        ],
        currentScenarioIndex: 0
      },
      correctAnswer: 'allIdentified',
      explanation: 'Ausgezeichnet! Du hast alle falschen Werte gefunden!'
    }
  ],

  bountyTasks: [
    {
      id: 'bounty-1',
      question: 'Zwei parallele Geraden werden von einer Querlinie geschnitten. Ein Winkel beträgt 38°. a) Bestimme alle weiteren Winkel. b) Begründe deine Antwort mit den Winkelbeziehungen.',
      type: 'input',
      context: 'Winkelbeziehungen bei parallelen Geraden: Zwei parallele Geraden werden von einer Querlinie (Transversale) geschnitten.',
      given: [
        'Zwei parallele Geraden werden von einer Querlinie geschnitten.',
        'Ein Winkel an der Schnittstelle beträgt 38°.',
        'Winkelbeziehungen: Nebenwinkel ergänzen sich zu 180°, Scheitelwinkel sind gleich groß, Stufenwinkel an parallelen Geraden sind gleich groß.'
      ],
      asked: [
        'a) Bestimme alle weiteren Winkel in Grad (durch Komma getrennt, z.B. 142, 38, 142).',
        'b) Begründe deine Antwort mit den verwendeten Winkelbeziehungen.'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Alle weiteren Winkel (°)', type: 'text', hint: 'Durch Komma getrennt, z.B. 142, 38, 142' },
          { id: 'b', label: 'b) Begründung', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: '142, 38, 142',
        b: 'nebenwinkel scheitelwinkel stufenwinkel'
      }),
      explanation: 'Nebenwinkel: 180° - 38° = 142°, Scheitelwinkel: 38°, Stufenwinkel: 38° und 142°',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Alle weiteren Winkel (°)',
          placeholder: 'z.B. 142, 38, 142',
          validator: { type: 'keywords', keywordsAny: ['142', '38'] }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Welche Winkelbeziehungen hast du verwendet?',
          validator: { type: 'keywords', keywordsAny: ['nebenwinkel', 'scheitelwinkel', 'stufenwinkel', 'wechselwinkel'] }
        }
      ]
    },
    {
      id: 'bounty-pythagoras',
      question: 'Ein rechtwinkliges Dreieck hat die Katheten a=6cm und b=8cm. Berechne die Hypotenuse c mit dem Satz des Pythagoras.',
      type: 'input',
      context: 'Satz des Pythagoras: In einem rechtwinkligen Dreieck gilt a² + b² = c², wobei c die Hypotenuse ist.',
      given: [
        'Rechtwinkliges Dreieck mit rechtem Winkel zwischen den Katheten.',
        'Kathete a = 6 cm',
        'Kathete b = 8 cm',
        'Gesucht: Hypotenuse c'
      ],
      asked: [
        'Berechne die Hypotenuse c in cm (nur die Zahl, ohne Einheit).',
        'Hinweis: Runde auf zwei Dezimalstellen, falls nötig.'
      ],
      answerFormat: {
        type: 'single',
        hint: 'Nur die Zahl eingeben (z.B. 10 oder 10.00)'
      },
      correctAnswer: '10',
      explanation: 'Satz des Pythagoras: c² = a² + b² = 6² + 8² = 36 + 64 = 100. Also c = √100 = 10cm.',
      difficultyLevel: 'Mittel',
      placeholder: 'cm (nur Zahl)',
      validator: { type: 'numericTolerance', numericAnswer: 10, tolerance: 0.1 }
    },
    {
      id: 'bounty-2',
      question: 'Ein Dreieck hat die Winkel 47° und 63°. a) Berechne den dritten Winkel. b) Begründe deine Antwort.',
      type: 'input',
      context: 'Winkelsumme im Dreieck: Die Summe aller drei Innenwinkel beträgt immer 180°.',
      given: [
        'Ein Dreieck mit drei Innenwinkeln.',
        'Winkel 1 = 47°',
        'Winkel 2 = 63°',
        'Gesucht: Winkel 3'
      ],
      asked: [
        'a) Berechne den dritten Winkel in Grad (nur die Zahl).',
        'b) Begründe deine Antwort kurz.'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Dritter Winkel (°)', type: 'text', hint: 'Nur die Zahl' },
          { id: 'b', label: 'b) Begründung', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: '70',
        b: 'winkelsumme dreieck 180'
      }),
      explanation: 'Winkelsumme im Dreieck: 180° - 47° - 63° = 70°',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Dritter Winkel (°)',
          placeholder: 'z.B. 70',
          validator: { type: 'numeric', numericAnswer: 70 }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Warum ist das so?',
          validator: { type: 'keywords', keywordsAny: ['winkelsumme', '180', 'dreieck', 'summe'] }
        }
      ]
    },
    {
      id: 'bounty-3',
      question: 'Ein Dreieck hat die Winkel 61°, 59° und 59°. a) Prüfe, ob diese Winkelwerte möglich sind. b) Begründe deine Antwort.',
      type: 'input',
      context: 'Winkelsumme im Dreieck: Die Summe aller drei Innenwinkel muss genau 180° betragen.',
      given: [
        'Ein Dreieck mit drei gegebenen Winkeln.',
        'Winkel 1 = 61°',
        'Winkel 2 = 59°',
        'Winkel 3 = 59°'
      ],
      asked: [
        'a) Prüfe, ob diese Winkelwerte möglich sind (ja/nein).',
        'b) Begründe deine Antwort mit einer Rechnung.'
      ],
      answerFormat: {
        type: 'multiField',
        fields: [
          { id: 'a', label: 'a) Möglich?', type: 'dropdown', options: ['Ja', 'Nein'] },
          { id: 'b', label: 'b) Begründung', type: 'text' }
        ]
      },
      correctAnswer: JSON.stringify({
        a: 'nein',
        b: 'summe 179 nicht 180'
      }),
      explanation: 'Summe: 61° + 59° + 59° = 179° ≠ 180°. Die Winkelsumme im Dreieck muss genau 180° betragen.',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        {
          id: 'a',
          label: 'a) Möglich?',
          placeholder: 'ja / nein',
          validator: { type: 'boolean', booleanExpected: 'false' }
        },
        {
          id: 'b',
          label: 'b) Begründung',
          placeholder: 'Warum ist das so?',
          validator: { type: 'keywords', keywordsAny: ['summe', '179', '180', 'nicht', 'gleich'] }
        }
      ]
    }
  ]
};

/**
 * Segment 3: Flächen & Terme
 */
export const SEGMENT_FLAECHEN_TERME: SegmentConfig = {
  id: 'flaechen_terme',
  unitId: 'u3', // Verknüpft mit "Flächen & Terme" Unit

  preTasks: [
    {
      id: 'flaechen-baukasten',
      title: 'Flächen-Baukasten',
      description: 'Verschiebe Rechtecke und Dreiecke - die Gesamtfläche aktualisiert sich live!',
      uiType: 'interactive',
      meta: {
        type: 'areaBuilder',
        initialShapes: [
          { id: 'r1', type: 'rectangle', x: 50, y: 50, width: 80, height: 60, color: '#3b82f6', label: 'R1' },
          { id: 't1', type: 'triangle', x: 150, y: 50, width: 60, height: 60, color: '#10b981', label: 'T1' },
          { id: 'r2', type: 'rectangle', x: 250, y: 50, width: 60, height: 60, color: '#f59e0b', label: 'R2' }
        ],
        targetArea: 12, // Ziel: 12 cm² (R1: 4.8, T1: 1.8, R2: 3.6 = 10.2, Ziel etwas höher für Herausforderung)
        gridSize: 20
      },
      correctAnswer: JSON.stringify({ area: 12000 }),
      explanation: 'Super! Du hast die Formen richtig zusammengesetzt.'
    },
    {
      id: 'term-explorer',
      title: 'Term-Explorer',
      description: 'Verändere die Variable und sieh direkt, wie sich die Fläche ändert!',
      uiType: 'interactive',
      meta: {
        type: 'termExplorer',
        formulas: [
          { id: 'f1', formula: 'x * 5', variableName: 'x', min: 1, max: 10, visualType: 'rectangle', description: 'Rechteck mit Breite x und Höhe 5' },
          { id: 'f2', formula: '(x + 2) * (x - 1)', variableName: 'x', min: 2, max: 8, visualType: 'rectangle', description: 'Rechteck (x+2) × (x-1)' },
          { id: 'f3', formula: '0.5 * x * 7', variableName: 'x', min: 3, max: 12, visualType: 'triangle', description: 'Dreieck mit Grundseite x und Höhe 7' }
        ],
        currentFormulaIndex: 0
      },
      correctAnswer: 'explored',
      explanation: 'Du hast gesehen, wie sich Variablen auf die Fläche auswirken!'
    },
    {
      id: 'fehler-debugger',
      title: 'Fehler-Debugger',
      description: 'Finde und korrigiere die Fehler in diesen Flächentermen!',
      uiType: 'interactive',
      meta: {
        type: 'termDebugger',
        problems: [
          {
            id: 'p1',
            wrongTerm: 'x * x + 5',
            correctTerm: 'x * (x + 5)',
            shapeDescription: 'Rechteck mit Seiten x und (x+5)',
            explanation: 'Klammern fehlen! Es muss x * (x + 5) sein.'
          },
          {
            id: 'p2',
            wrongTerm: 'x * 12',
            correctTerm: '0.5 * x * 12',
            shapeDescription: 'Dreieck mit Grundseite x und Höhe 12',
            explanation: 'Für ein Dreieck brauchst du den Faktor 0.5!'
          },
          {
            id: 'p3',
            wrongTerm: '(x + 2) * x',
            correctTerm: '(x + 2) * (x - 1)',
            shapeDescription: 'Rechteck mit Seiten (x+2) und (x-1)',
            explanation: 'Die zweite Seite ist (x-1), nicht x!'
          }
        ],
        currentProblemIndex: 0
      },
      correctAnswer: JSON.stringify({
        p1: 'x * (x + 5)',
        p2: '0.5 * x * 12',
        p3: '(x + 2) * (x - 1)'
      }),
      explanation: 'Alle Fehler gefunden und korrigiert!'
    }
  ],

  bountyTasks: [
    {
      id: 'bounty-1',
      question: 'Ein Rechteck hat die Seitenlängen (x+2) und (x−1). a) Stelle den Term für die Fläche auf. b) Vereinfache den Term. c) Berechne die Fläche für x=6.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '(x+2)*(x-1)',
        b: 'x²+x-2',
        c: '40'
      }),
      explanation: 'Term: (x+2)(x-1) = x² + x - 2. Für x=6: 36 + 6 - 2 = 40 cm²',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-2',
      question: 'Ein Dreieck hat die Grundseite 12 cm und die Höhe h. a) Stelle den Term für die Fläche auf. b) Berechne die Fläche für h=7 cm.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '0.5*12*h',
        b: '42'
      }),
      explanation: 'Term: A = 0.5 * 12 * h = 6h. Für h=7: 6 * 7 = 42 cm²',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-3',
      question: 'Eine Figur besteht aus einem Quadrat mit Seitenlänge a und einem Rechteck mit Seiten a und 3a. a) Stelle den Term für die Gesamtfläche auf. b) Vereinfache den Term.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: 'a² + a*3a',
        b: '4a²'
      }),
      explanation: 'Quadrat: a², Rechteck: a * 3a = 3a². Gesamt: a² + 3a² = 4a²',
      difficultyLevel: 'Schwer',
      placeholder: 'Antwort eingeben...'
    }
  ]
};

/**
 * Segment 4: Körper & Oberflächen
 */
export const SEGMENT_KOERPER_OBERFLAECHEN: SegmentConfig = {
  id: 'koerper_oberflaechen',
  unitId: 'u4', // Verknüpft mit "Körper & Oberflächen" Unit

  preTasks: [
    {
      id: '3d-viewer',
      title: '3D-Viewer',
      description: 'Drehe die Körper, zerlege sie und setze sie wieder zusammen!',
      uiType: 'interactive',
      meta: {
        type: 'threeDViewer',
        bodies: [
          {
            id: 'cube1',
            type: 'cube',
            dimensions: { width: 60, height: 60, depth: 60 },
            position: { x: 0, y: 0, z: 0 },
            color: '#3b82f6',
            label: 'Quader'
          },
          {
            id: 'cylinder1',
            type: 'cylinder',
            dimensions: { width: 0, height: 80, depth: 0, radius: 30 },
            position: { x: 100, y: 0, z: 0 },
            color: '#10b981',
            label: 'Zylinder'
          }
        ],
        enableRotation: true,
        enableDecomposition: true
      },
      correctAnswer: 'explored',
      explanation: 'Super! Du hast die Körper erkundet und verstanden.'
    },
    {
      id: 'volumen-fuellsimulation',
      title: 'Volumen-Füllsimulation',
      description: 'Sieh, wie Flüssigkeit die Körper füllt - das Volumen wird sichtbar!',
      uiType: 'interactive',
      meta: {
        type: 'volumeFillSimulation',
        bodies: [
          {
            id: 'cube-fill',
            type: 'cube',
            dimensions: { width: 80, height: 80, depth: 80 },
            volume: 512, // 8×8×8 cm³
            color: '#3b82f6',
            label: 'Quader 8×8×8 cm'
          },
          {
            id: 'cylinder-fill',
            type: 'cylinder',
            dimensions: { width: 0, height: 100, depth: 0, radius: 30 },
            volume: 282.6, // π × 3² × 10 ≈ 282.6 cm³
            color: '#10b981',
            label: 'Zylinder r=3, h=10 cm'
          }
        ],
        currentBodyIndex: 0
      },
      correctAnswer: 'filled',
      explanation: 'Perfekt! Du hast gesehen, wie Volumen funktioniert.'
    },
    {
      id: 'oberflaechen-highlight',
      title: 'Oberflächen-Highlight',
      description: 'Fahre mit der Maus über die Flächen - sieh die einzelnen Seiten!',
      uiType: 'interactive',
      meta: {
        type: 'surfaceHighlight',
        problems: [
          {
            id: 'cube-surfaces',
            bodyType: 'cube',
            dimensions: { width: 80, height: 60, depth: 50 },
            surfaces: [
              { id: 'front', label: 'Vorderseite', area: 80 * 60 },
              { id: 'back', label: 'Rückseite', area: 80 * 60 },
              { id: 'right', label: 'Rechte Seite', area: 50 * 60 },
              { id: 'left', label: 'Linke Seite', area: 50 * 60 },
              { id: 'top', label: 'Oberseite', area: 80 * 50 },
              { id: 'bottom', label: 'Unterseite', area: 80 * 50 }
            ]
          },
          {
            id: 'cylinder-surfaces',
            bodyType: 'cylinder',
            dimensions: { width: 0, height: 100, depth: 0, radius: 30 },
            surfaces: [
              { id: 'top', label: 'Deckfläche', area: Math.PI * 30 * 30 },
              { id: 'bottom', label: 'Grundfläche', area: Math.PI * 30 * 30 },
              { id: 'mantel', label: 'Mantelfläche', area: 2 * Math.PI * 30 * 100 }
            ]
          }
        ],
        currentProblemIndex: 0
      },
      correctAnswer: 'explored',
      explanation: 'Ausgezeichnet! Du kennst jetzt alle Flächen.'
    }
  ],

  bountyTasks: [
    {
      id: 'bounty-1',
      question: 'Ein Quader hat die Maße 8 cm × 5 cm × 4 cm. a) Berechne das Volumen. b) Berechne die Oberfläche.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '160',
        b: '184'
      }),
      explanation: 'Volumen: 8 × 5 × 4 = 160 cm³. Oberfläche: 2×(8×5 + 8×4 + 5×4) = 2×(40+32+20) = 184 cm²',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-cylinder',
      question: 'Ein Zylinder hat den Radius r=3 cm und die Höhe h=10 cm (π≈3,14). a) Berechne das Volumen. b) Berechne die Oberfläche.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '283',
        b: '245'
      }),
      explanation: 'Volumen: π × r² × h = 3,14 × 9 × 10 = 282,6 cm³ ≈ 283 cm³. Oberfläche: 2×π×r² + 2×π×r×h = 2×3,14×9 + 2×3,14×3×10 = 245,04 cm² ≈ 245 cm²',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-2',
      question: 'Ein Zylinder hat den Radius r=3 cm und die Höhe h=10 cm (π≈3,14). a) Berechne das Volumen. b) Berechne die Oberfläche.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '282.6',
        b: '245.04'
      }),
      explanation: 'Volumen: π × r² × h = 3,14 × 9 × 10 = 282,6 cm³. Oberfläche: 2×π×r² + 2×π×r×h = 2×3,14×9 + 2×3,14×3×10 = 56,52 + 188,52 = 245,04 cm²',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-3',
      question: 'Ein zusammengesetzter Körper besteht aus einem Quader und einem Zylinder. a) Erkläre den Rechenweg für das Volumen. b) Erkläre, warum die Oberflächen nicht einfach addiert werden können.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: 'volumen quader + volumen zylinder',
        b: 'berührungsflächen werden doppelt gezählt'
      }),
      explanation: 'Volumen: Einfach addieren. Oberfläche: Berührungsflächen müssen abgezogen werden, da sie nicht zur äußeren Oberfläche gehören.',
      difficultyLevel: 'Schwer',
      placeholder: 'Antwort eingeben...'
    }
  ]
};

/**
 * Segment 5: Ähnlichkeit
 */
export const SEGMENT_AEHNLICHKEIT: SegmentConfig = {
  id: 'aehnlichkeit',
  unitId: 'u5', // Verknüpft mit "Ähnlichkeit" Unit

  preTasks: [
    {
      id: 'miniatur-stadt',
      title: 'Miniatur-Stadt',
      description: 'Skaliere Gebäude - sieh, wie sich Höhe, Breite und Fläche ändern!',
      uiType: 'interactive',
      meta: {
        type: 'scaleSimulator',
        buildings: [
          {
            id: 'b1',
            width: 100,
            height: 80,
            label: 'Haus'
          },
          {
            id: 'b2',
            width: 60,
            height: 120,
            label: 'Turm'
          },
          {
            id: 'b3',
            width: 80,
            height: 60,
            label: 'Gebäude'
          }
        ],
        currentBuildingIndex: 0,
        initialScale: 0.05 // 1:20
      },
      correctAnswer: 'explored',
      explanation: 'Super! Du hast gesehen, wie Maßstab funktioniert.'
    },
    {
      id: 'schatten-simulator',
      title: 'Schatten-Simulator',
      description: 'Verändere den Sonnenstand und sieh, wie sich die Schatten ändern!',
      uiType: 'interactive',
      meta: {
        type: 'shadowSimulator',
        scenarios: [
          {
            id: 's1',
            objects: [
              { id: 'obj1', height: 180, label: 'Mensch', color: '#3b82f6', position: 30 },
              { id: 'obj2', height: 500, label: 'Turm', color: '#64748b', position: 70 }
            ]
          },
          {
            id: 's2',
            objects: [
              { id: 'obj1', height: 150, label: 'Baum', color: '#10b981', position: 25 },
              { id: 'obj2', height: 300, label: 'Haus', color: '#f59e0b', position: 75 }
            ]
          }
        ],
        currentScenarioIndex: 0
      },
      correctAnswer: 'explored',
      explanation: 'Perfekt! Du verstehst jetzt, wie Schatten funktionieren.'
    },
    {
      id: 'skalierungs-spiel',
      title: 'Skalierungs-Spiel',
      description: 'Vergrößere und verkleinere Figuren - sieh den Unterschied zwischen Längen und Flächen!',
      uiType: 'interactive',
      meta: {
        type: 'scalingGame',
        shapes: [
          {
            id: 'shape1',
            shapeType: 'square',
            dimensions: { width: 50, height: 50 }
          },
          {
            id: 'shape2',
            shapeType: 'triangle',
            dimensions: { width: 60, height: 80 }
          },
          {
            id: 'shape3',
            shapeType: 'rectangle',
            dimensions: { width: 80, height: 50 }
          },
          {
            id: 'shape4',
            shapeType: 'circle',
            dimensions: { width: 0, height: 0, radius: 30 }
          }
        ],
        currentShapeIndex: 0
      },
      correctAnswer: 'explored',
      explanation: 'Ausgezeichnet! Du weißt jetzt: Flächen ändern sich mit dem Quadrat!'
    }
  ],

  bountyTasks: [
    {
      id: 'bounty-1',
      question: 'Ein Modellauto ist im Maßstab 1:20 gebaut. Das echte Auto ist 4,2 m lang. a) Wie lang ist das Modellauto? b) Begründe deine Rechnung.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '21',
        b: '4.2 m geteilt durch 20'
      }),
      explanation: 'Modelllänge = 4,2 m ÷ 20 = 0,21 m = 21 cm',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-strahlensatz',
      question: 'Ein Mensch (1,80 m) wirft einen Schatten von 2,4 m. Ein Turm wirft einen Schatten von 12 m. a) Wie hoch ist der Turm? b) Erkläre deinen Rechenweg.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '9',
        b: 'strahlensatz oder dreisatz'
      }),
      explanation: 'Verhältnis: 1,80 m / 2,4 m = Turmhöhe / 12 m → Turmhöhe = (1,80 × 12) / 2,4 = 9 m',
      difficultyLevel: 'Schwer',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-2',
      question: 'Zwei ähnliche Dreiecke haben Seiten, die beim zweiten Dreieck doppelt so lang sind wie beim ersten. a) Wie verhält sich die Fläche? b) Begründe deine Antwort.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '4',
        b: 'flächen ändern sich mit dem quadrat'
      }),
      explanation: 'Wenn Seiten doppelt so lang → Fläche wird 2² = 4× so groß!',
      difficultyLevel: 'Mittel',
      placeholder: 'Antwort eingeben...'
    },
    {
      id: 'bounty-3',
      question: 'Ein Mensch (1,80 m) wirft einen Schatten von 2,4 m. Ein Turm wirft einen Schatten von 12 m. a) Wie hoch ist der Turm? b) Erkläre deinen Rechenweg.',
      type: 'input',
      correctAnswer: JSON.stringify({
        a: '9',
        b: 'strahlensatz oder dreisatz'
      }),
      explanation: 'Verhältnis: 1,80 m / 2,4 m = Turmhöhe / 12 m → Turmhöhe = 9 m',
      difficultyLevel: 'Schwer',
      placeholder: 'Antwort eingeben...'
    }
  ]
};

/**
 * Alle Segmente
 */
export const SEGMENTS: Record<string, SegmentConfig> = {
  figuren_verstehen: SEGMENT_FIGUREN_VERSTEHEN,
  winkel_beziehungen: SEGMENT_WINKEL_BEZIEHUNGEN,
  flaechen_terme: SEGMENT_FLAECHEN_TERME,
  koerper_oberflaechen: SEGMENT_KOERPER_OBERFLAECHEN,
  aehnlichkeit: SEGMENT_AEHNLICHKEIT
};

/**
 * Hole Segment-Konfiguration für eine Unit
 */
export function getSegmentForUnit(unitId: string): SegmentConfig | null {
  const segment = Object.values(SEGMENTS).find(s => s.unitId === unitId);
  return segment || null;
}
