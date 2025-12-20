import { useGameStore } from '@/stores/gameStore';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Swords, 
  Timer,
  Activity,
  Globe
} from 'lucide-react';

export const TerritoryManagement = () => {
  const { 
    territoryFriction, 
    territoryInfluence, 
    rivals, 
    startFrictionTimer, 
    stopFrictionTimer, 
    resetFriction,
    spendIntelToReduceFriction,
    intel,
    currentDay
  } = useGameStore();

  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    // Check if timer should be active based on game state
    setIsTimerActive(territoryFriction > 0);
  }, [territoryFriction]);

  const handleStartTimer = () => {
    startFrictionTimer();
    setIsTimerActive(true);
  };

  const handleStopTimer = () => {
    stopFrictionTimer();
    setIsTimerActive(false);
  };

  const handleResetFriction = () => {
    resetFriction();
    setIsTimerActive(false);
  };

  const getFrictionColor = (level: number) => {
    if (level < 30) return 'text-neon-green';
    if (level < 60) return 'text-neon-amber';
    if (level < 80) return 'text-neon-orange';
    return 'text-neon-red';
  };

  const getFrictionStatus = (level: number) => {
    if (level < 30) return { text: 'Stable', variant: 'default' as const };
    if (level < 60) return { text: 'Tense', variant: 'secondary' as const };
    if (level < 80) return { text: 'Volatile', variant: 'destructive' as const };
    return { text: 'Critical', variant: 'destructive' as const };
  };

  const frictionStatus = getFrictionStatus(territoryFriction);

  return (
    <div className="space-y-4">
      {/* Territory Overview */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Globe className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Territory Control</h3>
            <p className="text-xs text-muted-foreground">Day {currentDay}</p>
          </div>
        </div>

        {/* Influence Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Influence</span>
            <span className="text-sm text-neon-cyan">{territoryInfluence}%</span>
          </div>
          <Progress 
            value={territoryInfluence} 
            className="h-2 bg-slate-700"
            style={{
              background: `linear-gradient(to right, hsl(var(--neon-cyan)) ${territoryInfluence}%, hsl(var(--slate-700)) ${territoryInfluence}%)`
            }}
          />
        </div>

        {/* Friction Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium text-white">Territory Friction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getFrictionColor(territoryFriction)}`}>
                {territoryFriction}%
              </span>
              <Badge variant={frictionStatus.variant} className="text-xs">
                {frictionStatus.text}
              </Badge>
            </div>
          </div>
          <Progress 
            value={territoryFriction} 
            className="h-2 bg-slate-700"
            style={{
              background: `linear-gradient(to right, hsl(var(--neon-red)) ${territoryFriction}%, hsl(var(--slate-700)) ${territoryFriction}%)`
            }}
          />
        </div>

        {/* Friction Warning */}
        {territoryFriction > 70 && (
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neon-red animate-pulse" />
              <p className="text-sm text-neon-red font-semibold">
                High friction detected! Risk of territory conflicts.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Rival Relationships */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <h4 className="font-display text-md font-bold text-white mb-3 flex items-center gap-2">
          <Swords className="w-4 h-4 text-neon-red" />
          Rival Relations
        </h4>
        <div className="space-y-2">
          {rivals.map(rival => (
            <div key={rival.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm font-medium text-white">{rival.name}</span>
                <span className="text-xs text-muted-foreground">{rival.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  rival.relationship > 0 ? 'text-neon-green' : 
                  rival.relationship < -30 ? 'text-neon-red' : 'text-neon-amber'
                }`}>
                  {rival.relationship > 0 ? '+' : ''}{rival.relationship}
                </span>
                {rival.isActiveConflict && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    WAR
                  </Badge>
                )}
                {rival.hasTradeAgreement && (
                  <Badge variant="secondary" className="text-xs">
                    TRADE
                  </Badge>
                )}
                {rival.hasAlliance && (
                  <Badge variant="default" className="text-xs">
                    ALLY
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Territory Controls */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <h4 className="font-display text-md font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-cyan" />
          Territory Controls
        </h4>
        
        <div className="space-y-3">
          {/* Timer Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-white">Friction Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isTimerActive ? handleStopTimer : handleStartTimer}
                className="text-xs"
              >
                {isTimerActive ? 'Stop' : 'Start'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetFriction}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Intel Actions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Use Intel to improve relations:</p>
            {rivals.map(rival => (
              <div key={rival.id} className="flex items-center justify-between">
                <span className="text-xs text-white">{rival.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => spendIntelToReduceFriction(rival.id, 10)}
                    disabled={intel < 10}
                    className="text-xs h-6 px-2"
                  >
                    -10 Friction (10 Intel)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => spendIntelToScout(rival.id)}
                    disabled={intel < 50 || rival.isScouted}
                    className="text-xs h-6 px-2"
                  >
                    {rival.isScouted ? 'Scouted' : 'Scout (50 Intel)'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};