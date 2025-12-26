import { RivalGang } from '../store/types';

export const INITIAL_RIVALS: RivalGang[] = [
  {
    id: 'rival-1',
    name: '14K Triad',
    district: 'Mong Kok',
    strength: 70,
    relationship: -35,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rival-2',
    name: 'Sun Yee On',
    district: 'Tsim Sha Tsui',
    strength: 90,
    relationship: -10,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rival-3',
    name: 'Wo Shing Wo',
    district: 'Central',
    strength: 120,
    relationship: -55,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rival-4',
    name: 'Bamboo Union',
    district: 'Wan Chai',
    strength: 85,
    relationship: -25,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rival-5',
    name: 'Big Circle Gang',
    district: 'Kowloon City',
    strength: 100,
    relationship: -45,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];