"use client";

import { useGameStore } from '@/stores/gameStore';
import { ResourceBar } from './ResourceBar';
import { DayCycle } from './DayCycle';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { LegalMedicalView } from './LegalMedicalView';
import { FamilyCouncilScene } from './FamilyCouncilScene';
import { EventManager } from './EventManager';
import { Sidebar } from './Sidebar';
import { EmergencyFix } from './EmergencyFix';
import { ToastProvider } from './ToastProvider';
import { GameNotifications } from './GameNotifications';
import { TutorialOverlay } from './TutorialOverlay';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export const GameLayout = () => {
  const { currentScene, setCurrentScene } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if tutorial should be shown
  useEffect(() => {
    const tutorialComplete = localStorage.getItem('kowloon-tutorial-complete');
    if (!tutorialComplete) {
      setShowTutorial(true);
    }
  }, []);

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

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleShowTutorial = () => {
    localStorage.removeItem('kowloon-tutorial-complete');
    setShowTutorial(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Game Notifications */}
      <GameNotifications />

      {/* Top Header with Resources */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <ResourceBar />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowTutorial}
            className="text-muted-foreground hover:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-slate-700 bg-slate-900/30 backdrop-blur-sm">
          <Sidebar
            activeView={currentScene.toLowerCase() as any}
            onViewChange={handleViewChange}
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
      </div>
      
      {/* Event Manager Overlay */}
      <EventManager />
      
      {/* Emergency Fix for Stuck Games */}
      <EmergencyFix />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}
    </div>
  );
};