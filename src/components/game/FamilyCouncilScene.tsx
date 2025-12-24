import { useGameStore } from '@/stores/gameStore';
import type { Officer } from '@/stores/gameStoreTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, X, User, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CouncilMotionCard } from './CouncilMotionCard';
import { useEffect } from 'react';

const OfficerPortrait = ({ officer }: { officer: Officer }) => {
  const colorClass = officer.rank.includes('Deputy') ? 'border-jianghu-gold' : 
                     officer.rank.includes('Dragonhead') ? 'border-jianghu-crimson' : 
                     'border-neon-cyan';
  
  return (
    <div className="flex flex-col items-center text-center">
      <div className={cn(
        "w-20 h-20 rounded-full border-4 mb-2 flex items-center justify-center bg-card/50",
        colorClass
      )}>
        <User className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="font-display text-sm font-bold leading-tight">{officer.name}</p>
      <p className="text-xs text-muted-foreground">{officer.rank}</p>
      {officer.grudge && (
        <span className="text-[10px] text-neon-red mt-1 flex items-center gap-1">
          <X className="w-3 h-3" /> Grudge
        </span>
      )}
      <span className={cn(
        "text-[10px] mt-1",
        officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
      )}>
        Loyalty: {officer.loyalty}%
      </span>
    </div>
  );
};

export const FamilyCouncilScene = () => {
  const { 
    officers, 
    currentDay, 
    influence, 
    councilMotions, 
    generateCouncilMotions,
    exitCouncil
  } = useGameStore();
  
  // Filter and sort officers for the council (Top 3 highest rank/loyalty, excluding Blue Lantern)
  const councilMembers = officers
    .filter(o => o.rank !== 'Blue Lantern')
    .sort((a, b) => {
      // Sort by rank (Dragonhead > Deputy > Red Pole/White Paper Fan/Straw Sandal)
      const rankOrder = { 'Dragonhead (489)': 4, 'Deputy (438)': 3, 'Red Pole': 2, 'White Paper Fan': 2, 'Straw Sandal': 2, 'Blue Lantern': 1 };
      const rankDiff = (rankOrder[b.rank] || 0) - (rankOrder[a.rank] || 0);
      if (rankDiff !== 0) return rankDiff;
      
      // Then by loyalty
      return b.loyalty - a.loyalty;
    })
    .slice(0, 3);
    
  // Generate motions when the scene loads if none exist
  // Skip if we already have motions (e.g., from street beef resolution)
  useEffect(() => {
    if (councilMotions.length === 0) {
      generateCouncilMotions();
    }
    // Only run once on mount, not when councilMotions changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full p-4 bg-background/95 backdrop-blur-sm flex flex-col relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-jianghu-crimson/50 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-jianghu-crimson" />
          <div>
            <h1 className="font-display text-3xl font-bold text-jianghu-crimson">
              FAMILY COUNCIL
            </h1>
            <p className="text-sm text-muted-foreground">Day {currentDay} - The Dragonhead's Mandate</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                <Zap className="w-5 h-5" style={{ color: 'hsl(var(--neon-purple))' }} />
                <span className="text-lg font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>{influence} Influence</span>
            </div>
            <Button variant="outline" onClick={exitCouncil} disabled={councilMotions.length > 0}>
                Exit Council
            </Button>
        </div>
      </div>

      {/* Council Members */}
      <div className="flex justify-around mb-4 p-3 rounded-lg bg-secondary/30 border border-border">
        {councilMembers.map(officer => (
          <OfficerPortrait key={officer.id} officer={officer} />
        ))}
      </div>

      {/* Motions */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground mb-2">Motions on the Table ({councilMotions.length} remaining)</h2>
        
        <AnimatePresence mode="popLayout">
          {councilMotions.length > 0 ? (
            councilMotions.map(motion => (
              <CouncilMotionCard 
                key={motion.id} 
                councilMotion={motion} 
                councilMembers={councilMembers} 
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 rounded-lg border border-dashed border-border bg-card/50"
            >
              <Check className="w-10 h-10 mx-auto mb-3 text-neon-green" />
              <p className="text-lg font-semibold text-neon-green">Council Adjourned</p>
              <p className="text-muted-foreground">All motions have been resolved. Click 'Exit Council' to continue.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};