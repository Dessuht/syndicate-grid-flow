import { create } from 'zustand';
import { Officer } from '@/stores/gameStoreTypes';
import { 
  ResourceState, 
  TimeState, 
  OperationState, 
  EventState, 
  StrategicState, 
  MarketState,
  OperationType,
  GamePhase,
  StrategyType
} from './redesigned/types';

// Import modular systems
import { OperationManager } from './redesigned/operations';
import { StrategyManager } from './redesigned/strategy';
import { MarketManager } from './redesigned/market';
import { EventManager } from './redesigned/events';
import { TimeManager } from './redesigned/time';
import { ResourceManager } from './redesigned/resources';

export interface RedesignedGameState extends 
  ResourceState, 
  TimeState, 
  OperationState, 
  EventState, 
  StrategicState, 
  MarketState {
  // Officers (simplified but more impactful)
  officers: Officer[];
  
  // Actions
  selectStrategy: (strategy: StrategyType) => void;
  assignOfficer: (officerId: string, operationId: string) => void;
  launchOperation: (operationType: OperationType, targetId: string) => void;
  makeEventChoice: (choiceId: string) => void;
  advanceTime: () => void;
  bribeOfficial: (amount: number) => void;
  expandTerritory: (districtId: string) => void;
  recruitOfficer: () => void;
  upgradeOperation: (operationId: string) => void;
  dismissEvent: () => void;
}

export const useRedesignedGameStore = create<RedesignedGameState>((set, get) => {
  // Initialize state
  const initializeState = () => ({
    // Resources
    cash: 10000,
    power: 25,
    heat: 20,
    territory: 15,
    
    // Time
    currentWeek: 1,
    currentDay: 1,
    phase: 'planning' as GamePhase,
    
    // Operations
    activeOperations: [],
    completedOperations: [],
    assignedOfficers: {},
    
    // Events
    currentEvent: null,
    eventChoices: [],
    
    // Strategy
    currentStrategy: 'consolidation' as StrategyType,
    strategicGoals: StrategyManager.initializeGoals(),
    
    // Market
    marketConditions: MarketManager.initializeMarket(),
    opportunityCosts: MarketManager.getOpportunityCosts(MarketManager.initializeMarket()),
    
    // Officers
    officers: []
  });

  const initialState = initializeState();

  return {
    ...initialState,

    // Strategy Actions
    selectStrategy: (strategy) => {
      set({ currentStrategy: strategy });
      
      // Generate strategy-appropriate event
      const event = StrategyManager.generateStrategyEvent(strategy);
      if (event) {
        set({ currentEvent: event, eventChoices: event.choices });
      }
    },

    // Operation Actions
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
      const state = get();
      
      try {
        const operation = OperationManager.createOperation(operationType, targetId);
        const cost = state.opportunityCosts[operationType];
        
        if (!OperationManager.canLaunchOperation(operation, state, cost)) {
          console.warn('Cannot launch operation: insufficient resources or requirements not met');
          return;
        }

        set((prevState) => ({
          activeOperations: [...prevState.activeOperations, operation],
          cash: Math.max(0, prevState.cash - cost)
        }));
      } catch (error) {
        console.error('Failed to launch operation:', error);
      }
    },

    upgradeOperation: (operationId) => {
      set((state) => {
        if (state.cash < 1000) return state;

        const upgradedOperations = state.activeOperations.map(op =>
          op.id === operationId ? OperationManager.upgradeOperation(op) : op
        );

        return {
          activeOperations: upgradedOperations,
          cash: state.cash - 1000
        };
      });
    },

    // Event Actions
    makeEventChoice: (choiceId) => {
      const state = get();
      const choice = state.eventChoices.find(c => c.id === choiceId);
      
      if (!choice || !EventManager.canMakeChoice(choice, state)) {
        console.warn('Cannot make choice: requirements not met');
        return;
      }

      const result = EventManager.processEventChoice(choice, state);
      
      set((prevState) => {
        const newResources = ResourceManager.applyCost(prevState, result.resourceChanges);
        
        return {
          ...newResources,
          currentEvent: null,
          eventChoices: []
        };
      });
    },

    dismissEvent: () => {
      set({ currentEvent: null, eventChoices: [] });
    },

    // Time Actions
    advanceTime: () => {
      set((state) => {
        const newTimeState = TimeManager.advanceTime(state);
        const isWeekTransition = TimeManager.isWeekTransition(state, newTimeState);
        
        // Progress operations
        const updatedOperations = state.activeOperations.map(op => 
          OperationManager.progressOperation(op)
        );

        // Complete finished operations
        const completedOps = updatedOperations.filter(op => op.status === 'completed');
        const activeOps = updatedOperations.filter(op => op.status !== 'completed');

        // Apply operation results
        let resourceChanges: Partial<ResourceState> = {};
        
        completedOps.forEach(op => {
          const outcome = OperationManager.determineOutcome(op);
          if (outcome && outcome.rewards) {
            Object.assign(resourceChanges, outcome.rewards);
          }
        });

        // Update market conditions weekly
        const newMarketConditions = isWeekTransition ? 
          MarketManager.updateMarket() : 
          state.marketConditions;
        
        const newOpportunityCosts = isWeekTransition ?
          MarketManager.getOpportunityCosts(newMarketConditions) :
          state.opportunityCosts;

        // Update strategic goals
        const newResources = ResourceManager.applyReward(state, resourceChanges);
        const updatedGoals = StrategyManager.updateGoalProgress(
          state.strategicGoals, 
          newResources
        );

        // Generate random events occasionally
        let newEvent = state.currentEvent;
        let newChoices = state.eventChoices;
        
        if (!state.currentEvent && Math.random() < 0.2) {
          const randomEvent = EventManager.generateRandomEvent();
          if (randomEvent) {
            newEvent = randomEvent;
            newChoices = randomEvent.choices;
          }
        }

        return {
          ...newTimeState,
          ...newResources,
          activeOperations: activeOps,
          completedOperations: [...state.completedOperations, ...completedOps],
          strategicGoals: updatedGoals,
          marketConditions: newMarketConditions,
          opportunityCosts: newOpportunityCosts,
          currentEvent: newEvent,
          eventChoices: newChoices
        };
      });
    },

    // Resource Actions
    bribeOfficial: (amount) => {
      set((state) => {
        const heatReduction = Math.floor(amount / 100);
        const newResources = ResourceManager.applyCost(state, { cash: amount, heat: -heatReduction });
        return newResources;
      });
    },

    expandTerritory: (districtId) => {
      set((state) => {
        const cost = 2000;
        if (state.cash < cost) return state;
        
        const newResources = ResourceManager.applyCost(state, { 
          cash: cost, 
          territory: -10, // Negative because we're applying cost, then we'll add territory
          heat: 15,
          power: -5
        });
        
        // Add the territory gain
        newResources.territory += 20;
        newResources.power += 10;
        
        return ResourceManager.clampResources(newResources);
      });
    },

    recruitOfficer: () => {
      set((state) => {
        const cost = 2000;
        if (state.cash < cost) return state;
        
        const newResources = ResourceManager.applyCost(state, { cash: cost });
        newResources.power += 3;
        
        return newResources;
      });
    }
  };
});

// Helper hooks for specific state slices
export const useResources = () => {
  const store = useRedesignedGameStore();
  return {
    cash: store.cash,
    power: store.power,
    heat: store.heat,
    territory: store.territory,
    canAfford: (cost: Partial<ResourceState>) => ResourceManager.canAfford(store, cost),
    getResourceDescription: () => ResourceManager.getResourceDescription(store),
    getOverallStrength: () => ResourceManager.getOverallStrength(store)
  };
};

export const useOperations = () => {
  const store = useRedesignedGameStore();
  return {
    activeOperations: store.activeOperations,
    completedOperations: store.completedOperations,
    assignedOfficers: store.assignedOfficers,
    launchOperation: store.launchOperation,
    assignOfficer: store.assignOfficer,
    upgradeOperation: store.upgradeOperation
  };
};

export const useStrategy = () => {
  const store = useRedesignedGameStore();
  return {
    currentStrategy: store.currentStrategy,
    strategicGoals: store.strategicGoals,
    selectStrategy: store.selectStrategy,
    completedGoals: StrategyManager.getCompletedGoals(store.strategicGoals),
    overdueGoals: StrategyManager.getOverdueGoals(store.strategicGoals, store.currentWeek)
  };
};

export const useEvents = () => {
  const store = useRedesignedGameStore();
  return {
    currentEvent: store.currentEvent,
    eventChoices: store.eventChoices,
    makeEventChoice: store.makeEventChoice,
    dismissEvent: store.dismissEvent
  };
};

export const useMarket = () => {
  const store = useRedesignedGameStore();
  return {
    marketConditions: store.marketConditions,
    opportunityCosts: store.opportunityCosts,
    getMarketDescription: () => MarketManager.getMarketDescription(store.marketConditions)
  };
};