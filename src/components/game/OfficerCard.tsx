import { Officer, OfficerRank } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Swords, BookOpen, Footprints, Lamp, Zap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfficerCardProps {
  officer: Officer;
  isSelected: boolean;
  onSelect: () => void;
  buildingName?: string;
}

const RANK_ICONS: Record<OfficerRank, React.ElementType> = {
  'Red Pole': Swords,
  'White Paper Fan': BookOpen,
  'Straw Sandal': Footprints,
  'Blue Lantern': Lamp,
};

const RANK_COLORS: Record<OfficerRank, string> = {
  'Red Pole': 'text-neon-red border-neon-red/50 bg-neon-red/10',
  'White Paper Fan': 'text-foreground border-foreground/50 bg-foreground/10',
  'Straw Sandal': 'text-neon-amber border-neon-amber/50 bg-neon-amber/10',
  'Blue Lantern': 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10',
};

export const OfficerCard = ({ officer, isSelected, onSelect, buildingName }: OfficerCardProps) => {
  const RankIcon = RANK_ICONS[officer.rank];
  const energyPercent = (officer.energy / officer.maxEnergy) * 100;
  const isExhausted = officer.energy === 0;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200",
        isSelected 
          ? "bg-primary/20 border-primary neon-glow-cyan" 
          : "bg-card border-border hover:border-primary/50",
        isExhausted && "opacity-50",
        officer.assignedBuildingId && "border-neon-green/30"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border font-display font-bold text-sm",
          RANK_COLORS[officer.rank]
        )}>
          {officer.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-foreground truncate">{officer.name}</h4>
            <RankIcon className={cn("w-3.5 h-3.5", RANK_COLORS[officer.rank].split(' ')[0])} />
          </div>
          <p className="text-xs text-muted-foreground">{officer.rank}</p>
        </div>

        {/* Energy */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Zap className={cn(
              "w-3.5 h-3.5",
              energyPercent > 50 ? "text-neon-green" : energyPercent > 20 ? "text-neon-amber" : "text-neon-red"
            )} />
            <span className={cn(
              "text-xs font-medium",
              energyPercent > 50 ? "text-neon-green" : energyPercent > 20 ? "text-neon-amber" : "text-neon-red"
            )}>
              {officer.energy}
            </span>
          </div>
          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                energyPercent > 50 ? "bg-neon-green" : energyPercent > 20 ? "bg-neon-amber" : "bg-neon-red"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assignment Status */}
      {buildingName && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-neon-green">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{buildingName}</span>
          </div>
        </div>
      )}

      {isExhausted && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-neon-red">Exhausted - Visit Nightclub to restore</span>
        </div>
      )}
    </motion.div>
  );
};
