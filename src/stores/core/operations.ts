import { Operation, OperationType, OperationRequirements, OperationRewards, OperationRisks } from './types';

export class OperationSystem {
  // Operation templates with clear risk/reward profiles
  private static readonly OPERATION_TEMPLATES: Record<OperationType, Omit<Operation, 'id' | 'status' | 'assignedAssets'>> = {
    extortion: {
      name: 'Protection Racket',
      description: 'Extract protection money from local businesses',
      type: 'extortion',
      difficulty: 3,
      riskLevel: 4,
      requirements: { minInfluence: 10, minManpower: 2, maxHeat: 70 },
      potentialRewards: {
        cash: { min: 1000, max: 3000 },
        influence: { min: 2, max: 5 },
        territory: { min: 0, max: 2 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 0, max: 500 },
        influenceLoss: { min: 0, max: 3 },
        heatIncrease: { min: 5, max: 15 },
        manpowerLoss: { min: 0, max: 1 }
      },
      duration: 2
    },
    smuggling: {
      name: 'Contraband Smuggling',
      description: 'Move illegal goods through the docks',
      type: 'smuggling',
      difficulty: 6,
      riskLevel: 7,
      requirements: { minInfluence: 25, minManpower: 4, maxHeat: 60 },
      potentialRewards: {
        cash: { min: 3000, max: 8000 },
        influence: { min: 5, max: 10 },
        territory: { min: 0, max: 3 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 1000, max: 4000 },
        influenceLoss: { min: 3, max: 8 },
        heatIncrease: { min: 15, max: 30 },
        manpowerLoss: { min: 1, max: 3 }
      },
      duration: 3
    },
    gambling: {
      name: 'Underground Casino',
      description: 'Run illegal gambling operations',
      type: 'gambling',
      difficulty: 2,
      riskLevel: 3,
      requirements: { minInfluence: 5, minManpower: 2, maxHeat: 80 },
      potentialRewards: {
        cash: { min: 800, max: 2000 },
        influence: { min: 1, max: 3 },
        territory: { min: 0, max: 1 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 0, max: 400 },
        influenceLoss: { min: 0, max: 2 },
        heatIncrease: { min: 3, max: 10 },
        manpowerLoss: { min: 0, max: 1 }
      },
      duration: 1
    },
    protection: {
      name: 'Protection Services',
      description: 'Offer protection to businesses and residents',
      type: 'protection',
      difficulty: 2,
      riskLevel: 2,
      requirements: { minInfluence: 8, minManpower: 3, maxHeat: 50 },
      potentialRewards: {
        cash: { min: 600, max: 1500 },
        influence: { min: 3, max: 7 },
        territory: { min: 1, max: 3 },
        heatReduction: 2
      },
      potentialRisks: {
        cashLoss: { min: 0, max: 300 },
        influenceLoss: { min: 1, max: 4 },
        heatIncrease: { min: 2, max: 8 },
        manpowerLoss: { min: 0, max: 1 }
      },
      duration: 2
    },
    assassination: {
      name: 'Target Elimination',
      description: 'Eliminate a high-value target',
      type: 'assassination',
      difficulty: 9,
      riskLevel: 10,
      requirements: { minInfluence: 60, minManpower: 6, maxHeat: 40 },
      potentialRewards: {
        cash: { min: 5000, max: 15000 },
        influence: { min: 15, max: 30 },
        territory: { min: 5, max: 15 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 2000, max: 8000 },
        influenceLoss: { min: 10, max: 25 },
        heatIncrease: { min: 25, max: 50 },
        manpowerLoss: { min: 2, max: 6 }
      },
      duration: 4
    },
    intimidation: {
      name: 'Muscle Flex',
      description: 'Show force to assert dominance',
      type: 'intimidation',
      difficulty: 4,
      riskLevel: 5,
      requirements: { minInfluence: 20, minManpower: 4, maxHeat: 60 },
      potentialRewards: {
        cash: { min: 500, max: 1500 },
        influence: { min: 5, max: 12 },
        territory: { min: 3, max: 8 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 200, max: 800 },
        influenceLoss: { min: 2, max: 6 },
        heatIncrease: { min: 8, max: 20 },
        manpowerLoss: { min: 0, max: 2 }
      },
      duration: 1
    },
    corruption: {
      name: 'Official Corruption',
      description: 'Bribe officials for favors and information',
      type: 'corruption',
      difficulty: 5,
      riskLevel: 6,
      requirements: { minInfluence: 30, minManpower: 2, maxHeat: 70 },
      potentialRewards: {
        cash: { min: 0, max: 1000 },
        influence: { min: 8, max: 20 },
        territory: { min: 0, max: 2 },
        heatReduction: 10
      },
      potentialRisks: {
        cashLoss: { min: 1000, max: 3000 },
        influenceLoss: { min: 5, max: 15 },
        heatIncrease: { min: 10, max: 25 },
        manpowerLoss: { min: 0, max: 1 }
      },
      duration: 2
    },
    recruitment: {
      name: 'Talent Acquisition',
      description: 'Recruit new officers and soldiers',
      type: 'recruitment',
      difficulty: 3,
      riskLevel: 2,
      requirements: { minInfluence: 15, minManpower: 1, maxHeat: 90 },
      potentialRewards: {
        cash: { min: 0, max: 500 },
        influence: { min: 2, max: 6 },
        territory: { min: 0, max: 1 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 500, max: 1500 },
        influenceLoss: { min: 1, max: 3 },
        heatIncrease: { min: 2, max: 8 },
        manpowerLoss: { min: 0, max: 0 }
      },
      duration: 3
    },
    expansion: {
      name: 'Territory Takeover',
      description: 'Expand control into new areas',
      type: 'expansion',
      difficulty: 8,
      riskLevel: 9,
      requirements: { minInfluence: 50, minManpower: 8, maxHeat: 50 },
      potentialRewards: {
        cash: { min: 2000, max: 6000 },
        influence: { min: 10, max: 25 },
        territory: { min: 10, max: 25 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 1500, max: 5000 },
        influenceLoss: { min: 8, max: 20 },
        heatIncrease: { min: 20, max: 40 },
        manpowerLoss: { min: 3, max: 8 }
      },
      duration: 5
    },
    elimination: {
      name: 'Gang War',
      description: 'All-out war to eliminate rival gang',
      type: 'elimination',
      difficulty: 10,
      riskLevel: 10,
      requirements: { minInfluence: 70, minManpower: 10, maxHeat: 30 },
      potentialRewards: {
        cash: { min: 8000, max: 20000 },
        influence: { min: 25, max: 50 },
        territory: { min: 20, max: 40 },
        heatReduction: 0
      },
      potentialRisks: {
        cashLoss: { min: 5000, max: 15000 },
        influenceLoss: { min: 15, max: 40 },
        heatIncrease: { min: 30, max: 60 },
        manpowerLoss: { min: 5, max: 15 }
      },
      duration: 7
    }
  };

  static createOperation(type: OperationType): Operation {
    const template = this.OPERATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Unknown operation type: ${type}`);
    }

    return {
      ...template,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'available',
      assignedAssets: []
    };
  }

  static canLaunchOperation(operation: Operation, resources: { cash: number; influence: number; heat: number; manpower: number }): boolean {
    return (
      resources.influence >= operation.requirements.minInfluence &&
      resources.manpower >= operation.requirements.minManpower &&
      resources.heat <= operation.requirements.maxHeat
    );
  }

  static executeOperation(operation: Operation, assignedOfficers: any[]): OperationResult {
    // Calculate success chance based on officer competence and operation difficulty
    const avgCompetence = assignedOfficers.reduce((sum, officer) => sum + (officer.competence || 50), 0) / Math.max(assignedOfficers.length, 1);
    const successChance = Math.max(10, Math.min(90, (avgCompetence / 100) * (100 - operation.difficulty * 5)));
    
    const isSuccess = Math.random() * 100 < successChance;
    
    if (isSuccess) {
      return this.generateSuccessResult(operation);
    } else {
      return this.generateFailureResult(operation);
    }
  }

  private static generateSuccessResult(operation: Operation): OperationResult {
    const rewards = operation.potentialRewards;
    
    return {
      success: true,
      cash: this.randomInRange(rewards.cash.min, rewards.cash.max),
      influence: this.randomInRange(rewards.influence.min, rewards.influence.max),
      territory: this.randomInRange(rewards.territory.min, rewards.territory.max),
      heatReduction: rewards.heatReduction || 0,
      heatIncrease: 0,
      manpowerLoss: 0,
      message: `Operation successful: ${operation.name}`
    };
  }

  private static generateFailureResult(operation: Operation): OperationResult {
    const risks = operation.potentialRisks;
    
    return {
      success: false,
      cash: -this.randomInRange(risks.cashLoss.min, risks.cashLoss.max),
      influence: -this.randomInRange(risks.influenceLoss.min, risks.influenceLoss.max),
      territory: 0,
      heatReduction: 0,
      heatIncrease: this.randomInRange(risks.heatIncrease.min, risks.heatIncrease.max),
      manpowerLoss: this.randomInRange(risks.manpowerLoss.min, risks.manpowerLoss.max),
      message: `Operation failed: ${operation.name}`
    };
  }

  private static randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getAvailableOperations(resources: { influence: number; heat: number; manpower: number }): Operation[] {
    return Object.values(this.OPERATION_TEMPLATES)
      .filter(template => 
        resources.influence >= template.requirements.minInfluence &&
        resources.manpower >= template.requirements.minManpower &&
        resources.heat <= template.requirements.maxHeat
      )
      .map(template => this.createOperation(template.type));
  }

  static getOperationDescription(operation: Operation): string {
    const riskLevel = operation.riskLevel <= 3 ? 'Low' : operation.riskLevel <= 7 ? 'Medium' : 'High';
    const difficulty = operation.difficulty <= 3 ? 'Easy' : operation.difficulty <= 7 ? 'Medium' : 'Hard';
    
    return `${operation.description} (Risk: ${riskLevel}, Difficulty: ${difficulty})`;
  }
}

export interface OperationResult {
  success: boolean;
  cash: number;
  influence: number;
  territory: number;
  heatReduction: number;
  heatIncrease: number;
  manpowerLoss: number;
  message: string;
}