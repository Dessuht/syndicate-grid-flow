import { create } from 'zustand';
import { Character, CharacterTrait } from '@/types/character';
import { generateSoldier } from '@/lib/characterGenerator';

// ==================== TYPES ====================
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL'; // Added COUNCIL
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | 'coupAttempt' | 'newEra' | 'dailyBriefing' | null; // Added 'dailyBriefing'
export type DiploAction = 'trade' | 'alliance' | 'turfWar' | null;

export interface OfficerSkills {
  enforcement: number;    // Red Pole specialty - boosts illicit revenue, defense
  diplomacy: number;      // White Paper Fan specialty - reduces heat, improves bribes
  logistics: number;       // Straw Sandal specialty - boosts legal revenue
  recruitment: number;    // Blue Lantern specialty - soldier loyalty bonus
}

export interface OfficerRelationship {
  targetId: string;
  respect: number;  // -100 to 100
}

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
  skills: OfficerSkills;
  loyalty: number;  // 0-100, affects betrayal chance
  daysAssigned: number;  // consecutive days on same building
  daysIdle: number; // NEW: consecutive days unassigned
  relationships: OfficerRelationship[];
  isBetraying: boolean;
  traits: CharacterTrait[];
  isWounded: boolean;
  isArrested: boolean;
  daysToRecovery: number;
  currentAgenda: string | null; // NEW: Officer's current goal/desire
  face: number; // ADDED
  grudge: boolean; // NEW: Officer holds a grudge
  isTraitor: boolean; // NEW: Officer is leading a rebellion
  isSuccessor: boolean; // NEW: Designated successor
  isTestingWaters: boolean; // NEW: Loyalty penalty applied until successful operation
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
  isIllicit: boolean;  // affects which officer skills apply
  foodProvided: number;  // for soldier needs
  entertainmentProvided: number;
  upgraded: boolean;
  isRebelBase: boolean; // NEW: Building is controlled by a rogue officer
  rebelSoldierCount: number; // NEW: Number of soldiers defending the base
}

export interface StreetSoldier {
  id: string;
  name: string;
  loyalty: number;  // 0-100
  needs: {
    food: number;  // 0-100, depletes daily
    entertainment: number;
    pay: number;  // satisfaction with stipend
  };
  skill: number;  // combat effectiveness
  isDeserting: boolean;
}

export interface RivalGang {
  id: string;
  name: string;
  district: string;
  strength: number;
  relationship: number;  // -100 to 100
  hasTradeAgreement: boolean;
  hasAlliance: boolean;
  isScouted: boolean;  // New property for expansion logic
  isActiveConflict: boolean;  // New property for active conflicts
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
  effect: (state: GameState) => Partial<GameState>;
  officerVotes: Record<string, 'yes' | 'no'>;
  isVetoed: boolean;
}

// ==================== INITIAL DATA ====================
const PROMOTION_COST = 5000;
const PROMOTION_FACE_REQUIREMENT = 50;

const createOfficerSkills = (rank: OfficerRank): OfficerSkills => {
  switch (rank) {
    case 'Red Pole':
      return { enforcement: 80, diplomacy: 30, logistics: 40, recruitment: 50 };
    case 'White Paper Fan':
      return { enforcement: 20, diplomacy: 85, logistics: 60, recruitment: 40 };
    case 'Straw Sandal':
      return { enforcement: 40, diplomacy: 50, logistics: 80, recruitment: 60 };
    case 'Blue Lantern':
      return { enforcement: 50, diplomacy: 40, logistics: 50, recruitment: 85 };
    default:
      return { enforcement: 50, diplomacy: 50, logistics: 50, recruitment: 50 };
  }
};

// Add traits to officers
const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    name: 'Big Chan',
    rank: 'Red Pole',
    energy: 100,
    maxEnergy: 100,
    assignedBuildingId: null,
    skills: createOfficerSkills('Red Pole'),
    loyalty: 75,
    daysAssigned: 0,
    daysIdle: 0, 
    relationships: [
      { targetId: 'off-2', respect: 40 },
      { targetId: 'off-3', respect: 60 },
      { targetId: 'off-4', respect: 30 },
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
  },
  {
    id: 'off-2',
    name: 'Lily Wong',
    rank: 'White Paper Fan',
    energy: 80,
    maxEnergy: 80,
    assignedBuildingId: null,
    skills: createOfficerSkills('White Paper Fan'),
    loyalty: 85,
    daysAssigned: 0,
    daysIdle: 0, 
    relationships: [
      { targetId: 'off-1', respect: 50 },
      { targetId: 'off-3', respect: 70 },
      { targetId: 'off-4', respect: 45 },
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
  },
  {
    id: 'off-3',
    name: 'Snake Eye',
    rank: 'Straw Sandal',
    energy: 90,
    maxEnergy: 90,
    assignedBuildingId: null,
    skills: createOfficerSkills('Straw Sandal'),
    loyalty: 65,
    daysAssigned: 0,
    daysIdle: 0, 
    relationships: [
      { targetId: 'off-1', respect: 55 },
      { targetId: 'off-2', respect: 60 },
      { targetId: 'off-4', respect: 35 },
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
  },
  {
    id: 'off-4',
    name: 'Tommy Fist',
    rank: 'Blue Lantern',
    energy: 70,
    maxEnergy: 70,
    assignedBuildingId: null,
    skills: createOfficerSkills('Blue Lantern'),
    loyalty: 70,
    daysAssigned: 0,
    daysIdle: 0, 
    relationships: [
      { targetId: 'off-1', respect: 45 },
      { targetId: 'off-2', respect: 50 },
      { targetId: 'off-3', respect: 40 },
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
    isSuccessor: true, // Tommy Fist is the initial successor for testing
    isTestingWaters: false,
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
    upgraded: false,
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
    upgraded: false,
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
    upgraded: false,
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
    upgraded: false,
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
    upgraded: false,
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
    upgraded: false,
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

// ==================== GAME STATE ====================
export interface GameState {
  // Resources
  cash: number;
  reputation: number;
  policeHeat: number;
  currentDay: number;
  currentPhase: DayPhase;
  stipend: number;  // daily pay per soldier
  intel: number;  // Intelligence resource
  influence: number; // NEW: Influence resource

  // Entities
  officers: Officer[];
  buildings: Building[];
  soldiers: StreetSoldier[];
  rivals: RivalGang[];

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

  // Territory Stats
  territoryFriction: number;
  territoryInfluence: number;
  frictionInterval: NodeJS.Timeout | null;

  // Street War System
  streetWarRivalId: string | null;

  // Civil War State
  isCivilWarActive: boolean; // NEW
  rebelOfficerId: string | null; // NEW

  // Council System
  currentScene: GameScene;
  councilMotions: CouncilMotion[];
  
  // Daily Briefing State
  dailyBriefingIgnored: boolean; // NEW: Tracks if the passive choice was taken

  // Actions
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  advancePhase: () => void;
  setStipend: (amount: number) => void;
  reduceHeat: (amount: number) => void;
  hostNightclub: () => void;

  // Officer Interaction Actions
  shareTea: (officerId: string) => void;
  giveBonus: (officerId: string) => void;
  reprimandOfficer: (officerId: string) => void;
  promoteOfficer: (officerId: string, newRank: OfficerRank) => void;
  designateSuccessor: (officerId: string) => void; // NEW

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
  handleLeaderDeath: (officerId: string) => void; // NEW
  handleDailyBriefingChoice: (choice: 'passive' | 'financial' | 'authoritarian') => void; // NEW
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
}

// ==================== STORE ====================
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  cash: 5000,
  reputation: 50,
  policeHeat: 15,
  currentDay: 1,
  currentPhase: 'morning',
  stipend: 50,
  intel: 0,
  influence: 10, // Initial influence

  // Initialize entities
  officers: INITIAL_OFFICERS,
  buildings: INITIAL_BUILDINGS,
  soldiers: INITIAL_SOLDIERS,
  rivals: INITIAL_RIVALS,
  unlockedUpgrades: [],
  activeEvent: null,
  eventData: null,
  pendingEvents: [],
  activeDiplomacy: null,
  syndicateMembers: [],
  recruitCost: 500,

  // Home District Racket
  homeDistrictLeaderId: null,
  homeDistrictHeat: 10,
  homeDistrictRevenue: 0,

  // Territory Stats
  territoryFriction: 0,
  territoryInfluence: 20,
  frictionInterval: null,

  // Street War System
  streetWarRivalId: null,

  // Civil War State
  isCivilWarActive: false,
  rebelOfficerId: null,

  // Council System
  currentScene: 'DISTRICT', // Default scene
  councilMotions: [],
  
  // Daily Briefing State
  dailyBriefingIgnored: false,

  assignOfficer: (officerId: string, buildingId: string) => {
    const state = get();
    if (state.currentPhase !== 'morning') return;

    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      const building = state.buildings.find(b => b.id === buildingId);

      // Check if officer is available for assignment (not wounded or arrested)
      if (!officer || officer.isWounded || officer.isArrested || !building || building.isOccupied || officer.assignedBuildingId) {
        return state;
      }
      
      // Cannot assign to a rebel base
      if (building.isRebelBase) return state;

      if (building.inactiveUntilDay && building.inactiveUntilDay > state.currentDay) {
        return state;
      }

      // Update other officers' respect (jealousy mechanic)
      const updatedOfficers = state.officers.map(o => {
        if (o.id === officerId) {
          return { ...o, assignedBuildingId: buildingId, daysIdle: 0 }; // Reset daysIdle
        }

        // Other officers lose respect if this building is high-value
        if (building.baseRevenue > 600) {
          const newRelationships = o.relationships.map(r =>
            r.targetId === officerId
              ? { ...r, respect: Math.max(-100, r.respect - 5) }
              : r
          );
          return { ...o, relationships: newRelationships };
        }
        return o;
      });

      return {
        officers: updatedOfficers,
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

  // --- OFFICER INTERACTION ACTIONS ---
  shareTea: (officerId: string) => {
    set((state) => {
        const officer = state.officers.find(o => o.id === officerId);
        if (!officer || state.currentPhase !== 'morning' || officer.isWounded || officer.isArrested) return state;

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
        if (!officer || state.cash < cost || officer.isWounded || officer.isArrested) return state;

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
        if (!officer || officer.isWounded || officer.isArrested) return state;

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
                // Add event notification (optional, but good practice)
                updates.pendingEvents = [...state.pendingEvents, {
                    type: 'criminalCaught', // Reusing criminalCaught modal structure for a notice
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
        if (officer.rank === newRank) return state; // Already this rank

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
  // --- END OFFICER INTERACTION ACTIONS ---

  // --- COUNCIL ACTIONS ---
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
        // Note: Revenue cut logic would be applied in processDayOperations based on a flag, but for simplicity, we apply the loyalty boost here.
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
            return { 
              ...o, 
              loyalty: Math.max(0, o.loyalty - 20),
              grudge: true,
            };
          }
          return o;
        });
        updates.influence = Math.max(0, state.influence - 5); // Veto costs influence
      } else {
        // Player voted with the majority, motion passes (or fails gracefully)
        if (playerVote === 'yes') {
          updates = motion.effect(state);
        }
        updates.influence = Math.min(100, state.influence + 5); // Gain influence for consensus
      }

      // Mark motion as resolved
      const updatedMotions = state.councilMotions.filter(m => m.id !== motionId);

      return {
        ...state,
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
  // --- END COUNCIL ACTIONS ---

  // --- CIVIL WAR ACTIONS ---
  handleCoupResolution: (choice: 'raid' | 'negotiate', officerId: string) => {
    set((state) => {
      const rebelOfficer = state.officers.find(o => o.id === officerId);
      const rebelBase = state.buildings.find(b => b.isRebelBase && b.assignedOfficerId === officerId);
      if (!rebelOfficer || !rebelBase) return state;

      let updates: Partial<GameState> = { activeEvent: null, eventData: null, isCivilWarActive: false, rebelOfficerId: null };
      let summaryData: PostConflictSummaryData = {
        type: 'civilWar',
        outcome: 'failure',
        officerId: officerId,
        soldiersLost: 0,
        reputationChange: 0,
        faceChange: 0,
        loyaltyChange: 0,
        officerStatusEffect: 'none',
      };

      switch (choice) {
        case 'raid':
          // Calculate Raid Strength: Player's remaining soldiers vs. Rebel soldiers
          const loyalSoldierStrength = state.soldiers.reduce((sum, s) => sum + s.skill, 0);
          const rebelStrength = rebelBase.rebelSoldierCount * 50; // Assume 50 strength per rebel soldier
          const success = loyalSoldierStrength > rebelStrength;

          if (success) {
            // Victory: Officer removed/imprisoned, building recovered
            const execution = Math.random() < 0.5;
            summaryData.outcome = 'success';
            summaryData.reputationChange = 20;
            summaryData.officerStatusEffect = execution ? 'executed' : 'imprisoned';
            summaryData.soldiersLost = Math.floor(state.soldiers.length * 0.1); // 10% loyal soldier loss

            updates.officers = state.officers.filter(o => o.id !== officerId);
            if (!execution) {
              // If imprisoned, re-add officer as arrested
              updates.officers = [...(updates.officers || state.officers), { ...rebelOfficer, isTraitor: false, isArrested: true, assignedBuildingId: null, loyalty: 0, isSuccessor: false, isTestingWaters: false }];
            }
            
            updates.buildings = state.buildings.map(b =>
              b.id === rebelBase.id ? { ...b, isRebelBase: false, rebelSoldierCount: 0, isOccupied: false, assignedOfficerId: null } : b
            );
            updates.soldiers = state.soldiers.slice(summaryData.soldiersLost);
          } else {
            // Defeat: Massive reputation loss, officer remains rogue, lose more soldiers
            summaryData.outcome = 'failure';
            summaryData.reputationChange = -30;
            summaryData.soldiersLost = Math.floor(state.soldiers.length * 0.3); // 30% loyal soldier loss
            
            updates.soldiers = state.soldiers.slice(summaryData.soldiersLost);
            // Civil War remains active
            updates.isCivilWarActive = true;
            updates.rebelOfficerId = officerId;
          }
          break;

        case 'negotiate':
          const cost = 5000; // Fixed cost for negotiation
          const intelCost = 50;
          if (state.cash < cost || state.intel < intelCost) return state;

          summaryData.outcome = 'success';
          summaryData.reputationChange = -50;
          summaryData.loyaltyChange = 50;
          
          updates.cash = state.cash - cost;
          updates.intel = state.intel - intelCost;
          updates.officers = state.officers.map(o =>
            o.id === officerId ? { ...o, isTraitor: false, loyalty: 50, face: 0, grudge: false, isSuccessor: false, isTestingWaters: false } : o
          );
          updates.buildings = state.buildings.map(b =>
            b.id === rebelBase.id ? { ...b, isRebelBase: false, rebelSoldierCount: 0, isOccupied: false, assignedOfficerId: null } : b
          );
          // Rebel soldiers return to the pool
          updates.soldiers = [...state.soldiers, ...Array(rebelBase.rebelSoldierCount).fill(0).map(() => createNewSoldier(state.currentDay))];
          break;
      }

      updates.reputation = Math.max(0, state.reputation + summaryData.reputationChange);
      updates.pendingEvents = [...state.pendingEvents, { type: 'postConflictSummary', data: summaryData }];
      
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
  
  handleLeaderDeath: (officerId: string) => {
    set((state) => {
      const successor = state.officers.find(o => o.isSuccessor);
      const deceasedOfficer = state.officers.find(o => o.id === officerId);

      if (!successor) {
        // No successor: Game Over (Total Collapse)
        // In a real game, this would trigger a Game Over screen. For now, we log and reset.
        console.error("GAME OVER: Leader died and no successor was designated.");
        return {
          // Resetting state for simulation purposes, replace with actual Game Over logic
          cash: 1000,
          reputation: 10,
          officers: INITIAL_OFFICERS.map(o => ({...o, isSuccessor: false, isTestingWaters: false})),
          soldiers: INITIAL_SOLDIERS,
          currentDay: 1,
          activeEvent: null,
          eventData: { type: 'collapse' },
        };
      }

      // Succession Logic
      const newLeader = { ...successor };
      const eulogy = `${deceasedOfficer?.name || 'The Dragonhead'} has fallen. Long live the new boss, ${newLeader.name}.`;

      // 1. Apply Loyalty Shock to all remaining officers
      const updatedOfficers = state.officers
        .filter(o => o.id !== officerId) // Remove deceased leader
        .map(o => {
          let newLoyalty = Math.max(0, o.loyalty - 30);
          return {
            ...o,
            loyalty: newLoyalty,
            isTestingWaters: true, // Start loyalty decay
            isSuccessor: false, // Clear successor flag from everyone
          };
        });

      // 2. Promote successor (reset face, clear successor flag)
      const promotedLeader = {
        ...newLeader,
        face: Math.floor(newLeader.face * 0.5), // 50% Face reset
        isSuccessor: false,
        isTestingWaters: false, // New leader is exempt from testing waters
      };
      
      // 3. Update state and trigger modal
      return {
        officers: [...updatedOfficers, promotedLeader],
        reputation: Math.max(0, state.reputation - 10), // Slight rep hit for instability
        activeEvent: 'newEra',
        eventData: {
          eulogy: eulogy,
          newLeaderName: promotedLeader.name,
          newLeaderRank: promotedLeader.rank,
        },
      };
    });
  },
  
  handleDailyBriefingChoice: (choice: 'passive' | 'financial' | 'authoritarian') => {
    set((state) => {
      const { officerId, eventType } = state.eventData;
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return { ...state, activeEvent: null, eventData: null };

      let updates: Partial<GameState> = { activeEvent: null, eventData: null, dailyBriefingIgnored: false };
      let updatedOfficers = state.officers;
      let newCash = state.cash;

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
          if (state.cash < costs.cost) return state; // Should be disabled in UI, but safety check
          
          newCash -= costs.cost;
          updatedOfficers = updatedOfficers.map(o => 
            o.id === officerId 
              ? { 
                  ...o, 
                  loyalty: Math.min(100, o.loyalty + costs.loyaltyBoost),
                  energy: Math.min(o.maxEnergy, o.energy + costs.energyBoost),
                } 
              : o
          );
          break;

        case 'authoritarian':
          // Fixes issue, but -20 Loyalty
          updatedOfficers = updatedOfficers.map(o => 
            o.id === officerId 
              ? { ...o, loyalty: Math.max(0, o.loyalty - 20) } 
              : o
          );
          break;
      }

      return { ...updates, cash: newCash, officers: updatedOfficers };
    });
  },
  // --- END EVENT ACTIONS ---

  advancePhase: (/* ... existing implementation ... */) => {
    set((state) => {
      const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
      const currentIndex = phases.indexOf(state.currentPhase);

      // 1. BLOCK: Cannot advance from morning if a Daily Briefing is active
      if (state.currentPhase === 'morning' && state.activeEvent === 'dailyBriefing') {
        return state;
      }

      // Check for Council Trigger (Every 10 days, at the start of the day cycle)
      if (state.currentPhase === 'night' && (state.currentDay + 1) % 10 === 0) {
        // Queue council meeting for the next morning
        get().generateCouncilMotions();
        return { currentPhase: 'morning', currentDay: state.currentDay + 1, currentScene: 'COUNCIL' };
      }

      // Process phase-specific logic
      let updates: Partial<GameState> = {};
      let newEvents: { type: EventType; data: any }[] = [];

      switch (state.currentPhase) {
        case 'morning':
          // Morning -> Day: Increase friction when starting operations
          updates.currentPhase = 'day';
          // Increase friction with Wo Shing Wo when starting operations
          const woShingWo = state.rivals.find(r => r.id === 'rival-3');
          if (woShingWo && !woShingWo.isActiveConflict) {
            updates.rivals = state.rivals.map(r =>
              r.id === 'rival-3'
                ? { ...r, relationship: Math.max(-100, r.relationship - 5) }
                : r
            );
          }
          break;

        case 'day':
          // Day -> Evening: Process operations
          const dayResults = processDayOperations(state);
          updates = { ...updates, ...dayResults.updates, currentPhase: 'evening' };
          newEvents = dayResults.events;
          
          // Check for successful operation to clear 'Testing the Waters'
          const successfulOperation = state.officers.some(o => o.assignedBuildingId && o.energy > 0);
          if (successfulOperation) {
            updates.officers = (updates.officers || state.officers).map(o => ({
              ...o,
              isTestingWaters: false,
            }));
          }
          break;

        case 'evening':
          // Evening -> Night: Process soldier needs
          const eveningResults = processEveningNeeds(state);
          updates = { ...updates, ...eveningResults.updates, currentPhase: 'night' };
          newEvents = eveningResults.events;
          break;

        case 'night':
          // Night -> Morning (next day): Random events, relationship changes, COUP CHECK, Daily Briefing Trigger
          const nightResults = processNightEvents(state);
          updates = { ...updates, ...nightResults.updates, currentPhase: 'morning', currentDay: state.currentDay + 1 };
          newEvents = nightResults.events;
          
          // Apply 'Testing the Waters' penalty
          updates.officers = (updates.officers || state.officers).map(o => {
            if (o.isTestingWaters) {
              return { ...o, loyalty: Math.max(0, o.loyalty - 5) }; // -5% loyalty decay
            }
            return o;
          });
          
          // Check for Coup Attempt
          if (!state.isCivilWarActive) {
            const coupCheck = checkCoupAttempt(state);
            if (coupCheck.officerId) {
              updates.isCivilWarActive = true;
              updates.rebelOfficerId = coupCheck.officerId;
              updates.officers = coupCheck.updatedOfficers;
              updates.buildings = coupCheck.updatedBuildings;
              updates.soldiers = coupCheck.updatedSoldiers;
              newEvents.push({ type: 'coupAttempt', data: { officerName: coupCheck.officerName, buildingName: coupCheck.buildingName, officerId: coupCheck.officerId } });
            }
          }
          
          // Generate Daily Briefing Event for the next morning
          const briefingEvent = generateDailyBriefing(state);
          if (briefingEvent) {
            newEvents.push(briefingEvent);
          }
          
          // Reset daily briefing ignored flag
          updates.dailyBriefingIgnored = false;
          break;
      }

      // Process recovery at the end of each day cycle
      const recoveryResults = processRecovery(state);
      updates = { ...updates, ...recoveryResults };

      // Queue events if any
      if (newEvents.length > 0) {
        const [firstEvent, ...rest] = newEvents;
        return {
          ...updates,
          activeEvent: firstEvent.type,
          eventData: firstEvent.data,
          pendingEvents: [...state.pendingEvents, ...rest],
        };
      }

      return updates;
    });
  },

  // ... (rest of the actions remain the same)
  setStipend: (amount: number) => {
    set({ stipend: Math.max(0, Math.min(200, amount)) });
  },

  reduceHeat: (amount: number) => {
    set((state) => ({
      policeHeat: Math.max(0, state.policeHeat - amount),
    }));
  },

  hostNightclub: () => {
    set((state) => {
      const cost = 1000;
      if (state.cash < cost) return state;

      return {
        cash: state.cash - cost,
        reputation: Math.min(100, state.reputation + 10),
        officers: state.officers.map(o => ({
          ...o,
          energy: Math.min(o.maxEnergy, o.energy + 30),
          loyalty: Math.min(100, o.loyalty + 5),
        })),
        soldiers: state.soldiers.map(s => ({
          ...s,
          needs: {
            ...s.needs,
            entertainment: Math.min(100, s.needs.entertainment + 40),
          },
          loyalty: Math.min(100, s.loyalty + 10),
        })),
      };
    });
  },

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
                if (!newOfficer.traits.includes('Battle Hardened' as CharacterTrait)) {
                  newOfficer.traits = [...newOfficer.traits, 'Battle Hardened' as CharacterTrait];
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
              pay: 100  // Doesn't need pay
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
                ? { ...m, stats: { ...m.stats, loyalty: Math.max(0, m.stats.loyalty - 20) } }
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
      if (!rivalId) return { ...state, activeEvent: null, eventData: null };

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
                if (!newOfficer.traits.includes('Battle Hardened' as CharacterTrait)) {
                  newOfficer.traits = [...newOfficer.traits, 'Battle Hardened' as CharacterTrait];
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

              // Unassign officer from lost building
              updatedOfficers = updatedOfficers.map(o =>
                o.assignedBuildingId === mostProfitableBuilding.id
                  ? { ...o, assignedBuildingId: null }
                  : o
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

  dismissEvent: () => {
    set((state) => {
      // Check for pending events
      if (state.pendingEvents.length > 0) {
        const [nextEvent, ...rest] = state.pendingEvents;
        return {
          activeEvent: nextEvent.type,
          eventData: nextEvent.data,
          pendingEvents: rest,
        };
      }

      return {
        activeEvent: null,
        eventData: null,
      };
    });
  },

  initiateDiplomacy: (rivalId: string, action: DiploAction) => {
    set({ activeDiplomacy: { rivalId, action } });
  },

  confirmDiplomacy: () => {
    set((state) => {
      if (!state.activeDiplomacy) return state;

      const { rivalId, action } = state.activeDiplomacy;
      const rival = state.rivals.find(r => r.id === rivalId);
      if (!rival) return state;

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
          if (rival.relationship >= 30) {
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

  upgradeBuilding: (buildingId: string) => {
    // Placeholder implementation
    console.log(`Upgrade building ${buildingId}`);
  },

  purchaseIntel: (cost: number) => {
    set((state) => {
      if (state.cash < cost) return state;
      return {
        cash: state.cash - cost,
        intel: state.intel + 50
      };
    });
  },

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
        soldiers: [...state.soldiers, newSoldier]
      };
    });
  },

  recruitSyndicateMember: () => {
    set((state) => {
      if (state.cash < state.recruitCost) return state;
      
      const newMember = generateSoldier(state.currentDay);
      const newCost = Math.min(5000, state.recruitCost + 200);
      
      return {
        cash: state.cash - state.recruitCost,
        syndicateMembers: [...state.syndicateMembers, newMember],
        recruitCost: newCost
      };
    });
  },

  assignSyndicateMember: (memberId: string) => {
    set((state) => ({
      homeDistrictLeaderId: memberId
    }));
  },

  unassignSyndicateMember: () => {
    set((state) => ({
      homeDistrictLeaderId: null
    }));
  },

  processRacketCycle: () => {
    // Placeholder implementation
    console.log("Process racket cycle");
  },

  scoutTerritory: (rivalId: string) => {
    set((state) => ({
      rivals: state.rivals.map(rival => 
        rival.id === rivalId ? { ...rival, isScouted: true } : rival
      )
    }));
  },

  startFrictionTimer: () => {
    // Placeholder implementation
    console.log("Start friction timer");
  },

  stopFrictionTimer: () => {
    // Placeholder implementation
    console.log("Stop friction timer");
  },

  resetFriction: () => {
    set((state) => ({
      territoryFriction: 0
    }));
  },

  spendIntelToReduceFriction: (rivalId: string, amount: number) => {
    set((state) => {
      if (state.intel < amount) return state;
      
      return {
        intel: state.intel - amount,
        rivals: state.rivals.map(rival => 
          rival.id === rivalId 
            ? { ...rival, relationship: Math.min(100, rival.relationship + 10) } 
            : rival
        )
      };
    });
  },

  spendIntelToScout: (rivalId: string) => {
    set((state) => {
      if (state.intel < 50) return state;
      
      return {
        intel: state.intel - 50,
        rivals: state.rivals.map(rival => 
          rival.id === rivalId ? { ...rival, isScouted: true } : rival
        )
      };
    });
  },

  increaseFriction: () => {
    set((state) => ({
      territoryFriction: Math.min(100, state.territoryFriction + 5)
    }));
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
        )
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
        )
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
  }
}));

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper function to create a new StreetSoldier object.
 */
function createNewSoldier(currentDay: number): StreetSoldier {
  // We reuse the logic from recruitSoldier but return the object instead of updating state
  return {
    id: `sol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
}

/**
 * Generates a random daily briefing event for an assigned officer.
 */
function generateDailyBriefing(state: GameState): { type: EventType; data: any } | null {
  const assignedOfficers = state.officers.filter(o => o.assignedBuildingId && !o.isWounded && !o.isArrested);
  
  if (assignedOfficers.length === 0 || Math.random() < 0.5) {
    return null; // 50% chance of no event
  }
  
  const officer = assignedOfficers[Math.floor(Math.random() * assignedOfficers.length)];
  
  // Determine event type based on officer traits or randomly
  let eventType: 'sick' | 'disgruntled' | 'hungover' | 'rivals';
  
  if (officer.traits.includes('Hot-headed') && Math.random() < 0.4) {
    eventType = 'hungover';
  } else if (officer.loyalty < 50 && Math.random() < 0.4) {
    eventType = 'disgruntled';
  } else if (officer.traits.includes('Connected') && Math.random() < 0.3) {
    eventType = 'rivals';
  } else {
    const types: ('sick' | 'disgruntled' | 'hungover' | 'rivals')[] = ['sick', 'disgruntled', 'hungover', 'rivals'];
    eventType = types[Math.floor(Math.random() * types.length)];
  }

  return {
    type: 'dailyBriefing',
    data: {
      officerId: officer.id,
      eventType: eventType,
    },
  };
}

/**
 * Checks if any high-ranking officer is ready to stage a coup.
 */
function checkCoupAttempt(state: GameState): { officerId: string | null; officerName: string | null; buildingName: string | null; updatedOfficers: Officer[]; updatedBuildings: Building[]; updatedSoldiers: StreetSoldier[] } {
  const coupCandidate = state.officers.find(o => 
    (o.rank === 'Red Pole' || o.rank === 'White Paper Fan' || o.rank === 'Deputy (438)' || o.rank === 'Dragonhead (489)') &&
    o.loyalty < 15 &&
    o.face > 50 &&
    o.assignedBuildingId // Must be assigned to a building to seize it
  );

  if (!coupCandidate) {
    return { officerId: null, officerName: null, buildingName: null, updatedOfficers: state.officers, updatedBuildings: state.buildings, updatedSoldiers: state.soldiers };
  }

  const building = state.buildings.find(b => b.id === coupCandidate.assignedBuildingId);
  if (!building) {
    return { officerId: null, officerName: null, buildingName: null, updatedOfficers: state.officers, updatedBuildings: state.buildings, updatedSoldiers: state.soldiers };
  }

  // 1. Mark Officer as Traitor
  const updatedOfficers = state.officers.map(o => 
    o.id === coupCandidate.id ? { ...o, isTraitor: true, assignedBuildingId: null } : o
  );

  // 2. Split Soldiers (30% defect)
  const totalSoldiers = state.soldiers.length;
  const defectingCount = Math.floor(totalSoldiers * 0.3);
  const loyalSoldiers = state.soldiers.slice(defectingCount);
  
  // 3. Seize Building
  const updatedBuildings = state.buildings.map(b => 
    b.id === building.id 
      ? { 
          ...b, 
          isRebelBase: true, 
          rebelSoldierCount: defectingCount, 
          isOccupied: true, 
          assignedOfficerId: coupCandidate.id,
          inactiveUntilDay: null, // Active rebel base
        } 
      : b
  );
  
  return {
    officerId: coupCandidate.id,
    officerName: coupCandidate.name,
    buildingName: building.name,
    updatedOfficers,
    updatedBuildings,
    updatedSoldiers: loyalSoldiers,
  };
}

function processDayOperations(state: GameState): { updates: Partial<GameState>; events: { type: EventType; data: any }[] } {
  let totalRevenue = 0;
  let totalHeat = 0;
  let totalIntel = 0;  // Track intel generation
  const events: { type: EventType; data: any }[] = [];
  
  const briefingOfficerId = state.dailyBriefingIgnored ? state.eventData?.officerId : null;

  // Calculate revenue and heat from occupied buildings
  let updatedOfficers = state.officers.map(officer => {
    if (officer.assignedBuildingId) {
      const building = state.buildings.find(b => b.id === officer.assignedBuildingId);
      if (building && (!building.inactiveUntilDay || building.inactiveUntilDay <= state.currentDay) && !building.isRebelBase) {
        // Check if officer is testing waters and successfully completed an operation
        if (officer.isTestingWaters) {
          // Clear testing waters flag upon successful operation
          return { ...officer, isTestingWaters: false };
        }
        
        // Calculate revenue based on officer skills
        let revenueMultiplier = 1;
        if (building.isIllicit && officer.rank === 'Red Pole') {
          revenueMultiplier += officer.skills.enforcement / 100;
        }
        if (!building.isIllicit && officer.rank === 'Straw Sandal') {
          revenueMultiplier += officer.skills.logistics / 100;
        }
        
        // Apply passive penalty if this officer was ignored
        if (briefingOfficerId === officer.id) {
            revenueMultiplier *= 0.5; // 50% effectiveness reduction
        }
        
        totalRevenue += Math.floor(building.baseRevenue * revenueMultiplier);

        // Calculate heat reduction from White Paper Fan at Police Station
        if (building.type === 'Police Station' && officer.rank === 'White Paper Fan') {
          totalHeat += building.heatGen * 2;  // Double heat reduction
        } else {
          totalHeat += building.heatGen;
        }

        // Generate Intel based on Street Smart trait
        if (officer.traits.includes('Street Smart')) {
          totalIntel += 5;  // 5 Intel per day for Street Smart officers
        }

        // Increase days assigned
        const newDaysAssigned = officer.daysAssigned + 1;
        const newEnergy = Math.max(0, officer.energy - 10);
        
        // Small face gain for successful operation
        const faceGain = Math.floor(building.baseRevenue / 200); // 2-4 face per day

        return {
          ...officer,
          energy: newEnergy,
          daysAssigned: newDaysAssigned,
          daysIdle: 0, // Reset daysIdle if assigned
          face: Math.min(100, officer.face + faceGain),
        };
      }
    }
    return officer;
  });

  // Ego Clash Check: If two Red Poles are assigned, lower their loyalty
  const assignedRedPoles = updatedOfficers.filter(o => o.rank === 'Red Pole' && o.assignedBuildingId);
  if (assignedRedPoles.length >= 2) {
      updatedOfficers = updatedOfficers.map(officer => {
          if (assignedRedPoles.some(rp => rp.id === officer.id)) {
              // Ego clash penalty
              return {
                  ...officer,
                  loyalty: Math.max(0, officer.loyalty - 5)
              };
          }
          return officer;
      });
  }

  // Auto-unassign officers with 0 energy
  const finalOfficers = updatedOfficers.map(o => {
    if (o.energy === 0 && o.assignedBuildingId) {
      return {
        ...o,
        assignedBuildingId: null,
        daysAssigned: 0,
        daysIdle: 0, // Will be incremented at night
      };
    }
    return o;
  });

  const updatedBuildings = state.buildings.map(b => {
    const officer = finalOfficers.find(o => o.assignedBuildingId === b.id);
    if (!officer && b.isOccupied && !b.isRebelBase) {
      return {
        ...b,
        isOccupied: false,
        assignedOfficerId: null
      };
    }
    return b;
  });

  // Calculate new heat
  const newHeat = Math.max(0, Math.min(100, state.policeHeat + totalHeat));

  // Police raid check
  if (newHeat > 70 && Math.random() < 0.25) {
    events.push({ type: 'policeRaid', data: {} });
  }

  return {
    updates: {
      cash: state.cash + totalRevenue,
      policeHeat: newHeat,
      intel: state.intel + totalIntel,  // Add generated intel
      officers: finalOfficers,
      buildings: updatedBuildings,
    },
    events,
  };
}

function processEveningNeeds(state: GameState): { updates: Partial<GameState>; events: { type: EventType; data: any }[] } {
  const events: { type: EventType; data: any }[] = [];

  // Calculate total food and entertainment from buildings
  const totalFood = state.buildings
    .filter(b => b.isOccupied && !b.isRebelBase)
    .reduce((sum, b) => sum + b.foodProvided, 0);

  const totalEntertainment = state.buildings
    .filter(b => b.isOccupied && !b.isRebelBase)
    .reduce((sum, b) => sum + b.entertainmentProvided, 0);

  // Pay stipends
  const loyalSoldiers = state.soldiers.filter(s => !s.isDeserting);
  const stipendCost = loyalSoldiers.length * state.stipend;
  const canPayFull = state.cash >= stipendCost;
  const actualPay = canPayFull ? state.stipend : Math.floor(state.cash / loyalSoldiers.length);

  // Update soldier needs
  const updatedSoldiers = state.soldiers.map(soldier => {
    // Needs decay
    const foodSatisfaction = Math.min(100, soldier.needs.food - 20 + (totalFood / loyalSoldiers.length));
    const entSatisfaction = Math.min(100, soldier.needs.entertainment - 15 + (totalEntertainment / loyalSoldiers.length));
    const paySatisfaction = Math.min(100, (actualPay / 50) * 50);  // 50 is baseline

    // Loyalty changes based on needs
    const avgSatisfaction = (foodSatisfaction + entSatisfaction + paySatisfaction) / 3;
    let loyaltyChange = avgSatisfaction > 60 ? 2 : avgSatisfaction > 40 ? 0 : -5;

    // Blue Lantern bonus
    const blueLantern = state.officers.find(o => o.rank === 'Blue Lantern' && o.assignedBuildingId);
    if (blueLantern) {
      loyaltyChange += Math.floor(blueLantern.skills.recruitment / 20);
    }

    const newLoyalty = Math.max(0, Math.min(100, soldier.loyalty + loyaltyChange));

    return {
      ...soldier,
      needs: {
        food: Math.max(0, foodSatisfaction),
        entertainment: Math.max(0, entSatisfaction),
        pay: paySatisfaction,
      },
      loyalty: newLoyalty,
      isDeserting: newLoyalty < 20,
    };
  });

  // Remove deserters
  const desertingCount = updatedSoldiers.filter(s => s.isDeserting).length;
  const remainingSoldiers = updatedSoldiers.filter(s => !s.isDeserting);

  if (desertingCount > 0) {
    events.push({ type: 'soldierDesertion', data: { count: desertingCount } });
  }

  // Criminal caught chance (low public order)
  const avgLoyalty = remainingSoldiers.reduce((sum, s) => sum + s.loyalty, 0) / remainingSoldiers.length;
  if (avgLoyalty < 50 && Math.random() < 0.15) {
    events.push({
      type: 'criminalCaught',
      data: {
        criminalName: SOLDIER_NAMES[Math.floor(Math.random() * SOLDIER_NAMES.length)],
        crime: ['theft', 'assault', 'smuggling'][Math.floor(Math.random() * 3)]
      }
    });
  }

  return {
    updates: {
      cash: Math.max(0, state.cash - (canPayFull ? stipendCost : state.cash)),
      soldiers: remainingSoldiers,
    },
    events,
  };
}

function processNightEvents(state: GameState): { updates: Partial<GameState>; events: { type: EventType; data: any }[] } {
  const events: { type: EventType; data: any }[] = [];

  // Update officer relationships based on daily assignments and handle idle time
  const updatedOfficers = state.officers.map(officer => {
    let newOfficer = { ...officer };

    // 1. Update daysIdle/daysAssigned
    if (newOfficer.assignedBuildingId === null && !newOfficer.isArrested && !newOfficer.isWounded) {
      newOfficer.daysIdle += 1;
      newOfficer.daysAssigned = 0;
    } else {
      // If assigned, wounded, or arrested, reset idle counter
      newOfficer.daysIdle = 0;
    }

    // 2. Ambitious Trait Check (if unassigned for 3 days)
    if (newOfficer.traits.includes('Ambitious' as CharacterTrait) && newOfficer.daysIdle >= 3) {
      newOfficer.loyalty = Math.max(0, newOfficer.loyalty - 10); // Loyalty drops significantly
    }
    
    // 3. Relationship updates
    const newRelationships = newOfficer.relationships.map(rel => {
      const target = state.officers.find(o => o.id === rel.targetId);
      if (target) {
        // If both assigned, slight respect increase
        if (newOfficer.assignedBuildingId && target.assignedBuildingId) {
          return {
            ...rel,
            respect: Math.min(100, rel.respect + 1)
          };
        }

        // If you're assigned and they're not, they lose respect
        if (newOfficer.assignedBuildingId && !target.assignedBuildingId) {
          return {
            ...rel,
            respect: Math.max(-100, rel.respect - 2)
          };
        }
      }
      return rel;
    });
    newOfficer.relationships = newRelationships;
    
    return newOfficer;
  });

  // Check for betrayal from jealous officers (using updatedOfficers)
  updatedOfficers.forEach(officer => {
    if (officer.loyalty < 40 && officer.daysIdle > 0) {
      // Officer not assigned might be jealous
      const avgRespect = officer.relationships.reduce((sum, r) => sum + r.respect, 0) / officer.relationships.length;
      if (avgRespect < 30 && Math.random() < 0.2) {
        events.push({
          type: 'betrayal',
          data: {
            officerId: officer.id,
            officerName: officer.name
          }
        });
      }
    }
  });

  // Rival attack chance
  state.rivals.forEach(rival => {
    if (rival.relationship < -30 && !rival.hasAlliance && Math.random() < 0.15) {
      events.push({
        type: 'rivalAttack',
        data: {
          rivalId: rival.id,
          rivalName: rival.name
        }
      });
    }
  });

  return {
    updates: {
      officers: updatedOfficers,
      reputation: Math.min(100, state.reputation + 1),  // Slight daily rep gain
    },
    events,
  };
}

// Process recovery at the end of each day cycle
function processRecovery(state: GameState): Partial<GameState> {
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
}

const SOLDIER_NAMES_EXPORT = SOLDIER_NAMES;
export { SOLDIER_NAMES_EXPORT as SOLDIER_NAMES };