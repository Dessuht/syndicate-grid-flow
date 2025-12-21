import { useGameStore } from '@/stores/core/gameStore';
import { ResourceBar } from './ResourceBar';
import { PhaseIndicator } from './PhaseIndicator';
import { ObjectivesPanel } from './ObjectivesPanel';
import { OperationsPanel } from './OperationsPanel';
import { OfficersPanel } from './OfficersPanel';
import { DecisionModal } from './DecisionModal';
import { EventModal } from './EventModal';
import { GameOverScreen } from './GameOverScreen';
import { VictoryScreen } from './VictoryScreen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, SkipForward, AlertTriangle } from 'lucide-react';

export const GameLayout = () => {
  const { 
    currentWeek, 
    currentDay, 
    phase, 
    advanceTime,
    currentDecision,
    currentEvent,
    gameOver,
    victory
  } = useGameStore();

  const handleAdvanceTime = () => {
    // Don't advance time if there are pending decisions or events
    if (currentDecision || currentEvent) return;
    advanceTime();
  };

  if (gameOver) {
    return <GameOverScreen />;
  }

  if (victory) {
    return <VictoryScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <ResourceBar />
        </div>
      </header>

      {/* Phase Indicator */}
      <div className="px-6 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <PhaseIndicator />
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Objectives */}
        <aside className="w-80 border-r border-slate-700 bg-slate-900/30 backdrop-blur-sm p-4 overflow-auto">
          <ObjectivesPanel />
        </aside>

        {/* Center - Operations */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold gradient-text">Operations</h1>
              <Button
                onClick={handleAdvanceTime}
                disabled={!!currentDecision || !!currentEvent}
                className="gap-2"
                variant={currentDecision || currentEvent ? "destructive" : "default"}
              >
                {currentDecision || currentEvent ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Decision Required
                  </>
                ) : (
                  <>
                    {phase === 'resolution' ? <SkipForward className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {phase === 'resolution' ? 'Next Week' : 'Next Day'}
                  </>
                )}
              </Button>
            </div>
            <OperationsPanel />
          </div>
        </main>

        {/* Right Panel - Officers */}
        <aside className="w-96 border-l border-slate-700 bg-slate-900/30 backdrop-blur-sm p-4 overflow-auto">
          <OfficersPanel />
        </aside>
      </div>

      {/* Modals */}
      {currentDecision && <DecisionModal decision={currentDecision} />}
      {currentEvent && <EventModal event={currentEvent} />}
    </div>
  );
};