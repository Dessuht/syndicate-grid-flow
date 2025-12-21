import { StrategicObjective, ObjectiveReward } from './types';

export class ObjectiveSystem {
  private static readonly BASE_OBJECTIVES: Omit<StrategicObjective, 'id' | 'currentValue' | 'isCompleted'>[] = [
    {
      name: 'Economic Control',
      description: 'Establish financial dominance over the district',
      targetValue: 50000,
      deadline: 12,
      rewards: {
        cash: 10000,
        influence: 20,
        specialUnlock: 'High-Rank Operations'
      }
    },
    {
      name: 'Territory Expansion',
      description: 'Control 60% of Kowloon territory',
      targetValue: 60,
      deadline: 16,
      rewards: {
        territory: 15,
        influence: 25,
        specialUnlock: 'Underboss Rank'
      }
    },
    {
      name: 'Power Projection',
      description: 'Achieve 80 influence in the criminal underworld',
      targetValue: 80,
      deadline: 20,
      rewards: {
        influence: 30,
        cash: 15000,
        specialUnlock: 'Boss Rank'
      }
    },
    {
      name: 'Stealth Empire',
      description: 'Build a powerful organization while keeping heat under 40',
      targetValue: 40,
      deadline: 24,
      rewards: {
        heatReduction: 20,
        influence: 15,
        specialUnlock: 'Police Protection'
      }
    },
    {
      name: 'Manpower Builder',
      description: 'Build a force of 20 loyal officers',
      targetValue: 20,
      deadline: 18,
      rewards: {
        manpower: 10,
        influence: 10,
        specialUnlock: 'Elite Training'
      }
    }
  ];

  static initializeObjectives(): StrategicObjective[] {
    return this.BASE_OBJECTIVES.map((obj, index) => ({
      ...obj,
      id: `objective-${index}`,
      currentValue: 0,
      isCompleted: false
    }));
  }

  static updateObjectiveProgress(
    objectives: StrategicObjective[], 
    resources: { cash: number; influence: number; territory: number; heat: number; manpower: number }
  ): StrategicObjective[] {
    return objectives.map(objective => {
      if (objective.isCompleted) return objective;

      let currentValue = 0;
      
      switch (objective.name) {
        case 'Economic Control':
          currentValue = resources.cash;
          break;
        case 'Territory Expansion':
          currentValue = resources.territory;
          break;
        case 'Power Projection':
          currentValue = resources.influence;
          break;
        case 'Stealth Empire':
          currentValue = Math.max(0, 100 - resources.heat); // Lower heat = higher progress
          break;
        case 'Manpower Builder':
          currentValue = resources.manpower;
          break;
      }

      return {
        ...objective,
        currentValue,
        isCompleted: currentValue >= objective.targetValue
      };
    });
  }

  static getCompletedObjectives(objectives: StrategicObjective[]): StrategicObjective[] {
    return objectives.filter(obj => obj.isCompleted);
  }

  static getOverdueObjectives(objectives: StrategicObjective[], currentWeek: number): StrategicObjective[] {
    return objectives.filter(obj => !obj.isCompleted && currentWeek > obj.deadline);
  }

  static getUpcomingDeadlines(objectives: StrategicObjective[], currentWeek: number): StrategicObjective[] {
    return objectives
      .filter(obj => !obj.isCompleted)
      .filter(obj => obj.deadline - currentWeek <= 4 && obj.deadline - currentWeek > 0)
      .sort((a, b) => a.deadline - b.deadline);
  }

  static calculateObjectiveRewards(objectives: StrategicObjective[]): ObjectiveReward {
    return objectives
      .filter(obj => obj.isCompleted)
      .reduce((total: ObjectiveReward, obj) => ({
        cash: (total.cash || 0) + (obj.rewards.cash || 0),
        influence: (total.influence || 0) + (obj.rewards.influence || 0),
        territory: (total.territory || 0) + (obj.rewards.territory || 0),
        specialUnlock: [...(total.specialUnlock || []), ...(obj.rewards.specialUnlock ? [obj.rewards.specialUnlock] : [])].join(', '),
        heatReduction: (total.heatReduction || 0) + (obj.rewards.heatReduction || 0),
        manpower: (total.manpower || 0) + (obj.rewards.manpower || 0)
      }), { cash: 0, influence: 0, territory: 0, specialUnlock: '', heatReduction: 0, manpower: 0 });
  }

  static generateNewObjective(currentWeek: number): StrategicObjective | null {
    // Generate dynamic objectives based on game state
    const dynamicObjectives: Omit<StrategicObjective, 'id' | 'currentValue' | 'isCompleted'>[] = [
      {
        name: 'Quick Cash',
        description: 'Generate 10000 cash in 2 weeks',
        targetValue: 10000,
        deadline: currentWeek + 2,
        rewards: { cash: 2000, influence: 5 }
      },
      {
        name: 'Heat Management',
        description: 'Reduce heat to under 30',
        targetValue: 30,
        deadline: currentWeek + 3,
        rewards: { heatReduction: 15, influence: 8 }
      },
      {
        name: 'Influence Push',
        description: 'Reach 60 influence',
        targetValue: 60,
        deadline: currentWeek + 4,
        rewards: { influence: 15, cash: 5000 }
      }
    ];

    if (Math.random() < 0.3) { // 30% chance each week
      const template = dynamicObjectives[Math.floor(Math.random() * dynamicObjectives.length)];
      return {
        ...template,
        id: `dynamic-${Date.now()}`,
        currentValue: 0,
        isCompleted: false
      };
    }

    return null;
  }

  static getProgressPercentage(objective: StrategicObjective): number {
    return Math.min(100, Math.floor((objective.currentValue / objective.targetValue) * 100));
  }

  static getTimeRemaining(objective: StrategicObjective, currentWeek: number): number {
    return Math.max(0, objective.deadline - currentWeek);
  }

  static getObjectiveStatus(objective: StrategicObjective, currentWeek: number): 'completed' | 'overdue' | 'urgent' | 'normal' {
    if (objective.isCompleted) return 'completed';
    if (currentWeek > objective.deadline) return 'overdue';
    if (objective.deadline - currentWeek <= 2) return 'urgent';
    return 'normal';
  }
}