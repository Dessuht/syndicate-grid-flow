export type OperationType = 
  | 'extortion' 
  | 'smuggling' 
  | 'gambling' 
  | 'protection' 
  | 'assassination' 
  | 'intimidation'
  | 'bribery'
  | 'recruitment'
  | 'territory_expansion'
  | 'rival_elimination';

export type GamePhase = 'planning' | 'operations' | 'aftermath';
export type StrategyType = 'expansion' | 'consolidation' | 'stealth' | 'brute_force';
export type EventUrgency = 'low' | 'medium' | 'high' | 'critical';
export type OperationStatus = 'planning' | 'active' | 'completed' | 'failed';
export type OutcomeType = 'success' | 'partial' | 'failure' | 'catastrophe';

export interface OperationOutcome {
  type: OutcomeType;
  probability: number; // 0-100
  rewards: {
    cash?: number;
    power?: number;
    territory?: number;
    heat?: number;
  };
  consequences: string[];
}

export interface Operation {
  id: string;
  type: OperationType;
  name: string;
  description: string;
  targetId: string;
  assignedOfficerId: string | null;
  risk: number; // 0-100
  reward: number; // Cash, power, territory
  duration: number; // In days
  progress: number; // 0-100
  status: OperationStatus;
  requirements: {
    minOfficerSkill: string;
    minPower: number;
    maxHeat: number;
  };
  outcomes: OperationOutcome[];
}

export interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: string;
  deadline: number; // Week number
  completed: boolean;
}

export interface EventChoice {
  id: string;
  description: string;
  cost: {
    cash?: number;
    power?: number;
    heat?: number;
  };
  requirements: {
    officerSkill?: string;
    minPower?: number;
    maxHeat?: number;
  };
  outcomes: {
    success: string;
    failure: string;
    probability: number;
  };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  urgency: EventUrgency;
  choices: EventChoice[];
  consequences: {
    ignore?: string;
    timeout?: string;
  };
}

export interface MarketConditions {
  policeActivity: 'low' | 'medium' | 'high';
  rivalStrength: 'weak' | 'moderate' | 'strong';
  publicOpinion: 'hostile' | 'neutral' | 'sympathetic';
  economy: 'recession' | 'stable' | 'boom';
}

export interface ResourceState {
  cash: number;
  power: number; // Combined influence + reputation
  heat: number; // Police attention (0-100)
  territory: number; // Control over districts (0-100)
}

export interface TimeState {
  currentWeek: number;
  currentDay: number;
  phase: GamePhase;
}

export interface OperationState {
  activeOperations: Operation[];
  completedOperations: Operation[];
  assignedOfficers: Record<string, string>; // buildingId -> officerId
}

export interface EventState {
  currentEvent: GameEvent | null;
  eventChoices: EventChoice[];
}

export interface StrategicState {
  currentStrategy: StrategyType;
  strategicGoals: StrategicGoal[];
}

export interface MarketState {
  marketConditions: MarketConditions;
  opportunityCosts: Record<OperationType, number>;
}