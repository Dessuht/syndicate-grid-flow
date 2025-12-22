import { BaseEntity, EntityId } from './base';

export interface RivalGang extends BaseEntity {
  name: string;
  district: string;
  strength: number;
  relationship: number;
  
  // Diplomatic status
  hasTradeAgreement: boolean;
  hasAlliance: boolean;
  isScouted: boolean;
  isActiveConflict: boolean;
  
  // Actions available
  availableActions: ('trade' | 'alliance' | 'war')[];
}

export interface DiplomaticAction extends BaseEntity {
  rivalId: EntityId;
  action: 'trade' | 'alliance' | 'turfWar';
  cost?: {
    cash?: number;
    intel?: number;
  };
  requirements?: {
    relationship?: number;
    intel?: number;
  };
  effects: {
    relationship?: number;
    alliance?: boolean;
    trade?: boolean;
    conflict?: boolean;
  };
}