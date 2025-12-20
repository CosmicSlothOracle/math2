
import { Task } from '../types';

const SHAPE_SYMBOLS = [
    { id: 'square', label: 'Quadrat', path: 'M 60,80 L 140,80 L 140,20 L 60,20 Z' },
    { id: 'rect', label: 'Rechteck', path: 'M 30,80 L 170,80 L 170,40 L 30,40 Z' },
    { id: 'rhombus', label: 'Raute', path: 'M 100,90 L 150,50 L 100,10 L 50,50 Z' },
    { id: 'trapezoid', label: 'Trapez', path: 'M 20,80 L 180,80 L 140,20 L 60,20 Z' },
    { id: 'parallelogram', label: 'Parallelogramm', path: 'M 30,80 L 170,80 L 190,20 L 50,20 Z' },
    { id: 'pentagon', label: 'Fünfeck', path: 'M 100,10 L 190,70 L 150,160 L 50,160 L 10,70 Z' },
    // Bizarre Formen für den Extra-Spaß
    { id: 'star', label: 'Stern-Viereck', path: 'M 100,10 L 120,50 L 180,60 L 120,70 L 100,110 L 80,70 L 20,60 L 80,50 Z' },
    { id: 'arrow', label: 'Giftpfeil', path: 'M 20,40 H 120 V 20 L 180,50 L 120,80 V 60 H 20 Z' },
    { id: 'lshape', label: 'L-Block', path: 'M 40,20 V 140 H 120 V 100 H 80 V 20 Z' },
    { id: 'cross', label: 'Hohles Kreuz', path: 'M 70,20 V 70 H 20 V 110 H 70 V 160 H 110 V 110 H 160 V 70 H 110 V 20 Z' }
];

export const TaskFactory = {
  getTasksForUnit(unitId: string, type: 'pre' | 'standard' | 'bounty'): Task[] {
    const seed = Date.now();
    switch (type) {
      case 'pre': return this.getPreTasks(unitId, seed);
      case 'standard': return this.getStandardTasks(unitId, seed);
      case 'bounty': return this.getBountyTasks(unitId, seed);
      default: return [];
    }
  },

  getPreTasks(unitId: string, seed: number): Task[] {
     if (unitId === 'u1') return [this.createShapeBanditTask(seed)];
     if (unitId === 'u2') return [this.createBottleTossTask(seed)];
     return [{
        id: `${unitId}-pre-gen`,
        type: 'choice',
        question: "Bist du bereit für das interaktive Training?",
        options: ["Ja!", "Logisch!"],
        correctAnswer: 0,
        explanation: "Training hilft dir, die Konzepte visuell zu verstehen."
     }];
  },

  createShapeBanditTask(seed: number): Task {
    return {
      id: `u1-bandit-${seed}`,
      type: 'interactive_alien_scanner', 
      question: "Zieh am Hebel des SHAPE BANDIT! Identifiziere danach alle Symbole.",
      interactiveData: {
          symbols: SHAPE_SYMBOLS
      },
      correctAnswer: 'ok',
      explanation: "Sehr gut! Du hast die geometrischen (und bizarren) Formen im Griff."
    };
  },

  createBottleTossTask(seed: number): Task {
      return {
          id: `u2-toss-${seed}`,
          type: 'interactive_laser_parcours', // Reuse visual container for training logic
          question: "Wirf die Flasche! Wenn du den Mülleimer verfehlst, bestimme den Aufprallwinkel.",
          interactiveData: {
              targetId: 'trashcan',
              rounds: 3
          },
          correctAnswer: 'ok',
          explanation: "Winkel bestimmen ist die Basis für Flugbahnen (und Architektur)!"
      };
  },

  getStandardTasks(unitId: string, seed: number): Task[] {
    if (unitId === 'u2') return [
        { id: 'u2-s1', type: 'input', question: "Wie nennt man Winkel, die sich zu 180° ergänzen?", correctAnswer: "Nebenwinkel", explanation: "Nebenwinkel liegen auf einer Geraden." },
        { id: 'u2-s2', type: 'choice', question: "Stufenwinkel an Parallelen sind immer...", options: ["Unterschiedlich", "Gleich groß", "Zusammen 90°"], correctAnswer: 1, explanation: "Parallelität erhält den Winkel." }
    ];
    return [
        { id: `${unitId}-s1`, type: 'choice', question: "Haus der Vierecke: Was ist jedes Quadrat auch?", options: ["Nur ein Trapez", "Ein Rechteck und eine Raute", "Nichts davon"], correctAnswer: 1, explanation: "Ein Quadrat erfüllt alle Bedingungen für Rechtecke und Rauten." }
    ];
  },

  getBountyTasks(unitId: string, seed: number): Task[] {
      return [
          { id: `${unitId}-b1`, type: 'shorttext', question: "Nenne das Viereck mit 4 gleich langen Seiten und keinen rechten Winkeln.", correctAnswer: "Raute", explanation: "Die Raute ist das verschobene Quadrat." }
      ];
  }
};
