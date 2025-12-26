// =====================================
// INTRIGUE & SCHEMES SYSTEM
// Norland-style character-driven plots
// =====================================

export type AmbitionType = 
  | 'power' // Wants to become Dragonhead
  | 'wealth' // Wants more lucrative assignments
  | 'revenge' // Wants to harm a specific officer
  | 'respect' // Wants higher rank recognition
  | 'freedom' // Wants to leave the syndicate
  | 'protection' // Wants safety for someone
  | 'territory' // Wants control of specific building/district;

export type SchemeType = 
  | 'coup' // Plot to overthrow player
  | 'assassination' // Plot to kill another officer
  | 'embezzlement' // Stealing from syndicate
  | 'defection' // Planning to join rival gang
  | 'framing' // Framing another officer
  | 'alliance' // Secret alliance with rival gang
  | 'blackmail' // Blackmailing another officer
  | 'sabotage'; // Sabotaging operations

export type SchemePhase = 'plotting' | 'recruiting' | 'executing' | 'discovered' | 'resolved';

export interface PersonalAmbition {
  id: string;
  type: AmbitionType;
  description: string;
  targetId?: string; // Officer or building target
  progress: number; // 0-100
  urgency: number; // How desperate they are (affects scheme likelihood)
  daysActive: number;
  isFulfilled: boolean;
  isBlocked: boolean;
}

export interface Scheme {
  id: string;
  type: SchemeType;
  mastermindId: string; // Officer leading the scheme
  conspirators: string[]; // Officers involved
  targetId?: string; // Officer, building, or player as target
  phase: SchemePhase;
  progress: number; // 0-100
  discoveryRisk: number; // 0-100, chance of being discovered each day
  daysActive: number;
  evidence: number; // 0-100, how much evidence player has found
  narrative: SchemeNarrative;
  rewards: SchemeReward;
  isPlayerAware: boolean;
}

export interface SchemeNarrative {
  setup: string; // "You notice {mastermind} has been meeting secretly with..."
  rumor: string; // Hint the player might hear
  discovery: string; // "Your informant reveals..."
  confrontation: string; // Dialog when confronting
  success: string; // What happens if scheme succeeds
  failure: string; // What happens if scheme fails
}

export interface SchemeReward {
  cashGain?: number;
  reputationGain?: number;
  powerGain?: string; // Officer ID who gains power
  victimEffect?: 'wounded' | 'arrested' | 'killed' | 'demoted' | 'exiled';
}

export interface Faction {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  agenda: FactionAgenda;
  power: number; // Combined loyalty/face of members
  isSecretive: boolean;
  relationshipToPlayer: number; // -100 to 100
}

export type FactionAgenda = 
  | 'reform' // Want less violent operations
  | 'expansion' // Want more territory
  | 'tradition' // Want to maintain old ways
  | 'profit' // Purely money-focused
  | 'revolution'; // Want to replace the player

export interface IntrigueEvent {
  id: string;
  type: 'rumor' | 'discovery' | 'confrontation' | 'scheme_success' | 'scheme_failure' | 'faction_formed' | 'ambition_fulfilled';
  schemeId?: string;
  involvedOfficers: string[];
  title: string;
  description: string;
  choices: IntrigueChoice[];
  timestamp: number;
}

export interface IntrigueChoice {
  id: string;
  label: string;
  description: string;
  requirements?: {
    cash?: number;
    intel?: number;
    influence?: number;
  };
  effects: IntrigueEffect[];
}

export interface IntrigueEffect {
  type: 'loyalty' | 'cash' | 'reputation' | 'heat' | 'intel' | 'kill' | 'exile' | 'promote' | 'scheme_stop' | 'scheme_accelerate' | 'faction_dissolve';
  targetId?: string;
  value?: number;
}

// Helper to generate scheme narratives based on type and officers involved
export const SCHEME_NARRATIVE_TEMPLATES: Record<SchemeType, (mastermind: string, target?: string) => SchemeNarrative> = {
  coup: (mastermind, target) => ({
    setup: `${mastermind} has been questioning your leadership decisions publicly.`,
    rumor: `Word on the street is that some officers are unhappy with how things are run.`,
    discovery: `Your informant reveals ${mastermind} has been rallying officers against you. They plan to take control of the syndicate.`,
    confrontation: `"This organization needs stronger leadership. Step aside, or we'll make you."`,
    success: `${mastermind} has seized control of the syndicate. Your reign has ended.`,
    failure: `The coup attempt has been crushed. ${mastermind}'s ambitions lie in ruins.`
  }),
  assassination: (mastermind, target) => ({
    setup: `${mastermind} has been asking unusual questions about ${target || 'a certain officer'}'s schedule.`,
    rumor: `Someone is hiring outside muscle for a "personal matter."`,
    discovery: `${mastermind} has contracted a hit on ${target || 'one of your officers'}. The attempt is imminent.`,
    confrontation: `"${target || 'They'} had it coming. Some debts can only be paid in blood."`,
    success: `${target || 'The officer'} was found dead. ${mastermind} watches from the shadows.`,
    failure: `The assassination attempt failed. ${target || 'The target'} is shaken but alive.`
  }),
  embezzlement: (mastermind) => ({
    setup: `The books haven't been adding up lately. Small discrepancies, but consistent.`,
    rumor: `Someone's been living above their means.`,
    discovery: `${mastermind} has been skimming from every operation they oversee. Thousands are missing.`,
    confrontation: `"The syndicate owes me more than scraps. I took what I deserved."`,
    success: `${mastermind} has fled with a fortune. The treasury is significantly lighter.`,
    failure: `The embezzlement was discovered in time. Most funds recovered.`
  }),
  defection: (mastermind) => ({
    setup: `${mastermind} has been seen in territories belonging to rival gangs.`,
    rumor: `Some of our people might be looking for a new employer.`,
    discovery: `${mastermind} is negotiating to join a rival gang. They're taking intel and soldiers with them.`,
    confrontation: `"This ship is sinking. I'm just the first to find a lifeboat."`,
    success: `${mastermind} has defected, taking valuable intel to the enemy.`,
    failure: `The defection was prevented. ${mastermind} remains... for now.`
  }),
  framing: (mastermind, target) => ({
    setup: `Evidence has surfaced implicating ${target || 'a fellow officer'} in a betrayal.`,
    rumor: `Not everything is as it seems. Someone is pulling strings.`,
    discovery: `${mastermind} has been planting evidence to frame ${target || 'an innocent officer'}. It's an elaborate setup.`,
    confrontation: `"They stood in my way. This is how the game is played."`,
    success: `${target || 'The framed officer'} has been punished for crimes they didn't commit.`,
    failure: `The frame-up was exposed. ${mastermind}'s treachery is revealed.`
  }),
  alliance: (mastermind) => ({
    setup: `${mastermind} has been taking private calls and disappearing for hours.`,
    rumor: `Someone in our ranks has friends in strange places.`,
    discovery: `${mastermind} has formed a secret alliance with a rival gang. They're feeding them information.`,
    confrontation: `"The future belongs to those who see it coming. I'm positioning myself."`,
    success: `The secret alliance has compromised our operations. Rivals knew our every move.`,
    failure: `The secret alliance was exposed and severed. Trust is damaged.`
  }),
  blackmail: (mastermind, target) => ({
    setup: `${target || 'An officer'} has been acting strangely nervous lately.`,
    rumor: `Someone knows something they shouldn't.`,
    discovery: `${mastermind} has been blackmailing ${target || 'a fellow officer'}, forcing them to act against their will.`,
    confrontation: `"Everyone has secrets. I just know how to use them."`,
    success: `${mastermind} has gained significant leverage over ${target || 'their victim'}.`,
    failure: `The blackmail scheme collapsed. Secrets are out in the open now.`
  }),
  sabotage: (mastermind) => ({
    setup: `Equipment failures and "accidents" have been increasing lately.`,
    rumor: `Bad luck, or something more deliberate?`,
    discovery: `${mastermind} has been sabotaging our operations, costing the syndicate dearly.`,
    confrontation: `"You want to know why? Ask yourself what you did to deserve my loyalty."`,
    success: `The sabotage crippled our operations. Significant losses incurred.`,
    failure: `The saboteur was caught before they could do more damage.`
  })
};

// Ambition triggers based on officer state
export const checkAmbitionTriggers = (officer: { 
  loyalty: number; 
  face: number; 
  rank: string;
  daysIdle: number;
  relationships: any[];
  traits: string[];
}): AmbitionType | null => {
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

// Calculate scheme discovery chance
export const calculateDiscoveryRisk = (scheme: Scheme, playerIntel: number, conspirators: number): number => {
  const baseRisk = 5;
  const intelBonus = playerIntel * 0.3;
  const conspiratorsRisk = conspirators * 8; // More people = more risk
  const phaseRisk = scheme.phase === 'executing' ? 20 : scheme.phase === 'recruiting' ? 10 : 0;
  const daysRisk = scheme.daysActive * 2;
  
  return Math.min(95, baseRisk + intelBonus + conspiratorsRisk + phaseRisk + daysRisk);
};
