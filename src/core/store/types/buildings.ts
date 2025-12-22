import { BaseEntity, EntityId } from './base';

export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';

export interface Building extends BaseEntity {
  name: string;
  type: BuildingType;
  
  // Economic properties
  baseRevenue: number;
  heatGen: number;
  isUpgraded: boolean;
  
  // Status
  isOccupied: boolean;
  assignedOfficerId: EntityId | null;
  inactiveUntilDay: number | null;
  isIllicit: boolean;
  
  // Properties
  foodProvided: number;
  entertainmentProvided: number;
  
  // Special states
  isRebelBase: boolean;
  rebelSoldierCount: number;
}

export interface BuildingUpgrade {
  id: EntityId;
  buildingType: BuildingType;
  name: string;
  cost: number;
  effects: {
    revenue?: number;
    heatGen?: number;
    foodProvided?: number;
    entertainmentProvided?: number;
  };
}