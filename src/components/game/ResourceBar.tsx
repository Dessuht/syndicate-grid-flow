import { DollarSign, Star, AlertTriangle, Calendar, Brain, Users, Zap } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ResourceBar = () => {
  const { cash, reputation, policeHeat, currentDay, intel, influence, soldiers, officers } = useGameStore();
  const heatColor = policeHeat > 70 ? 'neon-text-red' : policeHeat > 40 ? 'neon-text-amber' : 'neon-text-green';
  const activeOfficers = officers.filter(o => o.assignedBuildingId).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border"
    >
      <div className="flex items-center gap-6">
        {/* Cash */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
            <DollarSign className="w-4 h-4 text-neon-amber" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cash</p>
            <p className="text-sm font-bold neon-text-amber">${cash.toLocaleString()}</p>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <Star className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rep</p>
            <p className="text-sm font-bold neon-text-green">{reputation}</p>
          </div>
        </div>

        {/* Police Heat */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg border",
            policeHeat > 70 ? 'bg-neon-red/20 border-neon-red/50 animate-pulse' : 'bg-neon-red/10 border-neon-red/30'
          )}>
            <AlertTriangle className={cn("w-4 h-4", policeHeat > 70 ? 'text-neon-red' : 'text-neon-red/70')} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Heat</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-bold", heatColor)}>{policeHeat}%</p>
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="heat-bar h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${policeHeat}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Intel */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Brain className="w-4 h-4 text-neon-cyan" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Intel</p>
            <p className="text-sm font-bold neon-text-cyan">{intel}</p>
          </div>
        </div>
        
        {/* Influence */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <Zap className="w-4 h-4" style={{ color: 'hsl(var(--neon-purple))' }} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Influence</p>
            <p className="text-sm font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>{influence}</p>
          </div>
        </div>

        {/* Manpower */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
            <Users className="w-4 h-4 text-neon-magenta" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Forces</p>
            <p className="text-sm font-bold">
              <span className="neon-text-magenta">{activeOfficers}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{officers.length}</span>
              <span className="text-muted-foreground text-xs ml-1">+ {soldiers.length} soldiers</span>
            </p>
          </div>
        </div>
      </div>

      {/* Day Counter */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Day</p>
          <p className="text-xl font-display font-bold neon-text-cyan">{currentDay}</p>
        </div>
      </div>
    </motion.div>
  );
};