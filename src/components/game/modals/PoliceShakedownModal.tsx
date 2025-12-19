import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, DollarSign, Shield, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PoliceShakedownData {
  buildingName: string;
  officerName: string;
  officerId: string;
  bribeCost: number;
}

export const PoliceShakedownModal = () => {
  const { activeEvent, eventData, handleShakedownChoice, cash } = useGameStore();

  if (activeEvent !== 'policeShakedown') return null;
  
  const data: PoliceShakedownData = eventData;
  const canBribe = cash >= data.bribeCost;

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
          className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-cyan/50 neon-glow-cyan"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold neon-text-cyan">POLICE SHAKEDOWN</h2>
              <p className="text-muted-foreground">Activity at {data.buildingName} noticed</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground mb-6 leading-relaxed">
            A patrol unit has arrived at <span className="text-neon-cyan font-semibold">{data.buildingName}</span>, demanding a 'fine' 
            to overlook your operations. <span className="text-neon-amber font-semibold">{data.officerName}</span> is currently managing the situation.
          </p>

          {/* Choices */}
          <div className="space-y-3">
            {/* Bribe */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
              disabled={!canBribe}
              onClick={() => handleShakedownChoice('bribe')}
            >
              <div className="p-2 rounded bg-neon-amber/20">
                <DollarSign className="w-5 h-5 text-neon-amber" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Pay the Bribe</p>
                <p className="text-xs text-muted-foreground">
                  Cost: ${data.bribeCost.toLocaleString()} • Heat reset to 0
                </p>
              </div>
            </Button>

            {/* Lay Low */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
              onClick={() => handleShakedownChoice('layLow')}
            >
              <div className="p-2 rounded bg-neon-green/20">
                <Shield className="w-5 h-5 text-neon-green" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Lay Low</p>
                <p className="text-xs text-muted-foreground">
                  Building closed for 2 days • Officer unassigned
                </p>
              </div>
            </Button>

            {/* Resist */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={() => handleShakedownChoice('resist')}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Lock className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Resist</p>
                <p className="text-xs text-muted-foreground">
                  50% chance to avoid fine • 50% chance officer is arrested
                </p>
              </div>
            </Button>
          </div>

          {!canBribe && (
            <p className="mt-4 text-xs text-neon-red text-center">
              Insufficient funds for bribery.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};