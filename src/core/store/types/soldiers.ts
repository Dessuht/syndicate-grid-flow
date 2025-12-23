import { BaseEntity, EntityId } from './base';

export interface Soldier extends BaseEntity {
}

// Type alias for backward compatibility
export type StreetSoldier = Soldier;

export interface StreetSoldier extends BaseEntity {
  name: string;
  rank?: string;
  
  // Stats
  loyalty: number;
  skill: number;
  
  // State
  isDeserting: boolean;
  assignedOfficerId: EntityId | null;
  
  // Needs
  needs: {
    food: number;
    entertainment: number;
    pay: number;
  };
}