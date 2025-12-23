"use client";

import { DollarSign, Star, AlertTriangle, Calendar, Brain, Users, Zap, Shield, ChevronDown } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const ResourceBar = () => {
  const { 
    cash, 
    reputation, 
    policeHeat, 
    currentDay, 
    intel, 
    influence, 
    soldiers, 
    officers,
    purchaseIntel,
    recruitSoldier
  } = useGameStore();
  
  const heatColor = policeHeat > 70 ? 'neon-text-red' : policeHeat > 40 ? 'neon-text-amber' : 'neon-text-green';
  const activeOfficers = officers.filter(o => o.assignedBuildingId).length;

  const handleBuyIntel = () => {
    if (cash < 500) {
      toast.error('Not enough cash! Need $500');
      return;
    }
    purchaseIntel(500);
    toast.success('Purchased 50 Intel for $500');
  };

  const handleRecruitSoldier = () => {
    if (cash < 500) {
      toast.error('Not enough cash! Need $500');
      return;
    }
    recruitSoldier();
    toast.success('Recruited a new soldier!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between w-full"
    >
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Cash */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
            <DollarSign className="w-4 h-4 text-neon-amber" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Cash</p>
            <p className="text-sm font-bold neon-text-amber">${cash.toLocaleString()}</p>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <Star className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Rep</p>
            <p className="text-sm font-bold neon-text-green">{reputation}</p>
          </div>
        </div>

        {/* Police Heat */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg border",
            policeHeat > 70 ? 'bg-neon-red/20 border-neon-red/50 animate-pulse' : 'bg-neon-red/10 border-neon-red/30'
          )}>
            <AlertTriangle className={cn("w-4 h-4", policeHeat > 70 ? 'text-neon-red' : 'text-neon-red/70')} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Heat</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-bold", heatColor)}>{policeHeat}%</p>
              <div className="w-12 lg:w-16 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                <motion.div
                  className="heat-bar h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${policeHeat}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Intel */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Brain className="w-4 h-4 text-neon-cyan" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Intel</p>
            <p className="text-sm font-bold neon-text-cyan">{intel}</p>
          </div>
        </div>
        
        {/* Influence */}
        <div className="flex items-center gap-2 hidden md:flex">
          <div className="p-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <Zap className="w-4 h-4" style={{ color: 'hsl(var(--neon-purple))' }} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Influence</p>
            <p className="text-sm font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>{influence}</p>
          </div>
        </div>

        {/* Manpower */}
        <div className="flex items-center gap-2 hidden lg:flex">
          <div className="p-1.5 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
            <Users className="w-4 h-4 text-neon-magenta" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Forces</p>
            <p className="text-sm font-bold">
              <span className="neon-text-magenta">{activeOfficers}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{officers.length}</span>
              <span className="text-muted-foreground text-xs ml-1">+ {soldiers.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Day Counter & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
              <Zap className="w-3 h-3" />
              Actions
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleBuyIntel} disabled={cash < 500}>
              <Brain className="w-4 h-4 mr-2 text-neon-cyan" />
              Buy Intel ($500)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRecruitSoldier} disabled={cash < 500}>
              <Users className="w-4 h-4 mr-2 text-neon-amber" />
              Recruit Soldier ($500)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Shield className="w-4 h-4 mr-2" />
              More actions coming...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Day Counter */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Day</p>
            <p className="text-xl font-display font-bold neon-text-cyan">{currentDay}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};