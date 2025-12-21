import { motion } from 'framer-motion';
import type { Building, Officer } from '@/stores/gameStoreTypes';
import { cn } from '@/lib/utils';
import { 
  Store, 
  Dice1 as Dices, 
  Warehouse, 
  Music, 
  Beaker, 
  Shield, 
  Skull, 
  DollarSign, 
  Flame, 
  Utensils, 
  PartyPopper, 
  Swords, 
  Lock, 
  User, 
  Zap 
} from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  officer: Officer | null;
  onAssign: () => void;
  onUnassign: () => void;
  isInactive: boolean;
  currentDay: number;
  canInteract: boolean;
}

const BUILDING_ICONS: Record<string, React.ElementType> = {
  'Noodle Shop': Store,
  'Mahjong Parlor': Dices,
  'Warehouse': Warehouse,
  'Nightclub': Music,
  'Counterfeit Lab': Beaker,
  'Police Station': Shield,
  'Drug Lab': Beaker,
};

const BUILDING_COLORS: Record<string, string> = {
  'Noodle Shop': 'neon-green',
  'Mahjong Parlor': 'neon-amber',
  'Warehouse': 'neon-cyan',
  'Nightclub': 'neon-magenta',
  'Counterfeit Lab': 'neon-red',
  'Police Station': 'neon-cyan',
  'Drug Lab': 'neon-red',
};

export const BuildingCard = ({ building, officer, onAssign, onUnassign, isInactive, currentDay, canInteract }: BuildingCardProps) => {
  const Icon = BUILDING_ICONS[building.type] || Store;
  const colorVar = building.isRebelBase ? 'neon-red' : BUILDING_COLORS[building.type] || 'neon-cyan';
  const daysUntilActive = isInactive && building.inactiveUntilDay ? building.inactiveUntilDay - currentDay : 0;

  const handleClick = () => {
    if (!canInteract || isInactive || building.isRebelBase) return;
    if (officer) {
      onUnassign();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={canInteract && !isInactive && !building.isRebelBase ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "building-card p-3 group",
        building.isOccupied && "occupied",
        isInactive && "opacity-50",
        building.isRebelBase && "border-neon-red/70 neon-glow-red/50 animate-pulse",
        canInteract && !isInactive && !building.isRebelBase ? "cursor-pointer" : "cursor-default"
      )}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg transition-all duration-300",
            building.isRebelBase 
              ? `bg-neon-red/20 border border-neon-red/50`
              : building.isOccupied 
                ? `bg-${colorVar}/20 border border-${colorVar}/50` 
                : "bg-secondary border border-border group-hover:border-primary/50"
          )}
          style={building.isOccupied ? {
            background: `hsl(var(--${colorVar}) / 0.2)`,
            borderColor: `hsl(var(--${colorVar}) / 0.5)`
          } : {}}
          >
            {building.isRebelBase ? (
              <Skull className="w-4 h-4 text-neon-red animate-pulse" />
            ) : (
              <Icon className={cn(
                "w-4 h-4 transition-colors",
                building.isOccupied ? `text-${colorVar}` : "text-muted-foreground group-hover:text-primary"
              )}
              style={building.isOccupied ? { color: `hsl(var(--${colorVar}))` } : {}}
              />
            )}
          </div>
          <div>
            <h3 className="font-display text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {building.name}
            </h3>
            <p className="text-[10px] text-muted-foreground">{building.type}</p>
          </div>
        </div>

        {/* Officer Badge */}
        {officer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "officer-badge text-[10px]",
              building.isRebelBase && "bg-neon-red/50 border-neon-red text-neon-red"
            )}
          >
            {officer.name.split(' ').map(n => n[0]).join('')}
          </motion.div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs">
        {!building.isRebelBase && (
          <>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-neon-amber" />
              <span className="font-medium neon-text-amber">${building.baseRevenue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className={cn("w-3 h-3", building.heatGen < 0 ? "text-neon-cyan" : "text-neon-red/70")} />
              <span className={building.heatGen < 0 ? "text-neon-cyan" : "text-neon-red/70"}>
                {building.heatGen > 0 ? '+' : ''}{building.heatGen}
              </span>
            </div>
            {building.foodProvided > 0 && (
              <div className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-neon-green" />
                <span className="text-neon-green">{building.foodProvided}</span>
              </div>
            )}
            {building.entertainmentProvided > 0 && (
              <div className="flex items-center gap-1">
                <PartyPopper className="w-3 h-3 text-neon-magenta" />
                <span className="text-neon-magenta">{building.entertainmentProvided}</span>
              </div>
            )}
            {building.isIllicit && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-neon-red/20 text-neon-red border border-neon-red/30">
                ILLICIT
              </span>
            )}
          </>
        )}
        {building.isRebelBase && (
          <div className="flex items-center gap-1">
            <Swords className="w-3 h-3 text-neon-red" />
            <span className="font-medium text-neon-red">Rebel Forces: {building.rebelSoldierCount}</span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {building.isRebelBase ? (
        <div className="mt-2 p-1.5 rounded bg-neon-red/10 border border-neon-red/30 flex items-center gap-1.5">
          <Skull className="w-3 h-3 text-neon-red" />
          <span className="text-[10px] text-neon-red">REBEL BASE - Income Blocked</span>
        </div>
      ) : isInactive ? (
        <div className="mt-2 p-1.5 rounded bg-destructive/10 border border-destructive/30 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-destructive" />
          <span className="text-[10px] text-destructive">Closed for {daysUntilActive} days</span>
        </div>
      ) : officer ? (
        <div className="mt-2 p-1.5 rounded bg-neon-green/10 border border-neon-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-neon-green" />
              <span className="text-[10px] text-neon-green">{officer.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-neon-magenta" />
              <div className="w-10 h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neon-magenta"
                  initial={{ width: 0 }}
                  animate={{ width: `${(officer.energy / officer.maxEnergy) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-neon-magenta">{officer.energy}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 p-1.5 rounded bg-secondary/30 border border-border">
          <span className="text-[10px] text-muted-foreground">
            No officer assigned
          </span>
        </div>
      )}
    </motion.div>
  );
};