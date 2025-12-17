import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Swords, Shield, HandCoins, Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RivalAttackModalProps {
  data: {
    rivalId: string;
    rivalName: string;
  };
}

export const RivalAttackModal = ({ data }: RivalAttackModalProps) => {
  const { handleRivalAttackChoice, dismissEvent, soldiers, officers, rivals, cash } = useGameStore();

  const rival = rivals.find(r => r.id === data.rivalId);
  if (!rival) return null;

  // Calculate our strength
  const soldierStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);
  const redPole = officers.find(o => o.rank === 'Red Pole');
  const strengthBonus = redPole ? redPole.skills.enforcement : 0;
  const totalStrength = soldierStrength + strengthBonus;

  const willWin = totalStrength > rival.strength;

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
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-purple/50"
        style={{ boxShadow: '0 0 30px hsl(270 100% 60% / 0.3)' }}
      >
        <button
          onClick={dismissEvent}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-purple/20 border border-neon-purple/50 animate-pulse">
            <Swords className="w-8 h-8" style={{ color: 'hsl(var(--neon-purple))' }} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>
              RIVAL ATTACK
            </h2>
            <p className="text-muted-foreground">{rival.name} assaults your territory</p>
          </div>
        </div>

        <p className="text-foreground mb-4 leading-relaxed">
          The <span className="font-semibold" style={{ color: 'hsl(var(--neon-purple))' }}>{rival.name}</span> from{' '}
          {rival.district} have launched an attack on your operations. Your men await your orders.
        </p>

        {/* Strength Comparison */}
        <div className="p-3 rounded-lg bg-secondary/30 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Force Comparison</span>
            <span className={`text-xs font-medium ${willWin ? 'text-neon-green' : 'text-neon-red'}`}>
              {willWin ? 'Advantage: YOU' : 'Advantage: ENEMY'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Your Strength</p>
              <p className="text-lg font-bold text-neon-cyan">{totalStrength}</p>
              {redPole && (
                <p className="text-xs text-neon-cyan">+{strengthBonus} (Big Chan)</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Enemy Strength</p>
              <p className="text-lg font-bold text-neon-red">{rival.strength}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
            onClick={() => handleRivalAttackChoice('fight')}
          >
            <div className="p-2 rounded bg-neon-red/20">
              <Shield className="w-5 h-5 text-neon-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Fight Back</p>
              <p className="text-xs text-muted-foreground">
                {willWin 
                  ? 'Victory likely: +15 Rep, +$1,000, weaken enemy'
                  : 'Defeat likely: -20 Rep, -$1,500, lose a soldier'
                }
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
            disabled={cash < 800}
            onClick={() => handleRivalAttackChoice('negotiate')}
          >
            <div className="p-2 rounded bg-neon-amber/20">
              <HandCoins className="w-5 h-5 text-neon-amber" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay Tribute</p>
              <p className="text-xs text-muted-foreground">
                -$800 • Improve relations with {rival.name}
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/10"
            onClick={() => handleRivalAttackChoice('retreat')}
          >
            <div className="p-2 rounded bg-muted/20">
              <Flag className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Strategic Retreat</p>
              <p className="text-xs text-muted-foreground">
                -10 Reputation • Random building closed 2 days
              </p>
            </div>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
