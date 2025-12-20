import { GameEvent, EventChoice, ResourceState } from './types';

export class EventManager {
  static processEventChoice(choice: EventChoice, currentResources: ResourceState): {
    success: boolean;
    resourceChanges: Partial<ResourceState>;
    message: string;
  } {
    const success = Math.random() * 100 < choice.outcomes.probability;
    const message = success ? choice.outcomes.success : choice.outcomes.failure;
    
    let resourceChanges: Partial<ResourceState> = {};
    
    // Apply costs (always paid regardless of success/failure)
    if (choice.cost.cash) {
      resourceChanges.cash = -choice.cost.cash;
    }
    if (choice.cost.power) {
      resourceChanges.power = -choice.cost.power;
    }
    if (choice.cost.heat) {
      resourceChanges.heat = choice.cost.heat;
    }
    
    // Apply additional effects based on outcome
    if (success) {
      // Success bonuses could be added here
    } else {
      // Failure penalties could be added here
    }
    
    return {
      success,
      resourceChanges,
      message
    };
  }

  static canMakeChoice(choice: EventChoice, resources: ResourceState): boolean {
    // Check resource requirements
    if (choice.cost.cash && resources.cash < choice.cost.cash) return false;
    if (choice.cost.power && resources.power < choice.cost.power) return false;
    if (choice.cost.heat && resources.heat + choice.cost.heat > 100) return false;
    
    // Check other requirements
    if (choice.requirements.minPower && resources.power < choice.requirements.minPower) return false;
    if (choice.requirements.maxHeat && resources.heat > choice.requirements.maxHeat) return false;
    
    return true;
  }

  static generateRandomEvent(urgency: 'low' | 'medium' | 'high' = 'medium'): GameEvent | null {
    const events = [
      {
        id: 'police-investigation',
        title: 'Police Investigation',
        description: 'Authorities are investigating our operations.',
        urgency: 'high' as const,
        choices: [
          {
            id: 'bribe',
            description: 'Bribe investigating officers',
            cost: { cash: 3000, heat: -5 },
            requirements: { maxHeat: 70 },
            outcomes: {
              success: 'Investigation dropped, heat reduced',
              failure: 'Bribe refused, investigation intensifies',
              probability: 60
            }
          },
          {
            id: 'lay-low',
            description: 'Temporarily cease operations',
            cost: { cash: -1000 }, // Lost income
            requirements: {},
            outcomes: {
              success: 'Heat decreases naturally',
              failure: 'Police find evidence anyway',
              probability: 75
            }
          }
        ],
        consequences: {
          ignore: 'Investigation leads to arrests and raids'
        }
      },
      {
        id: 'rival-challenge',
        title: 'Rival Challenge',
        description: 'A rival gang is challenging our territory.',
        urgency: 'medium' as const,
        choices: [
          {
            id: 'fight',
            description: 'Meet the challenge head-on',
            cost: { power: 15, heat: 20 },
            requirements: { minPower: 30 },
            outcomes: {
              success: 'Rival backs down, reputation enhanced',
              failure: 'Defeated, territory lost',
              probability: 55
            }
          },
          {
            id: 'negotiate',
            description: 'Negotiate a settlement',
            cost: { cash: 2000 },
            requirements: {},
            outcomes: {
              success: 'Peaceful resolution, minor concessions',
              failure: 'Rival exploits weakness',
              probability: 70
            }
          }
        ],
        consequences: {
          ignore: 'Rival takes territory by force'
        }
      }
    ];
    
    const filteredEvents = events.filter(event => event.urgency === urgency);
    return filteredEvents.length > 0 ? filteredEvents[Math.floor(Math.random() * filteredEvents.length)] : null;
  }
}