// Base types that are used throughout the application

export type EntityId = string;
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';

export interface BaseEntity {
  id: EntityId;
  createdAt: number;
  updatedAt: number;
}

export interface Resource {
  cash: number;
  reputation: number;
  policeHeat: number;
  intel: number;
  influence: number;
}

export interface GameState extends BaseEntity {
  // Time
  currentDay: number;
  currentPhase: DayPhase;
  
  // Resources
  resources: Resource;
  
  // Player configuration
  stipend: number;
  
  // Game configuration
  isPaused: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}