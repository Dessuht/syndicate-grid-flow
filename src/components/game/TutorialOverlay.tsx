"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Swords,
  Calendar,
  Target,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Kowloon Syndicate',
    description: 'You are the new boss of a Triad organization in Hong Kong. Your goal is to expand your territory, manage your officers, and survive the dangerous underworld.',
    icon: Target,
  },
  {
    id: 'day-cycle',
    title: 'The Day Cycle',
    description: 'Each day has 4 phases: Morning (assign officers), Day (operations run), Evening (soldiers get paid), and Night (events occur). Plan your moves carefully!',
    icon: Calendar,
  },
  {
    id: 'officers',
    title: 'Managing Officers',
    description: 'Officers are your key personnel. Assign them to buildings to generate income. Keep their loyalty high with bonuses and tea sessions, or risk betrayal.',
    icon: Users,
  },
  {
    id: 'buildings',
    title: 'Territory & Buildings',
    description: 'Buildings generate cash but also police heat. Illicit operations pay more but attract more attention. Balance risk and reward.',
    icon: Building,
  },
  {
    id: 'resources',
    title: 'Managing Resources',
    description: 'Cash pays for everything. Reputation affects your standing. Police Heat triggers raids when too high. Intel helps with diplomacy.',
    icon: DollarSign,
  },
  {
    id: 'heat',
    title: 'Police Heat',
    description: 'Keep police heat below 70% to avoid raids. Assign White Paper Fan officers to the Police Station to reduce heat.',
    icon: AlertTriangle,
  },
  {
    id: 'rivals',
    title: 'Rival Gangs',
    description: 'Other gangs control nearby territories. You can trade, form alliances, or go to war. Choose your enemies wisely.',
    icon: Swords,
  },
  {
    id: 'ready',
    title: 'Ready to Begin',
    description: 'Start by assigning your officers to buildings during the Morning phase. Good luck, Boss!',
    icon: CheckCircle,
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export const TutorialOverlay = ({ onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('kowloon-tutorial-complete', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--neon-cyan) / 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, hsl(var(--neon-magenta) / 0.3) 0%, transparent 50%)`
          }} />
        </div>

        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg mx-4"
        >
          <Card className="bg-slate-900/95 border-slate-700 overflow-hidden">
            {/* Skip Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white z-10"
            >
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30 flex items-center justify-center"
              >
                <Icon className="w-10 h-10 text-neon-cyan" />
              </motion.div>

              {/* Title */}
              <h2 className="font-display text-2xl font-bold gradient-text mb-4">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                {step.description}
              </p>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {TUTORIAL_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStep 
                        ? "w-6 bg-neon-cyan" 
                        : index < currentStep
                          ? "bg-neon-cyan/50"
                          : "bg-slate-600"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {TUTORIAL_STEPS.length}
                </span>

                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  {isLastStep ? 'Start Playing' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};