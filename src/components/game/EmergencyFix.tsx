import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export const EmergencyFix = () => {
  const { 
    activeEvent, 
    eventData, 
    pendingEvents, 
    currentDay, 
    currentPhase,
    setCurrentScene,
    dismissEvent,
    advancePhase
  } = useGameStore();
  
  const [showDebug, setShowDebug] = useState(false);

  const forceClearEvents = () => {
    // Clear all stuck events
    useGameStore.setState({
      activeEvent: null,
      eventData: null,
      pendingEvents: [],
      dailyBriefingIgnored: false,
      isCivilWarActive: false,
      streetWarRivalId: null
    });
    
    // Force scene back to district
    setCurrentScene('DISTRICT');
    
    console.log('Emergency fix applied - all events cleared');
  };

  const forceAdvanceDay = () => {
    forceClearEvents();
    // Try to advance multiple times to break loops
    for (let i = 0; i < 4; i++) {
      setTimeout(() => advancePhase(), i * 100);
    }
  };

  const isDay9NightStuck = currentDay === 9 && currentPhase === 'night' && activeEvent !== null;
  const hasStuckEvent = activeEvent !== null || (pendingEvents && pendingEvents.length > 0);

  // Auto-fix for Day 9 Night issue
  React.useEffect(() => {
    if (isDay9NightStuck) {
      console.log('Auto-fixing Day 9 Night bug');
      setTimeout(() => {
        forceClearEvents();
        setTimeout(() => advancePhase(), 100);
      }, 1000);
    }
  }, [isDay9NightStuck]);

  // Auto-fix for Day 9 Night issue
  React.useEffect(() => {
    if (isDay9NightStuck) {
      console.log('Auto-fixing Day 9 Night bug');
      setTimeout(() => {
        forceClearEvents();
        setTimeout(() => advancePhase(), 100);
      }, 1000);
    }
  }, [isDay9NightStuck]);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {(hasStuckEvent || isDay9NightStuck) && (
        <div className="mb-2 p-3 bg-red-900/90 border border-red-500 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold">
              {isDay9NightStuck ? 'Day 9 Night Bug Detected!' : `Game Stuck on Day ${currentDay}`}
            </span>
          </div>
          <div className="text-xs mb-2">
            Active Event: {activeEvent || 'None'}
            {pendingEvents && pendingEvents.length > 0 && (
              <span> | Pending: {pendingEvents.length}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={forceClearEvents}
              className="text-xs"
            >
              Clear Events
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={forceAdvanceDay}
              className="text-xs bg-white/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Skip Day
            </Button>
          </div>
        </div>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowDebug(!showDebug)}
        className="text-xs bg-slate-900/80 border-slate-600"
      >
        {showDebug ? 'Hide' : 'Show'} Debug
      </Button>
      
      {showDebug && (
        <div className="mt-2 p-3 bg-slate-900/90 border border-slate-600 rounded-lg text-white text-xs">
          <div>Day: {currentDay}</div>
          <div>Phase: {currentPhase}</div>
          <div>Active Event: {activeEvent || 'None'}</div>
          <div>Pending Events: {pendingEvents?.length || 0}</div>
          <div>Scene: {useGameStore.getState().currentScene}</div>
        </div>
      )}
    </div>
  );
};