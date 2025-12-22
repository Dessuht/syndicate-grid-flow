import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameState } from './types/base';

// Import slice creators
import { createOfficersSlice, OfficersSlice } from './slices/officersSlice';
import { createBuildingsSlice, BuildingsSlice } from './slices/buildingsSlice';
import { createResourcesSlice, ResourcesSlice } from './slices/resourcesSlice';
import { createEventsSlice, EventsSlice } from './slices/eventsSlice';

// Import initial data
import { INITIAL_OFFICERS } from '../data/initialOfficers';
import { INITIAL_BUILDINGS } from '../data/initialBuildings';
import { INITIAL_SOLDIERS } from '../data/initialSoldiers';
import { INITIAL_RIVALS } from '../data/initialRivals';

export type AppStore = OfficersSlice & BuildingsSlice & ResourcesSlice & EventsSlice & {
  // Additional game state
  currentScene: 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';
  isPaused: boolean;
  
  // Additional actions
  setCurrentScene: (scene: 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL') => void;
  togglePause: () => void;
  resetGame: () => void;
};

export const useGameStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initialize slices
        ...createOfficersSlice(set, get),
        ...createBuildingsSlice(set, get),
        ...createResourcesSlice(set, get),
        ...createEventsSlice(set, get),
        
        // Initial data
        officers: INITIAL_OFFICERS,
        buildings: INITIAL_BUILDINGS,
        soldiers: INITIAL_SOLDIERS,
        rivals: INITIAL_RIVALS,
        
        // Additional state
        currentScene: 'DISTRICT',
        isPaused: false,
        
        // Additional actions
        setCurrentScene: (scene) => set({ currentScene: scene }),
        togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
        resetGame: () => {
          set({
            officers: INITIAL_OFFICERS,
            buildings: INITIAL_BUILDINGS,
            soldiers: INITIAL_SOLDIERS,
            rivals: INITIAL_RIVALS,
            currentScene: 'DISTRICT',
            isPaused: false,
            resources: {
              cash: 5000,
              reputation: 50,
              policeHeat: 15,
              intel: 0,
              influence: 10,
            },
            currentDay: 1,
            currentPhase: 'morning',
            stipend: 50,
            activeEvent: null,
            eventData: null,
            pendingEvents: [],
            eventHistory: [],
          });
        },
      }),
      {
        name: 'kowloon-syndicate-game',
        version: 1,
      }
    ),
    {
      name: 'Kowloon Syndicate Game',
    }
  )
);

// Selectors for common combinations
export const useGameSelectors = () => {
  const store = useGameStore();
  
  return {
    // Computed values
    totalStrength: store.soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0),
    canAffordUpgrade: (cost: number) => store.resources.cash >= cost,
    officerCount: store.officers.length,
    occupiedBuildings: store.buildings.filter(b => b.isOccupied),
    dailyRevenue: store.buildings
      .filter(b => b.isOccupied && !b.inactiveUntilDay)
      .reduce((sum, b) => sum + b.baseRevenue, 0),
    getOfficerById: (id: string) => store.officers.find(o => o.id === id),
    getBuildingById: (id: string) => store.buildings.find(b => b.id === id),
    selectedOfficer: store.officers.find(o => o.id === store.selectedOfficerId),
    selectedBuilding: store.buildings.find(b => b.id === store.selectedBuildingId),
  };
};