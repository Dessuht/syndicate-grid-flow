import { create } from 'zustand';
import { Resource, DayPhase } from '../types';
import { GameState } from '../types/base';

interface ResourcesState {
  resources: Resource;
  currentDay: number;
  currentPhase: DayPhase;
  stipend: number;
}

interface ResourcesActions {
  // Resource management
  setCash: (amount: number) => void;
  adjustCash: (amount: number) => void;
  setReputation: (amount: number) => void;
  setPoliceHeat: (amount: number) => void;
  setIntel: (amount: number) => void;
  setInfluence: (amount: number) => void;
  
  // Time management
  advancePhase: () => void;
  setPhase: (phase: DayPhase) => void;
  setStipend: (amount: number) => void;
  
  // Utility
  reduceHeat: (amount: number) => void;
}

export type ResourcesSlice = ResourcesState & ResourcesActions;

export const createResourcesSlice = (set: any, get: any) => ({
  resources: {
    cash: 5000,
    reputation: 50,
    policeHeat: 15,
    intel: 0,
    influence: 10,
  },
  currentDay: 1,
  currentPhase: 'morning' as DayPhase,
  stipend: 50,
  
  setCash: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, cash: Math.max(0, amount) }
    }));
  },
  
  adjustCash: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, cash: Math.max(0, state.resources.cash + amount) }
    }));
  },
  
  setReputation: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, reputation: Math.max(0, Math.min(100, amount)) }
    }));
  },
  
  setPoliceHeat: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, policeHeat: Math.max(0, Math.min(100, amount)) }
    }));
  },
  
  setIntel: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, intel: Math.max(0, amount) }
    }));
  },
  
  setInfluence: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, influence: Math.max(0, Math.min(100, amount)) }
    }));
  },
  
  advancePhase: () => {
    set((state: GameState) => {
      const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
      const currentIndex = phases.indexOf(state.currentPhase);
      const nextPhase = phases[(currentIndex + 1) % phases.length];
      const nextDay = nextPhase === 'morning' ? state.currentDay + 1 : state.currentDay;
      
      return {
        currentPhase: nextPhase,
        currentDay: nextDay,
      };
    });
  },
  
  setPhase: (phase: DayPhase) => {
    set({ currentPhase: phase });
  },
  
  setStipend: (amount: number) => {
    set({ stipend: Math.max(0, Math.min(200, amount)) });
  },
  
  reduceHeat: (amount: number) => {
    set((state: GameState) => ({
      resources: { ...state.resources, policeHeat: Math.max(0, state.resources.policeHeat - amount) }
    }));
  },
});