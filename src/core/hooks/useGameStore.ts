import { useGameStore as baseUseGameStore, useGameSelectors } from '../store';
import type { Officer, Building, Soldier, RivalGang } from '../store/types';

// Type alias for backward compatibility
type StreetSoldier = Soldier;

// Export typed hook
export const useGameStore = () => {
  const store = baseUseGameStore();
  const selectors = useGameSelectors();
  
  return {
    ...store,
    ...selectors,
    // Typed getters
    getOfficers: (): Officer[] => store.officers,
    getBuildings: (): Building[] => store.buildings,
    getSoldiers: (): StreetSoldier[] => (store as any).soldiers || [],
    getRivals: (): RivalGang[] => (store as any).rivals || [],
    getResources: () => store,
    getCurrentPhase: () => store.currentPhase,
    getCurrentDay: () => store.currentDay,
  };
};