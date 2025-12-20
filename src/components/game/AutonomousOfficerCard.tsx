import { motion } from 'framer-motion';
import { Swords, BookOpen, Footprints, Lamp, Heart, Star, Activity, AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutonomousOfficerCardProps {
  officer: AutonomousCharacter;
  isSelected: boolean;
  onSelect: () => void;
  buildingName?: string;
  disabled?: boolean;
}

const MOOD_COLORS = {
  loyal: 'text-neon-green',
  content: 'text-neon-cyan', 
  restless: 'text-neon-amber',
  ambitious: 'text-neon-magenta',
  disloyal: 'text-neon-red',
  desperate: 'text-red-600'
};

const MOOD_ICONS = {
  loyal: Heart,
  content: Star,
  restless: Activity,
  ambitious: Swords,
  disloyal: AlertTriangle,
  desperate: AlertTriangle
};

export const AutonomousOfficerCard = ({ 
  officer, 
  isSelected, 
  onSelect, 
  buildingName, 
  disabled 
}: AutonomousOfficerCardProps) => {
  const MoodIcon = MOOD_ICONS[officer.currentMood];
  const criticalNeeds = officer.needsManager.getCriticalNeeds();
  
  return (
    <motion.div
      layout
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "p-3 rounded-lg border transition-all duration-200 relative",
        isSelected 
          ? "bg-primary/20 border-primary neon-glow-cyan" 
          : "bg-card border-border hover:border-primary/50",
        officer.energy === 0 && "opacity-50",
        officer.assignedBuildingId && "border-neon-green/30",
        disabled ? "cursor-default" : "cursor-pointer",
        criticalNeeds.length > 0 && "border-neon-red/30"
      )}
      onClick={!disabled ? onSelect : undefined}
    >
      {/* Status indicators */}
      {criticalNeeds.length > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neon-red border-2 border-background flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 text-background" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar and Mood */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border font-display font-bold text-sm",
            "bg-gradient-to-br from-neon-blue to-neon-purple text-white"
          )}>
            {officer.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            MOOD_COLORS[officer.currentMood]
          )}>
            <MoodIcon className="w-3 h-3" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground truncate">
              {officer.name}
            </h4>
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {officer.rank}
            </span>
            <span className={cn(
              "text-xs font-medium",
              MOOD_COLORS[officer.currentMood]
            )}>
              ({officer.currentMood})
            </span>
          </div>
          
          {/* Current Action */}
          {officer.currentAgenda && (
            <p className="text-xs text-muted-foreground mb-2 italic">
              "{officer.currentAgenda}"
            </p>
          )}

          {/* Needs Display */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {Object.entries(officer.needs).slice(0, 6).map(([need, value]) => {
              const isCritical = value < 30;
              return (
                <div key={need} className="flex flex-col items-center">
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        isCritical ? "bg-neon-red" : value > 60 ? "bg-neon-green" : "bg-neon-amber"
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground capitalize">
                    {need.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <Heart className={cn(
                "w-3 h-3",
                officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
              )} />
              <span>{officer.loyalty}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className={cn(
                "w-3 h-3",
                officer.face > 50 ? "text-jianghu-gold" : "text-muted-foreground"
              )} />
              <span>{officer.face}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-1 mt-2">
        {officer.traits.slice(0, 3).map((trait, index) => (
          <span 
            key={index} 
            className="text-[8px] px-1.5 py-0.5 rounded bg-secondary/50 border border-border text-muted-foreground"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Assignment Status */}
      {buildingName && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-neon-green">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{buildingName}</span>
          </div>
        </div>
      )}

      {/* Critical Needs Alert */}
      {criticalNeeds.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neon-red/30">
          <div className="text-xs text-neon-red">
            Needs attention: {criticalNeeds.join(', ')}
          </div>
        </div>
      )}
    </motion.div>
  );
};