import { Task, BattleScenario } from '../types';
import { TaskFactory } from './taskFactory';

export const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: 'speed_geometry',
    title: 'Speed Polygon Duel',
    tagline: '3 Formen · 45 Sekunden Fokus',
    description: 'Klassifiziere blitzschnell Vierecke, erkenne Eigenschaften und entscheide, wer zum Geodreieck greift.',
    unitId: 'u1',
    unitTitle: 'Figuren verstehen',
    stake: 25,
    rounds: 3,
    icon: '⚡',
    difficulty: 'Mittel',
    modifiers: ['Timer 45s', 'Keine Hints', 'Sofort-Feedback'],
    tags: ['Figuren', 'Grundlagen', 'Tempo'],
  },
  {
    id: 'angle_meltdown',
    title: 'Angle Meltdown',
    tagline: '4 Winkel · 1 Chance',
    description: 'Nebenwinkel, Scheitelwinkel und Thales – wer schneller begründet, kassiert den Pot.',
    unitId: 'u2',
    unitTitle: 'Winkel & Beziehungen',
    stake: 35,
    rounds: 4,
    icon: '📐',
    difficulty: 'Schwer',
    modifiers: ['±5° Toleranz', 'Auto-Hint gesperrt'],
    tags: ['Winkel', 'Beweis', 'Beziehungen'],
  },
  {
    id: 'volume_drop',
    title: 'Volume Drop',
    tagline: '2 Körper · hoher Einsatz',
    description: 'Berechne Mantel- und Volumenflächen gegen die Zeit. Fehler kosten sofort den Lauf.',
    unitId: 'u4',
    unitTitle: 'Körper & Oberflächen',
    stake: 45,
    rounds: 2,
    icon: '🧊',
    difficulty: 'Schwer',
    modifiers: ['Runden auf 1 Nachkommastelle', 'Nur Eingaben'],
    tags: ['Volumen', 'Oberfläche', 'Sachaufgaben'],
  },
  {
    id: 'scaling_relay',
    title: 'Scaling Relay',
    tagline: '3 Streckungen · Kombi-Check',
    description: 'Maßstab, Flächenfaktor und Prozent – alles in einem Lauf. Perfekt für Transformation-Fans.',
    unitId: 'u5',
    unitTitle: 'Ähnlichkeit & Skalierung',
    stake: 30,
    rounds: 3,
    icon: '📊',
    difficulty: 'Mittel',
    modifiers: ['k-Analyse', 'Vergleiche', 'Übertrag'],
    tags: ['Skalierung', 'Verhältnisse', 'Transfer'],
  },
];

export function getBattleScenarioById(id: string): BattleScenario | undefined {
  return BATTLE_SCENARIOS.find(s => s.id === id);
}

export function generateBattleTaskBundle(scenarioId: string, overrideRounds?: number): Task[] {
  const scenario = getBattleScenarioById(scenarioId);
  if (!scenario) return [];
  const rounds = overrideRounds && overrideRounds > 0 ? overrideRounds : scenario.rounds;
  return TaskFactory.getBattleTasksForUnit(scenario.unitId, rounds);
}


