export interface Character {
  export interface Character {
    id: string;
    name: string;
    rank?: string;
    energy: number;
    maxEnergy: number;
    assignedBuildingId: string | null;
    loyalty: number;
    combat: number;
    intelligence: number;
    charisma: number;
    traits: CharacterTrait[];
    relationships: Record<string, any>;
    stats: {
      kills: number;
      missions: number;
      arrests: number;
      income: number;
      loyalty: number; // Added for compatibility
    };
  }

export interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
}