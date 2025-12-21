import { Officer } from '@/stores/gameStoreTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfficerBasicInteractions } from './OfficerBasicInteractions';

interface OfficerInteractionsTabProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerInteractionsTab = ({ officer, onClose }: OfficerInteractionsTabProps) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      <h3 className="font-display text-lg font-bold mb-3">Social Interactions</h3>
      <OfficerBasicInteractions officer={officer} onClose={onClose} />
      <OfficerSocialInteractions officer={officer} onClose={onClose} />
    </ScrollArea>
  );
};