import { Officer, OfficerRank } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Swords, BookOpen, Footprints, Lamp, Zap, Building2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfficerCardProps {
  officer: Officer;
  isSelected: boolean;
  onSelect: () => void;
  buildingName?: string;
  disabled?: boolean;
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

const RANK_SPECIALTY: Record<OfficerRank, string> = {
  'Red Pole': 'Illicit +',
  'White Paper Fan': 'Heat -',
  'Straw Sandal': 'Legal +',
  'Blue Lantern': 'Loyalty +',
};

export const OfficerCard = ({ officer, isSelected, onSelect, buildingName, disabled }: OfficerCardProps) => {
  const RankIcon = RANK_ICONS[officer.rank];
  const energyPercent = (officer.energy / officer.maxEnergy) * 100;
  const isExhausted = officer.energy === 0;

  return (
    <motion.div
      layout
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "p-2 rounded-lg border transition-all duration-200",
        isSelected 
          ? "bg-primary/20 border-primary neon-glow-cyan" 
          : "bg-card border-border hover:border-primary/50",
        isExhausted && "opacity-50",
        officer.assignedBuildingId && "border-neon-green/30",
        disabled ? "cursor-default" : "cursor-pointer",
        officer.loyalty < 40 && "border-neon-red/30"
      )}
      onClick={!disabled ? onSelect : undefined}
    >
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border font-display font-bold text-xs shrink-0",
          RANK_COLORS[officer.rank]
        )}>
          {officer.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium text-xs text-foreground truncate">{officer.name}</h4>
            <RankIcon className={cn("w-3 h-3 shrink-0", RANK_COLORS[officer.rank].split(' ')[0])} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-muted-foreground">{officer.rank}</p>
            <span className="text-[10px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
              {RANK_SPECIALTY[officer.rank]}
            </span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col items-end gap-1">
          {/* Energy */}
          <div className="flex items-center gap-1">
            <Zap className={cn(
              "w-3 h-3",
              energyPercent > 50 ? "text-neon-green" : energyPercent > 20 ? "text-neon-amber" : "text-neon-red"
            )} />
            <span className={cn(
              "text-[10px] font-medium",
              energyPercent > 50 ? "text-neon-green" : energyPercent > 20 ? "text-neon-amber" : "text-neon-red"
            )}>
              {officer.energy}
            </span>
          </div>
          {/* Loyalty */}
          <div className="flex items-center gap-1">
            <Heart className={cn(
              "w-3 h-3",
              officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
            )} />
            <span className={cn(
              "text-[10px]",
              officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
            )}>
              {officer.loyalty}%
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Status */}
      {buildingName && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <div className="flex items-center gap-1 text-[10px] text-neon-green">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{buildingName}</span>
          </div>
        </div>
      )}

      {isExhausted && !buildingName && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-red">Exhausted</span>
        </div>
      )}

      {officer.loyalty < 40 && !isExhausted && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-amber">Low loyalty - risk of betrayal</span>
        </div>
      )}
    </motion.div>
  );
};
