export interface Character {
  id: string;
  name: string;
  role: 'officer' | 'member' | 'civilian';
  title?: string;
  avatar?: string;
  stats: {
    loyalty: number;        // 0-100, loyalty to player/syndicate
    competence: number;    // 0-100, affects task performance
    ambition: number;      // 0-100, drives personal goals
    ruthlessness: number;  // 0-100, willingness to use violence
    charisma: number;      // 0-100, social influence
  };
  needs: {
    safety: number;        // 0-100, need for security
    respect: number;       // 0-100, need for status
    wealth: number;        // 0-100, need for money/resources
    power: number;         // 0-100, need for control
    belonging: number;     // 0-100, need for social connection
  };
  desires: {
    position: string[];    // desired roles/positions
    relationships: Record<string, number>; // relationship values with other characters
    territory: string[];  // preferred territories to control
    revenge: string[];     // characters they want revenge on
  };
  skills: {
    combat: number;
    diplomacy: number;
    intelligence: number;
    management: number;
    intimidation: number;
  };
  traits: string[];
  currentAction?: CharacterAction;
  relationships: Record<string, Relationship>;
  mood: 'loyal' | 'content' | 'restless' | 'ambitious' | 'disloyal' | 'desperate';
  location?: string;
  assignedBuilding?: string;
  personalHistory: string[];
}

export interface Relationship {
  characterId: string;
  type: 'friendship' | 'rivalry' | 'romance' | 'family' | 'loyalty' | 'betrayal';
  strength: number; // -100 to 100
  events: string[];
}

export interface CharacterAction {
  id: string;
  type: 'working' | 'socializing' | 'plotting' | 'training' | 'resting' | 'patrolling' | 'gathering_intel' | 'managing' | 'recruiting';
  description: string;
  duration: number; // in game hours
  startTime: number;
  targetCharacter?: string;
  targetLocation?: string;
  priority: number; // 1-10, higher priority actions override lower ones
}

export interface ActionDecision {
  action: CharacterAction;
  reasoning: string;
  confidence: number; // 0-100, how confident the character is about this decision
}