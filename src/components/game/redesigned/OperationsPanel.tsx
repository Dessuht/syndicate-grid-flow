import { useGameStore } from '@/stores/core/gameStore';
import { OperationSystem } from '@/stores/core/operations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Sword, 
  Users,
  DollarSign,
  Flame,
  MapPin
} from 'lucide-react';

export const OperationsPanel = () => {
  const { 
    availableOperations, 
    activeOperations, 
    completedOperations,
    launchOperation,
    canLaunchOperation,
    resources
  } = useGameStore();

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'extortion':
        return DollarSign;
      case 'smuggling':
        return TrendingUp;
      case 'gambling':
        return TrendingUp;
      case 'protection':
        return Shield;
      case 'assassination':
        return Sword;
      case 'intimidation':
        return AlertTriangle;
      case 'corruption':
        return Shield;
      case 'recruitment':
        return Users;
      case 'expansion':
        return MapPin;
      case 'elimination':
        return Sword;
      default:
        return AlertTriangle;
    }
  };

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel <= 3) return 'bg-green-500';
    if (riskLevel <= 6) return 'bg-yellow-500';
    if (riskLevel <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-500';
    if (difficulty <= 6) return 'text-yellow-500';
    if (difficulty <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  const OperationCard = ({ operation, isActive = false }: { operation: any; isActive?: boolean }) => {
    const Icon = getOperationIcon(operation.type);
    const canLaunch = !isActive && canLaunchOperation(operation.id);

    return (
      <Card className={`p-4 ${isActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-neon-cyan" />
              <div>
                <h3 className="font-semibold">{operation.name}</h3>
                <p className="text-sm text-muted-foreground">{operation.description}</p>
              </div>
            </div>
            {isActive && (
              <Badge variant="default" className="bg-blue-500">
                Active
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Risk: </span>
              <div className={`w-2 h-2 rounded-full ${getRiskColor(operation.riskLevel)}`} />
              <span className={getDifficultyColor(operation.riskLevel)}>{operation.riskLevel}/10</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Difficulty: </span>
              <span className={getDifficultyColor(operation.difficulty)}>{operation.difficulty}/10</span>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Requirements:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className={resources.influence >= operation.requirements.minInfluence ? 'text-green-500' : 'text-red-500'}>
                  {operation.requirements.minInfluence} influence
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className={resources.manpower >= operation.requirements.minManpower ? 'text-green-500' : 'text-red-500'}>
                  {operation.requirements.minManpower} manpower
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span className={resources.heat <= operation.requirements.maxHeat ? 'text-green-500' : 'text-red-500'}>
                  Max {operation.requirements.maxHeat} heat
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{operation.duration} days</span>
              </div>
            </div>
          </div>

          {/* Potential Rewards */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Potential Rewards:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-neon-amber" />
                <span>${operation.potentialRewards.cash.min}-${operation.potentialRewards.cash.max}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-neon-purple" />
                <span>{operation.potentialRewards.influence.min}-{operation.potentialRewards.influence.max} influence</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neon-green" />
                <span>{operation.potentialRewards.territory.min}-{operation.potentialRewards.territory.max}% territory</span>
              </div>
              {operation.potentialRewards.heatReduction && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-blue-500" />
                  <span>-{operation.potentialRewards.heatReduction} heat</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {!isActive && (
            <Button 
              onClick={() => launchOperation(operation.id, [])}
              disabled={!canLaunch}
              className="w-full"
              variant={canLaunch ? "default" : "outline"}
            >
              <Play className="w-4 h-4 mr-2" />
              {canLaunch ? 'Launch Operation' : 'Requirements Not Met'}
            </Button>
          )}

          {/* Progress for active operations */}
          {isActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{operation.progress || 0}%</span>
              </div>
              <Progress value={operation.progress || 0} className="h-2" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Operations */}
      {activeOperations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-neon-cyan">Active Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOperations.map((operation) => (
              <OperationCard key={operation.id} operation={operation} isActive />
            ))}
          </div>
        </div>
      )}

      {/* Available Operations */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-neon-cyan">Available Operations</h2>
        {availableOperations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOperations.map((operation) => (
              <OperationCard key={operation.id} operation={operation} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No operations available. Increase your influence and manpower to unlock more options.</p>
          </Card>
        )}
      </div>

      {/* Completed Operations */}
      {completedOperations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-neon-cyan">Completed Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOperations.slice(-4).map((operation) => (
              <OperationCard key={operation.id} operation={operation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};