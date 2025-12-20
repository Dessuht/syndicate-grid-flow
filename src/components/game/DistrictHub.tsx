import { useGameStore } from '@/stores/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, MapPin, DollarSign, Flame, TrendingUp, Skull, Handshake, Users, AlertTriangle, Building, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getFullName } from '@/lib/characterGenerator';
import { Character } from '@/types/character';
import { useEffect, useState } from 'react';

interface DistrictHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiplomacyTab = () => {
  const { rivals } = useGameStore();
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Territory Relations</h4>
      
      <div className="space-y-4">
        {rivals.map((rival) => {
          const relationshipMagnitude = Math.abs(rival.relationship);
          // 1 unit of relationship = 0.5% of bar width (100 relationship = 50% width)
          const barWidth = Math.min(50, relationshipMagnitude * 0.5); 
          
          return (
            <div key={rival.id} className="p-3 rounded-lg bg-card/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: rival.isActiveConflict 
                        ? 'hsl(var(--neon-red))' 
                        : rival.relationship > 0 
                          ? 'hsl(var(--neon-green))' 
                          : 'hsl(var(--neon-red))' 
                    }} 
                  />
                  <span className="font-medium text-sm">{rival.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  rival.relationship > 0 ? 'text-neon-green' : 'text-neon-red'
                )}>
                  {rival.relationship > 0 ? '+' : ''}{rival.relationship}
                </span>
              </div>
              
              {/* Centered Relationship Bar (Fixing the visual issue) */}
              <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                {/* Center line visual aid */}
                <div className="absolute left-1/2 top-0 h-full w-px bg-border z-10" /> 

                {/* Negative Relationship Bar (Grows left from center) */}
                {rival.relationship < 0 && (
                  <div 
                    className={cn(
                      "absolute top-0 h-full rounded-l-full transition-all duration-500",
                      rival.isActiveConflict ? "bg-neon-red animate-pulse" : "bg-neon-red"
                    )}
                    style={{ 
                      width: `${barWidth}%`,
                      left: `${50 - barWidth}%`, // Anchor point moves left
                    }}
                  />
                )}

                {/* Positive Relationship Bar (Grows right from center) */}
                {rival.relationship > 0 && (
                  <div 
                    className={cn(
                      "absolute top-0 h-full rounded-r-full transition-all duration-500",
                      rival.isActiveConflict ? "bg-neon-red animate-pulse" : "bg-neon-green"
                    )}
                    style={{ 
                      width: `${barWidth}%`,
                      left: '50%', // Starts at center
                    }}
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">District: {rival.district}</span>
                <span className="text-[10px] text-muted-foreground">Strength: {rival.strength}</span>
              </div>
              
              {rival.isActiveConflict && (
                <div className="mt-2 p-2 rounded bg-neon-red/10 border border-neon-red/30">
                  <p className="text-[10px] text-neon-red flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Active Conflict
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TerritoryTab = () => {
  const { 
    buildings, 
    homeDistrictLeaderId, 
    syndicateMembers, 
    assignSyndicateMember, 
    unassignSyndicateMember,
    territoryFriction,
    territoryInfluence,
    cash
  } = useGameStore();
  
  const assignedLeader = syndicateMembers.find(m => m.id === homeDistrictLeaderId);
  const idleMembers = syndicateMembers.filter(m => m.isActive);
  const occupiedBuildings = buildings.filter(b => b.isOccupied).length;
  const totalBuildings = buildings.length;
  
  // Calculate passive income based on buildings
  const calculatePassiveIncome = () => {
    return buildings
      .filter(b => b.isOccupied)
      .reduce((sum, b) => sum + b.baseRevenue, 0);
  };
  
  const passiveIncome = calculatePassiveIncome();
  
  const handleAssign = (memberId: string) => {
    if (homeDistrictLeaderId) {
      unassignSyndicateMember();
    }
    assignSyndicateMember(memberId);
  };
  
  return (
    <div className="space-y-4">
      {/* Territory Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-card/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-neon-cyan" />
            <h4 className="text-sm font-semibold">Buildings</h4>
          </div>
          <p className="text-2xl font-bold neon-text-cyan">{occupiedBuildings}<span className="text-muted-foreground">/{totalBuildings}</span></p>
          <p className="text-xs text-muted-foreground">Territory control</p>
        </div>
        
        <div className="p-3 rounded-lg bg-card/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-neon-amber" />
            <h4 className="text-sm font-semibold">Passive Income</h4>
          </div>
          <p className="text-2xl font-bold neon-text-amber">${passiveIncome}</p>
          <p className="text-xs text-muted-foreground">Per day</p>
        </div>
        
        <div className="p-3 rounded-lg bg-card/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-neon-red" />
            <h4 className="text-sm font-semibold">Friction</h4>
          </div>
          <p className="text-2xl font-bold neon-text-red">{territoryFriction}%</p>
          <p className="text-xs text-muted-foreground">War risk</p>
        </div>
        
        <div className="p-3 rounded-lg bg-card/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-neon-green" />
            <h4 className="text-sm font-semibold">Influence</h4>
          </div>
          <p className="text-2xl font-bold neon-text-green">{territoryInfluence}%</p>
          <p className="text-xs text-muted-foreground">Diplomatic power</p>
        </div>
      </div>
      
      {/* Territory Leader Assignment */}
      <div className="p-3 rounded-lg bg-card/50 border border-border">
        <h4 className="text-sm font-semibold mb-3">Territory Leader</h4>
        
        {assignedLeader ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center text-xs font-bold">
                {assignedLeader.surname[0]}{assignedLeader.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{getFullName(assignedLeader)}</p>
                <p className="text-xs text-muted-foreground">{assignedLeader.rank}</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={unassignSyndicateMember}
            >
              <Skull className="w-3 h-3 mr-1" /> Unassign
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No territory leader assigned</p>
            <p className="text-xs text-muted-foreground mb-3">
              Assign a syndicate member to provide diplomatic bonuses and reduce friction
            </p>
          </div>
        )}
        
        {/* Idle Members List */}
        {idleMembers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <h5 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Available Members</h5>
            <div className="space-y-2">
              {idleMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleAssign(member.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center text-[10px] font-bold">
                      {member.surname[0]}{member.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{getFullName(member)}</p>
                      <p className="text-[10px] text-muted-foreground">{member.rank}</p>
                    </div>
                  </div>
                  <Button variant="cyber" size="sm">
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DistrictHub = ({ isOpen, onClose }: DistrictHubProps) => {
  const { 
    cash,
    homeDistrictLeaderId,
    territoryFriction,
    territoryInfluence
  } = useGameStore();
  
  const [activeTab, setActiveTab] = useState<'territory' | 'diplomacy'>('territory');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-neon-cyan/50 neon-glow-cyan">
        <DialogHeader>
          <DialogTitle className="font-display text-xl neon-text-cyan flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Wan Chai Territory Hub
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Manage your territory at the macro level.</p>
        </DialogHeader>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === 'territory' 
                ? "text-neon-cyan border-b-2 border-neon-cyan" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('territory')}
          >
            Territory Management
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === 'diplomacy' 
                ? "text-neon-cyan border-b-2 border-neon-cyan" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('diplomacy')}
          >
            Diplomacy
          </button>
        </div>
        
        <div className="space-y-4 mt-2">
          <AnimatePresence mode="wait">
            {activeTab === 'territory' ? (
              <motion.div
                key="territory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <TerritoryTab />
              </motion.div>
            ) : (
              <motion.div
                key="diplomacy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <DiplomacyTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer with District View Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            variant="cyber" 
            className="w-full"
            onClick={() => {
              onClose();
              // TODO: Navigate to District View
              console.log("Navigate to District View");
            }}
          >
            <Building className="w-4 h-4 mr-2" />
            Manage District Buildings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};