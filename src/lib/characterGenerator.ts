import { Character, CharacterTrait } from '@/types/character';

export function generateSoldier(): Character {
  const traits: CharacterTrait[] = [
    {
      id: 'trait-1',
      name: 'Street Smart',
      description: 'Knows how to navigate the streets',
      effect: '+5 to survival skills'
    }
  ];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `Soldier ${Math.floor(Math.random() * 1000)}`,
    rank: 'soldier',
    energy: 100,
    maxEnergy: 100,
    assignedBuildingId: null,
    loyalty: 50,
    combat: 30,
    intelligence: 25,
    charisma: 20,
    traits,
    relationships: {},
    stats: {
      kills: 0,
      missions: 0,
      arrests: 0,
      income: 0,
      loyalty: 50
    }
  };
}