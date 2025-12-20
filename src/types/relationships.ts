export interface SharedMemory {
  type: 'deep_conversation' | 'joke' | 'date' | 'conflict' | 'gift' | 'betrayal' | 'celebration';
  description: string;
  emotionalWeight: number; // -100 to +100
  timestamp: number;
  participants: string[];
}

export interface Grudge {
  reason: string;
  severity: number; // 1-100
  timestamp: number;
  targetId: string;
}

export interface OfficerRelationship {
  relationship: number; // -100 to +100
  interest: number; // 0-100, romantic attraction
  respect: number; // 0-100, professional regard
  isFriend: boolean;
  isEnemy: boolean;
  isMortalEnemy: boolean;
  isLover: boolean;
  isInLove: boolean;
  sharedMemories: SharedMemory[];
  grudges: Grudge[];
}

export interface SocialInteraction {
  id: string;
  type: 'DEEP_CONVERSATION' | 'JOKE_TELLING' | 'FLIRTATION' | 'ARGUMENT' | 'INTRIGUE' | 'FLATTERY_GIFT' | 'DATE' | 'GIFT_EXCHANGE';
  participants: string[];
  initiatorId: string;
  targetId: string;
  timestamp: number;
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

export interface SocialFeedEntry {
  id: string;
  timestamp: number;
  type: 'interaction' | 'relationship_change' | 'romantic_event' | 'conflict';
  description: string;
  participants: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

export interface RelationshipNetwork {
  nodes: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationship: number;
    interest: number;
    type: 'friendship' | 'enmity' | 'romantic' | 'professional';
  }>;
}