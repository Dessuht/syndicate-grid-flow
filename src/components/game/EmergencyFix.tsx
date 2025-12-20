import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';

export const EmergencyFix = () => {
  const { 
    activeEvent, 
    eventData, 
    pendingEvents, 
    currentDay, 
    currentPhase,
    isCivilWarActive,
    streetWarRivalId,
    advancePhase
  } = useGameStore();

  const forceUnstick = () => {
    console.log('Emergency fix triggered - clearing all stuck events');
    
    // Force clear all blocking states
    useGameStore.setState({
      activeEvent: null,
      eventData: null,
      pendingEvents: [],
      isCivilWarActive: false,
      streetWarRivalId: null,
      currentPhase: 'morning',
      currentDay: currentDay + 1
    });
    
    // Try to advance phase after clearing
    setTimeout(() => {
      advancePhase();
    }, 100);
  };

  const debugInfo = () => {
    console.log('=== GAME STATE DEBUG ===');
    console.log('Day:', currentDay);
    console.log('Phase:', currentPhase);
    console.log('Active Event:', activeEvent);
    console.log('Event Data:', eventData);
    console.log('Pending Events:', pendingEvents.length);
    console.log('Civil War Active:', isCivilWarActive);
    console.log('Street War Rival:', streetWarRivalId);
  };

  // Only show if stuck conditions are met
  if (currentDay !== 9 || currentPhase !== 'night' || activeEvent === null) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-900 border-2 border-red-500 p-4 rounded-lg">
      <h3 className="text-white font-bold mb-2">Game Stuck Detected!</h3>
      <p className="text-red-200 text-sm mb-3">
        Day {currentDay} - Phase {currentPhase}<br/>
        Active Event: {activeEvent || 'None'}<br/>
        Pending Events: {pendingEvents.length}
      </p>
      <div className="space-y-2">
        <Button 
          onClick={forceUnstick}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Force Unstick Game
        </Button>
        <Button 
          onClick={debugInfo}
          variant="outline"
          className="w-full"
        >
          Debug Console
        </Button>
      </div>
    </div>
  );
};