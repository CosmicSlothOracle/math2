
import { Task } from '../types';
import { getBountyTasks } from './bountyCatalog';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fisher-Yates Shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const TaskFactory = {
  // === NEUE API (für Kompatibilität mit neuem Hauptprojekt) ===
  getTasksForUnit(unitId: string, type: 'pre' | 'standard' | 'bounty'): Task[] {
    const seed = Date.now();
    switch (type) {
      case 'pre':
        // PreTasks aus segments.ts kommen später, erstmal leer
        return [];
      case 'standard':
        // Standard-Aufgaben aus dem Task-Pool
        return this.generateTasks(unitId, 5);
      case 'bounty':
        const bountyTasks = getBountyTasks(unitId);
        return bountyTasks.length > 0 ? bountyTasks : [this.generateBountyTask(unitId)];
      default:
        return [];
    }
  },

  // === ALTE API (behält alle vorhandenen Aufgaben) ===
  generateTasks(unitId: string, count: number = 5): Task[] {
    const pool = this.getTaskPool(unitId);
    // Shuffle and take first 'count' items to ensure no duplicates in one run
    const shuffled = shuffleArray<Task>(pool);
    return shuffled.slice(0, count);
  },

  // Generates the "Final Boss" task for the Bounty
  // NOTE: Diese Funktion wird nicht mehr verwendet, da Bounty-Aufgaben
  // jetzt aus Segment-Konfigurationen kommen (src/config/segments.ts)
  generateBountyTask(unitId: string): Task {
    const seed = 0; // Deterministischer Seed
    return this.createBountyTask(unitId, seed);
  },

  getTaskPool(unitId: string): Task[] {
    // Verwende festen Seed (0) für deterministische IDs
    // Die Eindeutigkeit wird durch den Index und die Frage-Inhalte sichergestellt
    // Coin-Tracking verwendet content-basierte Keys, daher ist die Task-ID weniger kritisch
    const seed = 0;

    switch (unitId) {
      case 'u1': return [
        this.createWagerTask(1, seed),
        this.createVisualShapeTask(0, seed),
        this.createShapeTask(0, seed), // Rechteck vs Quadrat
        this.createShapeTask(1, seed), // Schiefes Regal (Ex-Pizza)
        this.createShapeTask(2, seed), // Smartphone
        this.createVisualShapeTask(1, seed), // Alternative Visuals
        this.createVisualShapeTask(2, seed),
        this.createDragDropTask(0, seed) // Drag-and-Drop Klassifikation
      ];
      case 'u2': return [
        this.createMultiAngleThrowTask(0, seed), // Neues Multi-Angle-Training - FIRST FOR TESTING
        this.createVisualAngleTask(0, seed),
        this.createAngleTask(0, seed),
        this.createAngleTask(1, seed),
        this.createAngleTask(2, seed),
        this.createVisualAngleTask(1, seed),
        this.createVisualAngleTask(2, seed),
        this.createAngleMeasurementTask(0, seed), // Animierte Winkel-Messung
        this.createParallelLinesTask(0, seed), // Parallel lines + transversal
        this.createThalesTask(0, seed) // Thales theorem
      ];
      case 'u3': return [
        this.createAreaTask(0, seed),
        this.createAreaTask(1, seed),
        this.createAreaTask(2, seed),
        this.createAreaTask(3, seed), // Extra variation
        this.createAreaTask(4, seed),
        this.createAreaDecompositionTask(0, seed), // Interaktive Flächen-Zerlegung
        this.createCircleTask(0, seed), // Circle circumference/area
        this.createAlgebraGeometryTask(0, seed) // Algebra-geometry terms
      ];
      case 'u4': return [
        this.createVolumeTask(0, seed),
        this.createVolumeTask(1, seed),
        this.createVolumeTask(2, seed),
        this.createVolumeTask(3, seed),
        this.createVolumeTask(4, seed),
        this.createNetTask(0, seed), // Nets
        this.createCylinderTask(0, seed), // Cylinder surface/volume
        this.createCompositeBodyTask(0, seed) // Composite bodies
      ];
      case 'u5': return [
        this.createVisualSimilarityTask(0, seed),
        this.createVisualSimilarityTask(1, seed),
        this.createScalingLogicTask(0, seed),
        this.createScalingLogicTask(1, seed),
        this.createScalingLogicTask(2, seed),
        this.createScalingLogicTask(3, seed),
        this.createTransformTask(0, seed),
        this.createSliderTransformationTask(0, seed), // Vergleichsansicht mit Slider
        this.createSimilarityTask(0, seed), // Similar triangles
        this.createStrahlensatzTask(0, seed) // Strahlensatz
      ];
      case 'u6': return [
        this.createContextTask(0, seed),
        this.createContextTask(1, seed),
        this.createContextTask(2, seed),
        this.createContextTask(3, seed),
        this.createContextTask(4, seed)
      ];
      default: return [];
    }
  },

  // --- BOUNTY TASKS (Classical Math Problems) ---
  createBountyTask(unitId: string, seed: number): Task {
    const id = `bounty-${unitId}-${seed}`;

    switch (unitId) {
      case 'u1': // Haus der Vierecke
        return {
          id, type: 'choice',
          question: "BOUNTY FRAGE: Welche Aussage ist mathematisch präzise?",
          options: [
            "Jedes Rechteck ist ein Quadrat.",
            "Ein Drachenviereck hat immer 4 rechte Winkel.",
            "Jedes Quadrat ist eine Raute und ein Rechteck zugleich.",
            "Ein Trapez hat niemals rechte Winkel."
          ],
          correctAnswer: 2,
          explanation: "Das Quadrat ist die 'perfekte' Form: Es erfüllt die Definition der Raute (4 gleiche Seiten) UND des Rechtecks (4 rechte Winkel)."
        };

      case 'u2': // Winkel & Thales
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: In einem rechtwinkligen Dreieck ist Winkel Alpha = 35°. Wie groß ist Winkel Beta, wenn Gamma der rechte Winkel (90°) ist?",
          correctAnswer: "55",
          placeholder: "Grad",
          explanation: "Winkelsumme im Dreieck ist 180°. 180° - 90° - 35° = 55°."
        };

      case 'u3': // Flächen
        const a = getRandomInt(5, 9);
        return {
          id, type: 'input',
          question: `BOUNTY FRAGE: Ein Rechteck hat den Flächeninhalt A = ${a*8} cm². Die Seite a ist ${a} cm lang. Wie lang ist Seite b?`,
          correctAnswer: "8",
          placeholder: "cm",
          explanation: "Formel A = a * b. Umgestellt nach b: b = A / a."
        };

      case 'u4': // Volumen
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: Ein Würfel hat eine Kantenlänge von 4 cm. Berechne das Volumen.",
          correctAnswer: "64",
          placeholder: "cm³",
          explanation: "V = a * a * a = 4 * 4 * 4 = 64."
        };

      case 'u5': // Ähnlichkeit / Maßstab (Classical Ratio)
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: Eine Landkarte hat den Maßstab 1:25.000. Du misst eine Strecke von 4 cm auf der Karte. Wie viele KILOMETER sind das in der Realität?",
          correctAnswer: "1",
          placeholder: "km",
          explanation: "4 cm * 25.000 = 100.000 cm. 100.000 cm = 1.000 m = 1 km."
        };

      case 'u6': // Context / Pythagoras
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: Ein rechtwinkliges Dreieck hat die Katheten a=6cm und b=8cm. Berechne die Hypotenuse c.",
          correctAnswer: "10",
          placeholder: "cm",
          explanation: "Satz des Pythagoras: a² + b² = c². 36 + 64 = 100. Wurzel aus 100 ist 10."
        };

      default:
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: 2x + 5 = 15. Bestimme x.",
          correctAnswer: "5",
          placeholder: "x =",
          explanation: "2x = 10, also x = 5."
        };
    }
  },

  // --- NEW: WAGER TASK ---
  createWagerTask(index: number, seed: number): Task {
    return {
      id: `u1-wager-${seed}`,
      type: 'wager',
      question: "Wette darauf: 'Jedes Quadrat ist automatisch auch ein Rechteck.'",
      options: ["Stimmt", "Stimmt nicht"],
      wagerOptions: [10, 20, 50],
      correctAnswer: 0, // Stimmt
      explanation: "Ein Quadrat hat 4 rechte Winkel und gegenüberliegende Seiten sind parallel. Damit erfüllt es ALLE Bedingungen eines Rechtecks (und ist sogar noch spezieller)."
    };
  },

  createVisualShapeTask(index: number, seed: number): Task {
    const id = `u1-vis-${index}-${seed}`;
    const types = [
      {
        q: "Welche geometrische Form hat eine klassische Schallplatte?",
        ans: 'circle',
        expl: 'Eine Schallplatte ist ein perfekter Kreis.',
        data: [
            {
              id: 'rect',
              label: 'Rechteck',
              path: 'M 20,20 H 180 V 130 H 20 Z',
              shapeType: 'rectangle',
              context: 'none'
            },
            {
              id: 'circle',
              label: 'Kreis',
              path: 'M 100,75 A 50,50 0 1,0 100,76 Z',
              shapeType: 'circle',
              context: 'record'
            },
            {
              id: 'tri',
              label: 'Dreieck',
              path: 'M 20,130 L 180,130 L 100,20 Z',
              shapeType: 'triangle',
              context: 'none'
            }
        ]
      },
      {
        q: "Die markierte Wandfläche für das Graffiti. Welche Form soll hier gefüllt werden?",
        ans: 'rect',
        expl: 'Die Fläche hat vier rechte Winkel. Es ist ein Rechteck.',
        data: [
            {
              id: 'tri',
              label: 'Rampe',
              path: 'M 20,130 L 180,130 L 180,20 Z',
              shapeType: 'triangle',
              context: 'skateboard'
            },
            {
              id: 'rect',
              label: 'Wand',
              path: 'M 40,40 H 160 V 110 H 40 Z',
              shapeType: 'rectangle',
              context: 'graffiti',
              showAngles: true
            },
            {
              id: 'para',
              label: 'Parallelogramm',
              path: 'M 40,130 L 160,130 L 190,20 L 70,20 Z',
              shapeType: 'parallelogram',
              context: 'none'
            }
        ]
      },
      {
        q: "Die Seitenansicht einer Skater-Rampe (Bank). Welche Form erkennst du?",
        ans: 'tri',
        expl: 'Von der Seite betrachtet bildet die Rampe ein Dreieck.',
        data: [
            {
              id: 'circle',
              label: 'Rad',
              path: 'M 100,75 A 50,50 0 1,0 100,76 Z',
              shapeType: 'circle',
              context: 'none'
            },
            {
              id: 'rect',
              label: 'Box',
              path: 'M 40,40 H 160 V 110 H 40 Z',
              shapeType: 'rectangle',
              context: 'none'
            },
            {
              id: 'tri',
              label: 'Rampe',
              path: 'M 20,130 L 180,130 L 180,20 Z',
              shapeType: 'triangle',
              context: 'skateboard'
            }
        ]
      },
      {
        q: "Welche Form hat eine typische Tür (von vorne betrachtet)?",
        ans: 'rect',
        expl: 'Türen sind Rechtecke mit vier rechten Winkeln.',
        data: [
            {
              id: 'square',
              label: 'Quadrat',
              path: 'M 50,30 H 150 V 120 H 50 Z',
              shapeType: 'square',
              context: 'none',
              showAngles: true
            },
            {
              id: 'rect',
              label: 'Rechteck',
              path: 'M 30,20 H 170 V 130 H 30 Z',
              shapeType: 'rectangle',
              context: 'door',
              showAngles: true
            },
            {
              id: 'rhombus',
              label: 'Raute',
              path: 'M 100,90 L 150,50 L 100,10 L 50,50 Z',
              shapeType: 'rhombus',
              context: 'none'
            }
        ]
      }
    ];
    const selected = types[index % types.length];

    return {
      id,
      type: 'visualChoice',
      question: selected.q,
      visualData: selected.data,
      correctAnswer: selected.ans,
      explanation: selected.expl
    };
  },

  createVisualAngleTask(index: number, seed: number): Task {
    const id = `u2-vis-${index}-${seed}`;
    const tasks = [
      {
        q: "Eine Flasche wird geworfen. Welcher Abwurfwinkel wäre 'stumpf' (>90°)?",
        data: [
          {
            id: 'a',
            label: 'Spitz (<90°)',
            path: 'M 20,130 L 100,130 L 60,40',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 45
          },
          {
            id: 'b',
            label: 'Recht (90°)',
            path: 'M 100,130 L 180,130 L 180,50',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 90
          },
          {
            id: 'c',
            label: 'Stumpf (>90°)',
            path: 'M 20,130 L 100,130 L 20,50',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 135
          }
        ],
        ans: 'c',
        expl: 'Ein stumpfer Winkel ist weiter geöffnet als ein rechter Winkel (größer als 90 Grad).'
      },
      {
        q: "Du lehnst an einer Wand. Welcher Winkel zeigt die richtige Neigung (spitz)?",
        data: [
          {
            id: 'a',
            label: 'Spitz',
            path: 'M 20,130 L 100,130 L 80,60',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 60
          },
          {
            id: 'b',
            label: 'Recht',
            path: 'M 20,130 L 100,130 L 100,50',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 90
          },
          {
            id: 'c',
            label: 'Stumpf',
            path: 'M 20,130 L 100,130 L 20,50',
            shapeType: 'triangle',
            context: 'none',
            angleValue: 120
          }
        ],
        ans: 'a',
        expl: 'Ein spitzer Winkel ist kleiner als 90 Grad - perfekt zum Anlehnen!'
      }
    ];
    const selected = tasks[index % tasks.length];

    return {
      id,
      type: 'visualChoice',
      question: selected.q,
      visualData: selected.data,
      correctAnswer: selected.ans,
      explanation: selected.expl
    };
  },

  createVisualSimilarityTask(index: number, seed: number): Task {
    const id = `u5-vis-${index}-${seed}`;
    if (index % 2 === 0) {
      return {
        id,
        type: 'visualChoice',
        question: "Welches Dreieck ist eine echte Vergrößerung (ähnlich) zum Referenz-Dreieck?",
        // Ref: Base 40, Height 40. Scaled: Base 80, Height 80. Wrong: Base 80, Height 40 (stretched)
        visualData: [
          {
            id: 'ref',
            label: 'Referenz',
            path: 'M 20,80 L 60,80 L 20,40 Z',
            shapeType: 'triangle',
            context: 'none'
          },
          {
            id: 'wrong',
            label: 'A',
            path: 'M 80,80 L 160,80 L 80,40 Z',
            shapeType: 'triangle',
            context: 'none'
          }, // Only stretched X
          {
            id: 'correct',
            label: 'B',
            path: 'M 80,140 L 160,140 L 80,60 Z',
            shapeType: 'triangle',
            context: 'none'
          } // Scaled X and Y
        ],
        correctAnswer: 'correct',
        explanation: 'Bei Ähnlichkeit müssen ALLE Seiten mit dem gleichen Faktor k gestreckt werden. Figur A wurde nur breiter gemacht, Figur B ist proportional vergrößert.'
      };
    } else {
      return {
        id,
        type: 'visualChoice',
        question: "Das Quadrat wurde mit Faktor k=0.5 verkleinert. Welches Bild stimmt?",
        visualData: [
          {
            id: 'ref',
            label: 'Start',
            path: 'M 20,20 H 100 V 100 H 20 Z',
            shapeType: 'square',
            context: 'none',
            showAngles: true
          },
          {
            id: 'correct',
            label: 'A',
            path: 'M 120,60 H 160 V 100 H 120 Z',
            shapeType: 'square',
            context: 'none',
            showAngles: true
          }, // Half size
          {
            id: 'wrong',
            label: 'B',
            path: 'M 120,20 H 140 V 100 H 120 Z',
            shapeType: 'rectangle',
            context: 'none'
          }  // Thin rectangle
        ],
        correctAnswer: 'correct',
        explanation: 'k=0.5 bedeutet, jede Seite ist nur noch halb so lang. Aus einem Quadrat wird wieder ein Quadrat, nur kleiner.'
      };
    }
  },

  createScalingLogicTask(index: number, seed: number): Task {
    const id = `u5-logic-${index}-${seed}`;
    const tasks = [
      {
        q: "Du verdoppelst die Seitenlänge eines Quadrats (k=2). Was passiert mit der Fläche?",
        o: ["Sie verdoppelt sich (x2)", "Sie vervierfacht sich (x4)", "Sie bleibt gleich", "Sie wird 8-mal so groß"],
        a: 1,
        e: "Die Fläche wächst im Quadrat: k² = 2² = 4. Es passen also 4 kleine Quadrate in das große."
      },
      {
        q: "Ein Würfel wird verdreifacht (k=3). Wie verändert sich das Volumen?",
        o: ["x3", "x9", "x27", "x6"],
        a: 2,
        e: "Das Volumen wächst hoch drei: k³ = 3³ = 3 * 3 * 3 = 27."
      },
      {
        q: "Ein Modellauto hat den Maßstab 1:10. Das echte Auto ist 4 Meter lang. Wie lang ist das Modell?",
        o: ["4 cm", "40 cm", "10 cm", "1 Meter"],
        a: 1,
        e: "4 Meter = 400 cm. Geteilt durch 10 sind das 40 cm."
      },
      {
        q: "Zwei Figuren sind ähnlich, wenn...",
        o: ["sie die gleiche Farbe haben.", "sie gleich groß sind.", "ihre Winkel gleich sind und Seitenverhältnisse stimmen.", "sie beide Vierecke sind."],
        a: 2,
        e: "Ähnlichkeit bedeutet: Gleiche Form (Winkel), aber unterschiedliche Größe (skaliert)."
      }
    ];
    const t = tasks[index % tasks.length];
    return {
      id, type: 'choice',
      question: t.q, options: t.o, correctAnswer: t.a, explanation: t.e
    };
  },

  createShapeTask(index: number, seed: number): Task {
    const id = `u1-gen-${index}-${seed}`;
    const questions = [
      {
        q: "Ein Mitschüler behauptet: 'Jedes Quadrat ist automatisch auch ein Rechteck'. Hat er Recht?",
        o: ["Ja, das stimmt.", "Nein, falsch.", "Nur wenn es rot ist.", "Nur in der Geometrie nicht."],
        a: 0,
        e: "Er hat Recht. Ein Quadrat erfüllt alle Bedingungen eines Rechtecks (rechte Winkel), hat aber zusätzlich vier gleich lange Seiten."
      },
      // REPLACED PIZZA TASK
      {
        q: "Du baust ein Regal auf, aber es ist total schief und wackelig. Die Winkel sind nicht mehr 90°, aber die Seiten noch gleich lang und parallel. Was ist es jetzt?",
        o: ["Quadrat", "Rechteck", "Raute (Rhombus)", "Kreis"],
        a: 2,
        e: "Ein 'schiefes Quadrat' nennt man Raute. Alle Seiten sind gleich lang, aber die Winkel sind keine 90° mehr."
      },
      {
        q: "Welche geometrische Form hat eine typische Kreditkarte?",
        o: ["Raute", "Rechteck", "Trapez", "Drachenviereck"],
        a: 1,
        e: "Kreditkarten sind Rechtecke. Sie haben vier rechte Winkel und gegenüberliegende Seiten sind parallel."
      }
    ];
    const s = questions[index % questions.length];
    return {
      id, type: 'choice',
      question: s.q,
      options: s.o,
      correctAnswer: s.a,
      explanation: s.e
    };
  },

  createAngleTask(index: number, seed: number): Task {
    const id = `u2-gen-${index}-${seed}`;
    const type = index % 3;

    if (type === 0) {
      const alpha = getRandomInt(100, 140);
      return {
        id, type: 'input',
        question: `Du lehnst an einer Wand. Dein Rücken und die Wand bilden ${alpha}°. Ein anderer Winkel liegt auf der gleichen Geraden direkt daneben (Nebenwinkel). Wie groß ist dieser?`,
        correctAnswer: (180 - alpha).toString(),
        explanation: 'Nebenwinkel an einer Geraden ergänzen sich immer zu 180°.',
        placeholder: 'Grad...'
      };
    } else if (type === 1) {
      return {
        id, type: 'choice',
        question: "Ein Scheinwerfer ist im 45°-Winkel ausgerichtet. Sein gegenüberliegender Winkel (Scheitelwinkel) hat wie viel Grad?",
        options: ["45°", "90°", "135°", "180°"],
        correctAnswer: 0,
        explanation: "Scheitelwinkel liegen sich gegenüber und sind immer exakt gleich groß."
      };
    } else {
      const alpha = getRandomInt(20, 60);
      return {
        id, type: 'input',
        question: `Konstruktion einer Rampe: Es entsteht ein rechtwinkliges Dreieck. Unten beträgt der Winkel ${alpha}°. Wie groß ist der dritte Winkel oben?`,
        correctAnswer: (90 - alpha).toString(),
        explanation: 'In einem rechtwinkligen Dreieck müssen die beiden spitzen Winkel zusammen 90° ergeben.',
        placeholder: 'Grad...'
      };
    }
  },

  createAreaTask(index: number, seed: number): Task {
    const id = `u3-gen-${index}-${seed}`;
    const g = getRandomInt(4, 8);
    const h = getRandomInt(2, 4);

    // Simple variety based on index
    if (index % 3 === 0) {
      return {
        id, type: 'input',
        question: `Eine Wandfläche ist ${g}m breit und ${h}m hoch (Rechteck). Wie viel Quadratmeter (m²) müssen gestaltet werden?`,
        correctAnswer: (g * h).toString(),
        explanation: 'Fläche A = Breite * Höhe.',
        placeholder: 'm²...'
      };
    } else {
       return {
        id, type: 'input',
        question: `Ein Wimpel (Dreieck): Grundseite ${g*5} cm, Höhe ${h*5} cm. Fläche?`,
        correctAnswer: ((g*5 * h*5) / 2).toString(),
        explanation: 'Dreieck: (g * h) / 2.',
        placeholder: 'cm²...'
      };
    }
  },

  createVolumeTask(index: number, seed: number): Task {
     const id = `u4-gen-${index}-${seed}`;
     const a = getRandomInt(3,6);
     return {
        id, type: 'input',
        question: `Eine Box: ${a}dm x ${a}dm x ${a}dm. Volumen in Liter?`,
        correctAnswer: (a * a * a).toString(),
        explanation: 'Volumen = a * a * a.',
        placeholder: 'Liter...'
      };
  },

  createTransformTask(index: number, seed: number): Task {
     const id = `u5-gen-${index}-${seed}`;
     return {
        id, type: 'input',
        question: `Zoom 200% (k=2). Länge war 10cm. Neu?`,
        correctAnswer: "20",
        explanation: 'Länge * k.',
        placeholder: 'cm...'
      };
  },

  createContextTask(index: number, seed: number): Task {
    const id = `u6-gen-${index}-${seed}`;
    const scenarios = [
      // SCENARIO 1: 1972 TIME TRAVEL
      {
        type: 'choice' as const,
        q: "Zeitreise in den Matheunterricht 1972: An der Tafel steht 'y = x + 2', aber der Lehrer wirft plötzlich seinen Schlüsselbund durch die Klasse. Die Flugbahn ist eine Parabel. Was beschreibt der Scheitelpunkt?",
        o: ["Den Abwurfpunkt.", "Den höchsten Punkt der Flugbahn.", "Den Aufprallpunkt.", "Die Geschwindigkeit."],
        a: 1,
        e: "Egal ob 1972 oder heute: Der Scheitelpunkt einer Wurfparabel ist immer das Maximum (der höchste Punkt)."
      },
      // SCENARIO 2: Flugkurve Berechnung (Simplified)
      {
        type: 'input' as const,
        q: "Ein Ball fliegt in einer Kurve: Höhe y = -x² + 4x. Wie hoch ist der Ball bei einer Entfernung von x=2 Metern? (Rechne: -2² + 4*2)",
        a: "4",
        e: "Einsetzen: -2² ergibt -4. 4 mal 2 ist 8. Addiert (-4 + 8) ergibt das 4 Meter Höhe.",
        p: "Meter..."
      },
      // SCENARIO 3: INSTAGRAM REEL / DRONE
      {
        type: 'input' as const,
        q: "Für ein Insta-Reel fliegt deine Drohne erst 30m geradeaus, dann exakt 40m im rechten Winkel nach oben für den 'Dramatic Zoom'. Wie weit ist sie Luftlinie vom Start entfernt?",
        a: "50",
        e: "Satz des Pythagoras (3-4-5 Dreieck): 30² + 40² = 900 + 1600 = 2500. Die Wurzel daraus ist 50.",
        p: "Meter..."
      },
      // SCENARIO 4: Kicks Reselling
      {
        type: 'choice' as const,
        q: "Du kaufst limitierte Sneaker für 200€. Der Sammlerwert steigt linear um 20€ pro Monat. Wie lautet die Funktionsgleichung?",
        o: ["y = 200x + 20", "y = 20x + 200", "y = x² + 200", "y = 200 - 20x"],
        a: 1,
        e: "Startwert 200 (y-Achsenabschnitt), Anstieg 20 (pro Monat x). Also y = 20x + 200."
      },
      // SCENARIO 5: Handy Display
      {
        type: 'choice' as const,
        q: "Ein Smartphone-Display hat ein 18:9 Format (Verhältnis Höhe zu Breite). Wenn es 7cm breit ist, wie hoch ist es dann?",
        o: ["14 cm", "18 cm", "9 cm", "21 cm"],
        a: 0,
        e: "Das Verhältnis 18 zu 9 lässt sich kürzen auf 2 zu 1. Die Höhe ist also doppelt so groß wie die Breite. 7 * 2 = 14."
      }
    ];

    const s = scenarios[index % scenarios.length];

    if (s.type === 'choice') {
      return {
        id, type: 'choice', question: s.q, options: s.o!, correctAnswer: s.a, explanation: s.e
      };
    } else {
      return {
        id, type: 'input', question: s.q, correctAnswer: s.a.toString(), explanation: s.e, placeholder: s.p
      };
    }
  },

  // --- NEW: Drag-and-Drop Classification ---
  createDragDropTask(index: number, seed: number): Task {
    const id = `u1-drag-${index}-${seed}`;
    return {
      id,
      type: 'dragDrop',
      question: "Ordne die Figuren in das 'Haus der Vierecke' ein. Ziehe jede Figur in die richtige Kategorie!",
      dragDropData: {
        shapes: [
          { id: 'square', path: 'M 60,80 L 140,80 L 140,20 L 60,20 Z', shapeType: 'square', label: 'Quadrat' },
          { id: 'rect', path: 'M 30,80 L 170,80 L 170,20 L 30,20 Z', shapeType: 'rectangle', label: 'Rechteck' },
          { id: 'rhombus', path: 'M 100,90 L 150,50 L 100,10 L 50,50 Z', shapeType: 'rhombus', label: 'Raute' },
          { id: 'para', path: 'M 30,80 L 170,80 L 190,20 L 50,20 Z', shapeType: 'parallelogram', label: 'Parallelogramm' },
          { id: 'trapez', path: 'M 20,80 L 180,80 L 140,20 L 60,20 Z', shapeType: 'trapezoid', label: 'Trapez' }
        ],
        categories: [
          { id: 'viereck', label: 'Allgemeines Viereck', accepts: ['trapez'] },
          { id: 'parallelogramm', label: 'Parallelogramm', accepts: ['para', 'rect', 'rhombus', 'square'] },
          { id: 'rechteck', label: 'Rechteck', accepts: ['rect', 'square'] },
          { id: 'raute', label: 'Raute', accepts: ['rhombus', 'square'] },
          { id: 'quadrat', label: 'Quadrat', accepts: ['square'] }
        ]
      },
      correctAnswer: JSON.stringify({
        square: 'quadrat',
        rect: 'rechteck',
        rhombus: 'raute',
        para: 'parallelogramm',
        trapez: 'viereck'
      }),
      explanation: 'Das Haus der Vierecke zeigt die Hierarchie: Jedes Quadrat ist auch ein Rechteck und eine Raute. Jedes Rechteck und jede Raute ist auch ein Parallelogramm.'
    };
  },

  // --- NEW: Angle Measurement Task ---
  createAngleMeasurementTask(index: number, seed: number): Task {
    const id = `u2-angle-${index}-${seed}`;
    const angles = [
      { path: 'M 20,130 L 100,130 L 100,50', correctAngle: 90 },
      { path: 'M 20,130 L 100,130 L 60,40', correctAngle: 45 },
      { path: 'M 20,130 L 100,130 L 20,50', correctAngle: 135 }
    ];
    const selected = angles[index % angles.length];

    return {
      id,
      type: 'angleMeasure',
      question: "Messe den markierten Winkel im Dreieck. Bewege die Maus über die Figur!",
      angleData: {
        path: selected.path,
        correctAngle: selected.correctAngle
      },
      correctAnswer: selected.correctAngle.toString(),
      explanation: `Der Winkel beträgt ${selected.correctAngle}°. ${selected.correctAngle === 90 ? 'Das ist ein rechter Winkel!' : selected.correctAngle < 90 ? 'Das ist ein spitzer Winkel.' : 'Das ist ein stumpfer Winkel.'}`
    };
  },

  // --- NEW: Slider Transformation Task ---
  createSliderTransformationTask(index: number, seed: number): Task {
    const id = `u5-slider-${index}-${seed}`;
    const tasks = [
      {
        basePath: 'M 20,20 H 100 V 100 H 20 Z',
        shapeType: 'square',
        correctK: 2,
        question: "Verwende den Slider, um das Quadrat mit Faktor k=2 zu vergrößern!"
      },
      {
        basePath: 'M 20,80 L 60,80 L 20,40 Z',
        shapeType: 'triangle',
        correctK: 1.5,
        question: "Strecke das Dreieck mit Faktor k=1.5!"
      }
    ];
    const selected = tasks[index % tasks.length];

    return {
      id,
      type: 'sliderTransform',
      question: selected.question,
      sliderData: {
        basePath: selected.basePath,
        shapeType: selected.shapeType,
        minK: 0.5,
        maxK: 3,
        correctK: selected.correctK
      },
      correctAnswer: selected.correctK.toString(),
      explanation: `Bei k=${selected.correctK} wird die Figur ${selected.correctK}x größer. Die Fläche wird dabei ${(selected.correctK * selected.correctK).toFixed(1)}x größer (k²).`
    };
  },

  // --- NEW: Area Decomposition Task ---
  createAreaDecompositionTask(index: number, seed: number): Task {
    const id = `u3-decomp-${index}-${seed}`;
    return {
      id,
      type: 'areaDecomposition',
      question: "Klicke auf alle Teilflächen, um die Gesamtfläche zu berechnen!",
      decompositionData: {
        complexPath: 'M 20,20 H 100 V 80 H 20 Z M 100,50 H 180 V 80 H 100 Z', // L-shaped
        parts: [
          { path: 'M 20,20 H 100 V 80 H 20 Z', label: 'Rechteck A', area: 80 * 60 }, // 80cm x 60cm = 4800
          { path: 'M 100,50 H 180 V 80 H 100 Z', label: 'Rechteck B', area: 80 * 30 } // 80cm x 30cm = 2400
        ]
      },
      correctAnswer: '7200', // 4800 + 2400
      explanation: 'Die Gesamtfläche ist die Summe der Teilflächen: 4800 cm² + 2400 cm² = 7200 cm².'
    };
  },

  // --- NEW: Parallel Lines + Transversal Task ---
  createParallelLinesTask(index: number, seed: number): Task {
    const id = `u2-parallel-${index}-${seed}`;
    const givenAngle = getRandomInt(40, 60);
    const tasks = [
      {
        q: `Zwei parallele Geraden werden von einer Querlinie geschnitten. Ein Winkel beträgt ${givenAngle}°. Berechne alle weiteren Winkel.`,
        correctAnswer: `${180 - givenAngle},${givenAngle},${180 - givenAngle}`,
        explanation: `Nebenwinkel: 180° - ${givenAngle}° = ${180 - givenAngle}°. Scheitelwinkel: ${givenAngle}°. Stufenwinkel: ${givenAngle}° und ${180 - givenAngle}°.`,
        placeholder: 'Winkel durch Komma getrennt (z.B. 142,38,142)'
      }
    ];
    const t = tasks[index % tasks.length];
    return {
      id,
      type: 'input',
      question: t.q,
      correctAnswer: t.correctAnswer,
      explanation: t.explanation,
      placeholder: t.placeholder
    };
  },

  // --- NEW: Thales Theorem Task ---
  createThalesTask(index: number, seed: number): Task {
    const id = `u2-thales-${index}-${seed}`;
    const a = getRandomInt(3, 6);
    const b = getRandomInt(4, 8);
    const c = Math.sqrt(a * a + b * b);
    return {
      id,
      type: 'input',
      question: `Ein rechtwinkliges Dreieck hat die Katheten a=${a}cm und b=${b}cm. Berechne die Hypotenuse c mit dem Satz des Pythagoras.`,
      correctAnswer: Math.round(c).toString(),
      explanation: `Satz des Pythagoras: c² = a² + b² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}. Also c = √${a*a + b*b} ≈ ${Math.round(c)}cm.`,
      placeholder: 'cm'
    };
  },

  // --- NEW: Circle Task ---
  createCircleTask(index: number, seed: number): Task {
    const id = `u3-circle-${index}-${seed}`;
    const r = getRandomInt(3, 8);
    const type = index % 2;
    if (type === 0) {
      // Circumference
      const circumference = Math.round(2 * Math.PI * r * 100) / 100;
      return {
        id,
        type: 'input',
        question: `Ein Kreis hat den Radius r=${r}cm. Berechne den Umfang (π≈3,14).`,
        correctAnswer: Math.round(circumference).toString(),
        explanation: `Umfang U = 2πr = 2 × 3,14 × ${r} = ${circumference.toFixed(2)}cm ≈ ${Math.round(circumference)}cm`,
        placeholder: 'cm'
      };
    } else {
      // Area
      const area = Math.round(Math.PI * r * r * 100) / 100;
      return {
        id,
        type: 'input',
        question: `Ein Kreis hat den Radius r=${r}cm. Berechne den Flächeninhalt (π≈3,14).`,
        correctAnswer: Math.round(area).toString(),
        explanation: `Fläche A = πr² = 3,14 × ${r}² = 3,14 × ${r*r} = ${area.toFixed(2)}cm² ≈ ${Math.round(area)}cm²`,
        placeholder: 'cm²'
      };
    }
  },

  // --- NEW: Algebra-Geometry Task ---
  createAlgebraGeometryTask(index: number, seed: number): Task {
    const id = `u3-algebra-${index}-${seed}`;
    const x = getRandomInt(3, 7);
    const tasks = [
      {
        q: `Ein Rechteck hat die Seitenlängen (x+2) und (x-1). Berechne die Fläche für x=${x}.`,
        correctAnswer: ((x + 2) * (x - 1)).toString(),
        expl: `Fläche = (x+2)(x-1) = x² + x - 2. Für x=${x}: ${x}² + ${x} - 2 = ${x*x} + ${x} - 2 = ${(x+2)*(x-1)}cm²`
      },
      {
        q: `Ein Dreieck hat die Grundseite x und die Höhe 8. Berechne die Fläche für x=${x}.`,
        correctAnswer: ((x * 8) / 2).toString(),
        expl: `Fläche = (x × 8) / 2 = 4x. Für x=${x}: 4 × ${x} = ${(x*8)/2}cm²`
      }
    ];
    const t = tasks[index % tasks.length];
    return {
      id,
      type: 'input',
      question: t.q,
      correctAnswer: t.correctAnswer,
      explanation: t.expl,
      placeholder: 'cm²'
    };
  },

  // --- NEW: Net Task ---
  createNetTask(index: number, seed: number): Task {
    const id = `u4-net-${index}-${seed}`;
    return {
      id,
      type: 'visualChoice',
      question: 'Welches Netz gehört zu einem Würfel?',
      visualData: [
        {
          id: 'wrong1',
          label: 'Netz A',
          path: 'M 20,20 H 80 V 80 H 20 Z M 80,20 H 140 V 80 H 80 Z M 140,20 H 200 V 80 H 140 Z M 80,80 H 140 V 140 H 80 Z',
          shapeType: 'net_wrong'
        },
        {
          id: 'correct',
          label: 'Netz B',
          path: 'M 20,20 H 80 V 80 H 20 Z M 80,20 H 140 V 80 H 80 Z M 140,20 H 200 V 80 H 140 Z M 20,80 H 80 V 140 H 20 Z M 80,140 H 140 V 200 H 80 Z M 140,80 H 200 V 140 H 140 Z',
          shapeType: 'net_cube'
        },
        {
          id: 'wrong2',
          label: 'Netz C',
          path: 'M 20,20 H 80 V 80 H 20 Z M 80,20 H 140 V 80 H 80 Z M 20,80 H 80 V 140 H 20 Z',
          shapeType: 'net_wrong'
        }
      ],
      correctAnswer: 'correct',
      explanation: 'Ein Würfelnetz hat genau 6 Quadrate, die so angeordnet sind, dass sie einen Würfel bilden können.'
    };
  },

  // --- NEW: Cylinder Task ---
  createCylinderTask(index: number, seed: number): Task {
    const id = `u4-cylinder-${index}-${seed}`;
    const r = getRandomInt(2, 5);
    const h = getRandomInt(5, 10);
    const type = index % 2;
    if (type === 0) {
      // Volume
      const volume = Math.round(Math.PI * r * r * h * 100) / 100;
      return {
        id,
        type: 'input',
        question: `Ein Zylinder hat den Radius r=${r}cm und die Höhe h=${h}cm. Berechne das Volumen (π≈3,14).`,
        correctAnswer: Math.round(volume).toString(),
        explanation: `Volumen V = πr²h = 3,14 × ${r}² × ${h} = 3,14 × ${r*r} × ${h} = ${volume.toFixed(2)}cm³ ≈ ${Math.round(volume)}cm³`,
        placeholder: 'cm³'
      };
    } else {
      // Surface
      const surface = Math.round((2 * Math.PI * r * r + 2 * Math.PI * r * h) * 100) / 100;
      return {
        id,
        type: 'input',
        question: `Ein Zylinder hat den Radius r=${r}cm und die Höhe h=${h}cm. Berechne die Oberfläche (π≈3,14).`,
        correctAnswer: Math.round(surface).toString(),
        explanation: `Oberfläche O = 2πr² + 2πrh = 2×3,14×${r}² + 2×3,14×${r}×${h} = ${surface.toFixed(2)}cm² ≈ ${Math.round(surface)}cm²`,
        placeholder: 'cm²'
      };
    }
  },

  // --- NEW: Composite Body Task ---
  createCompositeBodyTask(index: number, seed: number): Task {
    const id = `u4-composite-${index}-${seed}`;
    const a = getRandomInt(3, 5);
    const b = getRandomInt(4, 6);
    const h = getRandomInt(5, 8);
    const volume = a * a * a + b * b * h;
    return {
      id,
      type: 'input',
      question: `Ein zusammengesetzter Körper besteht aus einem Würfel (Kantenlänge ${a}cm) und einem Quader (Grundfläche ${b}×${b}cm, Höhe ${h}cm). Berechne das Gesamtvolumen.`,
      correctAnswer: volume.toString(),
      explanation: `Volumen = Würfel + Quader = ${a}³ + ${b}×${b}×${h} = ${a*a*a} + ${b*b*h} = ${volume}cm³`,
      placeholder: 'cm³'
    };
  },

  // --- NEW: Similarity Task ---
  createSimilarityTask(index: number, seed: number): Task {
    const id = `u5-similarity-${index}-${seed}`;
    const a1 = getRandomInt(3, 6);
    const b1 = getRandomInt(4, 8);
    const k = getRandomInt(2, 3);
    const a2 = a1 * k;
    const b2 = b1 * k;
    const c1 = Math.sqrt(a1 * a1 + b1 * b1);
    const c2 = c1 * k;
    return {
      id,
      type: 'input',
      question: `Zwei ähnliche Dreiecke: Das erste hat die Seiten a=${a1}cm, b=${b1}cm. Das zweite ist ${k}-mal so groß. Wie lang ist Seite c im zweiten Dreieck, wenn c im ersten Dreieck ${Math.round(c1)}cm ist?`,
      correctAnswer: Math.round(c2).toString(),
      explanation: `Bei Ähnlichkeit werden alle Seiten mit dem gleichen Faktor k=${k} gestreckt. Also c₂ = c₁ × k = ${Math.round(c1)} × ${k} = ${Math.round(c2)}cm`,
      placeholder: 'cm'
    };
  },

  // --- NEW: Strahlensatz Task ---
  createStrahlensatzTask(index: number, seed: number): Task {
    const id = `u5-strahlensatz-${index}-${seed}`;
    const h1 = getRandomInt(150, 180);
    const s1 = getRandomInt(200, 250);
    const s2 = getRandomInt(800, 1200);
    const h2 = Math.round((h1 * s2) / s1);
    return {
      id,
      type: 'input',
      question: `Ein Mensch (${h1}cm) wirft einen Schatten von ${s1}cm. Ein Turm wirft einen Schatten von ${s2}cm. Wie hoch ist der Turm? (Strahlensatz)`,
      correctAnswer: h2.toString(),
      explanation: `Strahlensatz: ${h1}cm / ${s1}cm = Turmhöhe / ${s2}cm. Also Turmhöhe = (${h1} × ${s2}) / ${s1} = ${h2}cm`,
      placeholder: 'cm'
    };
  },

  // --- NEW: Multi-Angle Throw Training ---
  createMultiAngleThrowTask(index: number, seed: number): Task {
    const id = `u2-multi-angle-${index}-${seed}`;
    const targetAngles = [
      { target: 45, desc: '45° Winkel' },
      { target: 30, desc: '30° Winkel' },
      { target: 60, desc: '60° Winkel' },
      { target: 35, desc: '35° Winkel' }
    ];
    const selected = targetAngles[index % targetAngles.length];

    return {
      id,
      type: 'multiAngleThrow',
      question: `Werfe die Flasche mit bis zu 5 verschiedenen Winkeln und versuche, den ${selected.desc} zu treffen!\n\n💰 Kosten: 10 Coins zu Beginn\n⭐ Belohnung: 5 Coins pro Treffer`,
      multiAngleThrowData: {
        targetAngle: selected.target,
        maxAngles: 5,
        startCost: 10,
        hitReward: 5,
        tolerance: 5 // ±5° für Treffer
      },
      correctAnswer: selected.target.toString(),
      explanation: `Der Zielwinkel war ${selected.target}°. Durch wiederholtes Experimentieren lernst du, wie unterschiedliche Winkel die Flugbahn beeinflussen. Jeder Treffer in der Nähe des Ziels zählt!`
    };
  }
};