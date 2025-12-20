import { Officer } from '@/stores/gameStoreTypes';
import { useGameStore } from '@/stores/gameStore';

interface OfficerStatusWarningsProps {
  officer: Officer;
}

export const OfficerStatusWarnings = ({ officer }: OfficerStatusWarningsProps) => {
  const { currentPhase } = useGameStore();
  
  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;

  return (
    <>
      {!isMorning && (
        <p className="mt-4 text-xs text-neon-amber text-center">
          Interactions are only available during the Morning phase.
        </p>
      )}
      {isUnavailable && (
        <p className="mt-4 text-xs text-neon-red text-center">
          Officer is {officer.isWounded ? 'WOUNDED' : 'ARRESTED'} and cannot be interacted with.
        </p>
      )}
    </>
  );
};