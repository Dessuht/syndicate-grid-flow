import { Officer, OfficerRank } from '@/stores/gameStoreTypes';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

const PROMOTION_COST = 5000;
const PROMOTION_FACE_REQUIREMENT = 50;

interface OfficerPromotionSectionProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerPromotionSection = ({ officer, onClose }: OfficerPromotionSectionProps) => {
  const { cash, promoteOfficer } = useGameStore();
  
  const canPromote = officer.face >= PROMOTION_FACE_REQUIREMENT && cash >= PROMOTION_COST;
  const isMaxRank = officer.rank === 'Deputy (438)' || officer.rank === 'Dragonhead (489)';
  const promotionAvailable = !isMaxRank && (officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' || officer.rank === 'Straw Sandal' || officer.rank === 'Blue Lantern');
  const nextRank = officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' ? 'Deputy (438)' : 'Dragonhead (489)';

  const handlePromote = (rank: OfficerRank) => {
    promoteOfficer(officer.id, rank);
    onClose();
  };

  if (!promotionAvailable) return null;

  return (
    <div className="mt-6 pt-4 border-t border-border space-y-3">
      <h3 className="font-display text-lg font-bold text-jianghu-gold">Promotion Ceremony</h3>
      
      <Button
        variant="cyber"
        className="w-full justify-start gap-3 h-auto py-3"
        onClick={() => handlePromote(nextRank as OfficerRank)}
        disabled={!canPromote}
      >
        <div className="p-2 rounded bg-jianghu-gold/20">
          <TrendingUp className="w-5 h-5 text-jianghu-gold" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">Promote to {nextRank}</p>
          <p className="text-xs text-muted-foreground">
            Cost: ${PROMOTION_COST.toLocaleString()} • Requires {PROMOTION_FACE_REQUIREMENT} Face
          </p>
        </div>
      </Button>
      
      {!canPromote && (
        <p className="text-[10px] text-center text-neon-amber">
          Requires ${PROMOTION_COST.toLocaleString()} cash and {PROMOTION_FACE_REQUIREMENT} Face.
        </p>
      )}
    </div>
  );
};