import { useGameStore } from '@/stores/core/gameStore';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Crown, 
  Flame, 
  Map, 
  Users 
} from 'lucide-react';

export const ResourceBar = () => {
  const { resources } = useGameStore();

  const getHeatColor = (heat: number) => {
    if (heat < 30) return 'bg-green-500';
    if (heat < 60) return 'bg-yellow-500';
    if (heat < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTerritoryColor = (territory: number) => {
    if (territory < 25) return 'bg-red-500';
    if (territory < 50) return 'bg-orange-500';
    if (territory < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-6">
      {/* Cash */}
      <Card className="bg-slate-800/50 border-slate-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-neon-amber" />
          <div>
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="font-bold text-neon-amber">${resources.cash.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Influence */}
      <Card className="bg-slate-800/50 border-slate-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-neon-purple" />
          <div>
            <p className="text-xs text-muted-foreground">Influence</p>
            <p className="font-bold text-neon-purple">{resources.influence}</p>
          </div>
        </div>
      </Card>

      {/* Heat */}
      <Card className="bg-slate-800/50 border-slate-700 px-4 py-2 flex-1 max-w-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-neon-red" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Heat</p>
            <div className="flex items-center gap-2">
              <Progress 
                value={resources.heat} 
                className="flex-1 h-2"
                indicatorClassName={getHeatColor(resources.heat)}
              />
              <span className="text-sm font-bold text-neon-red min-w-[3ch] text-right">
                {resources.heat}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Territory */}
      <Card className="bg-slate-800/50 border-slate-700 px-4 py-2 flex-1 max-w-xs">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-neon-green" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Territory</p>
            <div className="flex items-center gap-2">
              <Progress 
                value={resources.territory} 
                className="flex-1 h-2"
                indicatorClassName={getTerritoryColor(resources.territory)}
              />
              <span className="text-sm font-bold text-neon-green min-w-[3ch] text-right">
                {resources.territory}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Manpower */}
      <Card className="bg-slate-800/50 border-slate-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neon-cyan" />
          <div>
            <p className="text-xs text-muted-foreground">Manpower</p>
            <p className="font-bold text-neon-cyan">{resources.manpower}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};