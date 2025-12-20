// Core game resources that matter
export interface GameResources {
  cash: number;           // Money for operations
  influence: number;      // Political/social power
  heat: number;          // Police attention (0-100)
  territory: number;     // Control percentage (0-100)
  manpower: number;      // Available soldiers/officers
}

// Strategic objectives that give purpose
export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  deadline: number; // Week number
  rewards: ObjectiveReward;
}

export interface ObjectiveReward {
  cash?: number;
  influence?: number;
  territory?: number;
  specialUnlock?: string;
}

// Meaningful operations with clear risk/reward
export interface Operation {
  id: string;
  name: string;
  description: string;
  type: OperationType;
  difficulty: number; // 1-10
  riskLevel: number; // 1-10
  requirements: OperationRequirements;
  potentialRewards: OperationRewards;
  potentialRisks: OperationRisks;
  duration: number; // In days
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  assignedAssets: string[]; // Officer/soldier IDs
}

export interface OperationRequirements {
  minInfluence: number;
  minManpower: number;
  maxHeat: number;
  requiredSkills?: string[];
}

export interface OperationRewards {
  cash: { min: number; max: number };
  influence: { min: number; max: number };
  territory: { min: number; max: number };
  heatReduction?: number;
}

export interface OperationRisks {
  cashLoss: { min: number; max: number };
  influenceLoss: { min: number; max: number };
  heatIncrease: { min: number; max: number };
  manpowerLoss: { min: number; max: number };
  assetLoss?: string[]; // What could be lost
}

export type OperationType = 
  | 'extortion'      // Low risk, low reward
  | 'smuggling'      // Medium risk, medium reward  
  | 'gambling'       // Low risk, steady income
  | 'protection'     // Low risk, builds influence
  | 'assassination'  // High risk, high reward
  | 'intimidation'   // Medium risk, builds territory
  | 'corruption'     // Medium risk, reduces heat
  | 'recruitment'    // Low risk, builds manpower
  | 'expansion'      // High risk, high territory gain
  | 'elimination';   // Highest risk, eliminates rivals

// Officer system that actually matters
export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  skills: OfficerSkills;
  loyalty: number; // 0-100
  competence: number; // 0-100
  isAvailable: boolean;
  currentAssignment: string | null;
  personalGoals: OfficerGoal[];
  traits: OfficerTrait[];
}

export type OfficerRank = 'enforcer' | 'lieutenant' | 'captain' | 'underboss' | 'boss';

export interface OfficerSkills {
  combat: number;      // Affects violent operations
  diplomacy: number;   // Affects social operations
  logistics: number;   // Affects business operations
  intelligence: number; // Affects information operations
}

export interface OfficerGoal {
  type: 'power' | 'wealth' | 'respect' | 'revenge';
  priority: number; // 1-10
  description: string;
}

export interface OfficerTrait {
  name: string;
  effect: TraitEffect;
}

export interface TraitEffect {
  operationBonus?: Partial<Record<OperationType, number>>;
  skillBonus?: Partial<OfficerSkills>;
  riskModifier?: number;
  loyaltyModifier?: number;
}

// Strategic decisions that matter
export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline: number; // Days until forced decision
  consequences: DecisionConsequences;
}

export interface DecisionOption {
  id: string;
  description: string;
  costs: ResourceCost;
  requirements: DecisionRequirements;
  outcomes: DecisionOutcome[];
}

export interface ResourceCost {
  cash?: number;
  influence?: number;
  heat?: number;
  manpower?: number;
}

export interface DecisionRequirements {
  minInfluence?: number;
  maxHeat?: number;
  specificOfficers?: string[];
  minManpower?: number;
}

export interface DecisionOutcome {
  probability: number; // 0-100
  result: string;
  rewards: ResourceCost;
  consequences: string[];
}

export interface DecisionConsequences {
  ignore?: string;
  timeout?: string;
}

// Game state phases
export type GamePhase = 'planning' | 'execution' | 'resolution';

// Market conditions that affect everything
export interface MarketConditions {
  policeActivity: 'low' | 'medium' | 'high';
  economy: 'poor' | 'stable' | 'booming';
  rivalStrength: 'weak' | 'moderate' | 'strong';
  publicOpinion: 'hostile' | 'neutral' | 'sympathetic';
}

// Events that require player choice
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  choices: EventChoice[];
  autoResolve?: number; // Days until auto-resolve
}

export type EventType = 
  | 'police_raid'
  | 'rival_challenge' 
  | 'internal_conflict'
  | 'opportunity'
  | 'crisis'
  | 'betrayal';

export interface EventChoice {
  id: string;
  description: string;
  requirements: ResourceCost;
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  probability: number;
  result: string;
  effects: ResourceCost;
  followUpEvents?: string[];
}