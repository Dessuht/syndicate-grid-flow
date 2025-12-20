import { useGameStore } from '@/stores/gameStore';
import type { Officer, OfficerRank } from '@/stores/gameStoreTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, DollarSign, MessageSquare, Skull, Briefcase, Star, TrendingUp, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OfficerDossierModalProps {
  officer: Officer;
  onClose: () => void;
}

const PROMOTION_COST = 5000;
const PROMOTION_FACE_REQUIREMENT = 50;

export const OfficerDossierModal = ({ officer, onClose }: OfficerDossierModalProps) => {
  const { 
    currentPhase, 
    cash, 
    shareTea, 
    giveBonus, 
    reprimandOfficer,
    promoteOfficer,
    designateSuccessor
  } = useGameStore();

  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;
  
  const canPromote = officer.face >= PROMOTION_FACE_REQUIREMENT && cash >= PROMOTION_COST;
  const isMaxRank = officer.rank === 'Deputy (438)' || officer.rank === 'Dragonhead (489)';
  const promotionAvailable = !isMaxRank && (officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' || officer.rank === 'Straw Sandal' || officer.rank === 'Blue Lantern');
  const nextRank = officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' ? 'Deputy (438)' : 'Dragonhead (489)';
  
  const isSuccessor = officer.isSuccessor;

  const handleShareTea = () => {
    shareTea(officer.id);
    // Close immediately after action, unless energy hit 0 (which might trigger unassignment)
    if (officer.energy - 10 > 0) {
        onClose();
    } else {
        // If energy hits 0, wait a moment for state update to propagate before closing
        setTimeout(onClose, 100);
    }
  };

  const handleBonus = () => {
    giveBonus(officer.id);
    onClose();
  };

  const handleReprimand = () => {
    reprimandOfficer(officer.id);
    onClose();
  };
  
  const handlePromote = (rank: OfficerRank) => {
    promoteOfficer(officer.id, rank);
    onClose();
  };
  
  const handleDesignateSuccessor = () => {
    designateSuccessor(officer.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-card border-2 border-neon-cyan/50 neon-glow-cyan max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-secondary border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-lg shrink-0">
            {officer.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold neon-text-cyan">{officer.name}</h2>
            <p className="text-sm text-muted-foreground">{officer.rank}</p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 pr-4">
          {/* Status & Stats */}
          <div className="space-y-3 mb-6 p-3 rounded-lg bg-secondary/30 border border-border">
            {/* Loyalty Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-neon-green" />
                  <span className="text-muted-foreground">Loyalty</span>
                </div>
                <span className={cn(
                  "font-medium",
                  officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
                )}>
                  {officer.loyalty}%
                </span>
              </div>
              <Progress 
                value={officer.loyalty} 
                className="h-1.5 bg-slate-800"
                indicatorClassName={cn(
                  officer.loyalty > 60 ? "bg-neon-green" : officer.loyalty > 40 ? "bg-neon-amber" : "bg-neon-red"
                )}
              />
            </div>
            
            {/* Face Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-jianghu-gold" />
                  <span className="text-muted-foreground">Face (Prestige)</span>
                </div>
                <span className={cn(
                  "font-medium",
                  officer.face >= PROMOTION_FACE_REQUIREMENT ? "text-jianghu-gold" : "text-muted-foreground"
                )}>
                  {officer.face}%
                </span>
              </div>
              <Progress 
                value={officer.face} 
                className="h-1.5 bg-slate-800"
                indicatorClassName="bg-jianghu-gold"
              />
            </div>

            {/* Energy Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-neon-magenta" />
                  <span className="text-muted-foreground">Energy</span>
                </div>
                <span className="text-neon-magenta font-medium">{officer.energy}/{officer.maxEnergy}</span>
              </div>
              <Progress 
                value={(officer.energy / officer.maxEnergy) * 100} 
                className="h-1.5 bg-slate-800"
                indicatorClassName="bg-neon-magenta"
              />
            </div>
            
            {/* Agenda */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-neon-amber" />
                <span className="text-xs font-semibold text-neon-amber">Current Agenda</span>
              </div>
              <p className="text-sm mt-1 text-foreground">
                {officer.currentAgenda || (canInteract ? 'Unknown. Share Tea to reveal.' : 'Unknown.')}
              </p>
            </div>
          </div>

          {/* Traits List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Traits</h3>
            <div className="flex flex-wrap gap-2">
              {officer.traits.map((trait, index) => (
                <span 
                  key={index} 
                  className="text-[10px] px-2 py-1 rounded bg-secondary/50 border border-border text-foreground"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Interaction Actions */}
          <h3 className="font-display text-lg font-bold mb-3">Interactions</h3>
          <div className="space-y-3">
            {/* Designate Successor */}
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-3 h-auto py-3",
                isSuccessor 
                  ? "border-jianghu-gold/50 bg-jianghu-gold/10 text-jianghu-gold" 
                  : "border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
              )}
              onClick={handleDesignateSuccessor}
              disabled={!canInteract}
            >
              <div className={cn("p-2 rounded", isSuccessor ? "bg-jianghu-gold/20" : "bg-neon-cyan/20")}>
                <Crown className={cn("w-5 h-5", isSuccessor ? "text-jianghu-gold" : "text-neon-cyan")} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  {isSuccessor ? 'Successor Designated' : 'Designate Successor'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSuccessor ? 'This officer will take over if you fall.' : 'Name this officer as your Vanguard.'}
                </p>
              </div>
            </Button>
            
            {/* Share Tea */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
              onClick={handleShareTea}
              disabled={!canInteract || officer.energy < 10}
            >
              <div className="p-2 rounded bg-neon-cyan/20">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Share Tea</p>
                <p className="text-xs text-muted-foreground">
                  +5 Loyalty, Reveal Agenda • -10 Energy
                </p>
              </div>
            </Button>

            {/* Give Bonus */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
              onClick={handleBonus}
              disabled={!canInteract || cash < 1000}
            >
              <div className="p-2 rounded bg-neon-green/20">
                <DollarSign className="w-5 h-5 text-neon-green" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Give Bonus</p>
                <p className="text-xs text-muted-foreground">
                  -$1,000 • +20 Loyalty, Clears Ambition
                </p>
              </div>
            </Button>

            {/* Reprimand */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={handleReprimand}
              disabled={!canInteract}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Skull className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Reprimand</p>
                <p className="text-xs text-muted-foreground">
                  -10 Heat • -20 Loyalty (Risk of Snitching/Quitting)
                </p>
              </div>
            </Button>
          </div>
          
          {/* Promotion Section */}
          {promotionAvailable && (
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <h3 className="font-display text-lg font-bold text-jianghu-gold">Promotion Ceremony</h3>
              
              <Button
                variant="cyber"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => handlePromote(nextRank as OfficerRank)}
                disabled={!canPromote}
              >
                <div className="p-2 rounded bg-jianghu-gold/20">
                  <TrendingUp className="w-5 h-5 text-jianghu-gold" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Promote to {nextRank}</p>
                  <p className="text-xs text-muted-foreground">
                    Cost: ${PROMOTION_COST.toLocaleString()} • Requires {PROMOTION_FACE_REQUIREMENT} Face
                  </p>
                </div>
              </Button>
              
              {!canPromote && (
                <p className="text-[10px] text-center text-neon-amber">
                  Requires ${PROMOTION_COST.toLocaleString()} cash and {PROMOTION_FACE_REQUIREMENT} Face.
                </p>
              )}
            </div>
          )}

          {!isMorning && (
            <p className="mt-4 text-xs text-neon-amber text-center">
              Interactions are only available during the Morning phase.
            </p>
          )}
          {isUnavailable && (
            <p className="mt-4 text-xs text-neon-red text-center">
              Officer is {officer.isWounded ? 'WOUNDED' : 'ARRESTED'} and cannot be interacted with.
            </p>
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};