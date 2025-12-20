import { ResourceState } from './types';

export class ResourceManager {
  static clampResources(resources: Partial<ResourceState>): ResourceState {
    return {
      cash: Math.max(0, resources.cash || 0),
      power: Math.max(0, Math.min(100, resources.power || 0)),
      heat: Math.max(0, Math.min(100, resources.heat || 0)),
      territory: Math.max(0, Math.min(100, resources.territory || 0))
    };
  }

  static canAfford(current: ResourceState, cost: Partial<ResourceState>): boolean {
    return (
      (current.cash >= (cost.cash || 0)) &&
      (current.power >= (cost.power || 0)) &&
      (current.heat + (cost.heat || 0) <= 100) &&
      (current.territory >= (cost.territory || 0))
    );
  }

  static applyCost(current: ResourceState, cost: Partial<ResourceState>): ResourceState {
    const newResources = {
      cash: current.cash - (cost.cash || 0),
      power: current.power - (cost.power || 0),
      heat: current.heat + (cost.heat || 0),
      territory: current.territory - (cost.territory || 0)
    };
    
    return this.clampResources(newResources);
  }

  static applyReward(current: ResourceState, reward: Partial<ResourceState>): ResourceState {
    const newResources = {
      cash: current.cash + (reward.cash || 0),
      power: current.power + (reward.power || 0),
      heat: current.heat + (reward.heat || 0),
      territory: current.territory + (reward.territory || 0)
    };
    
    return this.clampResources(newResources);
  }

  static getResourceDescription(resources: ResourceState): string {
    const status = [];
    
    if (resources.cash < 1000) status.push('low on cash');
    if (resources.power < 30) status.push('weak influence');
    if (resources.heat > 70) status.push('high police attention');
    if (resources.territory < 20) status.push('limited territory');
    if (resources.heat < 20) status.push('low profile');
    if (resources.power > 70) status.push('strong influence');
    if (resources.territory > 60) status.push('extensive territory');
    
    return status.length > 0 ? status.join(', ') : 'stable';
  }

  static getOverallStrength(resources: ResourceState): number {
    return Math.floor(
      (resources.cash / 100) * 0.2 +
      resources.power * 0.4 +
      (100 - resources.heat) * 0.2 +
      resources.territory * 0.2
    );
  }
}