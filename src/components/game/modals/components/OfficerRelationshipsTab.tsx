import { Officer } from '@/stores/gameStoreTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfficerRelationshipCard } from './OfficerRelationshipCard';

interface OfficerRelationshipsTabProps {
  officer: Officer;
}

export const OfficerRelationshipsTab = ({ officer }: OfficerRelationshipsTabProps) => {
  // Simple relationships data - using officer's existing relationships array
  const relationships = officer.relationships.map((rel, index) => ({
    officer: { name: `Officer ${index + 1}`, rank: 'Red Pole' as const },
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