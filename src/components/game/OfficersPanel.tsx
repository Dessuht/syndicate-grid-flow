import { useGameStore } from '@/stores/gameStore';
import { OfficerCard } from './OfficerCard';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface OfficersPanelProps {
  selectedOfficerId: string | null;
  onSelectOfficer: (id: string | null) => void;
}

export const OfficersPanel = ({ selectedOfficerId, onSelectOfficer }: OfficersPanelProps) => {
  const { officers, buildings } = useGameStore();

  const getBuildingName = (buildingId: string | null) => {
    if (!buildingId) return undefined;
    return buildings.find(b => b.id === buildingId)?.name;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
          <Users className="w-4 h-4 text-neon-magenta" />
        </div>
        <h2 className="font-display text-lg font-semibold neon-text-magenta">Officers</h2>
      </div>

      <div className="space-y-2">
        {officers.map((officer, index) => (
          <motion.div
            key={officer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <OfficerCard
              officer={officer}
              isSelected={selectedOfficerId === officer.id}
              onSelect={() => onSelectOfficer(selectedOfficerId === officer.id ? null : officer.id)}
              buildingName={getBuildingName(officer.assignedBuildingId)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
