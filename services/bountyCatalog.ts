import { Task } from '../types';

type UnitId = 'u1' | 'u2' | 'u3' | 'u4' | 'u5' | 'u6';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u1: [
    {
      id: 'u1-bounty-classification',
      type: 'input',
      question:
        'Ein Viereck hat vier gleich lange Seiten und parallele Gegenseiten.\n a) Zu welcher Figurenklasse gehört es?\n b) Nenne eine Eigenschaft, die nicht zwingend gilt.',
      correctAnswer: 'Raute; rechte Winkel sind nicht garantiert',
      explanation:
        'Alle Seiten gleich lang → Raute. Rechte Winkel sind nicht vorgeschrieben, deshalb kann es schief sein.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'class',
          label: 'a) Figurenklasse',
          placeholder: 'z.B. Raute',
          validator: { type: 'keywords', keywordsAny: ['raute', 'rhombus'] },
        },
        {
          id: 'property',
          label: 'b) Nicht zwingende Eigenschaft',
          placeholder: 'z.B. rechte Winkel',
          validator: {
            type: 'keywords',
            keywordsAny: ['rechte winkel', 'rechten winkel', 'rechtwinklig', '90°', '90 grad'],
            requireNegation: true,
          },
        },
      ],
    },
    {
      id: 'u1-bounty-statement',
      type: 'input',
      question:
        'Die Aussage „Jedes Parallelogramm ist ein Rechteck“.\n a) Richtig oder falsch?\n b) Kurze Begründung.\n c) Formuliere die korrekte Aussage.',
      correctAnswer: 'Falsch; nicht alle haben rechte Winkel; Jedes Rechteck ist ein Parallelogramm',
      explanation:
        'Es fehlt die Bedingung „rechte Winkel“. Umgekehrt stimmt: Jedes Rechteck (und Quadrat) ist ein Parallelogramm.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'truth',
          label: 'a) Bewertung',
          placeholder: 'richtig / falsch',
          validator: { type: 'boolean', booleanExpected: 'false' },
        },
        {
          id: 'reason',
          label: 'b) Begründung',
          placeholder: 'Warum nicht?',
          validator: {
            type: 'keywords',
            keywordsAny: ['rechte winkel', 'rechten winkel', 'rechtwinklig'],
            requireNegation: true,
          },
        },
        {
          id: 'correction',
          label: 'c) Korrekte Aussage',
          placeholder: 'z.B. Jedes Rechteck ...',
          validator: {
            type: 'keywords',
            keywordsAny: [
              'jedes rechteck ist ein parallelogramm',
              'jedes quadrat ist ein parallelogramm',
              'jedes quadrat ist ein rechteck',
            ],
          },
        },
      ],
    },
    {
      id: 'u1-bounty-special-coordinates',
      type: 'input',
      question: 'Parallelogramm ABCD mit A(1|1), B(4|2), C(6|5). Bestimme D.',
      correctAnswer: 'D(3|4)',
      explanation: 'D = A + C − B → (1+6−4 | 1+5−2) = (3 | 4).',
      difficultyLevel: 'Schwer',
      validator: {
        type: 'coordinatePair',
        coordinateAnswer: { x: 3, y: 4 },
        coordinateTolerance: 0.01,
      },
    },
  ],
  u2: [
    {
      id: 'u2-bounty-angles',
      type: 'input',
      question:
        'Zwei parallele Geraden, geschnitten von einer Querlinie. Ein Winkel beträgt 38°.\n a) Nebenwinkel?\n b) Scheitelwinkel?\n c) Nenne einen Stufenwinkel.',
      correctAnswer: '142°, 38°, 38°/142°',
      explanation:
        'Nebenwinkel ergänzen zu 180° → 142°. Scheitelwinkel bleibt 38°. Stufenwinkel liegen an den parallelen Geraden → 38° (oder entsprechend 142°).',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'adjacent',
          label: 'a) Nebenwinkel (°)',
          validator: { type: 'numeric', numericAnswer: 142 },
        },
        {
          id: 'vertical',
          label: 'b) Scheitelwinkel (°)',
          validator: { type: 'numeric', numericAnswer: 38 },
        },
        {
          id: 'stufen',
          label: 'c) Stufenwinkel (°)',
          validator: { type: 'numeric', acceptedNumbers: [38, 142] },
        },
      ],
    },
    {
      id: 'u2-bounty-isosceles',
      type: 'input',
      question: 'In einem gleichschenkligen Dreieck beträgt der Scheitelwinkel 40°. Wie groß ist ein Basiswinkel?',
      correctAnswer: '70°',
      explanation: 'Die übrigen 140° werden gleich auf beide Basiswinkel verteilt → 70°.',
      difficultyLevel: 'Mittel',
      validator: { type: 'numeric', numericAnswer: 70 },
    },
    {
      id: 'u2-bounty-thales',
      type: 'input',
      question:
        'ΔABC liegt auf einem Kreis mit AB als Durchmesser. ∠CAB = 20°. Wie groß ist ∠CBA?',
      correctAnswer: '70°',
      explanation: 'Thales: ∠ACB = 90°. Somit 180° − 90° − 20° = 70°.',
      difficultyLevel: 'Schwer',
      validator: { type: 'numeric', numericAnswer: 70 },
    },
  ],
  u3: [
    {
      id: 'u3-bounty-garden',
      type: 'input',
      question:
        'Rechteckiger Garten: Länge = x + 5, Breite = x, Fläche = 300 m².\n a) Stelle die Gleichung auf.\n b) Bestimme x (positive Lösung).',
      correctAnswer: 'x(x+5)=300; x=15',
      explanation: 'Gleichung: x(x+5)=300. Positive Lösung: x=15 m.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'equation',
          label: 'a) Gleichung',
          placeholder: 'z.B. x(x+5)=300',
          validator: {
            type: 'equation',
            equationPatterns: ['x(x+5)=300', 'x^2+5x-300=0'],
          },
        },
        {
          id: 'solution',
          label: 'b) x = ?',
          validator: { type: 'numeric', numericAnswer: 15 },
        },
      ],
    },
    {
      id: 'u3-bounty-frame',
      type: 'choice',
      question:
        'Bild 30×40 cm, Rahmenbreite x rundherum. Welcher Term beschreibt die Rahmenfläche?',
      options: [
        'A) 4x² + 140x',
        'B) 140x',
        'C) 1200 + 140x',
        'D) 1200 + 4x² + 140x',
      ],
      correctAnswer: 0,
      explanation: 'Rahmenfläche = äußere Fläche minus 1200 = 4x² + 140x.',
      difficultyLevel: 'Mittel',
    },
    {
      id: 'u3-bounty-special-area',
      type: 'input',
      question:
        'Rechteck: Breite x, Länge x+10. Rechtwinkliges Dreieck: Grundseite x+2, Höhe x+10. Finde x, sodass die Flächen gleich sind.',
      correctAnswer: 'x = 2',
      explanation: 'x(x+10) = ½(x+2)(x+10) → x = 2 (positive Lösung).',
      difficultyLevel: 'Schwer',
      validator: { type: 'numeric', numericAnswer: 2 },
    },
  ],
  u4: [
    {
      id: 'u4-bounty-cylinder-volume',
      type: 'input',
      question: 'Zylinder mit r = 1,0 m und h = 2,0 m. Wie viele Liter fasst er? (π≈3,14)',
      correctAnswer: '≈6280 L',
      explanation: 'V = πr²h = 3,14 × 1² × 2 ≈ 6,28 m³ → 6280 L.',
      difficultyLevel: 'Mittel',
      validator: { type: 'numericTolerance', numericAnswer: 6280, tolerance: 10 },
    },
    {
      id: 'u4-bounty-scaling',
      type: 'choice',
      question:
        'Würfelkante wird verdoppelt (a → 2a). Wie verändern sich Volumen und Oberfläche?',
      options: ['A) V×2; O×2', 'B) V×4; O×4', 'C) V×8; O×4', 'D) V×8; O×8'],
      correctAnswer: 2,
      explanation: 'Volumen ∝ k³ → 8x, Oberfläche ∝ k² → 4x.',
      difficultyLevel: 'Mittel',
    },
    {
      id: 'u4-bounty-special-surface',
      type: 'input',
      question:
        'Quader 10×8×6 cm, oben mittig Loch 4×3 cm, 2 cm tief (Boden bleibt). Berechne die neue Oberfläche.',
      correctAnswer: '404 cm²',
      explanation:
        'Ausgangs-O = 376 cm². Lochwände + Boden → +28 cm². Gesamt 404 cm².',
      difficultyLevel: 'Schwer',
      validator: { type: 'numeric', numericAnswer: 404 },
    },
  ],
  u5: [
    {
      id: 'u5-bounty-similar-sides',
      type: 'input',
      question:
        'Ähnliche Dreiecke: AB=6, AC=9. DE entspricht AB und ist 4. Berechne DF (entspricht AC).',
      correctAnswer: '6 cm',
      explanation: 'Skalierungsfaktor 4/6. DF = 9 × (4/6) = 6 cm.',
      difficultyLevel: 'Mittel',
      validator: { type: 'numeric', numericAnswer: 6 },
    },
    {
      id: 'u5-bounty-scale',
      type: 'input',
      question: 'Maßstab 1:50.000. 7,0 cm auf der Karte entsprechen wie vielen km?',
      correctAnswer: '3,5 km',
      explanation: '7 cm × 50.000 = 350.000 cm = 3,5 km.',
      difficultyLevel: 'Mittel',
      validator: { type: 'numericTolerance', numericAnswer: 3.5, tolerance: 0.05 },
    },
    {
      id: 'u5-bounty-special-mirror',
      type: 'input',
      question:
        '1,60 m Person, Spiegel auf dem Boden. Abstand Person–Spiegel 2 m, Baum–Spiegel 8 m. Wie hoch ist der Baum?',
      correctAnswer: '6,4 m',
      explanation: 'Strahlensatz: 1,6 / 2 = h / 8 → h = 6,4 m.',
      difficultyLevel: 'Schwer',
      validator: { type: 'numericTolerance', numericAnswer: 6.4, tolerance: 0.1 },
    },
  ],
  u6: [
    {
      id: 'u6-bounty-distance',
      type: 'input',
      question:
        'S(2|3) = Schule, B(8|12) = Schwimmbad. 1 Einheit = 1 km. Berechne die Luftlinie (auf 0,1 km).',
      correctAnswer: '≈10,8 km',
      explanation: 'd = √((8−2)² + (12−3)²) = √117 ≈ 10,8 km.',
      difficultyLevel: 'Mittel',
      validator: { type: 'numericTolerance', numericAnswer: 10.8, tolerance: 0.1 },
    },
    {
      id: 'u6-bounty-ladder',
      type: 'choice',
      question:
        'Leiter 5,0 m lang, Abstand zur Wand 3,0 m. In welcher Höhe liegt sie an?',
      options: ['A) 5,8 m', 'B) 4,0 m', 'C) 2,0 m', 'D) 8,0 m'],
      correctAnswer: 1,
      explanation: 'Pythagoras: √(5² − 3²) = 4 m.',
      difficultyLevel: 'Mittel',
    },
    {
      id: 'u6-bounty-special-roof',
      type: 'input',
      question:
        'Satteldach: Hausbreite 8 m, First 3 m über Traufe, Länge 10 m. Berechne die gesamte Dachfläche (beide Seiten).',
      correctAnswer: '100 m²',
      explanation:
        'Halbe Breite 4 m, Höhe 3 m ⇒ Dachseite hat Länge 5 m. 5 × 10 × 2 = 100 m².',
      difficultyLevel: 'Schwer',
      validator: { type: 'numeric', numericAnswer: 100 },
    },
  ],
};

function cloneTask(task: Task): Task {
  return {
    ...task,
    options: task.options ? [...task.options] : undefined,
    multiInputFields: task.multiInputFields
      ? task.multiInputFields.map(field => ({
          ...field,
          validator: {
            ...field.validator,
            keywordsAny: field.validator.keywordsAny
              ? [...field.validator.keywordsAny]
              : undefined,
            keywordsAll: field.validator.keywordsAll
              ? [...field.validator.keywordsAll]
              : undefined,
            acceptedNumbers: field.validator.acceptedNumbers
              ? [...field.validator.acceptedNumbers]
              : undefined,
            equationPatterns: field.validator.equationPatterns
              ? [...field.validator.equationPatterns]
              : undefined,
            coordinateAnswer: field.validator.coordinateAnswer
              ? { ...field.validator.coordinateAnswer }
              : undefined,
          },
        }))
      : undefined,
    validator: task.validator
      ? {
          ...task.validator,
          keywordsAny: task.validator.keywordsAny ? [...task.validator.keywordsAny] : undefined,
          keywordsAll: task.validator.keywordsAll ? [...task.validator.keywordsAll] : undefined,
          acceptedNumbers: task.validator.acceptedNumbers
            ? [...task.validator.acceptedNumbers]
            : undefined,
          equationPatterns: task.validator.equationPatterns
            ? [...task.validator.equationPatterns]
            : undefined,
          coordinateAnswer: task.validator.coordinateAnswer
            ? { ...task.validator.coordinateAnswer }
            : undefined,
        }
      : undefined,
  };
}

export function getBountyTasks(unitId: string): Task[] {
  if (!BASE_BOUNTIES[unitId as UnitId]) {
    return [];
  }
  return BASE_BOUNTIES[unitId as UnitId].map(cloneTask);
}

