import { useGameStore } from '@/stores/core/gameStore';
import { GameEvent } from '@/stores/core/types';
import { EventSystem } from '@/stores/core/events';
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

interface EventModalProps {
  event: GameEvent;
}

export const EventModal = ({ event }: EventModalProps) => {
  const { makeEventChoice, resources } = useGameStore();

  const handleMakeChoice = (choiceId: string) => {
    makeEventChoice(event.id, choiceId);
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'police_raid':
        return 'bg-red-500';
      case 'betrayal':
        return 'bg-purple-500';
      case 'crisis':
        return 'bg-orange-500';
      case 'opportunity':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const canMakeChoice = (choice: any) => {
    return EventSystem.canMakeChoice(choice, resources);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
            <div className="flex gap-2">
              <Badge className={getUrgencyColor(event.urgency)}>
                {event.urgency.toUpperCase()}
              </Badge>
              <Badge className={getEventTypeColor(event.type)}>
                {event.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-resolve Warning */}
          {event.autoResolve && (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                This event will auto-resolve in {event.autoResolve} days if no choice is made.
              </AlertDescription>
            </Alert>
          )}

          {/* Choices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose your response:</h3>
            <div className="grid grid-cols-1 gap-4">
              {event.choices.map((choice) => (
                <Card key={choice.id} className="p-4">
                  <div className="space-y-3">
                    {/* Choice Description */}
                    <p className="font-medium">{choice.description}</p>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Requirements:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {choice.requirements.cash && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span className={resources.cash >= choice.requirements.cash ? 'text-green-500' : 'text-red-500'}>
                              ${choice.requirements.cash.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {choice.requirements.influence && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className={resources.influence >= choice.requirements.influence ? 'text-green-500' : 'text-red-500'}>
                              {choice.requirements.influence} influence
                            </span>
                          </div>
                        )}
                        {choice.requirements.heat && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span className={resources.heat <= choice.requirements.heat ? 'text-green-500' : 'text-red-500'}>
                              Max {choice.requirements.heat} heat
                            </span>
                          </div>
                        )}
                        {choice.requirements.manpower && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className={resources.manpower >= choice.requirements.manpower ? 'text-green-500' : 'text-red-500'}>
                              {choice.requirements.manpower} manpower
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Potential Outcomes */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Potential Outcomes:</p>
                      <div className="space-y-1">
                        {choice.outcomes.map((outcome, index) => (
                          <div key={index} className="text-sm p-2 rounded bg-slate-800/50">
                            <div className="flex items-center justify-between">
                              <span>{outcome.result}</span>
                              <Badge variant="outline">{outcome.probability}%</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {outcome.effects.cash && `Cash: ${outcome.effects.cash > 0 ? '+' : ''}$${outcome.effects.cash.toLocaleString()}`}
                              {outcome.effects.influence && ` • Influence: ${outcome.effects.influence > 0 ? '+' : ''}${outcome.effects.influence}`}
                              {outcome.effects.heat && ` • Heat: ${outcome.effects.heat > 0 ? '+' : ''}${outcome.effects.heat}`}
                              {outcome.effects.manpower && ` • Manpower: ${outcome.effects.manpower > 0 ? '+' : ''}${outcome.effects.manpower}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleMakeChoice(choice.id)}
                      disabled={!canMakeChoice(choice)}
                      className="w-full"
                      variant={canMakeChoice(choice) ? "default" : "outline"}
                    >
                      {canMakeChoice(choice) ? 'Choose This Option' : 'Requirements Not Met'}
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