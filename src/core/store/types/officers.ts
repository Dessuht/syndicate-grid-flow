import { BaseEntity, EntityId } from './base';

export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';

export interface OfficerSkills {
  enforcement: number;
  diplomacy: number;
  logistics: number;
  recruitment: number;
}

export type CompatibilityLike = 'Respects Red Poles' | 'Values Loyalty' | 'Admires Ambition' | 'Appreciates Cunning' | 'Respects Old School';
export type CompatibilityDislike = 'Hates Ambitious' | 'Distrusts Calculating' | 'Despises Hot-headed' | 'Resents Ruthless' | 'Scorns Silver Tongue';

export interface OfficerStatus {
  isWounded: boolean;
  isArrested: boolean;
  isBetraying: boolean;
  isTraitor: boolean;
  isSuccessor: boolean;
  isTestingWaters: boolean;
  daysToRecovery: number;
}

export interface Officer extends BaseEntity {
  // Core identity
  name: string;
  rank: OfficerRank;
  
  // Status
  status: OfficerStatus;
  
  // Physical attributes
  energy: number;
  maxEnergy: number;
  
  // Skills and stats
  skills: OfficerSkills;
  loyalty: number;
  face: number;
  
  // Behavioral attributes
  traits: string[];
  likes: CompatibilityLike[];
  dislikes: CompatibilityDislike[];
  currentAgenda: string | null;
  
  // Assignment and work
  assignedBuildingId: EntityId | null;
  daysAssigned: number;
  daysIdle: number;
  
  // Autonomous features (optional)
  needs?: {
    safety: number;
    respect: number;
    wealth: number;
    power: number;
    belonging: number;
    excitement: number;
  };
  currentMood?: 'loyal' | 'content' | 'restless' | 'ambitious' | 'disloyal' | 'desperate';
  personalAmbitions?: string[];
  lastActionTime?: number;
  isAutonomous?: boolean;
}

export interface OfficerAssignment {
  officerId: EntityId;
  buildingId: EntityId;
  assignedAt: number;
}