import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Gavel, Skull, Link, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriminalModalProps {
  data: {
    criminalName: string;
    crime: string;
  };
}

export const CriminalModal = ({ data }: CriminalModalProps) => {
  const { handleCriminalChoice, dismissEvent } = useGameStore();

  const crimeDescriptions: Record<string, string> = {
    theft: 'stealing from your warehouses',
    assault: 'attacking one of your soldiers',
    smuggling: 'running contraband through your territory without permission',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-amber/50 neon-glow-amber"
      >
        <button
          onClick={dismissEvent}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-amber/20 border border-neon-amber/50">
            <Gavel className="w-8 h-8 text-neon-amber" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-amber">JUSTICE</h2>
            <p className="text-muted-foreground">A criminal has been caught</p>
          </div>
        </div>

        <p className="text-foreground mb-6 leading-relaxed">
          Your soldiers have apprehended <span className="text-neon-amber font-semibold">{data.criminalName}</span> for{' '}
          <span className="text-neon-red">{crimeDescriptions[data.crime] || data.crime}</span>.
          <br /><br />
          As the local authority, you must decide their fate. Your decision will affect your reputation 
          and the loyalty of your men.
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
            onClick={() => handleCriminalChoice('execute')}
          >
            <div className="p-2 rounded bg-neon-red/20">
              <Skull className="w-5 h-5 text-neon-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Public Execution</p>
              <p className="text-xs text-muted-foreground">
                -10 Heat (fear) • +5 Reputation • -5 Soldier Loyalty (fear)
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
            onClick={() => handleCriminalChoice('enslave')}
          >
            <div className="p-2 rounded bg-neon-cyan/20">
              <Link className="w-5 h-5 text-neon-cyan" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Force Into Labor</p>
              <p className="text-xs text-muted-foreground">
                Gain a permanent worker (low loyalty, no pay needed)
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
            onClick={() => handleCriminalChoice('spy')}
          >
            <div className="p-2 rounded bg-neon-green/20">
              <Eye className="w-5 h-5 text-neon-green" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Turn Into Informant</p>
              <p className="text-xs text-muted-foreground">
                +50 Intel (information on rival operations)
              </p>
            </div>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
