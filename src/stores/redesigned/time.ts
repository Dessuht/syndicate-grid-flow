import { GamePhase, TimeState } from './types';

export class TimeManager {
  static advanceTime(currentState: TimeState): TimeState {
    let newDay = currentState.currentDay + 1;
    let newWeek = currentState.currentWeek;
    let newPhase = currentState.phase;

    // Update phase based on day
    if (newDay > 7) {
      newDay = 1;
      newWeek += 1;
      newPhase = 'planning';
    } else if (newDay === 4 && currentState.phase === 'planning') {
      newPhase = 'operations';
    } else if (newDay === 7 && currentState.phase === 'operations') {
      newPhase = 'aftermath';
    }

    return {
      currentDay: newDay,
      currentWeek: newWeek,
      phase: newPhase
    };
  }

  static getPhaseDescription(phase: GamePhase): string {
    switch (phase) {
      case 'planning':
        return 'Plan your operations for the week';
      case 'operations':
        return 'Execute your planned operations';
      case 'aftermath':
        return 'Review results and prepare for next week';
    }
  }

  static isWeekTransition(currentState: TimeState, newState: TimeState): boolean {
    return newState.currentWeek > currentState.currentWeek;
  }

  static getDaysInPhase(phase: GamePhase): number {
    switch (phase) {
      case 'planning':
        return 3; // Days 1-3
      case 'operations':
        return 3; // Days 4-6
      case 'aftermath':
        return 1; // Day 7
      default:
        return 0;
    }
  }
}