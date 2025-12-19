import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Swords, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const StreetWarModal = () => {
  const { activeEvent, eventData, handleStreetWarChoice, cash, soldiers, officers } = useGameStore();
  
  if (activeEvent !== 'streetWar') return null;
  
  const { rivalName, rivalStrength } = eventData;
  
  // Calculate our strength
  const ourSoldiersStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);
  const assignedOfficer = officers.find(o => o.assignedBuildingId);
  const officerFace = assignedOfficer ? assignedOfficer.skills.enforcement : 0;
  const ourTotalStrength = ourSoldiersStrength + officerFace;
  
  const bribeCost = Math.max(5000, rivalStrength * 100);
  const canAffordBribe = cash >= bribeCost;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-red/50 neon-glow-red"
      >
        <button 
          onClick={() => handleStreetWarChoice('fight')}
          className="absolute top-4 right-4 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-neon-red" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-red">STREET WAR</h2>
            <p className="text-muted-foreground">{rivalName} declares war</p>
          </div>
        </div>
        
        <p className="text-foreground mb-6 leading-relaxed">
          Tensions have boiled over with the {rivalName}. They've mobilized their forces and are preparing to attack your operations. 
          Your strength will be tested against theirs in a brutal street battle.
        </p>
        
        {/* Strength Comparison */}
        <div className="p-3 rounded-lg bg-secondary/30 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Force Comparison</span>
            <span className={`text-xs font-medium ${ourTotalStrength > rivalStrength ? 'text-neon-green' : 'text-neon-red'}`}>
              {ourTotalStrength > rivalStrength ? 'Advantage: YOU' : 'Advantage: ENEMY'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Your Strength</p>
              <p className="text-lg font-bold text-neon-cyan">{ourTotalStrength}</p>
              <p className="text-xs text-neon-cyan">Soldiers: {ourSoldiersStrength} + Officer: {officerFace}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Enemy Strength</p>
              <p className="text-lg font-bold text-neon-red">{rivalStrength}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
            disabled={!canAffordBribe}
            onClick={() => handleStreetWarChoice('bribe')}
          >
            <div className="p-2 rounded bg-neon-amber/20">
              <DollarSign className="w-5 h-5 text-neon-amber" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay Bribe</p>
              <p className="text-xs text-muted-foreground">
                Cost: ${bribeCost.toLocaleString()} • Resets conflict • -20 Rep
              </p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
            onClick={() => handleStreetWarChoice('fight')}
          >
            <div className="p-2 rounded bg-neon-red/20">
              <Swords className="w-5 h-5 text-neon-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Fight Back</p>
              <p className="text-xs text-muted-foreground">
                {ourTotalStrength > rivalStrength 
                  ? 'Victory likely: Keep territory, gain respect' 
                  : 'Defeat likely: Lose most profitable building'}
              </p>
            </div>
          </Button>
        </div>
        
        {!canAffordBribe && (
          <p className="mt-4 text-xs text-neon-red text-center">
            Insufficient funds for bribery
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};