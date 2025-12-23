"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import type { Building, Officer } from '@/stores/gameStoreTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  User, 
  Building as BuildingIcon, 
  Zap, 
  Heart, 
  DollarSign,
  Flame,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OfficerAssignmentModalProps {
  building: Building;
  onClose: () => void;
}

export const OfficerAssignmentModal = ({ building, onClose }: OfficerAssignmentModalProps) => {
  const { officers, assignOfficer, currentPhase } = useGameStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);

  const availableOfficers = officers.filter(o => 
    !o.assignedBuildingId && 
    !o.isWounded && 
    !o.isArrested &&
    !o.isTraitor
  );

  const getSpecialtyMatch = (officer: Officer): { match: boolean; bonus: string } => {
    const specialtyMap: Record<string, { rank: string; bonus: string }> = {
      'Noodle Shop': { rank: 'Straw Sandal', bonus: '+20% revenue' },
      'Mahjong Parlor': { rank: 'Red Pole', bonus: '+25% revenue' },
      'Warehouse': { rank: 'Straw Sandal', bonus: '+15% revenue' },
      'Nightclub': { rank: 'Red Pole', bonus: '+30% revenue' },
      'Counterfeit Lab': { rank: 'Red Pole', bonus: '+25% revenue' },
      'Police Station': { rank: 'White Paper Fan', bonus: '-50% heat' },
      'Drug Lab': { rank: 'Red Pole', bonus: '+30% revenue' },
    };

    const specialty = specialtyMap[building.type];
    if (specialty && officer.rank === specialty.rank) {
      return { match: true, bonus: specialty.bonus };
    }
    return { match: false, bonus: '' };
  };

  const handleAssign = () => {
    if (!selectedOfficerId) return;
    
    assignOfficer(selectedOfficerId, building.id);
    const officer = officers.find(o => o.id === selectedOfficerId);
    toast.success(`${officer?.name} assigned to ${building.name}`);
    onClose();
  };

  if (currentPhase !== 'morning') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <Card className="bg-slate-900 border-slate-700 p-6 max-w-md">
          <div className="flex items-center gap-3 text-neon-amber">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-display text-lg font-bold">Assignments Locked</h3>
          </div>
          <p className="mt-3 text-muted-foreground">
            Officers can only be assigned during the Morning phase.
          </p>
          <Button onClick={onClose} className="mt-4 w-full">
            Understood
          </Button>
        </Card>
      </motion.div>
    );
  }

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
        className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-slate-900 border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                  <BuildingIcon className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Assign Officer
                  </h2>
                  <p className="text-sm text-muted-foreground">{building.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Building Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-neon-amber" />
                <span className="text-neon-amber">${building.baseRevenue}/day</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className={cn("w-4 h-4", building.heatGen < 0 ? "text-neon-cyan" : "text-neon-red")} />
                <span className={building.heatGen < 0 ? "text-neon-cyan" : "text-neon-red"}>
                  {building.heatGen > 0 ? '+' : ''}{building.heatGen} heat
                </span>
              </div>
              {building.isIllicit && (
                <Badge variant="destructive" className="text-xs">ILLICIT</Badge>
              )}
            </div>
          </div>

          {/* Officer List */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {availableOfficers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No available officers</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All officers are assigned, wounded, or arrested.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableOfficers.map(officer => {
                  const specialty = getSpecialtyMatch(officer);
                  const isSelected = selectedOfficerId === officer.id;

                  return (
                    <motion.div
                      key={officer.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedOfficerId(officer.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "bg-neon-cyan/10 border-neon-cyan" 
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                            isSelected 
                              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan" 
                              : "bg-slate-700 text-slate-300"
                          )}>
                            {officer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{officer.name}</span>
                              {specialty.match && (
                                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                                  {specialty.bonus}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{officer.rank}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Energy */}
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-neon-magenta" />
                            <div className="w-16">
                              <Progress 
                                value={(officer.energy / officer.maxEnergy) * 100} 
                                className="h-2"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {officer.energy}
                            </span>
                          </div>

                          {/* Loyalty */}
                          <div className="flex items-center gap-2">
                            <Heart className={cn(
                              "w-4 h-4",
                              officer.loyalty > 60 ? "text-neon-green" :
                              officer.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
                            )} />
                            <span className={cn(
                              "text-sm font-medium",
                              officer.loyalty > 60 ? "text-neon-green" :
                              officer.loyalty > 30 ? "text-neon-amber" : "text-neon-red"
                            )}>
                              {officer.loyalty}%
                            </span>
                          </div>

                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-neon-cyan" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedOfficerId}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Assign Officer
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};