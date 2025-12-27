import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Users, Building2, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GangAttackModalProps {
  type: 'officer' | 'building';
}

export const GangAttackModal = ({ type }: GangAttackModalProps) => {
  const { eventData, dismissEvent, cash, soldiers, officers, buildings } = useGameStore();

  if (!eventData) return null;

  const handleDefend = () => {
    const state = useGameStore.getState();
    const cost = type === 'officer' ? eventData.defendCost : eventData.reinforceCost;
    
    if (state.cash < cost) return;
    
    // Successful defense
    useGameStore.setState((s) => ({
      cash: s.cash - cost,
      reputation: Math.min(100, s.reputation + 5),
      rivals: s.rivals.map(r => 
        r.id === eventData.rivalId 
          ? { ...r, relationship: r.relationship - 5 } 
          : r
      ),
    }));
    dismissEvent();
  };

  const handleFight = () => {
    const state = useGameStore.getState();
    const ourStrength = state.soldiers.reduce((sum, s) => sum + s.skill, 0) / 3;
    const victory = ourStrength > eventData.attackStrength;
    
    if (victory) {
      useGameStore.setState((s) => ({
        reputation: Math.min(100, s.reputation + 10),
        rivals: s.rivals.map(r => 
          r.id === eventData.rivalId 
            ? { ...r, relationship: r.relationship - 10, strength: Math.max(10, r.strength - 5) } 
            : r
        ),
      }));
    } else {
      // Take casualties
      if (type === 'officer') {
        useGameStore.setState((s) => ({
          officers: s.officers.map(o => 
            o.id === eventData.officerId 
              ? { ...o, isWounded: true, daysToRecovery: 3 } 
              : o
          ),
          reputation: Math.max(0, s.reputation - 5),
        }));
      } else {
        useGameStore.setState((s) => ({
          buildings: s.buildings.map(b => 
            b.id === eventData.buildingId 
              ? { ...b, baseRevenue: Math.max(100, b.baseRevenue - eventData.potentialDamage), inactiveUntilDay: s.currentDay + 2 } 
              : b
          ),
          reputation: Math.max(0, s.reputation - 5),
        }));
      }
    }
    dismissEvent();
  };

  const handleRetreat = () => {
    useGameStore.setState((s) => ({
      reputation: Math.max(0, s.reputation - 10),
      ...(type === 'officer' ? {
        officers: s.officers.map(o => 
          o.id === eventData.officerId 
            ? { ...o, loyalty: Math.max(0, o.loyalty - 10) } 
            : o
        ),
      } : {
        buildings: s.buildings.map(b => 
          b.id === eventData.buildingId 
            ? { ...b, baseRevenue: Math.max(100, b.baseRevenue - eventData.potentialDamage * 0.5), inactiveUntilDay: s.currentDay + 1 } 
            : b
        ),
      }),
    }));
    dismissEvent();
  };

  const cost = type === 'officer' ? eventData.defendCost : eventData.reinforceCost;
  const canAfford = cash >= cost;
  const ourStrength = soldiers.reduce((sum, s) => sum + s.skill, 0) / 3;
  const winChance = Math.min(95, Math.max(5, Math.floor((ourStrength / (ourStrength + eventData.attackStrength)) * 100)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-red/50"
        style={{ boxShadow: '0 0 40px hsl(0 100% 50% / 0.3)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50">
            {type === 'officer' ? (
              <Users className="w-8 h-8 text-neon-red" />
            ) : (
              <Building2 className="w-8 h-8 text-neon-red" />
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-neon-red">
              {type === 'officer' ? 'OFFICER UNDER ATTACK!' : 'BUILDING UNDER ATTACK!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {eventData.rivalName} is attacking {type === 'officer' ? eventData.officerName : eventData.buildingName}!
            </p>
          </div>
        </div>

        {/* Attack Details */}
        <div className="space-y-3 mb-6">
          <div className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Enemy Attack Strength</span>
              <span className="text-lg font-bold text-neon-red">{eventData.attackStrength}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Defense Strength</span>
              <span className="text-lg font-bold text-neon-cyan">{Math.floor(ourStrength)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
            <span className="text-sm">Win Chance if Fighting</span>
            <span className={cn(
              "font-bold px-2 py-0.5 rounded",
              winChance >= 60 ? "bg-neon-green/20 text-neon-green" :
              winChance >= 40 ? "bg-neon-amber/20 text-neon-amber" :
              "bg-neon-red/20 text-neon-red"
            )}>
              {winChance}%
            </span>
          </div>

          {type === 'building' && (
            <div className="flex items-center gap-2 p-2 rounded bg-neon-amber/10 border border-neon-amber/30">
              <AlertTriangle className="w-4 h-4 text-neon-amber" />
              <span className="text-xs text-neon-amber">
                Potential damage: ${eventData.potentialDamage}/day revenue loss
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full gap-2 bg-neon-cyan hover:bg-neon-cyan/80"
            onClick={handleDefend}
            disabled={!canAfford}
          >
            <Shield className="w-4 h-4" />
            {type === 'officer' ? 'Send Backup' : 'Reinforce Position'} (${cost})
          </Button>
          
          <Button
            variant="outline"
            className="w-full gap-2 border-neon-red/50 text-neon-red hover:bg-neon-red/10"
            onClick={handleFight}
          >
            <Swords className="w-4 h-4" />
            Stand and Fight ({winChance}% win)
          </Button>
          
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground"
            onClick={handleRetreat}
          >
            <Zap className="w-4 h-4" />
            {type === 'officer' ? 'Pull Back Officer' : 'Evacuate Building'} (-10 Rep)
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};