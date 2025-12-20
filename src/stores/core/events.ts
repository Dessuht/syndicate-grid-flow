import { GameEvent, EventType, EventChoice, EventOutcome } from './types';

export class EventSystem {
  static generateRandomEvent(currentHeat: number, currentInfluence: number): GameEvent | null {
    // Higher heat and influence increase event frequency
    const eventChance = Math.min(0.4, (currentHeat + currentInfluence) / 300);
    
    if (Math.random() > eventChance) return null;
    
    const eventGenerators = [
      this.generatePoliceRaid,
      this.generateBetrayal,
      this.generateOpportunityEvent,
      this.generateCrisisEvent,
      this.generateRecruitmentEvent
    ];
    
    const generator = eventGenerators[Math.floor(Math.random() * eventGenerators.length)];
    return generator.call(this, currentHeat, currentInfluence);
  }

  private static generatePoliceRaid(currentHeat: number, currentInfluence: number): GameEvent {
    return {
      id: `police-raid-${Date.now()}`,
      title: 'Police Raid',
      description: 'Police are raiding your operations! Immediate action required.',
      type: 'police_raid',
      urgency: 'critical',
      choices: [
        {
          id: 'fight',
          description: 'Fight back with force',
          requirements: { manpower: 5 },
          outcomes: [
            {
              probability: 30,
              result: 'Successfully repel raid',
              effects: { heat: 10, manpower: -2 },
              followUpEvents: ['police-investigation']
            },
            {
              probability: 70,
              result: 'Overpowered by police',
              effects: { cash: -5000, manpower: -4, heat: 20 },
              followUpEvents: ['officer-arrested']
            }
          ]
        },
        {
          id: 'bribe',
          description: 'Bribe raiding officers',
          requirements: { cash: 8000 },
          outcomes: [
            {
              probability: 60,
              result: 'Bribe accepted',
              effects: { cash: -8000, heat: -5 },
              followUpEvents: []
            },
            {
              probability: 40,
              result: 'Bribe refused, escalation',
              effects: { cash: -4000, heat: 25 },
              followUpEvents: ['corruption-investigation']
            }
          ]
        },
        {
          id: 'escape',
          description: 'Abandon operations and escape',
          requirements: {},
          outcomes: [
            {
              probability: 90,
              result: 'Escape successful',
              effects: { cash: -2000, influence: -5 },
              followUpEvents: []
            },
            {
              probability: 10,
              result: 'Cornered during escape',
              effects: { cash: -3000, manpower: -2, heat: 15 },
              followUpEvents: ['manhunt']
            }
          ]
        }
      ],
      autoResolve: 2
    };
  }

  private static generateBetrayal(currentHeat: number, currentInfluence: number): GameEvent {
    return {
      id: `betrayal-${Date.now()}`,
      title: 'Officer Betrayal',
      description: 'One of your trusted officers is planning to betray you to rivals or police.',
      type: 'betrayal',
      urgency: 'high',
      choices: [
        {
          id: 'confront',
          description: 'Confront the traitor directly',
          requirements: { influence: 30 },
          outcomes: [
            {
              probability: 50,
              result: 'Traitor eliminated',
              effects: { manpower: -1, heat: 10 },
              followUpEvents: []
            },
            {
              probability: 50,
              result: 'Traitor escapes with information',
              effects: { influence: -15, heat: 20 },
              followUpEvents: ['rival-advantage']
            }
          ]
        },
        {
          id: 'forgive',
          description: 'Forgive and try to redeem',
          requirements: { influence: 20 },
          outcomes: [
            {
              probability: 30,
              result: 'Officer remains loyal',
              effects: { influence: 5 },
              followUpEvents: []
            },
            {
              probability: 70,
              result: 'Betrayal continues',
              effects: { influence: -20, heat: 15 },
              followUpEvents: ['internal-conflict']
            }
          ]
        },
        {
          id: 'eliminate',
          description: 'Silent elimination',
          requirements: { manpower: 2 },
          outcomes: [
            {
              probability: 80,
              result: 'Problem solved quietly',
              effects: { heat: 5 },
              followUpEvents: []
            },
            {
              probability: 20,
              result: 'Elimination discovered',
              effects: { heat: 25, influence: -10 },
              followUpEvents: ['police-investigation']
            }
          ]
        }
      ],
      autoResolve: 3
    };
  }

  private static generateOpportunityEvent(currentHeat: number, currentInfluence: number): GameEvent {
    return {
      id: `opportunity-${Date.now()}`,
      title: 'Business Opportunity',
      description: 'A lucrative business opportunity has emerged. Acting quickly could yield significant rewards.',
      type: 'opportunity',
      urgency: 'medium',
      choices: [
        {
          id: 'invest-heavy',
          description: 'Invest heavily for maximum returns',
          requirements: { cash: 10000 },
          outcomes: [
            {
              probability: 60,
              result: 'Massive success',
              effects: { cash: 20000, influence: 10 },
              followUpEvents: []
            },
            {
              probability: 40,
              result: 'Market turns against you',
              effects: { cash: -6000, heat: 5 },
              followUpEvents: []
            }
          ]
        },
        {
          id: 'invest-conservative',
          description: 'Conservative investment',
          requirements: { cash: 4000 },
          outcomes: [
            {
              probability: 85,
              result: 'Steady profits',
              effects: { cash: 7000, influence: 3 },
              followUpEvents: []
            },
            {
              probability: 15,
              result: 'Minimal returns',
              effects: { cash: -1000 },
              followUpEvents: []
            }
          ]
        },
        {
          id: 'pass',
          description: 'Pass on opportunity',
          requirements: {},
          outcomes: [
            {
              probability: 100,
              result: 'Opportunity missed',
              effects: { influence: -2 },
              followUpEvents: []
            }
          ]
        }
      ],
      autoResolve: 5
    };
  }

  private static generateCrisisEvent(currentHeat: number, currentInfluence: number): GameEvent {
    return {
      id: `crisis-${Date.now()}`,
      title: 'Financial Crisis',
      description: 'Your organization is facing severe financial difficulties. Immediate action required.',
      type: 'crisis',
      urgency: 'critical',
      choices: [
        {
          id: 'desperate-measures',
          description: 'Take desperate risks',
          requirements: { manpower: 3 },
          outcomes: [
            {
              probability: 35,
              result: 'Risks pay off spectacularly',
              effects: { cash: 15000, influence: 15 },
              followUpEvents: []
            },
            {
              probability: 65,
              result: 'Disaster strikes',
              effects: { cash: -3000, manpower: -2, heat: 20 },
              followUpEvents: ['organizational-collapse']
            }
          ]
        },
        {
          id: 'borrow',
          description: 'Borrow from loan sharks',
          requirements: { influence: 25 },
          outcomes: [
            {
              probability: 100,
              result: 'Immediate relief',
              effects: { cash: 8000 },
              followUpEvents: ['debt-collection']
            }
          ]
        },
        {
          id: 'downsize',
          description: 'Drastic downsizing',
          requirements: {},
          outcomes: [
            {
              probability: 90,
              result: 'Organization survives',
              effects: { cash: 3000, manpower: -4, influence: -10 },
              followUpEvents: []
            },
            {
              probability: 10,
              result: 'Cuts too severe',
              effects: { manpower: -6, influence: -20 },
              followUpEvents: ['organizational-collapse']
            }
          ]
        }
      ],
      autoResolve: 2
    };
  }

  private static generateRecruitmentEvent(currentHeat: number, currentInfluence: number): GameEvent {
    return {
      id: `recruitment-${Date.now()}`,
      title: 'Talent Recruitment',
      description: 'A highly skilled individual is seeking to join your organization.',
      type: 'opportunity',
      urgency: 'low',
      choices: [
        {
          id: 'recruit',
          description: 'Recruit the talented individual',
          requirements: { cash: 3000, influence: 20 },
          outcomes: [
            {
              probability: 80,
              result: 'Valuable asset acquired',
              effects: { manpower: 2, influence: 5 },
              followUpEvents: []
            },
            {
              probability: 20,
              result: 'Recruit is undercover agent',
              effects: { heat: 15, manpower: -1 },
              followUpEvents: ['undercover-operation']
            }
          ]
        },
        {
          id: 'reject',
          description: 'Reject the applicant',
          requirements: {},
          outcomes: [
            {
              probability: 100,
              result: 'Opportunity missed',
              effects: {},
              followUpEvents: []
            }
          ]
        }
      ],
      autoResolve: 7
    };
  }

  static canMakeChoice(choice: EventChoice, resources: { cash: number; influence: number; heat: number; manpower: number }): boolean {
    // Check resource requirements
    if (choice.requirements.cash && resources.cash < choice.requirements.cash) return false;
    if (choice.requirements.influence && resources.influence < choice.requirements.influence) return false;
    if (choice.requirements.heat && resources.heat > choice.requirements.heat) return false;
    if (choice.requirements.manpower && resources.manpower < choice.requirements.manpower) return false;
    
    return true;
  }

  static executeEventChoice(choice: EventChoice): EventOutcome {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const outcome of choice.outcomes) {
      cumulative += outcome.probability;
      if (roll <= cumulative) {
        return outcome;
      }
    }
    
    // Fallback to last outcome
    return choice.outcomes[choice.outcomes.length - 1];
  }

  static getEventDescription(event: GameEvent): string {
    const urgencyText = {
      low: 'Minor issue',
      medium: 'Important matter',
      high: 'Urgent situation',
      critical: 'CRITICAL - Immediate action required'
    };
    
    return `${urgencyText[event.urgency]}: ${event.description}`;
  }
}