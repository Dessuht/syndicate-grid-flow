import { MarketConditions, OperationType } from './types';

export class MarketManager {
  static initializeMarket(): MarketConditions {
    return {
      policeActivity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as MarketConditions['policeActivity'],
      rivalStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as MarketConditions['rivalStrength'],
      publicOpinion: ['hostile', 'neutral', 'sympathetic'][Math.floor(Math.random() * 3)] as MarketConditions['publicOpinion'],
      economy: ['recession', 'stable', 'boom'][Math.floor(Math.random() * 3)] as MarketConditions['economy']
    };
  }

  static updateMarket(): MarketConditions {
    return this.initializeMarket();
  }

  static getOpportunityCosts(marketConditions: MarketConditions): Record<OperationType, number> {
    const baseCosts: Record<OperationType, number> = {
      extortion: 500,
      smuggling: 2000,
      gambling: 300,
      protection: 200,
      assassination: 5000,
      intimidation: 100,
      bribery: 1000,
      recruitment: 800,
      territory_expansion: 3000,
      rival_elimination: 8000
    };

    // Apply market modifiers
    const modifiers = this.getMarketModifiers(marketConditions);
    
    return Object.entries(baseCosts).reduce((acc, [operation, cost]) => {
      acc[operation as OperationType] = Math.floor(cost * modifiers.costMultiplier);
      return acc;
    }, {} as Record<OperationType, number>);
  }

  static getMarketModifiers(marketConditions: MarketConditions) {
    let costMultiplier = 1;
    let riskMultiplier = 1;
    let rewardMultiplier = 1;

    // Economy affects costs
    switch (marketConditions.economy) {
      case 'recession':
        costMultiplier *= 0.8;
        rewardMultiplier *= 0.7;
        break;
      case 'boom':
        costMultiplier *= 1.3;
        rewardMultiplier *= 1.4;
        break;
    }

    // Police activity affects risk and costs
    switch (marketConditions.policeActivity) {
      case 'high':
        costMultiplier *= 1.2;
        riskMultiplier *= 1.3;
        break;
      case 'low':
        costMultiplier *= 0.9;
        riskMultiplier *= 0.8;
        break;
    }

    // Rival strength affects rewards and risks
    switch (marketConditions.rivalStrength) {
      case 'strong':
        riskMultiplier *= 1.2;
        rewardMultiplier *= 1.3;
        break;
      case 'weak':
        riskMultiplier *= 0.8;
        rewardMultiplier *= 0.9;
        break;
    }

    // Public opinion affects heat generation
    let heatMultiplier = 1;
    switch (marketConditions.publicOpinion) {
      case 'hostile':
        heatMultiplier *= 1.5;
        break;
      case 'sympathetic':
        heatMultiplier *= 0.7;
        break;
    }

    return {
      costMultiplier,
      riskMultiplier,
      rewardMultiplier,
      heatMultiplier
    };
  }

  static getMarketDescription(marketConditions: MarketConditions): string {
    const { policeActivity, rivalStrength, publicOpinion, economy } = marketConditions;
    
    const policeDesc = policeActivity === 'high' ? 'intense' : policeActivity === 'low' ? 'minimal' : 'moderate';
    const rivalDesc = rivalStrength === 'strong' ? 'formidable' : rivalStrength === 'weak' ? 'diminished' : 'moderate';
    const publicDesc = publicOpinion === 'hostile' ? 'hostile' : publicOpinion === 'sympathetic' ? 'sympathetic' : 'neutral';
    const economyDesc = economy === 'recession' ? 'struggling' : economy === 'boom' ? 'thriving' : 'stable';
    
    return `The market is ${economyDesc} with ${policeDesc} police activity. Rivals are ${rivalDesc} and public opinion is ${publicDesc}.`;
  }
}