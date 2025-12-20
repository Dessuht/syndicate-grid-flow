import { Character, CharacterAction, ActionDecision, Relationship } from '@/types/character';

export class AutonomousBehaviorSystem {
  private characters: Map<string, Character> = new Map();
  private currentTime: number = 0;
  
  addCharacter(character: Character): void {
    this.characters.set(character.id, character);
  }
  
  removeCharacter(characterId: string): void {
    this.characters.delete(characterId);
  }
  
  updateTime(deltaTime: number): void {
    this.currentTime += deltaTime;
  }
  
  updateAllCharacters(): Map<string, CharacterAction> {
    const actions = new Map<string, CharacterAction>();
    
    for (const character of this.characters.values()) {
      if (!this.shouldUpdateCharacter(character)) {
        if (character.currentAction) {
          actions.set(character.id, character.currentAction);
        }
        continue;
      }
      
      const decision = this.makeDecision(character);
      if (decision) {
        character.currentAction = decision.action;
        actions.set(character.id, decision.action);
        this.executeAction(character, decision.action);
      }
    }
    
    return actions;
  }
  
  private shouldUpdateCharacter(character: Character): boolean {
    // Update if no current action or action is complete
    if (!character.currentAction) return true;
    
    const actionEndTime = character.currentAction.startTime + character.currentAction.duration;
    return this.currentTime >= actionEndTime;
  }
  
  private makeDecision(character: Character): ActionDecision | null {
    const decisions = this.generatePossibleActions(character);
    
    if (decisions.length === 0) return null;
    
    // Weight decisions based on character traits, needs, and current situation
    const weightedDecisions = decisions.map(decision => ({
      ...decision,
      score: this.calculateActionScore(character, decision)
    }));
    
    // Sort by score and select the best action
    weightedDecisions.sort((a, b) => b.score - a.score);
    
    return weightedDecisions[0];
  }
  
  private generatePossibleActions(character: Character): ActionDecision[] {
    const decisions: ActionDecision[] = [];
    
    // Check most urgent need first
    const mostUrgentNeed = this.getMostUrgentNeed(character);
    
    switch (mostUrgentNeed) {
      case 'safety':
        decisions.push(this.generateSafetyAction(character));
        break;
      case 'respect':
        decisions.push(this.generateRespectAction(character));
        break;
      case 'wealth':
        decisions.push(this.generateWealthAction(character));
        break;
      case 'power':
        decisions.push(this.generatePowerAction(character));
        break;
      case 'belonging':
        decisions.push(this.generateBelongingAction(character));
        break;
      default:
        // Generate random actions when needs are met
        decisions.push(...this.generateLeisureActions(character));
        break;
    }
    
    // Always include work/management if assigned
    if (character.assignedBuilding) {
      decisions.push({
        action: {
          id: `work_${this.currentTime}_${character.id}`,
          type: 'working',
          description: `Managing operations at ${character.assignedBuilding}`,
          duration: 4,
          startTime: this.currentTime,
          targetLocation: character.assignedBuilding,
          priority: 5
        },
        reasoning: 'Assigned duties require attention',
        confidence: character.stats.competence
      });
    }
    
    return decisions;
  }
  
  private getMostUrgentNeed(character: Character): keyof typeof character.needs | null {
    let mostUrgent: keyof typeof character.needs | null = null;
    let lowestValue = 100;
    
    for (const [need, value] of Object.entries(character.needs)) {
      if (value < lowestValue) {
        lowestValue = value;
        mostUrgent = need as keyof typeof character.needs;
      }
    }
    
    return lowestValue < 50 ? mostUrgent : null;
  }
  
  private generateSafetyAction(character: Character): ActionDecision {
    const actions = [
      {
        action: {
          id: `patrol_${this.currentTime}_${character.id}`,
          type: 'patrolling' as const,
          description: 'Increasing security in the area',
          duration: 3,
          startTime: this.currentTime,
          targetLocation: character.location || 'headquarters',
          priority: 8
        },
        reasoning: 'Low safety needs driving security patrols',
        confidence: 70
      },
      {
        action: {
          id: `train_${this.currentTime}_${character.id}`,
          type: 'training' as const,
          description: 'Training to improve combat skills',
          duration: 2,
          startTime: this.currentTime,
          priority: 7
        },
        reasoning: 'Building personal security through skill improvement',
        confidence: 60
      }
    ];
    
    return Math.random() > 0.5 ? actions[0] : actions[1];
  }
  
  private generateRespectAction(character: Character): ActionDecision {
    const actions = [
      {
        action: {
          id: `social_${this.currentTime}_${character.id}`,
          type: 'socializing' as const,
          description: 'Building relationships with subordinates',
          duration: 2,
          startTime: this.currentTime,
          priority: 6
        },
        reasoning: 'Low respect needs driving social interaction',
        confidence: 75
      },
      {
        action: {
          id: `intimidate_${this.currentTime}_${character.id}`,
          type: 'patrolling' as const,
          description: 'Showing strength to earn respect',
          duration: 1,
          startTime: this.currentTime,
          priority: 7
        },
        reasoning: 'Using intimidation to gain respect',
        confidence: character.stats.ruthlessness > 50 ? 80 : 40
      }
    ];
    
    return Math.random() > 0.5 ? actions[0] : actions[1];
  }
  
  private generateWealthAction(character: Character): ActionDecision {
    const actions = [
      {
        action: {
          id: `gamble_${this.currentTime}_${character.id}`,
          type: 'socializing' as const,
          description: 'Visiting mahjong parlor to win money',
          duration: 3,
          startTime: this.currentTime,
          targetLocation: 'mahjong_parlor',
          priority: 5
        },
        reasoning: 'Seeking wealth through gambling',
        confidence: 60
      },
      {
        action: {
          id: `side_business_${this.currentTime}_${character.id}`,
          type: 'working' as const,
          description: 'Running personal side business',
          duration: 4,
          startTime: this.currentTime,
          priority: 6
        },
        reasoning: 'Building wealth through personal enterprise',
        confidence: character.stats.competence * 0.8
      },
      {
        action: {
          id: `extort_${this.currentTime}_${character.id}`,
          type: 'patrolling' as const,
          description: 'Collecting protection money',
          duration: 2,
          startTime: this.currentTime,
          priority: 7
        },
        reasoning: 'Using power to generate wealth',
        confidence: character.stats.ruthlessness > 40 ? 70 : 30
      }
    ];
    
    return actions[Math.floor(Math.random() * actions.length)];
  }
  
  private generatePowerAction(character: Character): ActionDecision {
    const actions = [
      {
        action: {
          id: `plot_${this.currentTime}_${character.id}`,
          type: 'plotting' as const,
          description: 'Planning ways to increase influence',
          duration: 4,
          startTime: this.currentTime,
          priority: 8
        },
        reasoning: 'High ambition driving political maneuvering',
        confidence: character.stats.ambition * 0.9
      },
      {
        action: {
          id: `recruit_${this.currentTime}_${character.id}`,
          type: 'recruiting' as const,
          description: 'Building personal power base through recruitment',
          duration: 3,
          startTime: this.currentTime,
          priority: 7
        },
        reasoning: 'Expanding influence through loyal followers',
        confidence: character.stats.charisma * 0.8
      }
    ];
    
    return Math.random() > 0.5 ? actions[0] : actions[1];
  }
  
  private generateBelongingAction(character: Character): ActionDecision {
    const friends = Object.entries(character.relationships)
      .filter(([_, rel]) => rel.type === 'friendship' && rel.strength > 30)
      .map(([id, _]) => id);
    
    if (friends.length > 0) {
      const targetFriend = friends[Math.floor(Math.random() * friends.length)];
      return {
        action: {
          id: `friend_time_${this.currentTime}_${character.id}`,
          type: 'socializing' as const,
          description: `Meeting with friend`,
          duration: 2,
          startTime: this.currentTime,
          targetCharacter: targetFriend,
          priority: 6
        },
        reasoning: 'Seeking social connection with friends',
        confidence: 80
      };
    }
    
    // No friends - seek new connections
    return {
      action: {
        id: `socialize_${this.currentTime}_${character.id}`,
        type: 'socializing' as const,
        description: 'Building new relationships',
        duration: 2,
        startTime: this.currentTime,
        targetLocation: 'nightclub',
        priority: 5
      },
      reasoning: 'Loneliness driving need for new connections',
      confidence: 60
    };
  }
  
  private generateLeisureActions(character: Character): ActionDecision[] {
    const decisions: ActionDecision[] = [];
    
    // Gambling for excitement
    if (character.needs.wealth < 70 || Math.random() > 0.6) {
      decisions.push({
        action: {
          id: `gamble_${this.currentTime}_${character.id}`,
          type: 'socializing' as const,
          description: 'Playing cards for excitement',
          duration: 2,
          startTime: this.currentTime,
          targetLocation: 'mahjong_parlor',
          priority: 3
        },
        reasoning: 'Seeking excitement through gambling',
        confidence: 50
      });
    }
    
    // Nightclub for entertainment
    if (Math.random() > 0.5) {
      decisions.push({
        action: {
          id: `nightclub_${this.currentTime}_${character.id}`,
          type: 'socializing' as const,
          description: 'Visiting nightclub for entertainment',
          duration: 3,
          startTime: this.currentTime,
          targetLocation: 'nightclub',
          priority: 3
        },
        reasoning: 'Seeking entertainment and social interaction',
        confidence: 55
      });
    }
    
    // Pick fights for excitement (ruthless characters)
    if (character.stats.ruthlessness > 60 && Math.random() > 0.7) {
      decisions.push({
        action: {
          id: `fight_${this.currentTime}_${character.id}`,
          type: 'patrolling' as const,
          description: 'Looking for trouble to prove toughness',
          duration: 1,
          startTime: this.currentTime,
          priority: 4
        },
        reasoning: 'Thrill-seeking through confrontation',
        confidence: character.stats.ruthlessness
      });
    }
    
    // Rest when tired
    if (Math.random() > 0.4) {
      decisions.push({
        action: {
          id: `rest_${this.currentTime}_${character.id}`,
          type: 'resting' as const,
          description: 'Taking it easy to recover',
          duration: 2,
          startTime: this.currentTime,
          priority: 2
        },
        reasoning: 'Basic rest and recovery',
        confidence: 40
      });
    }
    
    return decisions;
  }
  
  private calculateActionScore(character: Character, decision: ActionDecision): number {
    let score = decision.confidence;
    
    // Adjust based on character traits
    score += character.stats.ambition * 0.3;
    score += character.stats.competence * 0.2;
    score += character.stats.charisma * 0.1;
    
    // Adjust based on needs urgency
    const urgentNeeds = Object.entries(character.needs)
      .filter(([_, value]) => value < 30)
      .length;
    score += urgentNeeds * 15;
    
    // Adjust based on mood
    if (character.mood === 'ambitious' && decision.action.type === 'plotting') score += 20;
    if (character.mood === 'disloyal' && decision.action.type === 'socializing') score -= 10;
    if (character.mood === 'loyal' && decision.action.type === 'working') score += 15;
    
    // Adjust based on current loyalty to player
    if (character.stats.loyalty < 40 && decision.action.type === 'working') score -= 25;
    if (character.stats.loyalty < 30 && decision.action.type === 'plotting') score += 30;
    
    return score;
  }
  
  private executeAction(character: Character, action: CharacterAction): void {
    // Update character based on action
    switch (action.type) {
      case 'working':
        character.needs.wealth += 15;
        character.needs.respect += 5;
        character.needs.safety -= 5;
        break;
      case 'socializing':
        character.needs.belonging += 20;
        character.needs.respect += 10;
        break;
      case 'training':
        character.skills.combat += 2;
        character.needs.safety += 10;
        character.needs.power += 5;
        break;
      case 'patrolling':
        character.needs.safety += 15;
        character.needs.respect += 8;
        character.needs.power += 5;
        break;
      case 'plotting':
        character.needs.power += 20;
        character.stats.loyalty -= 5;
        break;
      case 'resting':
        // Recover all needs slightly
        Object.keys(character.needs).forEach(need => {
          character.needs[need as keyof typeof character.needs] += 10;
        });
        break;
      case 'recruiting':
        character.needs.power += 15;
        character.needs.belonging += 10;
        character.needs.respect += 5;
        break;
      case 'gathering_intel':
        character.skills.intelligence += 1;
        character.needs.power += 10;
        character.needs.safety += 5;
        break;
    }
    
    // Clamp needs to 0-100
    Object.keys(character.needs).forEach(need => {
      character.needs[need as keyof typeof character.needs] = 
        Math.max(0, Math.min(100, character.needs[need as keyof typeof character.needs]));
    });
    
    // Update mood based on recent actions and needs
    this.updateMood(character);
  }
  
  private updateMood(character: Character): void {
    const avgNeedSatisfaction = Object.values(character.needs)
      .reduce((sum, val) => sum + val, 0) / Object.keys(character.needs).length;
    
    if (character.stats.loyalty < 20) {
      character.mood = 'disloyal';
    } else if (character.stats.ambition > 80 && character.needs.power < 40) {
      character.mood = 'ambitious';
    } else if (avgNeedSatisfaction < 30) {
      character.mood = 'desperate';
    } else if (character.stats.loyalty > 70 && avgNeedSatisfaction > 60) {
      character.mood = 'loyal';
    } else if (avgNeedSatisfaction > 70) {
      character.mood = 'content';
    } else {
      character.mood = 'restless';
    }
  }
}