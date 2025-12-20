import { useGameStore } from '@/stores/gameStore';
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
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Top Header with Resources */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <ResourceBar />
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-slate-700 bg-slate-900/30 backdrop-blur-sm">
          <Sidebar activeView={activeView as any} onViewChange={setActiveView as any} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Day Cycle Indicator */}
          <div className="px-6 py-3 border-b border-slate-700/50 bg-slate-800/30">
            <DayCycle />
          </div>

          {/* Game View */}
          <div className="flex-1 p-6 overflow-auto">
            <Card className="h-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="p-6 h-full">
                {renderCurrentView()}
              </div>
            </Card>
          </div>
        </main>

        {/* Right Panel */}
        <aside className="w-96 border-l border-slate-700 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Relationship Panel */}
            <div className="flex-1 overflow-auto p-4">
              <RelationshipPanel selectedOfficerId={selectedOfficerId} />
            </div>
          </div>
        </aside>
      </div>
      
      {/* Event Manager Overlay */}
      <EventManager />
    </div>
  );
};