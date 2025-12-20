// Types for original gameStore implementation
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | 'coupAttempt' | 'newEra' | 'dailyBriefing' | 'policeShakedown' | 'streetBeef' | null;

export type CompatibilityLike = 'Respects Red Poles' | 'Values Loyalty' | 'Admires Ambition' | 'Appreciates Cunning' | 'Respects Old School';
export type CompatibilityDislike = 'Hates Ambitious' | 'Distrusts Calculating' | 'Despises Hot-headed' | 'Resents Ruthless' | 'Scorns Silver Tongue';

export interface OfficerSkills {
  enforcement: number;
  diplomacy: number;
  logistics: number;
  recruitment: number;
}

export interface OfficerRelationship {
  targetId: string;
  respect: number;
}

export interface StreetBeef {
  officer1Id: string;
  officer2Id: string;
  daysActive: number;
  isResolved: boolean;
}

export type DiploAction = 'trade' | 'alliance' | 'turfWar' | null;

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
  skills: OfficerSkills;
  loyalty: number;
  daysAssigned: number;
  daysIdle: number;
  relationships: OfficerRelationship[];
  isBetraying: boolean;
  traits: string[];
  isWounded: boolean;
  isArrested: boolean;
  daysToRecovery: number;
  currentAgenda: string | null;
  face: number;
  grudge: boolean;
  isTraitor: boolean;
  isSuccessor: boolean;
  isTestingWaters: boolean;
  likes: CompatibilityLike[];
  dislikes: CompatibilityDislike[];
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  baseRevenue: number;
  heatGen: number;
  isOccupied: boolean;
  assignedOfficerId: string | null;
  inactiveUntilDay: number | null;
  isIllicit: boolean;
  foodProvided: number;
  entertainmentProvided: number;
  upgraded: boolean;
  isRebelBase: boolean;
  rebelSoldierCount: number;
}

export interface StreetSoldier {
  id: string;
  name: string;
  loyalty: number;
  needs: {
    food: number;
    entertainment: number;
    pay: number;
  };
  skill: number;
  isDeserting: boolean;
}

export interface RivalGang {
  id: string;
  name: string;
  district: string;
  strength: number;
  relationship: number;
  hasTradeAgreement: boolean;
  hasAlliance: boolean;
  isScouted: boolean;
  isActiveConflict: boolean;
}

export interface PostConflictSummaryData {
  type: 'raid' | 'streetWar' | 'civilWar';
  outcome: 'success' | 'failure';
  officerId: string | null;
  soldiersLost: number;
  reputationChange: number;
  faceChange: number;
  loyaltyChange: number;
  officerStatusEffect: 'none' | 'wounded' | 'arrested' | 'executed' | 'imprisoned';
  rivalName?: string;
}

export interface CouncilMotion {
  id: string;
  title: string;
  description: string;
  type: 'expansion' | 'internal';
  effect: (state: any) => Partial<any>;
  officerVotes: Record<string, 'yes' | 'no'>;
  isVetoed: boolean;
}