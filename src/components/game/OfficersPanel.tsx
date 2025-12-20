import { useGameStore } from '@/stores/gameStore';
import type { Officer } from '@/stores/gameStoreTypes';
import { OfficerCard } from './OfficerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Shield, Sword, BookOpen, Footprints, Lamp } from 'lucide-react';
import { useState } from 'react';
import { OfficerDossierModal } from './modals/OfficerDossierModal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface OfficersPanelProps {
  selectedOfficerId: string | null;
  onSelectOfficer: (id: string | null) => void;
}

const RANK_ICONS = {
  'Red Pole': Sword,
  'White Paper Fan': BookOpen,
  'Straw Sandal': Footprints,
  'Blue Lantern': Lamp,
  'Deputy (438)': Crown,
  'Dragonhead (489)': Shield,
};

const RANK_COLORS = {
  'Red Pole': 'text-neon-red border-neon-red/30 bg-neon-red/5',
  'White Paper Fan': 'text-foreground border-foreground/30 bg-foreground/5',
  'Straw Sandal': 'text-neon-amber border-neon-amber/30 bg-neon-amber/5',
  'Blue Lantern': 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5',
  'Deputy (438)': 'text-jianghu-gold border-jianghu-gold/30 bg-jianghu-gold/5',
  'Dragonhead (489)': 'text-jianghu-crimson border-jianghu-crimson/30 bg-jianghu-crimson/5',
};

export const OfficersPanel = ({ selectedOfficerId, onSelectOfficer }: OfficersPanelProps) => {
  const { officers, buildings, currentPhase } = useGameStore();
  const [dossierOfficerId, setDossierOfficerId] = useState<string | null>(null);

  const getBuildingName = (buildingId: string | null) => {
    if (!buildingId) return undefined;
    return buildings.find(b => b.id === buildingId)?.name;
  };

  const handleOfficerClick = (officerId: string) => {
    setDossierOfficerId(officerId);
    if (currentPhase === 'morning') {
      onSelectOfficer(selectedOfficerId === officerId ? null : officerId);
    }
  };

  // Group officers by rank
  const officersByRank = officers.reduce((acc, officer) => {
    if (!acc[officer.rank]) {
      acc[officer.rank] = [];
    }
    acc[officer.rank].push(officer);
    return acc;
  }, {} as Record<string, Officer[]>);

  const selectedOfficer = officers.find(o => o.id === dossierOfficerId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
              <Users className="w-5 h-5 text-neon-magenta" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold neon-text-magenta">Officers</h2>
              <p className="text-xs text-muted-foreground">
                {officers.length} total • {currentPhase === 'morning' ? 'Click to select' : 'Click to view'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {officers.filter(o => o.assignedBuildingId).length} assigned
          </Badge>
        </div>
      </Card>

      {/* Officers List */}
      <div className="flex-1 overflow-auto space-y-4">
        {Object.entries(officersByRank).map(([rank, rankOfficers]) => {
          const RankIcon = RANK_ICONS[rank as keyof typeof RANK_ICONS];
          const rankColor = RANK_COLORS[rank as keyof typeof RANK_COLORS];
          
          return (
            <Card key={rank} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm p-3">
              {/* Rank Header */}
              <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg border ${rankColor}`}>
                <RankIcon className="w-4 h-4" />
                <h3 className="font-semibold text-sm">{rank}</h3>
                <Badge variant="secondary" className="text-xs">
                  {rankOfficers.length}
                </Badge>
              </div>

              {/* Officers in this rank */}
              <div className="space-y-2">
                {rankOfficers.map((officer, index) => (
                  <motion.div
                    key={officer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OfficerCard
                      officer={officer}
                      isSelected={selectedOfficerId === officer.id}
                      onSelect={() => handleOfficerClick(officer.id)}
                      buildingName={getBuildingName(officer.assignedBuildingId)}
                      disabled={false}
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Officer Dossier Modal */}
      <AnimatePresence>
        {selectedOfficer && (
          <OfficerDossierModal 
            officer={selectedOfficer} 
            onClose={() => setDossierOfficerId(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};