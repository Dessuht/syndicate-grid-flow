import { UserPlus, Shield, Flame, Heart, Star, Skull, ChevronRight } from 'lucide-react';
import { Character } from '@/types/character';
import { TRAIT_EFFECTS } from '@/types/character';
import { getFullName } from '@/lib/characterGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const CharacterCard = ({ character }: { character: Character }) => {
  const { stats, traits } = character;
  const rank = '49'; // Default rank for generated characters

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-3 relative"
    >
      {/* Heat/Status indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b-md overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
          style={{
            width: `${stats.loyalty}%`,
            background: `linear-gradient(90deg,
              rgb(239 68 68) 0%,
              rgb(245 158 11) 50%,
              rgb(34 197 94) 100%)`,
          }}
        />
      </div>
      
      {/* Character Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center text-white font-bold text-lg">
          {character.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold neon-text-cyan">{getFullName(character)}</h3>
          <p className="text-xs text-muted-foreground">Rank {rank}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">LOYALTY</div>
          <div className="text-lg font-bold text-neon-green">{stats.loyalty}</div>
          <div className="w-full">
            <Progress value={stats.loyalty} className="h-2" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">MOOD</div>
          <div className="text-lg font-bold text-neon-cyan">{(stats as any).mood || 50}</div>
          <div className="w-full">
            <Progress value={(stats as any).mood || 50} className="h-2" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">HEALTH</div>
          <div className="text-lg font-bold text-red-500">{(stats as any).health || 70}</div>
          <div className="w-full">
            <Progress value={(stats as any).health || 70} className="h-2" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">FACE</div>
          <div className="text-lg font-bold text-yellow-500">{(stats as any).face || 30}</div>
          <div className="w-full">
            <Progress value={(stats as any).face || 30} className="h-2" />
          </div>
        </div>
      </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-1">
        {traits.map((trait, index) => {
          const effect = TRAIT_EFFECTS[trait];
          return (
            <Tooltip key={trait}>
              <TooltipTrigger asChild>
                <Badge variant={trait === 'Ruthless' || trait === 'Hot-headed' ? 'destructive' : trait === 'Battle Hardened' ? 'default' : 'outline'}>
                  {trait}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-medium">{trait}</p>
                <p className="text-xs text-muted-foreground">{effect.description}</p>
                <div className="text-xs space-y-1 mt-2">
                  <div>Loyalty: {effect.loyaltyMod > 0 ? '+' : ''}{effect.loyaltyMod}</div>
                  <div>Heat: {effect.heatMod > 0 ? '+' : ''}{effect.heatMod}</div>
                  <div>Face: {effect.faceMod > 0 ? '+' : ''}{effect.faceMod}</div>
                  <div>Mood: {effect.moodMod > 0 ? '+' : ''}{effect.moodMod}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Shield className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

interface SyndicateRosterProps {
  characters: Character[];
  recruitCost: number;
  onRecruit: () => void;
  canRecruit: boolean;
}

export const SyndicateRoster = ({ characters, recruitCost, onRecruit, canRecruit }: SyndicateRosterProps) => {
  const activeCount = characters.filter(c => (c as any).isActive !== false).length;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold neon-text-magenta">Syndicate Members</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active: {activeCount}/{characters.length}</span>
          <Button onClick={onRecruit} disabled={!canRecruit} size="sm">
            <UserPlus className="w-4 h-4 mr-1" />
            Recruit ({recruitCost})
          </Button>
        </div>
      </div>

      {/* Character List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {characters.filter(c => (c as any).isActive !== false).map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CharacterCard character={character} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};