import { useGameStore } from '@/stores/gameStore';
import type { Officer, OfficerRank } from '@/stores/gameStoreTypes';
import { OfficerRelationship } from '@/types/relationships';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Heart, Zap, DollarSign, MessageSquare, Skull, Briefcase, Star, TrendingUp, Crown, Users, HeartHandshake, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OfficerDossierModalProps {
  officer: Officer;
  onClose: () => void;
}

const PROMOTION_COST = 5000;
const PROMOTION_FACE_REQUIREMENT = 50;

export const OfficerDossierModal = ({ officer, onClose }: OfficerDossierModalProps) => {
  const { 
    currentPhase, 
    cash, 
    officers,
    shareTea, 
    giveBonus, 
    reprimandOfficer,
    promoteOfficer,
    designateSuccessor,
    relationshipSystem,
    createManualInteraction
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('overview');

  const isMorning = currentPhase === 'morning';
  const isUnavailable = officer.isWounded || officer.isArrested;
  const canInteract = isMorning && !isUnavailable;
  
  const canPromote = officer.face >= PROMOTION_FACE_REQUIREMENT && cash >= PROMOTION_COST;
  const isMaxRank = officer.rank === 'Deputy (438)' || officer.rank === 'Dragonhead (489)';
  const promotionAvailable = !isMaxRank && (officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' || officer.rank === 'Straw Sandal' || officer.rank === 'Blue Lantern');
  const nextRank = officer.rank === 'Red Pole' || officer.rank === 'White Paper Fan' ? 'Deputy (438)' : 'Dragonhead (489)';
  
  const isSuccessor = officer.isSuccessor;

  // Relationship helper functions
  const getRelationships = () => {
    const relationships: Array<{
      officer: Officer;
      relationship: OfficerRelationship;
    }> = [];

    officers.forEach(otherOfficer => {
      if (otherOfficer.id !== officer.id) {
        const relationship = relationshipSystem?.getRelationship?.(officer.id, otherOfficer.id);
        if (relationship) {
          relationships.push({ officer: otherOfficer, relationship });
        }
      }
    });

    return relationships.sort((a, b) => b.relationship.relationship - a.relationship.relationship);
  };

  const getRelationshipTypeColor = (relationship: OfficerRelationship) => {
    if (relationship.isLover || relationship.isInLove) return 'bg-pink-500';
    if (relationship.isFriend) return 'bg-green-500';
    if (relationship.isEnemy) return 'bg-red-500';
    if (relationship.isMortalEnemy) return 'bg-red-700';
    return 'bg-gray-500';
  };

  const getRelationshipTypeLabel = (relationship: OfficerRelationship) => {
    if (relationship.isLover) return 'Lover';
    if (relationship.isInLove) return 'In Love';
    if (relationship.isFriend) return 'Friend';
    if (relationship.isMortalEnemy) return 'Mortal Enemy';
    if (relationship.isEnemy) return 'Enemy';
    return 'Acquaintance';
  };

  const handleSocialInteraction = (targetOfficerId: string, interactionType: string) => {
    createManualInteraction(officer.id, targetOfficerId, interactionType);
    onClose();
  };

  const relationships = getRelationships();

  const handleShareTea = () => {
    shareTea(officer.id);
    // Close immediately after action, unless energy hit 0 (which might trigger unassignment)
    if (officer.energy - 10 > 0) {
        onClose();
    } else {
        // If energy hits 0, wait a moment for state update to propagate before closing
        setTimeout(onClose, 100);
    }
  };

  const handleBonus = () => {
    giveBonus(officer.id);
    onClose();
  };

  const handleReprimand = () => {
    reprimandOfficer(officer.id);
    onClose();
  };
  
  const handlePromote = (rank: OfficerRank) => {
    promoteOfficer(officer.id, rank);
    onClose();
  };
  
  const handleDesignateSuccessor = () => {
    designateSuccessor(officer.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-card border-2 border-neon-cyan/50 neon-glow-cyan max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-secondary border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-lg shrink-0">
            {officer.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold neon-text-cyan">{officer.name}</h2>
            <p className="text-sm text-muted-foreground">{officer.rank}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Relationships
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              {/* Status & Stats */}
              <div className="space-y-3 mb-6 p-3 rounded-lg bg-secondary/30 border border-border">
                {/* Loyalty Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-neon-green" />
                      <span className="text-muted-foreground">Loyalty</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      officer.loyalty > 60 ? "text-neon-green" : officer.loyalty > 40 ? "text-neon-amber" : "text-neon-red"
                    )}>
                      {officer.loyalty}%
                    </span>
                  </div>
                  <Progress 
                    value={officer.loyalty} 
                    className="h-1.5 bg-slate-800"
                    indicatorClassName={cn(
                      officer.loyalty > 60 ? "bg-neon-green" : officer.loyalty > 40 ? "bg-neon-amber" : "bg-neon-red"
                    )}
                  />
                </div>
                
                {/* Face Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-jianghu-gold" />
                      <span className="text-muted-foreground">Face (Prestige)</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      officer.face >= PROMOTION_FACE_REQUIREMENT ? "text-jianghu-gold" : "text-muted-foreground"
                    )}>
                      {officer.face}%
                    </span>
                  </div>
                  <Progress 
                    value={officer.face} 
                    className="h-1.5 bg-slate-800"
                    indicatorClassName="bg-jianghu-gold"
                  />
                </div>

                {/* Energy Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-neon-magenta" />
                      <span className="text-muted-foreground">Energy</span>
                    </div>
                    <span className="text-neon-magenta font-medium">{officer.energy}/{officer.maxEnergy}</span>
                  </div>
                  <Progress 
                    value={(officer.energy / officer.maxEnergy) * 100} 
                    className="h-1.5 bg-slate-800"
                    indicatorClassName="bg-neon-magenta"
                  />
                </div>
                
                {/* Agenda */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-neon-amber" />
                    <span className="text-xs font-semibold text-neon-amber">Current Agenda</span>
                  </div>
                  <p className="text-sm mt-1 text-foreground">
                    {officer.currentAgenda || (canInteract ? 'Unknown. Share Tea to reveal.' : 'Unknown.')}
                  </p>
                </div>
              </div>

              {/* Traits List */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {officer.traits.map((trait, index) => (
                    <span 
                      key={index} 
                      className="text-[10px] px-2 py-1 rounded bg-secondary/50 border border-border text-foreground"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Leadership Actions */}
              <h3 className="font-display text-lg font-bold mb-3">Leadership</h3>
              <div className="space-y-3">
                {/* Designate Successor */}
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-3",
                    isSuccessor 
                      ? "border-jianghu-gold/50 bg-jianghu-gold/10 text-jianghu-gold" 
                      : "border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
                  )}
                  onClick={handleDesignateSuccessor}
                  disabled={!canInteract}
                >
                  <div className={cn("p-2 rounded", isSuccessor ? "bg-jianghu-gold/20" : "bg-neon-cyan/20")}>
                    <Crown className={cn("w-5 h-5", isSuccessor ? "text-jianghu-gold" : "text-neon-cyan")} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {isSuccessor ? 'Successor Designated' : 'Designate Successor'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isSuccessor ? 'This officer will take over if you fall.' : 'Name this officer as your Vanguard.'}
                    </p>
                  </div>
                </Button>
              </div>
              
              {/* Promotion Section */}
              {promotionAvailable && (
                <div className="mt-6 pt-4 border-t border-border space-y-3">
                  <h3 className="font-display text-lg font-bold text-jianghu-gold">Promotion Ceremony</h3>
                  
                  <Button
                    variant="cyber"
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => handlePromote(nextRank as OfficerRank)}
                    disabled={!canPromote}
                  >
                    <div className="p-2 rounded bg-jianghu-gold/20">
                      <TrendingUp className="w-5 h-5 text-jianghu-gold" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">Promote to {nextRank}</p>
                      <p className="text-xs text-muted-foreground">
                        Cost: ${PROMOTION_COST.toLocaleString()} • Requires {PROMOTION_FACE_REQUIREMENT} Face
                      </p>
                    </div>
                  </Button>
                  
                  {!canPromote && (
                    <p className="text-[10px] text-center text-neon-amber">
                      Requires ${PROMOTION_COST.toLocaleString()} cash and {PROMOTION_FACE_REQUIREMENT} Face.
                    </p>
                  )}
                </div>
              )}

              {!isMorning && (
                <p className="mt-4 text-xs text-neon-amber text-center">
                  Interactions are only available during the Morning phase.
                </p>
              )}
              {isUnavailable && (
                <p className="mt-4 text-xs text-neon-red text-center">
                  Officer is {officer.isWounded ? 'WOUNDED' : 'ARRESTED'} and cannot be interacted with.
                </p>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {relationships.length === 0 ? (
                  <p className="text-gray-500 text-sm">No relationships established yet</p>
                ) : (
                  relationships.map(({ officer: otherOfficer, relationship }) => (
                    <div
                      key={otherOfficer.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{otherOfficer.name}</span>
                          <Badge
                            className={getRelationshipTypeColor(relationship)}
                            variant="secondary"
                          >
                            {getRelationshipTypeLabel(relationship)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {otherOfficer.rank}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Relationship</span>
                            <span>{relationship.relationship}</span>
                          </div>
                          <Progress
                            value={Math.abs(relationship.relationship)}
                            className="h-2"
                          />
                        </div>

                        {relationship.interest > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Interest</span>
                              <span>{relationship.interest}</span>
                            </div>
                            <Progress
                              value={relationship.interest}
                              className="h-2"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Respect</span>
                            <span>{relationship.respect}</span>
                          </div>
                          <Progress
                            value={relationship.respect}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {relationship.sharedMemories.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-1">Recent Memories:</div>
                          <div className="text-xs text-gray-300">
                            {relationship.sharedMemories.slice(-2).map((memory, idx) => (
                              <div key={idx} className="italic">
                                "{memory.description}"
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {relationship.grudges.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Grudge: {relationship.grudges[0].reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Social Interactions Tab */}
          <TabsContent value="interactions" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <h3 className="font-display text-lg font-bold mb-3">Social Interactions</h3>
              <div className="space-y-3">
                {/* Share Tea */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
                  onClick={handleShareTea}
                  disabled={!canInteract || officer.energy < 10}
                >
                  <div className="p-2 rounded bg-neon-cyan/20">
                    <MessageSquare className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Share Tea</p>
                    <p className="text-xs text-muted-foreground">
                      +5 Loyalty, Reveal Agenda • -10 Energy
                    </p>
                  </div>
                </Button>

                {/* Give Bonus */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 border-neon-green/30 hover:border-neon-green/60 hover:bg-neon-green/10"
                  onClick={handleBonus}
                  disabled={!canInteract || cash < 1000}
                >
                  <div className="p-2 rounded bg-neon-green/20">
                    <DollarSign className="w-5 h-5 text-neon-green" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Give Bonus</p>
                    <p className="text-xs text-muted-foreground">
                      -$1,000 • +20 Loyalty, Clears Ambition
                    </p>
                  </div>
                </Button>

                {/* Reprimand */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
                  onClick={handleReprimand}
                  disabled={!canInteract}
                >
                  <div className="p-2 rounded bg-neon-red/20">
                    <Skull className="w-5 h-5 text-neon-red" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Reprimand</p>
                    <p className="text-xs text-muted-foreground">
                      -10 Heat • -20 Loyalty (Risk of Snitching/Quitting)
                    </p>
                  </div>
                </Button>

                {/* Social Interactions with Other Officers */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm mb-3">Interact with Other Officers</h4>
                  <div className="space-y-2">
                    {relationships.slice(0, 3).map(({ officer: otherOfficer, relationship }) => (
                      <div key={otherOfficer.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{otherOfficer.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getRelationshipTypeLabel(relationship)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSocialInteraction(otherOfficer.id, 'DEEP_CONVERSATION')}
                            disabled={!canInteract}
                            className="text-xs"
                          >
                            Deep Talk
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSocialInteraction(otherOfficer.id, 'FLIRTATION')}
                            disabled={!canInteract}
                            className="text-xs"
                          >
                            Flirt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSocialInteraction(otherOfficer.id, 'JOKE_TELLING')}
                            disabled={!canInteract}
                            className="text-xs"
                          >
                            Share Joke
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSocialInteraction(otherOfficer.id, 'FLATTERY_GIFT')}
                            disabled={!canInteract}
                            className="text-xs"
                          >
                            Give Gift
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};