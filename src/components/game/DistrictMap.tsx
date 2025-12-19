import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { BuildingCard } from './BuildingCard';
import { OfficersPanel } from './OfficersPanel';
import { SoldiersPanel } from './SoldiersPanel';
import { DayCycle } from './DayCycle';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Play, PartyPopper, SkipForward, ArrowLeft, Building, Swords, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DistrictMap = () => {
  const { 
    buildings, 
    officers, 
    currentDay, 
    currentPhase, 
    advancePhase, 
    hostNightclub, 
    cash, 
    intel,
    isCivilWarActive,
    rebelOfficerId,
    handleCoupResolution // We need this if we implement a direct raid button here later, but for now, we just disable advancePhase
  } = useGameStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const assignOfficer = useGameStore(state => state.assignOfficer);
  const unassignOfficer = useGameStore(state => state.unassignOfficer);

  const handleAssign = (buildingId: string) => {
    if (selectedOfficerId && currentPhase === 'morning') {
      const officer = officers.find(o => o.id === selectedOfficerId);
      const building = buildings.find(b => b.id === buildingId);
      
      // Prevent assignment to rebel base
      if (building?.isRebelBase) return;
      
      // Check if officer is available for assignment
      if (officer && !officer.assignedBuildingId && !officer.isWounded && !officer.isArrested) {
        assignOfficer(selectedOfficerId, buildingId);
        setSelectedOfficerId(null);
      }
    }
  };

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

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold gradient-text">Kowloon District</h2>
              <p className="text-xs text-muted-foreground">
                {buildings.filter(b => b.isOccupied).length}/{buildings.length} active • Intel: {intel}
              </p>
            </div>
          </div>
          <DayCycle />
          <div className="flex items-center gap-2">
            <Button 
              variant="nightclub" 
              size="default" 
              onClick={hostNightclub} 
              disabled={cash < 1000 || isCivilWarActive}
              className="gap-2"
            >
              <PartyPopper className="w-4 h-4" />
              Party ($1k)
            </Button>
            
            {isCivilWarActive ? (
              <Button 
                variant="destructive" 
                size="default" 
                disabled={true}
                className="gap-2 animate-pulse"
              >
                <Swords className="w-4 h-4" />
                Civil War Active
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

        {/* Selection hint */}
        <AnimatePresence>
          {selectedOfficerId && currentPhase === 'morning' && !isCivilWarActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 rounded-lg bg-primary/10 border border-primary/30"
            >
              <p className="text-sm text-primary">
                <span className="font-semibold">
                  {officers.find(o => o.id === selectedOfficerId)?.name}
                </span> selected — click an empty building to assign
              </p>
            </motion.div>
          )}
          {currentPhase !== 'morning' && !isCivilWarActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 rounded-lg bg-secondary/50 border border-border"
            >
              <p className="text-sm text-muted-foreground">
                Assignments locked. Wait for morning to reassign officers.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

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
                    onAssign={() => handleAssign(building.id)}
                    onUnassign={() => handleUnassign(building.id)}
                    isInactive={isInactive}
                    currentDay={currentDay}
                    canInteract={currentPhase === 'morning' && !isCivilWarActive}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-4 overflow-auto">
        <OfficersPanel 
          selectedOfficerId={selectedOfficerId} 
          onSelectOfficer={currentPhase === 'morning' && !isCivilWarActive ? setSelectedOfficerId : () => {}} 
        />
        <SoldiersPanel />
      </div>
    </div>
  );
};