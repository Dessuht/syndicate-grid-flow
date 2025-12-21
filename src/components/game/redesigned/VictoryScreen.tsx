import { useGameStore } from '@/stores/core/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, RefreshCw, Trophy } from 'lucide-react';

export const VictoryScreen = () => {
  const { getVictoryCondition, objectives, resources } = useGameStore();
  const victoryCondition = getVictoryCondition();
  const completedObjectives = objectives.filter(obj => obj.isCompleted);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 bg-slate-800/50 border-slate-700">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-yellow-500/20 border border-yellow-500/50">
              <Crown className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-yellow-500">Victory!</h1>

          {/* Victory Condition */}
          <div className="space-y-2">
            <p className="text-lg font-semibold">{victoryCondition}</p>
            <p className="text-muted-foreground">You have established a powerful criminal empire</p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Final Stats</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-amber">${resources.cash.toLocaleString()}</p>
                <p className="text-muted-foreground">Cash</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-purple">{resources.influence}</p>
                <p className="text-muted-foreground">Influence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-green">{resources.territory}%</p>
                <p className="text-muted-foreground">Territory</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-cyan">{resources.manpower}</p>
                <p className="text-muted-foreground">Manpower</p>
              </div>
            </div>
          </div>

          {/* Completed Objectives */}
          <div className="space-y-2">
            <p className="font-semibold">Objectives Completed: {completedObjectives.length}/{objectives.length}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {completedObjectives.map((objective) => (
                <span key={objective.id} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 border border-green-500/30">
                  {objective.name}
                </span>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <p className="text-sm text-muted-foreground">
              Your name will be remembered in the annals of criminal history. You have achieved what few could - true power in the underworld.
            </p>
          </div>

          {/* Restart Button */}
          <Button onClick={handleRestart} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Game
          </Button>
        </div>
      </Card>
    </div>
  );
};