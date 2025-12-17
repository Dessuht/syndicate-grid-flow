import { Building, Officer } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Store, Dices, Warehouse, Music, Beaker, User, Lock, DollarSign, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildingCardProps {
  building: Building;
  officer: Officer | null;
  onAssign: () => void;
  onUnassign: () => void;
  isInactive: boolean;
  currentDay: number;
}

const BUILDING_ICONS: Record<string, React.ElementType> = {
  'Noodle Shop': Store,
  'Mahjong Parlor': Dices,
  'Warehouse': Warehouse,
  'Nightclub': Music,
  'Counterfeit Lab': Beaker,
};

export const BuildingCard = ({ building, officer, onAssign, onUnassign, isInactive, currentDay }: BuildingCardProps) => {
  const Icon = BUILDING_ICONS[building.type] || Store;
  const daysUntilActive = isInactive && building.inactiveUntilDay ? building.inactiveUntilDay - currentDay : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "building-card p-4 cursor-pointer group",
        building.isOccupied && "occupied",
        isInactive && "opacity-50"
      )}
      onClick={isInactive ? undefined : (officer ? onUnassign : onAssign)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300",
            building.isOccupied 
              ? "bg-neon-green/20 border border-neon-green/50" 
              : "bg-secondary border border-border group-hover:border-primary/50"
          )}>
            <Icon className={cn(
              "w-5 h-5 transition-colors",
              building.isOccupied ? "text-neon-green" : "text-muted-foreground group-hover:text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {building.name}
            </h3>
            <p className="text-xs text-muted-foreground">{building.type}</p>
          </div>
        </div>

        {/* Officer Badge */}
        {officer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="officer-badge"
          >
            {officer.name.split(' ').map(n => n[0]).join('')}
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-neon-amber" />
          <span className="text-sm font-medium neon-text-amber">${building.baseRevenue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-neon-red/70" />
          <span className="text-sm text-neon-red/70">+{building.heatGen}</span>
        </div>
      </div>

      {/* Status Bar */}
      {isInactive ? (
        <div className="mt-4 p-2 rounded bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <Lock className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive">Inactive for {daysUntilActive} days</span>
        </div>
      ) : officer ? (
        <div className="mt-4 p-2 rounded bg-neon-green/10 border border-neon-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-neon-green">{officer.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neon-magenta"
                  initial={{ width: 0 }}
                  animate={{ width: `${(officer.energy / officer.maxEnergy) * 100}%` }}
                />
              </div>
              <span className="text-xs text-neon-magenta">{officer.energy}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-2 rounded bg-secondary/50 border border-border group-hover:border-primary/30 transition-colors">
          <span className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
            Click to assign officer
          </span>
        </div>
      )}
    </motion.div>
  );
};
