import { BaseEntity, EntityId } from './base';

export type EventType = 
  | 'policeRaid' 
  | 'betrayal' 
  | 'rivalAttack' 
  | 'criminalCaught' 
  | 'soldierDesertion' 
  | 'territoryUltimatum' 
  | 'streetWar' 
  | 'postConflictSummary' 
  | 'coupAttempt' 
  | 'newEra' 
  | 'dailyBriefing' 
  | 'policeShakedown' 
  | 'streetBeef' 
  | 'nightclubSuccess';

export interface GameEvent extends BaseEntity {
  type: EventType;
  title: string;
  description: string;
  isBlocking: boolean;
  autoDismiss?: boolean;
  data: Record<string, any>;
}

export interface EventChoice extends BaseEntity {
  eventId: EntityId;
  text: string;
  description: string;
  cost?: {
    cash?: number;
    loyalty?: number;
    influence?: number;
    intel?: number;
  };
  requirements?: {
    cash?: number;
    loyalty?: number;
    influence?: number;
    intel?: number;
  };
  effects: {
    cash?: number;
    reputation?: number;
    policeHeat?: number;
    loyalty?: number;
    influence?: number;
    intel?: number;
    officerStatus?: 'wounded' | 'arrested' | 'executed' | 'imprisoned';
  };
}