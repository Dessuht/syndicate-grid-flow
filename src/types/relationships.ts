export interface OfficerRelationship {
  targetOfficerId: string;
  type: 'loyal' | 'neutral' | 'rival' | 'friendly' | 'hostile';
  strength: number; // 0-100
  sharedMemories: SharedMemory[];
  grudges: Grudge[];
}

export interface SharedMemory {
  id: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  date: number;
}

export interface Grudge {
  id: string;
  reason: string;
  severity: number; // 1-10
  startDate: number;
}