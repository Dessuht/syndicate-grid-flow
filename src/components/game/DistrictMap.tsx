import { useGameStore } from '@/stores/gameStore';
import type { Officer, Building as BuildingType } from '@/stores/gameStoreTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingCard } from './BuildingCard';
import { OfficersPanel } from './OfficersPanel';
import { SoldiersPanel } from './SoldiersPanel';
import { Button } from '@/components/ui/button';
import { 
  Building as BuildingIcon, 
  PartyPopper, 
  Swords, 
  AlertTriangle, 
  SkipForward, 
  Play, 
  ShieldAlert 
} from 'lucide-react';
import { useState } from 'react';

export const DistrictMap = () => {
  const {
    officers,
    buildings,
    currentDay,
    currentPhase,
    advancePhase,
    hostNightclub,
    cash,
    intel,
    isCivilWarActive,
    rebelOfficerId,
    activeEvent,
    eventData,
    unassignOfficer,
  } = useGameStore();

  const handleUnassign = (buildingId: string) => {
    if (currentPhase === 'morning') {
      const building = buildings.find(b => b.id === buildingId);
      if (building?.assignedOfficerId) {
        unassignOfficer(building.assignedOfficerId);
      }
    }
  };

  const getOfficerForBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building?.assignedOfficerId) {
      return officers.find(o => o.id === building.assignedOfficerId) || null;
    }
    return null;
  };

  const phaseButtonText = {
    morning: 'Start Operations',
    day: 'End Work Day',
    evening: 'Begin Night',
    night: 'Next Day',
  };
  
  const rebelOfficer = officers.find(o => o.id === rebelOfficerId);
  
  const isPhaseBlocked = isCivilWarActive || activeEvent === 'dailyBriefing';

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <BuildingIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold gradient-text">Kowloon District</h2>
              <p className="text-xs text-muted-foreground">
                {buildings.filter(b => b.isOccupied).length}/{buildings.length} active • Intel: {intel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="nightclub" 
              size="default" 
              onClick={hostNightclub} 
              disabled={cash < 1000 || isPhaseBlocked}
              className="gap-2"
            >
              <PartyPopper className="w-4 h-4" />
              Party ($1k)
            </Button>
            
            {isPhaseBlocked ? (
              <Button 
                variant="destructive" 
                size="default" 
                disabled={true}
                className="gap-2 animate-pulse"
              >
                {isCivilWarActive ? <Swords className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {isCivilWarActive ? 'Civil War Active' : 'Morning Briefing Required'}
              </Button>
            ) : (
              <Button 
                variant="cyber" 
                size="default" 
                onClick={advancePhase} 
                className="gap-2"
              >
                {currentPhase === 'night' ? <SkipForward className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {phaseButtonText[currentPhase]}
              </Button>
            )}
          </div>
        </div>

        {/* Police Activity Warning */}
        <AnimatePresence>
          {activeEvent === 'policeShakedown' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/30 via-neon-red/30 to-blue-600/30 border border-blue-500/50 flex items-center justify-between police-activity-warning"
            >
              <p className="text-sm text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-400 police-siren-icon" />
                <span className="font-bold text-blue-400">POLICE ACTIVITY</span>
                <span className="text-muted-foreground">— Shakedown in progress. Resolve immediately.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Civil War Warning */}
        <AnimatePresence>
          {isCivilWarActive && rebelOfficer && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 flex items-center justify-between"
            >
              <p className="text-sm text-neon-red flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{rebelOfficer.name}</span> is leading a rebellion! Resolve the Coup immediately.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase Status */}
        {currentPhase !== 'morning' && !isPhaseBlocked && (
          <div className="mb-3 p-2 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground">
              Assignments locked. Wait for morning to reassign officers.
            </p>
          </div>
        )}

        {/* Building Grid */}
        <motion.div className="command-grid flex-1 overflow-auto" layout>
          <AnimatePresence mode="popLayout">
            {buildings.map((building, index) => {
              const isInactive = building.inactiveUntilDay ? building.inactiveUntilDay > currentDay : false;
              return (
                <motion.div
                  key={building.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <BuildingCard
                    building={building}
                    officer={getOfficerForBuilding(building.id)}
                    onAssign={() => {}}
                    onUnassign={() => handleUnassign(building.id)}
                    isInactive={isInactive}
                    currentDay={currentDay}
                    canInteract={false}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Sidebar - Fixed width and proper overflow */}
      <div className="w-72 shrink-0 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <OfficersPanel />
        </div>
        <div className="flex-shrink-0">
          <SoldiersPanel />
        </div>
      </div>
    </div>
  );
};