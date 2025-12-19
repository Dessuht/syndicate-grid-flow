import { useGameStore, PostConflictSummaryData } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Star, Heart, Shield, X, AlertTriangle, UserMinus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostWarSummaryModalProps {
  data: PostConflictSummaryData;
}

export const PostWarSummaryModal = ({ data }: PostWarSummaryModalProps) => {
  const { dismissEvent, officers, rivals } = useGameStore();
  const officer = data.officerId ? officers.find(o => o.id === data.officerId) : null;
  const rival = data.rivalName ? rivals.find(r => r.name === data.rivalName) : null;

  const isSuccess = data.outcome === 'success';
  const title = isSuccess ? 'VICTORY SECURED' : 'SETBACK SUFFERED';
  const color = isSuccess ? 'neon-green' : 'neon-red';
  const glow = isSuccess ? 'neon-glow-green' : 'neon-glow-red';
  const icon = isSuccess ? Shield : AlertTriangle;
  const Icon = icon;

  const getOfficerStatusMessage = () => {
    if (!officer) return 'No officer involved.';
    switch (data.officerStatusEffect) {
      case 'wounded':
        return `${officer.name} was WOUNDED and requires rest. Energy severely reduced.`;
      case 'arrested':
        return `${officer.name} was ARRESTED by the police! Temporarily inactive.`;
      case 'none':
      default:
        return isSuccess ? `${officer.name} proved their worth.` : `${officer.name} survived the ordeal.`;
    }
  };

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
          className={cn(
            "relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2",
            `border-${color}/50`,
            glow
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "p-3 rounded-lg border",
              `bg-${color}/20 border-${color}/50`
            )}>
              <Icon className={cn("w-8 h-8", `text-${color}`)} />
            </div>
            <div>
              <h2 className={cn("font-display text-2xl font-bold", `neon-text-${color}`)}>
                {title}
              </h2>
              <p className="text-muted-foreground">
                {data.type === 'raid' ? 'Police Raid Resolution' : `Street War vs. ${data.rivalName}`}
              </p>
            </div>
          </div>

          {/* Summary Details */}
          <div className="space-y-4 mb-6">
            {/* Officer Status */}
            {officer && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Officer Report ({officer.name})</p>
                <p className="text-sm text-foreground">{getOfficerStatusMessage()}</p>
                
                {isSuccess && (
                    <p className="text-xs text-neon-green mt-1">
                        +10 Face (Prestige) | {officer.traits.includes('Battle Hardened') && 'Battle Hardened Acquired'}
                    </p>
                )}
                {!isSuccess && data.loyaltyChange < 0 && (
                    <p className="text-xs text-neon-red mt-1">
                        {data.loyaltyChange} Loyalty
                    </p>
                )}
              </div>
            )}

            {/* Casualties & Reputation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-neon-red" />
                  <p className="text-xs text-muted-foreground">Soldiers Lost</p>
                </div>
                <p className="text-xl font-bold neon-text-red mt-1">{data.soldiersLost}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-neon-green" />
                  <p className="text-xs text-muted-foreground">Reputation Change</p>
                </div>
                <p className={cn(
                  "text-xl font-bold mt-1",
                  data.reputationChange > 0 ? 'neon-text-green' : 'neon-text-red'
                )}>
                  {data.reputationChange > 0 ? '+' : ''}{data.reputationChange}
                </p>
              </div>
            </div>
            
            {/* Territory Status Update */}
            {data.type === 'streetWar' && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-neon-cyan" />
                        <p className="text-xs text-muted-foreground">Territory Status</p>
                    </div>
                    <p className="text-sm text-neon-cyan mt-1">
                        Conflict with {data.rivalName} resolved. Territory Friction reset to 0.
                    </p>
                </div>
            )}
          </div>

          <Button
            variant="cyber"
            className="w-full"
            onClick={dismissEvent}
          >
            Acknowledge & Continue
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};