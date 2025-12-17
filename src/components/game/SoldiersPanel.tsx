import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Users, Heart, Utensils, Music, DollarSign, Plus, AlertTriangle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
            <Users className="w-4 h-4 text-neon-amber" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold neon-text-amber">Street Soldiers</h3>
            <p className="text-xs text-muted-foreground">{soldiers.length} active</p>
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

      {/* Average Stats */}
      <div className="space-y-3 p-3 rounded-lg bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-neon-red" />
            <span className="text-xs text-muted-foreground">Avg. Loyalty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  avgLoyalty > 60 ? "bg-neon-green" : avgLoyalty > 30 ? "bg-neon-amber" : "bg-neon-red"
                )}
                style={{ width: `${avgLoyalty}%` }}
              />
            </div>
            <span className={cn(
              "text-xs font-medium",
              avgLoyalty > 60 ? "text-neon-green" : avgLoyalty > 30 ? "text-neon-amber" : "text-neon-red"
            )}>
              {avgLoyalty}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Food</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-neon-green transition-all"
                style={{ width: `${avgNeeds.food}%` }}
              />
            </div>
            <span className="text-xs text-neon-green">{avgNeeds.food}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-neon-magenta" />
            <span className="text-xs text-muted-foreground">Entertainment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-neon-magenta transition-all"
                style={{ width: `${avgNeeds.entertainment}%` }}
              />
            </div>
            <span className="text-xs text-neon-magenta">{avgNeeds.entertainment}%</span>
          </div>
        </div>
      </div>

      {/* Stipend Control */}
      <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-neon-amber/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-neon-amber" />
            <span className="text-xs text-muted-foreground">Daily Stipend</span>
          </div>
          <span className="text-sm font-bold neon-text-amber">${stipend}/soldier</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setStipend(stipend - 10)}
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
            onClick={() => setStipend(stipend + 10)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Daily Cost:</span>
          <span className={cn(
            "font-medium",
            dailyCost > cash ? "text-neon-red" : "text-foreground"
          )}>
            ${dailyCost}
          </span>
        </div>
      </div>

      {/* Soldier List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {soldiers.map((soldier) => (
          <div
            key={soldier.id}
            className={cn(
              "flex items-center justify-between p-2 rounded bg-secondary/20",
              soldier.loyalty < 30 && "border border-neon-red/30"
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
                soldier.loyalty > 60 ? "text-neon-green" : soldier.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
              )}>
                {soldier.loyalty}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {avgLoyalty < 40 && (
        <div className="p-2 rounded bg-neon-red/10 border border-neon-red/30">
          <p className="text-xs text-neon-red flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low loyalty! Soldiers may desert.
          </p>
        </div>
      )}
    </motion.div>
  );
};
