import { Officer } from '@/stores/gameStoreTypes';
import { Button } from '@/components/ui/button';
import { MessageSquare, DollarSign, Skull } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface OfficerBasicInteractionsProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerBasicInteractions = ({ officer, onClose }: OfficerBasicInteractionsProps) => {
  const { currentPhase, cash, shareTea, giveBonus, reprimandOfficer } = useGameStore();
  
  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;

  const handleShareTea = () => {
    shareTea(officer.id);
    if (officer.energy - 10 > 0) {
      onClose();
    } else {
      setTimeout(onClose, 100);
    }
  };

  const handleBonus = () => {
    giveBonus(officer.id);
    onClose();
  };

  const handleReprimand = () => {
    reprimandOfficer(officer.id);
    onClose();
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
        onClick={handleShareTea}
        disabled={!canInteract || officer.energy < 10}
      >
        <div className="p-2 rounded bg-neon-cyan/20">
          <MessageSquare className="w-5 h-5 text-neon-cyan" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">Share Tea</p>
          <p className="text-xs text-muted-foreground">
            +5 Loyalty, Reveal Agenda • -10 Energy
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
        onClick={handleBonus}
        disabled={!canInteract || cash < 1000}
      >
        <div className="p-2 rounded bg-neon-green/20">
          <DollarSign className="w-5 h-5 text-neon-green" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">Give Bonus</p>
          <p className="text-xs text-muted-foreground">
            -$1,000 • +20 Loyalty, Clears Ambition
          </p>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
        onClick={handleReprimand}
        disabled={!canInteract}
      >
        <div className="p-2 rounded bg-neon-red/20">
          <Skull className="w-5 h-5 text-neon-red" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">Reprimand</p>
          <p className="text-xs text-muted-foreground">
            -10 Heat • -20 Loyalty (Risk of Snitching/Quitting)
          </p>
        </div>
      </Button>
    </div>
  );
};