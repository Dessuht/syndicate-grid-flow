"use client";

import { useGameStore } from '@/stores/gameStore';
import type { Officer, Building as BuildingType } from '@/stores/gameStoreTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingCard } from './BuildingCard';
import { OfficersPanel } from './OfficersPanel';
import { SoldiersPanel } from './SoldiersPanel';
import { GameStatsPanel } from './GameStatsPanel';
import { ManagementPanel } from './ManagementPanel';
import { OfficerAssignmentModal } from './OfficerAssignmentModal';
import { BuildingPurchaseModal } from './BuildingPurchaseModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building as BuildingIcon, 
  PartyPopper, 
  Swords, 
  AlertTriangle, 
  SkipForward, 
  Play, 
  ShieldAlert,
  Plus,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'officers' | 'soldiers' | 'stats' | 'manage'>('officers');

  const handleBuildingClick = (building: BuildingType) => {
    if (building.isRebelBase) {
      toast.error('This building is under rebel control!');
      return;
    }
    
    if (building.inactiveUntilDay && building.inactiveUntilDay > currentDay) {
      toast.error(`Building closed for ${building.inactiveUntilDay - currentDay} more days`);
      return;
    }

    if (building.isOccupied) {
      // Show unassign option
      if (currentPhase === 'morning') {
        const officer = officers.find(o => o.id === building.assignedOfficerId);
        if (officer) {
          unassignOfficer(officer.id);
          toast.success(`${officer.name} unassigned from ${building.name}`);
        }
      } else {
        toast.error('Can only unassign during Morning phase');
      }
    } else {
      // Open assignment modal
      setSelectedBuilding(building);
    }
  };

  const handleUnassign = (buildingId: string) => {
    if (currentPhase === 'morning') {
      const building = buildings.find(b => b.id === buildingId);
      if (building?.assignedOfficerId) {
        const officer = officers.find(o => o.id === building.assignedOfficerId);
        unassignOfficer(building.assignedOfficerId);
        toast.success(`${officer?.name} unassigned`);
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

  const handleHostNightclub = () => {
    const nightclub = buildings.find(b => b.type === 'Nightclub' && b.isOccupied);
    if (!nightclub) {
      toast.error('Need an occupied Nightclub to host a party!');
      return;
    }
    hostNightclub();
    toast.success('🎉 Party was a success!');
  };

  const rebelOfficer = officers.find(o => o.id === rebelOfficerId);

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
              variant="outline" 
              size="default" 
              onClick={() => setShowPurchaseModal(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Buy Building
            </Button>
            
            <Button 
              variant="nightclub" 
              size="default" 
              onClick={handleHostNightclub} 
              disabled={cash < 1000 || isCivilWarActive}
              className="gap-2"
            >
              <PartyPopper className="w-4 h-4" />
              Party ($1k)
            </Button>
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
        {currentPhase === 'morning' && !isCivilWarActive && (
          <div className="mb-3 p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <p className="text-sm text-neon-green">
              ☀️ Morning Phase: Click on empty buildings to assign officers.
            </p>
          </div>
        )}
        
        {currentPhase !== 'morning' && !isCivilWarActive && (
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
                  onClick={() => handleBuildingClick(building)}
                  className="cursor-pointer"
                >
                  <BuildingCard
                    building={building}
                    officer={getOfficerForBuilding(building.id)}
                    onAssign={() => {}}
                    onUnassign={() => handleUnassign(building.id)}
                    isInactive={isInactive}
                    currentDay={currentDay}
                    canInteract={currentPhase === 'morning'}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Sidebar with Tabs */}
      <div className="w-80 shrink-0 flex flex-col overflow-hidden">
        <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="officers" className="gap-1 text-xs px-2">
              <Users className="w-3 h-3" />
              Officers
            </TabsTrigger>
            <TabsTrigger value="soldiers" className="gap-1 text-xs px-2">
              <Swords className="w-3 h-3" />
              Soldiers
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-1 text-xs px-2">
              <Settings className="w-3 h-3" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 text-xs px-2">
              <BarChart3 className="w-3 h-3" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="officers" className="flex-1 overflow-auto mt-0">
            <OfficersPanel />
          </TabsContent>
          
          <TabsContent value="soldiers" className="flex-1 overflow-auto mt-0">
            <SoldiersPanel />
          </TabsContent>
          
          <TabsContent value="manage" className="flex-1 overflow-auto mt-0">
            <ManagementPanel />
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 overflow-auto mt-0">
            <GameStatsPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {selectedBuilding && (
          <OfficerAssignmentModal
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
          />
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <BuildingPurchaseModal
            onClose={() => setShowPurchaseModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};