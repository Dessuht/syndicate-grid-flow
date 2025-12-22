import { BaseEntity, EntityId } from './base';

export interface CouncilMotion extends BaseEntity {
  title: string;
  description: string;
  type: 'expansion' | 'internal';
  proposerId?: EntityId;
  isVetoed: boolean;
  isPassed: boolean;
  votes: Record<EntityId, 'yes' | 'no' | 'abstain'>;
  effects: Record<string, any>;
}

export interface CouncilSession extends BaseEntity {
  day: number;
  motions: EntityId[];
  isActive: boolean;
  outcomes: Record<EntityId, 'passed' | 'failed' | 'vetoed'>;
}