import { Officer, CompatibilityLike, CompatibilityDislike } from '@/stores/gameStoreTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfficerRelationshipCard } from './OfficerRelationshipCard';
import type { OfficerRelationship } from '@/types/relationships';

interface OfficerRelationshipsTabProps {
  officer: Officer;
}

export const OfficerRelationshipsTab = ({ officer }: OfficerRelationshipsTabProps) => {

  // Helper functions for relationship display
  const getRelationshipTypeColor = (relationship: OfficerRelationship) => {
    switch (relationship.type) {
      case 'loyal': return 'text-green-500';
      case 'friendly': return 'text-blue-500';
      case 'neutral': return 'text-gray-500';
      case 'rival': return 'text-orange-500';
      case 'hostile': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRelationshipTypeLabel = (relationship: OfficerRelationship) => {
    switch (relationship.type) {
      case 'loyal': return 'Loyal';
      case 'friendly': return 'Friendly';
      case 'neutral': return 'Neutral';
      case 'rival': return 'Rival';
      case 'hostile': return 'Hostile';
      default: return 'Unknown';
    }
  };

  // Simple relationships data - using officer's existing relationships array
  const relationships = (officer.relationships || []).map((rel: any, index: number) => {
    // Build a minimal compatible Officer object for display (include relationships)
    const otherOfficer = {
      id: `officer-${index}`,
      name: `Officer ${index + 1}`,
      rank: 'Red Pole' as const,
      energy: 100,
      maxEnergy: 100,
      assignedBuildingId: null,
      // include legacy flat flags for compatibility
      isWounded: false,
      isArrested: false,
      daysToRecovery: 0,
      skills: { enforcement: 50, diplomacy: 50, logistics: 50, recruitment: 50 },
      loyalty: 75,
      daysAssigned: 0,
      daysIdle: 0,
      isBetraying: false,
      traits: ['Fearless', 'Ruthless'],
      currentAgenda: null,
      face: 30,
      grudge: false,
      isTraitor: false,
      isSuccessor: false,
      isTestingWaters: false,
      likes: ['Respects Red Poles', 'Values Loyalty'] as CompatibilityLike[],
      dislikes: ['Hates Ambitious', 'Distrusts Calculating'] as CompatibilityDislike[],
      // ensure relationships property exists as required by Officer type
      relationships: [rel],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return { officer: otherOfficer, relationship: rel as OfficerRelationship };
  });

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