import { Task } from '../types';
import {
  TRIGONOMETRIE_BOUNTIES,
  PYTHAGORAS_BOUNTIES,
  KOERPER_BOUNTIES,
  STRAHLENSATZ_BOUNTIES,
  KONGRUENZ_BOUNTIES,
  VIELEcke_BOUNTIES,
  DREID_BOUNTIES,
} from './geometrieMundoBounties';
import {
  BEWEIS_BOUNTIES,
  HERON_BOUNTIES,
  SCIENCE_BOUNTIES,
} from './potenzenBounties';
import { QUADRATISCH_BOUNTIES } from './quadratischBounties';

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
    {
      id: 'u1-bounty-regalbrett',
      type: 'input',
      question:
        'Verzogenes Regalbrett (Viereck):\n a) Figurenklasse?\n b) Eine zwingende Eigenschaft nennen.\n c) Eine nicht zwingende Eigenschaft nennen.',
      correctAnswer: 'Raute; vier gleich lange Seiten; keine rechten Winkel nötig',
      explanation:
        'Vier gleich lange Seiten + parallele Gegenseiten → Raute. Rechte Winkel sind nicht vorgeschrieben.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        {
          id: 'class',
          label: 'a) Figurenklasse',
          options: ['Raute', 'Rhombus', 'Rechteck', 'Quadrat', 'Parallelogramm'],
          validator: { type: 'keywords', keywordsAny: ['raute', 'rhombus'] },
        },
        {
          id: 'must',
          label: 'b) Zwingende Eigenschaft',
          placeholder: 'z.B. vier gleich lange Seiten',
          options: ['vier gleich lange seiten', 'gegenseiten parallel'],
          validator: { type: 'keywords', keywordsAny: ['gleich lange seiten', 'gegenseiten parallel'] },
        },
        {
          id: 'notRequired',
          label: 'c) Nicht zwingende Eigenschaft',
          placeholder: 'z.B. keine rechten Winkel nötig',
          options: ['keine rechten winkel', 'nicht rechtwinklig'],
          validator: { type: 'keywords', keywordsAny: ['rechte winkel', 'rechtwinklig'], requireNegation: true },
        },
      ],
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
    {
      id: 'u2-bounty-querlinie-klartext',
      type: 'input',
      question:
        'Parallele Schienen, Querbrücke schneidet sie. Gegeben: Innenwinkel = 52°.\n a) Nebenwinkel?\n b) Stufenwinkel?\n c) Wechselwinkel?',
      correctAnswer: '128°; 52°; 52°',
      explanation:
        'Nebenwinkel ergänzen zu 180° → 128°. Stufen- und Wechselwinkel entsprechen 52° (wegen Parallelität).',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        { id: 'adjacent', label: 'a) Nebenwinkel (°)', validator: { type: 'numeric', numericAnswer: 128 } },
        { id: 'corresponding', label: 'b) Stufenwinkel (°)', validator: { type: 'numeric', numericAnswer: 52 } },
        { id: 'alternate', label: 'c) Wechselwinkel (°)', validator: { type: 'numeric', numericAnswer: 52 } },
      ],
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
    {
      id: 'u3-bounty-gartenbeet-text',
      type: 'input',
      question:
        'Gartenbeet als Rechteck: Länge = x + 3 m, Breite = x − 1 m, Fläche = 120 m².\n a) Stelle die Flächengleichung auf.\n b) Positive Lösung für x (auf 0,1 runden).\n c) Rahmenfläche, wenn ringsum 0,5 m angefügt wird (auf 0,1 m² runden).',
      correctAnswer: '(x+3)(x-1)=120; x≈10,16; Rahmen≈23,8',
      explanation:
        '(x+3)(x−1)=120 → x≈10,16 m. Neue Außenfläche: (x+4)·x. Rahmenfläche = (x+4)·x − 120 ≈ 23,8 m².',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        {
          id: 'equation',
          label: 'a) Gleichung',
          validator: { type: 'equation', equationPatterns: ['(x+3)(x-1)=120', 'x^2+2x-123=0'] },
        },
        {
          id: 'solution',
          label: 'b) x (m)',
          validator: { type: 'numericTolerance', numericAnswer: 10.158, tolerance: 0.05 },
        },
        {
          id: 'frame',
          label: 'c) Rahmenfläche (m²)',
          validator: { type: 'numericTolerance', numericAnswer: 23.82, tolerance: 0.2 },
        },
      ],
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
    {
      id: 'u4-bounty-quader-zylinder',
      type: 'input',
      question:
        'Quader 12×8×5 cm, darauf mittig ein Zylinder r=3 cm, h=5 cm. Kontaktfläche zählt nicht zur Außenfläche.\n a) Gesamtvolumen?\n b) Außen sichtbare Oberfläche (cm²)?',
      correctAnswer: '≈621,3 cm³; ≈486,2 cm²',
      explanation:
        'Volumen: Quader 480 + Zylinder π·3²·5 ≈ 141,3 → ≈621,3 cm³. Oberfläche: Quader 392 − Kreis 28,3 + Zylinder-Mantel 94,2 + Kreis oben 28,3 ≈ 486,2 cm².',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        {
          id: 'volume',
          label: 'a) Volumen (cm³)',
          validator: { type: 'numericTolerance', numericAnswer: 621.3, tolerance: 0.5 },
        },
        {
          id: 'surface',
          label: 'b) Oberfläche (cm²)',
          validator: { type: 'numericTolerance', numericAnswer: 486.2, tolerance: 1 },
        },
      ],
    },
    {
      id: 'u4-bounty-composite-prism',
      type: 'input',
      question:
        'Zusammengesetztes Prisma: Quader (6×6×10 cm) + Dreiecksprisma (Grundfläche: rechtwinkliges Dreieck mit Katheten 6 cm und 4 cm, Höhe 8 cm).\n a) Gesamtvolumen?\n b) Oberfläche des zusammengesetzten Körpers (Kontaktfläche zählt nicht, auf ganze Zahl runden)?',
      correctAnswer: '456 cm³; 472 cm²',
      explanation:
        'a) V = 6·6·10 + (6·4/2)·8 = 360 + 96 = 456 cm³. b) O = Quader 312 + Dreiecksprisma 160 ≈ 472 cm² (vereinfacht).',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        { id: 'volume', label: 'a) Volumen (cm³)', validator: { type: 'numeric', numericAnswer: 456 } },
        { id: 'surface', label: 'b) Oberfläche (cm²)', validator: { type: 'numericTolerance', numericAnswer: 472, tolerance: 5 } },
      ],
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
    {
      id: 'u5-bounty-poster-skalierung',
      type: 'input',
      question:
        'Foto 30×20 cm wird zu einem Poster vergrößert: längere Seite soll 90 cm sein.\n a) Skalierungsfaktor k?\n b) Neue kürzere Seite (cm)?\n c) Flächenfaktor?',
      correctAnswer: 'k=3; 60 cm; 9',
      explanation:
        'Längere Seite 20 → 90: k = 90/30 = 3. Neue kürzere Seite: 20 · 3 = 60 cm. Fläche skaliert mit k² → 9.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        { id: 'k', label: 'a) k', validator: { type: 'numericTolerance', numericAnswer: 3, tolerance: 0.01 } },
        { id: 'short', label: 'b) kürzere Seite (cm)', validator: { type: 'numeric', numericAnswer: 60 } },
        { id: 'area', label: 'c) Flächenfaktor', validator: { type: 'numeric', numericAnswer: 9 } },
      ],
    },
    {
      id: 'u5-bounty-zentrische-streckung',
      type: 'input',
      question:
        'Zentrische Streckung: Streckfaktor k = 2,5, Streckzentrum Z. Ursprüngliche Länge: 8 cm.\n a) Neue Länge?\n b) Um welchen Faktor ändert sich die Fläche?',
      correctAnswer: '20 cm; 6,25',
      explanation:
        'a) Neue Länge = 8 · 2,5 = 20 cm. b) Flächenfaktor = k² = 2,5² = 6,25.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        { id: 'length', label: 'a) Neue Länge (cm)', validator: { type: 'numeric', numericAnswer: 20 } },
        { id: 'area', label: 'b) Flächenfaktor', validator: { type: 'numericTolerance', numericAnswer: 6.25, tolerance: 0.01 } },
      ],
    },
    {
      id: 'u5-bounty-strahlensatz-umkehrung',
      type: 'input',
      question:
        'Umkehrung des Strahlensatzes: Zwei parallele Geraden schneiden zwei Strahlen. Abschnitt 1: 16 cm / 24 cm. Abschnitt 2 auf Strahl 1: 20 cm. Berechne Abschnitt 2 auf Strahl 2.',
      correctAnswer: '30 cm',
      explanation: 'Verhältnisgleichung: 16/24 = 20/s₂ → s₂ = (20·24)/16 = 30 cm',
      difficultyLevel: 'Schwer',
      validator: { type: 'numeric', numericAnswer: 30 },
    },
    {
      id: 'u5-bounty-aehnlichkeitssaetze',
      type: 'choice',
      question:
        'Zwei Dreiecke haben zwei Seitenpaare im Verhältnis 2:3 und den eingeschlossenen Winkel gleich (60°). Welcher Ähnlichkeitssatz gilt?',
      options: ['SSS-Satz', 'SWS-Satz', 'WW-Satz', 'SSW-Satz'],
      correctAnswer: 1,
      explanation:
        'SWS-Satz: Zwei Seiten im gleichen Verhältnis (2:3) + eingeschlossener Winkel gleich (60°) → Dreiecke sind ähnlich.',
      difficultyLevel: 'Mittel',
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
    {
      id: 'u6-bounty-koordinaten-steigung',
      type: 'input',
      question:
        'Drohne fliegt von L(-2|1) zu K(7|9). 1 Einheit = 100 m.\n a) Luftlinie in km (auf 0,1 runden)\n b) Steigung m = Δy/Δx (1 Nachkommastelle)',
      correctAnswer: '1,2 km; 0,9',
      explanation:
        'Δx = 9, Δy = 8 → Distanz = √(9²+8²)=√145≈12,0 Einheiten = 1,2 km. Steigung = 8/9 ≈ 0,9.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        { id: 'distance', label: 'a) Kilometer', validator: { type: 'numericTolerance', numericAnswer: 1.2, tolerance: 0.1 } },
        { id: 'slope', label: 'b) Steigung', validator: { type: 'numericTolerance', numericAnswer: 0.9, tolerance: 0.1 } },
      ],
    },
    {
      id: 'u3-bounty-kreissektor',
      type: 'input',
      question:
        'Tortenstück (Kreissektor): Radius r = 8 cm, Mittelpunktswinkel α = 90°.\n a) Flächeninhalt des Kreissektors?\n b) Länge des zugehörigen Kreisbogens?',
      correctAnswer: '≈50,24 cm²; ≈12,56 cm',
      explanation:
        'a) A = (π · r² · α) / 360° = (3,14 · 64 · 90) / 360 ≈ 50,24 cm². b) b = (2π · r · α) / 360° = (2 · 3,14 · 8 · 90) / 360 ≈ 12,56 cm.',
      difficultyLevel: 'Mittel',
      multiInputFields: [
        { id: 'area', label: 'a) Flächeninhalt (cm²)', validator: { type: 'numericTolerance', numericAnswer: 50.24, tolerance: 0.5 } },
        { id: 'arc', label: 'b) Kreisbogen (cm)', validator: { type: 'numericTolerance', numericAnswer: 12.56, tolerance: 0.2 } },
      ],
    },
    {
      id: 'u6-bounty-hoehensatz',
      type: 'input',
      question:
        'Höhensatz: Rechtwinkliges Dreieck, Höhe h auf Hypotenuse. Hypotenusenabschnitte: p = 4 cm, q = 9 cm.\n a) Höhe h (cm)?\n b) Kathete a, die zu p gehört (cm, auf 0,1 runden)?',
      correctAnswer: '6 cm; ≈7,2 cm',
      explanation:
        'a) h² = p · q = 4 · 9 = 36 → h = 6 cm. b) Kathetensatz: a² = p · c = 4 · 13 = 52 → a ≈ 7,2 cm.',
      difficultyLevel: 'Schwer',
      multiInputFields: [
        { id: 'height', label: 'a) Höhe (cm)', validator: { type: 'numeric', numericAnswer: 6 } },
        { id: 'cathetus', label: 'b) Kathete a (cm)', validator: { type: 'numericTolerance', numericAnswer: 7.21, tolerance: 0.2 } },
      ],
    },
  ],
};

// Neue MUNDO-Bounty-Aufgaben hinzufügen
const MUNDO_BOUNTIES: Record<UnitId, Task[]> = {
  u2: [
    ...TRIGONOMETRIE_BOUNTIES.filter(t => t.id.startsWith('u2-')),
    ...KONGRUENZ_BOUNTIES,
  ],
  u3: [...VIELEcke_BOUNTIES],
  u4: [...KOERPER_BOUNTIES, ...DREID_BOUNTIES],
  u5: [...STRAHLENSATZ_BOUNTIES],
  u6: [
    ...PYTHAGORAS_BOUNTIES,
    ...TRIGONOMETRIE_BOUNTIES.filter(t => t.id.startsWith('u6-')),
  ],
  u1: [], // Keine neuen Bounties für u1
};

// Kombiniere bestehende und neue Bounties
const COMBINED_BOUNTIES: Record<UnitId, Task[]> = {
  u1: BASE_BOUNTIES.u1,
  u2: [...BASE_BOUNTIES.u2, ...MUNDO_BOUNTIES.u2],
  u3: [...BASE_BOUNTIES.u3, ...MUNDO_BOUNTIES.u3],
  u4: [...BASE_BOUNTIES.u4, ...MUNDO_BOUNTIES.u4],
  u5: [...BASE_BOUNTIES.u5, ...MUNDO_BOUNTIES.u5],
  u6: [...BASE_BOUNTIES.u6, ...MUNDO_BOUNTIES.u6],
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
  // Potenzen-Bounties (separate Unit-IDs)
  if (unitId === 'u_potenzen_bounty_proof') {
    return BEWEIS_BOUNTIES;
  }
  if (unitId === 'u_potenzen_bounty_heron') {
    return [...HERON_BOUNTIES, ...SCIENCE_BOUNTIES.slice(0, 1)]; // 3 Tasks: √7, √13, + 1 Science
  }
  if (unitId === 'u_potenzen_bounty_science') {
    return SCIENCE_BOUNTIES;
  }

  // Quadratische Funktionen-Bounties
  if (unitId === 'u_quadratisch_07') {
    return QUADRATISCH_BOUNTIES;
  }

  // Geometrie-Bounties (bestehende Units)
  const bounties = COMBINED_BOUNTIES[unitId as UnitId] || BASE_BOUNTIES[unitId as UnitId];
  if (!bounties) {
    return [];
  }
  return bounties.map(cloneTask);
}

