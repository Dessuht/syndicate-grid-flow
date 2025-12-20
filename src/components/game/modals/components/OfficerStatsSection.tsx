import { Officer } from '@/stores/gameStoreTypes';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Heart, Star, Zap, Briefcase } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

const PROMOTION_FACE_REQUIREMENT = 50;

interface OfficerStatsSectionProps {
  officer: Officer;
}

export const OfficerStatsSection = ({ officer }: OfficerStatsSectionProps) => {
  const { currentPhase } = useGameStore();
  const isMorning = currentPhase === 'morning';
  const canInteract = isMorning && !officer.isWounded && !officer.isArrested;

  return (
    <div className="space-y-3 mb-6 p-3 rounded-lg bg-secondary/30 border border-border">
      {/* Loyalty Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-neon-green" />
            <span className="text-muted-foreground">Loyalty</span>
          </div>
          <span className={cn(
            "font-medium",
            officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
          )}>
            {officer.loyalty}%
          </span>
        </div>
        <Progress 
          value={officer.loyalty} 
          className="h-1.5 bg-slate-800"
          indicatorClassName={cn(
            officer.loyalty > 60 ? "bg-neon-green" : officer.loyalty > 40 ? "bg-neon-amber" : "bg-neon-red"
          )}
        />
      </div>
      
      {/* Face Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-jianghu-gold" />
            <span className="text-muted-foreground">Face (Prestige)</span>
          </div>
          <span className={cn(
            "font-medium",
            officer.face >= PROMOTION_FACE_REQUIREMENT ? "text-jianghu-gold" : "text-muted-foreground"
          )}>
            {officer.face}%
          </span>
        </div>
        <Progress 
          value={officer.face} 
          className="h-1.5 bg-slate-800"
          indicatorClassName="bg-jianghu-gold"
        />
      </div>

      {/* Energy Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-neon-magenta" />
            <span className="text-muted-foreground">Energy</span>
          </div>
          <span className="text-neon-magenta font-medium">{officer.energy}/{officer.maxEnergy}</span>
        </div>
        <Progress 
          value={(officer.energy / officer.maxEnergy) * 100} 
          className="h-1.5 bg-slate-800"
          indicatorClassName="bg-neon-magenta"
        />
      </div>
      
      {/* Agenda */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-neon-amber" />
          <span className="text-xs font-semibold text-neon-amber">Current Agenda</span>
        </div>
        <p className="text-sm mt-1 text-foreground">
          {officer.currentAgenda || (canInteract ? 'Unknown. Share Tea to reveal.' : 'Unknown.')}
        </p>
      </div>
    </div>
  );
};