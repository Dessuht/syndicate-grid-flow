import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Flame, Heart, Star, Skull, ChevronRight } from 'lucide-react';
import { Character, RANK_LABELS, TRAIT_EFFECTS } from '@/types/character';
import { getFullName } from '@/lib/characterGenerator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyndicateRosterProps {
  characters: Character[];
  onRecruit: () => void;
  canRecruit: boolean;
  recruitCost: number;
}

const RankIcon = ({ rank }: { rank: string }) => {
  switch (rank) {
    case '489':
      return <Skull className="w-4 h-4" />;
    case '438':
      return <Star className="w-4 h-4" />;
    case '426':
      return <Shield className="w-4 h-4" />;
    default:
      return <ChevronRight className="w-4 h-4" />;
  }
};

const CharacterCard = ({ character }: { character: Character }) => {
  const { stats, traits, rank } = character;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-slate-900/80 border border-amber-900/50 rounded-lg p-3 hover:border-amber-500/50 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-900 to-slate-800 border-2 border-amber-600/50 flex items-center justify-center">
          <RankIcon rank={rank} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-sm font-semibold text-amber-100 truncate">
            {getFullName(character)}
          </h4>
          <p className="text-xs text-amber-600/80 flex items-center gap-1">
            <span className="font-mono">{rank}</span>
            <span className="text-muted-foreground">•</span>
            <span>{RANK_LABELS[rank]}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3">
        {/* Loyalty */}
        <div className="flex items-center gap-2">
          <Heart className="w-3 h-3 text-amber-500" />
          <div className="flex-1">
            <Progress 
              value={stats.loyalty} 
              className="h-1.5 bg-slate-800"
            />
          </div>
          <span className="text-[10px] font-mono text-amber-400 w-7 text-right">
            {stats.loyalty}
          </span>
        </div>

        {/* Heat */}
        <div className="flex items-center gap-2">
          <Flame className="w-3 h-3 text-red-500" />
          <div className="flex-1">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.heat}%`,
                  background: `linear-gradient(90deg, 
                    hsl(45, 100%, 50%) 0%, 
                    hsl(0, 85%, 55%) 100%
                  )`,
                }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono text-red-400 w-7 text-right">
            {stats.heat}
          </span>
        </div>
      </div>

      {/* Traits */}
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          {traits.map((trait) => {
            const effect = TRAIT_EFFECTS[trait];
            return (
              <Tooltip key={trait}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-[9px] px-1.5 py-0 h-4 bg-slate-800/50 border-amber-800/50 text-amber-300/80 cursor-help hover:border-amber-500/50"
                  >
                    {trait}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent 
                  side="top"
                  className="bg-slate-900 border-amber-800/50 text-amber-100"
                >
                  <p className="text-xs">{effect.description}</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    {effect.loyaltyMod !== 0 && (
                      <span className={effect.loyaltyMod > 0 ? 'text-green-400' : 'text-red-400'}>
                        Loyalty {effect.loyaltyMod > 0 ? '+' : ''}{effect.loyaltyMod}
                      </span>
                    )}
                    {effect.heatMod !== 0 && (
                      <span className={effect.heatMod > 0 ? 'text-red-400' : 'text-green-400'}>
                        Heat {effect.heatMod > 0 ? '+' : ''}{effect.heatMod}
                      </span>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </motion.div>
  );
};

export const SyndicateRoster = ({ 
  characters, 
  onRecruit, 
  canRecruit,
  recruitCost 
}: SyndicateRosterProps) => {
  const activeCount = characters.filter(c => c.isActive).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-950/90 backdrop-blur-sm rounded-lg border border-amber-900/30 flex flex-col h-full min-h-[500px]"
    >
      {/* Header */}
      <div className="p-4 border-b border-amber-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-900/50 to-red-900/30 border border-amber-700/50">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-amber-100">
              Syndicate Roster
            </h2>
            <p className="text-xs text-amber-600/70">
              {activeCount} {activeCount === 1 ? 'member' : 'members'} in the family
            </p>
          </div>
        </div>
      </div>

      {/* Character List */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {characters.filter(c => c.isActive).map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CharacterCard character={character} />
              </motion.div>
            ))}
          </AnimatePresence>

          {activeCount === 0 && (
            <div className="text-center py-8 text-amber-600/50">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No family members yet</p>
              <p className="text-xs">Recruit associates to grow your syndicate</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Recruit Button */}
      <div className="p-3 border-t border-amber-900/30">
        <Button
          onClick={onRecruit}
          disabled={!canRecruit}
          className="w-full bg-gradient-to-r from-amber-900 to-red-900 hover:from-amber-800 hover:to-red-800 border border-amber-600/50 text-amber-100 font-display disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Recruit Associate
          <span className="ml-2 text-xs opacity-70">${recruitCost}</span>
        </Button>
        {!canRecruit && (
          <p className="text-[10px] text-center text-red-400/70 mt-1">
            Not enough cash
          </p>
        )}
      </div>
    </motion.div>
  );
};
