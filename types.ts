
export type CategoryGroup = 'A' | 'B' | 'C';

/**
 * Tile-Status für jede Kachel (LearningUnit)
 *
 * State-Übergänge:
 * - locked → gold_unlocked: Wenn Standard-Quiz einmal perfekt abgeschlossen wurde (keine Fehler, keine Hints)
 * - gold_unlocked → bounty_cleared: Wenn alle 3 Bounty-Aufgaben in einem Durchlauf korrekt beantwortet wurden
 *
 * Hinweis: Der Status kann aus User-State berechnet werden:
 * - locked: Unit nicht in perfectStandardQuizUnits
 * - gold_unlocked: Unit in perfectStandardQuizUnits, aber nicht in perfectBountyUnits
 * - bounty_cleared: Unit in perfectBountyUnits
 */
export type TileStatus = 'locked' | 'gold_unlocked' | 'bounty_cleared';

export interface Task {
  id: string;
  question: string;
  type: 'choice' | 'input' | 'boolean' | 'shorttext' | 'visualChoice' | 'wager' | 'dragDrop' | 'angleMeasure' | 'sliderTransform' | 'areaDecomposition' | 'multiAngleThrow';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  placeholder?: string;
  visualData?: any;
  wagerOptions?: number[]; // For wager tasks
  dragDropData?: { shapes: Array<{id: string, path: string, shapeType: string}>, categories: Array<{id: string, label: string, accepts: string[]}> }; // For drag-drop
  angleData?: { path: string, correctAngle: number }; // For angle measurement
  sliderData?: { basePath: string, shapeType: string, minK: number, maxK: number, correctK: number }; // For transformations
  decompositionData?: { complexPath: string, parts: Array<{path: string, label: string}> }; // For area decomposition
  multiAngleThrowData?: { targetAngle: number, maxAngles: number, startCost: number, hitReward: number, tolerance?: number }; // For multi-angle throw training
}

/**
 * Voraufgabe: Spielerische, visuelle Aufgabe als Vorbereitung für das Standard-Quiz
 *
 * Diese Aufgaben sind leichter und sollen das Konzept spielerisch einführen.
 * Sie werden VOR dem Standard-Quiz angeboten, um den Lernenden auf das Thema vorzubereiten.
 *
 * @property uiType - Definiert, welche UI-Komponente verwendet wird (z.B. 'dragDrop', 'visualChoice', 'interactive')
 * @property meta - Zusätzliche Metadaten für die UI-Komponente (z.B. SVG-Pfade, Konfiguration)
 */
export interface PreTask {
  id: string;
  title: string;
  description: string;
  uiType: 'dragDrop' | 'visualChoice' | 'interactive' | 'angleMeasure' | 'sliderTransform' | 'areaDecomposition';
  meta: any; // Flexible Metadaten je nach uiType (z.B. visualData, dragDropData, etc.)
  correctAnswer: number | string | Record<string, string>; // Kann auch ein Objekt für komplexe Antworten sein
  explanation: string;
}

/**
 * Bounty-Aufgabe: Klassische Prüfungsaufgabe (schwer, sehr klassisch)
 *
 * Diese Aufgaben sind die "Final Boss" Aufgaben für den Bounty-Modus.
 * Es gibt genau 3 Bounty-Aufgaben pro Tile, die alle in einem Durchlauf korrekt
 * beantwortet werden müssen, um den Status "bounty_cleared" zu erreichen.
 *
 * Hinweis: Diese Aufgaben sind deterministisch und nicht zufällig generiert,
 * da sie klassische Prüfungsaufgaben repräsentieren sollen.
 */
export interface BountyTask extends Task {
  // Erbt alle Eigenschaften von Task
  // Zusätzlich können hier spezifische Bounty-Metadaten hinzugefügt werden
  difficultyLevel: 'Mittel' | 'Schwer'; // Klassische Prüfungsaufgaben sind tendenziell schwerer
}

export interface TermDefinition {
  term: string;
  definition: string;
  visual?: string; // SVG path or instruction
}

export interface LearningUnit {
  id: string;
  group: CategoryGroup;
  category: 'Basics' | 'Konstruktion' | 'Berechnung' | 'Transformation' | 'Koordinaten' | 'Modellierung';
  title: string;
  description: string;
  detailedInfo: string;
  examples: string[];

  /**
   * Standard-Quiz: Die Hauptaufgaben für diese Kachel
   * Diese werden beim normalen Quest-Durchlauf verwendet.
   * Ein perfekter Durchlauf (keine Fehler, keine Hints) führt zu gold_unlocked Status.
   */
  tasks: Task[];

  /**
   * Voraufgaben: Spielerische, visuelle Aufgaben als Vorbereitung
   * Diese werden VOR dem Standard-Quiz angeboten, um das Konzept spielerisch einzuführen.
   * Sie sind optional und dienen der Vorbereitung, nicht der Bewertung.
   */
  preTasks?: PreTask[];

  /**
   * Bounty-Aufgaben: 3 klassische Prüfungsaufgaben
   * Diese werden im Bounty-Modus verwendet (nach gold_unlocked Status).
   * Alle 3 müssen in einem Durchlauf korrekt beantwortet werden, um bounty_cleared zu erreichen.
   *
   * Hinweis: Diese Aufgaben sind deterministisch (nicht zufällig generiert),
   * da sie klassische Prüfungsaufgaben repräsentieren sollen.
   */
  bountyTasks?: BountyTask[];

  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  coinsReward: number; // Standard Reward für Abschluss (immer)
  bounty: number;      // Extra Reward für Perfect Run (100-500)
  definitionId?: string;
  keywords: string[];
}

export interface GeometryDefinition {
  id: string;
  groupId: CategoryGroup;
  title: string;
  description: string;
  formula: string;
  terms: TermDefinition[];
  visual: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'avatar' | 'effect' | 'feature' | 'voucher' | 'calculator' | 'prize';
  cost: number;
  value: string;
  icon?: string; // New: Display symbol separate from logic value
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  totalEarned: number;

  /**
   * Units, die mindestens einmal abgeschlossen wurden (mit oder ohne Fehler)
   * Wird verwendet für Fortschrittsanzeige und Entsperrung weiterer Units.
   */
  completedUnits: string[];

  /**
   * Units, die mit Bounty (perfekt) abgeschlossen wurden
   *
   * DEPRECATED: Verwende stattdessen perfectBountyUnits für Klarheit.
   * Wird beibehalten für Rückwärtskompatibilität.
   *
   * State-Übergang: Unit wird hier hinzugefügt, wenn:
   * - Standard-Quiz perfekt abgeschlossen wurde (keine Fehler, keine Hints)
   * - UND alle 3 Bounty-Aufgaben in einem Durchlauf korrekt beantwortet wurden
   */
  masteredUnits: string[];

  /**
   * Units, bei denen das Standard-Quiz perfekt abgeschlossen wurde
   *
   * "Perfekt" bedeutet:
   * - Keine Fehler während des gesamten Quiz-Durchlaufs
   * - Keine Hints verwendet (wenn noCheatSheet aktiviert war)
   *
   * State-Übergang: Unit wird hier hinzugefügt, wenn:
   * - handleQuestComplete mit isPerfectRun=true aufgerufen wird
   * - UND es war ein Standard-Quiz (nicht Bounty-Modus)
   *
   * Dies führt zum Status gold_unlocked für die entsprechende Tile.
   */
  perfectStandardQuizUnits?: string[];

  /**
   * Units, bei denen alle Bounty-Aufgaben perfekt abgeschlossen wurden
   *
   * "Perfekt" bedeutet:
   * - Alle 3 Bounty-Aufgaben wurden in einem Durchlauf korrekt beantwortet
   * - Keine Fehler während des Bounty-Durchlaufs
   * - Keine Hints verwendet (wenn noCheatSheet aktiviert war)
   *
   * State-Übergang: Unit wird hier hinzugefügt, wenn:
   * - handleQuestComplete mit isPerfectRun=true aufgerufen wird
   * - UND es war ein Bounty-Modus (alle 3 bountyTasks wurden korrekt beantwortet)
   *
   * Dies führt zum Status bounty_cleared für die entsprechende Tile.
   *
   * Hinweis: Eine Unit kann sowohl in perfectStandardQuizUnits als auch in
   * perfectBountyUnits sein, wenn beide Modi perfekt abgeschlossen wurden.
   */
  perfectBountyUnits?: string[];

  /**
   * Coin-Tracking pro Frage: Speichert, für welche Fragen bereits Coins vergeben wurden
   *
   * Struktur: { [questionKey]: string[] }
   * - questionKey: Eindeutige Identifikation der Frage (z.B. "u1-standard-0" oder "u1-bounty-task-123")
   * - string[]: Array von Modus-Strings, für die bereits Coins vergeben wurden
   *   - "standard": Standard-Modus (kein Hardmode)
   *   - "hardmode": Hardmode (timed + noCheatSheet)
   *   - "preTask": Voraufgabe
   *   - "bounty": Bounty-Aufgabe
   *
   * Logik:
   * - Jede Frage kann nur einmal pro Modus Coins geben
   * - Hardmode kann zusätzliche Coins geben, auch wenn Standard bereits Coins gegeben hat
   * - Beispiel: Frage wurde im Standard-Modus richtig beantwortet → Coins gegeben, "standard" hinzugefügt
   *             → Später im Hardmode wieder richtig → Coins gegeben, "hardmode" hinzugefügt
   *             → Nochmal im Hardmode richtig → Keine Coins (bereits "hardmode" vorhanden)
   */
  questionCoins?: Record<string, string[]>;

  unlockedItems: string[];
  activeEffects: string[];
  calculatorSkin: string; // The active calculator design
  xp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  avatar: string;
  type?: 'chat' | 'system';
}

export interface BattleRequest {
  id: string;
  challengerId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  unitId: string;
  unitTitle: string;
  wager: number;
  status: 'pending' | 'active' | 'completed';
  result?: {
    winnerId: string;
    challengerScore: number;
    opponentScore: number;
  };
}

export interface LogEntry {
  timestamp: number;
  action: string;
  details: string;
  userId: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

/**
 * Berechnet den Tile-Status für eine LearningUnit basierend auf dem User-State
 *
 * State-Übergänge:
 *
 * 1. locked → gold_unlocked:
 *    - Trigger: Standard-Quiz wurde perfekt abgeschlossen (keine Fehler, keine Hints)
 *    - Aktion: Unit-ID wird zu user.perfectStandardQuizUnits hinzugefügt
 *    - Code: handleQuestComplete(isPerfectRun=true) für Standard-Quiz
 *
 * 2. gold_unlocked → bounty_cleared:
 *    - Trigger: Alle 3 Bounty-Aufgaben wurden in einem Durchlauf korrekt beantwortet
 *    - Aktion: Unit-ID wird zu user.perfectBountyUnits hinzugefügt
 *    - Code: handleQuestComplete(isPerfectRun=true) für Bounty-Modus
 *
 * @param unitId - Die ID der LearningUnit
 * @param user - Der User-Objekt mit perfectStandardQuizUnits und perfectBountyUnits
 * @returns Der aktuelle Tile-Status
 *
 * @example
 * ```typescript
 * const status = getTileStatus('u1', user);
 * // Returns: 'locked' | 'gold_unlocked' | 'bounty_cleared'
 * ```
 */
export function getTileStatus(unitId: string, user: User): TileStatus {
  const perfectStandard = user.perfectStandardQuizUnits?.includes(unitId) ?? false;
  const perfectBounty = user.perfectBountyUnits?.includes(unitId) ?? false;

  // Rückwärtskompatibilität: Falls perfectBountyUnits nicht existiert,
  // prüfe masteredUnits (alte Implementierung)
  const hasBounty = perfectBounty || (user.perfectBountyUnits === undefined && user.masteredUnits?.includes(unitId));

  if (hasBounty) {
    return 'bounty_cleared';
  }

  if (perfectStandard) {
    return 'gold_unlocked';
  }

  return 'locked';
}

/**
 * Prüft, ob eine Unit den Status "gold_unlocked" oder höher hat
 *
 * @param unitId - Die ID der LearningUnit
 * @param user - Der User-Objekt
 * @returns true, wenn die Unit mindestens gold_unlocked ist
 */
export function isGoldUnlocked(unitId: string, user: User): boolean {
  const status = getTileStatus(unitId, user);
  return status === 'gold_unlocked' || status === 'bounty_cleared';
}

/**
 * Prüft, ob eine Unit den Status "bounty_cleared" hat
 *
 * @param unitId - Die ID der LearningUnit
 * @param user - Der User-Objekt
 * @returns true, wenn die Unit bounty_cleared ist
 */
export function isBountyCleared(unitId: string, user: User): boolean {
  return getTileStatus(unitId, user) === 'bounty_cleared';
}
