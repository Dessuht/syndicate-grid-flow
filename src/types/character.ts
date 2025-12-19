// Traditional HK Triad Rank System
export type TriadRank = '49' | '426' | '438' | '489';

export const RANK_LABELS: Record<TriadRank, string> = {
  '49': 'Soldier',
  '426': 'Red Pole',
  '438': 'Deputy',
  '489': 'Dragonhead',
};

export const RANK_NUMEROLOGY: Record<TriadRank, number> = {
  '49': 1,
  '426': 2,
  '438': 3,
  '489': 4,
};

// Character Traits
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
  | 'Silver Tongue';

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
};

// Character Stats
export interface CharacterStats {
  health: number;      // 0-100
  face: number;        // Prestige 0-100
  loyalty: number;     // 0-100
  heat: number;        // Police attention 0-100
  mood: number;        // 0-100
}

// Full Character Type
export interface Character {
  id: string;
  name: string;
  surname: string;
  rank: TriadRank;
  stats: CharacterStats;
  traits: CharacterTrait[];
  joinedDay: number;
  isActive: boolean;
}

// Traditional HK Surnames
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
