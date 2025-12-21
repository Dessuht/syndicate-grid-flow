import { create } from 'zustand';
import { 
  GameResources, 
  StrategicObjective, 
  Operation, 
  Officer, 
  StrategicDecision, 
  GameEvent, 
  GamePhase 
} from './types';

// Import system modules
import { OperationSystem, OperationResult } from './operations';
import { ObjectiveSystem } from './objectives';
import { OfficerSystem } from './officers';
import { DecisionSystem } from './decisions';
import { EventSystem } from './events';

export interface GameState {
  // Core resources
  resources: GameResources;
  
  // Time management
  currentWeek: number;
  currentDay: number;
  phase: GamePhase;
  
  // Strategic objectives
  objectives: StrategicObjective[];
  
  // Operations
  availableOperations: Operation[];
  activeOperations: Operation[];
  completedOperations: Operation[];
  
  // Officers
  officers: Officer[];
  
  // Decisions and events
  currentDecision: StrategicDecision | null;
  currentEvent: GameEvent | null;
  
  // Game state
  gameOver: boolean;
  victory: boolean;
  
  // Actions
  advanceTime: () => void;
  launchOperation: (operationId: string, assignedOfficers: string[]) => void;
  makeDecision: (decisionId: string, optionId: string) => void;
  makeEventChoice: (eventId: string, choiceId: string) => void;
  recruitOfficer: () => void;
  promoteOfficer: (officerId: string) => void;
  assignOfficer: (officerId: string, operationId: string) => void;
  unassignOfficer: (officerId: string) => void;
  bribeOfficials: (amount: number) => void;
  expandTerritory: () => void;
  
  // Getters
  canLaunchOperation: (operationId: string) => boolean;
  getOperationResult: (operationId: string) => OperationResult | null;
  getAvailableOfficers: () => Officer[];
  getObjectiveProgress: () => { completed: number; total: number; upcomingDeadlines: StrategicObjective[] };
  getGameOverReason: () => string | null;
  getVictoryCondition: () => string | null;
}

const INITIAL_RESOURCES: GameResources = {
  cash: 10000,
  influence: 25,
  heat: 20,
  territory: 15,
  manpower: 6
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  resources: INITIAL_RESOURCES,
  currentWeek: 1,
  currentDay: 1,
  phase: 'planning',
  objectives: ObjectiveSystem.initializeObjectives(),
  availableOperations: OperationSystem.getAvailableOperations(INITIAL_RESOURCES),
  activeOperations: [],
  completedOperations: [],
  officers: Array.from({ length: 4 }, () => OfficerSystem.generateOfficer()),
  currentDecision: null,
  currentEvent: null,
  gameOver: false,
  victory: false,

  // Core game loop
  advanceTime: () => {
    set((state) => {
      if (state.gameOver || state.victory) return state;

      let newDay = state.currentDay + 1;
      let newWeek = state.currentWeek;
      let newPhase = state.phase;

      // Update week and phase
      if (newDay > 7) {
        newDay = 1;
        newWeek += 1;
        newPhase = 'planning';
      } else if (newDay === 4 && state.phase === 'planning') {
        newPhase = 'execution';
      } else if (newDay === 7 && state.phase === 'execution') {
        newPhase = 'resolution';
      }

      // Process active operations
      const completedOps = state.activeOperations.filter(op => {
        // Simple completion logic - operations complete after their duration
        return Math.random() < 0.3; // 30% chance per day to complete
      });

      const remainingOps = state.activeOperations.filter(op => !completedOps.includes(op));

      // Apply operation results
      let resourceChanges: Partial<GameResources> = {};
      completedOps.forEach(op => {
        const result = OperationSystem.executeOperation(op, []);
        resourceChanges.cash = (resourceChanges.cash || 0) + result.cash;
        resourceChanges.influence = (resourceChanges.influence || 0) + result.influence;
        resourceChanges.territory = (resourceChanges.territory || 0) + result.territory;
        resourceChanges.heat = (resourceChanges.heat || 0) + result.heatIncrease - result.heatReduction;
        resourceChanges.manpower = (resourceChanges.manpower || 0) - result.manpowerLoss;
      });

      // Update resources
      const newResources = {
        cash: Math.max(0, state.resources.cash + (resourceChanges.cash || 0)),
        influence: Math.max(0, Math.min(100, state.resources.influence + (resourceChanges.influence || 0))),
        heat: Math.max(0, Math.min(100, state.resources.heat + (resourceChanges.heat || 0))),
        territory: Math.max(0, Math.min(100, state.resources.territory + (resourceChanges.territory || 0))),
        manpower: Math.max(0, state.resources.manpower + (resourceChanges.manpower || 0))
      };

      // Update objectives
      const updatedObjectives = ObjectiveSystem.updateObjectiveProgress(state.objectives, newResources);

      // Generate new operations based on new resources
      const newAvailableOperations = OperationSystem.getAvailableOperations(newResources);

      // Generate random events
      const newEvent = EventSystem.generateRandomEvent(newResources.heat, newResources.influence);

      // Generate strategic decisions
      const newDecision = newWeek > state.currentWeek ? 
        DecisionSystem.generateStrategicDecision(newWeek, newResources) : 
        state.currentDecision;

      // Check win/lose conditions
      const isGameOver = newResources.manpower <= 0 || newResources.cash < -5000 || newResources.heat >= 100;
      const isVictory = updatedObjectives.filter(obj => obj.isCompleted).length >= 3;

      return {
        currentDay: newDay,
        currentWeek: newWeek,
        phase: newPhase,
        resources: newResources,
        activeOperations: remainingOps,
        completedOperations: [...state.completedOperations, ...completedOps],
        objectives: updatedObjectives,
        availableOperations: newAvailableOperations,
        currentEvent: newEvent,
        currentDecision: newDecision,
        gameOver: isGameOver,
        victory: isVictory
      };
    });
  },

  // Operation management
  launchOperation: (operationId, assignedOfficers) => {
    set((state) => {
      const operation = state.availableOperations.find(op => op.id === operationId);
      if (!operation) return state;

      if (!OperationSystem.canLaunchOperation(operation, state.resources)) {
        console.warn('Cannot launch operation: requirements not met');
        return state;
      }

      // Remove from available and add to active
      const updatedAvailable = state.availableOperations.filter(op => op.id !== operationId);
      const updatedActive = [...state.activeOperations, { ...operation, status: 'in_progress' as const, assignedAssets: assignedOfficers }];

      return {
        availableOperations: updatedAvailable,
        activeOperations: updatedActive
      };
    });
  },

  // Decision management
  makeDecision: (decisionId, optionId) => {
    set((state) => {
      if (!state.currentDecision || state.currentDecision.id !== decisionId) return state;

      const option = state.currentDecision.options.find(opt => opt.id === optionId);
      if (!option) return state;

      if (!DecisionSystem.canMakeDecision(option, state.resources)) {
        console.warn('Cannot make decision: requirements not met');
        return state;
      }

      const outcome = DecisionSystem.executeDecision(option);
      
      // Apply decision effects
      const newResources = {
        cash: Math.max(0, state.resources.cash + (outcome.rewards.cash || 0)),
        influence: Math.max(0, Math.min(100, state.resources.influence + (outcome.rewards.influence || 0))),
        heat: Math.max(0, Math.min(100, state.resources.heat + (outcome.rewards.heat || 0))),
        territory: Math.max(0, Math.min(100, state.resources.territory + (outcome.rewards.territory || 0))),
        manpower: Math.max(0, state.resources.manpower + (outcome.rewards.manpower || 0))
      };

      return {
        resources: newResources,
        currentDecision: null
      };
    });
  },

  // Event management
  makeEventChoice: (eventId, choiceId) => {
    set((state) => {
      if (!state.currentEvent || state.currentEvent.id !== eventId) return state;

      const choice = state.currentEvent.choices.find(c => c.id === choiceId);
      if (!choice) return state;

      if (!EventSystem.canMakeChoice(choice, state.resources)) {
        console.warn('Cannot make event choice: requirements not met');
        return state;
      }

      const outcome = EventSystem.executeEventChoice(choice);
      
      // Apply event effects
      const newResources = {
        cash: Math.max(0, state.resources.cash + (outcome.effects.cash || 0)),
        influence: Math.max(0, Math.min(100, state.resources.influence + (outcome.effects.influence || 0))),
        heat: Math.max(0, Math.min(100, state.resources.heat + (outcome.effects.heat || 0))),
        territory: Math.max(0, Math.min(100, state.resources.territory + (outcome.effects.territory || 0))),
        manpower: Math.max(0, state.resources.manpower + (outcome.effects.manpower || 0))
      };

      return {
        resources: newResources,
        currentEvent: null
      };
    });
  },

  // Officer management
  recruitOfficer: () => {
    set((state) => {
      const recruitmentCost = 2000;
      if (state.resources.cash < recruitmentCost) return state;

      const newOfficer = OfficerSystem.generateOfficer();
      
      return {
        resources: { ...state.resources, cash: state.resources.cash - recruitmentCost },
        officers: [...state.officers, newOfficer],
        manpower: state.resources.manpower + 1
      };
    });
  },

  promoteOfficer: (officerId) => {
    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return state;

      if (!OfficerSystem.canPromoteOfficer(officer, state.resources)) {
        console.warn('Cannot promote officer: requirements not met');
        return state;
      }

      const currentRankIndex = OfficerSystem['RANK_HIERARCHY'].indexOf(officer.rank);
      const promotionCost = (currentRankIndex + 1) * 5000;
      const promotedOfficer = OfficerSystem.promoteOfficer(officer);

      const updatedOfficers = state.officers.map(o => o.id === officerId ? promotedOfficer : o);

      return {
        resources: { ...state.resources, cash: state.resources.cash - promotionCost },
        officers: updatedOfficers
      };
    });
  },

  assignOfficer: (officerId, operationId) => {
    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      const operation = state.activeOperations.find(op => op.id === operationId);
      
      if (!officer || !operation || !officer.isAvailable) return state;

      const updatedOfficers = state.officers.map(o => 
        o.id === officerId ? { ...o, isAvailable: false, currentAssignment: operationId } : o
      );

      const updatedOperations = state.activeOperations.map(op =>
        op.id === operationId ? { ...op, assignedAssets: [...op.assignedAssets, officerId] } : op
      );

      return {
        officers: updatedOfficers,
        activeOperations: updatedOperations
      };
    });
  },

  unassignOfficer: (officerId) => {
    set((state) => {
      const officer = state.officers.find(o => o.id === officerId);
      if (!officer) return state;

      const updatedOfficers = state.officers.map(o => 
        o.id === officerId ? { ...o, isAvailable: true, currentAssignment: null } : o
      );

      const updatedOperations = state.activeOperations.map(op => ({
        ...op,
        assignedAssets: op.assignedAssets.filter(id => id !== officerId)
      }));

      return {
        officers: updatedOfficers,
        activeOperations: updatedOperations
      };
    });
  },

  // Utility actions
  bribeOfficials: (amount) => {
    set((state) => {
      if (state.resources.cash < amount) return state;
      
      const heatReduction = Math.floor(amount / 200);
      
      return {
        resources: {
          ...state.resources,
          cash: state.resources.cash - amount,
          heat: Math.max(0, state.resources.heat - heatReduction)
        }
      };
    });
  },

  expandTerritory: () => {
    set((state) => {
      const expansionCost = 5000;
      const requiredInfluence = 40;
      
      if (state.resources.cash < expansionCost || state.resources.influence < requiredInfluence) {
        return state;
      }

      return {
        resources: {
          ...state.resources,
          cash: state.resources.cash - expansionCost,
          territory: Math.min(100, state.resources.territory + 5),
          heat: Math.min(100, state.resources.heat + 10)
        }
      };
    });
  },

  // Getters
  canLaunchOperation: (operationId) => {
    const state = get();
    const operation = state.availableOperations.find(op => op.id === operationId);
    return operation ? OperationSystem.canLaunchOperation(operation, state.resources) : false;
  },

  getOperationResult: (operationId) => {
    const state = get();
    const operation = state.activeOperations.find(op => op.id === operationId);
    if (!operation) return null;

    const assignedOfficers = state.officers.filter(o => operation.assignedAssets.includes(o.id));
    return OperationSystem.executeOperation(operation, assignedOfficers);
  },

  getAvailableOfficers: () => {
    const state = get();
    return state.officers.filter(o => o.isAvailable);
  },

  getObjectiveProgress: () => {
    const state = get();
    const completed = state.objectives.filter(obj => obj.isCompleted).length;
    const upcomingDeadlines = ObjectiveSystem.getUpcomingDeadlines(state.objectives, state.currentWeek);
    
    return { completed, total: state.objectives.length, upcomingDeadlines };
  },

  getGameOverReason: () => {
    const state = get();
    if (!state.gameOver) return null;
    
    if (state.resources.manpower <= 0) return 'Your organization has been destroyed - no manpower remaining';
    if (state.resources.cash < -5000) return 'Bankruptcy - your organization has collapsed under debt';
    if (state.resources.heat >= 100) return 'Police crackdown - your organization has been dismantled';
    
    return 'Your organization has fallen';
  },

  getVictoryCondition: () => {
    const state = get();
    if (!state.victory) return null;
    
    const completedObjectives = state.objectives.filter(obj => obj.isCompleted);
    if (completedObjectives.length >= 3) {
      return 'Victory! You have established a powerful criminal empire';
    }
    
    return 'Victory achieved';
  }
}));