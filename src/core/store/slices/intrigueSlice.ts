// =====================================
// INTRIGUE SYSTEM SLICE
// Handles schemes, ambitions, factions
// =====================================

import type { Officer } from '@/stores/gameStoreTypes';
import type { 
  Scheme, 
  PersonalAmbition, 
  Faction, 
  IntrigueEvent,
  SchemeType,
  AmbitionType,
  SchemePhase,
  SCHEME_NARRATIVE_TEMPLATES,
  calculateDiscoveryRisk,
  checkAmbitionTriggers
} from '@/types/intrigue';

// State interface for intrigue system
export interface IntrigueState {
  schemes: Scheme[];
  ambitions: Record<string, PersonalAmbition[]>; // officerId -> ambitions
  factions: Faction[];
  intrigueEvents: IntrigueEvent[];
  discoveredSchemes: string[]; // IDs of schemes player knows about
  rumors: string[]; // Hints about active plots
}

// Initial state
export const initialIntrigueState: IntrigueState = {
  schemes: [],
  ambitions: {},
  factions: [],
  intrigueEvents: [],
  discoveredSchemes: [],
  rumors: [],
};

// Generate a unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a new ambition for an officer
export const createAmbition = (
  officerId: string,
  type: AmbitionType,
  targetId?: string
): PersonalAmbition => {
  const descriptions: Record<AmbitionType, string> = {
    power: 'Desires to rise to the top and lead the syndicate',
    wealth: 'Wants more lucrative assignments and a bigger cut',
    revenge: 'Seeks to destroy a rival who wronged them',
    respect: 'Craves recognition and a higher rank',
    freedom: 'Dreams of escaping the syndicate life',
    protection: 'Wants to keep someone safe from harm',
    territory: 'Wants control of a specific operation',
  };

  return {
    id: generateId(),
    type,
    description: descriptions[type],
    targetId,
    progress: 0,
    urgency: 20,
    daysActive: 0,
    isFulfilled: false,
    isBlocked: false,
  };
};

// Create a new scheme
export const createScheme = (
  type: SchemeType,
  mastermind: Officer,
  targetId?: string,
  targetName?: string
): Scheme => {
  const narrativeGen = {
    coup: (m: string, t?: string) => ({
      setup: `${m} has been questioning your leadership decisions publicly.`,
      rumor: `Word on the street is that some officers are unhappy with how things are run.`,
      discovery: `Your informant reveals ${m} has been rallying officers against you. They plan to take control of the syndicate.`,
      confrontation: `"This organization needs stronger leadership. Step aside, or we'll make you."`,
      success: `${m} has seized control of the syndicate. Your reign has ended.`,
      failure: `The coup attempt has been crushed. ${m}'s ambitions lie in ruins.`
    }),
    assassination: (m: string, t?: string) => ({
      setup: `${m} has been asking unusual questions about ${t || 'a certain officer'}'s schedule.`,
      rumor: `Someone is hiring outside muscle for a "personal matter."`,
      discovery: `${m} has contracted a hit on ${t || 'one of your officers'}. The attempt is imminent.`,
      confrontation: `"${t || 'They'} had it coming. Some debts can only be paid in blood."`,
      success: `${t || 'The officer'} was found dead. ${m} watches from the shadows.`,
      failure: `The assassination attempt failed. ${t || 'The target'} is shaken but alive.`
    }),
    embezzlement: (m: string) => ({
      setup: `The books haven't been adding up lately. Small discrepancies, but consistent.`,
      rumor: `Someone's been living above their means.`,
      discovery: `${m} has been skimming from every operation they oversee. Thousands are missing.`,
      confrontation: `"The syndicate owes me more than scraps. I took what I deserved."`,
      success: `${m} has fled with a fortune. The treasury is significantly lighter.`,
      failure: `The embezzlement was discovered in time. Most funds recovered.`
    }),
    defection: (m: string) => ({
      setup: `${m} has been seen in territories belonging to rival gangs.`,
      rumor: `Some of our people might be looking for a new employer.`,
      discovery: `${m} is negotiating to join a rival gang. They're taking intel and soldiers with them.`,
      confrontation: `"This ship is sinking. I'm just the first to find a lifeboat."`,
      success: `${m} has defected, taking valuable intel to the enemy.`,
      failure: `The defection was prevented. ${m} remains... for now.`
    }),
    framing: (m: string, t?: string) => ({
      setup: `Evidence has surfaced implicating ${t || 'a fellow officer'} in a betrayal.`,
      rumor: `Not everything is as it seems. Someone is pulling strings.`,
      discovery: `${m} has been planting evidence to frame ${t || 'an innocent officer'}. It's an elaborate setup.`,
      confrontation: `"They stood in my way. This is how the game is played."`,
      success: `${t || 'The framed officer'} has been punished for crimes they didn't commit.`,
      failure: `The frame-up was exposed. ${m}'s treachery is revealed.`
    }),
    alliance: (m: string) => ({
      setup: `${m} has been taking private calls and disappearing for hours.`,
      rumor: `Someone in our ranks has friends in strange places.`,
      discovery: `${m} has formed a secret alliance with a rival gang. They're feeding them information.`,
      confrontation: `"The future belongs to those who see it coming. I'm positioning myself."`,
      success: `The secret alliance has compromised our operations. Rivals knew our every move.`,
      failure: `The secret alliance was exposed and severed. Trust is damaged.`
    }),
    blackmail: (m: string, t?: string) => ({
      setup: `${t || 'An officer'} has been acting strangely nervous lately.`,
      rumor: `Someone knows something they shouldn't.`,
      discovery: `${m} has been blackmailing ${t || 'a fellow officer'}, forcing them to act against their will.`,
      confrontation: `"Everyone has secrets. I just know how to use them."`,
      success: `${m} has gained significant leverage over ${t || 'their victim'}.`,
      failure: `The blackmail scheme collapsed. Secrets are out in the open now.`
    }),
    sabotage: (m: string) => ({
      setup: `Equipment failures and "accidents" have been increasing lately.`,
      rumor: `Bad luck, or something more deliberate?`,
      discovery: `${m} has been sabotaging our operations, costing the syndicate dearly.`,
      confrontation: `"You want to know why? Ask yourself what you did to deserve my loyalty."`,
      success: `The sabotage crippled our operations. Significant losses incurred.`,
      failure: `The saboteur was caught before they could do more damage.`
    })
  };

  const narrative = narrativeGen[type](mastermind.name, targetName);

  return {
    id: generateId(),
    type,
    mastermindId: mastermind.id,
    conspirators: [],
    targetId,
    phase: 'plotting',
    progress: 0,
    discoveryRisk: 5,
    daysActive: 0,
    evidence: 0,
    narrative,
    rewards: getSchemeRewards(type),
    isPlayerAware: false,
  };
};

// Get rewards/consequences for a scheme type
const getSchemeRewards = (type: SchemeType) => {
  switch (type) {
    case 'coup':
      return { powerGain: 'mastermind' };
    case 'assassination':
      return { victimEffect: 'killed' as const };
    case 'embezzlement':
      return { cashGain: 3000 };
    case 'defection':
      return { reputationGain: -30 };
    case 'framing':
      return { victimEffect: 'exiled' as const };
    case 'alliance':
      return { reputationGain: -20 };
    case 'blackmail':
      return { powerGain: 'mastermind' };
    case 'sabotage':
      return { cashGain: -2000 };
    default:
      return {};
  }
};

// Process schemes each day
export const processSchemes = (
  schemes: Scheme[],
  officers: Officer[],
  playerIntel: number
): { updatedSchemes: Scheme[]; newEvents: IntrigueEvent[]; newRumors: string[] } => {
  const newEvents: IntrigueEvent[] = [];
  const newRumors: string[] = [];

  const updatedSchemes = schemes.map(scheme => {
    const mastermind = officers.find(o => o.id === scheme.mastermindId);
    if (!mastermind) return scheme;

    let updated = { ...scheme, daysActive: scheme.daysActive + 1 };

    // Progress the scheme
    const progressRate = 5 + (mastermind.skills.diplomacy / 20);
    updated.progress = Math.min(100, updated.progress + progressRate);

    // Calculate discovery risk
    updated.discoveryRisk = Math.min(95, 
      5 + 
      (playerIntel * 0.3) + 
      (updated.conspirators.length * 8) + 
      (updated.phase === 'executing' ? 20 : updated.phase === 'recruiting' ? 10 : 0) +
      (updated.daysActive * 2)
    );

    // Phase progression
    if (updated.progress >= 30 && updated.phase === 'plotting') {
      updated.phase = 'recruiting';
      newRumors.push(scheme.narrative.rumor);
    } else if (updated.progress >= 70 && updated.phase === 'recruiting') {
      updated.phase = 'executing';
    }

    // Check for random discovery
    if (Math.random() * 100 < updated.discoveryRisk / 10) {
      updated.evidence = Math.min(100, updated.evidence + 15 + Math.floor(playerIntel / 5));
    }

    return updated;
  });

  return { updatedSchemes, newEvents, newRumors };
};

// Check if an officer should start a scheme
export const shouldStartScheme = (
  officer: Officer,
  ambitions: PersonalAmbition[],
  existingSchemes: Scheme[]
): SchemeType | null => {
  // Don't scheme if already scheming
  if (existingSchemes.some(s => s.mastermindId === officer.id)) {
    return null;
  }

  // Check loyalty - disloyal officers more likely to scheme
  if (officer.loyalty > 60) return null;

  // Check for unfulfilled urgent ambitions
  const urgentAmbition = ambitions?.find(a => a.urgency > 60 && !a.isFulfilled);
  if (!urgentAmbition) return null;

  // Map ambitions to scheme types
  const schemeForAmbition: Partial<Record<AmbitionType, SchemeType>> = {
    power: 'coup',
    wealth: 'embezzlement',
    revenge: 'assassination',
    freedom: 'defection',
  };

  const schemeType = schemeForAmbition[urgentAmbition.type];
  
  // Random chance based on urgency and low loyalty
  const schemeChance = (urgentAmbition.urgency / 100) * ((100 - officer.loyalty) / 100);
  if (Math.random() < schemeChance * 0.1) {
    return schemeType || null;
  }

  return null;
};

// Generate ambitions for officers based on their state
export const generateAmbitionsForOfficer = (officer: Officer): AmbitionType | null => {
  // High face + low rank = wants power
  if (officer.face > 70 && ['Blue Lantern', 'Straw Sandal'].includes(officer.rank)) {
    return 'power';
  }
  
  // Low loyalty + high idle = wants freedom
  if (officer.loyalty < 40 && officer.daysIdle > 5) {
    return 'freedom';
  }
  
  // Has grudge against someone = revenge
  const hasGrudge = officer.relationships?.some((r: any) => r.respect < -50);
  if (hasGrudge) {
    return 'revenge';
  }
  
  // Ambitious trait + medium rank = wants more
  if (officer.traits.includes('Ambitious') && officer.face > 50) {
    return 'respect';
  }
  
  // Greedy trait = wealth
  if (officer.traits.includes('Greedy') || officer.traits.includes('Calculating')) {
    return 'wealth';
  }
  
  return null;
};

// Create an intrigue event for the player
export const createIntrigueEvent = (
  type: IntrigueEvent['type'],
  scheme: Scheme,
  officers: Officer[]
): IntrigueEvent => {
  const mastermind = officers.find(o => o.id === scheme.mastermindId);
  const target = scheme.targetId ? officers.find(o => o.id === scheme.targetId) : null;

  const eventTitles: Record<IntrigueEvent['type'], string> = {
    rumor: 'Whispers in the Dark',
    discovery: 'Conspiracy Revealed',
    confrontation: 'Face to Face',
    scheme_success: 'The Plot Succeeds',
    scheme_failure: 'Scheme Unraveled',
    faction_formed: 'New Alliance Forms',
    ambition_fulfilled: 'Ambition Realized',
  };

  const descriptions: Record<IntrigueEvent['type'], string> = {
    rumor: scheme.narrative.rumor,
    discovery: scheme.narrative.discovery,
    confrontation: scheme.narrative.confrontation,
    scheme_success: scheme.narrative.success,
    scheme_failure: scheme.narrative.failure,
    faction_formed: `A new faction has formed within the syndicate, led by ${mastermind?.name || 'unknown'}.`,
    ambition_fulfilled: `${mastermind?.name || 'An officer'}'s ambitions have been realized.`,
  };

  const choices = getChoicesForEvent(type, scheme, mastermind?.name || 'Unknown');

  return {
    id: generateId(),
    type,
    schemeId: scheme.id,
    involvedOfficers: [scheme.mastermindId, ...scheme.conspirators, scheme.targetId].filter(Boolean) as string[],
    title: eventTitles[type],
    description: descriptions[type],
    choices,
    timestamp: Date.now(),
  };
};

// Get choices for an intrigue event
const getChoicesForEvent = (
  type: IntrigueEvent['type'],
  scheme: Scheme,
  mastermindName: string
) => {
  if (type === 'discovery') {
    return [
      {
        id: 'confront',
        label: 'Confront Immediately',
        description: `Face ${mastermindName} directly and demand answers.`,
        effects: [{ type: 'scheme_stop' as const }]
      },
      {
        id: 'gather-evidence',
        label: 'Gather More Evidence',
        description: 'Wait and watch to identify all conspirators.',
        requirements: { intel: 20 },
        effects: []
      },
      {
        id: 'turn-conspirator',
        label: 'Turn a Conspirator',
        description: 'Bribe or threaten a co-conspirator to betray the scheme.',
        requirements: { cash: 1000, intel: 10 },
        effects: [{ type: 'scheme_stop' as const }]
      },
      {
        id: 'execute',
        label: 'Execute the Mastermind',
        description: 'Send a clear message - traitors die.',
        effects: [{ type: 'kill' as const, targetId: scheme.mastermindId }, { type: 'reputation' as const, value: -10 }]
      }
    ];
  }

  if (type === 'rumor') {
    return [
      {
        id: 'investigate',
        label: 'Investigate',
        description: 'Spend intel to uncover the truth.',
        requirements: { intel: 15 },
        effects: []
      },
      {
        id: 'ignore',
        label: 'Ignore',
        description: 'It is probably nothing.',
        effects: []
      }
    ];
  }

  return [
    {
      id: 'dismiss',
      label: 'Acknowledge',
      description: 'Note this development.',
      effects: []
    }
  ];
};
