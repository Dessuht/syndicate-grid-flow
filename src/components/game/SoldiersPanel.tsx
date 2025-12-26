import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Utensils, Music, DollarSign, Plus, AlertTriangle, Minus, TrendingUp, TrendingDown, Crown, Star, Swords, Shield, Eye, Briefcase, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SoldierDetailModal } from './modals/SoldierDetailModal';
import { StreetSoldier } from '@/stores/gameStoreTypes';

const getSpecIcon = (spec: string | null) => {
  switch(spec) {
    case 'enforcer': return Swords;
    case 'scout': return Eye;
    case 'guard': return Shield;
    case 'collector': return Briefcase;
    default: return Users;
  }
};

export const SoldiersPanel = () => {
  const { soldiers, stipend, cash, setStipend, recruitSoldier, paySoldierBonus, releaseSoldier, hasDirtyCop, hireDirtyCop, useDirtyCopForIntel, useDirtyCopForHeat, dirtyCopCost } = useGameStore();
  const [selectedSoldier, setSelectedSoldier] = useState<StreetSoldier | null>(null);

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

  // Stats for the header
  const activeSoldiers = soldiers.filter(s => !s.isArrested);
  const arrestedSoldiers = soldiers.filter(s => s.isArrested);
  const promotableSoldiers = activeSoldiers.filter(s => s.promotable || (s.experience >= 50 && s.skill >= 40));
  const veteranCount = activeSoldiers.filter(s => s.isVeteran).length;
  const eliteCount = activeSoldiers.filter(s => s.isElite).length;
  const avgSkill = activeSoldiers.length > 0 
    ? Math.floor(activeSoldiers.reduce((sum, s) => sum + s.skill, 0) / activeSoldiers.length)
    : 0;

  const getLoyaltyStatus = (loyalty: number) => {
    if (loyalty > 70) return { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Excellent' };
    if (loyalty > 50) return { color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', label: 'Good' };
    if (loyalty > 30) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Poor' };
    return { color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/30', label: 'Critical' };
  };

  const loyaltyStatus = getLoyaltyStatus(avgLoyalty);

  // Sort soldiers: arrested last, promotable first, then by skill
  const sortedSoldiers = [...soldiers].sort((a, b) => {
    // Arrested soldiers go to the end
    if (a.isArrested && !b.isArrested) return 1;
    if (!a.isArrested && b.isArrested) return -1;
    
    const aPromotable = a.promotable || (a.experience >= 50 && a.skill >= 40);
    const bPromotable = b.promotable || (b.experience >= 50 && b.skill >= 40);
    if (aPromotable && !bPromotable) return -1;
    if (!aPromotable && bPromotable) return 1;
    if (a.isElite && !b.isElite) return -1;
    if (!a.isElite && b.isElite) return 1;
    return b.skill - a.skill;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col space-y-3 overflow-hidden"
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
              <p className="text-xs text-muted-foreground">
                {activeSoldiers.length} active • {arrestedSoldiers.length} arrested • {veteranCount} veterans
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={paySoldierBonus}
              disabled={cash < soldiers.length * 100}
              className="gap-1 text-xs"
            >
              <DollarSign className="w-3 h-3" />
              Bonus (${soldiers.length * 100})
            </Button>
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
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground">Avg Skill</p>
            <p className="font-bold text-neon-cyan">{avgSkill}</p>
          </div>
          <div className="p-2 rounded bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground">Avg Loyalty</p>
            <p className={cn("font-bold", loyaltyStatus.color)}>{avgLoyalty}%</p>
          </div>
          <div className="p-2 rounded bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground">Daily Cost</p>
            <p className={cn("font-bold", !canAffordDailyCost ? "text-neon-red" : "text-foreground")}>${dailyCost}</p>
          </div>
          <div className="p-2 rounded bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground">Promotable</p>
            <p className={cn("font-bold", promotableSoldiers.length > 0 ? "text-neon-amber" : "text-muted-foreground")}>
              {promotableSoldiers.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Promotable Soldiers Alert */}
      {promotableSoldiers.length > 0 && (
        <Card className="bg-neon-amber/10 border-neon-amber/30 p-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-neon-amber" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neon-amber">
                {promotableSoldiers.length} soldier{promotableSoldiers.length > 1 ? 's' : ''} ready for promotion!
              </p>
              <p className="text-xs text-muted-foreground">Click on them to promote to officer</p>
            </div>
          </div>
        </Card>
      )}

      {/* Arrested Soldiers Alert */}
      {arrestedSoldiers.length > 0 && (
        <Card className="bg-neon-red/10 border-neon-red/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-neon-red" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neon-red">
                {arrestedSoldiers.length} soldier{arrestedSoldiers.length > 1 ? 's' : ''} in jail
              </p>
              <p className="text-xs text-muted-foreground">Pay to release them</p>
            </div>
          </div>
          <div className="space-y-1">
            {arrestedSoldiers.slice(0, 2).map(s => {
              const releaseCost = 300 + (s.skill * 5);
              return (
                <div key={s.id} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                  <span className="text-xs">{s.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs border-neon-green/30 text-neon-green"
                    onClick={() => releaseSoldier(s.id)}
                    disabled={cash < releaseCost}
                  >
                    <Unlock className="w-3 h-3 mr-1" /> ${releaseCost}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Dirty Cop System */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-semibold">Dirty Cop</span>
          </div>
          {hasDirtyCop ? (
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">Active</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs">Not Hired</Badge>
          )}
        </div>
        {hasDirtyCop ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-neon-purple/30 text-neon-purple"
              onClick={useDirtyCopForIntel}
              disabled={cash < dirtyCopCost}
            >
              <Eye className="w-3 h-3 mr-1" /> Intel (${dirtyCopCost})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-neon-cyan/30 text-neon-cyan"
              onClick={useDirtyCopForHeat}
              disabled={cash < dirtyCopCost}
            >
              <TrendingDown className="w-3 h-3 mr-1" /> -Heat (${dirtyCopCost})
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-neon-purple/30 text-neon-purple"
            onClick={hireDirtyCop}
            disabled={cash < 2000}
          >
            <ShieldAlert className="w-3 h-3 mr-1" /> Hire Dirty Cop ($2,000)
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          {hasDirtyCop ? "Gain intel or reduce police heat" : "Reduces heat and provides intel"}
        </p>
      </Card>

      {/* Morale & Stipend Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Loyalty Status */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-semibold">Morale</span>
            </div>
            <Badge className={cn(loyaltyStatus.bg, loyaltyStatus.border, loyaltyStatus.color, "text-xs")}>
              {loyaltyStatus.label}
            </Badge>
          </div>
          <Progress value={avgLoyalty} className="h-2" />
          {avgLoyalty < 40 && (
            <p className="text-xs text-neon-red mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Risk of desertion!
            </p>
          )}
        </Card>

        {/* Stipend Control */}
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-amber" />
              <span className="text-sm font-semibold">Stipend</span>
            </div>
            <span className="text-sm font-bold neon-text-amber">${stipend}/day</span>
          </div>
          <div className="flex items-center gap-2">
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
        </Card>
      </div>

      {/* Soldier List */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-3 flex-1 min-h-0 overflow-hidden flex flex-col">
        <h4 className="text-sm font-semibold mb-2 flex items-center justify-between shrink-0">
          <span>Roster</span>
          <span className="text-xs text-muted-foreground font-normal">Click to manage</span>
        </h4>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {sortedSoldiers.map((soldier) => {
            const isPromotable = soldier.promotable || (soldier.experience >= 80 && soldier.skill >= 60);
            const SpecIcon = getSpecIcon(soldier.specialization);
            
            return (
              <button
                key={soldier.id}
                onClick={() => setSelectedSoldier(soldier)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded bg-secondary/20 border transition-all hover:bg-secondary/40",
                  isPromotable ? "border-neon-amber/40 bg-neon-amber/5" : 
                  soldier.loyalty < 30 ? "border-neon-red/30" : "border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  {isPromotable && (
                    <Crown className="w-4 h-4 text-neon-amber animate-pulse" />
                  )}
                  {soldier.loyalty < 30 && !isPromotable && (
                    <AlertTriangle className="w-3 h-3 text-neon-red animate-pulse" />
                  )}
                  <SpecIcon className={cn(
                    "w-4 h-4",
                    soldier.specialization ? "text-neon-cyan" : "text-muted-foreground"
                  )} />
                  <span className="text-xs font-medium">{soldier.name}</span>
                  {soldier.isElite && <Star className="w-3 h-3 text-neon-purple" />}
                  {soldier.isVeteran && !soldier.isElite && <Star className="w-3 h-3 text-neon-green" />}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Skill: <span className="text-neon-cyan">{soldier.skill}</span></span>
                  <span className="text-muted-foreground">Exp: <span className="text-neon-purple">{soldier.experience}</span></span>
                  <span className={cn(
                    "font-medium w-8 text-right",
                    soldier.loyalty > 60 ? "text-neon-green" : 
                    soldier.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
                  )}>
                    {soldier.loyalty}%
                  </span>
                </div>
              </button>
            );
          })}
          
          {soldiers.length === 0 && (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No soldiers recruited</p>
            </div>
          )}
        </div>
      </Card>

      {/* Soldier Detail Modal */}
      <AnimatePresence>
        {selectedSoldier && (
          <SoldierDetailModal
            soldier={selectedSoldier}
            onClose={() => setSelectedSoldier(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};