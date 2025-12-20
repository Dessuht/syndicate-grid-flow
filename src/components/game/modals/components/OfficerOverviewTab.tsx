import { Officer } from '@/stores/gameStoreTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfficerStatsSection } from './OfficerStatsSection';
import { OfficerTraitsSection } from './OfficerTraitsSection';
import { OfficerLeadershipSection } from './OfficerLeadershipSection';
import { OfficerPromotionSection } from './OfficerPromotionSection';
import { OfficerStatusWarnings } from './OfficerStatusWarnings';

interface OfficerOverviewTabProps {
  officer: Officer;
  onClose: () => void;
}

export const OfficerOverviewTab = ({ officer, onClose }: OfficerOverviewTabProps) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      <OfficerStatsSection officer={officer} />
      <OfficerTraitsSection officer={officer} />
      <OfficerLeadershipSection officer={officer} onClose={onClose} />
      <OfficerPromotionSection officer={officer} onClose={onClose} />
      <OfficerStatusWarnings officer={officer} />
    </ScrollArea>
  );
};