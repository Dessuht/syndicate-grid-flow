import { useGameStore as baseUseGameStore, useGameSelectors } from '../store';
import type { Officer, Building, StreetSoldier, RivalGang } from '../store/types';

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
    getSoldiers: (): StreetSoldier[] => store.soldiers,
    getRivals: (): RivalGang[] => store.rivals,
    getResources: () => store.resources,
    getCurrentPhase: () => store.currentPhase,
    getCurrentDay: () => store.currentDay,
  };
};