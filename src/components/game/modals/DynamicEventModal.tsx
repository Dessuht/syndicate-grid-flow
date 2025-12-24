import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { AlertTriangle, Zap, Users, DollarSign, Brain, Shield, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DynamicEventTemplate, EventChoiceTemplate, EventModifier, resolveEventChoice } from '@/core/events/eventTemplates';
import { toast } from 'sonner';

interface DynamicEventModalProps {
  template: DynamicEventTemplate;
  narrative: string;
  modifier: EventModifier | null;
  data: Record<string, string>;
  onClose: () => void;
}

export const DynamicEventModal = ({ template, narrative, modifier, data, onClose }: DynamicEventModalProps) => {
  const { cash, intel, influence, soldiers, officers } = useGameStore();
  const setState = useGameStore.setState;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-neon-red bg-neon-red/10';
      case 'major': return 'border-neon-amber bg-neon-amber/10';
      case 'moderate': return 'border-neon-cyan bg-neon-cyan/10';
      default: return 'border-border bg-card/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-6 h-6 text-neon-red" />;
      case 'major': return <Swords className="w-6 h-6 text-neon-amber" />;
      case 'moderate': return <Zap className="w-6 h-6 text-neon-cyan" />;
      default: return <Shield className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const canAffordChoice = (choice: EventChoiceTemplate) => {
    if (!choice.requirements) return true;
    if (choice.requirements.cash && cash < choice.requirements.cash) return false;
    if (choice.requirements.intel && intel < choice.requirements.intel) return false;
    if (choice.requirements.influence && influence < choice.requirements.influence) return false;
    if (choice.requirements.soldiers && soldiers.length < choice.requirements.soldiers) return false;
    return true;
  };

  const handleChoice = (choice: EventChoiceTemplate) => {
    const outcome = resolveEventChoice(choice, modifier);
    
    // Apply effects directly
    const state = useGameStore.getState();
    const updates: any = {};
    
    if (outcome.effects.cash) updates.cash = state.cash + outcome.effects.cash;
    if (outcome.effects.reputation) updates.reputation = state.reputation + outcome.effects.reputation;
    if (outcome.effects.policeHeat) updates.policeHeat = Math.max(0, state.policeHeat + outcome.effects.policeHeat);
    if (outcome.effects.intel) updates.intel = Math.max(0, state.intel + outcome.effects.intel);
    if (outcome.effects.influence) updates.influence = Math.max(0, state.influence + outcome.effects.influence);
    
    if (Object.keys(updates).length > 0) {
      setState(updates);
    }
    
    toast.success(choice.text, { description: outcome.description });
    onClose();
  };

  const getRequirementDisplay = (choice: EventChoiceTemplate) => {
    if (!choice.requirements) return null;
    const reqs = [];
    if (choice.requirements.cash) reqs.push({ icon: DollarSign, value: `$${choice.requirements.cash.toLocaleString()}`, met: cash >= choice.requirements.cash });
    if (choice.requirements.intel) reqs.push({ icon: Brain, value: `${choice.requirements.intel} Intel`, met: intel >= choice.requirements.intel });
    if (choice.requirements.influence) reqs.push({ icon: Users, value: `${choice.requirements.influence} Influence`, met: influence >= choice.requirements.influence });
    if (choice.requirements.soldiers) reqs.push({ icon: Shield, value: `${choice.requirements.soldiers} Soldiers`, met: soldiers.length >= choice.requirements.soldiers });
    return reqs;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "relative w-full max-w-2xl rounded-xl border-2 shadow-2xl overflow-hidden",
            getSeverityColor(template.severity)
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getSeverityIcon(template.severity)}
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {template.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      template.severity === 'critical' ? 'bg-neon-red/20 text-neon-red' :
                      template.severity === 'major' ? 'bg-neon-amber/20 text-neon-amber' :
                      template.severity === 'moderate' ? 'bg-neon-cyan/20 text-neon-cyan' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {template.severity.toUpperCase()}
                    </span>
                    {modifier && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        {modifier.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="p-6">
            <div className="prose prose-sm prose-invert max-w-none">
              {narrative.split('\n\n').map((paragraph, i) => (
                <p key={i} className={cn(
                  "text-sm leading-relaxed",
                  i === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Modifier effect display */}
            {modifier && (
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-xs font-medium text-primary mb-1">{modifier.name}</div>
                <div className="text-xs text-muted-foreground">{modifier.description}</div>
              </div>
            )}
          </div>

          {/* Choices */}
          <div className="p-6 pt-0 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Your Move</div>
            {template.choices.map((choice) => {
              const requirements = getRequirementDisplay(choice);
              const affordable = canAffordChoice(choice);
              
              return (
                <motion.button
                  key={choice.id}
                  whileHover={affordable ? { scale: 1.01, x: 4 } : {}}
                  whileTap={affordable ? { scale: 0.99 } : {}}
                  onClick={() => affordable && handleChoice(choice)}
                  disabled={!affordable}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    affordable 
                      ? "border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                      : "border-border/30 bg-card/20 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{choice.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">{choice.description}</div>
                    </div>
                    {requirements && requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-4">
                        {requirements.map((req, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "flex items-center gap-1 text-xs px-2 py-1 rounded",
                              req.met ? "bg-secondary text-foreground" : "bg-destructive/20 text-destructive"
                            )}
                          >
                            <req.icon className="w-3 h-3" />
                            <span>{req.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Outcome hints */}
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {choice.outcomes.map((outcome, i) => (
                      <span 
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground"
                      >
                        {Math.round(outcome.probability * 100)}% - {
                          Object.entries(outcome.effects)
                            .filter(([_, v]) => v !== undefined)
                            .map(([k, v]) => {
                              if (typeof v === 'number') {
                                return v > 0 ? `+${k}` : `-${k}`;
                              }
                              return k;
                            })
                            .slice(0, 2)
                            .join(', ') || 'safe'
                        }
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
