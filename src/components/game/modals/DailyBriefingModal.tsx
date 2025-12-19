import { useGameStore, Officer } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, DollarSign, Heart, Skull, X, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DailyBriefingData {
  officerId: string;
  eventType: 'sick' | 'disgruntled' | 'hungover' | 'rivals';
}

interface DailyBriefingModalProps {
  data: DailyBriefingData;
}

const EVENT_CONFIG = (officer: Officer) => ({
  sick: {
    title: `${officer.name} is Sick`,
    description: `${officer.name} reports a severe illness and cannot perform duties effectively today.`,
    icon: Heart,
    color: 'neon-red',
    financial: { cost: 500, label: 'Pay Medical Bills (-$500)', effect: 'Officer recovers instantly.' },
    authoritarian: { label: 'Threaten to Fire (-20 Loyalty)', effect: 'Officer works, but loyalty drops.' },
  },
  disgruntled: {
    title: `${officer.name} is Disgruntled`,
    description: `${officer.name} feels overlooked and is openly complaining about their assignment.`,
    icon: MessageSquare,
    color: 'neon-amber',
    financial: { cost: 1000, label: 'Give Bonus (-$1,000)', effect: 'Officer morale boosted (+10 Loyalty).' },
    authoritarian: { label: 'Reprimand Publicly (-20 Loyalty)', effect: 'Officer complies, but loyalty drops.' },
  },
  hungover: {
    title: `${officer.name} is Hungover`,
    description: `${officer.name} spent the night drinking and is currently useless.`,
    icon: Zap,
    color: 'neon-magenta',
    financial: { cost: 200, label: 'Buy Energy Drink (-$200)', effect: 'Officer recovers 20 Energy.' },
    authoritarian: { label: 'Force to Work (-20 Loyalty)', effect: 'Officer works, but loyalty drops.' },
  },
  rivals: {
    title: `${officer.name} Approached by Rivals`,
    description: `Rival gang members tried to bribe ${officer.name} to leak information. They refused, but are shaken.`,
    icon: Skull,
    color: 'neon-red',
    financial: { cost: 1500, label: 'Offer Protection Bonus (-$1,500)', effect: 'Officer loyalty boosted (+15 Loyalty).' },
    authoritarian: { label: 'Demand Silence (-20 Loyalty)', effect: 'Officer complies, but loyalty drops.' },
  },
});

export const DailyBriefingModal = ({ data }: DailyBriefingModalProps) => {
  const { handleDailyBriefingChoice, officers, cash } = useGameStore();
  const officer = officers.find(o => o.id === data.officerId);

  if (!officer) return null;

  const config = EVENT_CONFIG(officer)[data.eventType];
  const Icon = config.icon;
  
  const canAffordFinancial = cash >= config.financial.cost;

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
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={cn(
            "relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2",
            `border-${config.color}/50`,
            `neon-glow-${config.color}`
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn("p-3 rounded-lg border", `bg-${config.color}/20 border-${config.color}/50`)}>
              <Icon className={cn("w-8 h-8", `text-${config.color}`)} />
            </div>
            <div>
              <h2 className={cn("font-display text-2xl font-bold", `neon-text-${config.color}`)}>
                DAILY BRIEFING
              </h2>
              <p className="text-muted-foreground">{config.title}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground mb-6 leading-relaxed">
            {config.description}
            <br /><br />
            You must resolve this issue before operations can begin.
          </p>

          {/* Choices */}
          <div className="space-y-3">
            {/* Financial */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
              disabled={!canAffordFinancial}
              onClick={() => handleDailyBriefingChoice('financial')}
            >
              <div className="p-2 rounded bg-neon-green/20">
                <DollarSign className="w-5 h-5 text-neon-green" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{config.financial.label}</p>
                <p className="text-xs text-muted-foreground">
                  {config.financial.effect}
                </p>
              </div>
            </Button>

            {/* Authoritarian */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
              onClick={() => handleDailyBriefingChoice('authoritarian')}
            >
              <div className="p-2 rounded bg-neon-red/20">
                <Skull className="w-5 h-5 text-neon-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Authoritarian Command</p>
                <p className="text-xs text-muted-foreground">
                  Officer works, but loses 20 Loyalty.
                </p>
              </div>
            </Button>

            {/* Passive */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/10"
              onClick={() => handleDailyBriefingChoice('passive')}
            >
              <div className="p-2 rounded bg-muted/20">
                <X className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Ignore Issue</p>
                <p className="text-xs text-muted-foreground">
                  Officer effectiveness reduced by 50% today. No cost.
                </p>
              </div>
            </Button>
          </div>

          {!canAffordFinancial && (
            <p className="mt-4 text-xs text-neon-red text-center">
              Insufficient funds for the financial option.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};