import { useGameStore } from '@/stores/gameStore';
import { ResourceBar } from './ResourceBar';
import { DayCycle } from './DayCycle';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { LegalMedicalView } from './LegalMedicalView';
import { FamilyCouncilScene } from './FamilyCouncilScene';
import { EventManager } from './EventManager';
import { Sidebar } from './Sidebar';
import { OfficersPanel } from './OfficersPanel';
import { EmergencyFix } from './EmergencyFix';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const GameLayout = () => {
  const { currentScene, setCurrentScene } = useGameStore();
  const [showOfficersPanel, setShowOfficersPanel] = useState(false);

  const renderCurrentView = () => {
    switch (currentScene) {
      case 'DISTRICT':
        return <DistrictMap />;
      case 'GLOBAL':
        return <GlobalMap />;
      case 'LEGAL':
        return <LegalMedicalView />;
      case 'COUNCIL':
        return <FamilyCouncilScene />;
      default:
        return <DistrictMap />;
    }
  };

  const handleViewChange = (view: string) => {
    const sceneMap: Record<string, any> = {
      'district': 'DISTRICT',
      'global': 'GLOBAL',
      'legal': 'LEGAL'
    };
    
    if (sceneMap[view]) {
      setCurrentScene(sceneMap[view]);
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
          <Sidebar
            activeView={currentScene.toLowerCase() as any}
            onViewChange={handleViewChange}
            onOfficersPanelOpen={() => setShowOfficersPanel(true)}
          />
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

        {/* Right Panel - Officers Panel */}
        <aside className={`
          border-l border-slate-700 bg-slate-900/30 backdrop-blur-sm transition-all duration-300
          ${showOfficersPanel ? 'w-96' : 'w-0 overflow-hidden'}
        `}>
          {showOfficersPanel && (
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Officers</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfficersPanel(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Officers Panel Content */}
              <div className="flex-1 overflow-auto p-4">
                <OfficersPanel />
              </div>
            </div>
          )}
        </aside>
      </div>
      
      {/* Event Manager Overlay */}
      <EventManager />
      
      {/* Emergency Fix for Stuck Games */}
      <EmergencyFix />
    </div>
  );
};