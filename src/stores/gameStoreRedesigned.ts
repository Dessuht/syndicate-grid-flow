import { create } from 'zustand';
import { Officer, Building, StreetSoldier, RivalGang } from '@/stores/gameStoreTypes';

// Core redesigned game mechanics
export interface RedesignedGameState {
  // Core Resources (simplified and more meaningful)
  cash: number;
  power: number; // Combined influence + reputation
  heat: number; // Police attention (0-100)
  territory: number; // Control over districts (0-100)
  
  // Time System
  currentWeek: number;
  currentDay: number;
  phase: 'planning' | 'operations' | 'aftermath';
  
  // Officers (simplified but more impactful)
  officers: Officer[];
  assignedOfficers: Record<string, string>; // buildingId -> officerId
  
  // Operations (active missions/activities)
  activeOperations: Operation[];
  completedOperations: Operation[];
  
  // Strategic Choices
  currentStrategy: 'expansion' | 'consolidation' | 'stealth' | 'brute_force';
  strategicGoals: StrategicGoal[];
  
  // Events (more meaningful and player-driven)
  currentEvent: GameEvent | null;
  eventChoices: EventChoice[];
  
  // Market/Economy
  marketConditions: MarketConditions;
  opportunityCosts: Record<string, number>;
  
  // Actions
  selectStrategy: (strategy: RedesignedGameState['currentStrategy']) => void;
  assignOfficer: (officerId: string, operationId: string) => void;
  launchOperation: (operationType: OperationType, targetId: string) => void;
  makeEventChoice: (choiceId: string) => void;
  advanceTime: () => void;
  bribeOfficial: (amount: number) => void;
  expandTerritory: (districtId: string) => void;
  recruitOfficer: () => void;
  upgradeOperation: (operationId: string) => void;
}

interface Operation {
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
  status: 'planning' | 'active' | 'completed' | 'failed';
  requirements: {
    minOfficerSkill: string;
    minPower: number;
    maxHeat: number;
  };
  outcomes: OperationOutcome[];
}

interface OperationOutcome {
  type: 'success' | 'partial' | 'failure' | 'catastrophe';
  probability: number; // 0-100
  rewards: {
    cash?: number;
    power?: number;
    territory?: number;
    heat?: number;
  };
  consequences: string[];
}

interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: string;
  deadline: number; // Week number
  completed: boolean;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  choices: EventChoice[];
  consequences: {
    ignore?: string;
    timeout?: string;
  };
}

interface EventChoice {
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

interface MarketConditions {
  policeActivity: 'low' | 'medium' | 'high';
  rivalStrength: 'weak' | 'moderate' | 'strong';
  publicOpinion: 'hostile' | 'neutral' | 'sympathetic';
  economy: 'recession' | 'stable' | 'boom';
}

type OperationType = 
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

// Operation templates
const OPERATION_TEMPLATES: Record<OperationType, Omit<Operation, 'id' | 'targetId' | 'assignedOfficerId' | 'progress' | 'status'>> = {
  extortion: {
    type: 'extortion',
    name: 'Protection Racket',
    description: 'Extract protection money from local businesses',
    risk: 30,
    reward: 50,
    duration: 2,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 20,
      maxHeat: 70
    },
    outcomes: [
      {
        type: 'success',
        probability: 60,
        rewards: { cash: 2000, power: 5, heat: 10 },
        consequences: ['Businesses pay up', 'Police take notice']
      },
      {
        type: 'failure',
        probability: 30,
        rewards: { heat: 20, power: -5 },
        consequences: ['Resistance from businesses', 'Officer wounded']
      },
      {
        type: 'catastrophe',
        probability: 10,
        rewards: { heat: 40, power: -10 },
        consequences: ['Undercover police operation', 'Officer arrested']
      }
    ]
  },
  smuggling: {
    type: 'smuggling',
    name: 'Contraband Smuggling',
    description: 'Move illegal goods through the docks',
    risk: 50,
    reward: 80,
    duration: 3,
    requirements: {
      minOfficerSkill: 'logistics',
      minPower: 30,
      maxHeat: 60
    },
    outcomes: [
      {
        type: 'success',
        probability: 45,
        rewards: { cash: 5000, power: 10, heat: 25 },
        consequences: ['Major profit', 'Customs alerted']
      },
      {
        type: 'partial',
        probability: 35,
        rewards: { cash: 2000, heat: 15 },
        consequences: ['Partial shipment seized', 'Customs on alert']
      },
      {
        type: 'failure',
        probability: 20,
        rewards: { heat: 35, power: -15 },
        consequences: ['Entire shipment seized', 'Customs investigation']
      }
    ]
  },
  gambling: {
    type: 'gambling',
    name: 'Underground Casino',
    description: 'Run illegal gambling operations',
    risk: 20,
    reward: 40,
    duration: 1,
    requirements: {
      minOfficerSkill: 'diplomacy',
      minPower: 15,
      maxHeat: 80
    },
    outcomes: [
      {
        type: 'success',
        probability: 70,
        rewards: { cash: 1500, power: 3, heat: 5 },
        consequences: ['Good night', 'Minor police interest']
      },
      {
        type: 'failure',
        probability: 25,
        rewards: { heat: 15 },
        consequences: ['Raid disrupted', 'Some losses']
      },
      {
        type: 'catastrophe',
        probability: 5,
        rewards: { heat: 30, power: -5 },
        consequences: ['Major raid', 'Equipment seized']
      }
    ]
  },
  protection: {
    type: 'protection',
    name: 'Protection Services',
    description: 'Offer protection to businesses and residents',
    risk: 15,
    reward: 30,
    duration: 2,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 10,
      maxHeat: 50
    },
    outcomes: [
      {
        type: 'success',
        probability: 80,
        rewards: { cash: 1000, power: 5, heat: 3 },
        consequences: ['Community grateful', 'Steady income']
      },
      {
        type: 'failure',
        probability: 20,
        rewards: { heat: 10 },
        consequences: ['Failed to protect', 'Reputation damaged']
      }
    ]
  },
  assassination: {
    type: 'assassination',
    name: 'Target Elimination',
    description: 'Eliminate a rival or threat',
    risk: 80,
    reward: 100,
    duration: 4,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 50,
      maxHeat: 40
    },
    outcomes: [
      {
        type: 'success',
        probability: 40,
        rewards: { power: 25, territory: 10, heat: 50 },
        consequences: ['Target eliminated', 'Major police investigation']
      },
      {
        type: 'failure',
        probability: 35,
        rewards: { heat: 30, power: -10 },
        consequences: ['Attempt failed', 'Target alerted']
      },
      {
        type: 'catastrophe',
        probability: 25,
        rewards: { heat: 60, power: -20 },
        consequences: ['Officer captured', 'Undercover operation exposed']
      }
    ]
  },
  intimidation: {
    type: 'intimidation',
    name: 'Muscle Flex',
    description: 'Show force to assert dominance',
    risk: 25,
    reward: 35,
    duration: 1,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 20,
      maxHeat: 60
    },
    outcomes: [
      {
        type: 'success',
        probability: 65,
        rewards: { power: 10, heat: 8 },
        consequences: ['Rivals back down', 'Community fears you']
      },
      {
        type: 'failure',
        probability: 30,
        rewards: { power: -5, heat: 15 },
        consequences: ['Resistance encountered', 'Police called']
      },
      {
        type: 'catastrophe',
        probability: 5,
        rewards: { power: -15, heat: 25 },
        consequences: ['Public backlash', 'Police crackdown']
      }
    ]
  },
  bribery: {
    type: 'bribery',
    name: 'Official Corruption',
    description: 'Bribe officials for favors and information',
    risk: 35,
    reward: 45,
    duration: 2,
    requirements: {
      minOfficerSkill: 'diplomacy',
      minPower: 25,
      maxHeat: 70
    },
    outcomes: [
      {
        type: 'success',
        probability: 55,
        rewards: { power: 15, heat: -10 },
        consequences: ['Official cooperative', 'Heat reduced']
      },
      {
        type: 'failure',
        probability: 30,
        rewards: { heat: 20 },
        consequences: ['Official refuses', 'Investigation started']
      },
      {
        type: 'catastrophe',
        probability: 15,
        rewards: { heat: 40, power: -10 },
        consequences: ['Sting operation', 'Official arrested']
      }
    ]
  },
  recruitment: {
    type: 'recruitment',
    name: 'Talent Acquisition',
    description: 'Recruit new officers and soldiers',
    risk: 10,
    reward: 25,
    duration: 3,
    requirements: {
      minOfficerSkill: 'recruitment',
      minPower: 15,
      maxHeat: 90
    },
    outcomes: [
      {
        type: 'success',
        probability: 75,
        rewards: { power: 8 },
        consequences: ['New recruits join', 'Organization grows']
      },
      {
        type: 'failure',
        probability: 25,
        rewards: { cash: -500 },
        consequences: ['Recruitment failed', 'Resources wasted']
      }
    ]
  },
  territory_expansion: {
    type: 'territory_expansion',
    name: 'Territory Takeover',
    description: 'Expand control into new areas',
    risk: 70,
    reward: 90,
    duration: 5,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 60,
      maxHeat: 50
    },
    outcomes: [
      {
        type: 'success',
        probability: 35,
        rewards: { territory: 20, power: 20, heat: 30 },
        consequences: ['New territory secured', 'Rivals weakened']
      },
      {
        type: 'partial',
        probability: 30,
        rewards: { territory: 10, heat: 25 },
        consequences: ['Partial control gained', 'Ongoing conflict']
      },
      {
        type: 'failure',
        probability: 25,
        rewards: { power: -15, heat: 20 },
        consequences: ['Expansion failed', 'Forces weakened']
      },
      {
        type: 'catastrophe',
        probability: 10,
        rewards: { power: -25, heat: 40 },
        consequences: ['Major defeat', 'Territory lost']
      }
    ]
  },
  rival_elimination: {
    type: 'rival_elimination',
    name: 'Gang War',
    description: 'All-out war to eliminate rival gang',
    risk: 90,
    reward: 120,
    duration: 7,
    requirements: {
      minOfficerSkill: 'enforcement',
      minPower: 80,
      maxHeat: 30
    },
    outcomes: [
      {
        type: 'success',
        probability: 25,
        rewards: { territory: 40, power: 40, cash: 10000, heat: 60 },
        consequences: ['Rival eliminated', 'Major power shift']
      },
      {
        type: 'partial',
        probability: 20,
        rewards: { territory: 15, power: 10, heat: 45 },
        consequences: ['Rival weakened', 'Stalemate reached']
      },
      {
        type: 'failure',
        probability: 35,
        rewards: { power: -30, heat: 35 },
        consequences: ['Forces decimated', 'Rival strengthened']
      },
      {
        type: 'catastrophe',
        probability: 20,
        rewards: { power: -50, heat: 50 },
        consequences: ['Organization shattered', 'Leadership killed']
      }
    ]
  }
};

// Strategic goal templates
const STRATEGIC_GOALS: Omit<StrategicGoal, 'id' | 'currentValue' | 'completed'>[] = [
  {
    name: 'Economic Dominance',
    description: 'Control 50% of the local economy',
    targetValue: 50,
    reward: 'Unlock high-level operations',
    deadline: 12
  },
  {
    name: 'Territory Control',
    description: 'Control 75% of Kowloon districts',
    targetValue: 75,
    reward: 'Become Dragonhead',
    deadline: 16
  },
  {
    name: 'Power Projection',
    description: 'Achieve 80 power rating',
    targetValue: 80,
    reward: 'Eliminate all rivals',
    deadline: 20
  },
  {
    name: 'Stealth Empire',
    description: 'Maintain operations with heat under 30',
    targetValue: 30,
    reward: 'Police protection deal',
    deadline: 24
  }
];

export const useRedesignedGameStore = create<RedesignedGameState>((set, get) => {
  // Initialize market conditions
  const initializeMarket = (): MarketConditions => ({
    policeActivity: 'medium',
    rivalStrength: 'moderate',
    publicOpinion: 'neutral',
    economy: 'stable'
  });

  // Initialize strategic goals
  const initializeGoals = (): StrategicGoal[] => {
    return STRATEGIC_GOALS.map((goal, index) => ({
      ...goal,
      id: `goal-${index}`,
      currentValue: 0,
      completed: false
    }));
  };

  return {
    // Initial state
    cash: 10000,
    power: 25,
    heat: 20,
    territory: 15,
    currentWeek: 1,
    currentDay: 1,
    phase: 'planning',
    currentStrategy: 'consolidation',
    officers: [],
    assignedOfficers: {},
    activeOperations: [],
    completedOperations: [],
    strategicGoals: initializeGoals(),
    currentEvent: null,
    eventChoices: [],
    marketConditions: initializeMarket(),
    opportunityCosts: {
      extortion: 500,
      smuggling: 2000,
      gambling: 300,
      protection: 200,
      assassination: 5000,
      intimidation: 100,
      bribery: 1000,
      recruitment: 800,
      territory_expansion: 3000,
      rival_elimination: 8000
    },

    // Actions
    selectStrategy: (strategy) => {
      set({ currentStrategy: strategy });
      
      // Generate strategy-appropriate event
      const event = generateStrategyEvent(strategy);
      if (event) {
        set({ currentEvent: event, eventChoices: event.choices });
      }
    },

    assignOfficer: (officerId, operationId) => {
      set((state) => {
        // Check if officer is already assigned
        const alreadyAssigned = Object.values(state.assignedOfficers).includes(officerId);
        if (alreadyAssigned) return state;

        return {
          assignedOfficers: {
            ...state.assignedOfficers,
            [operationId]: officerId
          }
        };
      });
    },

    launchOperation: (operationType, targetId) => {
      const template = OPERATION_TEMPLATES[operationType];
      if (!template) return;

      const operation: Operation = {
        ...template,
        id: `op-${Date.now()}`,
        targetId,
        assignedOfficerId: null,
        progress: 0,
        status: 'planning'
      };

      set((state) => ({
        activeOperations: [...state.activeOperations, operation],
        cash: state.cash - state.opportunityCosts[operationType]
      }));
    },

    makeEventChoice: (choiceId) => {
      const state = get();
      const choice = state.eventChoices.find(c => c.id === choiceId);
      if (!choice) return;

      // Apply choice costs
      let updates: Partial<RedesignedGameState> = {};
      if (choice.cost.cash) updates.cash = Math.max(0, state.cash - choice.cost.cash);
      if (choice.cost.power) updates.power = Math.max(0, state.power - choice.cost.power);
      if (choice.cost.heat) updates.heat = Math.min(100, state.heat + choice.cost.heat);

      // Determine outcome
      const success = Math.random() * 100 < choice.outcomes.probability;
      
      // Apply outcomes
      if (success) {
        // Success logic here
        updates.currentEvent = null;
        updates.eventChoices = [];
      } else {
        // Failure logic here
        updates.currentEvent = null;
        updates.eventChoices = [];
      }

      set(updates);
    },

    advanceTime: () => {
      set((state) => {
        let newDay = state.currentDay + 1;
        let newWeek = state.currentWeek;
        let newPhase = state.phase;

        // Progress operations
        const updatedOperations = state.activeOperations.map(op => ({
          ...op,
          progress: Math.min(100, op.progress + (100 / op.duration))
        }));

        // Complete finished operations
        const completedOps = updatedOperations.filter(op => op.progress >= 100);
        const activeOps = updatedOperations.filter(op => op.progress < 100);

        // Apply operation results
        let cashChange = 0;
        let powerChange = 0;
        let heatChange = 0;
        let territoryChange = 0;

        completedOps.forEach(op => {
          const outcome = determineOperationOutcome(op);
          if (outcome) {
            cashChange += outcome.rewards.cash || 0;
            powerChange += outcome.rewards.power || 0;
            heatChange += outcome.rewards.heat || 0;
            territoryChange += outcome.rewards.territory || 0;
          }
        });

        // Update phase
        if (newDay > 7) {
          newDay = 1;
          newWeek += 1;
          newPhase = 'planning';
        } else if (newDay === 4 && state.phase === 'planning') {
          newPhase = 'operations';
        } else if (newDay === 7 && state.phase === 'operations') {
          newPhase = 'aftermath';
        }

        // Update market conditions weekly
        const newMarket = newWeek > state.currentWeek ? updateMarketConditions() : state.marketConditions;

        return {
          currentDay: newDay,
          currentWeek: newWeek,
          phase: newPhase,
          activeOperations: activeOps,
          completedOperations: [...state.completedOperations, ...completedOps],
          cash: Math.max(0, state.cash + cashChange),
          power: Math.max(0, Math.min(100, state.power + powerChange)),
          heat: Math.max(0, Math.min(100, state.heat + heatChange)),
          territory: Math.max(0, Math.min(100, state.territory + territoryChange)),
          marketConditions: newMarket
        };
      });
    },

    bribeOfficial: (amount) => {
      set((state) => ({
        cash: Math.max(0, state.cash - amount),
        heat: Math.max(0, state.heat - Math.floor(amount / 100))
      }));
    },

    expandTerritory: (districtId) => {
      set((state) => ({
        territory: Math.min(100, state.territory + 10),
        power: Math.min(100, state.power + 5),
        heat: Math.min(100, state.heat + 15)
      }));
    },

    recruitOfficer: () => {
      // Generate new officer logic here
      set((state) => ({
        cash: Math.max(0, state.cash - 2000),
        power: Math.min(100, state.power + 3)
      }));
    },

    upgradeOperation: (operationId) => {
      set((state) => ({
        cash: Math.max(0, state.cash - 1000),
        activeOperations: state.activeOperations.map(op =>
          op.id === operationId
            ? { ...op, risk: Math.max(0, op.risk - 10), reward: op.reward + 10 }
            : op
        )
      }));
    }
  };
});

// Helper functions
function determineOperationOutcome(operation: Operation): OperationOutcome | null {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const outcome of operation.outcomes) {
    cumulative += outcome.probability;
    if (roll <= cumulative) {
      return outcome;
    }
  }
  
  return null;
}

function generateStrategyEvent(strategy: RedesignedGameState['currentStrategy']): GameEvent | null {
  const events: Record<RedesignedGameState['currentStrategy'], GameEvent> = {
    expansion: {
      id: 'expansion-opportunity',
      title: 'Territory Opportunity',
      description: 'A rival gang is weakened. This is our chance to expand.',
      urgency: 'high',
      choices: [
        {
          id: 'attack-now',
          description: 'Launch immediate attack',
          cost: { cash: 3000, heat: 20 },
          requirements: { minPower: 40 },
          outcomes: {
            success: 'Territory gained with minimal resistance',
            failure: 'Attack fails, forces weakened',
            probability: 65
          }
        },
        {
          id: 'prepare-attack',
          description: 'Prepare for 1 week, then attack',
          cost: { cash: 1000 },
          requirements: { minPower: 30 },
          outcomes: {
            success: 'Well-planned attack succeeds',
            failure: 'Rival recovers, opportunity lost',
            probability: 80
          }
        }
      ],
      consequences: {
        ignore: 'Rival recovers and strengthens position'
      }
    },
    consolidation: {
      id: 'consolidation-needed',
      title: 'Internal Affairs',
      description: 'Our rapid expansion has created internal tensions.',
      urgency: 'medium',
      choices: [
        {
          id: 'crack-down',
          description: 'Crack down on dissent',
          cost: { power: 10, heat: 15 },
          requirements: { minPower: 35 },
          outcomes: {
            success: 'Discipline restored, loyalty increases',
            failure: 'Officers rebel, organization weakened',
            probability: 70
          }
        },
        {
          id: 'negotiate',
          description: 'Negotiate with factions',
          cost: { cash: 2000 },
          requirements: {},
          outcomes: {
            success: 'Compromise reached, stability maintained',
            failure: 'Factions exploit weakness',
            probability: 60
          }
        }
      ],
      consequences: {
        ignore: 'Internal conflicts escalate'
      }
    },
    stealth: {
      id: 'stealth-operation',
      title: 'Undercover Opportunity',
      description: 'Police corruption creates an opportunity for stealth operations.',
      urgency: 'medium',
      choices: [
        {
          id: 'bribe-official',
          description: 'Bribe key officials',
          cost: { cash: 5000, heat: -10 },
          requirements: { maxHeat: 50 },
          outcomes: {
            success: 'Police protection secured, operations flourish',
            failure: 'Sting operation, officers arrested',
            probability: 55
          }
        },
        {
          id: 'lay-low',
          description: 'Maintain low profile',
          cost: {},
          requirements: {},
          outcomes: {
            success: 'Heat decreases naturally',
            failure: 'Missed opportunity, rivals gain ground',
            probability: 90
          }
        }
      ],
      consequences: {
        ignore: 'Opportunity wasted, heat increases'
      }
    },
    brute_force: {
      id: 'brute-force-option',
      title: 'Show of Force',
      description: 'Rivals are testing our dominance. We must respond decisively.',
      urgency: 'high',
      choices: [
        {
          id: 'overwhelming-force',
          description: 'Use overwhelming force',
          cost: { cash: 4000, heat: 30 },
          requirements: { minPower: 50 },
          outcomes: {
            success: 'Rivals crushed, reputation enhanced',
            failure: 'Heavy losses, police crackdown',
            probability: 60
          }
        },
        {
          id: 'targeted-strike',
          description: 'Targeted strike on leadership',
          cost: { cash: 2000, heat: 20 },
          requirements: { minPower: 40 },
          outcomes: {
            success: 'Leadership eliminated, chaos in rival ranks',
            failure: 'Strike fails, retaliation coming',
            probability: 45
          }
        }
      ],
      consequences: {
        ignore: 'Perception of weakness invites more challenges'
      }
    }
  };

  return events[strategy];
}

function updateMarketConditions(): MarketConditions {
  return {
    policeActivity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as MarketConditions['policeActivity'],
    rivalStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as MarketConditions['rivalStrength'],
    publicOpinion: ['hostile', 'neutral', 'sympathetic'][Math.floor(Math.random() * 3)] as MarketConditions['publicOpinion'],
    economy: ['recession', 'stable', 'boom'][Math.floor(Math.random() * 3)] as MarketConditions['economy']
  };
}