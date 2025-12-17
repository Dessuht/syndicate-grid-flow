import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { UserMinus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesertionNoticeProps {
  data: {
    count: number;
  };
}

export const DesertionNotice = ({ data }: DesertionNoticeProps) => {
  const { dismissEvent } = useGameStore();

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
        onClick={dismissEvent}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-card border-2 border-neon-amber/50 neon-glow-amber"
      >
        <button
          onClick={dismissEvent}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-neon-amber/20 border border-neon-amber/50">
            <UserMinus className="w-8 h-8 text-neon-amber" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold neon-text-amber">DESERTION</h2>
            <p className="text-muted-foreground">Soldiers have fled</p>
          </div>
        </div>

        <p className="text-foreground mb-6">
          <span className="text-neon-red font-bold text-xl">{data.count}</span> street soldier{data.count > 1 ? 's have' : ' has'} deserted 
          due to low morale. Their needs were not being met.
        </p>

        <div className="p-3 rounded-lg bg-secondary/30 mb-4">
          <p className="text-xs text-muted-foreground mb-2">Prevention Tips:</p>
          <ul className="text-xs text-foreground space-y-1">
            <li>• Increase stipend to improve pay satisfaction</li>
            <li>• Assign officers to Noodle Shops for food</li>
            <li>• Assign officers to Nightclubs for entertainment</li>
            <li>• Host Nightclub events for instant morale boost</li>
          </ul>
        </div>

        <Button
          variant="outline"
          className="w-full border-neon-amber/30 hover:border-neon-amber/60"
          onClick={dismissEvent}
        >
          Understood
        </Button>
      </motion.div>
    </motion.div>
  );
};
