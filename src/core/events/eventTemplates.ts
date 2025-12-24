// Dynamic Event Generation System
// Creates unique, memorable events with real consequences

export interface EventModifier {
  id: string;
  name: string;
  description: string;
  effect: Record<string, number>;
}

export interface EventNarrative {
  intro: string[];
  details: string[];
  consequences: string[];
}

export interface DynamicEventTemplate {
  type: string;
  baseWeight: number;
  narratives: EventNarrative;
  modifiers: EventModifier[];
  choices: EventChoiceTemplate[];
  conditions: (state: any) => boolean;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface EventChoiceTemplate {
  id: string;
  text: string;
  description: string;
  requirements?: { cash?: number; intel?: number; influence?: number; soldiers?: number };
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  probability: number;
  description: string;
  effects: {
    cash?: number;
    reputation?: number;
    policeHeat?: number;
    intel?: number;
    influence?: number;
    loyalty?: number; // applies to involved officer
    woundOfficer?: boolean;
    arrestOfficer?: boolean;
    killSoldiers?: number;
    gainSoldiers?: number;
    rivalRelation?: number;
  };
  followUp?: string; // triggers another event
}

// Names and flavor text pools
const INFORMANT_NAMES = [
  'Blind Chen', 'Whispering Lau', 'The Gecko', 'One-Eye Wong', 'Smoky Tam',
  'The Accountant', 'Paper Tiger', 'Snake Eyes', 'The Doorman', 'Laughing Buddha'
];

const POLICE_UNITS = [
  'Anti-Triad Bureau', 'Organized Crime Unit', 'Vice Squad', 'OCTB Task Force',
  'District Patrol', 'Customs & Excise', 'ICAC Investigators', 'Special Duties Unit'
];

const RIVAL_ACTIONS = [
  'muscling in on your protection routes',
  'spreading rumors about your leadership',
  'poaching your street soldiers',
  'undercutting your drug prices',
  'bribing your police contacts'
];

const LOCATIONS = [
  'the wet market', 'a tea house in Sham Shui Po', 'the ferry pier',
  'an abandoned textile factory', 'the rooftop of a dai pai dong',
  'a mahjong parlor basement', 'the docks at midnight', 'a temple courtyard'
];

const WEATHER_CONDITIONS = [
  'during a monsoon downpour', 'in the sweltering heat', 'on a foggy night',
  'as neon signs flickered', 'under a blood-red sunset', 'in the pre-dawn mist'
];

// Utility functions for generating unique narratives
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateInformantName(): string {
  return pickRandom(INFORMANT_NAMES);
}

export function generatePoliceUnit(): string {
  return pickRandom(POLICE_UNITS);
}

export function generateLocation(): string {
  return pickRandom(LOCATIONS);
}

export function generateWeather(): string {
  return pickRandom(WEATHER_CONDITIONS);
}

// Event modifiers that add unique twists
export const EVENT_MODIFIERS: Record<string, EventModifier[]> = {
  policeRaid: [
    { id: 'corrupt_cop', name: 'Corrupt Cop Inside', description: 'You have a man on the inside who tipped you off early', effect: { escapeCostReduction: 500, warningTime: 1 } },
    { id: 'media_present', name: 'News Crew Present', description: 'Local journalists are filming - any violence will be very public', effect: { reputationMultiplier: 2, violenceRisk: 1.5 } },
    { id: 'federal_backup', name: 'Federal Backup', description: 'The feds are involved - this is bigger than a routine bust', effect: { severityIncrease: 2, bribeCostMultiplier: 3 } },
    { id: 'rival_tip', name: 'Rival Tip-Off', description: 'A rival gang informed on you - they want to see you fall', effect: { rivalRelationDecrease: 20 } },
  ],
  betrayal: [
    { id: 'long_con', name: 'Long Con', description: 'This has been planned for months - the damage runs deep', effect: { intelLoss: 30, cashLoss: 5000 } },
    { id: 'desperate_act', name: 'Desperate Act', description: 'Driven by desperation, not malice - there may be a chance for redemption', effect: { loyaltyRecoverable: 1 } },
    { id: 'external_pressure', name: 'External Pressure', description: 'Someone outside the family is pulling strings', effect: { mysteryContact: 1 } },
    { id: 'personal_grudge', name: 'Personal Grudge', description: 'This is revenge for something you did - or didn\'t do', effect: { targetedRetaliation: 1 } },
  ],
  opportunity: [
    { id: 'time_sensitive', name: 'Time Sensitive', description: 'This window won\'t stay open long', effect: { bonusMultiplier: 1.5, riskMultiplier: 1.3 } },
    { id: 'inside_job', name: 'Inside Job', description: 'Someone on the inside is helping - but can they be trusted?', effect: { successChance: 0.8, betrayalChance: 0.1 } },
    { id: 'high_profile', name: 'High Profile Target', description: 'Success here will be noticed by everyone', effect: { reputationBonus: 20, heatIncrease: 15 } },
  ],
};

// Main event templates with rich narratives
export const EVENT_TEMPLATES: DynamicEventTemplate[] = [
  // === POLICE EVENTS ===
  {
    type: 'policeRaid',
    baseWeight: 10,
    severity: 'major',
    conditions: (state) => state.policeHeat > 20 && state.buildings.some((b: any) => b.isOccupied && b.isIllicit),
    narratives: {
      intro: [
        'Sirens pierce the night air. The ${policeUnit} has surrounded ${buildingName}.',
        'A source within the police has warned you: ${policeUnit} is planning a raid on ${buildingName}.',
        'Black vans roll up to ${buildingName}. The ${policeUnit} means business tonight.',
      ],
      details: [
        '${officerName} is inside and needs extraction.',
        'There\'s $${cashAtRisk} in the safe that could be seized.',
        'Evidence of your operations could send people away for years.',
      ],
      consequences: [
        'If they get their hands on the books, every protection racket is compromised.',
        'Losing this operation would cost you face with the elders.',
        'The street soldiers are watching - how you handle this defines you.',
      ],
    },
    modifiers: EVENT_MODIFIERS.policeRaid,
    choices: [
      {
        id: 'bribe',
        text: 'Grease the Palms',
        description: 'Pay off the officers to look the other way',
        requirements: { cash: 2000 },
        outcomes: [
          { probability: 0.7, description: 'The officers pocket the cash and disappear into the night.', effects: { cash: -2500, policeHeat: -5 } },
          { probability: 0.2, description: 'They take the money but still make a show arrest.', effects: { cash: -2500, arrestOfficer: true } },
          { probability: 0.1, description: 'It\'s a setup - they arrest everyone and keep the bribe.', effects: { cash: -2500, arrestOfficer: true, policeHeat: 10, reputation: -10 } },
        ],
      },
      {
        id: 'fight',
        text: 'Stand Your Ground',
        description: 'Your soldiers hold the line while you burn evidence',
        requirements: { soldiers: 3 },
        outcomes: [
          { probability: 0.4, description: 'Your men hold them off long enough. Evidence destroyed.', effects: { killSoldiers: 1, policeHeat: 15, reputation: 10 } },
          { probability: 0.4, description: 'A bloody standoff - losses on both sides.', effects: { killSoldiers: 2, woundOfficer: true, policeHeat: 25 } },
          { probability: 0.2, description: 'They overpower your defenses. Total loss.', effects: { killSoldiers: 3, arrestOfficer: true, cash: -5000, policeHeat: 30 } },
        ],
      },
      {
        id: 'escape',
        text: 'Scatter & Escape',
        description: 'Everyone runs - save yourselves',
        outcomes: [
          { probability: 0.5, description: 'You slip away through back alleys. Live to fight another day.', effects: { reputation: -5, policeHeat: 5 } },
          { probability: 0.3, description: 'Most escape but they catch one of your men.', effects: { arrestOfficer: true, reputation: -10 } },
          { probability: 0.2, description: 'Clean getaway - they find nothing.', effects: { policeHeat: -3 } },
        ],
      },
    ],
  },

  // === OPPORTUNITY EVENTS ===
  {
    type: 'luckyBreak',
    baseWeight: 5,
    severity: 'moderate',
    conditions: (state) => state.reputation > 30,
    narratives: {
      intro: [
        '${informantName} approaches you ${weather} at ${location}.',
        'A mysterious envelope arrives containing details about ${rivalName}\'s operation.',
        'One of your street soldiers stumbles onto something big.',
      ],
      details: [
        'A shipment worth thousands is arriving at the docks, lightly guarded.',
        'A rival\'s accountant wants to defect - and he\'s bringing the books.',
        'There\'s a window to hit ${rivalName}\'s gambling operation while they\'re distracted.',
      ],
      consequences: [
        'Success here could set you up for months.',
        'But if it\'s a trap, you\'ll lose more than money.',
        'Your officers are waiting for the call.',
      ],
    },
    modifiers: EVENT_MODIFIERS.opportunity,
    choices: [
      {
        id: 'seize',
        text: 'Seize the Opportunity',
        description: 'Strike now while the iron is hot',
        requirements: { soldiers: 2 },
        outcomes: [
          { probability: 0.5, description: 'Clean operation. The haul exceeds expectations.', effects: { cash: 5000, reputation: 15, intel: 20 } },
          { probability: 0.3, description: 'Partial success - but you got something.', effects: { cash: 2000, reputation: 5 } },
          { probability: 0.2, description: 'It was a setup. You walk into an ambush.', effects: { killSoldiers: 2, reputation: -15, policeHeat: 10 } },
        ],
      },
      {
        id: 'investigate',
        text: 'Investigate First',
        description: 'Send scouts to verify before committing',
        requirements: { intel: 20 },
        outcomes: [
          { probability: 0.6, description: 'Your caution pays off - you spot the trap and withdraw.', effects: { intel: 10, reputation: 5 } },
          { probability: 0.3, description: 'It\'s legitimate. You move in with full information.', effects: { cash: 4000, intel: 15, reputation: 10 } },
          { probability: 0.1, description: 'Your scouts are spotted. The opportunity evaporates.', effects: { intel: -10 } },
        ],
      },
      {
        id: 'pass',
        text: 'Let It Go',
        description: 'Too risky - stay focused on current operations',
        outcomes: [
          { probability: 1.0, description: 'You play it safe. Nothing ventured, nothing gained.', effects: {} },
        ],
      },
    ],
  },

  // === INTERNAL CONFLICT ===
  {
    type: 'powerStruggle',
    baseWeight: 3,
    severity: 'critical',
    conditions: (state) => state.officers.filter((o: any) => o.loyalty < 50).length >= 1,
    narratives: {
      intro: [
        'Whispers reach your ears: ${officerName} has been meeting with other families.',
        'Your most trusted advisor pulls you aside with disturbing news.',
        'The atmosphere at the last family dinner was... cold.',
      ],
      details: [
        '${officerName} believes they should be running things.',
        'Several soldiers have been seen taking orders directly from ${officerName}.',
        'Money has been disappearing from the collection routes ${officerName} oversees.',
      ],
      consequences: [
        'If you don\'t act, others will see you as weak.',
        'But move too harshly and you may create more enemies.',
        'The eyes of the entire organization are on you.',
      ],
    },
    modifiers: EVENT_MODIFIERS.betrayal,
    choices: [
      {
        id: 'confront',
        text: 'Confront Directly',
        description: 'Call them out in front of the family',
        outcomes: [
          { probability: 0.4, description: 'They back down publicly. Their ambition is checked... for now.', effects: { reputation: 15, loyalty: 20 } },
          { probability: 0.3, description: 'They challenge your authority openly. Battle lines are drawn.', effects: { reputation: -10 }, followUp: 'coupAttempt' },
          { probability: 0.3, description: 'They apologize profusely. Genuine or performance?', effects: { loyalty: 10 } },
        ],
      },
      {
        id: 'undermine',
        text: 'Undermine Quietly',
        description: 'Erode their support base before they can act',
        requirements: { intel: 30 },
        outcomes: [
          { probability: 0.6, description: 'Their allies abandon them. Isolated and harmless.', effects: { intel: -30, loyalty: 15, reputation: 5 } },
          { probability: 0.3, description: 'They catch wind and accelerate their plans.', effects: { intel: -30 }, followUp: 'coupAttempt' },
          { probability: 0.1, description: 'Your scheming is exposed. You look petty.', effects: { reputation: -20, loyalty: -10 } },
        ],
      },
      {
        id: 'eliminate',
        text: 'Eliminate the Threat',
        description: 'Remove them permanently from the equation',
        outcomes: [
          { probability: 0.7, description: 'The deed is done. A message sent to any who would challenge you.', effects: { reputation: 10, policeHeat: 5 } },
          { probability: 0.2, description: 'They escape the attempt. Now they have nothing to lose.', effects: { reputation: -15 }, followUp: 'coupAttempt' },
          { probability: 0.1, description: 'Witnesses talk. The police are asking questions.', effects: { policeHeat: 25, reputation: -10 } },
        ],
      },
    ],
  },

  // === STREET LEVEL EVENTS ===
  {
    type: 'streetIncident',
    baseWeight: 15,
    severity: 'minor',
    conditions: (state) => state.soldiers.length > 0,
    narratives: {
      intro: [
        'A scuffle breaks out at one of your collection points.',
        'One of your soldiers comes running, out of breath.',
        'The phone rings at 3 AM - never a good sign.',
      ],
      details: [
        'A shopkeeper is refusing to pay protection money.',
        'Some punk kids tagged over your territory markers.',
        'A drunk tourist wandered into the wrong alley.',
      ],
      consequences: [
        'Small fires become infernos if left unattended.',
        'How you handle the little things sets the tone.',
        'The street is always watching.',
      ],
    },
    modifiers: [],
    choices: [
      {
        id: 'handle_hard',
        text: 'Send a Message',
        description: 'Make an example that won\'t be forgotten',
        outcomes: [
          { probability: 0.7, description: 'The message is received loud and clear.', effects: { reputation: 5, policeHeat: 3 } },
          { probability: 0.3, description: 'You went too far. People are talking.', effects: { policeHeat: 10, reputation: -5 } },
        ],
      },
      {
        id: 'handle_soft',
        text: 'Handle It Quietly',
        description: 'Resolve this without making waves',
        outcomes: [
          { probability: 0.6, description: 'Problem solved, no fuss.', effects: { reputation: 2 } },
          { probability: 0.4, description: 'Your mercy is mistaken for weakness.', effects: { reputation: -5 } },
        ],
      },
      {
        id: 'ignore',
        text: 'Ignore It',
        description: 'You have bigger things to worry about',
        outcomes: [
          { probability: 0.5, description: 'It blows over on its own.', effects: {} },
          { probability: 0.5, description: 'Others see you as distracted. Disrespect spreads.', effects: { reputation: -10 } },
        ],
      },
    ],
  },

  // === MEDICAL EMERGENCY ===
  {
    type: 'medicalEmergency',
    baseWeight: 5,
    severity: 'moderate',
    conditions: (state) => state.officers.some((o: any) => o.isWounded),
    narratives: {
      intro: [
        '${officerName}\'s condition has taken a turn for the worse.',
        'The underground doctor calls with grim news.',
        'Complications from ${officerName}\'s injuries require immediate action.',
      ],
      details: [
        'They need surgery that the street doc can\'t provide.',
        'Infection has set in - without proper care, they won\'t make it.',
        'The wounds are beyond what rest can heal.',
      ],
      consequences: [
        'Lose a valued member of the family, or risk exposure.',
        'Hospital records mean police scrutiny.',
        'Every hour you wait, the odds get worse.',
      ],
    },
    modifiers: [],
    choices: [
      {
        id: 'black_market_surgery',
        text: 'Black Market Surgeon',
        description: 'Expensive but discreet',
        requirements: { cash: 5000 },
        outcomes: [
          { probability: 0.8, description: 'The surgery is a success. They\'ll make a full recovery.', effects: { cash: -5000, loyalty: 15 } },
          { probability: 0.2, description: 'Complications arise. They survive but are changed.', effects: { cash: -5000 } },
        ],
      },
      {
        id: 'hospital',
        text: 'Risk the Hospital',
        description: 'Best care but leaves a paper trail',
        requirements: { cash: 3000 },
        outcomes: [
          { probability: 0.6, description: 'They recover fully. The records are buried.', effects: { cash: -3000, policeHeat: 5 } },
          { probability: 0.3, description: 'Police start asking questions about the gunshot wound.', effects: { cash: -3000, policeHeat: 15 } },
          { probability: 0.1, description: 'Arrested right from the hospital bed.', effects: { cash: -3000, arrestOfficer: true } },
        ],
      },
      {
        id: 'pray',
        text: 'Let Fate Decide',
        description: 'Maybe they\'ll pull through on their own',
        outcomes: [
          { probability: 0.3, description: 'Against all odds, they recover.', effects: { loyalty: 20 } },
          { probability: 0.7, description: 'They don\'t make it. The family mourns.', effects: { reputation: -15, loyalty: -10 } },
        ],
      },
    ],
  },

  // === LEGAL TROUBLE ===
  {
    type: 'legalTrouble',
    baseWeight: 5,
    severity: 'moderate',
    conditions: (state) => state.officers.some((o: any) => o.isArrested),
    narratives: {
      intro: [
        '${officerName}\'s lawyer calls with an update on their case.',
        'The prosecutor is pushing for maximum sentencing.',
        'A witness has come forward in ${officerName}\'s case.',
      ],
      details: [
        'They\'re looking at 5-10 years if convicted.',
        'The evidence against them is substantial but not airtight.',
        'A key witness can be... persuaded.',
      ],
      consequences: [
        'Losing them to prison would be a blow to operations.',
        'But aggressive action could make things worse.',
        'Time is running out before trial.',
      ],
    },
    modifiers: [],
    choices: [
      {
        id: 'top_lawyer',
        text: 'Hire the Best Lawyer',
        description: 'Money talks in the courtroom',
        requirements: { cash: 8000 },
        outcomes: [
          { probability: 0.7, description: 'The lawyer works magic. Case dismissed.', effects: { cash: -8000 } },
          { probability: 0.3, description: 'Reduced charges. They\'ll be out soon.', effects: { cash: -8000 } },
        ],
      },
      {
        id: 'witness',
        text: 'Handle the Witness',
        description: 'Make sure they don\'t testify',
        requirements: { intel: 25 },
        outcomes: [
          { probability: 0.5, description: 'The witness recants. Case falls apart.', effects: { intel: -25, policeHeat: 5 } },
          { probability: 0.3, description: 'Witness tampering charges added to the case.', effects: { intel: -25, policeHeat: 15 } },
          { probability: 0.2, description: 'The witness disappears. Problem solved.', effects: { intel: -25, policeHeat: 20, reputation: 5 } },
        ],
      },
      {
        id: 'accept',
        text: 'Accept Their Fate',
        description: 'Some battles can\'t be won',
        outcomes: [
          { probability: 1.0, description: 'They go away for years. The family remembers their sacrifice.', effects: { reputation: -10 } },
        ],
      },
    ],
  },
];

// Generate a unique event with narrative
export function generateDynamicEvent(state: any): { template: DynamicEventTemplate; narrative: string; modifier: EventModifier | null; data: any } | null {
  const validTemplates = EVENT_TEMPLATES.filter(t => t.conditions(state));
  if (validTemplates.length === 0) return null;

  // Weighted random selection
  const totalWeight = validTemplates.reduce((sum, t) => sum + t.baseWeight, 0);
  let random = Math.random() * totalWeight;
  
  let selected: DynamicEventTemplate | null = null;
  for (const template of validTemplates) {
    random -= template.baseWeight;
    if (random <= 0) {
      selected = template;
      break;
    }
  }
  
  if (!selected) return null;

  // Pick a random modifier if available
  const modifiers = EVENT_MODIFIERS[selected.type] || [];
  const modifier = modifiers.length > 0 && Math.random() > 0.5 
    ? pickRandom(modifiers) 
    : null;

  // Generate narrative
  const narrativeTemplate = pickRandom(selected.narratives.intro);
  const detailTemplate = pickRandom(selected.narratives.details);
  const consequenceTemplate = pickRandom(selected.narratives.consequences);

  // Get context for template replacement
  const context = getEventContext(state, selected.type);
  
  const narrative = `${replaceTemplateVars(narrativeTemplate, context)}\n\n${replaceTemplateVars(detailTemplate, context)}\n\n${replaceTemplateVars(consequenceTemplate, context)}`;

  return {
    template: selected,
    narrative,
    modifier,
    data: context,
  };
}

function getEventContext(state: any, eventType: string): Record<string, string> {
  const context: Record<string, string> = {
    informantName: generateInformantName(),
    policeUnit: generatePoliceUnit(),
    location: generateLocation(),
    weather: generateWeather(),
  };

  // Add officer context
  const activeOfficers = (state.officers || []).filter((o: any) => !o.isWounded && !o.isArrested);
  if (activeOfficers.length > 0) {
    const officer = pickRandom(activeOfficers) as any;
    context.officerName = officer.name || 'Unknown';
    context.officerId = officer.id || '';
  }

  // Add wounded officer context
  const woundedOfficers = (state.officers || []).filter((o: any) => o.isWounded);
  if (woundedOfficers.length > 0) {
    const wounded = pickRandom(woundedOfficers) as any;
    context.woundedOfficerName = wounded.name || 'Unknown';
    context.woundedOfficerId = wounded.id || '';
  }

  // Add arrested officer context
  const arrestedOfficers = (state.officers || []).filter((o: any) => o.isArrested);
  if (arrestedOfficers.length > 0) {
    const arrested = pickRandom(arrestedOfficers) as any;
    context.arrestedOfficerName = arrested.name || 'Unknown';
    context.arrestedOfficerId = arrested.id || '';
  }

  // Add building context
  const occupiedBuildings = (state.buildings || []).filter((b: any) => b.isOccupied);
  if (occupiedBuildings.length > 0) {
    const building = pickRandom(occupiedBuildings) as any;
    context.buildingName = building.name || 'Building';
    context.buildingId = building.id || '';
  }

  // Add rival context
  const hostileRivals = (state.rivals || []).filter((r: any) => r.relationship < 0);
  if (hostileRivals.length > 0) {
    const rival = pickRandom(hostileRivals) as any;
    context.rivalName = rival.name || 'Rival';
    context.rivalId = rival.id || '';
  }

  // Add financial context
  context.cashAtRisk = String(Math.floor((state.cash || 0) * 0.2));

  return context;
}

function replaceTemplateVars(template: string, context: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(context)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// Resolve an event choice with probabilistic outcomes
export function resolveEventChoice(
  choice: EventChoiceTemplate, 
  modifier: EventModifier | null
): EventOutcome {
  let random = Math.random();
  
  // Apply modifier effects to probabilities if applicable
  for (const outcome of choice.outcomes) {
    random -= outcome.probability;
    if (random <= 0) {
      // Apply modifier effects to outcome
      if (modifier) {
        const modifiedEffects = { ...outcome.effects };
        // Modify based on modifier effects
        if (modifier.effect.bribeCostMultiplier && modifiedEffects.cash) {
          modifiedEffects.cash = Math.floor(modifiedEffects.cash * modifier.effect.bribeCostMultiplier);
        }
        if (modifier.effect.reputationMultiplier && modifiedEffects.reputation) {
          modifiedEffects.reputation = Math.floor(modifiedEffects.reputation * modifier.effect.reputationMultiplier);
        }
        return { ...outcome, effects: modifiedEffects };
      }
      return outcome;
    }
  }
  
  return choice.outcomes[choice.outcomes.length - 1];
}
