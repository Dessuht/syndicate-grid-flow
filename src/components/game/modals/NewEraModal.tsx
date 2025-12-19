import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Skull, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewEraModalProps {
  data: {
    eulogy: string;
    newLeaderName: string;
    newLeaderRank: string;
  };
}

export const NewEraModal = ({ data }: NewEraModalProps) => {
  const { dismissEvent } = useGameStore();

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
          className="absolute inset-0 bg-background/90 backdrop-blur-lg"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="relative w-full max-w-xl mx-4 p-8 rounded-lg bg-card border-4 border-jianghu-gold/50"
          style={{ boxShadow: '0 0 50px hsl(45 90% 50% / 0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-jianghu-gold/20 border border-jianghu-gold/50">
              <Crown className="w-8 h-8 text-jianghu-gold" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-jianghu-gold">
                THE NEW ERA
              </h2>
              <p className="text-muted-foreground">Succession Complete</p>
            </div>
          </div>

          {/* Eulogy */}
          <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm italic text-foreground leading-relaxed">
              "{data.eulogy}"
            </p>
          </div>

          {/* New Leader Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-neon-cyan/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-secondary border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-lg shrink-0">
                {data.newLeaderName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{data.newLeaderName}</p>
                <p className="text-sm text-jianghu-gold">{data.newLeaderRank}</p>
              </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-neon-red">Loyalty Shock Applied</p>
                <p className="text-xs text-muted-foreground">All officers are now 'Testing the Waters'</p>
            </div>
          </div>

          <Button
            variant="cyber"
            className="w-full mt-6"
            onClick={dismissEvent}
          >
            Accept Mandate & Continue
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};