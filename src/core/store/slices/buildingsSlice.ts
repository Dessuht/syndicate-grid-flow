import { create } from 'zustand';
import { Building, BuildingType } from '../types';
import { GameState } from '../types/base';

interface BuildingsState {
  buildings: Building[];
  selectedBuildingId: string | null;
}

interface BuildingsActions {
  // Building management
  acquireBuilding: (buildingType: BuildingType) => void;
  upgradeBuilding: (buildingId: string) => void;
  
  // Assignment
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  
  // Selection
  selectBuilding: (buildingId: string | null) => void;
}

export type BuildingsSlice = BuildingsState & BuildingsActions;

export const createBuildingsSlice = (set: any, get: any) => ({
  buildings: [],
  selectedBuildingId: null,
  
  acquireBuilding: (buildingType: BuildingType) => {
    set((state: any) => {
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
      if (!cost || (state as any).cash < cost) return state;

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
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      return {
              cash: (state as any).cash - cost,
              buildings: [...((state as any).buildings || []), newBuilding]
            };
    });
  },

  upgradeBuilding: (buildingId: string) => {
    set((state: any) => {
          const building = (state as any).buildings?.find((b: any) => b.id === buildingId);
          if (!building || building.isUpgraded || building.isRebelBase) return state;
          
          const upgradeCost = building.baseRevenue * 2;
          if ((state as any).cash < upgradeCost) return state;
          
          return {
            cash: (state as any).cash - upgradeCost,
            buildings: (state as any).buildings?.map((b: any) =>
              b.id === buildingId ? { ...b, isUpgraded: true } : b
            ),
          };
        });
  },

  selectBuilding: (buildingId: string | null) => {
    set({ selectedBuildingId: buildingId });
  },
});