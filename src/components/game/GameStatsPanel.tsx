"use client";

import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Swords,
  Shield,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameStatsPanel = () => {
  const { 
    cash, 
    reputation, 
    policeHeat, 
    currentDay, 
    officers, 
    soldiers, 
    buildings, 
    rivals,
    influence,
    intel
  } = useGameStore();

  // Calculate statistics
  const occupiedBuildings = buildings.filter(b => b.isOccupied && !b.inactiveUntilDay);
  const dailyRevenue = occupiedBuildings.reduce((sum, b) => sum + b.baseRevenue, 0);
  const dailyExpenses = soldiers.length * useGameStore.getState().stipend;
  const netIncome = dailyRevenue - dailyExpenses;

  const avgOfficerLoyalty = officers.length > 0
    ? Math.floor(officers.reduce((sum, o) => sum + o.loyalty, 0) / officers.length)
    : 0;

  const avgSoldierLoyalty = soldiers.length > 0
    ? Math.floor(soldiers.reduce((sum, s) => sum + s.loyalty, 0) / soldiers.length)
    : 0;

  const hostileRivals = rivals.filter(r => r.relationship < -30).length;
  const alliedRivals = rivals.filter(r => r.hasAlliance).length;
  const activeConflicts = rivals.filter(r => r.isActiveConflict).length;

  const totalStrength = officers.reduce((sum, o) => sum + o.skills.enforcement, 0) + 
                       soldiers.reduce((sum, s) => sum + s.skill, 0);

  // Determine overall status
  const getOverallStatus = () => {
    if (policeHeat > 80 || avgOfficerLoyalty < 30 || activeConflicts > 1) {
      return { label: 'Critical', color: 'text-neon-red', bg: 'bg-neon-red/10' };
    }
    if (policeHeat > 50 || avgOfficerLoyalty < 50 || hostileRivals > 1) {
      return { label: 'Unstable', color: 'text-neon-amber', bg: 'bg-neon-amber/10' };
    }
    if (reputation > 70 && avgOfficerLoyalty > 70) {
      return { label: 'Thriving', color: 'text-neon-green', bg: 'bg-neon-green/10' };
    }
    return { label: 'Stable', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' };
  };

  const status = getOverallStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Status */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-white">Syndicate Status</h3>
          <Badge className={cn(status.bg, status.color, "border-0")}>
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Financial */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Daily Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xl font-bold",
                netIncome >= 0 ? "text-neon-green" : "text-neon-red"
              )}>
                ${netIncome >= 0 ? '+' : ''}{netIncome.toLocaleString()}
              </span>
              {netIncome >= 0 ? (
                <TrendingUp className="w-4 h-4 text-neon-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-neon-red" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue: ${dailyRevenue} | Expenses: ${dailyExpenses}
            </p>
          </div>

          {/* Military Strength */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Swords className="w-4 h-4" />
              <span>Combat Strength</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-neon-magenta">
                {totalStrength}
              </span>
              <Shield className="w-4 h-4 text-neon-magenta" />
            </div>
            <p className="text-xs text-muted-foreground">
              {officers.length} officers + {soldiers.length} soldiers
            </p>
          </div>
        </div>
      </Card>

      {/* Loyalty Overview */}
      <Card className="bg-slate-800/30 border-slate-700/50 p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-neon-cyan" />
          Loyalty Overview
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Officers</span>
              <span className={cn(
                "font-medium",
                avgOfficerLoyalty > 60 ? "text-neon-green" :
                avgOfficerLoyalty > 30 ? "text-neon-amber" : "text-neon-red"
              )}>
                {avgOfficerLoyalty}%
              </span>
            </div>
            <Progress value={avgOfficerLoyalty} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Soldiers</span>
              <span className={cn(
                "font-medium",
                avgSoldierLoyalty > 60 ? "text-neon-green" :
                avgSoldierLoyalty > 30 ? "text-neon-amber" : "text-neon-red"
              )}>
                {avgSoldierLoyalty}%
              </span>
            </div>
            <Progress value={avgSoldierLoyalty} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Territory Control */}
      <Card className="bg-slate-800/30 border-slate-700/50 p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-neon-amber" />
          Territory Control
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-2xl font-bold text-neon-green">{occupiedBuildings.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-2xl font-bold text-neon-amber">{buildings.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-2xl font-bold text-neon-cyan">
              {Math.floor((occupiedBuildings.length / buildings.length) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Utilization</p>
          </div>
        </div>
      </Card>

      {/* Rival Relations */}
      <Card className="bg-slate-800/30 border-slate-700/50 p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-neon-red" />
          Rival Relations
        </h4>

        <div className="space-y-2">
          {rivals.map(rival => (
            <div key={rival.id} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">{rival.name}</p>
                <p className="text-xs text-muted-foreground">{rival.district}</p>
              </div>
              <div className="flex items-center gap-2">
                {rival.isActiveConflict && (
                  <Badge variant="destructive" className="text-xs">AT WAR</Badge>
                )}
                {rival.hasAlliance && (
                  <Badge className="bg-neon-green/20 text-neon-green border-0 text-xs">ALLIED</Badge>
                )}
                <span className={cn(
                  "text-sm font-medium",
                  rival.relationship > 30 ? "text-neon-green" :
                  rival.relationship > -30 ? "text-neon-amber" : "text-neon-red"
                )}>
                  {rival.relationship > 0 ? '+' : ''}{rival.relationship}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {(policeHeat > 50 || avgOfficerLoyalty < 40 || activeConflicts > 0) && (
        <Card className="bg-neon-red/10 border-neon-red/30 p-4">
          <h4 className="font-semibold text-neon-red mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Active Threats
          </h4>
          <ul className="space-y-1 text-sm text-neon-red/80">
            {policeHeat > 70 && <li>• Police raid imminent (Heat: {policeHeat}%)</li>}
            {policeHeat > 50 && policeHeat <= 70 && <li>• Police attention increasing</li>}
            {avgOfficerLoyalty < 40 && <li>• Officer loyalty dangerously low</li>}
            {activeConflicts > 0 && <li>• {activeConflicts} active gang war(s)</li>}
          </ul>
        </Card>
      )}
    </motion.div>
  );
};