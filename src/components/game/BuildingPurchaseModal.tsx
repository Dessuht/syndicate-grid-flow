"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import type { BuildingType } from '@/stores/gameStoreTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Store, 
  Dice1 as Dices, 
  Warehouse, 
  Music, 
  Beaker,
  DollarSign,
  Flame,
  Utensils,
  PartyPopper,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BuildingPurchaseModalProps {
  onClose: () => void;
}

const BUILDING_OPTIONS: {
  type: BuildingType;
  name: string;
  cost: number;
  revenue: number;
  heat: number;
  food: number;
  entertainment: number;
  isIllicit: boolean;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: 'Noodle Shop',
    name: 'Noodle Shop',
    cost: 3000,
    revenue: 500,
    heat: 1,
    food: 30,
    entertainment: 5,
    isIllicit: false,
    icon: Store,
    description: 'A legitimate front that provides food for your soldiers.',
  },
  {
    type: 'Mahjong Parlor',
    name: 'Mahjong Parlor',
    cost: 5000,
    revenue: 800,
    heat: 3,
    food: 0,
    entertainment: 40,
    isIllicit: true,
    icon: Dices,
    description: 'Gambling den with high entertainment value.',
  },
  {
    type: 'Warehouse',
    name: 'Warehouse',
    cost: 4000,
    revenue: 400,
    heat: 2,
    food: 0,
    entertainment: 0,
    isIllicit: false,
    icon: Warehouse,
    description: 'Storage facility for goods and operations.',
  },
  {
    type: 'Nightclub',
    name: 'Nightclub',
    cost: 6000,
    revenue: 600,
    heat: 4,
    food: 10,
    entertainment: 60,
    isIllicit: true,
    icon: Music,
    description: 'High-end entertainment venue with party potential.',
  },
  {
    type: 'Counterfeit Lab',
    name: 'Counterfeit Lab',
    cost: 8000,
    revenue: 1200,
    heat: 5,
    food: 0,
    entertainment: 0,
    isIllicit: true,
    icon: Beaker,
    description: 'Produces fake currency. High risk, high reward.',
  },
  {
    type: 'Drug Lab',
    name: 'Drug Lab',
    cost: 10000,
    revenue: 1500,
    heat: 6,
    food: 0,
    entertainment: 20,
    isIllicit: true,
    icon: Beaker,
    description: 'The most profitable but dangerous operation.',
  },
];

export const BuildingPurchaseModal = ({ onClose }: BuildingPurchaseModalProps) => {
  const { cash, acquireBuilding } = useGameStore();
  const [selectedType, setSelectedType] = useState<BuildingType | null>(null);

  const handlePurchase = () => {
    if (!selectedType) return;
    
    const building = BUILDING_OPTIONS.find(b => b.type === selectedType);
    if (!building) return;

    if (cash < building.cost) {
      toast.error(`Not enough cash! Need $${building.cost}`);
      return;
    }

    acquireBuilding(selectedType);
    toast.success(`Acquired new ${building.name}!`);
    onClose();
  };

  const selectedBuilding = BUILDING_OPTIONS.find(b => b.type === selectedType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-slate-900 border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
                  <ShoppingCart className="w-5 h-5 text-neon-amber" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Acquire New Territory
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Available funds: <span className="text-neon-amber font-bold">${cash.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Building Grid */}
          <div className="p-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUILDING_OPTIONS.map(building => {
                const canAfford = cash >= building.cost;
                const isSelected = selectedType === building.type;
                const Icon = building.icon;

                return (
                  <motion.div
                    key={building.type}
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                    onClick={() => canAfford && setSelectedType(building.type)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "bg-neon-cyan/10 border-neon-cyan neon-glow-cyan" 
                        : canAfford
                          ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                          : "bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        building.isIllicit 
                          ? "bg-neon-red/10 border border-neon-red/30" 
                          : "bg-neon-green/10 border border-neon-green/30"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          building.isIllicit ? "text-neon-red" : "text-neon-green"
                        )} />
                      </div>
                      {building.isIllicit && (
                        <Badge variant="destructive" className="text-xs">ILLICIT</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-white mb-1">{building.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {building.description}
                    </p>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className={cn(
                          "font-bold",
                          canAfford ? "text-neon-amber" : "text-neon-red"
                        )}>
                          ${building.cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="text-neon-green">${building.revenue}/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Heat:</span>
                        <span className="text-neon-red">+{building.heat}</span>
                      </div>
                    </div>

                    {(building.food > 0 || building.entertainment > 0) && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                        {building.food > 0 && (
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-neon-green" />
                            <span className="text-xs text-neon-green">{building.food}</span>
                          </div>
                        )}
                        {building.entertainment > 0 && (
                          <div className="flex items-center gap-1">
                            <PartyPopper className="w-3 h-3 text-neon-magenta" />
                            <span className="text-xs text-neon-magenta">{building.entertainment}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Building Details */}
          {selectedBuilding && (
            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{selectedBuilding.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedBuilding.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-neon-amber">
                    ${selectedBuilding.cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedType 
                  ? `After purchase: $${(cash - (selectedBuilding?.cost || 0)).toLocaleString()}`
                  : 'Select a building to purchase'
                }
              </p>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchase}
                  disabled={!selectedType || cash < (selectedBuilding?.cost || 0)}
                  className="gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Purchase Building
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};