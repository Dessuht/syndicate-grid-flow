import { useGameStore } from '@/stores/gameStore';
import type { CouncilMotion, Officer } from '@/stores/gameStoreTypes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Zap, Swords, HandCoins, Check, X } from 'lucide-react';

interface CouncilMotionCardProps {
  councilMotion: CouncilMotion;
  councilMembers: Officer[];
}

export const CouncilMotionCard = ({ councilMotion, councilMembers }: CouncilMotionCardProps) => {
  const { influence, handleCouncilVote, useInfluenceToOrderVote } = useGameStore();
  
  const isExpansion = councilMotion.type === 'expansion';
  const icon = isExpansion ? Swords : HandCoins;
  const color = isExpansion ? 'neon-red' : 'neon-green';
  
  const voteCounts = councilMembers.reduce((acc, member) => {
    const vote = councilMotion.officerVotes[member.id];
    if (vote === 'yes') acc.yes++;
    else if (vote === 'no') acc.no++;
    return acc;
  }, { yes: 0, no: 0 });
  
  const councilMajorityVote = voteCounts.yes > voteCounts.no ? 'yes' : 'no';
  const isTie = voteCounts.yes === voteCounts.no;
  
  const canOrderVote = influence >= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-lg border bg-card/70 backdrop-blur-sm",
        `border-${color}/50`
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg border", `bg-${color}/20 border-${color}/50`)}>
          {icon && <motion.div className={cn("w-6 h-6", `text-${color}`)}>{icon({ className: "w-6 h-6" })}</motion.div>}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{councilMotion.title}</h3>
          <p className="text-xs text-muted-foreground">{councilMotion.description}</p>
        </div>
      </div>

      {/* Officer Votes Table */}
      <div className="mb-4 p-3 rounded-lg bg-secondary/50">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Council Support ({voteCounts.yes} YES / {voteCounts.no} NO)</h4>
        <div className="space-y-1">
          {councilMembers.map(officer => (
            <div key={officer.id} className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-medium",
                officer.grudge && "text-neon-red/70 italic"
              )}>
                {officer.name} ({officer.rank})
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-bold",
                  councilMotion.officerVotes[officer.id] === 'yes' ? 'text-neon-green' : 'text-neon-red'
                )}>
                  {councilMotion.officerVotes[officer.id] === 'yes' ? 'YES' : 'NO'}
                </span>
                
                {/* Influence Veto Button */}
                {councilMotion.officerVotes[officer.id] !== councilMajorityVote && canOrderVote && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-neon-purple hover:bg-neon-purple/10"
                        onClick={() => useInfluenceToOrderVote(councilMotion.id, officer.id, councilMajorityVote)}
                    >
                        <Zap className="w-3 h-3 mr-1" /> Order (10 Inf)
                    </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {isTie && (
            <p className="text-xs text-neon-amber mt-2">Council is tied. Your vote is the deciding factor.</p>
        )}
      </div>

      {/* Player Vote */}
      <div className="flex gap-3 mt-4">
        <Button
          variant="cyber"
          className="flex-1 bg-neon-green/30 hover:bg-neon-green/50 border-neon-green/50"
          onClick={() => handleCouncilVote(councilMotion.id, 'yes')}
        >
          <Check className="w-4 h-4 mr-2" />
          Vote YES
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => handleCouncilVote(councilMotion.id, 'no')}
        >
          <X className="w-4 h-4 mr-2" />
          Vote NO (Veto)
        </Button>
      </div>
    </motion.div>
  );
};