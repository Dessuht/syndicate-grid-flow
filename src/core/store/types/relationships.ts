import { BaseEntity, EntityId } from './base';

export interface SharedMemory {
  id: EntityId;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  date: number;
  participants: EntityId[];
}

export interface Grudge {
  id: EntityId;
  reason: string;
  severity: number; // 1-10
  startDate: number;
  targetId: EntityId;
  sourceId: EntityId;
}

export interface OfficerRelationship extends BaseEntity {
  sourceOfficerId: EntityId;
  targetOfficerId: EntityId;
  type: 'loyal' | 'neutral' | 'rival' | 'friendly' | 'hostile';
  strength: number; // 0-100
  
  // Legacy compatibility
  relationship: number;
  interest: number;
  respect: number;
  isFriend: boolean;
  isEnemy: boolean;
  isMortalEnemy: boolean;
  isLover: boolean;
  isInLove: boolean;
  
  // Extended features
  sharedMemories: SharedMemory[];
  grudges: Grudge[];
}

export interface SocialInteraction extends BaseEntity {
  type: 'DEEP_CONVERSATION' | 'JOKE_TELLING' | 'FLIRTATION' | 'ARGUMENT' | 'INTRIGUE' | 'FLATTERY_GIFT' | 'DATE' | 'GIFT_EXCHANGE';
  initiatorId: EntityId;
  targetId: EntityId;
  location: string;
  outcome: {
    success: boolean;
    relationshipChange: number;
    interestChange: number;
    respectChange: number;
    memory?: SharedMemory;
    grudge?: Grudge;
  };
}

export interface SocialFeedEntry extends BaseEntity {
  type: 'interaction' | 'relationship_change' | 'romantic_event' | 'conflict';
  description: string;
  participants: EntityId[];
  impact: 'positive' | 'negative' | 'neutral';
}