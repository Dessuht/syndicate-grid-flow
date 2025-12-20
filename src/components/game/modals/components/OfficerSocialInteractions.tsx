import { Officer } from '@/stores/gameStoreTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfficerSocialInteractionCard } from './OfficerSocialInteractionCard';
import { useOfficerRelationships } from '../hooks/useOfficerRelationships';

interface OfficerSocialInteractionsProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerSocialInteractions = ({ officer, onClose }: OfficerSocialInteractionsProps) => {
  const { relationships, getRelationshipTypeLabel } = useOfficerRelationships(officer.id);

  return (
    <div className="mt-6 pt-4 border-t border-border">
      <h4 className="font-semibold text-sm mb-3">Interact with Other Officers</h4>
      <div className="space-y-2">
        {relationships.slice(0, 3).map(({ officer: otherOfficer, relationship }) => (
          <OfficerSocialInteractionCard
            key={otherOfficer.id}
            officer={officer}
            targetOfficer={otherOfficer}
            relationship={relationship}
            getTypeLabel={getRelationshipTypeLabel}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};