import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, DollarSign, Swords, DoorOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PoliceRaidModal = () => {
  const { activeEvent, handleRaidChoice, cash, dismissEvent } = useGameStore();

  if (activeEvent !== 'policeRaid') return null;

  const canBribe = cash >= 2000;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-red/50 neon-glow-red"
        >
          {/* Close button (optional, for escape) */}
          <button
            onClick={dismissEvent}
            className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-neon-red" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold neon-text-red">POLICE RAID</h2>
              <p className="text-muted-foreground">The OCTB is at your door</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground mb-6 leading-relaxed">
            Inspector Wong's Organized Crime unit has your operations surrounded. 
            Your heat level attracted unwanted attention. Choose your response wisely.
          </p>

          {/* Choices */}
          <div className="space-y-3">
            {/* Bribe */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
              disabled={!canBribe}
              onClick={() => handleRaidChoice('bribe')}
            >
              <div className="p-2 rounded bg-neon-amber/20">
                <DollarSign className="w-5 h-5 text-neon-amber" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Bribe the Officers</p>
                <p className="text-xs text-muted-foreground">
                  Cost: $2,000 • Reduces heat by 30
                </p>
              </div>
            </Button>

            {/* Stand Ground */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={() => handleRaidChoice('stand')}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Swords className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Stand Your Ground</p>
                <p className="text-xs text-muted-foreground">
                  -15 Reputation • -20 Energy to all officers
                </p>
              </div>
            </Button>

            {/* Escape */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
              onClick={() => handleRaidChoice('escape')}
            >
              <div className="p-2 rounded bg-neon-cyan/20">
                <DoorOpen className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Scatter & Escape</p>
                <p className="text-xs text-muted-foreground">
                  Random building inactive for 3 days
                </p>
              </div>
            </Button>
          </div>

          {/* Warning if can't bribe */}
          {!canBribe && (
            <p className="mt-4 text-xs text-neon-red text-center">
              Insufficient funds for bribery
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
