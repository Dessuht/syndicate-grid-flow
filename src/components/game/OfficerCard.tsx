import { motion } from 'framer-motion';
import type { Officer, OfficerRank } from '@/stores/gameStoreTypes';
import { cn } from '@/lib/utils';
import { 
  Swords, 
  BookOpen, 
  Footprints, 
  Lamp, 
  Star, 
  Skull, 
  X, 
  Lock, 
  Crown, 
  Heart, 
  Building2 
} from 'lucide-react';

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
  'Deputy (438)': Star,
  'Dragonhead (489)': Skull,
};

const RANK_COLORS: Record<OfficerRank, string> = {
  'Red Pole': 'text-neon-red border-neon-red/50 bg-neon-red/10',
  'White Paper Fan': 'text-foreground border-foreground/50 bg-foreground/10',
  'Straw Sandal': 'text-neon-amber border-neon-amber/50 bg-neon-amber/10',
  'Blue Lantern': 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10',
  'Deputy (438)': 'text-jianghu-gold border-jianghu-gold/50 bg-jianghu-gold/10',
  'Dragonhead (489)': 'text-jianghu-crimson border-jianghu-crimson/50 bg-jianghu-crimson/10',
};

const RANK_SPECIALTY: Record<OfficerRank, string> = {
  'Red Pole': 'Illicit +',
  'White Paper Fan': 'Heat -',
  'Straw Sandal': 'Legal +',
  'Blue Lantern': 'Loyalty +',
  'Deputy (438)': 'Logistics/Diplo',
  'Dragonhead (489)': 'Command/Combat',
};

export const OfficerCard = ({ officer, isSelected, onSelect, buildingName, disabled }: OfficerCardProps) => {
  const RankIcon = RANK_ICONS[officer.rank] || Lamp;
  const energyPercent = (officer.energy / officer.maxEnergy) * 100;
  const isExhausted = officer.energy === 0;
  const isUnavailable = officer.isWounded || officer.isArrested;

  return (
    <motion.div
      layout
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "p-2 rounded-lg border transition-all duration-200 relative",
        isSelected 
          ? "bg-primary/20 border-primary neon-glow-cyan" 
          : "bg-card border-border hover:border-primary/50",
        isExhausted && "opacity-50",
        officer.assignedBuildingId && "border-neon-green/30",
        disabled ? "cursor-default" : "cursor-pointer",
        officer.loyalty < 40 && "border-neon-red/30",
        isUnavailable && "opacity-70"
      )}
      onClick={!disabled ? onSelect : undefined}
    >
      {/* Status overlays */}
      {officer.isWounded && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-red border-2 border-background flex items-center justify-center">
          <X className="w-2.5 h-2.5 text-background" />
        </div>
      )}
      
      {officer.isArrested && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-amber border-2 border-background flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-background" />
        </div>
      )}
      
      {officer.isSuccessor && (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-jianghu-gold border-2 border-background flex items-center justify-center">
          <Crown className="w-2.5 h-2.5 text-background" />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border font-display font-bold text-xs shrink-0",
          RANK_COLORS[officer.rank].split(' ').filter(c => c.startsWith('text-') || c.startsWith('border-') || c.startsWith('bg-')).join(' '),
          isUnavailable && "grayscale"
        )}>
          {officer.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className={cn(
              "font-medium text-xs text-foreground truncate",
              isUnavailable && "line-through"
            )}>
              {officer.name}
            </h4>
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
          {/* Face */}
          <div className="flex items-center gap-1">
            <Star className={cn(
              "w-3 h-3",
              officer.face > 50 ? "text-jianghu-gold" : "text-muted-foreground/50"
            )} />
            <span className={cn(
              "text-[10px] font-medium",
              officer.face > 50 ? "text-jianghu-gold" : "text-muted-foreground/50"
            )}>
              {officer.face}
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

      {/* Traits */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {officer.traits.map((trait, index) => (
          <span 
            key={index} 
            className="text-[8px] px-1 py-0.5 rounded bg-secondary/50 border border-border text-muted-foreground"
          >
            {trait}
          </span>
        ))}
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

      {/* Status Messages */}
      {isExhausted && !buildingName && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-red">Exhausted</span>
        </div>
      )}

      {officer.isWounded && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-red flex items-center gap-1">
            <X className="w-3 h-3" />
            Wounded - {officer.daysToRecovery} days to recovery
          </span>
        </div>
      )}

      {officer.isArrested && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-amber flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Arrested
          </span>
        </div>
      )}
      
      {officer.isTestingWaters && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-amber">Testing the Waters (-5 Loyalty/Day)</span>
        </div>
      )}

      {officer.loyalty < 40 && !isExhausted && !isUnavailable && !officer.isTestingWaters && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[10px] text-neon-amber">Low loyalty - risk of betrayal</span>
        </div>
      )}
    </motion.div>
  );
};