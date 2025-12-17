import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { BuildingCard } from './BuildingCard';
import { OfficersPanel } from './OfficersPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Play, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DistrictMap = () => {
  const { buildings, officers, currentDay, processDay, hostNightclub, cash } = useGameStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const assignOfficer = useGameStore(state => state.assignOfficer);
  const unassignOfficer = useGameStore(state => state.unassignOfficer);

  const handleAssign = (buildingId: string) => {
    if (selectedOfficerId) {
      const officer = officers.find(o => o.id === selectedOfficerId);
      if (officer && !officer.assignedBuildingId) {
        assignOfficer(selectedOfficerId, buildingId);
        setSelectedOfficerId(null);
      }
    }
  };

  const handleUnassign = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building?.assignedOfficerId) {
      unassignOfficer(building.assignedOfficerId);
    }
  };

  const getOfficerForBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building?.assignedOfficerId) {
      return officers.find(o => o.id === building.assignedOfficerId) || null;
    }
    return null;
  };

  return (
    <div className="flex gap-6 p-6 h-full">
      {/* Main Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold gradient-text">Kowloon District</h2>
              <p className="text-sm text-muted-foreground">Your territory • {buildings.filter(b => b.isOccupied).length}/{buildings.length} active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="nightclub"
              size="lg"
              onClick={hostNightclub}
              disabled={cash < 1000}
              className="gap-2"
            >
              <PartyPopper className="w-4 h-4" />
              Nightclub ($1000)
            </Button>
            <Button
              variant="cyber"
              size="lg"
              onClick={processDay}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Next Day
            </Button>
          </div>
        </div>

        {/* Selection hint */}
        <AnimatePresence>
          {selectedOfficerId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30"
            >
              <p className="text-sm text-primary">
                <span className="font-semibold">{officers.find(o => o.id === selectedOfficerId)?.name}</span> selected — click an empty building to assign
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Building Grid */}
        <motion.div 
          className="command-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {buildings.map((building, index) => {
              const isInactive = building.inactiveUntilDay ? building.inactiveUntilDay > currentDay : false;
              return (
                <motion.div
                  key={building.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BuildingCard
                    building={building}
                    officer={getOfficerForBuilding(building.id)}
                    onAssign={() => handleAssign(building.id)}
                    onUnassign={() => handleUnassign(building.id)}
                    isInactive={isInactive}
                    currentDay={currentDay}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Officers Sidebar */}
      <div className="w-80 shrink-0">
        <OfficersPanel
          selectedOfficerId={selectedOfficerId}
          onSelectOfficer={setSelectedOfficerId}
        />
      </div>
    </div>
  );
};
