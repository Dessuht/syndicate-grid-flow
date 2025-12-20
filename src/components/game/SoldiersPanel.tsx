import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Users, Heart, Utensils, Music, DollarSign, Plus, AlertTriangle, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const SoldiersPanel = () => {
  const { soldiers, stipend, cash, setStipend, recruitSoldier } = useGameStore();

  const avgLoyalty = soldiers.length > 0 
    ? Math.floor(soldiers.reduce((sum, s) => sum + s.loyalty, 0) / soldiers.length)
    : 0;

  const avgNeeds = soldiers.length > 0 
    ? {
        food: Math.floor(soldiers.reduce((sum, s) => sum + s.needs.food, 0) / soldiers.length),
        entertainment: Math.floor(soldiers.reduce((sum, s) => sum + s.needs.entertainment, 0) / soldiers.length),
        pay: Math.floor(soldiers.reduce((sum, s) => sum + s.needs.pay, 0) / soldiers.length),
      }
    : { food: 0, entertainment: 0, pay: 0 };

  const dailyCost = soldiers.length * stipend;
  const canAffordDailyCost = cash >= dailyCost;

  const getLoyaltyStatus = (loyalty: number) => {
    if (loyalty > 70) return { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Excellent' };
    if (loyalty > 50) return { color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', label: 'Good' };
    if (loyalty > 30) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Poor' };
    return { color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/30', label: 'Critical' };
  };

  const loyaltyStatus = getLoyaltyStatus(avgLoyalty);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col space-y-4"
    >
      {/* Header Card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
              <Users className="w-5 h-5 text-neon-amber" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold neon-text-amber">Street Soldiers</h3>
              <p className="text-xs text-muted-foreground">{soldiers.length} active fighters</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={recruitSoldier}
            disabled={cash < 500}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Recruit ($500)
          </Button>
        </div>
      </Card>

      {/* Loyalty Status Card */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-semibold">Morale Status</span>
          </div>
          <Badge className={cn(loyaltyStatus.bg, loyaltyStatus.border, loyaltyStatus.color)}>
            {loyaltyStatus.label}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average Loyalty</span>
            <span className={cn("text-sm font-bold", loyaltyStatus.color)}>{avgLoyalty}%</span>
          </div>
          <Progress value={avgLoyalty} className="h-2" />
        </div>

        {avgLoyalty < 40 && (
          <div className="mt-3 p-2 rounded bg-neon-red/10 border border-neon-red/30">
            <p className="text-xs text-neon-red flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low morale! Risk of desertion.
            </p>
          </div>
        )}
      </Card>

      {/* Needs Overview Card */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-green" />
          Daily Needs Status
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-muted-foreground">Food</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={avgNeeds.food} className="w-16 h-2" />
              <span className="text-xs text-neon-green w-8 text-right">{avgNeeds.food}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-neon-magenta" />
              <span className="text-xs text-muted-foreground">Entertainment</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={avgNeeds.entertainment} className="w-16 h-2" />
              <span className="text-xs text-neon-magenta w-8 text-right">{avgNeeds.entertainment}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-amber" />
              <span className="text-xs text-muted-foreground">Pay Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={avgNeeds.pay} className="w-16 h-2" />
              <span className="text-xs text-neon-amber w-8 text-right">{avgNeeds.pay}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stipend Control Card */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-neon-amber" />
            <span className="text-sm font-semibold">Daily Stipend</span>
          </div>
          <span className="text-sm font-bold neon-text-amber">${stipend}/soldier</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setStipend(Math.max(0, stipend - 10))}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Slider
            value={[stipend]}
            onValueChange={([val]) => setStipend(val)}
            min={0}
            max={200}
            step={10}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setStipend(Math.min(200, stipend + 10))}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
          <span className="text-xs text-muted-foreground">Daily Cost:</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-bold",
              !canAffordDailyCost ? "text-neon-red" : "text-foreground"
            )}>
              ${dailyCost}
            </span>
            {!canAffordDailyCost && (
              <TrendingDown className="w-3 h-3 text-neon-red" />
            )}
          </div>
        </div>
      </Card>

      {/* Soldier List */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-4 flex-1 overflow-hidden flex flex-col">
        <h4 className="text-sm font-semibold mb-3">Roster</h4>
        <div className="flex-1 overflow-y-auto space-y-1">
          {soldiers.map((soldier) => (
            <div
              key={soldier.id}
              className={cn(
                "flex items-center justify-between p-2 rounded bg-secondary/20 border",
                soldier.loyalty < 30 ? "border-neon-red/30" : "border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                {soldier.loyalty < 30 && (
                  <AlertTriangle className="w-3 h-3 text-neon-red animate-pulse" />
                )}
                <span className="text-xs font-medium">{soldier.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">Skill: {soldier.skill}</span>
                <span className={cn(
                  "font-medium",
                  soldier.loyalty > 60 ? "text-neon-green" : 
                  soldier.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
                )}>
                  {soldier.loyalty}%
                </span>
              </div>
            </div>
          ))}
          
          {soldiers.length === 0 && (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No soldiers recruited</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};