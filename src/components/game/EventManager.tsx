import { useGameStore } from '@/stores/gameStore';
import { PoliceRaidModal } from './modals/PoliceRaidModal';
import { BetrayalModal } from './modals/BetrayalModal';
import { CriminalModal } from './modals/CriminalModal';
import { RivalAttackModal } from './modals/RivalAttackModal';
import { DesertionNotice } from './modals/DesertionNotice';
import { TerritoryUltimatumModal } from './modals/TerritoryUltimatumModal';
import { StreetWarModal } from './modals/StreetWarModal';

export const EventManager = () => {
  const { activeEvent, eventData } = useGameStore();
  
  switch (activeEvent) {
    case 'policeRaid':
      return <PoliceRaidModal />;
    case 'betrayal':
      return <BetrayalModal data={eventData} />;
    case 'criminalCaught':
      return <CriminalModal data={eventData} />;
    case 'rivalAttack':
      return <RivalAttackModal data={eventData} />;
    case 'soldierDesertion':
      return <DesertionNotice data={eventData} />;
    case 'territoryUltimatum':
      return <TerritoryUltimatumModal />;
    case 'streetWar':
      return <StreetWarModal />;
    default:
      return null;
  }
};