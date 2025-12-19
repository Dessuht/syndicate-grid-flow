import { create } from 'zustand';
import { Character, CharacterTrait } from '@/types/character';
import { generateSoldier } from '@/lib/characterGenerator';

// ==================== TYPES ====================
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | null;
export type DiploAction = 'trade' | 'alliance' | 'turfWar' | null;

export interface OfficerSkills {
  enforcement: number; // Red Pole specialty - boosts illicit revenue, defense
  diplomacy: number; // White Paper Fan specialty - reduces heat, improves bribes
  logistics: number; // Straw Sandal specialty - boosts legal revenue
  recruitment: number; // Blue Lantern specialty - soldier loyalty bonus
}

export interface OfficerRelationship {
  targetId: string;
  respect: number; // -100 to 100
}

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
  skills: OfficerSkills;
  loyalty: number; // 0-100, affects betrayal chance
  daysAssigned: number; // consecutive days on same building
  relationships: OfficerRelationship[];
  isBetraying: boolean;
  traits: CharacterTrait[]; // Add traits to officers
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
  isIllicit: boolean; // affects which officer skills apply
  foodProvided: number; // for soldier needs
  entertainmentProvided: number;
  upgraded: boolean;
}

export interface StreetSoldier {
  id: string;
  name: string;
  loyalty: number; // 0-100
  needs: {
    food: number; // 0-100, depletes daily
    entertainment: number;
    pay: number; // satisfaction with stipend
  };
  skill: number; // combat effectiveness
  isDeserting: boolean;
}

export interface RivalGang {
  id: string;
  name: string;
  district: string;
  strength: number;
  relationship: number; // -100 to 100
  hasTradeAgreement: boolean;
  hasAlliance: boolean;
  isScouted: boolean; // New property for expansion logic
  isActiveConflict: boolean; // New property for active conflicts
}

export interface PostConflictSummaryData {
  type: 'raid' | 'streetWar';
  outcome: 'success' | 'failure';
  officerId: string | null;
  soldiersLost: number;
  reputationChange: number;
  faceChange: number;
  loyaltyChange: number;
  officerStatusEffect: 'none' | 'wounded' | 'arrested';
  rivalName?: string;
}

// ==================== INITIAL DATA ====================
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
    relationships: [
      { targetId: 'off-2', respect: 40 },
      { targetId: 'off-3', respect: 60 },
      { targetId: 'off-4', respect: 30 },
    ],
    isBetraying: false,
    traits: ['Fearless', 'Ruthless']
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
    relationships: [
      { targetId: 'off-1', respect: 50 },
      { targetId: 'off-3', respect: 70 },
      { targetId: 'off-4', respect: 45 },
    ],
    isBetraying: false,
    traits: ['Calculating', 'Silver Tongue']
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
    relationships: [
      { targetId: 'off-1', respect: 55 },
      { targetId: 'off-2', respect: 60 },
      { targetId: 'off-4', respect: 35 },
    ],
    isBetraying: false,
    traits: ['Street Smart', 'Connected']
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
    relationships: [
      { targetId: 'off-1', respect: 45 },
      { targetId: 'off-2', respect: 50 },
      { targetId: 'off-3', respect: 40 },
    ],
    isBetraying: false,
    traits: ['Loyal Dog', 'Street Smart']
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
    upgraded: false
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
    upgraded: false
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
    upgraded: false
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
    upgraded: false
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
    upgraded: false
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
    upgraded: false
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
  stipend: number; // daily pay per soldier
  intel: number; // Intelligence resource

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

  // Actions
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  advancePhase: () => void;
  setStipend: (amount: number) => void;
  reduceHeat: (amount: number) => void;
  hostNightclub: () => void;

  // Event handlers
  handleRaidChoice: (choice: 'bribe' | 'stand' | 'escape') => void;
  handleBetrayalChoice: (choice: 'forgive' | 'punish' | 'exile') => void;
  handleCriminalChoice: (choice: 'execute' | 'enslave' | 'spy') => void;
  handleRivalAttackChoice: (choice: 'fight' | 'negotiate' | 'retreat') => void;
  handleTerritoryUltimatum: (choice: 'pay' | 'refuse') => void;
  handleStreetWarChoice: (choice: 'bribe' | 'fight') => void;
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
  intel: 0, // Initialize intel resource
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

  assignOfficer: (officerId: string, buildingId: string) => {
    const state = get();
    if (state.currentPhase !== 'morning') return;
    
    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      const building = state.buildings.find(b => b.id === buildingId);
      
      if (!officer || !building || building.isOccupied || officer.assignedBuildingId) {
        return state;
      }
      
      if (building.inactiveUntilDay && building.inactiveUntilDay > state.currentDay) {
        return state;
      }
      
      // Update other officers' respect (jealousy mechanic)
      const updatedOfficers = state.officers.map(o => {
        if (o.id === officerId) {
          return { ...o, assignedBuildingId: buildingId };
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

  advancePhase: () => {
    set((state) => {
      const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
      const currentIndex = phases.indexOf(state.currentPhase);
      
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
          break;
        case 'evening':
          // Evening -> Night: Process soldier needs
          const eveningResults = processEveningNeeds(state);
          updates = { ...updates, ...eveningResults.updates, currentPhase: 'night' };
          newEvents = eveningResults.events;
          break;
        case 'night':
          // Night -> Morning (next day): Random events, relationship changes
          const nightResults = processNightEvents(state);
          updates = { ...updates, ...nightResults.updates, currentPhase: 'morning', currentDay: state.currentDay + 1 };
          newEvents = nightResults.events;
          break;
      }
      
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
          const raidPower = 50; // Base police strength
          
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
            repChange = 5; // Smaller rep gain for raid defense
            officerFaceChange = 10;
            soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.1 + 0.05)); // 5-15% loss
          } else {
            repChange = -15;
            officerLoyaltyChange = -15;
            soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.2 + 0.2)); // 20-40% loss
            
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
                      newOfficer.energy = Math.max(0, Math.floor(newOfficer.maxEnergy * 0.2)); 
                  } else if (officerStatusEffect === 'arrested') {
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
          updates.reputation = Math.max(0, state.reputation - 10); // Looks weak
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
            loyalty: Math.max(0, s.loyalty - 5), // Soldiers fear you
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
              pay: 100 // Doesn't need pay
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
            updates.soldiers = state.soldiers.slice(0, -1); // Lose a soldier
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
            updates.territoryFriction = 0; // Reset friction after resolution
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
            soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.1 + 0.1)); // 10-20% loss
          } else {
            repChange = -20;
            officerLoyaltyChange = -15;
            soldiersLost = Math.floor(state.soldiers.length * (Math.random() * 0.2 + 0.3)); // 30-50% loss
            
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
                      newOfficer.energy = Math.max(0, Math.floor(newOfficer.maxEnergy * 0.2)); 
                  } else if (officerStatusEffect === 'arrested') {
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
          updates.territoryFriction = 0; // Reset friction after conflict resolution
          
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
  }
}));

// ==================== HELPER FUNCTIONS ====================
function processDayOperations(state: GameState): { updates: Partial<GameState>; events: { type: EventType; data: any }[] } {
  let totalRevenue = 0;
  let totalHeat = 0;
  let totalIntel = 0; // Track intel generation
  const events: { type: EventType; data: any }[] = [];
  
  // Calculate revenue and heat from occupied buildings
  const updatedOfficers = state.officers.map(officer => {
    if (officer.assignedBuildingId) {
      const building = state.buildings.find(b => b.id === officer.assignedBuildingId);
      if (building && (!building.inactiveUntilDay || building.inactiveUntilDay <= state.currentDay)) {
        // Calculate revenue based on officer skills
        let revenueMultiplier = 1;
        if (building.isIllicit && officer.rank === 'Red Pole') {
          revenueMultiplier += officer.skills.enforcement / 100;
        }
        if (!building.isIllicit && officer.rank === 'Straw Sandal') {
          revenueMultiplier += officer.skills.logistics / 100;
        }
        totalRevenue += Math.floor(building.baseRevenue * revenueMultiplier);
        
        // Calculate heat reduction from White Paper Fan at Police Station
        if (building.type === 'Police Station' && officer.rank === 'White Paper Fan') {
          totalHeat += building.heatGen * 2; // Double heat reduction
        } else {
          totalHeat += building.heatGen;
        }
        
        // Generate Intel based on Street Smart trait
        if (officer.traits.includes('Street Smart')) {
          totalIntel += 5; // 5 Intel per day for Street Smart officers
        }
        
        // Increase days assigned
        const newDaysAssigned = officer.daysAssigned + 1;
        const newEnergy = Math.max(0, officer.energy - 10);
        
        return { ...officer, energy: newEnergy, daysAssigned: newDaysAssigned };
      }
    }
    return officer;
  });
  
  // Auto-unassign officers with 0 energy
  const finalOfficers = updatedOfficers.map(o => {
    if (o.energy === 0 && o.assignedBuildingId) {
      return { ...o, assignedBuildingId: null, daysAssigned: 0 };
    }
    return o;
  });
  
  const updatedBuildings = state.buildings.map(b => {
    const officer = finalOfficers.find(o => o.assignedBuildingId === b.id);
    if (!officer && b.isOccupied) {
      return { ...b, isOccupied: false, assignedOfficerId: null };
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
      intel: state.intel + totalIntel, // Add generated intel
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
    .filter(b => b.isOccupied)
    .reduce((sum, b) => sum + b.foodProvided, 0);
  
  const totalEntertainment = state.buildings
    .filter(b => b.isOccupied)
    .reduce((sum, b) => sum + b.entertainmentProvided, 0);
  
  // Pay stipends
  const stipendCost = state.soldiers.length * state.stipend;
  const canPayFull = state.cash >= stipendCost;
  const actualPay = canPayFull ? state.stipend : Math.floor(state.cash / state.soldiers.length);
  
  // Update soldier needs
  const updatedSoldiers = state.soldiers.map(soldier => {
    // Needs decay
    const foodSatisfaction = Math.min(100, soldier.needs.food - 20 + (totalFood / state.soldiers.length));
    const entSatisfaction = Math.min(100, soldier.needs.entertainment - 15 + (totalEntertainment / state.soldiers.length));
    const paySatisfaction = Math.min(100, (actualPay / 50) * 50); // 50 is baseline
    
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
  
  // Check for betrayal from jealous officers
  state.officers.forEach(officer => {
    if (officer.loyalty < 40 && officer.daysAssigned === 0) {
      // Officer not assigned might be jealous
      const avgRespect = officer.relationships.reduce((sum, r) => sum + r.respect, 0) / officer.relationships.length;
      if (avgRespect < 30 && Math.random() < 0.2) {
        events.push({
          type: 'betrayal',
          data: { officerId: officer.id, officerName: officer.name }
        });
      }
    }
  });
  
  // Rival attack chance
  state.rivals.forEach(rival => {
    if (rival.relationship < -30 && !rival.hasAlliance && Math.random() < 0.15) {
      events.push({
        type: 'rivalAttack',
        data: { rivalId: rival.id, rivalName: rival.name }
      });
    }
  });
  
  // Update officer relationships based on daily assignments
  const updatedOfficers = state.officers.map(officer => {
    const newRelationships = officer.relationships.map(rel => {
      const target = state.officers.find(o => o.id === rel.targetId);
      if (target) {
        // If both assigned, slight respect increase
        if (officer.assignedBuildingId && target.assignedBuildingId) {
          return { ...rel, respect: Math.min(100, rel.respect + 1) };
        }
        
        // If you're assigned and they're not, they lose respect
        if (officer.assignedBuildingId && !target.assignedBuildingId) {
          return { ...rel, respect: Math.max(-100, rel.respect - 2) };
        }
      }
      return rel;
    });
    
    return { ...officer, relationships: newRelationships };
  });
  
  return {
    updates: {
      officers: updatedOfficers,
      reputation: Math.min(100, state.reputation + 1), // Slight daily rep gain
    },
    events,
  };
}

const SOLDIER_NAMES_EXPORT = SOLDIER_NAMES;
export { SOLDIER_NAMES_EXPORT as SOLDIER_NAMES };