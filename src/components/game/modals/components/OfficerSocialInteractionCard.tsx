import { Officer } from '@/stores/gameStoreTypes';
import { OfficerRelationship } from '@/types/relationships';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';

interface OfficerSocialInteractionCardProps {
  officer: Officer;
  targetOfficer: Officer;
  relationship: OfficerRelationship;
  getTypeLabel: (relationship: OfficerRelationship) => string;
  onClose: () => void;
}

export const OfficerSocialInteractionCard = ({ 
  officer, 
  targetOfficer, 
  relationship, 
  getTypeLabel, 
  onClose 
}: OfficerSocialInteractionCardProps) => {
  const { currentPhase, createManualInteraction } = useGameStore();
  
  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;

  const handleSocialInteraction = (interactionType: string) => {
    createManualInteraction(officer.id, targetOfficer.id, interactionType);
    onClose();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{targetOfficer.name}</span>
        <Badge variant="outline" className="text-xs">
          {getTypeLabel(relationship)}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSocialInteraction('DEEP_CONVERSATION')}
          disabled={!canInteract}
          className="text-xs"
        >
          Deep Talk
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSocialInteraction('FLIRTATION')}
          disabled={!canInteract}
          className="text-xs"
        >
          Flirt
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSocialInteraction('JOKE_TELLING')}
          disabled={!canInteract}
          className="text-xs"
        >
          Share Joke
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSocialInteraction('FLATTERY_GIFT')}
          disabled={!canInteract}
          className="text-xs"
        >
          Give Gift
        </Button>
      </div>
    </div>
  );
};