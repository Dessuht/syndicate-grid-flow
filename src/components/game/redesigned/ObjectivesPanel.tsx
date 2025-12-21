import { useGameStore } from '@/stores/core/gameStore';
import { ObjectiveSystem } from '@/stores/core/objectives';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ObjectivesPanel = () => {
  const { objectives, currentWeek } = useGameStore();
  const { completed, total, upcomingDeadlines } = useGameStore().getObjectiveProgress();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'urgent':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'overdue':
        return 'border-red-500 bg-red-500/10';
      case 'urgent':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-purple" />
            <h2 className="font-bold text-lg">Objectives</h2>
          </div>
          <Badge variant="outline">
            {completed}/{total} Complete
          </Badge>
        </div>
      </Card>

      {/* Objectives List */}
      <div className="space-y-3">
        {objectives.map((objective) => {
          const status = ObjectiveSystem.getObjectiveStatus(objective, currentWeek);
          const progress = ObjectiveSystem.getProgressPercentage(objective);
          const timeRemaining = ObjectiveSystem.getTimeRemaining(objective, currentWeek);

          return (
            <Card 
              key={objective.id} 
              className={`p-3 ${getStatusColor(status)}`}
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{objective.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {objective.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Time and Rewards */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={timeRemaining <= 2 ? 'text-orange-500' : 'text-muted-foreground'}>
                      {timeRemaining > 0 ? `${timeRemaining} weeks` : 'Overdue'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Reward:</p>
                    <p className="font-medium text-neon-amber">
                      {objective.rewards.cash && `$${objective.rewards.cash.toLocaleString()}`}
                      {objective.rewards.influence && ` +${objective.rewards.influence} influence`}
                      {objective.rewards.territory && ` +${objective.rewards.territory}% territory`}
                      {objective.rewards.specialUnlock && ` +${objective.rewards.specialUnlock}`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="bg-orange-500/10 border-orange-500/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-sm text-orange-500">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-1">
            {upcomingDeadlines.map((objective) => (
              <div key={objective.id} className="text-xs">
                <span className="text-muted-foreground">{objective.name}:</span>
                <span className="text-orange-500 ml-1">
                  {ObjectiveSystem.getTimeRemaining(objective, currentWeek)} weeks
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};