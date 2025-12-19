import { useGameStore, Officer } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, DollarSign, MessageSquare, Skull, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OfficerDossierModalProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerDossierModal = ({ officer, onClose }: OfficerDossierModalProps) => {
  const { 
    currentPhase, 
    cash, 
    talkToOfficer, 
    giveBonus, 
    threatenOfficer 
  } = useGameStore();

  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;

  const handleTalk = () => {
    talkToOfficer(officer.id);
    // Close if energy runs out, otherwise keep open to see loyalty/agenda update
    if (officer.energy - 10 <= 0) {
        onClose();
    }
  };

  const handleBonus = () => {
    giveBonus(officer.id);
    onClose();
  };

  const handleThreaten = () => {
    threatenOfficer(officer.id);
    onClose();
  };

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-card border-2 border-neon-cyan/50 neon-glow-cyan"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-secondary border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-lg shrink-0">
              {officer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold neon-text-cyan">{officer.name}</h2>
              <p className="text-sm text-muted-foreground">{officer.rank}</p>
            </div>
          </div>

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
                {officer.currentAgenda || (canInteract ? 'Unknown. Talk to reveal.' : 'Unknown.')}
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
            {/* Talk/Consult */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
              onClick={handleTalk}
              disabled={!canInteract || officer.energy < 10}
            >
              <div className="p-2 rounded bg-neon-cyan/20">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Talk/Consult</p>
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

            {/* Threaten */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={handleThreaten}
              disabled={!canInteract}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Skull className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Threaten</p>
                <p className="text-xs text-muted-foreground">
                  -10 Heat • -20 Loyalty (High Risk)
                </p>
              </div>
            </Button>
          </div>
          
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};