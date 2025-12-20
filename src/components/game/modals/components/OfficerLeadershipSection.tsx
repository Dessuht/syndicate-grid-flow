import { Officer } from '@/stores/gameStoreTypes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface OfficerLeadershipSectionProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerLeadershipSection = ({ officer, onClose }: OfficerLeadershipSectionProps) => {
  const { currentPhase, designateSuccessor } = useGameStore();
  
  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;
  const isSuccessor = officer.isSuccessor;

  const handleDesignateSuccessor = () => {
    designateSuccessor(officer.id);
    onClose();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold mb-3">Leadership</h3>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start gap-3 h-auto py-3",
          isSuccessor 
            ? "border-jianghu-gold/50 bg-jianghu-gold/10 text-jianghu-gold" 
            : "border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
        )}
        onClick={handleDesignateSuccessor}
        disabled={!canInteract}
      >
        <div className={cn("p-2 rounded", isSuccessor ? "bg-jianghu-gold/20" : "bg-neon-cyan/20")}>
          <Crown className={cn("w-5 h-5", isSuccessor ? "text-jianghu-gold" : "text-neon-cyan")} />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">
            {isSuccessor ? 'Successor Designated' : 'Designate Successor'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isSuccessor ? 'This officer will take over if you fall.' : 'Name this officer as your Vanguard.'}
          </p>
        </div>
      </Button>
    </div>
  );
};