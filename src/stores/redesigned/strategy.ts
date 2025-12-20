import { StrategicGoal, GameEvent, StrategyType } from './types';

export const STRATEGIC_GOALS: Omit<StrategicGoal, 'id' | 'currentValue' | 'completed'>[] = [
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

export class StrategyManager {
  static initializeGoals(): StrategicGoal[] {
    return STRATEGIC_GOALS.map((goal, index) => ({
      ...goal,
      id: `goal-${index}`,
      currentValue: 0,
      completed: false
    }));
  }

  static generateStrategyEvent(strategy: StrategyType): GameEvent | null {
    const events: Record<StrategyType, GameEvent> = {
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

  static updateGoalProgress(goals: StrategicGoal[], resources: { cash: number; power: number; territory: number; heat: number }): StrategicGoal[] {
    return goals.map(goal => {
      if (goal.completed) return goal;

      let currentValue = goal.currentValue;
      
      // Update current value based on goal type
      switch (goal.name) {
        case 'Economic Dominance':
          currentValue = Math.min(resources.cash / 200, 100); // $200 = 1% economy
          break;
        case 'Territory Control':
          currentValue = resources.territory;
          break;
        case 'Power Projection':
          currentValue = resources.power;
          break;
        case 'Stealth Empire':
          currentValue = Math.max(0, 100 - resources.heat); // Lower heat = higher progress
          break;
      }

      return {
        ...goal,
        currentValue,
        completed: currentValue >= goal.targetValue
      };
    });
  }

  static getCompletedGoals(goals: StrategicGoal[]): StrategicGoal[] {
    return goals.filter(goal => goal.completed);
  }

  static getOverdueGoals(goals: StrategicGoal[], currentWeek: number): StrategicGoal[] {
    return goals.filter(goal => !goal.completed && currentWeek > goal.deadline);
  }
}