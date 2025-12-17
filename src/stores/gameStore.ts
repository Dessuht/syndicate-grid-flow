import { create } from 'zustand';

export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern';

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
}

export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  baseRevenue: number;
  heatGen: number;
  isOccupied: boolean;
  assignedOfficerId: string | null;
  inactiveUntilDay: number | null;
}

export interface GameState {
  // Resources
  cash: number;
  reputation: number;
  policeHeat: number;
  currentDay: number;

  // Entities
  officers: Officer[];
  buildings: Building[];

  // Event system
  activeEvent: 'policeRaid' | null;
  eventTriggered: boolean;

  // Actions
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  processDay: () => void;
  reduceHeat: (amount: number) => void;
  hostNightclub: () => void;
  handleRaidChoice: (choice: 'bribe' | 'stand' | 'escape') => void;
  buyIntel: (district: string) => void;
  dismissEvent: () => void;
}

const INITIAL_OFFICERS: Officer[] = [
  { id: 'off-1', name: 'Big Chan', rank: 'Red Pole', energy: 100, maxEnergy: 100, assignedBuildingId: null },
  { id: 'off-2', name: 'Lily Wong', rank: 'White Paper Fan', energy: 80, maxEnergy: 80, assignedBuildingId: null },
  { id: 'off-3', name: 'Snake Eye', rank: 'Straw Sandal', energy: 90, maxEnergy: 90, assignedBuildingId: null },
  { id: 'off-4', name: 'Tommy Fist', rank: 'Blue Lantern', energy: 70, maxEnergy: 70, assignedBuildingId: null },
];

const INITIAL_BUILDINGS: Building[] = [
  { id: 'bld-1', name: 'Golden Dragon Noodles', type: 'Noodle Shop', baseRevenue: 500, heatGen: 2, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
  { id: 'bld-2', name: 'Lucky Fortune Parlor', type: 'Mahjong Parlor', baseRevenue: 800, heatGen: 5, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
  { id: 'bld-3', name: 'Harbor Warehouse #7', type: 'Warehouse', baseRevenue: 1200, heatGen: 8, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
  { id: 'bld-4', name: 'Neon Paradise Club', type: 'Nightclub', baseRevenue: 300, heatGen: 3, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
  { id: 'bld-5', name: 'Jade Tiger Kitchen', type: 'Noodle Shop', baseRevenue: 450, heatGen: 2, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
  { id: 'bld-6', name: 'Phoenix Rising Tables', type: 'Mahjong Parlor', baseRevenue: 750, heatGen: 4, isOccupied: false, assignedOfficerId: null, inactiveUntilDay: null },
];

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  cash: 5000,
  reputation: 50,
  policeHeat: 15,
  currentDay: 1,
  officers: INITIAL_OFFICERS,
  buildings: INITIAL_BUILDINGS,
  activeEvent: null,
  eventTriggered: false,

  assignOfficer: (officerId: string, buildingId: string) => {
    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      const building = state.buildings.find(b => b.id === buildingId);

      if (!officer || !building || building.isOccupied || officer.assignedBuildingId) {
        return state;
      }

      // Check if building is inactive
      if (building.inactiveUntilDay && building.inactiveUntilDay > state.currentDay) {
        return state;
      }

      return {
        officers: state.officers.map(o =>
          o.id === officerId ? { ...o, assignedBuildingId: buildingId } : o
        ),
        buildings: state.buildings.map(b =>
          b.id === buildingId ? { ...b, isOccupied: true, assignedOfficerId: officerId } : b
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
          o.id === officerId ? { ...o, assignedBuildingId: null } : o
        ),
        buildings: state.buildings.map(b =>
          b.id === buildingId ? { ...b, isOccupied: false, assignedOfficerId: null } : b
        ),
      };
    });
  },

  processDay: () => {
    set((state) => {
      let totalRevenue = 0;
      let totalHeat = 0;

      // Calculate revenue and heat from occupied buildings
      const updatedOfficers = state.officers.map(officer => {
        if (officer.assignedBuildingId) {
          const building = state.buildings.find(b => b.id === officer.assignedBuildingId);
          if (building && (!building.inactiveUntilDay || building.inactiveUntilDay <= state.currentDay)) {
            totalRevenue += building.baseRevenue;
            totalHeat += building.heatGen;
          }
          // Drain energy
          const newEnergy = Math.max(0, officer.energy - 10);
          return { ...officer, energy: newEnergy };
        }
        return officer;
      });

      // Auto-unassign officers with 0 energy
      const finalOfficers = updatedOfficers.map(o => {
        if (o.energy === 0 && o.assignedBuildingId) {
          return { ...o, assignedBuildingId: null };
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

      // Reputation bonus from high cash
      const repBonus = totalRevenue > 2000 ? 2 : 0;

      // Calculate new heat (cap at 100)
      const newHeat = Math.min(100, state.policeHeat + totalHeat);

      // Check for police raid (20% chance when heat > 70)
      let triggerRaid = false;
      if (newHeat > 70 && !state.eventTriggered) {
        triggerRaid = Math.random() < 0.2;
      }

      return {
        cash: state.cash + totalRevenue,
        reputation: Math.min(100, state.reputation + repBonus),
        policeHeat: newHeat,
        currentDay: state.currentDay + 1,
        officers: finalOfficers,
        buildings: updatedBuildings,
        activeEvent: triggerRaid ? 'policeRaid' : state.activeEvent,
        eventTriggered: triggerRaid || state.eventTriggered,
      };
    });
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
        })),
        eventTriggered: false, // Reset event trigger after nightclub
      };
    });
  },

  handleRaidChoice: (choice: 'bribe' | 'stand' | 'escape') => {
    set((state) => {
      switch (choice) {
        case 'bribe':
          if (state.cash < 2000) return { ...state, activeEvent: null };
          return {
            ...state,
            cash: state.cash - 2000,
            policeHeat: Math.max(0, state.policeHeat - 30),
            activeEvent: null,
            eventTriggered: false,
          };
        case 'stand':
          return {
            ...state,
            reputation: Math.max(0, state.reputation - 15),
            officers: state.officers.map(o => ({
              ...o,
              energy: Math.max(0, o.energy - 20),
            })),
            activeEvent: null,
            eventTriggered: false,
          };
        case 'escape':
          // Pick a random occupied building to go inactive
          const occupiedBuildings = state.buildings.filter(b => b.isOccupied);
          if (occupiedBuildings.length > 0) {
            const targetBuilding = occupiedBuildings[Math.floor(Math.random() * occupiedBuildings.length)];
            return {
              ...state,
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
              activeEvent: null,
              eventTriggered: false,
            };
          }
          return { ...state, activeEvent: null, eventTriggered: false };
        default:
          return state;
      }
    });
  },

  buyIntel: (district: string) => {
    set((state) => {
      const cost = 3000;
      if (state.cash < cost) return state;
      // For now, just deduct cash - could unlock new building types later
      return {
        cash: state.cash - cost,
        reputation: Math.min(100, state.reputation + 5),
      };
    });
  },

  dismissEvent: () => {
    set({ activeEvent: null });
  },
}));
