"use client";

import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Shield, 
  Users, 
  DollarSign, 
  Zap,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export const QuickActionsBar = () => {
  const { 
    cash, 
    intel, 
    policeHeat, 
    purchaseIntel, 
    reduceHeat,
    recruitSoldier,
    soldiers
  } = useGameStore();

  const handleBuyIntel = () => {
    if (cash < 500) {
      toast.error('Not enough cash! Need $500');
      return;
    }
    purchaseIntel(500);
    toast.success('Purchased 50 Intel for $500');
  };

  const handleBribePolice = () => {
    const bribeCost = Math.floor(policeHeat * 30);
    if (cash < bribeCost) {
      toast.error(`Not enough cash! Need $${bribeCost}`);
      return;
    }
    if (policeHeat < 20) {
      toast.error('Heat is already low');
      return;
    }
    reduceHeat(20);
    toast.success(`Bribed police for $${bribeCost}. Heat reduced by 20.`);
  };

  const handleRecruitSoldier = () => {
    if (cash < 500) {
      toast.error('Not enough cash! Need $500');
      return;
    }
    recruitSoldier();
    toast.success('Recruited a new soldier for $500');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700"
    >
      <span className="text-xs text-muted-foreground px-2">Quick Actions:</span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBuyIntel}
        disabled={cash < 500}
        className="gap-1 text-xs"
      >
        <Brain className="w-3 h-3 text-neon-cyan" />
        Buy Intel ($500)
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleBribePolice}
        disabled={cash < Math.floor(policeHeat * 30) || policeHeat < 20}
        className={cn(
          "gap-1 text-xs",
          policeHeat > 50 && "text-neon-red"
        )}
      >
        <Shield className="w-3 h-3" />
        Bribe Police (${Math.floor(policeHeat * 30)})
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRecruitSoldier}
        disabled={cash < 500}
        className="gap-1 text-xs"
      >
        <Users className="w-3 h-3 text-neon-amber" />
        Recruit ($500)
      </Button>

      {policeHeat > 70 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-neon-red/20 rounded text-xs text-neon-red animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          High Heat!
        </div>
      )}
    </motion.div>
  );
};