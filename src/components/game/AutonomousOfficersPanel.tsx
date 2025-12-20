import { useGameStore, AutonomousCharacter } from '@/stores/gameStore';
import { AutonomousOfficerCard } from './AutonomousOfficerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Brain, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AutonomousOfficersPanelProps {
  selectedOfficerId: string | null;
  onSelectOfficer: (id: string | null) => void;
}

export const AutonomousOfficersPanel = ({ selectedOfficerId, onSelectOfficer }: AutonomousOfficersPanelProps) => {
  const { 
    autonomousOfficers, 
    buildings, 
    currentPhase, 
    updateAutonomousBehavior,
    getPlayerInfluenceLevel
  } = useGameStore();
  
  const [showNeeds, setShowNeeds] = useState(false);
  const influenceLevel = getPlayerInfluenceLevel();

  // Update autonomous behavior periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPhase !== 'morning') {
        updateAutonomousBehavior();
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [currentPhase, updateAutonomousBehavior]);

  const getBuildingName = (buildingId: string | null) => {
    if (!buildingId) return undefined;
    return buildings.find(b => b.id === buildingId)?.name;
  };

  const handleOfficerClick = (officerId: string) => {
    if (currentPhase === 'morning') {
      onSelectOfficer(selectedOfficerId === officerId ? null : officerId);
    }
  };

  const influenceColors = {
    0: 'text-neon-red',
    1: 'text-neon-amber', 
    2: 'text-neon-cyan',
    3: 'text-neon-green'
  };

  const influenceLabels = {
    0: 'No Control',
    1: 'Low Influence',
    2: 'Medium Influence', 
    3: 'High Influence'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
            <Brain className="w-4 h-4 text-neon-magenta" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold neon-text-magenta">
              Autonomous Officers
            </h2>
            <p className={cn(
              "text-[10px]",
              influenceColors[influenceLevel]
            )}>
              {influenceLabels[influenceLevel]}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowNeeds(!showNeeds)}
          className="p-1 rounded hover:bg-secondary/50 transition-colors"
        >
          <Activity className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Influence Level Indicator */}
      <div className="mb-3 p-2 rounded bg-secondary/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Player Influence</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(level => (
              <div
                key={level}
                className={cn(
                  "w-4 h-1 rounded-full",
                  level <= influenceLevel ? influenceColors[influenceLevel] : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {autonomousOfficers.map((officer, index) => (
          <motion.div
            key={officer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AutonomousOfficerCard
              officer={officer}
              isSelected={selectedOfficerId === officer.id}
              onSelect={() => handleOfficerClick(officer.id)}
              buildingName={getBuildingName(officer.assignedBuildingId)}
              disabled={false}
            />
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1">
            <span>Autonomous System</span>
            <span className="text-neon-green">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Officers Acting Independently</span>
            <span>{autonomousOfficers.filter(o => o.currentAgenda).length}/{autonomousOfficers.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};