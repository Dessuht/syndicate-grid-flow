import { Officer } from '@/stores/gameStoreTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfficerRelationshipCard } from './OfficerRelationshipCard';

interface OfficerRelationshipsTabProps {
  officer: Officer;
}

export const OfficerRelationshipsTab = ({ officer }: OfficerRelationshipsTabProps) => {
  // Helper functions for relationship display
  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'loyal': return 'text-green-500';
      case 'friendly': return 'text-blue-500';
      case 'neutral': return 'text-gray-500';
      case 'rival': return 'text-orange-500';
      case 'hostile': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRelationshipTypeLabel = (type: string) => {
    switch (type) {
      case 'loyal': return 'Loyal';
      case 'friendly': return 'Friendly';
      case 'neutral': return 'Neutral';
      case 'rival': return 'Rival';
      case 'hostile': return 'Hostile';
      default: return 'Unknown';
    }
  };

  // Simple relationships data - using officer's existing relationships array
  const relationships = officer.relationships.map((rel, index) => ({
    officer: {
      id: `officer-${index}`,
      name: `Officer ${index + 1}`,
      rank: 'Red Pole' as const
    },
    relationship: rel
  }));

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-3">
        {relationships.length === 0 ? (
          <p className="text-gray-500 text-sm">No relationships established yet</p>
        ) : (
          relationships.map(({ officer: otherOfficer, relationship }) => (
            <OfficerRelationshipCard
              key={otherOfficer.id}
              officer={otherOfficer}
              relationship={relationship}
              getTypeColor={getRelationshipTypeColor}
              getTypeLabel={getRelationshipTypeLabel}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};