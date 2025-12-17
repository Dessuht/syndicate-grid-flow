import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { UserX, Heart, Skull, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BetrayalModalProps {
  data: {
    officerId: string;
    officerName: string;
  };
}

export const BetrayalModal = ({ data }: BetrayalModalProps) => {
  const { handleBetrayalChoice, dismissEvent, officers } = useGameStore();
  const officer = officers.find(o => o.id === data.officerId);

  if (!officer) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-magenta/50 neon-glow-magenta"
      >
        <button
          onClick={dismissEvent}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-magenta/20 border border-neon-magenta/50">
            <UserX className="w-8 h-8 text-neon-magenta" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-magenta">BETRAYAL</h2>
            <p className="text-muted-foreground">{data.officerName} plots against you</p>
          </div>
        </div>

        <p className="text-foreground mb-4 leading-relaxed">
          Your informants report that <span className="text-neon-magenta font-semibold">{data.officerName}</span> has been 
          meeting with rival gangs in secret. They feel overlooked and disrespected after being 
          passed over for lucrative assignments.
        </p>

        <div className="p-3 rounded-lg bg-secondary/30 mb-6">
          <p className="text-xs text-muted-foreground mb-2">Officer Status:</p>
          <div className="flex items-center justify-between">
            <span className="text-sm">{officer.rank}</span>
            <span className="text-sm text-neon-red">Loyalty: {officer.loyalty}%</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
            onClick={() => handleBetrayalChoice('forgive')}
          >
            <div className="p-2 rounded bg-neon-green/20">
              <Heart className="w-5 h-5 text-neon-green" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Forgive & Reconcile</p>
              <p className="text-xs text-muted-foreground">
                +20 Loyalty to {data.officerName} • -10 Reputation (looks weak)
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
            onClick={() => handleBetrayalChoice('punish')}
          >
            <div className="p-2 rounded bg-neon-red/20">
              <Skull className="w-5 h-5 text-neon-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Punish Severely</p>
              <p className="text-xs text-muted-foreground">
                -30 Loyalty, -40 Energy to {data.officerName} • Others +5 Loyalty (fear) • +5 Heat
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
            onClick={() => handleBetrayalChoice('exile')}
          >
            <div className="p-2 rounded bg-neon-amber/20">
              <LogOut className="w-5 h-5 text-neon-amber" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Exile from Family</p>
              <p className="text-xs text-muted-foreground">
                {data.officerName} leaves permanently • Lose their skills
              </p>
            </div>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
