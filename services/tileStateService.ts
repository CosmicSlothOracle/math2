/**
 * Tile State Service - Zentrale State Machine für Tile-Status
 *
 * Verwaltet die State-Übergänge für LearningUnits:
 * - locked → gold_unlocked: Standard-Quiz perfekt abgeschlossen
 * - gold_unlocked → bounty_cleared: Alle Bounty-Aufgaben perfekt abgeschlossen
 *
 * Dieser Service bündelt die gesamte Flow-Logik an einer Stelle,
 * damit sie leicht nachvollzogen und geändert werden kann.
 */

import { User, LearningUnit, TileStatus, getTileStatus } from '../types';

/**
 * Quiz-Modus: Unterscheidet zwischen Standard-Quiz und Bounty-Modus
 */
export type QuizMode = 'standard' | 'bounty';

/**
 * Ergebnis eines Quiz-Durchlaufs
 */
export interface QuizResult {
  isPerfect: boolean; // Keine Fehler, keine Hints verwendet
  mistakes: number;
  hintsUsed: number;
  mode: QuizMode;
}

/**
 * State Transition Result
 */
export interface StateTransitionResult {
  success: boolean;
  previousStatus: TileStatus;
  newStatus: TileStatus;
  message?: string;
}

/**
 * Tile State Service
 *
 * Zentrale Stelle für alle Tile-State-Operationen.
 * Verwaltet State-Übergänge und stellt sicher, dass sie nur einmalig erfolgen.
 */
export class TileStateService {
  /**
   * Berechnet den aktuellen Tile-Status aus dem User-State
   */
  static getCurrentStatus(unitId: string, user: User): TileStatus {
    return getTileStatus(unitId, user);
  }

  /**
   * Prüft, ob ein Standard-Quiz bereits perfekt abgeschlossen wurde
   * (d.h. ob die Tile bereits gold_unlocked oder höher ist)
   */
  static hasPerfectStandardQuiz(unitId: string, user: User): boolean {
    return user.perfectStandardQuizUnits?.includes(unitId) ?? false;
  }

  /**
   * Prüft, ob alle Bounty-Aufgaben bereits perfekt abgeschlossen wurden
   * (d.h. ob die Tile bounty_cleared ist)
   */
  static hasPerfectBounty(unitId: string, user: User): boolean {
    return user.perfectBountyUnits?.includes(unitId) ?? false;
  }

  /**
   * Prüft, ob der Bounty-Modus für eine Tile freigeschaltet ist
   * (d.h. ob die Tile mindestens gold_unlocked ist)
   */
  static isBountyModeUnlocked(unitId: string, user: User): boolean {
    const status = this.getCurrentStatus(unitId, user);
    return status === 'gold_unlocked' || status === 'bounty_cleared';
  }

  /**
   * Prüft, ob Voraufgaben für eine Tile freigeschaltet sind
   * (d.h. ob die Tile mindestens gold_unlocked ist)
   */
  static arePreTasksUnlocked(unitId: string, user: User): boolean {
    return this.isBountyModeUnlocked(unitId, user);
  }

  /**
   * Verarbeitet das Ergebnis eines Standard-Quiz-Durchlaufs
   *
   * State-Übergang: locked → gold_unlocked
   *
   * WICHTIG: Diese Transition darf nur beim ersten perfekten Durchlauf passieren.
   * Ein Reset ist nicht vorgesehen (außer explizit implementiert).
   *
   * @param unitId - Die ID der LearningUnit
   * @param user - Der aktuelle User-State
   * @param result - Das Ergebnis des Quiz-Durchlaufs
   * @returns Neuer User-State mit aktualisiertem Status
   */
  static processStandardQuizResult(
    unitId: string,
    user: User,
    result: QuizResult
  ): { user: User; transition: StateTransitionResult } {
    const previousStatus = this.getCurrentStatus(unitId, user);

    // Prüfe, ob bereits gold_unlocked oder höher
    if (previousStatus !== 'locked') {
      return {
        user,
        transition: {
          success: false,
          previousStatus,
          newStatus: previousStatus,
          message: 'Standard-Quiz bereits perfekt abgeschlossen'
        }
      };
    }

    // Nur bei perfektem Durchlauf: Transition zu gold_unlocked
    if (!result.isPerfect) {
      return {
        user,
        transition: {
          success: false,
          previousStatus,
          newStatus: previousStatus,
          message: 'Standard-Quiz nicht perfekt abgeschlossen'
        }
      };
    }

    // Transition: locked → gold_unlocked
    const updatedUser: User = {
      ...user,
      perfectStandardQuizUnits: [
        ...new Set([...(user.perfectStandardQuizUnits || []), unitId])
      ]
    };

    return {
      user: updatedUser,
      transition: {
        success: true,
        previousStatus: 'locked',
        newStatus: 'gold_unlocked',
        message: 'Standard-Quiz perfekt abgeschlossen! Gold-Status freigeschaltet.'
      }
    };
  }

  /**
   * Verarbeitet das Ergebnis eines Bounty-Quiz-Durchlaufs
   *
   * State-Übergang: gold_unlocked → bounty_cleared
   *
   * Voraussetzung: Tile muss mindestens gold_unlocked sein.
   *
   * @param unitId - Die ID der LearningUnit
   * @param user - Der aktuelle User-State
   * @param result - Das Ergebnis des Bounty-Quiz-Durchlaufs
   * @returns Neuer User-State mit aktualisiertem Status
   */
  static processBountyQuizResult(
    unitId: string,
    user: User,
    result: QuizResult
  ): { user: User; transition: StateTransitionResult } {
    const previousStatus = this.getCurrentStatus(unitId, user);

    // Prüfe, ob bereits bounty_cleared
    if (previousStatus === 'bounty_cleared') {
      return {
        user,
        transition: {
          success: false,
          previousStatus,
          newStatus: previousStatus,
          message: 'Bounty bereits vollständig abgeschlossen'
        }
      };
    }

    // Prüfe, ob Bounty-Modus freigeschaltet ist
    if (previousStatus === 'locked') {
      return {
        user,
        transition: {
          success: false,
          previousStatus,
          newStatus: previousStatus,
          message: 'Bounty-Modus noch nicht freigeschaltet. Zuerst Standard-Quiz perfekt abschließen.'
        }
      };
    }

    // Nur bei perfektem Durchlauf: Transition zu bounty_cleared
    if (!result.isPerfect) {
      return {
        user,
        transition: {
          success: false,
          previousStatus,
          newStatus: previousStatus,
          message: 'Bounty-Quiz nicht perfekt abgeschlossen'
        }
      };
    }

    // Transition: gold_unlocked → bounty_cleared
    const updatedUser: User = {
      ...user,
      perfectBountyUnits: [
        ...new Set([...(user.perfectBountyUnits || []), unitId])
      ]
    };

    return {
      user: updatedUser,
      transition: {
        success: true,
        previousStatus: 'gold_unlocked',
        newStatus: 'bounty_cleared',
        message: 'Bounty vollständig abgeschlossen! Alle Aufgaben gemeistert.'
      }
    };
  }

  /**
   * Hauptfunktion: Verarbeitet ein Quiz-Ergebnis und führt die entsprechende Transition durch
   *
   * Diese Funktion entscheidet automatisch, ob es sich um ein Standard-Quiz oder
   * Bounty-Quiz handelt und führt die entsprechende Transition durch.
   *
   * @param unitId - Die ID der LearningUnit
   * @param user - Der aktuelle User-State
   * @param result - Das Ergebnis des Quiz-Durchlaufs
   * @returns Neuer User-State mit aktualisiertem Status und Transition-Info
   */
  static processQuizResult(
    unitId: string,
    user: User,
    result: QuizResult
  ): { user: User; transition: StateTransitionResult } {
    if (result.mode === 'bounty') {
      return this.processBountyQuizResult(unitId, user, result);
    } else {
      return this.processStandardQuizResult(unitId, user, result);
    }
  }

  /**
   * Erstellt ein QuizResult-Objekt aus den Quiz-Daten
   *
   * @param mistakes - Anzahl der Fehler
   * @param hintsUsed - Anzahl der verwendeten Hints
   * @param mode - Quiz-Modus (standard oder bounty)
   */
  static createQuizResult(
    mistakes: number,
    hintsUsed: number,
    mode: QuizMode
  ): QuizResult {
    return {
      isPerfect: mistakes === 0 && hintsUsed === 0,
      mistakes,
      hintsUsed,
      mode
    };
  }

  /**
   * Bestimmt den Quiz-Modus basierend auf der Konfiguration
   *
   * @param config - Quiz-Konfiguration
   * @param unit - Die LearningUnit (um zu prüfen, ob Bounty-Aufgaben vorhanden sind)
   */
  static determineQuizMode(
    config: { timed: boolean; noCheatSheet: boolean },
    unit: LearningUnit
  ): QuizMode {
    // Bounty-Modus: Wenn timed UND noCheatSheet aktiviert sind
    // UND die Unit Bounty-Aufgaben hat
    if (config.timed && config.noCheatSheet && unit.bountyTasks && unit.bountyTasks.length > 0) {
      return 'bounty';
    }
    return 'standard';
  }
}
