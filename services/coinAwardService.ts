/**
 * Coin Award Service - Zentrale Logik für Coin-Vergabe pro Frage
 *
 * Verwaltet, welche Fragen bereits Coins gegeben haben und in welchem Modus.
 * Stellt sicher, dass jede Frage nur einmal pro Modus Coins gibt.
 *
 * Logik:
 * - Standard-Modus: Gibt Coins, wenn Frage noch nicht im "standard" Modus belohnt wurde
 * - Hardmode (timed + noCheatSheet): Gibt Coins, wenn Frage noch nicht im "hardmode" Modus belohnt wurde
 * - Bounty-Modus: Gibt Coins, wenn Frage noch nicht im "bounty" Modus belohnt wurde
 * - Voraufgaben: Gibt Coins, wenn Frage noch nicht im "preTask" Modus belohnt wurde
 */

import { User, Task, LearningUnit } from '../types';
import { QuizMode } from './tileStateService';

/**
 * Erstellt eine eindeutige Frage-ID für Coin-Tracking
 *
 * Strategie:
 * - Immer content-basiert: Erstelle Hash aus unitId + normalized question + taskIndex
 * - Normalisiert zufällige Werte in Fragen (z.B. Zahlen) zu Platzhaltern
 * - Dies stellt sicher, dass die gleiche Frage immer den gleichen Key hat,
 *   unabhängig von der Task-ID oder zufälligen Werten
 *
 * @param unitId - Die ID der LearningUnit
 * @param task - Die Task
 * @param taskIndex - Index der Task im aktuellen Durchlauf (optional)
 * @param mode - Quiz-Modus (für Unterscheidung zwischen Standard/Bounty)
 * @returns Eindeutige Frage-ID
 */
export function createQuestionKey(
  unitId: string,
  task: Task,
  taskIndex?: number,
  mode: QuizMode = 'standard'
): string {
  // Normalisiere die Frage: Ersetze Zahlen durch Platzhalter für konsistente Keys
  // Dies stellt sicher, dass "Ein Rechteck ist 5m breit" und "Ein Rechteck ist 7m breit"
  // als die gleiche Frage-Template behandelt werden
  const normalizedQuestion = task.question
    .replace(/\d+/g, 'N') // Ersetze alle Zahlen durch 'N'
    .replace(/[^a-zA-Z0-9\s]/g, '') // Entferne Sonderzeichen
    .toLowerCase()
    .trim()
    .substring(0, 50); // Verwende ersten 50 Zeichen für Hash

  // Erstelle Hash-ähnlichen String aus normalisierter Frage
  // Verwende auch task.type für zusätzliche Eindeutigkeit
  const questionHash = `${task.type}-${normalizedQuestion}`.replace(/\s+/g, '-');

  // Wenn taskIndex vorhanden, verwende ihn für zusätzliche Eindeutigkeit
  // (wichtig für Tasks, die mehrmals im gleichen Quiz vorkommen können)
  if (taskIndex !== undefined) {
    return `${unitId}-${mode}-idx${taskIndex}-${questionHash}`;
  }

  return `${unitId}-${mode}-${questionHash}`;
}

/**
 * Bestimmt den Coin-Modus basierend auf Quiz-Konfiguration
 *
 * @param config - Quiz-Konfiguration
 * @param quizMode - Quiz-Modus (standard oder bounty)
 * @returns Coin-Modus-String
 */
export function determineCoinMode(
  config: { timed: boolean; noCheatSheet: boolean },
  quizMode: QuizMode
): string {
  if (quizMode === 'bounty') {
    return 'bounty';
  }

  // Hardmode: timed UND noCheatSheet aktiviert
  if (config.timed && config.noCheatSheet) {
    return 'hardmode';
  }

  return 'standard';
}

/**
 * Prüft, ob für eine Frage bereits Coins im angegebenen Modus vergeben wurden
 *
 * @param user - Der User-State
 * @param questionKey - Die eindeutige Frage-ID
 * @param coinMode - Der Coin-Modus (standard, hardmode, bounty, preTask)
 * @returns true, wenn bereits Coins vergeben wurden
 */
export function hasReceivedCoinsForQuestion(
  user: User,
  questionKey: string,
  coinMode: string
): boolean {
  if (!user.questionCoins) {
    return false;
  }

  const modes = user.questionCoins[questionKey];
  if (!modes) {
    return false;
  }

  return modes.includes(coinMode);
}

/**
 * Markiert eine Frage als "Coins erhalten" für einen bestimmten Modus
 *
 * @param user - Der User-State
 * @param questionKey - Die eindeutige Frage-ID
 * @param coinMode - Der Coin-Modus
 * @returns Neuer User-State mit aktualisiertem questionCoins
 */
export function markQuestionAsRewarded(
  user: User,
  questionKey: string,
  coinMode: string
): User {
  const currentModes = user.questionCoins?.[questionKey] || [];

  // Prüfe, ob Modus bereits vorhanden (sollte nicht passieren, aber sicherheitshalber)
  if (currentModes.includes(coinMode)) {
    return user;
  }

  return {
    ...user,
    questionCoins: {
      ...(user.questionCoins || {}),
      [questionKey]: [...currentModes, coinMode]
    }
  };
}

/**
 * Zentrale Funktion: Prüft und vergibt Coins für eine Frage
 *
 * Logik:
 * 1. Erstelle eindeutige Frage-ID
 * 2. Bestimme Coin-Modus basierend auf Konfiguration
 * 3. Prüfe, ob bereits Coins für diese Frage in diesem Modus vergeben wurden
 * 4. Wenn nicht → markiere Frage als belohnt und gib Coins zurück
 * 5. Wenn ja → gib 0 Coins zurück
 *
 * @param user - Der aktuelle User-State
 * @param unit - Die LearningUnit
 * @param task - Die beantwortete Task
 * @param taskIndex - Index der Task im aktuellen Durchlauf
 * @param config - Quiz-Konfiguration
 * @param quizMode - Quiz-Modus (standard oder bounty)
 * @param baseCoinAmount - Basis-Coin-Betrag für diese Frage (Standard: 10)
 * @returns { coins: number, user: User } - Anzahl der Coins (0 wenn bereits vergeben) und aktualisierter User-State
 */
export function awardCoinsForQuestion(
  user: User,
  unit: LearningUnit,
  task: Task,
  taskIndex: number,
  config: { timed: boolean; noCheatSheet: boolean },
  quizMode: QuizMode,
  baseCoinAmount: number = 10
): { coins: number; user: User } {
  // 1. Erstelle eindeutige Frage-ID
  const questionKey = createQuestionKey(unit.id, task, taskIndex, quizMode);

  // 2. Bestimme Coin-Modus
  const coinMode = determineCoinMode(config, quizMode);

  // 3. Prüfe, ob bereits Coins vergeben wurden
  if (hasReceivedCoinsForQuestion(user, questionKey, coinMode)) {
    // Bereits Coins erhalten → keine weiteren Coins
    return { coins: 0, user };
  }

  // 4. Markiere Frage als belohnt und gib Coins zurück
  const updatedUser = markQuestionAsRewarded(user, questionKey, coinMode);

  return {
    coins: baseCoinAmount,
    user: updatedUser
  };
}

/**
 * Spezielle Funktion für Voraufgaben
 *
 * @param user - Der aktuelle User-State
 * @param unit - Die LearningUnit
 * @param preTaskId - Die ID der Voraufgabe
 * @param baseCoinAmount - Basis-Coin-Betrag (Standard: 5, da Voraufgaben leichter sind)
 * @returns { coins: number, user: User }
 */
export function awardCoinsForPreTask(
  user: User,
  unit: LearningUnit,
  preTaskId: string,
  baseCoinAmount: number = 5
): { coins: number; user: User } {
  const questionKey = `${unit.id}-preTask-${preTaskId}`;
  const coinMode = 'preTask';

  if (hasReceivedCoinsForQuestion(user, questionKey, coinMode)) {
    return { coins: 0, user };
  }

  const updatedUser = markQuestionAsRewarded(user, questionKey, coinMode);

  return {
    coins: baseCoinAmount,
    user: updatedUser
  };
}
