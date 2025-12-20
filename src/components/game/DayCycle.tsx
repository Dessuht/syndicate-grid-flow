import { useGameStore } from '@/stores/gameStore';
import type { DayPhase } from '@/stores/gameStoreTypes';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

const PHASE_CONFIG: Record<DayPhase, { icon: React.ElementType; label: string; color: string; description: string }> = {
  morning: {
    icon: Coffee,
    label: 'Morning',
    color: 'neon-amber',
    description: 'Assign officers to buildings',
  },
  day: {
    icon: Sun,
    label: 'Day',
    color: 'neon-cyan',
    description: 'Operations in progress',
  },
  evening: {
    icon: Sunset,
    label: 'Evening',
    color: 'neon-magenta',
    description: 'Soldiers spend their wages',
  },
  night: {
    icon: Moon,
    label: 'Night',
    color: 'neon-purple',
    description: 'Events and intrigue unfold',
  },
};

export const DayCycle = () => {
  const { currentPhase, currentDay } = useGameStore();
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config.icon;

  const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-4 py-2 bg-card/50 rounded-lg border border-border"
    >
      {/* Day Counter */}
      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Day</span>
        <span className="font-display text-xl font-bold neon-text-cyan">{currentDay}</span>
      </div>

      {/* Phase Progress */}
      <div className="flex items-center gap-1">
        {phases.map((phase, index) => {
          const phaseConfig = PHASE_CONFIG[phase];
          const PhaseIcon = phaseConfig.icon;
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <div key={phase} className="flex items-center">
              <motion.div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  isActive && `bg-${phaseConfig.color}/20 border border-${phaseConfig.color}/50`,
                  isPast && "opacity-40",
                  !isActive && !isPast && "opacity-60"
                )}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              >
                <PhaseIcon
                  className={cn(
                    "w-4 h-4",
                    isActive && `text-${phaseConfig.color}`,
                    !isActive && "text-muted-foreground"
                  )}
                  style={isActive ? { color: `hsl(var(--${phaseConfig.color}))` } : {}}
                />
              </motion.div>
              {index < phases.length - 1 && (
                <div className={cn(
                  "w-3 h-0.5 mx-0.5",
                  isPast ? "bg-muted-foreground/50" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Info */}
      <div className="flex items-center gap-2 pl-4 border-l border-border">
        <div
          className="p-2 rounded-lg"
          style={{ background: `hsl(var(--${config.color}) / 0.1)`, border: `1px solid hsl(var(--${config.color}) / 0.3)` }}
        >
          <Icon className="w-5 h-5" style={{ color: `hsl(var(--${config.color}))` }} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold" style={{ color: `hsl(var(--${config.color}))` }}>
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </motion.div>
  );
};