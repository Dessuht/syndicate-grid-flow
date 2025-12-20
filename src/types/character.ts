export interface Character {
  id: string;
  name: string;
  rank?: string;        // Add rank property
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
  joinedDay?: number;      // Add joinedDay property
  isActive?: boolean;      // Add isActive property
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

export type CharacterTrait = 
  | 'Ambitious'
  | 'Hot-headed'
  | 'Old School'
  | 'Calculating'
  | 'Fearless'
  | 'Connected'
  | 'Ruthless'
  | 'Loyal Dog'
  | 'Street Smart'
  | 'Silver Tongue'
  | 'Battle Hardened';

export interface CharacterStats {
  health: number;      // 0-100
  face: number;        // Prestige 0-100
  loyalty: number;     // 0-100
  heat: number;        // Police attention 0-100
  mood: number;        // 0-100
}

export interface TraitEffect {
  description: string;
  loyaltyMod: number;
  heatMod: number;
  faceMod: number;
  moodMod: number;
}

export const TRAIT_EFFECTS: Record<CharacterTrait, TraitEffect> = {
  'Ambitious': {
    description: 'Seeks power at any cost',
    loyaltyMod: -15,
    heatMod: 5,
    faceMod: 10,
    moodMod: 0,
  },
  'Hot-headed': {
    description: 'Quick to violence',
    loyaltyMod: 0,
    heatMod: 15,
    faceMod: 5,
    moodMod: -10,
  },
  'Old School': {
    description: 'Respects tradition',
    loyaltyMod: 20,
    heatMod: -5,
    faceMod: 5,
    moodMod: 10,
  },
  'Calculating': {
    description: 'Plans every move',
    loyaltyMod: 0,
    heatMod: -10,
    faceMod: 10,
    moodMod: 5,
  },
  'Fearless': {
    description: 'Never backs down',
    loyaltyMod: 5,
    heatMod: 10,
    faceMod: 15,
    moodMod: 5,
  },
  'Connected': {
    description: 'Knows everyone',
    loyaltyMod: 5,
    heatMod: -5,
    faceMod: 10,
    moodMod: 0,
  },
  'Ruthless': {
    description: 'No mercy shown',
    loyaltyMod: -10,
    heatMod: 15,
    faceMod: 10,
    moodMod: -5,
  },
  'Loyal Dog': {
    description: 'Devoted to the family',
    loyaltyMod: 25,
    heatMod: 0,
    faceMod: -5,
    moodMod: 10,
  },
  'Street Smart': {
    description: 'Survives anything',
    loyaltyMod: 5,
    heatMod: -5,
    faceMod: 5,
    moodMod: 5,
  },
  'Silver Tongue': {
    description: 'Talks way out of trouble',
    loyaltyMod: 0,
    heatMod: -10,
    faceMod: 15,
    moodMod: 5,
  },
  'Battle Hardened': {
    description: 'Experienced in combat, resilient to fear.',
    loyaltyMod: 5,
    heatMod: 0,
    faceMod: 5,
    moodMod: 0,
  },
};

export const HK_SURNAMES = [
  'Chan', 'Wong', 'Lam', 'Cheung', 'Lee',
  'Ho', 'Leung', 'Ng', 'Yip', 'Tang',
  'Chow', 'Fung', 'Kwok', 'Tsang', 'Mok',
  'Au', 'Cheng', 'Lo', 'Yuen', 'Siu',
];

export const HK_GIVEN_NAMES = [
  'Wai', 'Ming', 'Kin', 'Tai', 'Lok',
  'Fai', 'Keung', 'Sing', 'Chi', 'Hung',
  'Shing', 'Tat', 'Kai', 'Man', 'Hoi',
  'Wing', 'Kwong', 'Pak', 'San', 'Yau',
];