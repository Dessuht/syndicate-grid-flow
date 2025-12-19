import { 
  Character, 
  CharacterTrait, 
  CharacterStats,
  TRAIT_EFFECTS,
  HK_SURNAMES,
  HK_GIVEN_NAMES,
} from '@/types/character';

// Get all available traits
const ALL_TRAITS: CharacterTrait[] = Object.keys(TRAIT_EFFECTS) as CharacterTrait[];

/**
 * Generate random unique traits for a character
 */
function getRandomTraits(count: number): CharacterTrait[] {
  const shuffled = [...ALL_TRAITS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate a random name from HK name pools
 */
function generateName(): { name: string; surname: string } {
  const surname = HK_SURNAMES[Math.floor(Math.random() * HK_SURNAMES.length)];
  const givenName = HK_GIVEN_NAMES[Math.floor(Math.random() * HK_GIVEN_NAMES.length)];
  return { name: givenName, surname };
}

/**
 * Calculate base stats with trait modifiers
 */
function calculateStats(traits: CharacterTrait[]): CharacterStats {
  // Base stats for a 49 Soldier
  let stats: CharacterStats = {
    health: 70 + Math.floor(Math.random() * 20),
    face: 20 + Math.floor(Math.random() * 15),
    loyalty: 50 + Math.floor(Math.random() * 20),
    heat: 5 + Math.floor(Math.random() * 15),
    mood: 60 + Math.floor(Math.random() * 20),
  };

  // Apply trait modifiers
  for (const trait of traits) {
    const effect = TRAIT_EFFECTS[trait];
    stats.loyalty = Math.max(0, Math.min(100, stats.loyalty + effect.loyaltyMod));
    stats.heat = Math.max(0, Math.min(100, stats.heat + effect.heatMod));
    stats.face = Math.max(0, Math.min(100, stats.face + effect.faceMod));
    stats.mood = Math.max(0, Math.min(100, stats.mood + effect.moodMod));
  }

  return stats;
}

/**
 * Generate a random 49 Soldier with 2 random traits
 */
export function generateSoldier(currentDay: number): Character {
  const { name, surname } = generateName();
  const traits = getRandomTraits(2);
  const stats = calculateStats(traits);

  return {
    id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    surname,
    rank: '49',
    stats,
    traits,
    joinedDay: currentDay,
    isActive: true,
  };
}

/**
 * Get full display name
 */
export function getFullName(character: Character): string {
  return `${character.surname} ${character.name}`;
}
