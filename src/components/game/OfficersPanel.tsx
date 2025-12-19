import { useGameStore, Officer } from '@/stores/gameStore';
import { OfficerCard } from './OfficerCard';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { OfficerDossierModal } from './modals/OfficerDossierModal';

interface OfficersPanelProps {
  selectedOfficerId: string | null;
  onSelectOfficer: (id: string | null) => void;
}

export const OfficersPanel = ({ selectedOfficerId, onSelectOfficer }: OfficersPanelProps) => {
  const { officers, buildings, currentPhase } = useGameStore();
  const [dossierOfficerId, setDossierOfficerId] = useState<string | null>(null);

  const getBuildingName = (buildingId: string | null) => {
    if (!buildingId) return undefined;
    return buildings.find(b => b.id === buildingId)?.name;
  };

  const handleOfficerClick = (officerId: string) => {
    // 1. Always open dossier
    setDossierOfficerId(officerId);

    // 2. Only handle assignment selection if in the morning phase
    if (currentPhase === 'morning') {
      onSelectOfficer(selectedOfficerId === officerId ? null : officerId);
    }
  };
  
  const selectedOfficer = officers.find(o => o.id === dossierOfficerId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
          <Users className="w-4 h-4 text-neon-magenta" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold neon-text-magenta">Officers</h2>
          <p className="text-[10px] text-muted-foreground">
            {currentPhase === 'morning' ? 'Click to select/view' : 'Click to view dossier'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {officers.map((officer, index) => (
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
              // We set disabled to false here so the card remains clickable for the dossier modal.
              // The assignment logic is handled inside handleOfficerClick based on currentPhase.
              disabled={false} 
            />
          </motion.div>
        ))}
      </div>
      
      {/* Officer Dossier Modal */}
      {selectedOfficer && (
        <OfficerDossierModal 
          officer={selectedOfficer} 
          onClose={() => setDossierOfficerId(null)} 
        />
      )}
    </motion.div>
  );
};