import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Heart, Swords, Target, Shield, 
  DollarSign, Star, Award, Crown, X,
  TrendingUp, Zap, Eye, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreetSoldier, SoldierSpecialization } from '@/stores/gameStoreTypes';
import { toast } from 'sonner';

interface SoldierDetailModalProps {
  soldier: StreetSoldier;
  onClose: () => void;
}

const SPECIALIZATIONS: { id: SoldierSpecialization; name: string; icon: any; description: string; bonus: string }[] = [
  { id: 'enforcer', name: 'Enforcer', icon: Swords, description: 'Combat specialist', bonus: '+10 Skill, +20% battle damage' },
  { id: 'scout', name: 'Scout', icon: Eye, description: 'Intel gatherer', bonus: '+5 Intel per day when assigned' },
  { id: 'guard', name: 'Guard', icon: Shield, description: 'Building defender', bonus: '+5 Skill, reduces raid success' },
  { id: 'collector', name: 'Collector', icon: Briefcase, description: 'Revenue collector', bonus: '+15 Logistics if promoted' },
];

export const SoldierDetailModal = ({ soldier, onClose }: SoldierDetailModalProps) => {
  const { 
    cash, currentDay, 
    trainSoldier, specializeSoldier, promoteSoldierToOfficer, dismissSoldier 
  } = useGameStore();
  
  const [isPromoting, setIsPromoting] = useState(false);
  
  const daysServed = currentDay - soldier.recruitedOnDay;
  const canTrain = cash >= 300;
  const canSpecialize = cash >= 500 && !soldier.specialization;
  const canPromote = soldier.promotable || (soldier.experience >= 80 && soldier.skill >= 60);
  
  const handleTrain = () => {
    trainSoldier(soldier.id);
    toast.success(`${soldier.name} trained! Skill and experience increased.`);
  };
  
  const handleSpecialize = (spec: SoldierSpecialization) => {
    specializeSoldier(soldier.id, spec);
    toast.success(`${soldier.name} is now a ${spec}!`);
  };
  
  const handlePromote = () => {
    setIsPromoting(true);
    setTimeout(() => {
      const result = promoteSoldierToOfficer(soldier.id);
      if (result.success) {
        toast.success(`${result.officerName} has been promoted to Blue Lantern!`);
        onClose();
      } else {
        toast.error(result.reason || 'Promotion failed');
        setIsPromoting(false);
      }
    }, 1000);
  };
  
  const handleDismiss = () => {
    dismissSoldier(soldier.id);
    toast.success(`${soldier.name} has been dismissed.`);
    onClose();
  };

  const getSpecIcon = () => {
    if (!soldier.specialization) return null;
    const spec = SPECIALIZATIONS.find(s => s.id === soldier.specialization);
    return spec ? spec.icon : null;
  };

  const SpecIcon = getSpecIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg mx-4 rounded-lg bg-card border-2 border-neon-amber/30 overflow-hidden"
        style={{ boxShadow: '0 0 30px hsl(45 100% 55% / 0.15)' }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-neon-amber/20 to-transparent border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-amber/20 border border-neon-amber/40">
                {SpecIcon ? <SpecIcon className="w-6 h-6 text-neon-amber" /> : <Users className="w-6 h-6 text-neon-amber" />}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{soldier.name}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{daysServed} days served</span>
                  {soldier.isVeteran && <Badge variant="outline" className="text-neon-green border-neon-green/30">Veteran</Badge>}
                  {soldier.isElite && <Badge variant="outline" className="text-neon-purple border-neon-purple/30">Elite</Badge>}
                  {soldier.specialization && (
                    <Badge variant="outline" className="text-neon-cyan border-neon-cyan/30 capitalize">{soldier.specialization}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="p-4 space-y-4">
          {/* Primary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Swords className="w-3 h-3" /> Skill
                </span>
                <span className="font-bold text-neon-cyan">{soldier.skill}</span>
              </div>
              <Progress value={soldier.skill} className="h-1.5" />
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Loyalty
                </span>
                <span className={cn(
                  "font-bold",
                  soldier.loyalty > 60 ? "text-neon-green" : 
                  soldier.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
                )}>{soldier.loyalty}%</span>
              </div>
              <Progress value={soldier.loyalty} className="h-1.5" />
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" /> Experience
                </span>
                <span className="font-bold text-neon-purple">{soldier.experience}</span>
              </div>
              <Progress value={soldier.experience} className="h-1.5" />
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" /> Kills
                </span>
                <span className="font-bold text-neon-red">{soldier.kills}</span>
              </div>
            </div>
          </div>
          
          {/* Battle Record */}
          <div className="p-3 rounded-lg bg-secondary/20 border border-border">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-neon-amber" /> Battle Record
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Victories:</span>
                <span className="font-bold text-neon-green">{soldier.battlesWon}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Defeats:</span>
                <span className="font-bold text-neon-red">{soldier.battlesLost}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Win Rate:</span>
                <span className="font-bold text-foreground">
                  {soldier.battlesWon + soldier.battlesLost > 0 
                    ? Math.round((soldier.battlesWon / (soldier.battlesWon + soldier.battlesLost)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Specialization Selection (if not specialized) */}
          {!soldier.specialization && (
            <div className="p-3 rounded-lg bg-secondary/20 border border-border">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-cyan" /> Assign Specialization ($500)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => handleSpecialize(spec.id)}
                      disabled={!canSpecialize}
                      className={cn(
                        "p-2 rounded border text-left transition-all",
                        canSpecialize 
                          ? "border-border bg-secondary/30 hover:border-neon-cyan/50 hover:bg-neon-cyan/10" 
                          : "border-border/50 bg-secondary/10 opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-neon-cyan" />
                        <span className="text-xs font-medium">{spec.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{spec.bonus}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Promotion Banner */}
          {canPromote && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gradient-to-r from-neon-amber/20 to-neon-purple/20 border border-neon-amber/40"
            >
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-neon-amber" />
                <div>
                  <h4 className="font-semibold text-neon-amber">Ready for Promotion!</h4>
                  <p className="text-xs text-muted-foreground">This soldier can become a Blue Lantern officer</p>
                </div>
              </div>
              <Button
                onClick={handlePromote}
                disabled={cash < 2000 || isPromoting}
                className="w-full gap-2 bg-neon-amber hover:bg-neon-amber/80 text-background"
              >
                {isPromoting ? (
                  <span className="animate-pulse">Promoting...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4" /> Promote to Officer ($2,000)
                  </>
                )}
              </Button>
            </motion.div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              onClick={handleTrain}
              disabled={!canTrain}
            >
              <TrendingUp className="w-4 h-4" /> Train ($300)
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-neon-red/30 text-neon-red hover:bg-neon-red/10"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" /> Dismiss
            </Button>
          </div>
          
          {!canPromote && (
            <div className="p-2 rounded bg-secondary/20 text-center">
              <p className="text-xs text-muted-foreground">
                Promotion requires: <span className={soldier.experience >= 80 ? "text-neon-green" : "text-neon-red"}>80+ Experience</span>
                {" & "}
                <span className={soldier.skill >= 60 ? "text-neon-green" : "text-neon-red"}>60+ Skill</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};