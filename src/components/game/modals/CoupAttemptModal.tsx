import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Swords, HandCoins, X, Skull, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoupAttemptModalProps {
  data: {
    officerId: string;
    officerName: string;
    buildingName: string;
  };
}

export const CoupAttemptModal = ({ data }: CoupAttemptModalProps) => {
  const { handleCoupResolution, cash, intel, soldiers } = useGameStore();
  
  const loyalSoldierCount = soldiers.length;
  const negotiateCost = 5000;
  const intelCost = 50;
  const canNegotiate = cash >= negotiateCost && intel >= intelCost;
  
  // Find the rebel base to display its strength
  const rebelBase = useGameStore.getState().buildings.find(b => b.isRebelBase && b.assignedOfficerId === data.officerId);
  const rebelSoldierCount = rebelBase?.rebelSoldierCount || 0;
  
  const loyalStrength = loyalSoldierCount * 50; // Simplified strength calculation
  const rebelStrength = rebelSoldierCount * 50;
  const raidSuccessLikely = loyalStrength > rebelStrength;

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
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 animate-pulse">
              <Skull className="w-8 h-8 text-neon-red" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold neon-text-red">THE SCHISM</h2>
              <p className="text-muted-foreground">{data.officerName} has rebelled!</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground mb-4 leading-relaxed">
            <span className="text-neon-red font-semibold">{data.officerName}</span> has seized the{' '}
            <span className="text-neon-amber font-semibold">{data.buildingName}</span> and declared independence. 
            They have taken <span className="text-neon-red">{rebelSoldierCount}</span> of your soldiers. 
            You must crush the rebellion or buy their loyalty back immediately.
          </p>
          
          {/* Strength Comparison */}
          <div className="p-3 rounded-lg bg-secondary/30 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Raid Comparison</span>
              <span className={`text-xs font-medium ${raidSuccessLikely ? 'text-neon-green' : 'text-neon-red'}`}>
                {raidSuccessLikely ? 'Advantage: YOU' : 'Advantage: REBELS'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Your Loyal Forces</p>
                <p className="text-lg font-bold text-neon-cyan">{loyalSoldierCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rebel Forces</p>
                <p className="text-lg font-bold text-neon-red">{rebelSoldierCount}</p>
              </div>
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {/* Raid */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={() => handleCoupResolution('raid', data.officerId)}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Swords className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Launch Raid</p>
                <p className="text-xs text-muted-foreground">
                  Crush the rebellion by force. High risk of casualties.
                </p>
              </div>
            </Button>

            {/* Negotiate */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
              disabled={!canNegotiate}
              onClick={() => handleCoupResolution('negotiate', data.officerId)}
            >
              <div className="p-2 rounded bg-neon-amber/20">
                <HandCoins className="w-5 h-5 text-neon-amber" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Negotiate Loyalty</p>
                <p className="text-xs text-muted-foreground">
                  Cost: ${negotiateCost.toLocaleString()} + {intelCost} Intel • -50 Rep
                </p>
              </div>
            </Button>
          </div>

          {!canNegotiate && (
            <p className="mt-4 text-xs text-neon-red text-center">
              Insufficient funds or intel for negotiation.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};