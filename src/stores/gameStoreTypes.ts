import { OfficerRelationship as ComplexRelationship, SharedMemory, Grudge } from '@/types/relationships';

// Core Game Types
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | 'coupAttempt' | 'newEra' | 'dailyBriefing' | 'policeShakedown' | 'streetBeef' | 'nightclubSuccess' | null;

export type CompatibilityLike = 'Respects Red Poles' | 'Values Loyalty' | 'Admires Ambition' | 'Appreciates Cunning' | 'Respects Old School';
export type CompatibilityDislike = 'Hates Ambitious' | 'Distrusts Calculating' | 'Despises Hot-headed' | 'Resents Ruthless' | 'Scorns Silver Tongue';

// Skills and Relationships
export interface OfficerSkills {
  enforcement: number;
  diplomacy: number;
  logistics: number;
  recruitment: number;
}

export interface StreetBeef {
  officer1Id: string;
  officer2Id: string;
  daysActive: number;
  isResolved: boolean;
}

export type DiploAction = 'trade' | 'alliance' | 'turfWar' | null;

// Unified Officer Interface - combines simple and complex systems
export interface Officer {
  // Core Identity
  id: string;
  name: string;
  rank: OfficerRank;
  
  // Status and Assignment
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
  isWounded: boolean;
  isArrested: boolean;
  daysToRecovery: number;
  
  // Skills and Performance
  skills: OfficerSkills;
  loyalty: number;
  face: number;
  
  // Behavioral State
  currentAgenda: string | null;
  traits: string[];
  likes: CompatibilityLike[];
  dislikes: CompatibilityDislike[];
  
  // Relationship System (integrated from complex system)
  relationships: ComplexRelationship[];
  
  // Autonomous Features (optional, enabled as game progresses)
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
  
  // State Tracking
  daysAssigned: number;
  daysIdle: number;
  isBetraying: boolean;
  grudge: boolean;
  isTraitor: boolean;
  isSuccessor: boolean;
  isTestingWaters: boolean;
}

// Building Interface
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

// Soldier Interface
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

// Rival Gang Interface
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

// Conflict Resolution Data
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

// Council System
export interface CouncilMotion {
  id: string;
  title: string;
  description: string;
  type: 'expansion' | 'internal';
  effect: (state: any) => Partial<any>;
  officerVotes: Record<string, 'yes' | 'no'>;
  isVetoed: boolean;
}

// Social System Types
export interface SocialInteraction {
  id: string;
  type: 'DEEP_CONVERSATION' | 'JOKE_TELLING' | 'FLIRTATION' | 'ARGUMENT' | 'INTRIGUE' | 'FLATTERY_GIFT' | 'DATE' | 'GIFT_EXCHANGE';
  participants: string[];
  initiatorId: string;
  targetId: string;
  timestamp: number;
  location: string;
  outcome: {
    success: boolean;
    relationshipChange: number;
    interestChange: number;
    respectChange: number;
    memory?: SharedMemory;
    grudge?: Grudge;
  };
}

export interface SocialFeedEntry {
  id: string;
  timestamp: number;
  type: 'interaction' | 'relationship_change' | 'romantic_event' | 'conflict';
  description: string;
  participants: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

// Main Game State Interface
export interface GameState {
  // Core Resources
  cash: number;
  reputation: number;
  policeHeat: number;
  currentDay: number;
  currentPhase: DayPhase;
  stipend: number;
  intel: number;
  influence: number;

  // Game Entities
  officers: Officer[];
  buildings: Building[];
  soldiers: StreetSoldier[];
  rivals: RivalGang[];

  // Social and Relationship System
  relationshipSystem: any; // Will be properly typed as RelationshipSystem
  socialFeed: SocialFeedEntry[];
  recentInteractions: SocialInteraction[];

  // Autonomous Behavior System
  behaviorSystem: any; // Will be properly typed as AutonomousBehaviorSystem
  lastBehaviorUpdate: number;

  // Intel & Upgrades
  unlockedUpgrades: string[];

  // Event System
  activeEvent: EventType;
  eventData: any;
  pendingEvents: { type: EventType; data: any }[];

  // Diplomacy
  activeDiplomacy: { rivalId: string; action: DiploAction } | null;

  // Family Council - Character System
  syndicateMembers: any[]; // Will be properly typed as Character[]
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
  
  // Street beef actions
  processStreetBeefs: () => void;
  triggerStreetBeef: (officer1Id: string, officer2Id: string) => void;
  
  // Civil war actions
  checkForCivilWar: () => void;
  triggerCivilWar: (officerId: string) => void;

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
  purchaseUpgrade: (upgradeId: string) => void;
  
  // Building actions
  acquireBuilding: (buildingType: BuildingType) => void;

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
  setCurrentScene: (scene: GameScene) => void;

  // Autonomous character actions
  updateAutonomousBehavior: () => void;
  getCharacterCurrentAction: (officerId: string) => string | null;
  canForceWork: (officerId: string) => { canWork: boolean; reason?: string };
  getPlayerInfluenceLevel: () => number;

  // Relationship system actions
  processSocialInteractions: () => void;
  getOfficerRelationships: (officerId: string) => { nodes: string[], edges: string[] };
  createManualInteraction: (initiatorId: string, targetId: string, type: string) => void;
}