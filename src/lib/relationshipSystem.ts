import { OfficerRelationship, SharedMemory, Grudge, SocialInteraction, SocialFeedEntry } from '@/types/relationships';
import { Officer } from '@/stores/gameStoreTypes';

export class RelationshipSystem {
  private relationships: Map<string, Map<string, OfficerRelationship>> = new Map();
  private socialFeed: SocialFeedEntry[] = [];
  private pendingInteractions: SocialInteraction[] = [];

  constructor(officers: Officer[]) {
    this.initializeRelationships(officers);
  }

  private initializeRelationships(officers: Officer[]) {
    officers.forEach(officer => {
      this.relationships.set(officer.id, new Map());
      
      officers.forEach(otherOfficer => {
        if (officer.id !== otherOfficer.id) {
          const baseRelationship = this.calculateBaseRelationship(officer, otherOfficer);
          this.relationships.get(officer.id)!.set(otherOfficer.id, baseRelationship);
        }
      });
    });
  }

  private calculateBaseRelationship(officer1: Officer, officer2: Officer): OfficerRelationship {
    let relationship = 0;
    let respect = 50;
    let interest = Math.random() * 20; // Base romantic interest

    // Rank-based respect
    const rankHierarchy = ['Blue Lantern', 'Straw Sandal', 'White Paper Fan', 'Red Pole', 'Deputy (438)', 'Dragonhead (489)'];
    const rankDiff = rankHierarchy.indexOf(officer2.rank) - rankHierarchy.indexOf(officer1.rank);
    respect += Math.max(-20, Math.min(20, rankDiff * 5));

    // Trait compatibility
    if (officer1.traits.includes('Loyal Dog') && officer2.traits.includes('Loyal Dog')) {
      relationship += 15;
      respect += 10;
    }
    if (officer1.traits.includes('Ambitious') && officer2.traits.includes('Ambitious')) {
      relationship -= 10; // Rivalry
    }
    if (officer1.traits.includes('Hot-headed') && officer2.traits.includes('Calculating')) {
      relationship -= 15;
    }

    // Likes/Dislikes compatibility
    officer1.likes.forEach(like => {
      if (officer2.likes.includes(like)) relationship += 10;
    });
    officer1.dislikes.forEach(dislike => {
      if (officer2.likes.includes(dislike as any)) relationship -= 10;
    });

    // Random factor
    relationship += Math.floor(Math.random() * 20) - 10;
    respect += Math.floor(Math.random() * 20) - 10;

    return {
      relationship: Math.max(-100, Math.min(100, relationship)),
      interest: Math.max(0, Math.min(100, interest)),
      respect: Math.max(0, Math.min(100, respect)),
      isFriend: relationship > 25,
      isEnemy: relationship < -25,
      isMortalEnemy: relationship < -50,
      isLover: false,
      isInLove: false,
      sharedMemories: [],
      grudges: []
    };
  }

  public getRelationship(officerId: string, targetId: string): OfficerRelationship | null {
    return this.relationships.get(officerId)?.get(targetId) || null;
  }

  public updateRelationship(officerId: string, targetId: string, updates: Partial<OfficerRelationship>) {
    const relationship = this.relationships.get(officerId)?.get(targetId);
    if (relationship) {
      Object.assign(relationship, updates);
      this.updateRelationshipFlags(relationship);
    }
  }

  private updateRelationshipFlags(relationship: OfficerRelationship) {
    relationship.isFriend = relationship.relationship > 25;
    relationship.isEnemy = relationship.relationship < -25;
    relationship.isMortalEnemy = relationship.relationship < -50;
    relationship.isInLove = relationship.interest > 70 && relationship.relationship > 40;
  }

  public addSharedMemory(officerId: string, targetId: string, memory: SharedMemory) {
    const relationship = this.getRelationship(officerId, targetId);
    if (relationship) {
      relationship.sharedMemories.push(memory);
      // Keep only last 20 memories
      if (relationship.sharedMemories.length > 20) {
        relationship.sharedMemories = relationship.sharedMemories.slice(-20);
      }
    }
  }

  public addGrudge(officerId: string, targetId: string, grudge: Grudge) {
    const relationship = this.getRelationship(officerId, targetId);
    if (relationship) {
      relationship.grudges.push(grudge);
      relationship.relationship -= grudge.severity / 2;
      this.updateRelationshipFlags(relationship);
    }
  }

  public createInteraction(
    type: SocialInteraction['type'],
    initiatorId: string,
    targetId: string,
    location: string
  ): SocialInteraction | null {
    const initiatorRelationship = this.getRelationship(initiatorId, targetId);
    const targetRelationship = this.getRelationship(targetId, initiatorId);

    if (!initiatorRelationship || !targetRelationship) return null;

    const interaction: SocialInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      participants: [initiatorId, targetId],
      initiatorId,
      targetId,
      timestamp: Date.now(),
      location,
      outcome: {
        success: false,
        relationshipChange: 0,
        interestChange: 0,
        respectChange: 0
      }
    };

    // Process interaction based on type
    this.processInteraction(interaction, initiatorRelationship, targetRelationship);
    
    return interaction;
  }

  private processInteraction(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    switch (interaction.type) {
      case 'DEEP_CONVERSATION':
        this.processDeepConversation(interaction, initiatorRel, targetRel);
        break;
      case 'JOKE_TELLING':
        this.processJokeTelling(interaction, initiatorRel, targetRel);
        break;
      case 'FLIRTATION':
        this.processFlirtation(interaction, initiatorRel, targetRel);
        break;
      case 'ARGUMENT':
        this.processArgument(interaction, initiatorRel, targetRel);
        break;
      case 'INTRIGUE':
        this.processIntrigue(interaction, initiatorRel, targetRel);
        break;
      case 'FLATTERY_GIFT':
        this.processFlatteryGift(interaction, initiatorRel, targetRel);
        break;
    }

    // Apply changes to both relationships
    this.updateRelationship(interaction.initiatorId, interaction.targetId, {
      relationship: initiatorRel.relationship + interaction.outcome.relationshipChange,
      interest: initiatorRel.interest + interaction.outcome.interestChange,
      respect: initiatorRel.respect + interaction.outcome.respectChange
    });

    this.updateRelationship(interaction.targetId, interaction.initiatorId, {
      relationship: targetRel.relationship + interaction.outcome.relationshipChange,
      interest: targetRel.interest + interaction.outcome.interestChange,
      respect: targetRel.respect + interaction.outcome.respectChange
    });

    // Add memory if successful
    if (interaction.outcome.success && interaction.outcome.memory) {
      this.addSharedMemory(interaction.initiatorId, interaction.targetId, interaction.outcome.memory);
      this.addSharedMemory(interaction.targetId, interaction.initiatorId, interaction.outcome.memory);
    }

    // Add grudge if created
    if (interaction.outcome.grudge) {
      this.addGrudge(interaction.initiatorId, interaction.targetId, interaction.outcome.grudge);
    }

    // Add to social feed
    this.addToSocialFeed(interaction);
  }

  private processDeepConversation(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    const relationshipChange = Math.floor(Math.random() * 11) + 5; // 5-15
    interaction.outcome.success = true;
    interaction.outcome.relationshipChange = relationshipChange;
    interaction.outcome.respectChange = Math.floor(Math.random() * 6) + 2; // 2-7

    interaction.outcome.memory = {
      type: 'deep_conversation',
      description: `Had a meaningful conversation`,
      emotionalWeight: relationshipChange,
      timestamp: Date.now(),
      participants: interaction.participants
    };

    // Check for friendship
    if (initiatorRel.relationship + relationshipChange > 25 && !initiatorRel.isFriend) {
      this.addToSocialFeed({
        id: `feed-${Date.now()}`,
        timestamp: Date.now(),
        type: 'interaction',
        description: `${interaction.initiatorId} and ${interaction.targetId} became friends!`,
        participants: interaction.participants,
        impact: 'positive'
      });
    }
  }

  private processJokeTelling(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    interaction.outcome.success = true;
    interaction.outcome.relationshipChange = 3;
    interaction.outcome.respectChange = 1;

    interaction.outcome.memory = {
      type: 'joke',
      description: `Shared a laugh together`,
      emotionalWeight: 3,
      timestamp: Date.now(),
      participants: interaction.participants
    };
  }

  private processFlirtation(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    const successChance = (targetRel.interest + targetRel.relationship) / 200;
    const success = Math.random() < successChance;

    if (success) {
      interaction.outcome.success = true;
      interaction.outcome.interestChange = 5;
      interaction.outcome.relationshipChange = 2;

      interaction.outcome.memory = {
        type: 'date',
        description: `Romantic moment shared`,
        emotionalWeight: 5,
        timestamp: Date.now(),
        participants: interaction.participants
      };
    } else {
      interaction.outcome.success = false;
      interaction.outcome.relationshipChange = -5;
      interaction.outcome.interestChange = -2;
    }
  }

  private processArgument(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    const severity = Math.floor(Math.random() * 11) + 10; // 10-20
    interaction.outcome.success = false;
    interaction.outcome.relationshipChange = -severity;

    interaction.outcome.grudge = {
      reason: 'Heated argument',
      severity: severity,
      timestamp: Date.now(),
      targetId: interaction.targetId
    };

    interaction.outcome.memory = {
      type: 'conflict',
      description: `Had a bitter argument`,
      emotionalWeight: -severity,
      timestamp: Date.now(),
      participants: interaction.participants
    };
  }

  private processIntrigue(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    interaction.outcome.success = true;
    interaction.outcome.relationshipChange = 5;
    interaction.outcome.respectChange = 3;

    interaction.outcome.memory = {
      type: 'conflict',
      description: `Plotted together against a common enemy`,
      emotionalWeight: 5,
      timestamp: Date.now(),
      participants: interaction.participants
    };
  }

  private processFlatteryGift(
    interaction: SocialInteraction,
    initiatorRel: OfficerRelationship,
    targetRel: OfficerRelationship
  ) {
    interaction.outcome.success = true;
    interaction.outcome.relationshipChange = 10;
    interaction.outcome.respectChange = 5;

    interaction.outcome.memory = {
      type: 'gift',
      description: `Exchanged gifts as a gesture of goodwill`,
      emotionalWeight: 10,
      timestamp: Date.now(),
      participants: interaction.participants
    };
  }

  private addToSocialFeed(interaction: SocialInteraction) {
    const descriptions: Record<SocialInteraction['type'], string> = {
      'DEEP_CONVERSATION': 'had a deep conversation',
      'JOKE_TELLING': 'shared a laugh',
      'FLIRTATION': 'flirted with',
      'ARGUMENT': 'argued with',
      'INTRIGUE': 'plotted with',
      'FLATTERY_GIFT': 'exchanged gifts with',
      'DATE': 'went on a date with',
      'GIFT_EXCHANGE': 'exchanged gifts with'
    };

    const entry: SocialFeedEntry = {
      id: `feed-${Date.now()}`,
      timestamp: Date.now(),
      type: 'interaction',
      description: `${interaction.initiatorId} ${descriptions[interaction.type]} ${interaction.targetId}`,
      participants: interaction.participants,
      impact: interaction.outcome.relationshipChange > 0 ? 'positive' : 
               interaction.outcome.relationshipChange < 0 ? 'negative' : 'neutral'
    };

    this.socialFeed.unshift(entry);
    // Keep only last 50 entries
    if (this.socialFeed.length > 50) {
      this.socialFeed = this.socialFeed.slice(0, 50);
    }
  }

  public getSocialFeed(): SocialFeedEntry[] {
    return [...this.socialFeed];
  }

  public getRelationshipNetwork(officerIds: string[]) {
    const nodes = officerIds.map(id => ({
      id,
      name: id, // Would be replaced with actual names
      role: 'officer'
    }));

    const edges: Array<{
      source: string;
      target: string;
      relationship: number;
      interest: number;
      type: 'friendship' | 'enmity' | 'romantic' | 'professional';
    }> = [];

    officerIds.forEach(sourceId => {
      officerIds.forEach(targetId => {
        if (sourceId !== targetId) {
          const rel = this.getRelationship(sourceId, targetId);
          if (rel) {
            let type: 'friendship' | 'enmity' | 'romantic' | 'professional' = 'professional';
            
            if (rel.isLover || rel.isInLove) type = 'romantic';
            else if (rel.isFriend) type = 'friendship';
            else if (rel.isEnemy) type = 'enmity';

            edges.push({
              source: sourceId,
              target: targetId,
              relationship: rel.relationship,
              interest: rel.interest,
              type
            });
          }
        }
      });
    });

    return { nodes, edges };
  }

  public processAutomaticInteractions(officers: Officer[], currentPhase: string, currentTime: number) {
    const interactions: SocialInteraction[] = [];
    
    // Group officers by building
    const officersByBuilding = new Map<string, Officer[]>();
    officers.forEach(officer => {
      if (officer.assignedBuildingId) {
        const buildingOfficers = officersByBuilding.get(officer.assignedBuildingId) || [];
        buildingOfficers.push(officer);
        officersByBuilding.set(officer.assignedBuildingId, buildingOfficers);
      }
    });

    // Process interactions for each building
    officersByBuilding.forEach((buildingOfficers, buildingId) => {
      if (buildingOfficers.length < 2) return;

      const interactionChance = this.getInteractionChance(currentPhase);
      if (Math.random() < interactionChance) {
        const interaction = this.createRandomInteraction(buildingOfficers, buildingId);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    });

    return interactions;
  }

  private getInteractionChance(phase: string): number {
    switch (phase) {
      case 'morning':
      case 'day':
        return 0.2; // 20% during work hours
      case 'evening':
      case 'night':
        return 0.4; // 40% during leisure
      default:
        return 0.1;
    }
  }

  private createRandomInteraction(officers: Officer[], location: string): SocialInteraction | null {
    if (officers.length < 2) return null;

    const initiator = officers[Math.floor(Math.random() * officers.length)];
    const availableTargets = officers.filter(o => o.id !== initiator.id);
    const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];

    const interactionTypes: SocialInteraction['type'][] = [
      'DEEP_CONVERSATION', 'JOKE_TELLING', 'FLIRTATION', 'ARGUMENT', 
      'INTRIGUE', 'FLATTERY_GIFT'
    ];

    const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
    
    return this.createInteraction(type, initiator.id, target.id, location);
  }
}