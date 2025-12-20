import { Operation, OperationType, OperationOutcome } from './types';

export const OPERATION_TEMPLATES: Record<OperationType, Omit<Operation, 'id' | 'targetId' | 'assignedOfficerId' | 'progress' | 'status'>> = {
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

export class OperationManager {
  static createOperation(type: OperationType, targetId: string): Operation {
    const template = OPERATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Unknown operation type: ${type}`);
    }

    return {
      ...template,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      targetId,
      assignedOfficerId: null,
      progress: 0,
      status: 'planning'
    };
  }

  static determineOutcome(operation: Operation): OperationOutcome | null {
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

  static canLaunchOperation(operation: Operation, resources: { cash: number; power: number; heat: number }, cost: number): boolean {
    return (
      resources.cash >= cost &&
      resources.power >= operation.requirements.minPower &&
      resources.heat <= operation.requirements.maxHeat
    );
  }

  static upgradeOperation(operation: Operation): Operation {
    return {
      ...operation,
      risk: Math.max(0, operation.risk - 10),
      reward: operation.reward + 10
    };
  }

  static progressOperation(operation: Operation): Operation {
    const progressIncrement = 100 / operation.duration;
    const newProgress = Math.min(100, operation.progress + progressIncrement);
    
    return {
      ...operation,
      progress: newProgress,
      status: newProgress >= 100 ? 'completed' : 'active'
    };
  }
}