import { Soldier } from '../store/types';

const SOLDIER_NAMES = ['Ah Keung', 'Wai Gor', 'Siu Ming', 'Ah Fat', 'Lok Jai', 'Ah Sing', 'Chi Wai', 'Hung Jai'];

export const INITIAL_SOLDIERS: StreetSoldier[] = Array.from({ length: 6 }, (_, i) => ({
  id: `sol-${i + 1}`,
  name: SOLDIER_NAMES[i],
  loyalty: 60 + Math.floor(Math.random() * 20),
  needs: {
    food: 70 + Math.floor(Math.random() * 20),
    entertainment: 50 + Math.floor(Math.random() * 30),
    pay: 60,
  },
  skill: 30 + Math.floor(Math.random() * 40),
  isDeserting: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
}));