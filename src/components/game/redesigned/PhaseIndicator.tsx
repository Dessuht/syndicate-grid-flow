import { useGameStore } from '@/stores/core/gameStore';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Zap } from 'lucide-react';

export const PhaseIndicator = () => {
  const { currentWeek, currentDay, phase } = useGameStore();

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'planning':
        return {
          icon: Calendar,
          label: 'Planning Phase',
          description: 'Choose your operations for the week',
          color: 'bg-blue-500'
        };
      case 'execution':
        return {
          icon: Zap,
          label: 'Execution Phase',
          description: 'Operations are in progress',
          color: 'bg-orange-500'
        };
      case 'resolution':
        return {
          icon: Target,
          label: 'Resolution Phase',
          description: 'Review results and prepare for next week',
          color: 'bg-green-500'
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown Phase',
          description: '',
          color: 'bg-gray-500'
        };
    }
  };

  const phaseInfo = getPhaseInfo(phase);
  const Icon = phaseInfo.icon;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Week and Day */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Week {currentWeek}, Day {currentDay}</span>
        </div>

        {/* Phase */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${phaseInfo.color}`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">{phaseInfo.label}</p>
            <p className="text-xs text-muted-foreground">{phaseInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Week Progress</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`w-2 h-2 rounded-full ${
                day < currentDay 
                  ? 'bg-green-500' 
                  : day === currentDay 
                    ? 'bg-blue-500' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};