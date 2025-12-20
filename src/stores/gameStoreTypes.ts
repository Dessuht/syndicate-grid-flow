import { OfficerRelationship as ComplexRelationship } from '@/types/relationships';

// Types for original gameStore implementation
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | 'coupAttempt' | 'newEra' | 'dailyBriefing' | 'policeShakedown' | 'streetBeef' | 'nightclubSuccess' | null;

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
  relationships: ComplexRelationship[];
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

export interface GameState {
  // Resources
  cash: number;
  reputation: number;
  policeHeat: number;
  currentDay: number;
  currentPhase: DayPhase;
  stipend: number;
  intel: number;
  influence: number;

  // Entities
  officers: Officer[];
  buildings: Building[];
  soldiers: StreetSoldier[];
  rivals: RivalGang[];

  // Relationship system
  relationshipSystem: any;
  socialFeed: any[];
  recentInteractions: any[];

  // Intel & Upgrades
  unlockedUpgrades: string[];

  // Event system
  activeEvent: EventType;
  eventData: any;
  pendingEvents: { type: EventType; data: any }[];

  // Diplomacy
  activeDiplomacy: { rivalId: string; action: DiploAction } | null;

  // Family Council - Character System
  syndicateMembers: any[];
  recruitCost: number;

  // Home District Racket
  homeDistrictLeaderId: string | null;
  homeDistrictHeat: number;
  homeDistrictRevenue: number;
  officerCutIncreased: boolean;

  // Territory Stats
  territoryFriction: number;
  territoryInfluence: number;
  frictionInterval: NodeJS.Timeout | null;

  // Street War System
  streetWarRivalId: string | null;

  // Civil War State
  isCivilWarActive: boolean;
  rebelOfficerId: string | null;

  // Council System
  currentScene: GameScene;
  councilMotions: CouncilMotion[];
  
  // Daily Briefing State
  dailyBriefingIgnored: boolean;
  
  // Street Beef (Officer Friction) State
  activeStreetBeefs: StreetBeef[];
  beefDaysTracker: Record<string, number>;

  // Officer Interaction Actions
  shareTea: (officerId: string) => void;
  giveBonus: (officerId: string) => void;
  reprimandOfficer: (officerId: string) => void;
  promoteOfficer: (officerId: string, newRank: OfficerRank) => void;
  designateSuccessor: (officerId: string) => void;

  // Council Actions
  generateCouncilMotions: () => void;
  handleCouncilVote: (motionId: string, playerVote: 'yes' | 'no') => void;
  useInfluenceToOrderVote: (motionId: string, officerId: string, vote: 'yes' | 'no') => void;
  exitCouncil: () => void;

  // Event handlers
  handleRaidChoice: (choice: 'bribe' | 'stand' | 'escape') => void;
  handleBetrayalChoice: (choice: 'forgive' | 'punish' | 'exile') => void;
  handleCriminalChoice: (choice: 'execute' | 'enslave' | 'spy') => void;
  handleRivalAttackChoice: (choice: 'fight' | 'negotiate' | 'retreat') => void;
  handleTerritoryUltimatum: (choice: 'pay' | 'refuse') => void;
  handleStreetWarChoice: (choice: 'bribe' | 'fight') => void;
  handleCoupResolution: (choice: 'raid' | 'negotiate', officerId: string) => void;
  handleLeaderDeath: (officerId: string) => void;
  handleDailyBriefingChoice: (choice: 'passive' | 'financial' | 'authoritarian') => void;
  handleShakedownChoice: (choice: 'bribe' | 'layLow' | 'resist') => void;
  handleStreetBeefChoice: (choice: 'talk' | 'council' | 'fire', fireOfficerId?: string) => void;
  dismissEvent: () => void;

  // Diplomacy
  initiateDiplomacy: (rivalId: string, action: DiploAction) => void;
  confirmDiplomacy: () => void;
  cancelDiplomacy: () => void;

  // Upgrades
  upgradeBuilding: (buildingId: string) => void;
  purchaseIntel: (cost: number) => void;

  // Soldiers
  recruitSoldier: () => void;
  setStipend: (amount: number) => void;

  // Character System
  recruitSyndicateMember: () => void;
  assignSyndicateMember: (memberId: string) => void;
  unassignSyndicateMember: () => void;
  processRacketCycle: () => void;
  scoutTerritory: (rivalId: string) => void;

  // Territory Management
  startFrictionTimer: () => void;
  stopFrictionTimer: () => void;
  resetFriction: () => void;

  // Intel actions
  spendIntelToReduceFriction: (rivalId: string, amount: number) => void;
  spendIntelToScout: (rivalId: string) => void;

  // Street War actions
  increaseFriction: () => void;

  // Hospital/Jail Recovery System
  healOfficer: (officerId: string) => void;
  releaseOfficer: (officerId: string) => void;
  processRecovery: () => void;

  // Basic actions
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  advancePhase: () => void;
  hostNightclub: () => void;

  // Autonomous character actions
  updateAutonomousBehavior: () => void;
  getCharacterCurrentAction: (officerId: string) => string | null;
  canForceWork: (officerId: string) => { canWork: boolean; reason?: string };
  getPlayerInfluenceLevel: () => number;

  // Relationship system actions
  processSocialInteractions: () => void;
  getOfficerRelationships: (officerId: string) => any;
  createManualInteraction: (initiatorId: string, targetId: string, type: string) => void;
}