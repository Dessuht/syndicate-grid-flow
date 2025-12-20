import { useGameStore } from '@/stores/gameStore';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Flame,
  Zap,
  Crown,
  Building
} from 'lucide-react';

export const HomeDistrictRacket = () => {
  const { 
    homeDistrictLeaderId,
    homeDistrictHeat,
    homeDistrictRevenue,
    officerCutIncreased,
    syndicateMembers,
    assignSyndicateMember,
    unassignSyndicateMember,
    processRacketCycle,
    cash,
    currentPhase,
    currentDay
  } = useGameStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedDay, setLastProcessedDay] = useState<number | null>(null);

  const assignedLeader = syndicateMembers.find(m => m.id === homeDistrictLeaderId);
  const canProcessRacket = currentPhase === 'day' && !isProcessing && currentDay !== lastProcessedDay;

  const handleProcessRacket = async () => {
    if (!canProcessRacket) return;
    
    setIsProcessing(true);
    try {
      processRacketCycle();
      setLastProcessedDay(currentDay);
    } catch (error) {
      console.error('Error processing racket:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getHeatColor = (level: number) => {
    if (level < 30) return 'text-neon-green';
    if (level < 60) return 'text-neon-amber';
    if (level < 80) return 'text-neon-orange';
    return 'text-neon-red';
  };

  const getHeatStatus = (level: number) => {
    if (level < 30) return { text: 'Low Profile', variant: 'default' as const };
    if (level < 60) return { text: 'Moderate', variant: 'secondary' as const };
    if (level < 80) return { text: 'High Risk', variant: 'destructive' as const };
    return { text: 'Critical', variant: 'destructive' as const };
  };

  const heatStatus = getHeatStatus(homeDistrictHeat);

  useEffect(() => {
    // Reset processing when day changes
    if (currentDay !== lastProcessedDay) {
      setIsProcessing(false);
    }
  }, [currentDay, lastProcessedDay]);

  return (
    <div className="space-y-4">
      {/* Home District Overview */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <Home className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Home District Racket</h3>
            <p className="text-xs text-muted-foreground">Wan Chai Operations</p>
          </div>
        </div>

        {/* Revenue Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-medium text-white">Daily Revenue</span>
            </div>
            <span className="text-lg font-bold text-neon-green">${homeDistrictRevenue}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {officerCutIncreased && (
              <span className="text-neon-amber">Officer cut increased (-20% revenue)</span>
            )}
          </div>
        </div>

        {/* Heat Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium text-white">District Heat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getHeatColor(homeDistrictHeat)}`}>
                {homeDistrictHeat}%
              </span>
              <Badge variant={heatStatus.variant} className="text-xs">
                {heatStatus.text}
              </Badge>
            </div>
          </div>
          <Progress 
            value={homeDistrictHeat} 
            className="h-2 bg-slate-700"
            style={{
              background: `linear-gradient(to right, hsl(var(--neon-red)) ${homeDistrictHeat}%, hsl(var(--slate-700)) ${homeDistrictHeat}%)`
            }}
          />
        </div>

        {/* Heat Warning */}
        {homeDistrictHeat > 70 && (
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neon-red animate-pulse" />
              <p className="text-sm text-neon-red font-semibold">
                High district heat! Risk of police attention.
              </p>
            </div>
          </div>
        )}

        {/* Process Racket Button */}
        <div className="mb-4">
          <Button
            onClick={handleProcessRacket}
            disabled={!canProcessRacket || !assignedLeader}
            className="w-full gap-2"
            variant={canProcessRacket && assignedLeader ? "cyber" : "outline"}
          >
            <TrendingUp className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 
             !assignedLeader ? 'Assign Leader First' :
             currentPhase !== 'day' ? 'Wait for Day Phase' :
             currentDay === lastProcessedDay ? 'Already Processed Today' :
             'Process Daily Racket'}
          </Button>
        </div>
      </Card>

      {/* Leader Assignment */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <h4 className="font-display text-md font-bold text-white mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-neon-purple" />
          District Leader
        </h4>
        
        {assignedLeader ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{assignedLeader.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unassignSyndicateMember}
                  className="text-xs"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Loyalty:</span>
                  <span className="ml-1 text-neon-green">{assignedLeader.stats.loyalty}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Competence:</span>
                  <span className="ml-1 text-neon-cyan">{assignedLeader.stats.competence}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ruthlessness:</span>
                  <span className="ml-1 text-neon-red">{assignedLeader.stats.ruthlessness}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ambition:</span>
                  <span className="ml-1 text-neon-purple">{assignedLeader.stats.ambition}%</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>• Revenue bonus: +${Math.floor(assignedLeader.stats.loyalty * 2)}</p>
              <p>• Heat generation: +2 per cycle</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Building className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No leader assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Assign a syndicate member to manage operations</p>
          </div>
        )}
      </Card>

      {/* Available Members */}
      {syndicateMembers.length > 0 && !assignedLeader && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
          <h4 className="font-display text-md font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-cyan" />
            Available Members
          </h4>
          <div className="space-y-2">
            {syndicateMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                <div>
                  <span className="text-sm font-medium text-white">{member.name}</span>
                  <div className="text-xs text-muted-foreground">
                    Loyalty: {member.stats.loyalty}% • Competence: {member.stats.competence}%
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => assignSyndicateMember(member.id)}
                  className="text-xs"
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Operations Info */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <h4 className="font-display text-md font-bold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-amber" />
          Operations Info
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• Process racket during <span className="text-neon-cyan">day phase</span> only</p>
          <p>• Can process <span className="text-neon-green">once per day</span></p>
          <p>• Leader stats affect revenue and efficiency</p>
          <p>• High heat attracts police attention</p>
          <p>• Consider reducing heat through intel operations</p>
        </div>
      </Card>
    </div>
  );
};