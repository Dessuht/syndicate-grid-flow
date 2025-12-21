import { useGameStore } from '@/stores/core/gameStore';
import { StrategicDecision } from '@/stores/core/types';
import { DecisionSystem } from '@/stores/core/decisions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Shield, 
  Users, 
  Flame 
} from 'lucide-react';

interface DecisionModalProps {
  decision: StrategicDecision;
}

export const DecisionModal = ({ decision }: DecisionModalProps) => {
  const { makeDecision, resources } = useGameStore();

  const handleMakeChoice = (optionId: string) => {
    makeDecision(decision.id, optionId);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const canMakeChoice = (option: any) => {
    return DecisionSystem.canMakeChoice(option, resources);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <DialogTitle className="text-xl">{decision.title}</DialogTitle>
            <Badge className={getUrgencyColor(decision.urgency)}>
              {decision.urgency.toUpperCase()}
            </Badge>
          </div>
          <DialogDescription className="text-base">
            {decision.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deadline Warning */}
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertDescription>
              You have {decision.deadline} days to make this decision. 
              {decision.consequences.ignore && ` Ignoring it: ${decision.consequences.ignore}`}
            </AlertDescription>
          </Alert>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose your response:</h3>
            <div className="grid grid-cols-1 gap-4">
              {decision.options.map((option) => (
                <Card key={option.id} className="p-4">
                  <div className="space-y-3">
                    {/* Option Description */}
                    <p className="font-medium">{option.description}</p>

                    {/* Costs */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Costs:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {option.costs.cash && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span className={resources.cash >= option.costs.cash ? 'text-green-500' : 'text-red-500'}>
                              ${option.costs.cash.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {option.costs.influence && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className={resources.influence >= option.costs.influence ? 'text-green-500' : 'text-red-500'}>
                              {option.costs.influence} influence
                            </span>
                          </div>
                        )}
                        {option.costs.heat && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span className={resources.heat + option.costs.heat <= 100 ? 'text-green-500' : 'text-red-500'}>
                              +{option.costs.heat} heat
                            </span>
                          </div>
                        )}
                        {option.costs.manpower && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className={resources.manpower >= option.costs.manpower ? 'text-green-500' : 'text-red-500'}>
                              {option.costs.manpower} manpower
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Requirements:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {option.requirements.minInfluence && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className={resources.influence >= option.requirements.minInfluence ? 'text-green-500' : 'text-red-500'}>
                              Min {option.requirements.minInfluence} influence
                            </span>
                          </div>
                        )}
                        {option.requirements.maxHeat && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span className={resources.heat <= option.requirements.maxHeat ? 'text-green-500' : 'text-red-500'}>
                              Max {option.requirements.maxHeat} heat
                            </span>
                          </div>
                        )}
                        {option.requirements.minManpower && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className={resources.manpower >= option.requirements.minManpower ? 'text-green-500' : 'text-red-500'}>
                              Min {option.requirements.minManpower} manpower
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Potential Outcomes */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Potential Outcomes:</p>
                      <div className="space-y-1">
                        {option.outcomes.map((outcome, index) => (
                          <div key={index} className="text-sm p-2 rounded bg-slate-800/50">
                            <div className="flex items-center justify-between">
                              <span>{outcome.result}</span>
                              <Badge variant="outline">{outcome.probability}%</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {outcome.consequences.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleMakeChoice(option.id)}
                      disabled={!canMakeChoice(option)}
                      className="w-full"
                      variant={canMakeChoice(option) ? "default" : "outline"}
                    >
                      {canMakeChoice(option) ? 'Choose This Option' : 'Requirements Not Met'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};