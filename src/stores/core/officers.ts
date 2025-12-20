import { Officer, OfficerRank, OfficerSkills, OfficerGoal, OfficerTrait, TraitEffect } from './types';

export class OfficerSystem {
  private static readonly RANK_HIERARCHY: OfficerRank[] = ['enforcer', 'lieutenant', 'captain', 'underboss', 'boss'];
  
  private static readonly TRAIT_LIBRARY: OfficerTrait[] = [
    {
      name: 'Brutal',
      effect: {
        operationBonus: { assassination: 15, intimidation: 10, expansion: 10 },
        riskModifier: 1.2,
        loyaltyModifier: -5
      }
    },
    {
      name: 'Charismatic',
      effect: {
        operationBonus: { corruption: 20, recruitment: 15, protection: 10 },
        skillBonus: { diplomacy: 15 },
        loyaltyModifier: 10
      }
    },
    {
      name: 'Strategic',
      effect: {
        operationBonus: { expansion: 15, elimination: 10, smuggling: 10 },
        skillBonus: { intelligence: 20 },
        riskModifier: 0.8
      }
    },
    {
      name: 'Loyal',
      effect: {
        loyaltyModifier: 20,
        riskModifier: 0.9
      }
    },
    {
      name: 'Greedy',
      effect: {
        operationBonus: { extortion: 20, smuggling: 15, gambling: 10 },
        loyaltyModifier: -10
      }
    },
    {
      name: 'Cautious',
      effect: {
        riskModifier: 0.7,
        skillBonus: { intelligence: 10 }
      }
    },
    {
      name: 'Aggressive',
      effect: {
        operationBonus: { intimidation: 15, assassination: 10, expansion: 10 },
        riskModifier: 1.3,
        skillBonus: { combat: 15 }
      }
    },
    {
      name: 'Connected',
      effect: {
        operationBonus: { corruption: 25, recruitment: 10 },
        skillBonus: { diplomacy: 10 }
      }
    }
  ];

  static generateOfficer(rank?: OfficerRank): Officer {
    const names = ['Chan', 'Wong', 'Lee', 'Liu', 'Zhang', 'Huang', 'Lin', 'Chen'];
    const firstNames = ['Big', 'Little', 'Crazy', 'Silent', 'Iron', 'Quick', 'Smart', 'Cold'];
    
    const selectedRank = rank || 'enforcer';
    const rankIndex = this.RANK_HIERARCHY.indexOf(selectedRank);
    
    // Higher ranks have better base skills
    const skillBase = rankIndex * 10 + 30;
    
    const officer: Officer = {
      id: `officer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${names[Math.floor(Math.random() * names.length)]}`,
      rank: selectedRank,
      skills: {
        combat: skillBase + Math.floor(Math.random() * 20),
        diplomacy: skillBase + Math.floor(Math.random() * 20),
        logistics: skillBase + Math.floor(Math.random() * 20),
        intelligence: skillBase + Math.floor(Math.random() * 20)
      },
      loyalty: 50 + Math.floor(Math.random() * 30),
      competence: 40 + Math.floor(Math.random() * 40),
      isAvailable: true,
      currentAssignment: null,
      personalGoals: this.generatePersonalGoals(),
      traits: this.generateTraits()
    };

    return officer;
  }

  private static generatePersonalGoals(): OfficerGoal[] {
    const goalTypes: OfficerGoal['type'][] = ['power', 'wealth', 'respect', 'revenge'];
    const goals: OfficerGoal[] = [];
    
    // Generate 1-3 goals
    const numGoals = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numGoals; i++) {
      const type = goalTypes[Math.floor(Math.random() * goalTypes.length)];
      const priority = 5 + Math.floor(Math.random() * 6);
      
      let description = '';
      switch (type) {
        case 'power':
          description = 'Wants more control and authority';
          break;
        case 'wealth':
          description = 'Seeks financial prosperity';
          break;
        case 'respect':
          description = 'Desires recognition from peers';
          break;
        case 'revenge':
          description = 'Holds grudges against rivals';
          break;
      }
      
      goals.push({ type, priority, description });
    }
    
    return goals;
  }

  private static generateTraits(): OfficerTrait[] {
    const numTraits = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...this.TRAIT_LIBRARY].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numTraits);
  }

  static canPromoteOfficer(officer: Officer, resources: { influence: number; cash: number }): boolean {
    const currentRankIndex = this.RANK_HIERARCHY.indexOf(officer.rank);
    const nextRankIndex = currentRankIndex + 1;
    
    if (nextRankIndex >= this.RANK_HIERARCHY.length) return false; // Already at max rank
    
    const promotionCost = nextRankIndex * 5000;
    const requiredInfluence = nextRankIndex * 20;
    
    return resources.cash >= promotionCost && resources.influence >= requiredInfluence;
  }

  static promoteOfficer(officer: Officer): Officer {
    const currentRankIndex = this.RANK_HIERARCHY.indexOf(officer.rank);
    const nextRankIndex = currentRankIndex + 1;
    
    if (nextRankIndex >= this.RANK_HIERARCHY.length) return officer; // Already at max rank
    
    const newRank = this.RANK_HIERARCHY[nextRankIndex];
    
    return {
      ...officer,
      rank: newRank,
      skills: {
        combat: Math.min(100, officer.skills.combat + 10),
        diplomacy: Math.min(100, officer.skills.diplomacy + 10),
        logistics: Math.min(100, officer.skills.logistics + 10),
        intelligence: Math.min(100, officer.skills.intelligence + 10)
      },
      loyalty: Math.min(100, officer.loyalty + 15),
      competence: Math.min(100, officer.competence + 10)
    };
  }

  static calculateOperationEffectiveness(officer: Officer, operationType: string): number {
    let effectiveness = officer.competence;
    
    // Apply trait bonuses
    officer.traits.forEach(trait => {
      if (trait.effect.operationBonus && trait.effect.operationBonus[operationType as keyof typeof trait.effect.operationBonus]) {
        effectiveness += trait.effect.operationBonus[operationType as keyof typeof trait.effect.operationBonus];
      }
    });
    
    // Apply skill bonuses based on operation type
    switch (operationType) {
      case 'assassination':
      case 'intimidation':
      case 'expansion':
      case 'elimination':
        effectiveness += officer.skills.combat * 0.3;
        break;
      case 'corruption':
      case 'protection':
      case 'recruitment':
        effectiveness += officer.skills.diplomacy * 0.3;
        break;
      case 'smuggling':
      case 'extortion':
      case 'gambling':
        effectiveness += officer.skills.logistics * 0.3;
        break;
      default:
        effectiveness += officer.skills.intelligence * 0.3;
    }
    
    return Math.min(100, Math.floor(effectiveness));
  }

  static updateOfficerLoyalty(officer: Officer, factors: { success?: boolean; failure?: boolean; paid?: boolean; promoted?: boolean }): Officer {
    let loyaltyChange = 0;
    
    if (factors.success) loyaltyChange += 5;
    if (factors.failure) loyaltyChange -= 8;
    if (factors.paid) loyaltyChange += 10;
    if (factors.promoted) loyaltyChange += 20;
    
    // Apply trait modifiers
    officer.traits.forEach(trait => {
      if (trait.effect.loyaltyModifier) {
        loyaltyChange += trait.effect.loyaltyModifier * 0.1;
      }
    });
    
    return {
      ...officer,
      loyalty: Math.max(0, Math.min(100, officer.loyalty + loyaltyChange))
    };
  }

  static checkOfficerSatisfaction(officer: Officer): 'loyal' | 'content' | 'restless' | 'disloyal' {
    if (officer.loyalty >= 75) return 'loyal';
    if (officer.loyalty >= 50) return 'content';
    if (officer.loyalty >= 25) return 'restless';
    return 'disloyal';
  }

  static getOfficerValue(officer: Officer): number {
    const rankValue = this.RANK_HIERARCHY.indexOf(officer.rank) * 1000;
    const skillValue = Object.values(officer.skills).reduce((sum, skill) => sum + skill, 0) * 10;
    const loyaltyValue = officer.loyalty * 5;
    const competenceValue = officer.competence * 8;
    
    return rankValue + skillValue + loyaltyValue + competenceValue;
  }

  static getBestOfficerForOperation(availableOfficers: Officer[], operationType: string): Officer | null {
    if (availableOfficers.length === 0) return null;
    
    return availableOfficers.reduce((best, current) => {
      const currentEffectiveness = this.calculateOperationEffectiveness(current, operationType);
      const bestEffectiveness = this.calculateOperationEffectiveness(best, operationType);
      
      return currentEffectiveness > bestEffectiveness ? current : best;
    });
  }

  static getOfficerDescription(officer: Officer): string {
    const satisfaction = this.checkOfficerSatisfaction(officer);
    const topSkill = Object.entries(officer.skills).reduce((best, [skill, value]) => 
      value > best.value ? { skill, value } : best, { skill: '', value: 0 });
    
    const traitNames = officer.traits.map(t => t.name).join(', ');
    
    return `${officer.name} - ${officer.rank} (${satisfaction}). Best at ${topSkill.skill}. Traits: ${traitNames}`;
  }
}