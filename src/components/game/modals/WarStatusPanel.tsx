import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Swords, Shield, TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarStatusPanelProps {
  onOpenBattleModal: (rivalId: string) => void;
}

export const WarStatusPanel = ({ onOpenBattleModal }: WarStatusPanelProps) => {
  const { rivals, soldiers, officers, territoryFriction, currentDay } = useGameStore();
  
  const activeConflicts = rivals.filter(r => r.isActiveConflict);
  const ourStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0) +
    officers.filter(o => !o.isWounded && !o.isArrested).reduce((sum, o) => sum + o.skills.enforcement, 0);
  
  if (activeConflicts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-neon-red/5 border-2 border-neon-red/30 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-5 h-5 text-neon-red animate-pulse" />
        <h3 className="font-display font-bold text-neon-red">ACTIVE WARS</h3>
        <span className="ml-auto text-xs text-muted-foreground">Territory Friction: {Math.floor(territoryFriction)}%</span>
      </div>
      
      {/* Friction Warning */}
      {territoryFriction > 50 && (
        <div className="p-2 rounded bg-neon-amber/10 border border-neon-amber/30 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-amber" />
          <span className="text-xs text-neon-amber">
            High friction! Daily income reduced by {Math.floor(territoryFriction / 2)}%
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {activeConflicts.map(rival => {
          const strengthRatio = ourStrength / (ourStrength + rival.strength);
          const advantage = strengthRatio > 0.55 ? 'winning' : strengthRatio < 0.45 ? 'losing' : 'even';
          
          return (
            <div 
              key={rival.id}
              className="p-3 rounded-lg bg-card border border-neon-red/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{rival.name}</h4>
                  <p className="text-xs text-muted-foreground">{rival.district}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                  advantage === 'winning' && "bg-neon-green/20 text-neon-green",
                  advantage === 'losing' && "bg-neon-red/20 text-neon-red",
                  advantage === 'even' && "bg-neon-amber/20 text-neon-amber"
                )}>
                  {advantage === 'winning' && <TrendingUp className="w-3 h-3" />}
                  {advantage === 'losing' && <TrendingDown className="w-3 h-3" />}
                  {advantage === 'even' && <span>≈</span>}
                  {advantage === 'winning' ? 'Advantage' : advantage === 'losing' ? 'Disadvantage' : 'Even'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-neon-cyan" />
                  <span>Our: <span className="text-neon-cyan font-bold">{ourStrength}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-neon-red" />
                  <span>Enemy: <span className="text-neon-red font-bold">{rival.strength}</span></span>
                </div>
              </div>
              
              <Progress 
                value={strengthRatio * 100} 
                className="h-1.5 mb-3"
              />
              
              <Button
                size="sm"
                className="w-full gap-2 bg-neon-red hover:bg-neon-red/80 text-white"
                onClick={() => onOpenBattleModal(rival.id)}
              >
                <Swords className="w-4 h-4" />
                Deploy Forces
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Daily Cost Warning */}
      <div className="mt-3 p-2 rounded bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <DollarSign className="w-3 h-3" />
          <span>War costs: ${activeConflicts.length * 100}/day in supplies and bribes</span>
        </div>
      </div>
    </motion.div>
  );
};
