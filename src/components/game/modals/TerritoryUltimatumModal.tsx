import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TerritoryUltimatumModal = () => {
  const { handleTerritoryUltimatum, cash, dismissEvent } = useGameStore();
  
  const payment = Math.floor(cash * 0.2);

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
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-red/50 neon-glow-red"
      >
        <button 
          onClick={dismissEvent}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-neon-red" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-red">ULTIMATUM</h2>
            <p className="text-muted-foreground">Wo Shing Wo demands tribute</p>
          </div>
        </div>
        
        <p className="text-foreground mb-6 leading-relaxed">
          The Wo Shing Wo have had enough of your operations in Wan Chai. They're demanding a cut of your profits or they'll escalate the conflict.
        </p>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
            onClick={() => handleTerritoryUltimatum('pay')}
          >
            <div className="p-2 rounded bg-neon-amber/20">
              <DollarSign className="w-5 h-5 text-neon-amber" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay Tribute</p>
              <p className="text-xs text-muted-foreground">
                Lose ${payment.toLocaleString()} (20% of cash) • Assigned member loses loyalty
              </p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
            onClick={() => handleTerritoryUltimatum('refuse')}
          >
            <div className="p-2 rounded bg-neon-red/20">
              <Shield className="w-5 h-5 text-neon-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Refuse Demand</p>
              <p className="text-xs text-muted-foreground">
                Enter active conflict with Wo Shing Wo • Income halved • Heat increases faster
              </p>
            </div>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};