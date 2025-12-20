import { Officer } from '@/stores/gameStoreTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, HeartHandshake } from 'lucide-react';
import { OfficerOverviewTab } from './OfficerOverviewTab';
import { OfficerRelationshipsTab } from './OfficerRelationshipsTab';
import { OfficerInteractionsTab } from './OfficerInteractionsTab';

interface OfficerDossierTabsProps {
  officer: Officer;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
}

export const OfficerDossierTabs = ({ officer, activeTab, onTabChange, onClose }: OfficerDossierTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="relationships" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Relationships
        </TabsTrigger>
        <TabsTrigger value="interactions" className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4" />
          Social
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex-1 flex flex-col">
        <OfficerOverviewTab officer={officer} onClose={onClose} />
      </TabsContent>

      <TabsContent value="relationships" className="flex-1 flex flex-col">
        <OfficerRelationshipsTab officer={officer} />
      </TabsContent>

      <TabsContent value="interactions" className="flex-1 flex flex-col">
        <OfficerInteractionsTab officer={officer} onClose={onClose} />
      </TabsContent>
    </Tabs>
  );
};