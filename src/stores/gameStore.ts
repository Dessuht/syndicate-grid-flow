import { create } from 'zustand';
import { Character, CharacterTrait } from '@/types/character';
import { generateSoldier } from '@/lib/characterGenerator';

// Import all original types from separate file
import type {
  OfficerRank,
  DayPhase,
  GameScene,
  BuildingType,
  EventType,
  DiploAction,
  OfficerSkills,
  Officer,
  Building,
  StreetSoldier,
  RivalGang,
  PostConflictSummaryData,
  CouncilMotion,
  CompatibilityLike,
  CompatibilityDislike,
  StreetBeef,
  GameSpeed
} from './gameStoreTypes';



// Import GameState from types file and extend it
import type { GameState as BaseGameState, ResourceActions } from './gameStoreTypes';

export interface GameState extends BaseGameState, ResourceActions {
  // Intel & Upgrades
  unlockedUpgrades: string[];

  // Event system
  activeEvent: EventType;
  eventData: any;
  pendingEvents: { type: EventType; data: any }[];

  // Diplomacy
  activeDiplomacy: { rivalId: string; action: DiploAction } | null;

  // Family Council - Character System
  syndicateMembers: Character[];
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
  recentlyResolvedCivilWar: boolean;
  recentlyResolvedCivilWarCooldown: number;
  lastCivilWarCheckDay: number;

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
  purchaseUpgrade: (upgradeId: string) => void;
  
  // Building actions
  acquireBuilding: (buildingType: BuildingType) => void;
  
  // Street beef actions
  processStreetBeefs: () => void;
  triggerStreetBeef: (officer1Id: string, officer2Id: string) => void;
  
  // Civil war actions
  checkForCivilWar: () => void;
  triggerCivilWar: (officerId: string) => void;

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

}

// Constants
const PROMOTION_COST = 5000;
const PROMOTION_FACE_REQUIREMENT = 50;

const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    name: 'Big Chan',
    rank: 'Red Pole',
    energy: 100,
    maxEnergy: 100,
    assignedBuildingId: null,
    skills: { enforcement: 80, diplomacy: 30, logistics: 40, recruitment: 50 },
    loyalty: 75,
    daysAssigned: 0,
    daysIdle: 0,
    relationships: [
      {
        targetOfficerId: 'off-2',
        type: 'neutral',
        strength: 30,
        relationship: 30,
        interest: 0,
        respect: 40,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-3',
        type: 'neutral',
        strength: 45,
        relationship: 45,
        interest: 0,
        respect: 60,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-4',
        type: 'neutral',
        strength: 15,
        relationship: 15,
        interest: 0,
        respect: 30,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
    ],
    isBetraying: false,
    traits: ['Fearless', 'Ruthless'],
    isWounded: false,
    isArrested: false,
    daysToRecovery: 0,
    currentAgenda: null,
    face: 30,
    grudge: false,
    isTraitor: false,
    isSuccessor: false,
    isTestingWaters: false,
    likes: ['Respects Red Poles', 'Values Loyalty'],
    dislikes: ['Hates Ambitious', 'Distrusts Calculating'],
  },
  {
    id: 'off-2',
    name: 'Lily Wong',
    rank: 'White Paper Fan',
    energy: 80,
    maxEnergy: 80,
    assignedBuildingId: null,
    skills: { enforcement: 20, diplomacy: 85, logistics: 60, recruitment: 40 },
    loyalty: 85,
    daysAssigned: 0,
    daysIdle: 0,
    relationships: [
      {
        targetOfficerId: 'off-1',
        type: 'neutral',
        strength: 35,
        relationship: 35,
        interest: 0,
        respect: 50,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-3',
        type: 'neutral',
        strength: 50,
        relationship: 50,
        interest: 0,
        respect: 70,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-4',
        type: 'neutral',
        strength: 25,
        relationship: 25,
        interest: 0,
        respect: 45,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
    ],
    isBetraying: false,
    traits: ['Calculating', 'Silver Tongue'],
    isWounded: false,
    isArrested: false,
    daysToRecovery: 0,
    currentAgenda: null,
    face: 35,
    grudge: false,
    isTraitor: false,
    isSuccessor: false,
    isTestingWaters: false,
    likes: ['Appreciates Cunning', 'Respects Old School'],
    dislikes: ['Despises Hot-headed', 'Resents Ruthless'],
  },
  {
    id: 'off-3',
    name: 'Snake Eye',
    rank: 'Straw Sandal',
    energy: 90,
    maxEnergy: 90,
    assignedBuildingId: null,
    skills: { enforcement: 40, diplomacy: 50, logistics: 80, recruitment: 60 },
    loyalty: 65,
    daysAssigned: 0,
    daysIdle: 0,
    relationships: [
      {
        targetOfficerId: 'off-1',
        type: 'neutral',
        strength: 40,
        relationship: 40,
        interest: 0,
        respect: 55,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-2',
        type: 'neutral',
        strength: 45,
        relationship: 45,
        interest: 0,
        respect: 60,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-4',
        type: 'neutral',
        strength: 20,
        relationship: 20,
        interest: 0,
        respect: 35,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
    ],
    isBetraying: false,
    traits: ['Street Smart', 'Connected'],
    isWounded: false,
    isArrested: false,
    daysToRecovery: 0,
    currentAgenda: null,
    face: 25,
    grudge: false,
    isTraitor: false,
    isSuccessor: false,
    isTestingWaters: false,
    likes: ['Admires Ambition', 'Appreciates Cunning'],
    dislikes: ['Scorns Silver Tongue', 'Resents Ruthless'],
  },
  {
    id: 'off-4',
    name: 'Tommy Fist',
    rank: 'Blue Lantern',
    energy: 70,
    maxEnergy: 70,
    assignedBuildingId: null,
    skills: { enforcement: 50, diplomacy: 40, logistics: 50, recruitment: 85 },
    loyalty: 70,
    daysAssigned: 0,
    daysIdle: 0,
    relationships: [
      {
        targetOfficerId: 'off-1',
        type: 'neutral',
        strength: 30,
        relationship: 30,
        interest: 0,
        respect: 45,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-2',
        type: 'neutral',
        strength: 35,
        relationship: 35,
        interest: 0,
        respect: 50,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
      {
        targetOfficerId: 'off-3',
        type: 'neutral',
        strength: 25,
        relationship: 25,
        interest: 0,
        respect: 40,
        isFriend: false,
        isEnemy: false,
        isMortalEnemy: false,
        isLover: false,
        isInLove: false,
        sharedMemories: [],
        grudges: []
      },
    ],
    isBetraying: false,
    traits: ['Loyal Dog', 'Street Smart'],
    isWounded: false,
    isArrested: false,
    daysToRecovery: 0,
    currentAgenda: null,
    face: 40,
    grudge: false,
    isTraitor: false,
    isSuccessor: true,
    isTestingWaters: false,
    likes: ['Values Loyalty', 'Respects Old School'],
    dislikes: ['Hates Ambitious', 'Distrusts Calculating'],
  },
];

const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    name: 'Golden Dragon Noodles',
    type: 'Noodle Shop',
    baseRevenue: 500,
    heatGen: 1,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: false,
    foodProvided: 30,
    entertainmentProvided: 5,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
  {
    id: 'bld-2',
    name: 'Lucky Fortune Parlor',
    type: 'Mahjong Parlor',
    baseRevenue: 800,
    heatGen: 3,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: true,
    foodProvided: 0,
    entertainmentProvided: 40,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
  {
    id: 'bld-3',
    name: 'Harbor Warehouse #7',
    type: 'Warehouse',
    baseRevenue: 400,
    heatGen: 2,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: false,
    foodProvided: 0,
    entertainmentProvided: 0,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
  {
    id: 'bld-4',
    name: 'Neon Paradise Club',
    type: 'Nightclub',
    baseRevenue: 600,
    heatGen: 4,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: true,
    foodProvided: 10,
    entertainmentProvided: 60,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
  {
    id: 'bld-5',
    name: 'Jade Tiger Kitchen',
    type: 'Noodle Shop',
    baseRevenue: 450,
    heatGen: 1,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: false,
    foodProvided: 35,
    entertainmentProvided: 5,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
  {
    id: 'bld-6',
    name: 'OCTB Precinct',
    type: 'Police Station',
    baseRevenue: 0,
    heatGen: -15,
    isOccupied: false,
    assignedOfficerId: null,
    inactiveUntilDay: null,
    isIllicit: false,
    foodProvided: 0,
    entertainmentProvided: 0,
    isUpgraded: false,
    isRebelBase: false,
    rebelSoldierCount: 0,
  },
];

const SOLDIER_NAMES = ['Ah Keung', 'Wai Gor', 'Siu Ming', 'Ah Fat', 'Lok Jai', 'Ah Sing', 'Chi Wai', 'Hung Jai'];

const INITIAL_SOLDIERS: StreetSoldier[] = Array.from({ length: 6 }, (_, i) => ({
  id: `sol-${i + 1}`,
  name: SOLDIER_NAMES[i],
  loyalty: 60 + Math.floor(Math.random() * 20),
  needs: {
    food: 70 + Math.floor(Math.random() * 20),
    entertainment: 50 + Math.floor(Math.random() * 30),
    pay: 60,
  },
  skill: 30 + Math.floor(Math.random() * 40),
  isDeserting: false,
}));

const INITIAL_RIVALS: RivalGang[] = [
  {
    id: 'rival-1',
    name: '14K Triad',
    district: 'Mong Kok',
    strength: 45,
    relationship: -20,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false
  },
  {
    id: 'rival-2',
    name: 'Sun Yee On',
    district: 'Tsim Sha Tsui',
    strength: 60,
    relationship: 10,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false
  },
  {
    id: 'rival-3',
    name: 'Wo Shing Wo',
    district: 'Central',
    strength: 75,
    relationship: -40,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false
  },
];

export const useGameStore = create<GameState>((set, get) => {
  const store: GameState = {
    // Core Resources
    cash: 5000,
    reputation: 50,
    policeHeat: 15,
    intel: 0,
    influence: 10,
    currentDay: 1,
    currentPhase: 'morning' as DayPhase,
    stipend: 50,

    // Time System
    gameSpeed: 1 as GameSpeed,
    isPlaying: false,
    timeInterval: null,
    phaseProgress: 0,

    // Game Entities
    officers: INITIAL_OFFICERS,
    buildings: INITIAL_BUILDINGS,
    soldiers: INITIAL_SOLDIERS,
    rivals: INITIAL_RIVALS,

    // Social and Relationship System
    relationshipSystem: {},
    socialFeed: [],
    recentInteractions: [],

    // Autonomous Behavior System
    behaviorSystem: {},
    lastBehaviorUpdate: 0,

    // Event System
    activeEvent: null,
    eventData: null,
    pendingEvents: [],

    // Intel & Upgrades
    unlockedUpgrades: [],

    // Diplomacy
    activeDiplomacy: null,

    // Family Council - Character System
    syndicateMembers: [],
    recruitCost: 500,

    // Home District Racket
    homeDistrictLeaderId: null,
    homeDistrictHeat: 10,
    homeDistrictRevenue: 0,
    officerCutIncreased: false,

    // Territory Stats
    territoryFriction: 0,
    territoryInfluence: 20,
    frictionInterval: null,

    // Street War System
    streetWarRivalId: null,

    // Civil War State
    isCivilWarActive: false,
    rebelOfficerId: null,
    recentlyResolvedCivilWar: false,
    recentlyResolvedCivilWarCooldown: 0,
    lastCivilWarCheckDay: 0,

    // Council System
    currentScene: 'DISTRICT' as GameScene,
    councilMotions: [],
    
    // Daily Briefing State
    dailyBriefingIgnored: false,
    
    // Street Beef (Officer Friction) State
    activeStreetBeefs: [],
    beefDaysTracker: {},

    // Basic actions
    assignOfficer: (officerId: string, buildingId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        const building = state.buildings.find(b => b.id === buildingId);

        if (!officer || !building || building.isOccupied || officer.assignedBuildingId) {
          return state;
        }

        return {
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, assignedBuildingId: buildingId, daysIdle: 0 }
              : o
          ),
          buildings: state.buildings.map(b =>
            b.id === buildingId
              ? { ...b, isOccupied: true, assignedOfficerId: officerId }
              : b
          ),
        };
      });
    },

    unassignOfficer: (officerId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer || !officer.assignedBuildingId) return state;

        const buildingId = officer.assignedBuildingId;
        return {
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, assignedBuildingId: null, daysAssigned: 0 }
              : o
          ),
          buildings: state.buildings.map(b =>
            b.id === buildingId
              ? { ...b, isOccupied: false, assignedOfficerId: null }
              : b
          ),
        };
      });
    },

    advancePhase: () => {
      const currentState = get();
      
      // Don't allow phase advancement if there's an active blocking event
      const blockingEvents = ['dailyBriefing', 'policeShakedown', 'streetBeef', 'coupAttempt', 'newEra'];
      if (currentState.activeEvent && blockingEvents.includes(currentState.activeEvent)) {
        return;
      }
      
      // Clear any non-blocking events to prevent getting stuck
      if (currentState.activeEvent && !blockingEvents.includes(currentState.activeEvent)) {
        set({ activeEvent: null, eventData: null });
      }
      
      const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
      const currentIndex = phases.indexOf(currentState.currentPhase);
      
      if (currentIndex === -1) {
        console.error('Invalid current phase:', currentState.currentPhase);
        set({ currentPhase: 'morning' });
        return;
      }

      const nextPhase = phases[(currentIndex + 1) % phases.length];
      const nextDay = nextPhase === 'morning' ? currentState.currentDay + 1 : currentState.currentDay;
      
      // Calculate daily revenue and expenses at day transition
        let cashChange = 0;
        let homeDistrictHeatChange = 0;
        
        if (currentState.currentPhase === 'night' && nextPhase === 'morning') {
          // Daily revenue from occupied buildings
          const dailyRevenue = currentState.buildings
            .filter(b => b.isOccupied && !b.inactiveUntilDay)
            .reduce((sum, b) => sum + b.baseRevenue, 0);
          cashChange += dailyRevenue;
          
          // Soldier stipends
          const stipendCost = currentState.soldiers.length * currentState.stipend;
          cashChange -= stipendCost;
          
          // Home district racket revenue
          if (currentState.homeDistrictLeaderId) {
            const member = currentState.syndicateMembers.find(m => m.id === currentState.homeDistrictLeaderId);
            if (member) {
              const baseRevenue = 300;
              const loyaltyBonus = Math.floor((member.stats as any).loyalty * 2);
              const totalRacketRevenue = baseRevenue + loyaltyBonus;
              cashChange += totalRacketRevenue;
              homeDistrictHeatChange = Math.min(100, currentState.homeDistrictHeat + 2);
            }
          }
        
        // Check for council meeting (every 10 days)
        if (nextDay % 10 === 0) {
          get().generateCouncilMotions();
          set({
            currentScene: 'COUNCIL',
            currentPhase: 'morning',
            currentDay: nextDay,
            cash: currentState.cash + cashChange,
            homeDistrictHeat: homeDistrictHeatChange
          });
          return;
        }
      }
      
      
      // Process street beefs
      try {
        currentState.processStreetBeefs();
      } catch (error) {
        console.warn('Street beef processing failed:', error);
      }
      
      // Clear civil war cooldown if expired
      if (currentState.recentlyResolvedCivilWarCooldown > 0 && nextDay >= currentState.recentlyResolvedCivilWarCooldown) {
        set({ recentlyResolvedCivilWar: false, recentlyResolvedCivilWarCooldown: 0 });
      }
      
      // Check for civil war conditions (but not if there's already an event)
      if (!currentState.activeEvent) {
        try {
          currentState.checkForCivilWar();
        } catch (error) {
          console.warn('Civil war check failed:', error);
        }
      }
      
      // Random event generation (only if no active event)
      let newEvent = null;
      if (!currentState.activeEvent && Math.random() < 0.05) {
        const eventTypes = ['policeRaid', 'betrayal', 'rivalAttack', 'criminalCaught', 'soldierDesertion'];
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        switch (randomEventType) {
          case 'policeRaid':
            newEvent = { type: 'policeRaid' as const, data: {} };
            break;
          case 'betrayal':
            const disloyalOfficers = currentState.officers.filter(o => o.loyalty < 50);
            if (disloyalOfficers.length > 0) {
              const randomOfficer = disloyalOfficers[Math.floor(Math.random() * disloyalOfficers.length)];
              newEvent = { type: 'betrayal' as const, data: { officerId: randomOfficer.id } };
            }
            break;
          case 'rivalAttack':
            const hostileRivals = currentState.rivals.filter(r => r.relationship < -30 && !r.isActiveConflict);
            if (hostileRivals.length > 0) {
              const randomRival = hostileRivals[Math.floor(Math.random() * hostileRivals.length)];
              newEvent = { type: 'rivalAttack' as const, data: { rivalId: randomRival.id } };
            }
            break;
        }
      }
      
      // Street beef generation
      if (Math.random() < 0.03 && currentState.officers.length >= 2) {
        const officer1 = currentState.officers[Math.floor(Math.random() * currentState.officers.length)];
        const officer2 = currentState.officers[Math.floor(Math.random() * currentState.officers.length)];
        
        if (officer1.id !== officer2.id && !currentState.activeStreetBeefs.some(
          beef => (beef.officer1Id === officer1.id && beef.officer2Id === officer2.id) ||
                 (beef.officer1Id === officer2.id && beef.officer2Id === officer1.id)
        )) {
          const newBeef = {
            officer1Id: officer1.id,
            officer2Id: officer2.id,
            daysActive: 0,
            isResolved: false
          };
          
          set(state => ({
            activeStreetBeefs: [...state.activeStreetBeefs, newBeef]
          }));
        }
      }
      
      // Apply phase change
      set({
        currentPhase: nextPhase,
        currentDay: nextDay,
        cash: currentState.cash + cashChange,
        homeDistrictHeat: homeDistrictHeatChange || currentState.homeDistrictHeat,
        activeEvent: newEvent?.type || null,
        eventData: newEvent?.data || null
      });
      
      // Auto-dismiss temporary notification events
      if (newEvent?.type === 'nightclubSuccess') {
        setTimeout(() => {
          set({ activeEvent: null, eventData: null });
        }, 3000);
      }
      
      console.log(`Advanced to day ${nextDay}, phase ${nextPhase}`);
    },

    setStipend: (amount: number) => {
      set({ stipend: Math.max(0, Math.min(200, amount)) });
    },

    reduceHeat: (amount: number) => {
        set((state) => ({ policeHeat: Math.max(0, state.policeHeat - amount) }));
      },

    hostNightclub: () => {
      set((state) => {
        const nightclub = state.buildings.find(b => b.type === 'Nightclub');
        if (!nightclub || !nightclub.assignedOfficerId) return state;

        const officer = state.officers.find(o => o.id === nightclub.assignedOfficerId);
        if (!officer) return state;

        // Calculate revenue based on officer's skills
        const baseRevenue = 500;
        const diplomacyBonus = Math.floor(officer.skills.diplomacy * 5);
        const logisticsBonus = Math.floor(officer.skills.logistics * 3);
        const totalRevenue = baseRevenue + diplomacyBonus + logisticsBonus;

        // Increase heat slightly
        const heatIncrease = 5;

        return {
          cash: state.cash + totalRevenue,
          homeDistrictHeat: Math.min(100, state.homeDistrictHeat + heatIncrease),
          activeEvent: 'nightclubSuccess' as const,
          eventData: {
            officerName: officer.name,
            revenue: totalRevenue,
            heatIncrease: heatIncrease
          }
        };
      });
    },

    setCurrentScene: (scene: GameScene) => {
      set({ currentScene: scene });
    },

    // Officer Interaction Actions
    shareTea: (officerId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer) return state;

        // 1. Increase Loyalty (+5)
        const newLoyalty = Math.min(100, officer.loyalty + 5);

        // 2. Reveal Agenda (if null)
        let newAgenda = officer.currentAgenda;
        if (!newAgenda) {
          const AGENDAS = [
            'Wants to own a Noodle Shop',
            'Wants to own a Nightclub',
            'Wants a higher rank',
            'Wants to reduce police heat',
            'Wants a trade agreement with Sun Yee On',
          ];
          newAgenda = AGENDAS[Math.floor(Math.random() * AGENDAS.length)];
        }

        // 3. Spend time (modelled as energy cost)
        const newEnergy = Math.max(0, officer.energy - 10);

        return {
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, loyalty: newLoyalty, currentAgenda: newAgenda, energy: newEnergy }
              : o
          ),
        };
      });
    },

    giveBonus: (officerId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        const cost = 1000;
            if (!officer || state.cash < cost) return state;

        // 1. Spend $1,000 Cash
        // 2. Boost Loyalty (+20)
        const newLoyalty = Math.min(100, officer.loyalty + 20);

        // 3. Lower 'Hunger' for promotion (clear agenda if promotion/building related)
        let newAgenda = officer.currentAgenda;
        if (newAgenda && (newAgenda.includes('rank') || newAgenda.includes('own'))) {
          newAgenda = null;
        }

        return {
          cash: state.cash - cost,
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, loyalty: newLoyalty, currentAgenda: newAgenda }
              : o
          ),
        };
      });
    },

    reprimandOfficer: (officerId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer) return state;

        // 1. Lower District Heat (-10)
        const newHeat = Math.max(0, state.policeHeat - 10);

        // 2. Significantly lower Loyalty (-20)
        const newLoyalty = Math.max(0, officer.loyalty - 20);
        
        let updates: Partial<GameState> = {
          policeHeat: newHeat,
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, loyalty: newLoyalty }
              : o
          ),
        };

        // 3. Risk of Snitching/Quitting if Loyalty is low (< 20)
        if (newLoyalty < 20 && Math.random() < 0.3) {
          if (Math.random() < 0.5) {
            // Snitch: Increase global heat, officer arrested
            updates.policeHeat = Math.min(100, state.policeHeat + 10);
            updates.officers = state.officers.map(o =>
              o.id === officerId
                ? { ...o, loyalty: newLoyalty, isArrested: true, assignedBuildingId: null, energy: 0 }
                : o
            );
            updates.pendingEvents = [...state.pendingEvents, {
              type: 'criminalCaught',
              data: { criminalName: officer.name, crime: 'snitching' }
            }];
          } else {
            // Quit: Officer removed
            updates.officers = state.officers.filter(o => o.id !== officerId);
            updates.buildings = state.buildings.map(b =>
              b.assignedOfficerId === officerId
                ? { ...b, isOccupied: false, assignedOfficerId: null }
                : b
            );
          }
        }

        return { ...state, ...updates };
      });
    },

    promoteOfficer: (officerId: string, newRank: OfficerRank) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        const cost = PROMOTION_COST;
        const requiredFace = PROMOTION_FACE_REQUIREMENT;

        if (!officer || state.cash < cost || officer.face < requiredFace) return state;
        if (officer.rank === newRank) return state;

        // Determine skill boost based on new rank
        let skillBoost: Partial<OfficerSkills> = {};
        let maxEnergyBoost = 0;
        let loyaltyBoost = 0;

        switch (newRank) {
          case 'Deputy (438)':
            skillBoost = { diplomacy: 15, logistics: 15 };
            maxEnergyBoost = 20;
            loyaltyBoost = 10;
            break;
          case 'Dragonhead (489)':
            skillBoost = { enforcement: 20, recruitment: 20 };
            maxEnergyBoost = 30;
            loyaltyBoost = 20;
            break;
          default:
            return state;
        }

        return {
          cash: state.cash - cost,
          officers: state.officers.map(o =>
            o.id === officerId
              ? {
                  ...o,
                  rank: newRank,
                  face: 0, // Reset face after promotion
                  loyalty: Math.min(100, o.loyalty + loyaltyBoost),
                  maxEnergy: o.maxEnergy + maxEnergyBoost,
                  energy: o.energy + maxEnergyBoost,
                  skills: {
                    enforcement: Math.min(100, o.skills.enforcement + (skillBoost.enforcement || 0)),
                    diplomacy: Math.min(100, o.skills.diplomacy + (skillBoost.diplomacy || 0)),
                    logistics: Math.min(100, o.skills.logistics + (skillBoost.logistics || 0)),
                    recruitment: Math.min(100, o.skills.recruitment + (skillBoost.recruitment || 0)),
                  }
                }
              : o
          ),
          reputation: state.reputation + 10, // Reputation gain for successful ceremony
        };
      });
    },

    designateSuccessor: (officerId: string) => {
      set((state) => ({
        officers: state.officers.map(o => ({
          ...o,
          isSuccessor: o.id === officerId,
        })),
      }));
    },

    // Council Actions
    generateCouncilMotions: () => {
      const state = get();
      const motions: CouncilMotion[] = [];
      const councilMembers = state.officers.filter(o => o.rank !== 'Blue Lantern').slice(0, 3); // Top 3 non-Blue Lanterns

      // Motion 1: Expansion (Invade Sun Yee On)
      const rivalToAttack = state.rivals.find(r => r.name === 'Sun Yee On');
      if (rivalToAttack && !rivalToAttack.isActiveConflict) {
        const motion: CouncilMotion = {
          id: 'motion-1',
          title: 'Expand Territory: Invade Sun Yee On',
          description: 'Launch a turf war against Sun Yee On in Tsim Sha Tsui. High risk, high reward.',
          type: 'expansion',
          effect: (s) => ({
            territoryFriction: Math.min(100, s.territoryFriction + 50),
            rivals: s.rivals.map(r => r.id === rivalToAttack.id ? { ...r, isActiveConflict: true } : r),
          }),
          officerVotes: {},
          isVetoed: false,
        };
        motions.push(motion);
      }

      // Motion 2: Internal (Raise Officer Cut)
      const motion2: CouncilMotion = {
        id: 'motion-2',
        title: 'Internal Affairs: Raise Officer Cut',
        description: 'Increase officer pay by 20% of daily revenue. Boosts loyalty but cuts profits.',
        type: 'internal',
        effect: (s) => ({
          officers: s.officers.map(o => ({ ...o, loyalty: Math.min(100, o.loyalty + 30) })),
          officerCutIncreased: true,
        }),
        officerVotes: {},
        isVetoed: false,
      };
      motions.push(motion2);

      // Determine officer votes (based on loyalty/rank)
      const finalMotions = motions.map(motion => {
        const officerVotes: Record<string, 'yes' | 'no'> = {};
        councilMembers.forEach(officer => {
          let vote = 'no';
          // Simple voting logic: High loyalty/high rank tends to vote 'yes' on expansion/internal stability
          if (motion.type === 'expansion') {
            vote = officer.loyalty > 60 || officer.rank === 'Red Pole' ? 'yes' : 'no';
          } else if (motion.type === 'internal') {
            vote = officer.loyalty < 80 || officer.rank === 'White Paper Fan' ? 'yes' : 'no';
          }
          officerVotes[officer.id] = vote as 'yes' | 'no';
        });
        return { ...motion, officerVotes };
      });

      set({ councilMotions: finalMotions });
    },

    handleCouncilVote: (motionId: string, playerVote: 'yes' | 'no') => {
      set((state) => {
        const motion = state.councilMotions.find(m => m.id === motionId);
        if (!motion) return state;

        const councilMembers = state.officers.filter(o => o.rank !== 'Blue Lantern').slice(0, 3);
        
        let yesCount = 0;
        let noCount = 0;
        councilMembers.forEach(o => {
          if (motion.officerVotes[o.id] === 'yes') yesCount++;
          else noCount++;
        });

        const councilMajorityVote = yesCount > noCount ? 'yes' : 'no';
        const isVeto = playerVote !== councilMajorityVote;

        let updates: Partial<GameState> = {};
        let updatedOfficers = state.officers;

        if (isVeto) {
          // Player vetoed the council majority
          updatedOfficers = state.officers.map(o => {
            if (motion.officerVotes[o.id] === councilMajorityVote) {
              // Officers who were overruled lose loyalty and gain a grudge
              return { ...o, loyalty: Math.max(0, o.loyalty - 20), grudge: true };
            }
            return o;
          });
          updates.influence = Math.max(0, state.influence - 5); // Veto costs influence
        } else {
          // Player voted with majority, motion passes (or fails gracefully)
          if (playerVote === 'yes') {
            updates = motion.effect(state);
          }
          updates.influence = Math.min(100, state.influence + 5); // Gain influence for consensus
        }

        // Mark motion as resolved
        const updatedMotions = state.councilMotions.filter(m => m.id !== motionId);

        return {
          ...updates,
          officers: updatedOfficers,
          councilMotions: updatedMotions,
          // If no motions left, exit council scene
          currentScene: updatedMotions.length === 0 ? 'DISTRICT' : 'COUNCIL',
        };
      });
    },

    useInfluenceToOrderVote: (motionId: string, officerId: string, vote: 'yes' | 'no') => {
      set((state) => {
        const motion = state.councilMotions.find(m => m.id === motionId);
        const officer = state.officers.find(o => o.id === officerId);
        if (!motion || !officer || state.influence < 10) return state;

        // Cost 10 Influence
        const newInfluence = state.influence - 10;

        // Force the officer's vote without loyalty penalty
        const updatedMotions = state.councilMotions.map(m => 
          m.id === motionId 
            ? { ...m, officerVotes: { ...m.officerVotes, [officerId]: vote } }
            : m
        );

        return {
          influence: newInfluence,
          councilMotions: updatedMotions,
        };
      });
    },

    exitCouncil: () => {
      set({ currentScene: 'DISTRICT', councilMotions: [] });
    },

    // Event handlers
    handleRaidChoice: (choice: 'bribe' | 'stand' | 'escape') => {
      set((state) => {
        let updates: Partial<GameState> = { activeEvent: null, eventData: null };

        // Find White Paper Fan for bribe bonus
        const whitePaperFan = state.officers.find(o => o.rank === 'White Paper Fan' && o.assignedBuildingId);
        const bribeBonus = whitePaperFan ? Math.floor(whitePaperFan.skills.diplomacy * 10) : 0;

        switch (choice) {
          case 'bribe':
            const bribeCost = Math.max(500, 2000 - bribeBonus);
            if (state.cash < bribeCost) return state;

            updates = {
              ...updates,
              cash: state.cash - bribeCost,
              policeHeat: Math.max(0, state.policeHeat - 30),
            };
            break;

          case 'stand':
            // --- Combat Resolution for Raid ---
            const raidPower = 50;  // Base police strength

            // Calculate our strength: Officer Loyalty Sum + Soldier Count * 5
            const officerLoyaltySum = state.officers.reduce((sum, o) => sum + o.loyalty, 0);
            const soldierStrength = state.soldiers.length * 5;
            const ourRaidStrength = officerLoyaltySum + soldierStrength;
            const success = ourRaidStrength > raidPower;

            let soldiersLost: number;
            let repChange: number;
            let officerFaceChange = 0;
            let officerLoyaltyChange = 0;
            let officerStatusEffect: PostConflictSummaryData['officerStatusEffect'] = 'none';

            // Find a primary officer involved (Red Pole preferred, otherwise first assigned officer)
            const redPole = state.officers.find(o => o.rank === 'Red Pole');
            const targetOfficer = redPole || state.officers.find(o => o.assignedBuildingId) || state.officers[0];

            if (success) {
              repChange = 5;  // Smaller rep gain for raid defense
              officerFaceChange = 10;
              soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.1 + 0.05));  // 5-15% loss
            } else {
              repChange = -15;
              officerLoyaltyChange = -15;
              soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.2 + 0.2));  // 20-40% loss

              if (Math.random() < 0.2 && targetOfficer) {
                officerStatusEffect = Math.random() < 0.5 ? 'wounded' : 'arrested';
              }
            }

            // Apply consequences
            const remainingSoldiers = state.soldiers.slice(soldiersLost);
            const updatedOfficers = state.officers.map(o => {
              if (o.id === targetOfficer?.id) {
                let newOfficer = { ...o };
                if (success) {
                  if (!newOfficer.traits.includes('Battle Hardened' as any)) {
                    newOfficer.traits = [...newOfficer.traits, 'Battle Hardened' as any];
                  }
                } else {
                  newOfficer.loyalty = Math.max(0, newOfficer.loyalty + officerLoyaltyChange);
                  if (officerStatusEffect === 'wounded') {
                    newOfficer.isWounded = true;
                    newOfficer.daysToRecovery = 3;
                    newOfficer.energy = Math.max(0, Math.floor(newOfficer.maxEnergy * 0.2));
                  } else if (officerStatusEffect === 'arrested') {
                    newOfficer.isArrested = true;
                    newOfficer.assignedBuildingId = null;
                    newOfficer.energy = 0;
                  }
                }
                return newOfficer;
              }
              return o;
            });

            updates.reputation = Math.max(0, state.reputation + repChange);
            updates.soldiers = remainingSoldiers;
            updates.officers = updatedOfficers;

            // Queue summary event
            updates.pendingEvents = [...state.pendingEvents, {
              type: 'postConflictSummary',
              data: {
                type: 'raid',
                outcome: success ? 'success' : 'failure',
                officerId: targetOfficer?.id || null,
                soldiersLost,
                reputationChange: repChange,
                faceChange: officerFaceChange,
                loyaltyChange: officerLoyaltyChange,
                officerStatusEffect,
              } as PostConflictSummaryData
            }];
            break;

          case 'escape':
            const occupiedBuildings = state.buildings.filter(b => b.isOccupied && b.type !== 'Police Station');
            if (occupiedBuildings.length > 0) {
              const targetBuilding = occupiedBuildings[Math.floor(Math.random() * occupiedBuildings.length)];
              updates = {
                ...updates,
                buildings: state.buildings.map(b =>
                  b.id === targetBuilding.id
                    ? { ...b, inactiveUntilDay: state.currentDay + 3, isOccupied: false, assignedOfficerId: null }
                    : b
                ),
                officers: state.officers.map(o =>
                  o.assignedBuildingId === targetBuilding.id
                    ? { ...o, assignedBuildingId: null }
                    : o
                ),
              };
            }
            break;
        }

        // Check for pending events
        if (updates.pendingEvents?.length > 0) {
          const [nextEvent, ...rest] = updates.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleBetrayalChoice: (choice: 'forgive' | 'punish' | 'exile') => {
      set((state) => {
        const betrayerId = state.eventData?.officerId;
        if (!betrayerId) return { ...state, activeEvent: null, eventData: null };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null };

        switch (choice) {
          case 'forgive':
            updates.officers = state.officers.map(o =>
              o.id === betrayerId
                ? { ...o, isBetraying: false, loyalty: Math.min(100, o.loyalty + 20) }
                : o
            );
            updates.reputation = Math.max(0, state.reputation - 10);  // Looks weak
            break;

          case 'punish':
            updates.officers = state.officers.map(o => {
              if (o.id === betrayerId) {
                return {
                  ...o,
                  isBetraying: false,
                  loyalty: Math.max(0, o.loyalty - 30),
                  energy: Math.max(0, o.energy - 40)
                };
              }

              // Other officers fear you
              return {
                ...o,
                loyalty: Math.min(100, o.loyalty + 5)
              };
            });
            updates.policeHeat = Math.min(100, state.policeHeat + 5);
            break;

          case 'exile':
            updates.officers = state.officers.filter(o => o.id !== betrayerId);
            updates.buildings = state.buildings.map(b =>
              b.assignedOfficerId === betrayerId
                ? { ...b, isOccupied: false, assignedOfficerId: null }
                : b
            );
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleCriminalChoice: (choice: 'execute' | 'enslave' | 'spy') => {
      set((state) => {
        let updates: Partial<GameState> = { activeEvent: null, eventData: null };

        switch (choice) {
          case 'execute':
            updates.policeHeat = Math.max(0, state.policeHeat - 10);
            updates.soldiers = state.soldiers.map(s => ({
              ...s,
              loyalty: Math.max(0, s.loyalty - 5),  // Soldiers fear you
            }));
            updates.reputation = Math.min(100, state.reputation + 5);
            break;

          case 'enslave':
            // Add a free worker (soldier with 0 pay needs)
            const newSlave: StreetSoldier = {
              id: `sol-${Date.now()}`,
              name: state.eventData?.criminalName || 'Prisoner',
              loyalty: 20,
              needs: {
                food: 50,
                entertainment: 30,
                pay: 100,  // Doesn't need pay
              },
              skill: 20,
              isDeserting: false,
            };
            updates.soldiers = [...state.soldiers, newSlave];
            break;

          case 'spy':
            updates.intel = state.intel + 50;
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleRivalAttackChoice: (choice: 'fight' | 'negotiate' | 'retreat') => {
      set((state) => {
        const rivalId = state.eventData?.rivalId;
        const rival = state.rivals.find(r => r.id === rivalId);
        if (!rival) return { ...state, activeEvent: null, eventData: null };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null };

        // Calculate our strength
        const ourStrength = state.soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);
        const redPole = state.officers.find(o => o.rank === 'Red Pole');
        const strengthBonus = redPole ? redPole.skills.enforcement : 0;
        const totalStrength = ourStrength + strengthBonus;

        switch (choice) {
          case 'fight':
            if (totalStrength > rival.strength) {
              // Victory
              updates.reputation = Math.min(100, state.reputation + 15);
              updates.cash = state.cash + 1000;
              updates.rivals = state.rivals.map(r =>
                r.id === rivalId
                  ? { ...r, relationship: r.relationship - 30, strength: Math.max(10, r.strength - 20) }
                  : r
              );
            } else {
              // Defeat
              updates.reputation = Math.max(0, state.reputation - 20);
              updates.cash = Math.max(0, state.cash - 1500);
              updates.soldiers = state.soldiers.slice(0, -1);  // Lose a soldier
            }
            updates.policeHeat = Math.min(100, state.policeHeat + 15);
            break;

          case 'negotiate':
            updates.cash = Math.max(0, state.cash - 800);
            updates.rivals = state.rivals.map(r =>
              r.id === rivalId
                ? { ...r, relationship: r.relationship + 10 }
                : r
            );
            break;

          case 'retreat':
            updates.reputation = Math.max(0, state.reputation - 10);
            const randomBuilding = state.buildings.filter(b => b.isOccupied)[0];
            if (randomBuilding) {
              updates.buildings = state.buildings.map(b =>
                b.id === randomBuilding.id
                  ? { ...b, inactiveUntilDay: state.currentDay + 2, isOccupied: false, assignedOfficerId: null }
                  : b
              );
            }
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleTerritoryUltimatum: (choice: 'pay' | 'refuse') => {
      set((state) => {
        let updates: Partial<GameState> = { activeEvent: null, eventData: null };

        switch (choice) {
          case 'pay':
            const payment = Math.floor(state.cash * 0.2);
            updates.cash = Math.max(0, state.cash - payment);

            // Reduce loyalty of assigned member
            if (state.homeDistrictLeaderId) {
              updates.syndicateMembers = state.syndicateMembers.map(m =>
                m.id === state.homeDistrictLeaderId
                  ? { ...m, stats: { ...m.stats, loyalty: Math.max(0, (m.stats as any).loyalty - 20) } }
                  : m
              );
            }
            break;

          case 'refuse':
            updates.territoryFriction = 0;
            updates.rivals = state.rivals.map(r =>
              r.id === 'rival-3'
                ? { ...r, isActiveConflict: true }
                : r
            );
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleStreetWarChoice: (choice: 'bribe' | 'fight') => {
      set((state) => {
        const rivalId = state.streetWarRivalId;
        if (!rivalId) return { ...state, activeEvent: null, eventData: null, streetWarRivalId: null };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null, streetWarRivalId: null };

        const rival = state.rivals.find(r => r.id === rivalId);
        if (!rival) return updates;

        // Find Red Pole for combat consequences
        const redPole = state.officers.find(o => o.rank === 'Red Pole');

        switch (choice) {
          case 'bribe':
            // Pay large bribe, reset conflict status and friction, lower reputation
            const bribeCost = Math.max(5000, rival.strength * 100);
            if (state.cash >= bribeCost) {
              updates.cash = state.cash - bribeCost;
              updates.reputation = Math.max(0, state.reputation - 20);
              updates.rivals = state.rivals.map(r =>
                r.id === rivalId
                  ? { ...r, relationship: Math.min(100, r.relationship + 30), isActiveConflict: false }
                  : r
              );
              updates.territoryFriction = 0;  // Reset friction after resolution
            }
            break;

          case 'fight':
            // --- Combat Resolution for Street War ---
            const ourSoldiersStrength = state.soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);
            const officerContribution = redPole ? redPole.skills.enforcement : 0;
            const ourTotalStrength = ourSoldiersStrength + officerContribution;
            const success = ourTotalStrength > rival.strength;

            let soldiersLost: number;
            let repChange: number;
            let officerFaceChange = 0;
            let officerLoyaltyChange = 0;
            let officerStatusEffect: PostConflictSummaryData['officerStatusEffect'] = 'none';

            if (success) {
              repChange = 15;
              officerFaceChange = 10;
              soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.1 + 0.1));  // 10-20% loss
            } else {
              repChange = -20;
              officerLoyaltyChange = -15;
              soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.2 + 0.3));  // 30-50% loss

              if (Math.random() < 0.2 && redPole) {
                officerStatusEffect = Math.random() < 0.5 ? 'wounded' : 'arrested';
              }
            }

            // Apply consequences
            const remainingSoldiers = state.soldiers.slice(soldiersLost);
            let updatedOfficers = state.officers.map(o => {
              if (o.id === redPole?.id) {
                let newOfficer = { ...o };
                if (success) {
                  if (!newOfficer.traits.includes('Battle Hardened' as any)) {
                    newOfficer.traits = [...newOfficer.traits, 'Battle Hardened' as any];
                  }
                } else {
                  newOfficer.loyalty = Math.max(0, newOfficer.loyalty + officerLoyaltyChange);
                  if (officerStatusEffect === 'wounded') {
                    newOfficer.isWounded = true;
                    newOfficer.daysToRecovery = 3;
                    newOfficer.energy = Math.max(0, Math.floor(newOfficer.maxEnergy * 0.2));
                  } else if (officerStatusEffect === 'arrested') {
                    newOfficer.isArrested = true;
                    newOfficer.assignedBuildingId = null;
                    newOfficer.energy = 0;
                  }
                }
                return newOfficer;
              }
              return o;
            });

            // If failure, lose most profitable building (as per original logic)
            let updatedBuildings = state.buildings;
            if (!success) {
              const occupiedBuildings = state.buildings.filter(b => b.isOccupied);
              if (occupiedBuildings.length > 0) {
                const mostProfitableBuilding = occupiedBuildings.reduce((max, building) =>
                  building.baseRevenue > max.baseRevenue ? building : max
                );
                updatedBuildings = state.buildings.map(b =>
                  b.id === mostProfitableBuilding.id
                    ? { ...b, inactiveUntilDay: state.currentDay + 2, isOccupied: false, assignedOfficerId: null }
                    : b
                );
              }
            }

            // Reset conflict status and friction
            const updatedRivals = state.rivals.map(r =>
              r.id === rivalId
                ? { ...r, isActiveConflict: false }
                : r
            );

            updates.reputation = Math.max(0, state.reputation + repChange);
            updates.soldiers = remainingSoldiers;
            updates.officers = updatedOfficers;
            updates.buildings = updatedBuildings;
            updates.rivals = updatedRivals;
            updates.territoryFriction = 0;  // Reset friction after conflict resolution

            // Queue summary event
            updates.pendingEvents = [...state.pendingEvents, {
              type: 'postConflictSummary',
              data: {
                type: 'streetWar',
                outcome: success ? 'success' : 'failure',
                officerId: redPole?.id || null,
                soldiersLost,
                reputationChange: repChange,
                faceChange: officerFaceChange,
                loyaltyChange: officerLoyaltyChange,
                officerStatusEffect,
                rivalName: rival.name,
              } as PostConflictSummaryData
            }];
            break;
        }

        // Check for pending events
        if (updates.pendingEvents?.length > 0) {
          const [nextEvent, ...rest] = updates.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleCoupResolution: (choice: 'raid' | 'negotiate', officerId: string) => {
      set((state) => {
        const rebelOfficer = state.officers.find(o => o.id === officerId);
        const rebelBase = state.buildings.find(b => b.isRebelBase && b.assignedOfficerId === officerId);
        if (!rebelOfficer || !rebelBase) return { ...state, activeEvent: null, eventData: null, isCivilWarActive: false, rebelOfficerId: null, recentlyResolvedCivilWar: true };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null, isCivilWarActive: false, rebelOfficerId: null, recentlyResolvedCivilWar: true };

        switch (choice) {
          case 'raid':
            // Calculate Raid Strength: Player's soldiers vs Rebel soldiers
            const loyalStrength = state.soldiers.reduce((sum, s) => sum + (s.loyalty > 40 ? s.skill : 0), 0);
            const redPole = state.officers.find(o => o.rank === 'Red Pole' && !o.isTraitor);
            const officerBonus = redPole ? redPole.skills.enforcement * 2 : 0;
            const totalLoyalStrength = loyalStrength + officerBonus;
            
            const rebelStrength = rebelBase.rebelSoldierCount * 45 + (rebelOfficer.skills.diplomacy * 1.5);
            const success = totalLoyalStrength > rebelStrength;

            if (success) {
              // Victory - civil war ends
              const executionChance = 0.4 + (state.influence * 0.01); // Higher influence = more likely to execute
              const willExecute = Math.random() < executionChance;
              
              updates.officers = state.officers.filter(o => o.id !== officerId);
              if (!willExecute) {
                updates.officers = [
                  ...(updates.officers || state.officers), 
                  { 
                    ...rebelOfficer, 
                    isTraitor: false, 
                    isArrested: true, 
                    assignedBuildingId: null, 
                    loyalty: 10,
                    energy: 0
                  }
                ];
              }
              
              updates.buildings = state.buildings.map(b =>
                b.id === rebelBase.id 
                  ? { ...b, isRebelBase: false, rebelSoldierCount: 0, isOccupied: false, assignedOfficerId: null } 
                  : b
              );
              
              updates.reputation = Math.min(100, state.reputation + 25);
              updates.influence = Math.min(100, state.influence + 10);
              
              // Return some rebel soldiers as loyal forces
              const returnedSoldiers = Math.floor(rebelBase.rebelSoldierCount * 0.3);
              updates.soldiers = [
                ...state.soldiers, 
                ...Array(returnedSoldiers).fill(0).map(() => ({
                  id: `sol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: SOLDIER_NAMES[Math.floor(Math.random() * SOLDIER_NAMES.length)],
                  loyalty: 45 + Math.floor(Math.random() * 30),
                  needs: { food: 70, entertainment: 50, pay: 60 },
                  skill: 25 + Math.floor(Math.random() * 35),
                  isDeserting: false,
                }))
              ];
            } else {
              // Defeat - civil war continues but we don't keep it active to prevent loops
              const soldiersLost = Math.max(1, Math.floor(state.soldiers.length * 0.25));
              updates.soldiers = state.soldiers.slice(soldiersLost);
              updates.reputation = Math.max(0, state.reputation - 20);
              
              // DON'T keep civil war active - this prevents the infinite loop
              // The rebel base remains but player gets another chance after a cooldown
              updates.recentlyResolvedCivilWarCooldown = state.currentDay + 7;
            }
            break;

          case 'negotiate':
            const cost = 5000;
            const intelCost = 50;
            
            if (state.cash < cost || state.intel < intelCost) {
              return { ...state, activeEvent: null, eventData: null, recentlyResolvedCivilWar: true };
            }

            updates.cash = state.cash - cost;
            updates.intel = state.intel - intelCost;
            updates.reputation = Math.max(0, state.reputation - 40);
            
            updates.officers = state.officers.map(o =>
              o.id === officerId 
                ? { 
                    ...o, 
                    isTraitor: false, 
                    loyalty: 35, // Lower loyalty than before
                    face: 0, 
                    grudge: true, // They hold a grudge
                    isSuccessor: false, 
                    isTestingWaters: false 
                  } 
                : o
            );
            
            updates.buildings = state.buildings.map(b =>
              b.id === rebelBase.id 
                ? { ...b, isRebelBase: false, rebelSoldierCount: 0, isOccupied: false, assignedOfficerId: null } 
                : b
            );
            
            // All rebel soldiers return
            updates.soldiers = [
              ...state.soldiers, 
              ...Array(rebelBase.rebelSoldierCount).fill(0).map(() => ({
                id: `sol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: SOLDIER_NAMES[Math.floor(Math.random() * SOLDIER_NAMES.length)],
                loyalty: 40 + Math.floor(Math.random() * 25),
                needs: { food: 70, entertainment: 50, pay: 60 },
                skill: 25 + Math.floor(Math.random() * 35),
                isDeserting: false,
              }))
            ];
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleLeaderDeath: (officerId: string) => {
      set((state) => {
        const successor = state.officers.find(o => o.isSuccessor);
        const deceasedOfficer = state.officers.find(o => o.id === officerId);

        if (!successor) {
          // No successor: Game Over (Total Collapse)
          console.error('GAME OVER: Leader died and no successor was designated.');
          return state; // In a real game, this would trigger a Game Over screen
        }

        // Succession Logic
        const newLeader = { ...successor };
        const eulogy = `${deceasedOfficer?.name || 'The Dragonhead'} has fallen. Long live the new boss, ${newLeader.name}.`;

        // 1. Apply Loyalty Shock to all remaining officers
        const updatedOfficers = state.officers
          .filter(o => o.id !== officerId) // Remove deceased leader
          .map(o => {
            let newOfficer = { ...o };
            newOfficer.loyalty = Math.max(0, newOfficer.loyalty - 30);
            newOfficer.isTestingWaters = true; // Start loyalty decay
            newOfficer.isSuccessor = false; // Clear successor flag from everyone
            return newOfficer;
          });

        // 2. Promote successor (reset face, clear successor flag)
        const promotedLeader = {
          ...newLeader,
          face: Math.floor(newLeader.face * 0.5), // 50% Face reset
          isSuccessor: false,
          isTestingWaters: false, // New leader is exempt from testing waters
        };

        const updates: Partial<GameState> = {
          officers: [...updatedOfficers, promotedLeader],
          reputation: Math.max(0, state.reputation - 10), // Slight rep hit for instability
          activeEvent: 'newEra',
          eventData: {
            eulogy: eulogy,
            newLeaderName: promotedLeader.name,
            newLeaderRank: promotedLeader.rank,
          },
        };

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleDailyBriefingChoice: (choice: 'passive' | 'financial' | 'authoritarian') => {
      set((state) => {
        const { officerId, eventType } = state.eventData;
        const officer = state.officers.find(o => o.id === officerId);

        if (!officer) return { ...state, activeEvent: null, eventData: null, dailyBriefingIgnored: false };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null, dailyBriefingIgnored: false };
        let updatedOfficers = state.officers;

        const EVENT_COSTS: Record<string, { cost: number, loyaltyBoost: number, energyBoost: number }> = {
          sick: { cost: 500, loyaltyBoost: 0, energyBoost: 0 },
          disgruntled: { cost: 1000, loyaltyBoost: 10, energyBoost: 0 },
          hungover: { cost: 200, loyaltyBoost: 0, energyBoost: 20 },
          rivals: { cost: 1500, loyaltyBoost: 15, energyBoost: 0 },
        };
        
        const costs = EVENT_COSTS[eventType];
        
        switch (choice) {
          case 'passive':
            // Officer effectiveness -50% for the day. Tracked by dailyBriefingIgnored.
            updates.dailyBriefingIgnored = true;
            break;

          case 'financial':
            if (state.cash < costs.cost) return state;
            
            updatedOfficers = state.officers.map(o => 
              o.id === officerId 
                ? { 
                    ...o, 
                    loyalty: Math.min(100, o.loyalty + costs.loyaltyBoost),
                    energy: Math.min(o.maxEnergy, o.energy + costs.energyBoost),
                  } 
                : o
            );
            updates.cash = state.cash - costs.cost;
            break;

          case 'authoritarian':
            // Fixes issue, but -20 Loyalty
            updatedOfficers = state.officers.map(o => 
              o.id === officerId 
                ? { ...o, loyalty: Math.max(0, o.loyalty - 20) } 
                : o
            );
            break;
        }

        updates.officers = updatedOfficers;

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleShakedownChoice: (choice: 'bribe' | 'layLow' | 'resist') => {
      set((state) => {
        const { buildingId, officerId, bribeCost } = state.eventData;
        const officer = state.officers.find(o => o.id === officerId);
        
        if (!officer) return { ...state, activeEvent: null, eventData: null };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null };
        let updatedOfficers = state.officers;
        let updatedBuildings = state.buildings;
        let newHeat = state.policeHeat;

        switch (choice) {
          case 'bribe':
            if (state.cash < bribeCost) return state;
            
            newHeat = 0; // Heat reset to 0
            updates.cash = state.cash - bribeCost;
            break;

          case 'layLow':
            // Close building for 2 days
            updatedBuildings = state.buildings.map(b => 
              b.id === buildingId 
                ? { ...b, inactiveUntilDay: state.currentDay + 2, isOccupied: false, assignedOfficerId: null } 
                : b
            );
            // Unassign officer
            updatedOfficers = state.officers.map(o => 
              o.id === officerId 
                ? { ...o, assignedBuildingId: null } 
                : o
            );
            break;

          case 'resist':
            if (Math.random() < 0.5) {
              // Success: Avoid fine, no penalty
              newHeat = Math.max(0, newHeat - 10); // Slight heat reduction for standing firm
            } else {
              // Failure: Officer arrested
              updatedOfficers = state.officers.map(o => 
                o.id === officerId 
                  ? { ...o, isArrested: true, assignedBuildingId: null, energy: 0 } 
                  : o
              );
              // Building is also closed for 1 day due to police activity
              updatedBuildings = state.buildings.map(b => 
                b.id === buildingId 
                  ? { ...b, inactiveUntilDay: state.currentDay + 1, isOccupied: false, assignedOfficerId: null } 
                  : b
              );
              newHeat = Math.min(100, newHeat + 10); // Heat increase due to arrest
            }
            break;
        }

        updates.policeHeat = newHeat;
        updates.officers = updatedOfficers;
        updates.buildings = updatedBuildings;

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    handleStreetBeefChoice: (choice: 'talk' | 'council' | 'fire', fireOfficerId?: string) => {
      set((state) => {
        const { officer1Id, officer2Id } = state.eventData;
        const officer1 = state.officers.find(o => o.id === officer1Id);
        const officer2 = state.officers.find(o => o.id === officer2Id);
        
        if (!officer1 || !officer2) return { ...state, activeEvent: null, eventData: null };

        let updates: Partial<GameState> = { activeEvent: null, eventData: null };
        let updatedOfficers = state.officers;
        let updatedBuildings = state.buildings;
        
        // Remove the beef from active beefs (resolution is immediate for all choices)
        const updatedBeefs = state.activeStreetBeefs.filter(
          beef => !(beef.officer1Id === officer1Id && beef.officer2Id === officer2Id)
        );
        updates.activeStreetBeefs = updatedBeefs;

        switch (choice) {
          case 'talk':
            // Talk to both officers - costs influence, restores some loyalty
            if (state.influence >= 5) {
              updates.influence = state.influence - 5;
              updatedOfficers = state.officers.map(o => {
                if (o.id === officer1Id || o.id === officer2Id) {
                  return { ...o, loyalty: Math.min(100, o.loyalty + 5) };
                }
                return o;
              });
            }
            break;

          case 'council':
            // Queue a council meeting to resolve
            updates.currentScene = 'COUNCIL';
            
            // Generate a specific motion for this beef
            const motionId = `BEEF_RESOLUTION_${officer1Id}_${officer2Id}`;
            
            const councilMembers = state.officers.filter(o => o.rank !== 'Blue Lantern').slice(0, 3);
            const officerVotes: Record<string, 'yes' | 'no'> = {};
            
            // Determine officer votes (simplified: random bias)
            councilMembers.forEach(o => {
              // 50/50 chance for council members to side with officer 1 or 2
              const vote = Math.random() < 0.5 ? 'yes' : 'no';
              officerVotes[o.id] = vote as 'yes' | 'no';
            });
            
            const beefMotion: CouncilMotion = {
              id: motionId,
              title: `Resolve Feud: ${officer1.name} vs ${officer2.name}`,
              description: `The council must decide who is at fault. YES: Punish ${officer1.name}. NO: Punish ${officer2.name}.`,
              type: 'internal',
              effect: (s) => ({}), // Effect handled in handleCouncilVote
              officerVotes: officerVotes,
              isVetoed: false,
            };
            
            updates.councilMotions = [...state.councilMotions, beefMotion];
            break;

          case 'fire':
            // Fire one of the officers
            if (fireOfficerId) {
              const firedOfficer = state.officers.find(o => o.id === fireOfficerId);
              if (firedOfficer?.assignedBuildingId) {
                // Unassign from building first
                updatedBuildings = state.buildings.map(b => 
                  b.assignedOfficerId === fireOfficerId
                    ? { ...b, isOccupied: false, assignedOfficerId: null } 
                    : b
                );
              }
              // Remove officer from roster
              updatedOfficers = state.officers.filter(o => o.id !== fireOfficerId);
              // Remaining officer loses loyalty due to witnessing firing
              const remainingId = fireOfficerId === officer1Id ? officer2Id : officer1Id;
              updatedOfficers = updatedOfficers.map(o => 
                o.id === remainingId 
                  ? { ...o, loyalty: Math.max(0, o.loyalty - 10) }
                  : o
              );
            }
            break;
        }

        updates.officers = updatedOfficers;
        updates.buildings = updatedBuildings;

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    dismissEvent: () => {
      set((state) => {
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return { activeEvent: null, eventData: null };
      });
    },

    // Diplomacy
    initiateDiplomacy: (rivalId: string, action: DiploAction) => {
      set({ activeDiplomacy: { rivalId, action } });
    },

    confirmDiplomacy: () => {
      set((state) => {
        const { rivalId, action } = state.activeDiplomacy;
        if (!rivalId || !action) return { ...state, activeDiplomacy: null };

        let updates: Partial<GameState> = { activeDiplomacy: null };

        switch (action) {
          case 'trade':
            if (state.cash >= 1000) {
              updates.cash = state.cash - 1000;
              updates.rivals = state.rivals.map(r =>
                r.id === rivalId
                  ? { ...r, hasTradeAgreement: true, relationship: r.relationship + 10 }
                  : r
              );
            }
            break;

          case 'alliance':
            const rival = state.rivals.find(r => r.id === rivalId);
            if (rival && rival.relationship >= 30) {
              updates.rivals = state.rivals.map(r =>
                r.id === rivalId
                  ? { ...r, hasAlliance: true, relationship: r.relationship + 20 }
                  : r
              );
            }
            break;

          case 'turfWar':
            updates.rivals = state.rivals.map(r =>
              r.id === rivalId
                ? { ...r, isActiveConflict: true, relationship: r.relationship - 50 }
                : r
            );
            break;
        }

        // Check for pending events
        if (state.pendingEvents.length > 0) {
          const [nextEvent, ...rest] = state.pendingEvents;
          return {
            ...updates,
            activeEvent: nextEvent.type,
            eventData: nextEvent.data,
            pendingEvents: rest,
          };
        }

        return updates;
      });
    },

    cancelDiplomacy: () => {
      set({ activeDiplomacy: null });
    },

    // Upgrades
    upgradeBuilding: (buildingId: string) => {
      set((state) => {
        const building = state.buildings.find(b => b.id === buildingId);
        if (!building || building.isUpgraded || building.isRebelBase) return state;

        const upgradeCost = building.baseRevenue * 2;
        if (state.cash < upgradeCost) return state;

        return {
          cash: state.cash - upgradeCost,
          buildings: state.buildings.map(b =>
            b.id === buildingId ? { ...b, isUpgraded: true } : b
          ),
        };
      });
    },

    purchaseIntel: (cost: number) => {
      set((state) => {
        if (state.cash < cost) return state;
        return {
          cash: state.cash - cost,
          intel: state.intel + 50,
        };
      });
    },

    // Soldiers
    recruitSoldier: () => {
      set((state) => {
        if (state.cash < 500) return state;
        const newSoldier: StreetSoldier = {
          id: `sol-${Date.now()}`,
          name: SOLDIER_NAMES[Math.floor(Math.random() * SOLDIER_NAMES.length)],
          loyalty: 60 + Math.floor(Math.random() * 20),
          needs: {
            food: 70 + Math.floor(Math.random() * 20),
            entertainment: 50 + Math.floor(Math.random() * 30),
            pay: 60,
          },
          skill: 30 + Math.floor(Math.random() * 40),
          isDeserting: false,
        };
        return {
          cash: state.cash - 500,
          soldiers: [...state.soldiers, newSoldier],
        };
      });
    },

    // Character System
    recruitSyndicateMember: () => {
      set((state) => {
        if (state.cash < state.recruitCost) return state;
        
        const newMember = generateSoldier();
        const newCost = Math.min(5000, state.recruitCost + 200);
        
        return {
          cash: state.cash - state.recruitCost,
          syndicateMembers: [...state.syndicateMembers, newMember],
          recruitCost: newCost,
        };
      });
    },

    assignSyndicateMember: (memberId: string) => {
      set({ homeDistrictLeaderId: memberId });
    },

    unassignSyndicateMember: () => {
      set({ homeDistrictLeaderId: null });
    },

    processRacketCycle: () => {
      set((state) => {
        if (!state.homeDistrictLeaderId) return state;

        const member = state.syndicateMembers.find(m => m.id === state.homeDistrictLeaderId);
        if (!member) return state;

        // Calculate revenue based on member's stats
        const baseRevenue = 300;
        const loyaltyBonus = Math.floor((member.stats as any).loyalty * 2);
        const faceBonus = Math.floor((member.stats as any).face * 1); // Cast to any for face access
        const totalRevenue = baseRevenue + loyaltyBonus + faceBonus;

        // Apply friction reduction (negative relationship with Wo Shing Wo)
        const woShingWo = state.rivals.find(r => r.name === 'Wo Shing Wo');
        if (woShingWo && woShingWo.relationship < -50) {
          state.territoryFriction = Math.max(0, state.territoryFriction - 5);
        }

        return {
          homeDistrictRevenue: totalRevenue,
          cash: state.cash + totalRevenue,
          homeDistrictHeat: Math.min(100, state.homeDistrictHeat + 2),
        };
      });
    },

    // Management Actions
    paySoldierBonus: () => {
      set((state) => {
        const bonusCost = state.soldiers.length * 100;
        if (state.cash < bonusCost) return state;
        
        return {
          cash: state.cash - bonusCost,
          soldiers: state.soldiers.map(s => ({
            ...s,
            loyalty: Math.min(100, s.loyalty + 10)
          }))
        };
      });
    },

    trainOfficer: (officerId: string, skill: 'enforcement' | 'diplomacy' | 'logistics' | 'recruitment') => {
      set((state) => {
        const cost = 500;
        if (state.cash < cost) return state;
        
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer) return state;
        
        const skillIncrease = 5 + Math.floor(Math.random() * 5); // 5-10 increase
        
        return {
          cash: state.cash - cost,
          officers: state.officers.map(o =>
            o.id === officerId
              ? {
                  ...o,
                  skills: {
                    ...o.skills,
                    [skill]: Math.min(100, o.skills[skill] + skillIncrease)
                  }
                }
              : o
          )
        };
      });
    },

    scoutTerritory: (rivalId: string) => {
      set((state) => {
        const cost = 100;
        if (state.cash < cost) return state;
        
        return {
          cash: state.cash - cost,
          rivals: state.rivals.map(r =>
            r.id === rivalId ? { ...r, isScouted: true } : r
          ),
        };
      });
    },

    // Territory Management
    startFrictionTimer: () => {
      set((state) => {
        if (state.frictionInterval) return state;
        
        const interval = setInterval(() => {
          set((currentState) => ({
            territoryFriction: Math.min(100, currentState.territoryFriction + 1),
          }));
        }, 10000); // Increase friction every 10 seconds
        
        return { frictionInterval: interval };
      });
    },

    stopFrictionTimer: () => {
      set((state) => {
        if (state.frictionInterval) {
          clearInterval(state.frictionInterval);
          return { frictionInterval: null };
        }
        return state;
      });
    },

    resetFriction: () => {
      set({ territoryFriction: 0 });
    },

    // Intel actions
    spendIntelToReduceFriction: (rivalId: string, amount: number) => {
      set((state) => {
        if (state.intel < amount) return state;
        
        return {
          intel: state.intel - amount,
          rivals: state.rivals.map(r =>
            r.id === rivalId ? { ...r, relationship: Math.min(100, r.relationship + 10) } : r
          ),
        };
      });
    },

    spendIntelToScout: (rivalId: string) => {
      set((state) => {
        if (state.intel < 50) return state;
        
        return {
          intel: state.intel - 50,
          rivals: state.rivals.map(r =>
            r.id === rivalId ? { ...r, isScouted: true } : r
          ),
        };
      });
    },

    // Street War actions
    increaseFriction: () => {
      set((state) => {
        const woShingWo = state.rivals.find(r => r.name === 'Wo Shing Wo');
        if (woShingWo) {
          return {
            rivals: state.rivals.map(r =>
              r.id === 'rival-3'
                ? { ...r, relationship: Math.max(-100, r.relationship - 5) }
                : r
            ),
          };
        }
      });
    },

    // Hospital/Jail Recovery System
    healOfficer: (officerId: string) => {
      set((state) => {
        if (state.cash < 2000) return state;
        
        return {
          cash: state.cash - 2000,
          officers: state.officers.map(o =>
            o.id === officerId && o.isWounded
              ? { ...o, isWounded: false, daysToRecovery: 0 }
              : o
          ),
        };
      });
    },

    releaseOfficer: (officerId: string) => {
      set((state) => {
        // Check if we have enough intel or cash
            if (state.intel < 50 && state.cash < 5000) return state;
        
        return {
          intel: state.intel >= 50 ? state.intel - 50 : state.intel,
          cash: state.cash >= 5000 ? state.cash - 5000 : state.cash,
          officers: state.officers.map(o =>
            o.id === officerId && o.isArrested
              ? { ...o, isArrested: false }
              : o
          ),
        };
      });
    },

    processRecovery: () => {
      set((state) => {
        const updatedOfficers = state.officers.map(o => {
          if (o.isWounded && o.daysToRecovery > 0) {
            const newDaysToRecovery = o.daysToRecovery - 1;
            // If recovery is complete, heal the officer
            if (newDaysToRecovery === 0) {
              return { ...o, isWounded: false, daysToRecovery: 0 };
            }
            return { ...o, daysToRecovery: newDaysToRecovery };
          }
          return o;
        });
        
        return { officers: updatedOfficers };
      });
    },


    // Street beef actions
    processStreetBeefs: () => {
      set((state) => {
        const updatedBeefs = state.activeStreetBeefs.map(beef => ({
          ...beef,
          daysActive: beef.daysActive + 1
        }));

        // Check for escalation (beefs older than 3 days become events)
        const escalatedBeefs = updatedBeefs.filter(beef => beef.daysActive >= 3 && !beef.isResolved);
        const activeBeefs = updatedBeefs.filter(beef => beef.daysActive < 3 && !beef.isResolved);

        let updates: Partial<GameState> = {
          activeStreetBeefs: activeBeefs
        };

        // Create events for escalated beefs
        if (escalatedBeefs.length > 0 && !state.activeEvent) {
          const escalatedBeef = escalatedBeefs[0];
          updates.activeEvent = 'streetBeef';
          updates.eventData = {
            officer1Id: escalatedBeef.officer1Id,
            officer2Id: escalatedBeef.officer2Id,
            daysActive: escalatedBeef.daysActive
          };
        }

        return updates;
      });
    },

    triggerStreetBeef: (officer1Id: string, officer2Id: string) => {
      set((state) => {
        // Check if beef already exists
        const existingBeef = state.activeStreetBeefs.find(
          beef => (beef.officer1Id === officer1Id && beef.officer2Id === officer2Id) ||
                 (beef.officer1Id === officer2Id && beef.officer2Id === officer1Id)
        );

        if (existingBeef) return state;

        const newBeef = {
          officer1Id,
          officer2Id,
          daysActive: 0,
          isResolved: false
        };

        return {
          activeStreetBeefs: [...state.activeStreetBeefs, newBeef]
        };
      });
    },

    // Civil war actions
    checkForCivilWar: () => {
      set((state) => {
        // Prevent civil war if already active, event is pending, or recently resolved
        if (state.isCivilWarActive || state.activeEvent || state.recentlyResolvedCivilWar) return state;

        // Only check every 3 days to prevent rapid triggering
        const daysSinceLastCheck = state.currentDay - (state.lastCivilWarCheckDay || 0);
        if (daysSinceLastCheck < 3) return state;

        // Update last check day
        const updatedState = { ...state, lastCivilWarCheckDay: state.currentDay };

        // Check for civil war conditions
        const disloyalOfficers = updatedState.officers.filter(o => o.loyalty < 25 && o.rank !== 'Blue Lantern' && !o.isTraitor && !o.isWounded && !o.isArrested);
        const highRankOfficers = updatedState.officers.filter(o => (o.rank === 'Red Pole' || o.rank === 'White Paper Fan') && !o.isTraitor && !o.isWounded && !o.isArrested);
        
        // Much stricter conditions to prevent frequent triggering
        const shouldTrigger = (
          disloyalOfficers.length >= 2 && 
          highRankOfficers.some(o => disloyalOfficers.includes(o)) &&
          (updatedState.territoryFriction > 85 || updatedState.influence < 15)
        );

        if (shouldTrigger) {
          // Additional safety check: ensure we have available building
          const availableBuilding = updatedState.buildings.find(b => !b.isOccupied && b.type !== 'Police Station' && !b.isRebelBase);
          
          if (!availableBuilding || updatedState.soldiers.length < 3) {
            console.log('Civil war prevented: Insufficient resources');
            return { ...updatedState, lastCivilWarCheckDay: state.currentDay };
          }

          const rebelOfficer = disloyalOfficers[Math.floor(Math.random() * disloyalOfficers.length)];

          if (rebelOfficer) {
            console.log(`Civil war triggered by ${rebelOfficer.name}`);
            return {
              ...updatedState,
              activeEvent: 'coupAttempt' as const,
              eventData: {
                officerId: rebelOfficer.id,
                officerName: rebelOfficer.name,
                buildingName: availableBuilding.name
              },
              isCivilWarActive: true,
              rebelOfficerId: rebelOfficer.id
            };
          }
        }

        return { ...updatedState, lastCivilWarCheckDay: state.currentDay };
      });
    },

    triggerCivilWar: (officerId: string) => {
      set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer || state.isCivilWarActive) return state;

        // Create rebel base
        const randomBuilding = state.buildings.find(b => !b.isOccupied && b.type !== 'Police Station');
        if (!randomBuilding) return state;

        const rebelSoldiers = Math.floor(state.soldiers.length * 0.3); // 30% of soldiers join rebellion

        return {
          isCivilWarActive: true,
          rebelOfficerId: officerId,
          officers: state.officers.map(o =>
            o.id === officerId
              ? { ...o, isTraitor: true, assignedBuildingId: randomBuilding.id }
              : o
          ),
          buildings: state.buildings.map(b =>
            b.id === randomBuilding.id
              ? { ...b, isRebelBase: true, rebelSoldierCount: rebelSoldiers, isOccupied: true, assignedOfficerId: officerId }
              : b
          ),
          soldiers: state.soldiers.slice(rebelSoldiers), // Remove rebel soldiers from loyal forces
          activeEvent: 'coupAttempt' as const,
          eventData: {
            officerId: officerId,
            officerName: officer.name,
            buildingName: randomBuilding.name
          }
        };
      });
    },

    // Building actions
    acquireBuilding: (buildingType: BuildingType) => {
      set((state) => {
        const BUILDING_COSTS = {
          'Noodle Shop': 3000,
          'Mahjong Parlor': 5000,
          'Warehouse': 4000,
          'Nightclub': 6000,
          'Counterfeit Lab': 8000,
          'Drug Lab': 10000,
          'Police Station': 0, // Cannot acquire
        };

        const cost = BUILDING_COSTS[buildingType];
        if (!cost || state.cash < cost) return state;

        const newBuilding: Building = {
          id: `bld-${Date.now()}`,
          name: `New ${buildingType}`,
          type: buildingType,
          baseRevenue: buildingType === 'Noodle Shop' ? 500 :
                      buildingType === 'Mahjong Parlor' ? 800 :
                      buildingType === 'Warehouse' ? 400 :
                      buildingType === 'Nightclub' ? 600 :
                      buildingType === 'Counterfeit Lab' ? 1200 :
                      buildingType === 'Drug Lab' ? 1500 : 0,
          heatGen: buildingType === 'Noodle Shop' ? 1 :
                   buildingType === 'Mahjong Parlor' ? 3 :
                   buildingType === 'Warehouse' ? 2 :
                   buildingType === 'Nightclub' ? 4 :
                   buildingType === 'Counterfeit Lab' ? 5 :
                   buildingType === 'Drug Lab' ? 6 : 0,
          isOccupied: false,
          assignedOfficerId: null,
          inactiveUntilDay: null,
          isIllicit: buildingType !== 'Noodle Shop' && buildingType !== 'Warehouse',
          foodProvided: buildingType === 'Noodle Shop' ? 30 : 0,
          entertainmentProvided: buildingType === 'Mahjong Parlor' ? 40 :
                               buildingType === 'Nightclub' ? 60 :
                               buildingType === 'Drug Lab' ? 20 : 0,
          isUpgraded: false,
          isRebelBase: false,
          rebelSoldierCount: 0,
        };

        return {
          cash: state.cash - cost,
          buildings: [...state.buildings, newBuilding]
        };
      });
    },

    // Missing methods required by GameState interface
    purchaseUpgrade: (upgradeId: string) => {
      set((state) => {
        // Simple upgrade system - track unlocked upgrades
        if (state.unlockedUpgrades.includes(upgradeId)) return state;
        return {
          unlockedUpgrades: [...state.unlockedUpgrades, upgradeId]
        };
      });
    },

    updateAutonomousBehavior: () => {
      // Autonomous behavior update - placeholder for now
      set((state) => ({
        lastBehaviorUpdate: Date.now()
      }));
    },

    getCharacterCurrentAction: (officerId: string) => {
      const state = get();
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return null;
      if (officer.isWounded || officer.status?.isWounded) return 'recovering';
      if (officer.isArrested || officer.status?.isArrested) return 'imprisoned';
      if (officer.assignedBuildingId) return 'working';
      return 'idle';
    },

    canForceWork: (officerId: string) => {
      const state = get();
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return { canWork: false, reason: 'Officer not found' };
      if (officer.isWounded || officer.status?.isWounded) return { canWork: false, reason: 'Officer is wounded' };
      if (officer.isArrested || officer.status?.isArrested) return { canWork: false, reason: 'Officer is arrested' };
      if (officer.energy < 20) return { canWork: false, reason: 'Officer is too tired' };
      return { canWork: true };
    },

    getPlayerInfluenceLevel: () => {
      const state = get();
      return Math.floor(state.influence / 10);
    },

    processSocialInteractions: () => {
      // Social interactions processing - placeholder
      set((state) => ({
        lastBehaviorUpdate: Date.now()
      }));
    },

    getOfficerRelationships: (officerId: string) => {
      const state = get();
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return { nodes: [], edges: [] };
      
      const nodes = state.officers.map(o => o.id);
      const edges = (officer.relationships || []).map((rel: any) => 
        `${officerId}-${rel.targetId || rel.officerId}`
      );
      return { nodes, edges };
    },

    createManualInteraction: (initiatorId: string, targetId: string, type: string) => {
      set((state) => ({
        recentInteractions: [
          ...state.recentInteractions,
          {
            id: `int-${Date.now()}`,
            type: type as any,
            participants: [initiatorId, targetId],
            initiatorId,
            targetId,
            timestamp: Date.now(),
            location: 'manual',
            outcome: {
              success: true,
              relationshipChange: 5,
              interestChange: 0,
              respectChange: 0
            }
          }
        ]
      }));
    },

    // Time Control System
    setGameSpeed: (speed: GameSpeed) => {
      const state = get();
      set({ gameSpeed: speed });
      
      // Restart timer with new speed if playing
      if (state.isPlaying && speed > 0) {
        state.stopGameTimer();
        get().startGameTimer();
      } else if (speed === 0) {
        state.stopGameTimer();
        set({ isPlaying: false });
      }
    },

    togglePlay: () => {
      const state = get();
      if (state.isPlaying) {
        state.stopGameTimer();
        set({ isPlaying: false });
      } else {
        set({ isPlaying: true });
        get().startGameTimer();
      }
    },

    startGameTimer: () => {
      const state = get();
      
      // Clear any existing interval
      if (state.timeInterval) {
        clearInterval(state.timeInterval);
      }
      
      // Base tick rate: 1 second for 1x speed
      const baseTickMs = 1000;
      const tickRate = Math.max(100, baseTickMs / Math.max(1, state.gameSpeed));
      
      const interval = setInterval(() => {
        get().tickPhaseProgress();
      }, tickRate);
      
      set({ timeInterval: interval as any });
    },

    stopGameTimer: () => {
      const state = get();
      if (state.timeInterval) {
        clearInterval(state.timeInterval);
        set({ timeInterval: null });
      }
    },

    tickPhaseProgress: () => {
      const state = get();
      
      // Don't tick if paused or speed is 0
      if (!state.isPlaying || state.gameSpeed === 0) return;
      
      // Don't tick if there's a blocking event
      const blockingEvents = ['dailyBriefing', 'policeShakedown', 'streetBeef', 'coupAttempt', 'newEra', 'policeRaid', 'betrayal', 'rivalAttack', 'streetWar', 'criminalCaught', 'soldierDesertion', 'territoryUltimatum'];
      if (state.activeEvent && blockingEvents.includes(state.activeEvent)) {
        return;
      }
      
      // Progress increment per tick (faster with higher speed)
      const progressIncrement = 2 * state.gameSpeed;
      const newProgress = state.phaseProgress + progressIncrement;
      
      // Territory friction increases over time during conflicts
      let frictionUpdate = {};
      if (state.rivals.some(r => r.isActiveConflict)) {
        const frictionIncrease = 0.5 * state.gameSpeed;
        frictionUpdate = { 
          territoryFriction: Math.min(100, state.territoryFriction + frictionIncrease) 
        };
      }
      
      // Random event chance on each tick (mob boss life is chaotic!)
      const eventChance = 0.02 * state.gameSpeed; // Higher speed = more events per phase
      if (Math.random() < eventChance) {
        get().triggerRandomEvent();
      }
      
      if (newProgress >= 100) {
        // Phase complete - advance to next phase
        set({ phaseProgress: 0, ...frictionUpdate });
        state.advancePhase();
      } else {
        set({ phaseProgress: newProgress, ...frictionUpdate });
      }
    },

    // Random event system for live simulation
    triggerRandomEvent: () => {
      const state = get();
      
      // Don't trigger if already have an event
      if (state.activeEvent) return;
      
      const { officers, buildings, soldiers, policeHeat, rivals, currentPhase } = state;
      
      // Weight events based on game state
      const possibleEvents: { type: EventType; weight: number; condition: boolean }[] = [
        // Police-related events (more likely with high heat)
        { 
          type: 'policeRaid', 
          weight: policeHeat > 50 ? 3 : policeHeat > 30 ? 2 : 1,
          condition: policeHeat > 20 && buildings.some(b => b.isOccupied && b.isIllicit)
        },
        { 
          type: 'policeShakedown', 
          weight: policeHeat > 40 ? 2 : 1,
          condition: policeHeat > 25
        },
        
        // Officer-related events
        { 
          type: 'streetBeef', 
          weight: 2,
          condition: officers.filter(o => !o.isWounded && !o.isArrested).length >= 2
        },
        { 
          type: 'betrayal', 
          weight: 1,
          condition: officers.some(o => o.loyalty < 40 && !o.isWounded && !o.isArrested)
        },
        
        // Rival-related events
        { 
          type: 'rivalAttack', 
          weight: 2,
          condition: rivals.some(r => r.relationship < -20 && !r.isActiveConflict)
        },
        { 
          type: 'territoryUltimatum', 
          weight: 1,
          condition: rivals.some(r => r.relationship < -30 && r.strength > 50)
        },
        
        // Soldier events
        { 
          type: 'soldierDesertion', 
          weight: 1,
          condition: soldiers.some(s => s.loyalty < 40)
        },
        
        // Criminal caught (officer gets in trouble)
        { 
          type: 'criminalCaught', 
          weight: policeHeat > 30 ? 2 : 1,
          condition: officers.some(o => o.assignedBuildingId && !o.isArrested)
        },
        
        // Night-specific events
        { 
          type: 'nightclubSuccess', 
          weight: 1,
          condition: currentPhase === 'night' && buildings.some(b => b.type === 'Nightclub' && b.isOccupied)
        },
      ];
      
      // Filter to valid events
      const validEvents = possibleEvents.filter(e => e.condition);
      if (validEvents.length === 0) return;
      
      // Weighted random selection
      const totalWeight = validEvents.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const event of validEvents) {
        random -= event.weight;
        if (random <= 0) {
          // Trigger this event
          get().triggerEventByType(event.type);
          return;
        }
      }
    },

    triggerEventByType: (eventType: EventType) => {
      const state = get();
      const { officers, buildings, soldiers, rivals } = state;
      
      // Pause the game when event triggers
      state.stopGameTimer();
      set({ isPlaying: false });
      
      switch (eventType) {
        case 'policeRaid': {
          const illicitBuildings = buildings.filter(b => b.isOccupied && b.isIllicit);
          if (illicitBuildings.length > 0) {
            const targetBuilding = illicitBuildings[Math.floor(Math.random() * illicitBuildings.length)];
            const assignedOfficer = officers.find(o => o.id === targetBuilding.assignedOfficerId);
            set({ 
              activeEvent: 'policeRaid', 
              eventData: { 
                buildingId: targetBuilding.id,
                buildingName: targetBuilding.name,
                officerId: assignedOfficer?.id,
                officerName: assignedOfficer?.name,
                severity: state.policeHeat > 60 ? 'heavy' : 'light'
              }
            });
          }
          break;
        }
        
        case 'policeShakedown': {
          set({ 
            activeEvent: 'policeShakedown', 
            eventData: { 
              bribeCost: Math.floor(500 + state.policeHeat * 20),
              heatReduction: 15
            }
          });
          break;
        }
        
        case 'streetBeef': {
          const activeOfficers = officers.filter(o => !o.isWounded && !o.isArrested);
          if (activeOfficers.length >= 2) {
            const shuffled = [...activeOfficers].sort(() => Math.random() - 0.5);
            set({ 
              activeEvent: 'streetBeef', 
              eventData: { 
                officer1Id: shuffled[0].id,
                officer1Name: shuffled[0].name,
                officer2Id: shuffled[1].id,
                officer2Name: shuffled[1].name,
                reason: ['territory dispute', 'personal insult', 'money disagreement', 'loyalty question'][Math.floor(Math.random() * 4)]
              }
            });
          }
          break;
        }
        
        case 'betrayal': {
          const disloyal = officers.filter(o => o.loyalty < 40 && !o.isWounded && !o.isArrested);
          if (disloyal.length > 0) {
            const traitor = disloyal[Math.floor(Math.random() * disloyal.length)];
            set({ 
              activeEvent: 'betrayal', 
              eventData: { 
                officerId: traitor.id,
                officerName: traitor.name,
                type: Math.random() > 0.5 ? 'information_leak' : 'theft'
              }
            });
          }
          break;
        }
        
        case 'rivalAttack': {
          const hostileRivals = rivals.filter(r => r.relationship < -20 && !r.isActiveConflict);
          if (hostileRivals.length > 0) {
            const attacker = hostileRivals[Math.floor(Math.random() * hostileRivals.length)];
            const targetBuilding = buildings.filter(b => b.isOccupied)[Math.floor(Math.random() * buildings.filter(b => b.isOccupied).length)];
            set({ 
              activeEvent: 'rivalAttack', 
              eventData: { 
                rivalId: attacker.id,
                rivalName: attacker.name,
                buildingId: targetBuilding?.id,
                buildingName: targetBuilding?.name
              }
            });
          }
          break;
        }
        
        case 'soldierDesertion': {
          const unhappySoldiers = soldiers.filter(s => s.loyalty < 40);
          if (unhappySoldiers.length > 0) {
            const deserter = unhappySoldiers[Math.floor(Math.random() * unhappySoldiers.length)];
            set({ 
              activeEvent: 'soldierDesertion', 
              eventData: { 
                soldierId: deserter.id,
                soldierName: deserter.name,
                reason: deserter.needs.pay < 50 ? 'low pay' : deserter.needs.food < 50 ? 'hunger' : 'low morale'
              }
            });
          }
          break;
        }
        
        case 'criminalCaught': {
          const workingOfficers = officers.filter(o => o.assignedBuildingId && !o.isArrested);
          if (workingOfficers.length > 0) {
            const caught = workingOfficers[Math.floor(Math.random() * workingOfficers.length)];
            set({ 
              activeEvent: 'criminalCaught', 
              eventData: { 
                officerId: caught.id,
                officerName: caught.name,
                bailCost: Math.floor(1000 + Math.random() * 2000)
              }
            });
          }
          break;
        }
        
        case 'nightclubSuccess': {
          const cashBonus = Math.floor(500 + Math.random() * 1000);
          set({ 
            activeEvent: 'nightclubSuccess', 
            eventData: { 
              cashBonus,
              reputationBonus: Math.floor(5 + Math.random() * 10)
            }
          });
          break;
        }
        
        case 'territoryUltimatum': {
          const aggressiveRivals = rivals.filter(r => r.relationship < -30 && r.strength > 50);
          if (aggressiveRivals.length > 0) {
            const aggressor = aggressiveRivals[Math.floor(Math.random() * aggressiveRivals.length)];
            set({ 
              activeEvent: 'territoryUltimatum', 
              eventData: { 
                rivalId: aggressor.id,
                rivalName: aggressor.name,
                demand: Math.floor(1000 + aggressor.strength * 30)
              }
            });
          }
          break;
        }
        
        default:
          break;
      }
    },
  };

  // Start territory friction timer after store initialization
  setTimeout(() => {
    store.startFrictionTimer();
  }, 1000);

  return store;
});