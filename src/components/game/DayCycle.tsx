import { useGameStore } from '@/stores/gameStore';
import type { DayPhase, GameSpeed } from '@/stores/gameStoreTypes';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Coffee, Play, Pause, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

const SPEED_OPTIONS: { value: GameSpeed; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
];

export const DayCycle = () => {
  const { 
    currentPhase, 
    currentDay, 
    gameSpeed, 
    isPlaying, 
    phaseProgress,
    setGameSpeed,
    togglePlay,
    activeEvent
  } = useGameStore();
  
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config.icon;

  const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
  const currentIndex = phases.indexOf(currentPhase);

  // Check if game is blocked by event
  const blockingEvents = ['dailyBriefing', 'policeShakedown', 'streetBeef', 'coupAttempt', 'newEra', 'policeRaid', 'betrayal', 'rivalAttack', 'streetWar'];
  const isBlocked = activeEvent && blockingEvents.includes(activeEvent);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-4 py-2 bg-card/50 rounded-lg border border-border"
    >
      {/* Time Controls */}
      <div className="flex items-center gap-1 pr-4 border-r border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          disabled={isBlocked}
          className={cn(
            "h-8 w-8 p-0",
            isPlaying && "text-neon-green",
            isBlocked && "opacity-50"
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        {/* Speed buttons */}
        <div className="flex items-center gap-0.5 ml-1">
          {SPEED_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => setGameSpeed(value)}
              disabled={isBlocked}
              className={cn(
                "h-7 px-2 text-xs font-mono",
                gameSpeed === value && "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50",
                isBlocked && "opacity-50"
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Day Counter */}
      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Day</span>
        <span className="font-display text-xl font-bold neon-text-cyan">{currentDay}</span>
      </div>

      {/* Phase Progress */}
      <div className="flex flex-col gap-1 flex-1">
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
                  animate={isActive && isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isActive && isPlaying ? Infinity : 0 }}
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
                    "w-3 h-0.5 mx-0.5 relative overflow-hidden",
                    isPast ? "bg-muted-foreground/50" : "bg-border"
                  )}>
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-neon-cyan"
                        style={{ width: `${phaseProgress}%` }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress bar for current phase */}
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ 
              width: `${phaseProgress}%`,
              background: `hsl(var(--${config.color}))`
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Current Phase Info */}
      <div className="flex items-center gap-2 pl-4 border-l border-border">
        <div
          className={cn(
            "p-2 rounded-lg relative",
            isPlaying && "animate-pulse"
          )}
          style={{ background: `hsl(var(--${config.color}) / 0.1)`, border: `1px solid hsl(var(--${config.color}) / 0.3)` }}
        >
          <Icon className="w-5 h-5" style={{ color: `hsl(var(--${config.color}))` }} />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full animate-ping" />
          )}
          {!isPlaying && !isBlocked && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-amber rounded-full" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-semibold" style={{ color: `hsl(var(--${config.color}))` }}>
              {config.label}
            </p>
            {isPlaying && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/20 text-neon-green font-medium">
                LIVE
              </span>
            )}
            {!isPlaying && !isBlocked && (
              <motion.span 
                className="text-[10px] px-1.5 py-0.5 rounded bg-neon-amber/20 text-neon-amber font-medium cursor-pointer"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                onClick={togglePlay}
              >
                PAUSED - Click to Resume
              </motion.span>
            )}
            {isBlocked && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-amber/20 text-neon-amber font-medium">
                EVENT
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </motion.div>
  );
};