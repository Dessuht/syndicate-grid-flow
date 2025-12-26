"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Skull, 
  Eye, 
  Shield, 
  Swords, 
  AlertTriangle, 
  DollarSign,
  Users,
  Lock,
  Unlock,
  Crown,
  Target,
  X
} from 'lucide-react';
import type { IntrigueEvent, IntrigueChoice, Scheme } from '@/types/intrigue';

interface IntrigueEventModalProps {
  event: IntrigueEvent;
  scheme?: Scheme;
  onClose: () => void;
  onChoice: (choiceId: string) => void;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  rumor: Eye,
  discovery: AlertTriangle,
  confrontation: Swords,
  scheme_success: Skull,
  scheme_failure: Shield,
  faction_formed: Users,
  ambition_fulfilled: Crown,
};

const EVENT_COLORS: Record<string, string> = {
  rumor: 'neon-amber',
  discovery: 'neon-red',
  confrontation: 'neon-magenta',
  scheme_success: 'neon-red',
  scheme_failure: 'neon-green',
  faction_formed: 'neon-purple',
  ambition_fulfilled: 'neon-cyan',
};

export const IntrigueEventModal = ({ event, scheme, onClose, onChoice }: IntrigueEventModalProps) => {
  const { cash, intel, influence, officers } = useGameStore();
  
  const Icon = EVENT_ICONS[event.type] || AlertTriangle;
  const colorVar = EVENT_COLORS[event.type] || 'neon-cyan';

  const involvedOfficerNames = event.involvedOfficers
    .map(id => officers.find(o => o.id === id)?.name)
    .filter(Boolean);

  const canAffordChoice = (choice: IntrigueChoice) => {
    if (!choice.requirements) return true;
    if (choice.requirements.cash && cash < choice.requirements.cash) return false;
    if (choice.requirements.intel && intel < choice.requirements.intel) return false;
    if (choice.requirements.influence && influence < choice.requirements.influence) return false;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <Card className="bg-slate-900/95 border-slate-700 overflow-hidden">
          {/* Header */}
          <div 
            className="p-4 border-b border-slate-700"
            style={{ 
              background: `linear-gradient(135deg, hsl(var(--${colorVar}) / 0.2), transparent)` 
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: `hsl(var(--${colorVar}) / 0.2)`,
                    borderColor: `hsl(var(--${colorVar}) / 0.5)`
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: `hsl(var(--${colorVar}))` }} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: `hsl(var(--${colorVar}))` }}>
                    {event.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {event.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Narrative */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-sm text-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Involved Officers */}
            {involvedOfficerNames.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Involved:</span>
                {involvedOfficerNames.map((name, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Scheme Progress (if applicable) */}
            {scheme && (
              <div className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neon-red">Scheme Progress</span>
                  <span className="text-xs text-neon-red">{scheme.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neon-red"
                    initial={{ width: 0 }}
                    animate={{ width: `${scheme.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Phase: {scheme.phase}</span>
                  <span>Evidence: {scheme.evidence}%</span>
                </div>
              </div>
            )}

            {/* Choices */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Your Response</h3>
              {event.choices.map((choice) => {
                const canAfford = canAffordChoice(choice);
                return (
                  <motion.button
                    key={choice.id}
                    onClick={() => canAfford && onChoice(choice.id)}
                    disabled={!canAfford}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      canAfford
                        ? 'bg-secondary/30 border-border hover:border-primary/50 hover:bg-secondary/50 cursor-pointer'
                        : 'bg-secondary/10 border-border/50 opacity-50 cursor-not-allowed'
                    }`}
                    whileHover={canAfford ? { scale: 1.01 } : {}}
                    whileTap={canAfford ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{choice.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{choice.description}</p>
                      </div>
                      {choice.requirements && (
                        <div className="flex items-center gap-2 shrink-0">
                          {choice.requirements.cash && (
                            <div className="flex items-center gap-0.5">
                              <DollarSign className="w-3 h-3 text-neon-amber" />
                              <span className={`text-xs ${cash >= choice.requirements.cash ? 'text-neon-amber' : 'text-destructive'}`}>
                                {choice.requirements.cash}
                              </span>
                            </div>
                          )}
                          {choice.requirements.intel && (
                            <div className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3 text-neon-purple" />
                              <span className={`text-xs ${intel >= choice.requirements.intel ? 'text-neon-purple' : 'text-destructive'}`}>
                                {choice.requirements.intel}
                              </span>
                            </div>
                          )}
                          {choice.requirements.influence && (
                            <div className="flex items-center gap-0.5">
                              <Crown className="w-3 h-3 text-neon-cyan" />
                              <span className={`text-xs ${influence >= choice.requirements.influence ? 'text-neon-cyan' : 'text-destructive'}`}>
                                {choice.requirements.influence}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
