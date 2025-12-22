import { RivalGang } from '../store/types';

export const INITIAL_RIVALS: RivalGang[] = [
  {
    id: 'rival-1',
    name: '14K Triad',
    district: 'Mong Kok',
    strength: 45,
    relationship: -20,
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
    strength: 60,
    relationship: 10,
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
    strength: 75,
    relationship: -40,
    hasTradeAgreement: false,
    hasAlliance: false,
    isScouted: false,
    isActiveConflict: false,
    availableActions: ['trade', 'alliance', 'war'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];