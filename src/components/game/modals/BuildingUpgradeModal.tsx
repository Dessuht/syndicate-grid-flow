import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/stores/gameStore';
import type { Building } from '@/stores/gameStoreTypes';
import { FaArrowUp, FaDollarSign, FaFire, FaUtensils, FaMusic, FaTimes, FaCheckCircle, FaLock } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface BuildingUpgradeModalProps {
  building: Building;
  onClose: () => void;
}

// Upgrade effects per level
const UPGRADE_EFFECTS: Record<string, { revenue: number; heat: number; food?: number; entertainment?: number }[]> = {
  'Noodle Shop': [
    { revenue: 150, heat: 0, food: 10 },
    { revenue: 200, heat: 1, food: 15 },
    { revenue: 300, heat: 1, food: 20 },
  ],
  'Mahjong Parlor': [
    { revenue: 200, heat: 1, entertainment: 10 },
    { revenue: 300, heat: 2, entertainment: 15 },
    { revenue: 450, heat: 2, entertainment: 25 },
  ],
  'Warehouse': [
    { revenue: 100, heat: 0 },
    { revenue: 200, heat: 1 },
    { revenue: 350, heat: 1 },
  ],
  'Nightclub': [
    { revenue: 250, heat: 1, entertainment: 15 },
    { revenue: 400, heat: 2, entertainment: 25 },
    { revenue: 600, heat: 3, entertainment: 40 },
  ],
  'Counterfeit Lab': [
    { revenue: 350, heat: 2 },
    { revenue: 500, heat: 3 },
    { revenue: 750, heat: 4 },
  ],
  'Drug Lab': [
    { revenue: 450, heat: 3 },
    { revenue: 650, heat: 4 },
    { revenue: 900, heat: 5 },
  ],
};

const UPGRADE_NAMES = ['Basic', 'Improved', 'Advanced', 'Elite'];

export const BuildingUpgradeModal: React.FC<BuildingUpgradeModalProps> = ({ building, onClose }) => {
  const { cash, upgradeBuilding } = useGameStore();
  
  const currentLevel = building.upgradeLevel || 0;
  const maxLevel = building.maxUpgradeLevel || 3;
  const upgradeCost = building.upgradeCost || (building.baseRevenue * 2);
  const canUpgrade = currentLevel < maxLevel && cash >= upgradeCost && !building.isRebelBase;
  
  const effects = UPGRADE_EFFECTS[building.type] || [];
  
  const handleUpgrade = () => {
    upgradeBuilding(building.id);
    // Modal stays open to show the result
  };

  const getTypeColor = () => {
    switch (building.type) {
      case 'Noodle Shop': return 'neon-amber';
      case 'Mahjong Parlor': return 'neon-purple';
      case 'Nightclub': return 'neon-pink';
      case 'Counterfeit Lab': return 'neon-red';
      case 'Drug Lab': return 'neon-green';
      default: return 'neon-cyan';
    }
  };

  const colorClass = getTypeColor();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn("p-4 border-b border-border", `bg-${colorClass}/10`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", `bg-${colorClass}/20 border border-${colorClass}/30`)}>
                  <FaArrowUp className={cn("w-5 h-5", `text-${colorClass}`)} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">{building.name}</h2>
                  <p className="text-sm text-muted-foreground">{building.type} • Level {currentLevel + 1}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Current Stats */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Current Stats</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <FaDollarSign className="w-4 h-4 text-neon-green" />
                  <span>${building.baseRevenue}/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFire className="w-4 h-4 text-neon-red" />
                  <span>+{building.heatGen} Heat</span>
                </div>
                {building.foodProvided > 0 && (
                  <div className="flex items-center gap-2">
                    <FaUtensils className="w-4 h-4 text-neon-amber" />
                    <span>{building.foodProvided} Food</span>
                  </div>
                )}
                {building.entertainmentProvided > 0 && (
                  <div className="flex items-center gap-2">
                    <FaMusic className="w-4 h-4 text-neon-purple" />
                    <span>{building.entertainmentProvided} Ent</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Upgrade Progress</span>
                <span className="text-xs text-muted-foreground">{currentLevel}/{maxLevel}</span>
              </div>
              <Progress value={(currentLevel / maxLevel) * 100} className="h-2" />
              <div className="flex justify-between mt-1">
                {Array.from({ length: maxLevel + 1 }).map((_, i) => (
                  <span key={i} className={cn(
                    "text-xs",
                    i <= currentLevel ? `text-${colorClass}` : "text-muted-foreground"
                  )}>
                    {UPGRADE_NAMES[i]}
                  </span>
                ))}
              </div>
            </div>

            {/* Upgrade Levels */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">Upgrade Levels</p>
              {effects.map((effect, i) => {
                const isUnlocked = i < currentLevel;
                const isNext = i === currentLevel;
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      isUnlocked && "bg-neon-green/10 border-neon-green/30",
                      isNext && "bg-neon-cyan/10 border-neon-cyan/30 ring-1 ring-neon-cyan/50",
                      !isUnlocked && !isNext && "bg-secondary/30 border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {isUnlocked ? (
                          <FaCheckCircle className="w-4 h-4 text-neon-green" />
                        ) : isNext ? (
                          <FaArrowUp className="w-4 h-4 text-neon-cyan animate-pulse" />
                        ) : (
                          <FaLock className="w-4 h-4 text-muted-foreground" />
                        )}
                        Level {i + 2} - {UPGRADE_NAMES[i + 1]}
                      </span>
                      {isNext && (
                        <span className="text-xs text-neon-amber">${upgradeCost * (i + 1)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="text-neon-green">+${effect.revenue}/day</span>
                      {effect.heat > 0 && <span className="text-neon-red">+{effect.heat} Heat</span>}
                      {effect.food && <span className="text-neon-amber">+{effect.food} Food</span>}
                      {effect.entertainment && <span className="text-neon-purple">+{effect.entertainment} Ent</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upgrade Button */}
            {currentLevel < maxLevel && (
              <div className="pt-2">
                <Button
                  onClick={handleUpgrade}
                  disabled={!canUpgrade}
                  className={cn(
                    "w-full gap-2",
                    canUpgrade && "bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                  )}
                >
                  <FaArrowUp className="w-4 h-4" />
                  {canUpgrade ? (
                    <>Upgrade to Level {currentLevel + 2} (${upgradeCost})</>
                  ) : cash < upgradeCost ? (
                    <>Need ${upgradeCost - cash} more</>
                  ) : (
                    <>Cannot Upgrade</>
                  )}
                </Button>
              </div>
            )}

            {currentLevel >= maxLevel && (
              <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/30 text-center">
                <FaCheckCircle className="w-6 h-6 text-neon-green mx-auto mb-1" />
                <p className="text-sm font-medium text-neon-green">Fully Upgraded!</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
