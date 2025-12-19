import { useGameStore } from '@/stores/gameStore';
import { PoliceRaidModal } from './modals/PoliceRaidModal';
import { BetrayalModal } from './modals/BetrayalModal';
import { CriminalModal } from './modals/CriminalModal';
import { RivalAttackModal } from './modals/RivalAttackModal';
import { DesertionNotice } from './modals/DesertionNotice';
import { TerritoryUltimatumModal } from './modals/TerritoryUltimatumModal';
import { StreetWarModal } from './modals/StreetWarModal';
import { PostWarSummaryModal } from './modals/PostWarSummaryModal';
import { CoupAttemptModal } from './modals/CoupAttemptModal';
import { NewEraModal } from './modals/NewEraModal';
import { DailyBriefingModal } from './modals/DailyBriefingModal';

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
    case 'postConflictSummary':
      return <PostWarSummaryModal data={eventData} />;
    case 'coupAttempt':
      return <CoupAttemptModal data={eventData} />;
    case 'newEra':
      return <NewEraModal data={eventData} />;
    case 'dailyBriefing':
      return <DailyBriefingModal data={eventData} />;
    default:
      return null;
  }
};