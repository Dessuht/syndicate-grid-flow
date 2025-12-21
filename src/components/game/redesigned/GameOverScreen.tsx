import { useGameStore } from '@/stores/core/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull, RefreshCw } from 'lucide-react';

export const GameOverScreen = () => {
  const { getGameOverReason } = useGameStore();
  const reason = getGameOverReason();

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 bg-slate-800/50 border-slate-700">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50">
              <Skull className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-red-500">Game Over</h1>

          {/* Reason */}
          <div className="space-y-2">
            <p className="text-lg font-semibold">Your organization has fallen</p>
            <p className="text-muted-foreground">{reason}</p>
          </div>

          {/* Message */}
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <p className="text-sm text-muted-foreground">
              The criminal underworld is unforgiving. Every decision matters, and one mistake can cost everything.
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