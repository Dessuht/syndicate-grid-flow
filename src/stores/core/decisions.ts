import { StrategicDecision, DecisionOption, DecisionRequirements, ResourceCost, DecisionOutcome } from './types';

export class DecisionSystem {
  static generateStrategicDecision(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision | null {
    // Only generate decisions occasionally to avoid overwhelming the player
    if (Math.random() > 0.3) return null;
    
    const decisionTypes = [
      this.generateRivalChallenge,
      this.generateInternalConflict,
      this.generateOpportunity,
      this.generateCrisis,
      this.generatePolicePressure
    ];
    
    const generator = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];
    return generator.call(this, week, resources);
  }

  private static generateRivalChallenge(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision {
    return {
      id: `rival-challenge-${Date.now()}`,
      title: 'Rival Gang Challenge',
      description: 'A rival gang is challenging our territory and influence. How should we respond?',
      options: [
        {
          id: 'military-response',
          description: 'Respond with overwhelming force',
          costs: { cash: 5000, manpower: 5, heat: 20 },
          requirements: { minInfluence: 40, minManpower: 8 },
          outcomes: [
            {
              probability: 60,
              result: 'Rival gang crushed, territory gained',
              rewards: { influence: 15, territory: 10 },
              consequences: ['Other gangs respect your strength', 'Police attention increased']
            },
            {
              probability: 40,
              result: 'Bloody conflict with heavy losses',
              rewards: { manpower: -3, influence: -10 },
              consequences: ['Organization weakened', 'Vulnerability exposed']
            }
          ]
        },
        {
          id: 'diplomatic-solution',
          description: 'Negotiate a settlement',
          costs: { cash: 2000, influence: 5 },
          requirements: { minInfluence: 25 },
          outcomes: [
            {
              probability: 75,
              result: 'Peaceful resolution reached',
              rewards: { heat: -5 },
              consequences: ['Stability maintained', 'Some concessions made']
            },
            {
              probability: 25,
              result: 'Rival exploits weakness',
              rewards: { territory: -5, influence: -5 },
              consequences: ['Loss of face', 'Emboldened rivals']
            }
          ]
        },
        {
          id: 'assassination',
          description: 'Eliminate rival leadership',
          costs: { cash: 8000, heat: 30 },
          requirements: { minInfluence: 60, minManpower: 6 },
          outcomes: [
            {
              probability: 45,
              result: 'Rival leadership eliminated',
              rewards: { influence: 25, territory: 15 },
              consequences: ['Power vacuum created', 'Police investigation launched']
            },
            {
              probability: 55,
              result: 'Assassination attempt fails',
              rewards: { manpower: -2, heat: 20, influence: -15 },
              consequences: ['Retaliation coming', 'Undercover operation exposed']
            }
          ]
        }
      ],
      urgency: 'high',
      deadline: 7,
      consequences: {
        ignore: 'Rival gang takes territory by force, influence severely damaged',
        timeout: 'Forced into defensive position, losing initiative'
      }
    };
  }

  private static generateInternalConflict(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision {
    return {
      id: `internal-conflict-${Date.now()}`,
      title: 'Internal Power Struggle',
      description: 'Factions within your organization are vying for control. This must be resolved decisively.',
      options: [
        {
          id: 'crackdown',
          description: 'Crush dissent with force',
          costs: { influence: 15, heat: 15, manpower: 3 },
          requirements: { minInfluence: 50 },
          outcomes: [
            {
              probability: 70,
              result: 'Dissent crushed, unity restored',
              rewards: { influence: 10 },
              consequences: ['Loyalty through fear', 'Some competent officers lost']
            },
            {
              probability: 30,
              result: 'Civil war erupts',
              rewards: { manpower: -5, influence: -20 },
              consequences: ['Organization shattered', 'Rivals exploit chaos']
            }
          ]
        },
        {
          id: 'negotiation',
          description: 'Negotiate with factions',
          costs: { cash: 3000, influence: 5 },
          requirements: { minInfluence: 30 },
          outcomes: [
            {
              probability: 65,
              result: 'Compromise reached',
              rewards: { heat: -5 },
              consequences: ['Unity maintained', 'Some concessions made']
            },
            {
              probability: 35,
              result: 'Factions exploit weakness',
              rewards: { influence: -10 },
              consequences: ['Authority undermined', 'Future challenges likely']
            }
          ]
        },
        {
          id: 'purge',
          description: 'Eliminate troublemakers',
          costs: { manpower: 2, heat: 10 },
          requirements: { minInfluence: 40 },
          outcomes: [
            {
              probability: 80,
              result: 'Troublemakers removed',
              rewards: { influence: 5 },
              consequences: ['Organization purified', 'Fear instilled']
            },
            {
              probability: 20,
              result: 'Purge backfires',
              rewards: { manpower: -3, influence: -15 },
              consequences: ['Mass desertions', 'Power vacuum created']
            }
          ]
        }
      ],
      urgency: 'critical',
      deadline: 5,
      consequences: {
        ignore: 'Organization splits into warring factions',
        timeout: 'Leadership challenged, civil war inevitable'
      }
    };
  }

  private static generateOpportunity(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision {
    return {
      id: `opportunity-${Date.now()}`,
      title: 'Business Opportunity',
      description: 'A unique business opportunity has presented itself. Acting quickly could yield significant rewards.',
      options: [
        {
          id: 'full-investment',
          description: 'Invest heavily for maximum returns',
          costs: { cash: 10000, manpower: 4 },
          requirements: { minInfluence: 30 },
          outcomes: [
            {
              probability: 60,
              result: 'Massive success',
              rewards: { cash: 25000, influence: 15 },
              consequences: ['New revenue stream established', 'Market dominance achieved']
            },
            {
              probability: 40,
              result: 'Market collapse',
              rewards: { cash: -8000, manpower: -2 },
              consequences: ['Heavy losses', 'Competitors strengthened']
            }
          ]
        },
        {
          id: 'conservative',
          description: 'Conservative investment approach',
          costs: { cash: 4000, manpower: 2 },
          requirements: { minInfluence: 20 },
          outcomes: [
            {
              probability: 85,
              result: 'Steady returns',
              rewards: { cash: 8000, influence: 5 },
              consequences: ['Reliable income', 'Market position improved']
            },
            {
              probability: 15,
              result: 'Minimal returns',
              rewards: { cash: -1000 },
              consequences: ['Opportunity missed', 'Resources tied up']
            }
          ]
        },
        {
          id: 'pass',
          description: 'Pass on the opportunity',
          costs: {},
          requirements: {},
          outcomes: [
            {
              probability: 100,
              result: 'Opportunity missed',
              rewards: {},
              consequences: ['Rivals may seize opportunity', 'Status quo maintained']
            }
          ]
        }
      ],
      urgency: 'medium',
      deadline: 10,
      consequences: {
        ignore: 'Opportunity expires, rivals may benefit',
        timeout: 'Market moves on, chance lost'
      }
    };
  }

  private static generateCrisis(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision {
    return {
      id: `crisis-${Date.now()}`,
      title: 'Financial Crisis',
      description: 'Your organization is facing a severe financial crisis. Immediate action is required to survive.',
      options: [
        {
          id: 'brutal-cuts',
          description: 'Make brutal cuts to survive',
          costs: { manpower: -5, influence: -10 },
          requirements: {},
          outcomes: [
            {
              probability: 90,
              result: 'Organization survives',
              rewards: { cash: 5000 },
              consequences: ['Morale devastated', 'Long-term damage']
            },
            {
              probability: 10,
              result: 'Cuts too severe',
              rewards: { manpower: -8, influence: -20 },
              consequences: ['Collapse imminent', 'No recovery possible']
            }
          ]
        },
        {
          id: 'desperate-measures',
          description: 'Take desperate risks',
          costs: { heat: 25 },
          requirements: { minManpower: 3 },
          outcomes: [
            {
              probability: 40,
              result: 'Risks pay off',
              rewards: { cash: 12000, influence: 10 },
              consequences: ['Organization saved', 'New respect earned']
            },
            {
              probability: 60,
              result: 'Risks backfire',
              rewards: { cash: -3000, manpower: -3, heat: 15 },
              consequences: ['Crisis deepens', 'Law enforcement alerted']
            }
          ]
        },
        {
          id: 'borrow',
          description: 'Borrow from loan sharks',
          costs: {},
          requirements: { minInfluence: 20 },
          outcomes: [
            {
              probability: 100,
              result: 'Immediate relief',
              rewards: { cash: 8000 },
              consequences: ['Debt incurred', 'Future payments required']
            }
          ]
        }
      ],
      urgency: 'critical',
      deadline: 3,
      consequences: {
        ignore: 'Organization collapses',
        timeout: 'Bankruptcy unavoidable'
      }
    };
  }

  private static generatePolicePressure(week: number, resources: { cash: number; influence: number; heat: number; manpower: number }): StrategicDecision {
    return {
      id: `police-pressure-${Date.now()}`,
      title: 'Police Pressure',
      description: 'Intense police pressure threatens your operations. You must act to reduce heat.',
      options: [
        {
          id: 'massive-bribe',
          description: 'Massive bribery campaign',
          costs: { cash: 15000 },
          requirements: { minInfluence: 40 },
          outcomes: [
            {
              probability: 75,
              result: 'Pressure reduced',
              rewards: { heat: -30 },
              consequences: ['Police cooperation secured', 'Expensive but effective']
            },
            {
              probability: 25,
              result: 'Sting operation',
              rewards: { cash: -8000, manpower: -2, heat: 20 },
              consequences: ['Officers arrested', 'Investigation intensified']
            }
          ]
        },
        {
          id: 'lay-low',
          description: 'Cease all operations temporarily',
          costs: { cash: -2000, influence: -5 },
          requirements: {},
          outcomes: [
            {
              probability: 90,
              result: 'Heat decreases naturally',
              rewards: { heat: -20 },
              consequences: ['Income lost', 'Rivals may gain ground']
            },
            {
              probability: 10,
              result: 'Police find evidence anyway',
              rewards: { heat: 10 },
              consequences: ['Passive strategy failed', 'Opportunity cost high']
            }
          ]
        },
        {
          id: 'sacrifice',
          description: 'Sacrifice junior officers',
          costs: { manpower: -3 },
          requirements: { minManpower: 5 },
          outcomes: [
            {
              probability: 80,
              result: 'Heat reduced',
              rewards: { heat: -15 },
              consequences: ['Loyalty damaged', 'Morale suffers']
            },
            {
              probability: 20,
              result: 'Insufficient sacrifice',
              rewards: { heat: 5, manpower: -2 },
              consequences: ['Police not satisfied', 'Further action required']
            }
          ]
        }
      ],
      urgency: 'high',
      deadline: 5,
      consequences: {
        ignore: 'Major raid imminent',
        timeout: 'Crackdown unavoidable'
      }
    };
  }

  static canMakeDecision(option: DecisionOption, resources: { cash: number; influence: number; heat: number; manpower: number }): boolean {
    // Check resource costs
    if (option.costs.cash && resources.cash < option.costs.cash) return false;
    if (option.costs.influence && resources.influence < option.costs.influence) return false;
    if (option.costs.heat && resources.heat + option.costs.heat > 100) return false;
    if (option.costs.manpower && resources.manpower < option.costs.manpower) return false;
    
    // Check requirements
    if (option.requirements.minInfluence && resources.influence < option.requirements.minInfluence) return false;
    if (option.requirements.maxHeat && resources.heat > option.requirements.maxHeat) return false;
    if (option.requirements.minManpower && resources.manpower < option.requirements.minManpower) return false;
    
    return true;
  }

  static executeDecision(option: DecisionOption): DecisionOutcome {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const outcome of option.outcomes) {
      cumulative += outcome.probability;
      if (roll <= cumulative) {
        return outcome;
      }
    }
    
    // Fallback to last outcome
    return option.outcomes[option.outcomes.length - 1];
  }

  static canMakeChoice(option: DecisionOption, resources: { cash: number; influence: number; heat: number; manpower: number }): boolean {
    // Check resource costs
    if (option.costs.cash && resources.cash < option.costs.cash) return false;
    if (option.costs.influence && resources.influence < option.costs.influence) return false;
    if (option.costs.heat && resources.heat + option.costs.heat > 100) return false;
    if (option.costs.manpower && resources.manpower < option.costs.manpower) return false;
    
    // Check requirements
    if (option.requirements.minInfluence && resources.influence < option.requirements.minInfluence) return false;
    if (option.requirements.maxHeat && resources.heat > option.requirements.maxHeat) return false;
    if (option.requirements.minManpower && resources.manpower < option.requirements.minManpower) return false;
    
    return true;
  }

  static canMakeChoice(option: DecisionOption, resources: { cash: number; influence: number; heat: number; manpower: number }): boolean {
    // Check resource costs
    if (option.costs.cash && resources.cash < option.costs.cash) return false;
    if (option.costs.influence && resources.influence < option.costs.influence) return false;
    if (option.costs.heat && resources.heat + option.costs.heat > 100) return false;
    if (option.costs.manpower && resources.manpower < option.costs.manpower) return false;
    
    // Check requirements
    if (option.requirements.minInfluence && resources.influence < option.requirements.minInfluence) return false;
    if (option.requirements.maxHeat && resources.heat > option.requirements.maxHeat) return false;
    if (option.requirements.minManpower && resources.manpower < option.requirements.minManpower) return false;
    
    return true;
  }
}