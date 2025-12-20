export interface CharacterNeed {
  name: keyof CharacterNeeds;
  value: number; // 0-100
  decayRate: number; // points per hour
  fulfillmentActions: FulfillmentAction[];
  description: string;
}

export interface FulfillmentAction {
  action: string;
  effectiveness: number; // points per hour
  requirements?: string[];
  sideEffects?: { need: keyof CharacterNeeds; change: number }[];
}

export interface CharacterNeeds {
  safety: number;        // Security, protection from harm
  respect: number;       // Status, recognition from peers
  wealth: number;         // Money, resources, material goods
  power: number;         // Control over others and environment
  belonging: number;     // Social connections, friendship
  excitement: number;    // Thrill, novelty, stimulation
}

export const NEEDS_CONFIG: Record<keyof CharacterNeeds, CharacterNeed> = {
  safety: {
    name: 'safety',
    value: 70,
    decayRate: 2,
    description: 'Need for security and protection',
    fulfillmentActions: [
      { action: 'patrolling', effectiveness: 15 },
      { action: 'training', effectiveness: 10 },
      { action: 'gathering_intel', effectiveness: 8 },
      { action: 'socializing', effectiveness: 5, sideEffects: [{ need: 'belonging', change: 10 }] }
    ]
  },
  respect: {
    name: 'respect',
    value: 60,
    decayRate: 1.5,
    description: 'Need for status and recognition',
    fulfillmentActions: [
      { action: 'patrolling', effectiveness: 12 },
      { action: 'working', effectiveness: 10 },
      { action: 'socializing', effectiveness: 8 },
      { action: 'plotting', effectiveness: 6, sideEffects: [{ need: 'power', change: 5 }] }
    ]
  },
  wealth: {
    name: 'wealth',
    value: 50,
    decayRate: 3,
    description: 'Need for money and resources',
    fulfillmentActions: [
      { action: 'working', effectiveness: 20 },
      { action: 'gambling', effectiveness: 15, sideEffects: [{ need: 'excitement', change: 10 }] },
      { action: 'extorting', effectiveness: 25, sideEffects: [{ need: 'respect', change: -5 }] },
      { action: 'socializing', effectiveness: 5 }
    ]
  },
  power: {
    name: 'power',
    value: 40,
    decayRate: 2.5,
    description: 'Need for control and influence',
    fulfillmentActions: [
      { action: 'plotting', effectiveness: 18 },
      { action: 'recruiting', effectiveness: 15 },
      { action: 'managing', effectiveness: 12 },
      { action: 'intimidating', effectiveness: 10, sideEffects: [{ need: 'respect', change: -5 }] }
    ]
  },
  belonging: {
    name: 'belonging',
    value: 55,
    decayRate: 2,
    description: 'Need for social connection and friendship',
    fulfillmentActions: [
      { action: 'socializing', effectiveness: 20 },
      { action: 'working', effectiveness: 8 },
      { action: 'recruiting', effectiveness: 12 },
      { action: 'resting', effectiveness: 5 }
    ]
  },
  excitement: {
    name: 'excitement',
    value: 45,
    decayRate: 3.5,
    description: 'Need for thrills and novel experiences',
    fulfillmentActions: [
      { action: 'gambling', effectiveness: 18 },
      { action: 'nightclub', effectiveness: 15 },
      { action: 'fighting', effectiveness: 20, sideEffects: [{ need: 'safety', change: -10 }] },
      { action: 'plotting', effectiveness: 10 }
    ]
  }
};

export class CharacterNeedsManager {
  private needs: CharacterNeeds;
  private lastUpdateTime: number;
  
  constructor(initialNeeds?: Partial<CharacterNeeds>) {
    this.needs = {
      safety: 70,
      respect: 60,
      wealth: 50,
      power: 40,
      belonging: 55,
      excitement: 45,
      ...initialNeeds
    };
    this.lastUpdateTime = Date.now();
  }
  
  updateNeeds(deltaTime: number): void {
    // Apply natural decay
    for (const [needName, need] of Object.entries(NEEDS_CONFIG)) {
      const decay = need.decayRate * (deltaTime / 3600); // Convert hours to points
      this.needs[needName as keyof CharacterNeeds] = Math.max(0, 
        this.needs[needName as keyof CharacterNeeds] - decay);
    }
  }
  
  fulfillNeed(action: string, duration: number): number[] {
    const changes: number[] = [];
    
    for (const [needName, need] of Object.entries(NEEDS_CONFIG)) {
      const fulfillmentAction = need.fulfillmentActions.find(a => a.action === action);
      if (fulfillmentAction) {
        const change = fulfillmentAction.effectiveness * (duration / 3600);
        const currentNeed = this.needs[needName as keyof CharacterNeeds];
        const newValue = Math.min(100, Math.max(0, currentNeed + change));
        this.needs[needName as keyof CharacterNeeds] = newValue;
        changes.push(change);
        
        // Apply side effects
        if (fulfillmentAction.sideEffects) {
          for (const sideEffect of fulfillmentAction.sideEffects) {
            const currentValue = this.needs[sideEffect.need];
            this.needs[sideEffect.need] = Math.min(100, Math.max(0, currentValue + sideEffect.change));
          }
        }
      } else {
        changes.push(0);
      }
    }
    
    return changes;
  }
  
  getMostUrgentNeed(): { need: keyof CharacterNeeds; urgency: number } | null {
    let mostUrgent: { need: keyof CharacterNeeds; urgency: number } | null = null;
    
    for (const [needName, value] of Object.entries(this.needs)) {
      const urgency = 100 - value;
      if (!mostUrgent || urgency > mostUrgent.urgency) {
        mostUrgent = {
          need: needName as keyof CharacterNeeds,
          urgency
        };
      }
    }
    
    return mostUrgent?.urgency > 50 ? mostUrgent : null;
  }
  
  getNeedsStatus(): CharacterNeeds {
    return { ...this.needs };
  }
  
  getCriticalNeeds(): (keyof CharacterNeeds)[] {
    return Object.entries(this.needs)
      .filter(([_, value]) => value < 30)
      .map(([name, _]) => name as keyof CharacterNeeds);
  }
  
  getAverageSatisfaction(): number {
    const values = Object.values(this.needs);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  isInCrisis(): boolean {
    return this.getCriticalNeeds().length >= 2 || this.getAverageSatisfaction() < 25;
  }
  
  getMoodModifier(): number {
    const avgSatisfaction = this.getAverageSatisfaction();
    if (avgSatisfaction > 80) return 1.2; // Very satisfied - 20% bonus to actions
    if (avgSatisfaction > 60) return 1.1; // Satisfied - 10% bonus
    if (avgSatisfaction < 30) return 0.8; // In crisis - 20% penalty
    if (avgSatisfaction < 50) return 0.9; // Struggling - 10% penalty
    return 1.0; // Neutral
  }
}