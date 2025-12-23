"use client";

import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Heart,
  Swords,
  Shield,
  Star,
  ChevronUp,
  Coins,
  HandCoins
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagementPanel = () => {
  const { 
    officers, 
    soldiers, 
    cash, 
    stipend, 
    setStipend,
    trainOfficer,
    promoteOfficer,
    paySoldierBonus,
  } = useGameStore();
  
  // Calculate averages
  const avgLoyalty = officers.length > 0 
    ? Math.round(officers.reduce((sum, o) => sum + o.loyalty, 0) / officers.length)
    : 0;
  
  const avgSoldierMorale = soldiers.length > 0
    ? Math.round(soldiers.reduce((sum, s) => sum + s.loyalty, 0) / soldiers.length)
    : 0;
  
  const totalEnforcement = officers.reduce((sum, o) => sum + o.skills.enforcement, 0);
  const totalDiplomacy = officers.reduce((sum, o) => sum + o.skills.diplomacy, 0);
  const totalLogistics = officers.reduce((sum, o) => sum + o.skills.logistics, 0);
  
  // Promotable officers (high loyalty, high face)
  const promotableOfficers = officers.filter(o => 
    o.loyalty >= 70 && 
    o.face >= 50 && 
    !['Deputy (438)', 'Dragonhead (489)'].includes(o.rank)
  );
  
  // Trainable officers (have room to grow)
  const trainableOfficers = officers.filter(o => 
    Object.values(o.skills).some(s => s < 80)
  );
  
  const handleTrainOfficer = (officerId: string, skill: string) => {
    if (cash < 500) {
      toast.error('Not enough cash! Need $500');
      return;
    }
    trainOfficer(officerId, skill as 'enforcement' | 'diplomacy' | 'logistics' | 'recruitment');
    toast.success(`Officer training in ${skill} started!`);
  };
  
  const handlePromote = (officerId: string, currentRank: string) => {
    if (cash < 2000) {
      toast.error('Not enough cash! Need $2,000');
      return;
    }
    // Determine next rank
    const nextRank = currentRank === 'Blue Lantern' ? 'Straw Sandal' :
                     currentRank === 'Straw Sandal' ? 'Red Pole' :
                     currentRank === 'Red Pole' ? 'Deputy (438)' :
                     currentRank === 'White Paper Fan' ? 'Deputy (438)' :
                     currentRank === 'Deputy (438)' ? 'Dragonhead (489)' : null;
    
    if (!nextRank) {
      toast.error('Cannot promote further!');
      return;
    }
    promoteOfficer(officerId, nextRank as any);
    toast.success(`Officer promoted to ${nextRank}!`);
  };
  
  const handlePayBonus = () => {
    const bonusCost = soldiers.length * 100;
    if (cash < bonusCost) {
      toast.error(`Not enough cash! Need $${bonusCost}`);
      return;
    }
    paySoldierBonus();
    toast.success(`Paid $${bonusCost} bonus to ${soldiers.length} soldiers!`);
  };
  
  const handleAdjustStipend = (amount: number) => {
    setStipend(stipend + amount);
    toast.success(`Stipend adjusted to $${stipend + amount}/day`);
  };

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Avg Officer Loyalty</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xl font-bold",
              avgLoyalty >= 70 ? "text-neon-green" : avgLoyalty >= 40 ? "text-neon-amber" : "text-neon-red"
            )}>{avgLoyalty}%</span>
            <Progress value={avgLoyalty} className="flex-1 h-2" />
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs text-muted-foreground">Soldier Morale</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xl font-bold",
              avgSoldierMorale >= 70 ? "text-neon-green" : avgSoldierMorale >= 40 ? "text-neon-amber" : "text-neon-red"
            )}>{avgSoldierMorale}%</span>
            <Progress value={avgSoldierMorale} className="flex-1 h-2" />
          </div>
        </div>
      </div>
      
      {/* Skill Totals */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-purple" />
          Organization Skills
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <Swords className="w-4 h-4 mx-auto text-neon-red mb-1" />
            <p className="text-xs text-muted-foreground">Enforcement</p>
            <p className="font-bold text-neon-red">{totalEnforcement}</p>
          </div>
          <div>
            <HandCoins className="w-4 h-4 mx-auto text-neon-green mb-1" />
            <p className="text-xs text-muted-foreground">Diplomacy</p>
            <p className="font-bold text-neon-green">{totalDiplomacy}</p>
          </div>
          <div>
            <Shield className="w-4 h-4 mx-auto text-neon-cyan mb-1" />
            <p className="text-xs text-muted-foreground">Logistics</p>
            <p className="font-bold text-neon-cyan">{totalLogistics}</p>
          </div>
        </div>
      </div>
      
      {/* Stipend Management */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Coins className="w-4 h-4 text-neon-amber" />
          Daily Stipend: ${stipend}/soldier
        </h4>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAdjustStipend(-10)}
            disabled={stipend <= 10}
          >
            -$10
          </Button>
          <Progress value={(stipend / 200) * 100} className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAdjustStipend(10)}
            disabled={stipend >= 200}
          >
            +$10
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Daily cost: ${soldiers.length * stipend} ({soldiers.length} soldiers)
        </p>
      </div>
      
      {/* Soldier Bonus */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-neon-green" />
          Soldier Bonus
        </h4>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          onClick={handlePayBonus}
          disabled={cash < soldiers.length * 100}
        >
          Pay Bonus (${soldiers.length * 100}) - +10 Morale
        </Button>
      </div>
      
      {/* Training Section */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-neon-cyan" />
          Officer Training ($500)
        </h4>
        <div className="space-y-2 max-h-40 overflow-auto">
          {trainableOfficers.slice(0, 3).map(officer => (
            <div key={officer.id} className="flex items-center justify-between p-2 rounded bg-secondary/50">
              <div>
                <p className="text-sm font-medium">{officer.name}</p>
                <p className="text-xs text-muted-foreground">{officer.rank}</p>
              </div>
              <div className="flex gap-1">
                {officer.skills.enforcement < 80 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-neon-red"
                    onClick={() => handleTrainOfficer(officer.id, 'enforcement')}
                    disabled={cash < 500}
                  >
                    <Swords className="w-3 h-3" />
                  </Button>
                )}
                {officer.skills.diplomacy < 80 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-neon-green"
                    onClick={() => handleTrainOfficer(officer.id, 'diplomacy')}
                    disabled={cash < 500}
                  >
                    <HandCoins className="w-3 h-3" />
                  </Button>
                )}
                {officer.skills.logistics < 80 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-neon-cyan"
                    onClick={() => handleTrainOfficer(officer.id, 'logistics')}
                    disabled={cash < 500}
                  >
                    <Shield className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {trainableOfficers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">All officers fully trained!</p>
          )}
        </div>
      </div>
      
      {/* Promotions */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ChevronUp className="w-4 h-4 text-neon-amber" />
          Promotions ($2,000)
        </h4>
        <div className="space-y-2 max-h-40 overflow-auto">
          {promotableOfficers.slice(0, 3).map(officer => (
            <div key={officer.id} className="flex items-center justify-between p-2 rounded bg-secondary/50">
              <div>
                <p className="text-sm font-medium">{officer.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{officer.rank}</span>
                  <Star className="w-3 h-3 text-neon-amber" />
                  <span className="text-xs text-neon-amber">{officer.face} Face</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 border-neon-amber/30 text-neon-amber"
                onClick={() => handlePromote(officer.id, officer.rank)}
                disabled={cash < 2000}
              >
                Promote
              </Button>
            </div>
          ))}
          {promotableOfficers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No officers ready for promotion (need 70+ loyalty, 50+ face)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};