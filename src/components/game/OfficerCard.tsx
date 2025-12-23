"use client";

import { motion } from 'framer-motion';
import type { Officer } from '@/stores/gameStoreTypes';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Heart, 
  Building, 
  AlertTriangle, 
  Crown, 
  Skull,
  Shield,
  Swords,
  Star,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OfficerCardProps {
  officer: Officer;
  isSelected: boolean;
  onSelect: () => void;
  buildingName?: string;
  disabled?: boolean;
}

const RANK_COLORS: Record<string, string> = {
  'Red Pole': 'border-neon-red/50 bg-neon-red/5',
  'White Paper Fan': 'border-slate-400/50 bg-slate-400/5',
  'Straw Sandal': 'border-neon-amber/50 bg-neon-amber/5',
  'Blue Lantern': 'border-neon-cyan/50 bg-neon-cyan/5',
  'Deputy (438)': 'border-jianghu-gold/50 bg-jianghu-gold/5',
  'Dragonhead (489)': 'border-jianghu-crimson/50 bg-jianghu-crimson/5',
};

export const OfficerCard = ({ officer, isSelected, onSelect, buildingName, disabled }: OfficerCardProps) => {
  const loyaltyColor = officer.loyalty > 60 ? 'text-neon-green' : 
                       officer.loyalty > 30 ? 'text-neon-amber' : 'text-neon-red';
  
  const energyPercent = (officer.energy / officer.maxEnergy) * 100;
  const rankColor = RANK_COLORS[officer.rank] || 'border-slate-600/50 bg-slate-600/5';

  const hasWarning = officer.loyalty < 40 || officer.isWounded || officer.isArrested || officer.grudge;

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onSelect : undefined}
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer",
        rankColor,
        isSelected && "ring-2 ring-neon-cyan neon-glow-cyan",
        disabled && "opacity-50 cursor-not-allowed",
        hasWarning && "border-neon-red/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Officer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white truncate">{officer.name}</span>
            {officer.isSuccessor && (
              <Crown className="w-3 h-3 text-jianghu-gold shrink-0" />
            )}
            {officer.isTraitor && (
              <Skull className="w-3 h-3 text-neon-red shrink-0 animate-pulse" />
            )}
            {officer.grudge && (
              <AlertTriangle className="w-3 h-3 text-neon-amber shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">{officer.rank}</p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {officer.isWounded && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                Wounded
              </Badge>
            )}
            {officer.isArrested && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                <Lock className="w-2 h-2 mr-0.5" />
                Arrested
              </Badge>
            )}
            {officer.isTestingWaters && (
              <Badge className="text-[10px] px-1 py-0 bg-neon-amber/20 text-neon-amber border-0">
                Testing Waters
              </Badge>
            )}
            {buildingName && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                <Building className="w-2 h-2 mr-0.5" />
                {buildingName}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-1">
            {/* Energy */}
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-neon-magenta shrink-0" />
              <Progress value={energyPercent} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {officer.energy}/{officer.maxEnergy}
              </span>
            </div>

            {/* Loyalty */}
            <div className="flex items-center gap-2">
              <Heart className={cn("w-3 h-3 shrink-0", loyaltyColor)} />
              <Progress 
                value={officer.loyalty} 
                className={cn(
                  "h-1.5 flex-1",
                  officer.loyalty < 30 && "[&>div]:bg-neon-red"
                )} 
              />
              <span className={cn("text-[10px] w-8 text-right font-medium", loyaltyColor)}>
                {officer.loyalty}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Skills Summary */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[10px]">
            <Swords className="w-3 h-3 text-neon-red" />
            <span className="text-muted-foreground">{officer.skills.enforcement}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <Shield className="w-3 h-3 text-neon-cyan" />
            <span className="text-muted-foreground">{officer.skills.diplomacy}</span>
          </div>
          {officer.face > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <Star className="w-3 h-3 text-jianghu-gold" />
              <span className="text-jianghu-gold">{officer.face}</span>
            </div>
          )}
        </div>
      </div>

      {/* Traits */}
      {officer.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/50">
          {officer.traits.slice(0, 3).map((trait, i) => (
            <span 
              key={i} 
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300"
            >
              {trait}
            </span>
          ))}
          {officer.traits.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{officer.traits.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};