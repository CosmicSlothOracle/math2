
import { PreTask, SupportVisual, Task } from '../types';
import { getBountyTasks } from './bountyCatalog';
import {
  createTrigonometrieQuest,
  createPythagorasQuest,
  createKoerperQuest,
  createStrahlensatzQuest,
  createKongruenzQuest,
  createVieleckQuest,
  createDreidQuest,
} from './geometrieMundoQuests';
import {
  createPotenzgesetzeQuest,
  createTermTunerQuest,
  createWurzelLaborQuest,
  createGleichungsknackerQuest,
  createZehnerpotenzenQuest,
  createZahlbereicheQuest,
} from './potenzenQuests';
import {
  createParabelBasicsQuest,
  createScheitelpunktQuest,
  createStreckungQuest,
  createFormTransformQuest,
  createNullstellenQuest,
  createAnwendungQuest,
} from './quadratischQuests';
import { POTENZEN_LEARNING_UNITS } from './potenzenLearningUnits';
import { QUADRATISCH_LEARNING_UNITS } from './quadratischLearningUnits';
import { getSegmentForUnit } from './segments';

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

const normalizePreTaskAnswer = (answer: PreTask['correctAnswer']): string => {
  if (typeof answer === 'number') {
    return answer.toString();
  }
  if (typeof answer === 'string') {
    return answer;
  }
  try {
    return JSON.stringify(answer);
  } catch {
    return '';
  }
};

const convertPreTaskToTask = (unitId: string, preTask: PreTask, index: number): Task => {
  const taskId = preTask.id ? `${unitId}-pre-${preTask.id}` : `${unitId}-pre-${index}`;
  const question = preTask.title || 'Voraufgabe';
  const instructions = preTask.description || '';
  const explanation = preTask.explanation || 'Super gemacht!';

  if (preTask.uiType === 'dragDrop' && preTask.meta?.dragDropData) {
    return {
      id: taskId,
      type: 'dragDrop',
      question,
      instructions,
      dragDropData: preTask.meta.dragDropData,
      correctAnswer: normalizePreTaskAnswer(preTask.correctAnswer),
      explanation,
    };
  }

  return {
    id: taskId,
    type: 'choice',
    question,
    instructions,
    options: ['Bereit!', "Los geht's!"],
    correctAnswer: 0,
    explanation,
  };
};

const PRETASKS_BY_UNIT: Record<string, PreTask[]> = (() => {
  const map: Record<string, PreTask[]> = {};

  const registerPreTasks = (units: Array<{ id: string; preTasks?: PreTask[] }>) => {
    units.forEach(unit => {
      if (unit.preTasks && unit.preTasks.length > 0) {
        map[unit.id] = unit.preTasks;
      }
    });
  };

  registerPreTasks(POTENZEN_LEARNING_UNITS);
  registerPreTasks(QUADRATISCH_LEARNING_UNITS);

  return map;
})();

type AngleLineSpec = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
};

type AngleLabelSpec = {
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  anchor?: 'start' | 'middle' | 'end';
};

interface AngleArcSpecConfig {
  angle: number;
  label: string;
  color: string;
  opacity?: number;
  clockwise?: boolean;
  dashed?: boolean;
  labelColor?: string;
  labelFontSize?: number;
}

interface AngleArcDrawing {
  path: string;
  fill: string;
  opacity?: number;
  stroke?: string;
  strokeDasharray?: string;
  label?: AngleLabelSpec;
}

interface AngleScene {
  baseLine: AngleLineSpec;
  wallLine?: AngleLineSpec;
  rays: AngleLineSpec[];
  arcs: AngleArcDrawing[];
  labels: AngleLabelSpec[];
  path: string;
  origin: { x: number; y: number };
  referenceAngle: number;
  rayLength: number;
}

interface AngleSceneOptions {
  includeWall?: boolean;
  baseLength?: number;
  originX?: number;
  originY?: number;
  rayLength?: number;
  arcRadius?: number;
  rayColor?: string;
  baseLabel?: string | false;
  wallLabel?: string;
  rayLabel?: string;
  arcs?: AngleArcSpecConfig[];
  referenceAngle?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const polarPoint = (originX: number, originY: number, length: number, radians: number): [number, number] => [
  originX + length * Math.cos(radians),
  originY - length * Math.sin(radians)
];

const createArcDrawing = (spec: AngleArcSpecConfig, origin: { x: number; y: number }, arcRadius: number): AngleArcDrawing => {
  const radians = (spec.angle * Math.PI) / 180;
  const signedRad = spec.clockwise ? -radians : radians;
  const startX = origin.x + arcRadius;
  const startY = origin.y;
  const [endX, endY] = polarPoint(origin.x, origin.y, arcRadius, signedRad);
  const largeArc = spec.angle > 180 ? 1 : 0;
  const sweep = spec.clockwise ? 1 : 0;
  const path = `M ${origin.x} ${origin.y} L ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY} Z`;
  const midRad = signedRad / 2;
  const labelRadius = arcRadius - 10;
  const [labelX, labelY] = polarPoint(origin.x, origin.y, labelRadius, midRad);
  const label: AngleLabelSpec = {
    text: spec.label,
    x: labelX,
    y: labelY,
    color: spec.labelColor || '#0f172a',
    fontSize: spec.labelFontSize || 16,
    anchor: 'middle'
  };

  return {
    path,
    fill: spec.color,
    opacity: spec.opacity ?? 1,
    stroke: spec.dashed ? spec.color : undefined,
    strokeDasharray: spec.dashed ? '6 4' : undefined,
    label
  };
};

const createAngleScene = (angle: number, options: AngleSceneOptions = {}): AngleScene => {
  const originX = options.originX ?? 110;
  const originY = options.originY ?? 130;
  const baseLength = options.baseLength ?? 160;
  const rayLength = options.rayLength ?? 70;
  const arcRadius = options.arcRadius ?? 34;
  const baseX1 = clamp(originX - baseLength / 2, 10, 210);
  const baseX2 = clamp(originX + baseLength / 2, 10, 210);
  const baseLine: AngleLineSpec = {
    x1: baseX1,
    y1: originY,
    x2: baseX2,
    y2: originY,
    stroke: '#94a3b8',
    strokeWidth: 6
  };
  const wallLine = options.includeWall
    ? {
        x1: originX,
        y1: originY,
        x2: originX,
        y2: originY - 90,
        stroke: '#475569',
        strokeWidth: 6
      }
    : undefined;

  const arcsConfig = options.arcs && options.arcs.length > 0
    ? options.arcs
    : [{
        angle,
        label: `${Math.round(angle)}°`,
        color: 'rgba(37,99,235,0.25)'
      }];

  const referenceAngle = options.referenceAngle
    ?? arcsConfig.find(cfg => !cfg.clockwise)?.angle
    ?? angle;

  const referenceRad = (referenceAngle * Math.PI) / 180;
  const [rayX, rayY] = polarPoint(originX, originY, rayLength, referenceRad);
  const ray: AngleLineSpec = {
    x1: originX,
    y1: originY,
    x2: rayX,
    y2: rayY,
    stroke: options.rayColor || '#2563eb',
    strokeWidth: 5
  };

  const arcs = arcsConfig.map(cfg => createArcDrawing(cfg, { x: originX, y: originY }, arcRadius));
  const labels: AngleLabelSpec[] = [];
  if (options.baseLabel !== false) {
    labels.push({
      text: typeof options.baseLabel === 'string' ? options.baseLabel : 'Boden',
      x: baseLine.x2 - 10,
      y: originY + 18,
      color: '#1e293b',
      fontSize: 14,
      anchor: 'end'
    });
  }
  if (wallLine) {
    labels.push({
      text: options.wallLabel || 'Wand',
      x: wallLine.x2 + 8,
      y: wallLine.y2 + 22,
      color: '#1e293b',
      fontSize: 14,
      anchor: 'start'
    });
  }
  if (options.rayLabel) {
    labels.push({
      text: options.rayLabel,
      x: (ray.x1 + ray.x2) / 2,
      y: (ray.y1 + ray.y2) / 2 - 8,
      color: ray.stroke || '#2563eb',
      fontSize: 14
    });
  }
  arcs.forEach(arc => {
    if (arc.label) {
      labels.push(arc.label);
    }
  });

  return {
    baseLine,
    wallLine,
    rays: [ray],
    arcs,
    labels,
    path: `M ${ray.x1} ${ray.y1} L ${ray.x2} ${ray.y2}`,
    origin: { x: originX, y: originY },
    referenceAngle,
    rayLength
  };
};

const createAngleVisualOption = (
  id: string,
  angle: number,
  label: string,
  config: (AngleSceneOptions & { context?: string }) | undefined
) => {
  const scene = createAngleScene(angle, config);
  return {
    id,
    label,
    context: config?.context,
    angleValue: angle,
    baseLine: scene.baseLine,
    wallLine: scene.wallLine,
    helperLines: scene.rays,
    angleArcs: scene.arcs.map(arc => ({
      path: arc.path,
      fill: arc.fill,
      opacity: arc.opacity,
      stroke: arc.stroke,
      strokeDasharray: arc.strokeDasharray
    })),
    referenceLabels: scene.labels,
    path: scene.path,
    strokeWidth: 4
  };
};

const lineToElement = (line: AngleLineSpec) => ({
  type: 'line' as const,
  x1: line.x1,
  y1: line.y1,
  x2: line.x2,
  y2: line.y2,
  stroke: line.stroke,
  strokeWidth: line.strokeWidth,
  dashed: line.dashed
});

const arcToElement = (arc: AngleArcDrawing) => ({
  type: 'path' as const,
  d: arc.path,
  fill: arc.fill,
  opacity: arc.opacity,
  stroke: arc.stroke,
  strokeDasharray: arc.strokeDasharray
});

const labelToElement = (label: AngleLabelSpec) => ({
  type: 'text' as const,
  text: label.text,
  x: label.x,
  y: label.y,
  color: label.color,
  fontSize: label.fontSize,
  anchor: label.anchor
});

const createSupportVisualFromScene = (scene: AngleScene, caption?: string): SupportVisual => {
  const elements: SupportVisual['elements'] = [
    lineToElement(scene.baseLine),
    scene.wallLine ? lineToElement(scene.wallLine) : undefined,
    ...scene.rays.map(lineToElement),
    ...scene.arcs.map(arcToElement),
    ...scene.labels.map(labelToElement)
  ].filter(Boolean) as SupportVisual['elements'];

  return {
    viewBox: '0 0 220 170',
    elements,
    caption
  };
};

const rectPath = (x: number, y: number, width: number, height: number) => {
  return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
};

const createRightTriangleSupportVisual = (alpha: number): SupportVisual => {
  const baseStart = { x: 40, y: 160 };
  const baseEnd = { x: 200, y: 160 };
  const heightTop = { x: 200, y: 60 };
  const elements: SupportVisual['elements'] = [
    { type: 'line', x1: baseStart.x, y1: baseStart.y, x2: baseEnd.x, y2: baseEnd.y, stroke: '#94a3b8', strokeWidth: 5 },
    { type: 'line', x1: baseEnd.x, y1: baseEnd.y, x2: heightTop.x, y2: heightTop.y, stroke: '#475569', strokeWidth: 5 },
    { type: 'line', x1: baseStart.x, y1: baseStart.y, x2: heightTop.x, y2: heightTop.y, stroke: '#2563eb', strokeWidth: 5 },
    { type: 'path', d: 'M 180 160 L 180 140 L 200 140 L 200 160 Z', fill: 'rgba(148,163,184,0.35)' }
  ];
  elements.push({
    type: 'path',
    d: 'M 40 160 L 70 160 A 28 28 0 0 1 58 132 Z',
    fill: 'rgba(249,115,22,0.35)'
  });
  elements.push({
    type: 'path',
    d: 'M 200 110 L 200 80 A 26 26 0 0 1 175 105 Z',
    fill: 'rgba(59,130,246,0.35)'
  });
  elements.push({
    type: 'text',
    text: `α = ${alpha}°`,
    x: 78,
    y: 176,
    color: '#9a3412',
    fontSize: 16,
    anchor: 'start'
  });
  elements.push({
    type: 'text',
    text: 'β = ?',
    x: 188,
    y: 96,
    color: '#1e40af',
    fontSize: 16,
    anchor: 'middle'
  });
  elements.push({
    type: 'text',
    text: '90°',
    x: 186,
    y: 148,
    color: '#1e293b',
    fontSize: 14,
    anchor: 'middle'
  });

  return {
    viewBox: '0 0 240 200',
    elements,
    caption: 'Rechtwinkliges Dreieck: orange α unten, blau β oben, graues Quadrat = 90°.'
  };
};

export const TaskFactory = {
  // === NEUE API (für Kompatibilität mit neuem Hauptprojekt) ===
  getTasksForUnit(unitId: string, type: 'pre' | 'standard' | 'bounty'): Task[] {
    switch (type) {
      case 'pre':
        return this.generatePreTasks(unitId);
      case 'standard':
        {
          const seed = Date.now();
        // Standard-Aufgaben aus dem Task-Pool
        return this.generateTasks(unitId, 5);
        }
      case 'bounty':
        {
          const bountyTasks = getBountyTasks(unitId);
        return bountyTasks.length > 0 ? bountyTasks : [this.generateBountyTask(unitId)];
        }
      default:
        return [];
    }
  },

  generatePreTasks(unitId: string): Task[] {
    const learningUnitPreTasks = PRETASKS_BY_UNIT[unitId] || [];
    const segmentPreTasks = getSegmentForUnit(unitId)?.preTasks || [];
    const allPreTasks = [...learningUnitPreTasks, ...segmentPreTasks];

    console.log(`[TaskFactory] generatePreTasks for ${unitId}:`, {
      learningUnitPreTasks: learningUnitPreTasks.length,
      segmentPreTasks: segmentPreTasks.length,
      total: allPreTasks.length,
      registeredUnits: Object.keys(PRETASKS_BY_UNIT)
    });

    if (allPreTasks.length === 0) {
      console.warn(`[TaskFactory] No PreTasks found for unit ${unitId}. Available units:`, Object.keys(PRETASKS_BY_UNIT));
      return [];
    }

    const tasks = allPreTasks.map((preTask, idx) => {
      try {
        return convertPreTaskToTask(unitId, preTask, idx);
      } catch (error) {
        console.error(`[TaskFactory] Error converting PreTask ${idx} for unit ${unitId}:`, error, preTask);
        throw error;
      }
    });

    console.log(`[TaskFactory] Generated ${tasks.length} tasks from PreTasks for ${unitId}`);
    return tasks;
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
        this.createDragDropTask(0, seed), // Drag-and-Drop Klassifikation
        this.createU1RegalbrettTask(seed) // Textvollständige Klassifikation
      ];
      case 'u2': return [
        this.createVisualAngleTask(0, seed),
        this.createAngleTask(0, seed),
        this.createAngleTask(1, seed),
        this.createAngleTask(2, seed),
        this.createVisualAngleTask(1, seed),
        this.createVisualAngleTask(2, seed),
        this.createAngleMeasurementTask(0, seed), // Animierte Winkel-Messung
        this.createParallelLinesTask(0, seed), // Parallel lines + transversal
        this.createThalesTask(0, seed), // Thales theorem
        this.createParallelClearTextTask(seed), // Klare Text-Aufgabe ohne Bild
        // MUNDO: Trigonometrie & Kongruenz
        ...Array.from({ length: 4 }, (_, i) => createTrigonometrieQuest(i * 2, seed)),
        ...Array.from({ length: 2 }, (_, i) => createKongruenzQuest(i, seed)),
      ];
      case 'u3': return [
        this.createAreaTask(0, seed),
        this.createAreaTask(1, seed),
        this.createAreaTask(2, seed),
        this.createAreaTask(3, seed), // Extra variation
        this.createAreaTask(4, seed),
        this.createAreaDecompositionTask(0, seed), // Interaktive Flächen-Zerlegung
        this.createCircleTask(0, seed), // Circle circumference/area
        this.createCircleTask(1, seed), // Circle area variation
        this.createKreissektorTask(0, seed), // Kreissektor (NEW)
        this.createKreisbogenTask(0, seed), // Kreisbogen (NEW)
        this.createAlgebraGeometryTask(0, seed), // Algebra-geometry terms
        this.createFliesenLTask(seed), // L-Form Fläche textbasiert
        // MUNDO: Vielecke
        ...Array.from({ length: 2 }, (_, i) => createVieleckQuest(i, seed)),
      ];
      case 'u4': return [
        this.createVolumeTask(0, seed),
        this.createVolumeTask(1, seed),
        this.createVolumeTask(2, seed),
        this.createVolumeTask(3, seed),
        this.createVolumeTask(4, seed),
        this.createNetTask(0, seed), // Nets
        this.createCylinderTask(0, seed), // Cylinder surface/volume
        this.createCompositeBodyTask(0, seed), // Composite bodies
        this.createCompositePrismTask(0, seed), // Zusammengesetzte Prismen (NEW)
        this.createCylinderLiterTask(seed), // Zylinder in Litern, reine Textdaten
        // MUNDO: Körpergeometrie erweitert & 3D-Geometrie
        ...Array.from({ length: 5 }, (_, i) => createKoerperQuest(i, seed)),
        ...Array.from({ length: 2 }, (_, i) => createDreidQuest(i, seed)),
      ];
      case 'u5': return [
        this.createVisualSimilarityTask(0, seed),
        this.createVisualSimilarityTask(1, seed),
        this.createScalingLogicTask(0, seed),
        this.createScalingLogicTask(1, seed),
        this.createScalingLogicTask(2, seed),
        this.createScalingLogicTask(3, seed),
        this.createTransformTask(0, seed),
        this.createScalingFactorTask(0, seed), // Skalierungsfaktor verstehen (ersetzt Slider)
        this.createSimilarityTask(0, seed), // Similar triangles
        this.createStrahlensatzTask(0, seed), // Strahlensatz
        this.createStrahlensatzUmkehrungTask(0, seed), // Umkehrung Strahlensatz (NEW)
        this.createZentrischeStreckungTask(0, seed), // Zentrische Streckung (NEW)
        // MUNDO: Strahlensätze erweitert
        ...Array.from({ length: 2 }, (_, i) => createStrahlensatzQuest(i, seed)),
        this.createAehnlichkeitssaetzeTask(0, seed), // Ähnlichkeitssätze Dreiecke (NEW)
        this.createMassstabDualTask(seed) // Maßstab Meter/Kilometer, getrennte Felder
      ];
      case 'u6': return [
        this.createContextTask(0, seed),
        this.createContextTask(1, seed),
        this.createContextTask(2, seed),
        this.createContextTask(3, seed),
        this.createContextTask(4, seed),
        this.createParkPythagorasTask(seed), // Pythagoras im Park, rein textlich
        this.createHoehenKathetensatzTask(0, seed), // Höhen- und Kathetensatz (NEW)
        // MUNDO: Trigonometrie & Pythagoras erweitert
        ...Array.from({ length: 4 }, (_, i) => createTrigonometrieQuest(i * 2 + 1, seed)),
        ...Array.from({ length: 3 }, (_, i) => createPythagorasQuest(i, seed)),
      ];
      // Potenzen & Reelle Zahlen
      case 'u_potenzen_01': return Array.from({ length: 6 }, (_, i) => createZahlbereicheQuest(i, seed)); // Zahlen-Sortierer
      case 'u_potenzen_02': return Array.from({ length: 8 }, (_, i) => createPotenzgesetzeQuest(i, seed)); // Erweitert von 6 auf 8
      case 'u_potenzen_03': return Array.from({ length: 6 }, (_, i) => createTermTunerQuest(i, seed)); // Erweitert von 4 auf 6
      case 'u_potenzen_04': return Array.from({ length: 6 }, (_, i) => createWurzelLaborQuest(i, seed)); // Erweitert von 4 auf 6
      case 'u_potenzen_05': return Array.from({ length: 4 }, (_, i) => createGleichungsknackerQuest(i, seed));
      case 'u_potenzen_06': return Array.from({ length: 6 }, (_, i) => createZehnerpotenzenQuest(i, seed)); // Zehnerpotenzen-Master
      case 'u_potenzen_bounty_proof':
      case 'u_potenzen_bounty_heron':
      case 'u_potenzen_bounty_science': return []; // Bounty-only units
      // Quadratische Funktionen
      case 'u_quadratisch_01': return Array.from({ length: 4 }, (_, i) => createParabelBasicsQuest(i, seed));
      case 'u_quadratisch_02': return Array.from({ length: 5 }, (_, i) => createScheitelpunktQuest(i, seed));
      case 'u_quadratisch_03': return Array.from({ length: 4 }, (_, i) => createStreckungQuest(i, seed));
      case 'u_quadratisch_04': return Array.from({ length: 3 }, (_, i) => createFormTransformQuest(i, seed));
      case 'u_quadratisch_05': return Array.from({ length: 3 }, (_, i) => createFormTransformQuest(i + 3, seed)); // Mehr Umwandlungsaufgaben
      case 'u_quadratisch_06': return Array.from({ length: 4 }, (_, i) => createNullstellenQuest(i, seed));
      case 'u_quadratisch_07': return Array.from({ length: 5 }, (_, i) => createAnwendungQuest(i, seed)); // Anwendungsaufgaben als Standard-Quest
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
      context: 'Mathematische Aussage über die Beziehung zwischen Quadraten und Rechtecken. Du kannst Coins setzen, um deine Antwort zu verstärken.',
      given: [
        'Die Aussage lautet: "Jedes Quadrat ist automatisch auch ein Rechteck".',
        'Ein Quadrat hat: vier rechte Winkel, parallele Gegenseiten, vier gleich lange Seiten.',
        'Ein Rechteck hat: vier rechte Winkel, parallele Gegenseiten (Seitenlängen können unterschiedlich sein).',
        'Wichtig: Bei falscher Antwort verlierst du deinen Einsatz. Bei richtiger Antwort erhältst du zusätzliche Coins.'
      ],
      asked: [
        'Ist die Aussage richtig oder falsch?',
        'Wie viele Coins möchtest du setzen? (10, 20 oder 50 Coins)'
      ],
      instructions: 'Wähle deine Antwort und setze Coins. Bei richtiger Antwort erhältst du zusätzliche Coins, bei falscher verlierst du deinen Einsatz.',
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
        expl: 'Eine Schallplatte ist ein perfekter Kreis. Alle Punkte auf dem Rand sind gleich weit vom Mittelpunkt entfernt.',
        context: 'Geometrische Formen in der Realität: Eine Schallplatte ist eine runde Scheibe.',
        given: [
          'Eine klassische Schallplatte ist eine runde Scheibe.',
          'Sie hat einen Mittelpunkt und alle Punkte auf dem Rand sind gleich weit vom Mittelpunkt entfernt.',
          'Die Form ist gleichmäßig rund ohne Ecken.'
        ],
        asked: ['Welche geometrische Form beschreibt eine Schallplatte am besten?'],
        instructions: 'Wähle die geometrische Form, die eine Schallplatte am besten beschreibt.',
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
        q: "Die markierte Wandfläche für das Graffiti. Welche Form soll hier gefüllt werden? (Tipp: Prüfe die Winkel - alle vier Winkel sind 90°.)",
        ans: 'rect',
        expl: 'Die Fläche hat vier rechte Winkel. Es ist ein Rechteck. Auch wenn die Wand schräg gezeichnet ist, sind alle vier Winkel 90°.',
        context: 'Geometrische Formen in der Realität: Eine Wandfläche für Graffiti.',
        given: [
          'Eine Wandfläche soll für Graffiti gestaltet werden.',
          'Die Wand hat vier Ecken und vier Seiten.',
          'Alle vier Winkel sind rechte Winkel (90°).',
          'Gegenüberliegende Seiten sind parallel und gleich lang.'
        ],
        asked: ['Welche geometrische Form hat diese Wandfläche?'],
        instructions: 'Achte auf die Winkel: Alle vier Winkel sind 90° (rechte Winkel).',
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
        q: "Flaschenwurf: Welcher Abwurfwinkel ist stumpf (>90°)?",
        given: [
          'Graue Linie = Boden. Die bunten Strahlen zeigen mögliche Wurfarme.',
          'Der farbige Winkel markiert den Öffnungswinkel zwischen Boden und Arm.'
        ],
        asked: [
          'Tippe den Winkel, der größer als 90° ist.'
        ],
        data: [
          createAngleVisualOption('a', 45, 'Spitz (<90°)', {
            baseLabel: 'Boden',
            rayLabel: 'Wurf',
            rayColor: '#22c55e',
            arcs: [{ angle: 45, label: '45°', color: 'rgba(34,197,94,0.35)', labelFontSize: 16, labelColor: '#166534' }],
            context: '45° Abwurf'
          }),
          createAngleVisualOption('b', 90, 'Recht (90°)', {
            baseLabel: 'Boden',
            rayLabel: 'Wurf',
            rayColor: '#facc15',
            arcs: [{ angle: 90, label: '90°', color: 'rgba(251,191,36,0.35)', labelFontSize: 16, labelColor: '#854d0e' }],
            context: '90° Abwurf'
          }),
          createAngleVisualOption('c', 135, 'Stumpf (>90°)', {
            baseLabel: 'Boden',
            rayLabel: 'Wurf',
            rayColor: '#f97316',
            arcs: [{ angle: 135, label: '135°', color: 'rgba(249,115,22,0.35)', labelFontSize: 16, labelColor: '#9a3412' }],
            context: '135° Abwurf'
          })
        ],
        ans: 'c',
        expl: 'Ein stumpfer Winkel ist weiter geöffnet als ein rechter Winkel (größer als 90 Grad).'
      },
      {
        q: "Wandstütz-Check: Welcher Winkel ist spitz (<90°)?",
        given: [
          'Graue Linie = Boden, dunkle Linie = Wand.',
          'Der farbige Strahl steht für deine Körperneigung.'
        ],
        asked: [
          'Wähle den spitzen Winkel (<90°).'
        ],
        data: [
          createAngleVisualOption('a', 60, 'Spitz', {
            includeWall: true,
            wallLabel: 'Wand',
            baseLabel: 'Boden',
            rayLabel: 'Neigung',
            rayColor: '#22c55e',
            arcs: [{ angle: 60, label: '60°', color: 'rgba(34,197,94,0.35)', labelFontSize: 16, labelColor: '#166534' }],
            context: '60° Neigung'
          }),
          createAngleVisualOption('b', 90, 'Recht', {
            includeWall: true,
            wallLabel: 'Wand',
            baseLabel: 'Boden',
            rayLabel: 'Neigung',
            rayColor: '#facc15',
            arcs: [{ angle: 90, label: '90°', color: 'rgba(251,191,36,0.35)', labelFontSize: 16, labelColor: '#854d0e' }],
            context: '90° Neigung'
          }),
          createAngleVisualOption('c', 120, 'Stumpf', {
            includeWall: true,
            wallLabel: 'Wand',
            baseLabel: 'Boden',
            rayLabel: 'Neigung',
            rayColor: '#f97316',
            arcs: [{ angle: 120, label: '120°', color: 'rgba(249,115,22,0.35)', labelFontSize: 16, labelColor: '#9a3412' }],
            context: '120° Neigung'
          })
        ],
        ans: 'a',
        expl: 'Ein spitzer Winkel ist kleiner als 90 Grad – perfekt zum Anlehnen!'
      }
    ];
    const selected = tasks[index % tasks.length];

    return {
      id,
      type: 'visualChoice',
      question: selected.q,
      visualData: selected.data,
      correctAnswer: selected.ans,
      explanation: selected.expl,
      given: selected.given,
      asked: selected.asked
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
        q: "Ein Trapez hat genau zwei parallele Seiten. Welche Aussage ist richtig?",
        context: 'Definition und Eigenschaften von Trapezen: Ein Trapez ist ein Viereck mit mindestens zwei parallelen Seiten.',
        given: [
          'Ein Trapez ist ein Viereck mit mindestens zwei parallelen Seiten.',
          'Es hat genau zwei parallele Seiten (nicht vier wie ein Parallelogramm).',
          'Die anderen beiden Seiten sind nicht parallel.'
        ],
        asked: ['Welche der folgenden Aussagen über Trapeze ist richtig?'],
        instructions: 'Überlege: Ein Trapez hat nur zwei parallele Seiten. Kann es trotzdem rechte Winkel haben?',
        o: ["Jedes Trapez ist auch ein Parallelogramm.", "Ein Trapez kann rechte Winkel haben.", "Ein Trapez hat immer vier gleich lange Seiten.", "Ein Trapez ist immer ein Rechteck."],
        a: 1,
        e: "Ein Trapez kann durchaus rechte Winkel haben (rechtwinkliges Trapez). Es hat aber nur zwei parallele Seiten, nicht vier wie ein Parallelogramm. Ein Trapez mit rechten Winkeln heißt rechtwinkliges Trapez."
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
        context: 'Geometrische Formen in der Realität: Eine Kreditkarte ist eine rechteckige Karte.',
        given: [
          'Eine typische Kreditkarte hat die Form einer rechteckigen Karte.',
          'Sie hat vier Ecken und vier Seiten.',
          'Gegenüberliegende Seiten sind parallel und gleich lang.',
          'Alle vier Winkel sind rechte Winkel (90°).',
          'Hinweis: Abgerundete Ecken ändern die grundlegende geometrische Form nicht.'
        ],
        asked: ['Welche geometrische Form beschreibt eine Kreditkarte am besten?'],
        instructions: 'Auch wenn die Ecken abgerundet sind, bleibt die grundlegende Form erhalten.',
        o: ["Raute", "Rechteck", "Trapez", "Drachenviereck"],
        a: 1,
        e: "Kreditkarten sind Rechtecke. Sie haben vier rechte Winkel und gegenüberliegende Seiten sind parallel. Abgerundete Ecken ändern die grundlegende geometrische Form nicht."
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
      const alpha = getRandomInt(110, 140);
      const beta = 180 - alpha;
      const scene = createAngleScene(alpha, {
        baseLabel: 'Bodenlinie',
        rayLabel: 'Strahl',
        rayColor: '#f97316',
        arcs: [
          { angle: beta, label: 'β = ?', color: 'rgba(59,130,246,0.35)', clockwise: true, labelFontSize: 16, labelColor: '#1e40af' },
          { angle: alpha, label: `α = ${alpha}°`, color: 'rgba(249,115,22,0.35)', labelFontSize: 16, labelColor: '#9a3412' }
        ],
        referenceAngle: alpha
      });
      const supportVisual = createSupportVisualFromScene(
        scene,
        'Orange Winkel α ist gegeben. Blauer Winkel β liegt direkt neben α (Nebenwinkel).'
      );
      return {
        id,
        type: 'input',
        question: 'Nebenwinkel auf der Bodenlinie',
        given: [
          'Graue Linie = Boden. Beide Winkel liegen auf derselben Geraden.',
          `Der orange Winkel α = ${alpha}° ist bekannt.`,
          'Der blaue Winkel β liegt direkt daneben (Nebenwinkel).'
        ],
        asked: ['Berechne β in Grad.'],
        instructions: 'Nebenwinkel ergänzen sich zu 180° (α + β = 180°).',
        supportVisual,
        correctAnswer: beta.toString(),
        explanation: 'Nebenwinkel an einer Geraden ergänzen sich immer zu 180°.',
        placeholder: 'Grad...'
      };
    } else if (type === 1) {
      const scene = createAngleScene(45, {
        baseLabel: 'Linie A',
        rayLabel: 'Linie B',
        rayColor: '#6366f1',
        arcs: [
          { angle: 45, label: 'α = 45°', color: 'rgba(99,102,241,0.35)', labelFontSize: 16, labelColor: '#4338ca' },
          { angle: 45, label: 'α (gegenüber)', color: 'rgba(34,197,94,0.35)', clockwise: true, labelFontSize: 16, labelColor: '#166534' }
        ],
        referenceAngle: 45
      });
      const supportVisual = createSupportVisualFromScene(
        scene,
        'Gegenüberliegende (scheitelnde) Winkel haben dieselbe Farbe.'
      );
      const mirrorRad = (scene.referenceAngle + 180) * (Math.PI / 180);
      const [mirrorX, mirrorY] = polarPoint(scene.origin.x, scene.origin.y, scene.rayLength, mirrorRad);
      supportVisual.elements.unshift({
        type: 'line',
        x1: scene.origin.x,
        y1: scene.origin.y,
        x2: mirrorX,
        y2: mirrorY,
        stroke: scene.rays[0].stroke,
        strokeWidth: scene.rays[0].strokeWidth,
        dashed: true
      });
      return {
        id,
        type: 'choice',
        question: 'Scheitelwinkel beim Scheinwerfer',
        context: 'Winkelbeziehungen: Scheitelwinkel entstehen, wenn sich zwei Geraden schneiden.',
        given: [
          'Zwei Geraden schneiden sich in einem Punkt.',
          'Der gegebene Winkel α = 45° liegt an einer der Geraden.',
          'Der gesuchte Winkel liegt direkt gegenüber (Scheitelwinkel).',
          'Scheitelwinkel liegen sich gegenüber am Schnittpunkt der Geraden.'
        ],
        asked: ['Wie groß ist der Scheitelwinkel zu α = 45°?'],
        instructions: 'Scheitelwinkel liegen sich gegenüber und teilen sich denselben Scheitelpunkt (den Schnittpunkt der Geraden) – sie sind immer exakt gleich groß.',
        supportVisual,
        options: ["45°", "90°", "135°", "180°"],
        correctAnswer: 0,
        explanation: 'Scheitelwinkel liegen sich gegenüber und sind immer exakt gleich groß. Da α = 45° gegeben ist, ist auch der Scheitelwinkel 45°.'
      };
    } else {
      const alpha = getRandomInt(20, 60);
      const beta = 90 - alpha;
      const supportVisual = createRightTriangleSupportVisual(alpha);
      return {
        id,
        type: 'input',
        question: 'Rampe im rechtwinkligen Dreieck',
        context: 'Rechtwinkliges Dreieck: Eine Rampe lehnt an einer Wand. Der Winkel zwischen Rampe und Boden ist gegeben.',
        given: [
          'Ein rechtwinkliges Dreieck: Boden (waagerecht), Wand (senkrecht), Rampe (schräg).',
          'Der rechte Winkel (90°) liegt zwischen Boden und Wand.',
          `Der Winkel α = ${alpha}° liegt zwischen Boden und Rampe (unten).`,
          'Der gesuchte Winkel β liegt zwischen Rampe und Wand (oben).',
          'In einem rechtwinkligen Dreieck gilt: Die beiden spitzen Winkel ergeben zusammen 90°.'
        ],
        asked: [
          'Berechne den Winkel β in Grad (nur die Zahl, ohne Einheit).',
          'Hinweis: α + β = 90°'
        ],
        instructions: 'In einem rechtwinkligen Dreieck gilt: α + β = 90°. Also β = 90° - α.',
        supportVisual,
        correctAnswer: beta.toString(),
        explanation: `In einem rechtwinkligen Dreieck müssen die beiden spitzen Winkel zusammen 90° ergeben. Da α = ${alpha}° gegeben ist, gilt: β = 90° - ${alpha}° = ${beta}°.`,
        placeholder: 'Grad (nur Zahl)',
        validator: { type: 'numeric', numericAnswer: beta }
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
     // Verschiedene Werte für verschiedene Indizes, um Duplikate zu vermeiden
     const values = [3, 4, 5, 6, 7];
     const a = values[index % values.length];
     return {
        id, type: 'input',
        question: `Eine Box: ${a}dm x ${a}dm x ${a}dm. Volumen in Liter?`,
        given: [
          `Ein Würfel hat die Kantenlänge ${a} dm.`,
          '1 dm³ = 1 Liter.'
        ],
        asked: [
          'Berechne das Volumen in Liter.'
        ],
        correctAnswer: (a * a * a).toString(),
        explanation: `Volumen = a · a · a = ${a} · ${a} · ${a} = ${a * a * a} Liter.`,
        placeholder: 'Liter'
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
      question: "Haus der Vierecke: Klassifikation",
      given: [
        'Du siehst 5 geometrische Figuren (Quadrat, Rechteck, Raute, Parallelogramm, Trapez).',
        '5 Kategorien stehen zur Verfügung, die eine Hierarchie bilden.'
      ],
      asked: [
        'Ordne jede Figur der passendsten Kategorie zu.',
        'Hinweis: Eine Figur kann zu mehreren Kategorien gehören (z.B. Quadrat → Quadrat, Rechteck, Raute, Parallelogramm).'
      ],
      instructions: 'Nutze den Dropdown-Modus für absolute Zuverlässigkeit oder wechsle zu Drag & Drop für interaktive Zuordnung. Mehrere Zuordnungen pro Figur sind möglich.',
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
      { correctAngle: 90, label: 'rechter Winkel', color: '#f97316', arc: 'rgba(249,115,22,0.35)' },
      { correctAngle: 45, label: 'spitzer Winkel', color: '#22c55e', arc: 'rgba(34,197,94,0.35)' },
      { correctAngle: 135, label: 'stumpfer Winkel', color: '#facc15', arc: 'rgba(250,204,21,0.35)' }
    ];
    const selected = angles[index % angles.length];
    const scene = createAngleScene(selected.correctAngle, {
      baseLabel: 'Boden',
      rayLabel: 'Strahl',
      rayColor: selected.color,
      arcs: [{ angle: selected.correctAngle, label: `${selected.correctAngle}°`, color: selected.arc, labelFontSize: 16, labelColor: '#0f172a' }],
      referenceAngle: selected.correctAngle
    });

    return {
      id,
      type: 'angleMeasure',
      question: `Messe den markierten ${selected.label}.`,
      given: [
        'Graue Linie = Bezugslinie (Boden).',
        'Der farbige Strahl bildet den Winkel zum Boden.'
      ],
      asked: ['Bewege Maus oder Finger über den Scheitelpunkt und gib den gemessenen Winkel in Grad an (nur Zahl).'],
      instructions: 'Tippfehler-Toleranz: ±5°. Du kannst auch direkt die Zahl eintragen.',
      angleData: {
        path: scene.path,
        correctAngle: selected.correctAngle,
        baseLine: scene.baseLine,
        wallLine: scene.wallLine,
        helperLines: scene.rays,
        angleArcs: scene.arcs.map(arc => ({
          path: arc.path,
          fill: arc.fill,
          opacity: arc.opacity,
          stroke: arc.stroke,
          strokeDasharray: arc.strokeDasharray
        })),
        referenceLabels: scene.labels
      },
      correctAnswer: selected.correctAngle.toString(),
      explanation: `Der Winkel beträgt ${selected.correctAngle}°. ${selected.correctAngle === 90 ? 'Das ist ein rechter Winkel!' : selected.correctAngle < 90 ? 'Das ist ein spitzer Winkel.' : 'Das ist ein stumpfer Winkel.'}`
    };
  },

  // --- NEW: Slider Transformation Task ---
  // --- NEW: Scaling Factor Task (ersetzt defekten Slider) ---
  createScalingFactorTask(index: number, seed: number): Task {
    const id = `u5-scaling-${index}-${seed}`;
    const tasks = [
      {
        sideLength: 3,
        factor: 2,
        shape: 'Quadrat'
      },
      {
        sideLength: 5,
        factor: 2,
        shape: 'Quadrat'
      },
      {
        sideLength: 4,
        factor: 1.5,
        shape: 'Quadrat'
      },
      {
        sideLength: 6,
        factor: 3,
        shape: 'Quadrat'
      }
    ];
    const selected = tasks[index % tasks.length];
    const newLength = selected.sideLength * selected.factor;

    return {
      id,
      type: 'input',
      question: `Skalierungsfaktor verstehen`,
      given: [
        `Ein ${selected.shape} hat eine Seitenlänge von ${selected.sideLength} cm.`,
        `Es wird mit dem Faktor k = ${selected.factor} vergrößert.`
      ],
      asked: [
        'Wie lang ist die neue Seitenlänge?'
      ],
      instructions: 'Beim Skalieren werden alle Längen mit dem Faktor k multipliziert.',
      correctAnswer: newLength.toString(),
      explanation: `Richtig! Bei einer Vergrößerung mit k = ${selected.factor} wird jede Seitenlänge mit ${selected.factor} multipliziert: ${selected.sideLength} cm · ${selected.factor} = ${newLength} cm`,
      placeholder: 'cm'
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
      context: 'Winkelbeziehungen bei parallelen Geraden: Zwei parallele Geraden werden von einer Querlinie geschnitten.',
      given: [
        'Zwei parallele Geraden werden von einer Querlinie (Transversale) geschnitten.',
        `Ein Winkel an der Schnittstelle beträgt ${givenAngle}°.`,
        'Winkelbeziehungen: Nebenwinkel ergänzen sich zu 180°, Scheitelwinkel sind gleich groß, Stufenwinkel an parallelen Geraden sind gleich groß.'
      ],
      asked: [
        `Berechne alle weiteren Winkel in Grad.`,
        'Gib die Winkel durch Komma getrennt ein (z.B. 142, 38, 142).'
      ],
      instructions: 'Nebenwinkel: 180° - gegebener Winkel. Scheitelwinkel: gleich groß wie gegebener Winkel. Stufenwinkel: gleich groß wie entsprechender Winkel.',
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
      const volume = Math.PI * r * r * h;
      const roundedVolume = Math.round(volume);
      return {
        id,
        type: 'input',
        question: `Zylindervolumen berechnen`,
        given: [
          `Ein Zylinder hat den Radius r = ${r} cm und die Höhe h = ${h} cm.`,
          'Verwende π ≈ 3,14.'
        ],
        asked: [
          'Berechne das Volumen in cm³.',
          'Runde auf ganze Zahl.'
        ],
        instructions: 'Formel: V = π · r² · h. Runde das Ergebnis auf die nächste ganze Zahl.',
        correctAnswer: roundedVolume.toString(),
        explanation: `Volumen V = πr²h = 3,14 × ${r}² × ${h} = 3,14 × ${r*r} × ${h} = ${volume.toFixed(2)} cm³ ≈ ${roundedVolume} cm³ (gerundet)`,
        placeholder: 'cm³',
        validator: {
          type: 'numericTolerance',
          numericAnswer: roundedVolume,
          tolerance: 1 // ±1 für Rundung
        }
      };
    } else {
      // Surface
      const surface = 2 * Math.PI * r * r + 2 * Math.PI * r * h;
      const roundedSurface = Math.round(surface);
      return {
        id,
        type: 'input',
        question: `Zylinderoberfläche berechnen`,
        given: [
          `Ein Zylinder hat den Radius r = ${r} cm und die Höhe h = ${h} cm.`,
          'Verwende π ≈ 3,14.'
        ],
        asked: [
          'Berechne die Oberfläche in cm².',
          'Runde auf ganze Zahl.'
        ],
        instructions: 'Formel: O = 2πr² + 2πrh. Runde das Ergebnis auf die nächste ganze Zahl.',
        correctAnswer: roundedSurface.toString(),
        explanation: `Oberfläche O = 2πr² + 2πrh = 2×3,14×${r}² + 2×3,14×${r}×${h} = ${surface.toFixed(2)} cm² ≈ ${roundedSurface} cm² (gerundet)`,
        placeholder: 'cm²',
        validator: {
          type: 'numericTolerance',
          numericAnswer: roundedSurface,
          tolerance: 1 // ±1 für Rundung
        }
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
      placeholder: 'cm³',
      supportVisual: {
        viewBox: '0 0 220 160',
        caption: 'Würfel (blau) + Quader (orange).',
        elements: [
          { type: 'path', d: rectPath(40, 70, 70, 70), fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6', strokeWidth: 3 },
          { type: 'path', d: rectPath(110, 90, 70, 50), fill: 'rgba(249,115,22,0.2)', stroke: '#f97316', strokeWidth: 3 },
          { type: 'text', text: `${a} cm`, x: 75, y: 65, color: '#1e3a8a', fontSize: 12 },
          { type: 'text', text: `${b} cm`, x: 145, y: 85, color: '#9a3412', fontSize: 12 }
        ]
      }
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

  // === NEW: Textvollständige Zusatz-Quests (ohne Bildabhängigkeit) ===
  createU1RegalbrettTask(seed: number): Task {
    const id = `u1-regal-${seed}`;
    return {
      id,
      type: 'choice',
      question: 'Verzogenes Regalbrett klassifizieren',
      context: 'Ein Regalbrett ist leicht verzogen, bildet aber weiterhin ein Viereck.',
      given: [
        'Vier Seiten, gegenüberliegende Seiten sind parallel.',
        'Alle vier Seiten sind gleich lang.',
        'Die Winkel sind paarweise gleich: zwei Winkel = 110°, die anderen beiden = 70°.',
        'Kein Winkel ist 90° (nicht rechtwinklig).'
      ],
      asked: [
        'Welche Figurenklasse beschreibt das Regalbrett korrekt?'
      ],
      instructions: 'Antwortformat: Dropdown, wähle genau eine Option.',
      options: ['Quadrat', 'Rechteck', 'Raute', 'Parallelogramm', 'Trapez'],
      correctAnswer: 2,
      explanation: 'Gleiche Seiten + parallele Gegenseiten → Raute. Keine rechten Winkel, daher kein Rechteck/Quadrat.'
    };
  },

  createParallelClearTextTask(seed: number): Task {
    const id = `u2-parallel-clarity-${seed}`;
    const givenAngle = 128;
    const adjacent = 180 - givenAngle; // 52
    return {
      id,
      type: 'input',
      question: 'Parallele Geraden + Querlinie (klarer Textfall)',
      context: 'Zwei parallele Straßen werden von einer schrägen Querstraße geschnitten.',
      given: [
        'Die beiden Straßen sind parallel.',
        `An einem Schnittpunkt ist ein Innenwinkel angegeben: ${givenAngle}°.`
      ],
      asked: [
        'a) Nebenwinkel in Grad',
        'b) Scheitelwinkel in Grad',
        'c) Ein Stufenwinkel in Grad'
      ],
      instructions: 'Antwortformat: drei Felder, nur Zahl ohne Einheit.',
      multiInputFields: [
        { id: 'adjacent', label: 'a) Nebenwinkel (°)', validator: { type: 'numeric', numericAnswer: adjacent } },
        { id: 'vertical', label: 'b) Scheitelwinkel (°)', validator: { type: 'numeric', numericAnswer: givenAngle } },
        { id: 'corresponding', label: 'c) Stufenwinkel (°)', validator: { type: 'numeric', acceptedNumbers: [givenAngle, adjacent] } }
      ],
      correctAnswer: JSON.stringify({ adjacent: adjacent.toString(), vertical: givenAngle.toString(), corresponding: givenAngle.toString() }),
      explanation: `Nebenwinkel ergänzen zu 180° → ${adjacent}°. Scheitelwinkel = ${givenAngle}°. Stufenwinkel entsprechen dem gegebenen Winkel (${givenAngle}°) oder dem Ergänzungswinkel (${adjacent}°), je nach Lage.`
    };
  },

  createFliesenLTask(seed: number): Task {
    const id = `u3-fliesen-${seed}`;
    const areaA = 2.4 * 1.6; // 3.84
    const areaB = 1.0 * 1.6; // 1.6
    const total = +(areaA + areaB).toFixed(2); // 5.44
    return {
      id,
      type: 'input',
      question: 'Fliesenfläche in L-Form (ohne Bild)',
      context: 'Badezimmerboden als L-Form, zerlegt in zwei Rechtecke.',
      given: [
        'Rechteck A: 2,4 m × 1,6 m.',
        'Rechteck B schließt direkt an: 1,0 m × 1,6 m.',
        'Beide liegen auf einer Ebene, keine Überlappung.'
      ],
      asked: ['Gesamtfläche in Quadratmetern (m²).'],
      instructions: 'Antwortformat: eine Zahl, ohne Einheit, auf zwei Nachkommastellen gerundet.',
      correctAnswer: total.toString(),
      explanation: `A = 2,4 · 1,6 = ${areaA.toFixed(2)} m². B = 1,0 · 1,6 = ${areaB.toFixed(2)} m². Summe = ${total.toFixed(2)} m².`
      ,
      supportVisual: {
        viewBox: '0 0 220 160',
        caption: 'Zwei Rechtecke bilden die L-Form.',
        elements: [
          { type: 'path', d: rectPath(40, 40, 120, 60), fill: 'rgba(99,102,241,0.2)', stroke: '#6366f1', strokeWidth: 3 },
          { type: 'path', d: rectPath(160, 80, 40, 60), fill: 'rgba(249,115,22,0.25)', stroke: '#f97316', strokeWidth: 3 },
          { type: 'text', text: '2,4 m', x: 100, y: 35, color: '#0f172a', fontSize: 12 },
          { type: 'text', text: '1,6 m', x: 30, y: 80, color: '#0f172a', fontSize: 12, anchor: 'end' },
          { type: 'text', text: '1,0 m', x: 190, y: 75, color: '#0f172a', fontSize: 12, anchor: 'middle' }
        ]
      }
    };
  },

  createCylinderLiterTask(seed: number): Task {
    const id = `u4-zylinder-liter-${seed}`;
    const radius = 0.35;
    const height = 0.9;
    const volumeCubicMeters = 3.14 * radius * radius * height; // ≈0.346185
    const liters = Math.round(volumeCubicMeters * 1000); // ≈346 L
    return {
      id,
      type: 'input',
      question: 'Regenfass: Zylindervolumen in Litern',
      context: 'Regenfass als Zylinder.',
      given: [
        `Radius r = ${radius} m, Höhe h = ${height} m.`,
        'π ≈ 3,14. 1 m³ = 1000 Liter.'
      ],
      asked: ['Volumen in Litern (auf ganze Zahl runden).'],
      instructions: 'Antwortformat: eine ganze Zahl, ohne Einheit. Toleranz ±1 Liter.',
      correctAnswer: liters.toString(),
      explanation: `V = π · r² · h = 3,14 · ${radius}² · ${height} ≈ ${(volumeCubicMeters).toFixed(6)} m³ ≈ ${liters} L.`,
      validator: { type: 'numericTolerance', numericAnswer: liters, tolerance: 1 }
    };
  },

  createMassstabDualTask(seed: number): Task {
    const id = `u5-massstab-dual-${seed}`;
    const mapCm = 3.2;
    const factor = 25000;
    const meters = (mapCm * factor) / 100; // 800 m
    const km = meters / 1000; // 0.8 km
    return {
      id,
      type: 'input',
      question: 'Maßstab doppelt prüfen (m und km)',
      context: 'Stadtplan mit Maßstab 1 : 25 000.',
      given: [
        `Gemessene Strecke auf der Karte: ${mapCm} cm.`,
        'Maßstab: 1 : 25 000.',
        '1 m = 100 cm, 1 km = 1000 m.'
      ],
      asked: [
        'a) Reale Strecke in Metern',
        'b) Reale Strecke in Kilometern'
      ],
      instructions: 'Antwortformat: zwei Felder, nur Zahl (erst Meter, dann Kilometer). Tipp: Immer zuerst cm → m umrechnen und anschließend von m auf km wechseln.',
      multiInputFields: [
        { id: 'meters', label: 'a) Meter', validator: { type: 'numeric', numericAnswer: meters } },
        { id: 'kilometers', label: 'b) Kilometer', validator: { type: 'numericTolerance', numericAnswer: km, tolerance: 0.01 } }
      ],
      correctAnswer: `${meters};${km}`,
      explanation: `${mapCm} cm · 25 000 = ${meters} m. Das sind ${km} km.`
    };
  },

  createParkPythagorasTask(seed: number): Task {
    const id = `u6-park-pyth-${seed}`;
    const east = 120;
    const north = 50;
    const distance = Math.round(Math.sqrt(east * east + north * north)); // 130
    return {
      id,
      type: 'input',
      question: 'Drohnenflug über Park (Pythagoras)',
      context: 'Rechtwinklige Strecke: erst Ost, dann Nord.',
      given: [
        `Strecke AB: ${east} m nach Osten.`,
        `Strecke BC: ${north} m nach Norden, rechter Winkel bei B.`
      ],
      asked: ['Gesuchte Luftlinie AC in Metern (nur Zahl).'],
      instructions: 'Antwortformat: eine ganze Zahl, ohne Einheit.',
      correctAnswer: distance.toString(),
      explanation: `c² = ${east}² + ${north}² = ${east * east} + ${north * north} = ${east * east + north * north}. c = √${east * east + north * north} = ${distance} m.`,
      placeholder: 'Meter'
    };
  },

  // === NEUE PRÜFUNGSRELEVANTE AUFGABEN (Mathegym-Lehrplan 9. Klasse NRW) ===

  // --- Kreissektor (u3) ---
  createKreissektorTask(index: number, seed: number): Task {
    const id = `u3-kreissektor-${index}-${seed}`;
    const r = getRandomInt(5, 10);
    const alpha = getRandomInt(60, 150); // Winkel in Grad
    const sektorArea = (Math.PI * r * r * alpha) / 360;
    return {
      id,
      type: 'input',
      question: 'Kreissektor berechnen',
      context: 'Ein Tortenstück (Kreissektor) soll berechnet werden.',
      given: [
        `Kreisradius r = ${r} cm.`,
        `Mittelpunktswinkel α = ${alpha}°.`,
        'Verwende π ≈ 3,14.'
      ],
      asked: [
        'Berechne den Flächeninhalt des Kreissektors in cm² (auf ganze Zahl runden).'
      ],
      instructions: 'Formel: A = (π · r² · α) / 360°',
      correctAnswer: Math.round(sektorArea).toString(),
      explanation: `A = (π · r² · α) / 360° = (3,14 · ${r}² · ${alpha}) / 360 ≈ ${sektorArea.toFixed(2)} cm² ≈ ${Math.round(sektorArea)} cm²`,
      placeholder: 'cm²',
      validator: { type: 'numericTolerance', numericAnswer: Math.round(sektorArea), tolerance: 1 }
    };
  },

  // --- Kreisbogen (u3) ---
  createKreisbogenTask(index: number, seed: number): Task {
    const id = `u3-kreisbogen-${index}-${seed}`;
    const r = getRandomInt(4, 12);
    const alpha = getRandomInt(45, 120); // Winkel in Grad
    const bogenLength = (2 * Math.PI * r * alpha) / 360;
    return {
      id,
      type: 'input',
      question: 'Kreisbogen berechnen',
      context: 'Ein gekrümmter Wegabschnitt (Kreisbogen) soll gemessen werden.',
      given: [
        `Kreisradius r = ${r} m.`,
        `Mittelpunktswinkel α = ${alpha}°.`,
        'Verwende π ≈ 3,14.'
      ],
      asked: [
        'Berechne die Länge des Kreisbogens in Metern (auf eine Nachkommastelle runden).'
      ],
      instructions: 'Formel: b = (2π · r · α) / 360°',
      correctAnswer: bogenLength.toFixed(1),
      explanation: `b = (2π · r · α) / 360° = (2 · 3,14 · ${r} · ${alpha}) / 360 ≈ ${bogenLength.toFixed(2)} m ≈ ${bogenLength.toFixed(1)} m`,
      placeholder: 'm',
      validator: { type: 'numericTolerance', numericAnswer: parseFloat(bogenLength.toFixed(1)), tolerance: 0.1 },
      supportVisual: {
        viewBox: '0 0 220 160',
        caption: 'Markierter Bogen zeigt α und Radius r.',
        elements: [
          { type: 'path', d: 'M 50 120 A 70 70 0 0 1 170 120', stroke: '#94a3b8', strokeWidth: 6, fill: 'none' },
          { type: 'path', d: 'M 50 120 L 110 60', stroke: '#6366f1', strokeWidth: 4 },
          { type: 'path', d: 'M 50 120 L 170 120', stroke: '#6366f1', strokeWidth: 4 },
          { type: 'path', d: 'M 110 60 A 70 70 0 0 1 170 120', stroke: '#f97316', strokeWidth: 6, fill: 'none' },
          { type: 'text', text: `r = ${r} m`, x: 70, y: 140, color: '#475569', fontSize: 12, anchor: 'start' },
          { type: 'text', text: `α = ${alpha}°`, x: 150, y: 80, color: '#f97316', fontSize: 14, anchor: 'end' }
        ]
      }
    };
  },

  // --- Zusammengesetzte Prismen (u4) ---
  createCompositePrismTask(index: number, seed: number): Task {
    const id = `u4-composite-prism-${index}-${seed}`;
    const a = getRandomInt(3, 5);
    const b = getRandomInt(4, 6);
    const h1 = getRandomInt(5, 8);
    const h2 = getRandomInt(3, 5);
    // Zusammengesetztes Prisma: Quader + Dreiecksprisma
    const volumeQuader = a * a * h1;
    const volumeDreieck = (a * b * h2) / 2;
    const totalVolume = volumeQuader + volumeDreieck;
    return {
      id,
      type: 'input',
      question: 'Zusammengesetztes Prisma: Volumen',
      context: 'Ein Gebäudeteil besteht aus einem quaderförmigen Unterbau und einem dreieckigen Dach (Dreiecksprisma).',
      given: [
        `Unterbau (Quader): Grundfläche ${a} cm × ${a} cm, Höhe ${h1} cm.`,
        `Dach (Dreiecksprisma): Grundfläche ist ein rechtwinkliges Dreieck mit Katheten ${a} cm und ${b} cm, Höhe ${h2} cm.`,
        'Die beiden Körper sind an der Grundfläche verbunden.'
      ],
      asked: [
        'Berechne das Gesamtvolumen in cm³.'
      ],
      instructions: 'Volumen = Quader-Volumen + Dreiecksprisma-Volumen',
      correctAnswer: totalVolume.toString(),
      explanation: `V_gesamt = V_Quader + V_Dreieck = ${a} · ${a} · ${h1} + (${a} · ${b} · ${h2}) / 2 = ${volumeQuader} + ${volumeDreieck} = ${totalVolume} cm³`,
      placeholder: 'cm³',
      supportVisual: {
        viewBox: '0 0 220 160',
        caption: 'Unterbau (blau) + Dach (orange).',
        elements: [
          { type: 'path', d: rectPath(40, 80, 100, 60), fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6', strokeWidth: 3 },
          { type: 'path', d: `M 40 80 L 90 40 L 140 80 Z`, fill: 'rgba(249,115,22,0.2)', stroke: '#f97316', strokeWidth: 3 },
          { type: 'text', text: `${a} cm`, x: 90, y: 140, color: '#1e3a8a', fontSize: 12 },
          { type: 'text', text: `${h2} cm`, x: 150, y: 60, color: '#9a3412', fontSize: 12 }
        ]
      }
    };
  },

  // --- Umkehrung der Strahlensätze (u5) ---
  createStrahlensatzUmkehrungTask(index: number, seed: number): Task {
    const id = `u5-strahlensatz-umkehrung-${index}-${seed}`;
    const h1 = getRandomInt(160, 180);
    const h2 = getRandomInt(200, 240);
    const s1 = getRandomInt(180, 220);
    // Wenn h1/h2 = s1/s2, dann s2 = s1 * h2 / h1
    const s2 = Math.round((s1 * h2) / h1);
    return {
      id,
      type: 'input',
      question: 'Umkehrung des Strahlensatzes',
      context: 'Zwei parallele Geraden schneiden zwei Strahlen. Du kennst die Verhältnisse.',
      given: [
        `Erste Parallele: Abschnitt auf Strahl 1 = ${h1} cm, Abschnitt auf Strahl 2 = ${h2} cm.`,
        `Zweite Parallele: Abschnitt auf Strahl 1 = ${s1} cm (bekannt).`,
        'Die beiden Parallelen sind parallel zueinander.'
      ],
      asked: [
        'Berechne den Abschnitt der zweiten Parallele auf Strahl 2 (in cm, ganze Zahl).'
      ],
      instructions: 'Strahlensatz-Umkehrung: Wenn h1/h2 = s1/s2, dann s2 = s1 · h2 / h1',
      correctAnswer: s2.toString(),
      explanation: `Verhältnisgleichung: ${h1} / ${h2} = ${s1} / s₂. Umgestellt: s₂ = (${s1} · ${h2}) / ${h1} = ${s2} cm`,
      placeholder: 'cm'
    };
  },

  // --- Zentrische Streckung (u5) ---
  createZentrischeStreckungTask(index: number, seed: number): Task {
    const id = `u5-zentrische-streckung-${index}-${seed}`;
    const k = [2, 0.5, 3][index % 3];
    const originalLength = getRandomInt(4, 8);
    const streckzentrum = 'Z';
    const newLength = originalLength * k;
    const kText = k === 0.5 ? '0,5' : k.toString();
    return {
      id,
      type: 'input',
      question: 'Zentrische Streckung',
      context: `Eine Figur wird zentrisch gestreckt (Streckzentrum ${streckzentrum}).`,
      given: [
        `Streckfaktor k = ${kText}.`,
        `Ursprüngliche Länge einer Seite: ${originalLength} cm.`,
        `Alle Abstände vom Streckzentrum ${streckzentrum} werden mit k multipliziert.`
      ],
      asked: [
        'Wie lang ist die entsprechende Seite nach der Streckung (in cm)?'
      ],
      instructions: 'Neue Länge = ursprüngliche Länge · k',
      correctAnswer: newLength.toString(),
      explanation: `Zentrische Streckung: Neue Länge = ${originalLength} cm · ${kText} = ${newLength} cm`,
      placeholder: 'cm'
    };
  },

  // --- Ähnlichkeitssätze für Dreiecke (u5) ---
  createAehnlichkeitssaetzeTask(index: number, seed: number): Task {
    const id = `u5-aehnlichkeitssaetze-${index}-${seed}`;
    const saetze = [
      {
        q: 'Zwei Dreiecke haben zwei Seitenpaare im gleichen Verhältnis und den eingeschlossenen Winkel gleich. Welcher Ähnlichkeitssatz trifft zu?',
        o: ['SSS-Satz', 'SWS-Satz', 'WW-Satz', 'WSW-Satz'],
        a: 1,
        e: 'SWS-Satz: Zwei Seiten im gleichen Verhältnis + eingeschlossener Winkel gleich → ähnlich.'
      },
      {
        q: 'Zwei Dreiecke haben alle drei Winkel gleich. Welcher Ähnlichkeitssatz trifft zu?',
        o: ['SSS-Satz', 'SWS-Satz', 'WW-Satz', 'keiner'],
        a: 2,
        e: 'WW-Satz: Wenn alle Winkel gleich sind, sind die Dreiecke ähnlich (und die Seiten im gleichen Verhältnis).'
      },
      {
        q: 'Zwei Dreiecke haben alle drei Seitenpaare im gleichen Verhältnis. Welcher Ähnlichkeitssatz trifft zu?',
        o: ['SSS-Satz', 'SWS-Satz', 'WW-Satz', 'SSW-Satz'],
        a: 0,
        e: 'SSS-Satz: Wenn alle drei Seitenpaare im gleichen Verhältnis stehen, sind die Dreiecke ähnlich.'
      }
    ];
    const satz = saetze[index % saetze.length];
    return {
      id,
      type: 'choice',
      question: satz.q,
      context: 'Ähnlichkeitssätze für Dreiecke: Wann sind zwei Dreiecke ähnlich?',
      given: [
        'SSS-Satz: Alle drei Seitenpaare im gleichen Verhältnis.',
        'SWS-Satz: Zwei Seitenpaare im gleichen Verhältnis + eingeschlossener Winkel gleich.',
        'WW-Satz: Alle drei Winkel gleich (oder zwei Winkel, dann automatisch auch der dritte).'
      ],
      asked: [satz.q],
      instructions: 'Wähle den passenden Ähnlichkeitssatz.',
      options: satz.o,
      correctAnswer: satz.a,
      explanation: satz.e
    };
  },

  // --- Höhen- und Kathetensatz (u6) ---
  createHoehenKathetensatzTask(index: number, seed: number): Task {
    const id = `u6-hoehen-kathetensatz-${index}-${seed}`;
    const p = getRandomInt(3, 6); // Hypotenusenabschnitt 1
    const q = getRandomInt(4, 7); // Hypotenusenabschnitt 2
    const h = Math.sqrt(p * q); // Höhe
    const a = Math.sqrt(p * (p + q)); // Kathete a
    const taskType = index % 2;

    if (taskType === 0) {
      // Höhensatz: h² = p · q
      return {
        id,
        type: 'input',
        question: 'Höhensatz im rechtwinkligen Dreieck',
        context: 'In einem rechtwinkligen Dreieck ist die Höhe auf die Hypotenuse gegeben.',
        given: [
          'Hypotenuse ist in zwei Abschnitte geteilt:',
          `Abschnitt p = ${p} cm,`,
          `Abschnitt q = ${q} cm.`,
          'Die Höhe h steht senkrecht auf der Hypotenuse.'
        ],
        asked: [
          'Berechne die Höhe h mit dem Höhensatz (in cm, auf eine Nachkommastelle runden).'
        ],
        instructions: 'Höhensatz: h² = p · q, also h = √(p · q)',
        correctAnswer: h.toFixed(1),
        explanation: `Höhensatz: h² = p · q = ${p} · ${q} = ${p * q}. Also h = √${p * q} ≈ ${h.toFixed(2)} cm ≈ ${h.toFixed(1)} cm`,
        placeholder: 'cm',
        validator: { type: 'numericTolerance', numericAnswer: parseFloat(h.toFixed(1)), tolerance: 0.1 }
      };
    } else {
      // Kathetensatz: a² = p · c (oder b² = q · c)
      return {
        id,
        type: 'input',
        question: 'Kathetensatz im rechtwinkligen Dreieck',
        context: 'In einem rechtwinkligen Dreieck ist eine Kathete gesucht.',
        given: [
          `Hypotenusenabschnitt p = ${p} cm (unter der Kathete a).`,
          `Gesamte Hypotenuse c = ${p + q} cm.`,
          'Die Kathete a liegt am Punkt mit Abschnitt p.'
        ],
        asked: [
          'Berechne die Länge der Kathete a mit dem Kathetensatz (in cm, auf eine Nachkommastelle runden).'
        ],
        instructions: 'Kathetensatz: a² = p · c, also a = √(p · c)',
        correctAnswer: a.toFixed(1),
        explanation: `Kathetensatz: a² = p · c = ${p} · ${p + q} = ${p * (p + q)}. Also a = √${p * (p + q)} ≈ ${a.toFixed(2)} cm ≈ ${a.toFixed(1)} cm`,
        placeholder: 'cm',
        validator: { type: 'numericTolerance', numericAnswer: parseFloat(a.toFixed(1)), tolerance: 0.1 }
      };
    }
  },

  getBattleTasksForUnit(unitId: string, rounds: number = 3): Task[] {
    const pool = this.getTaskPool(unitId).filter(task =>
      ['input', 'choice', 'shorttext', 'visualChoice', 'boolean', 'wager', 'angleMeasure', 'sliderTransform'].includes(task.type)
    );
    const source = pool.length > 0 ? pool : this.getTaskPool(unitId);
    return shuffleArray<Task>(source).slice(0, rounds);
  }

};