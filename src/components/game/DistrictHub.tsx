import { useGameStore } from '@/stores/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, MapPin, DollarSign, Flame, TrendingUp, Skull } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getFullName } from '@/lib/characterGenerator';
import { Character } from '@/types/character';

interface DistrictHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemberAssignmentCard = ({ member, isAssigned, onAssign, onUnassign }: {
  member: Character;
  isAssigned: boolean;
  onAssign: (id: string) => void;
  onUnassign: () => void;
}) => {
  const revenueEstimate = Math.floor(200 + (200 * (member.stats.face / 100)));
  const isAmbitious = member.traits.includes('Ambitious');

  return (
    <motion.div
      layout
      className={cn(
        "p-3 rounded-lg border transition-all duration-200",
        isAssigned ? "bg-neon-green/10 border-neon-green/50" : "bg-card/50 border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center text-xs font-bold">
            {member.surname[0]}{member.name[0]}
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">{getFullName(member)}</h4>
            <p className="text-[10px] text-muted-foreground">{member.rank}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-neon-amber flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            ~${revenueEstimate}/cycle
          </p>
          <p className="text-[10px] text-muted-foreground">Face: {member.stats.face}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex gap-2">
          {isAmbitious && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-red/20 text-neon-red border border-neon-red/30">
              Ambitious
            </span>
          )}
        </div>
        
        {isAssigned ? (
          <Button variant="destructive" size="sm" onClick={onUnassign}>
            <Skull className="w-3 h-3 mr-1" /> Unassign
          </Button>
        ) : (
          <Button 
            variant="cyber" 
            size="sm" 
            onClick={() => onAssign(member.id)}
            disabled={!member.isActive}
          >
            <TrendingUp className="w-3 h-3 mr-1" /> Assign Racket
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export const DistrictHub = ({ isOpen, onClose }: DistrictHubProps) => {
  const { 
    syndicateMembers, 
    homeDistrictLeaderId, 
    homeDistrictHeat, 
    homeDistrictRevenue,
    assignSyndicateMember,
    unassignSyndicateMember,
    scoutTerritory,
    rivals,
    intel
  } = useGameStore();

  const assignedLeader = syndicateMembers.find(m => m.id === homeDistrictLeaderId);
  const idleMembers = syndicateMembers.filter(m => m.isActive);
  
  const woShingWo = rivals.find(r => r.id === 'rival-3');
  const canScout = assignedLeader?.traits.includes('Ambitious') && woShingWo && !woShingWo.isScouted;

  const handleAssign = (memberId: string) => {
    if (homeDistrictLeaderId) {
      // If someone is already assigned, unassign them first
      unassignSyndicateMember();
    }
    assignSyndicateMember(memberId);
  };

  const handleScout = () => {
    if (woShingWo) {
      scoutTerritory(woShingWo.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-card border-neon-cyan/50 neon-glow-cyan">
        <DialogHeader>
          <DialogTitle className="font-display text-xl neon-text-cyan flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Wan Chai District Hub
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Manage your primary territory racket.</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Racket Status</h4>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-medium">Leader:</span>
                <span className={cn(
                  "text-sm font-bold",
                  assignedLeader ? "text-neon-green" : "text-neon-red"
                )}>
                  {assignedLeader ? getFullName(assignedLeader) : 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-neon-red" />
                <span className="text-sm font-medium">Heat:</span>
                <span className="text-sm font-bold text-neon-red">{homeDistrictHeat}%</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neon-amber" />
                <span className="text-sm font-medium">Last Cycle:</span>
                <span className="text-sm font-bold text-neon-amber">${homeDistrictRevenue}</span>
              </div>
            </div>
          </div>

          {/* Expansion Logic */}
          {canScout && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 space-y-2"
            >
              <h4 className="text-sm font-semibold text-neon-red flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Expansion Opportunity
              </h4>
              <p className="text-xs text-muted-foreground">
                {assignedLeader?.name} is ambitious and suggests scouting the adjacent {woShingWo?.name} territory. This will unassign them but provide valuable intel for future expansion.
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleScout}
                className="w-full"
              >
                Scout {woShingWo?.district} (Unassign {assignedLeader?.name})
              </Button>
            </motion.div>
          )}
          
          {/* Idle Members List */}
          <h4 className="text-sm font-semibold text-foreground">Idle Family Members ({idleMembers.length})</h4>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {assignedLeader && (
                <MemberAssignmentCard 
                  key={assignedLeader.id}
                  member={assignedLeader}
                  isAssigned={true}
                  onAssign={handleAssign}
                  onUnassign={unassignSyndicateMember}
                />
              )}
              {idleMembers.length > 0 ? (
                idleMembers.map(member => (
                  <MemberAssignmentCard 
                    key={member.id}
                    member={member}
                    isAssigned={false}
                    onAssign={handleAssign}
                    onUnassign={unassignSyndicateMember}
                  />
                ))
              ) : !assignedLeader && (
                <p className="text-center text-muted-foreground text-xs py-4">
                  All syndicate members are currently assigned or you need to recruit one.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};