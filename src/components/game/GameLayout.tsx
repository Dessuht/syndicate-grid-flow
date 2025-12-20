import { useGameStore } from '@/stores/gameStore';
import { AutonomousOfficersPanel } from './AutonomousOfficersPanel';
import { ResourceBar } from './ResourceBar';
import { DayCycle } from './DayCycle';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { LegalMedicalView } from './LegalMedicalView';
import { FamilyCouncilScene } from './FamilyCouncilScene';
import { EventManager } from './EventManager';
import { DistrictHub } from './DistrictHub';
import { Sidebar } from './Sidebar';
import { RelationshipPanel } from './RelationshipPanel';
import { useState } from 'react';

export const GameLayout = () => {
  const { currentScene, currentPhase } = useGameStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('district');

  const renderCurrentView = () => {
    switch (currentScene) {
      case 'DISTRICT':
        return <DistrictMap selectedOfficerId={selectedOfficerId} onSelectOfficer={setSelectedOfficerId} />;
      case 'GLOBAL':
        return <GlobalMap />;
      case 'LEGAL':
        return <LegalMedicalView />;
      case 'COUNCIL':
        return <FamilyCouncilScene />;
      default:
        return <DistrictMap selectedOfficerId={selectedOfficerId} onSelectOfficer={setSelectedOfficerId} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar activeView={activeView as any} onViewChange={setActiveView as any} />
      
      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        <div className="w-80 space-y-4">
          <ResourceBar />
          <DayCycle />
          <AutonomousOfficersPanel
            selectedOfficerId={selectedOfficerId}
            onSelectOfficer={setSelectedOfficerId}
          />
        </div>
        
        <div className="flex-1">
          {renderCurrentView()}
        </div>

        {/* Relationship Panel */}
        <div className="w-96">
          <RelationshipPanel selectedOfficerId={selectedOfficerId} />
        </div>
      </div>
      
      {/* Event Manager */}
      <EventManager />
    </div>
  );
};