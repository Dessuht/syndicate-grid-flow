import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { OfficerRelationship as ComplexRelationship } from '@/types/relationships';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RelationshipNetwork } from './RelationshipNetwork';
import { SocialFeed } from './SocialFeed';
import { Heart, Users, MessageSquare, AlertTriangle } from 'lucide-react';

interface RelationshipPanelProps {
  selectedOfficerId: string | null;
}

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({ selectedOfficerId }) => {
  const { officers, relationshipSystem } = useGameStore();
  const [activeTab, setActiveTab] = useState('overview');

  const selectedOfficer = officers.find(o => o.id === selectedOfficerId);

  if (!selectedOfficer) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <p className="text-gray-500">Select an officer to view relationships</p>
      </div>
    );
  }

  const getRelationships = () => {
    const relationships: Array<{
      officer: any;
      relationship: ComplexRelationship;
    }> = [];

    officers.forEach(officer => {
      if (officer.id !== selectedOfficerId) {
        const relationship = relationshipSystem.getRelationship(selectedOfficerId, officer.id);
        if (relationship) {
          relationships.push({ officer, relationship });
        }
      }
    });

    return relationships.sort((a, b) => b.relationship.relationship - a.relationship.relationship);
  };

  const getRelationshipTypeColor = (relationship: ComplexRelationship) => {
    if (relationship.isLover || relationship.isInLove) return 'bg-pink-500';
    if (relationship.isFriend) return 'bg-green-500';
    if (relationship.isEnemy) return 'bg-red-500';
    if (relationship.isMortalEnemy) return 'bg-red-700';
    return 'bg-gray-500';
  };

  const getRelationshipTypeLabel = (relationship: ComplexRelationship) => {
    if (relationship.isLover) return 'Lover';
    if (relationship.isInLove) return 'In Love';
    if (relationship.isFriend) return 'Friend';
    if (relationship.isMortalEnemy) return 'Mortal Enemy';
    if (relationship.isEnemy) return 'Enemy';
    return 'Acquaintance';
  };

  const relationships = getRelationships();

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {selectedOfficer.name}'s Relationships
        </h3>
        <Badge variant="outline" className="text-gray-300">
          {relationships.length} connections
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="space-y-2">
            {relationships.map(({ officer, relationship }) => (
              <div
                key={officer.id}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{officer.name}</span>
                    <Badge
                      className={getRelationshipTypeColor(relationship)}
                      variant="secondary"
                    >
                      {getRelationshipTypeLabel(relationship)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {officer.rank}
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network">
          <RelationshipNetwork selectedOfficerId={selectedOfficerId} />
        </TabsContent>

        <TabsContent value="social">
          <SocialFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};
</dyad-edit>

<dyad-edit path="src/components/game/GameLayout.tsx" description="Add relationship panel to game layout">
import { useGameStore } from '@/stores/gameStore';
import { AutonomousOfficersPanel } from './AutonomousOfficersPanel';
import { ResourceBar } from './ResourceBar';
import { DayCycle } from './DayCycle';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { LegalMedicalView } from './LegalMedicalView';
import { FamilyCouncilScene } from './FamilyCouncilScene';
import { EventManager } from './EventManager';
import { DistrictHub } from './DistrictHub';
import { Sidebar } from './Sidebar';
import { RelationshipPanel } from './RelationshipPanel';
import { useState } from 'react';

export const GameLayout = () => {
  const { currentScene, currentPhase } = useGameStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('district');

  const renderCurrentView = () => {
    switch (currentScene) {
      case 'DISTRICT':
        return <DistrictMap selectedOfficerId={selectedOfficerId} onSelectOfficer={setSelectedOfficerId} />;
      case 'GLOBAL':
        return <GlobalMap />;
      case 'LEGAL':
        return <LegalMedicalView />;
      case 'COUNCIL':
        return <FamilyCouncilScene />;
      default:
        return <DistrictMap selectedOfficerId={selectedOfficerId} onSelectOfficer={setSelectedOfficerId} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar activeView={activeView as any} onViewChange={setActiveView as any} />
      
      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        <div className="w-80 space-y-4">
          <ResourceBar />
          <DayCycle />
          <AutonomousOfficersPanel
            selectedOfficerId={selectedOfficerId}
            onSelectOfficer={setSelectedOfficerId}
          />
        </div>
        
        <div className="flex-1">
          {renderCurrentView()}
        </div>

        {/* Relationship Panel */}
        <div className="w-96">
          <RelationshipPanel selectedOfficerId={selectedOfficerId} />
        </div>
      </div>
      
      {/* Event Manager */}
      <EventManager />
    </div>
  );
};
</dyad-edit>

<dyad-edit path="src/stores/gameStore.ts" description="Add social interaction processing to advancePhase">
    advancePhase: () => {
      set((state) => {
        const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
        const currentIndex = phases.indexOf(state.currentPhase);

        // Process social interactions at phase changes
        const interactions = state.relationshipSystem.processAutomaticInteractions(
          state.officers,
          state.currentPhase,
          Date.now()
        );

        // Check for Council Trigger (Every 10 days, at the start of the day cycle)
        if (state.currentPhase === 'night' && (state.currentDay + 1) % 10 === 0) {
          // Queue council meeting for the next morning
          get().generateCouncilMotions();
          return { 
            currentScene: 'COUNCIL', 
            currentPhase: 'morning', 
            currentDay: state.currentDay + 1,
            recentInteractions: interactions,
            socialFeed: state.relationshipSystem.getSocialFeed()
          };
        }

        const nextPhase = phases[(currentIndex + 1) % phases.length];
        
        return {
          currentPhase: nextPhase,
          currentDay: nextPhase === 'morning' ? state.currentDay + 1 : state.currentDay,
          recentInteractions: interactions,
          socialFeed: state.relationshipSystem.getSocialFeed()
        };
      });
    },
</dyad-edit>

<dyad-add-dependency packages="date-fns"></dyad-add-dependency>

<dyad-command type="rebuild"></dyad-command>

<dyad-chat-summary>Implemented complex relationship system between officers</dyad-chat-summary>

Created a comprehensive relationship system that replaces simple loyalty scores with complex social dynamics:

**Core Features:**
- **Multi-dimensional relationships**: Each officer-to-officer relationship tracks relationship score (-100 to +100), romantic interest (0-100), respect (0-100), friendship/enmity status, and romantic involvement
- **Automatic social interactions**: Officers interact when in the same building with different probabilities based on time of day (20% during work, 40% during leisure)
- **6 interaction types**: Deep conversations, joke telling, flirtation, arguments, intrigue, and gift exchanges - each with unique requirements and outcomes
- **Romantic relationship progression**: Interest builds through interactions, leading to dates and romantic relationships with jealousy mechanics
- **Friendship bonds**: Friends defend each other, visit when wounded, and share resources
- **Memory and grudge system**: Shared memories strengthen bonds, grudges create lasting negative effects

**UI Components:**
- **Relationship Panel**: Three-tab interface showing overview, network visualization, and social feed
- **Network Graph**: Visual representation of officer relationships with color-coded connections (green for friends, red for enemies, pink for romantic)
- **Social Feed**: Real-time updates of all social interactions between officers
- **Detailed relationship cards**: Show relationship scores, interest levels, respect, shared memories, and grudges

**Integration:**
- Relationships update automatically during phase advances
- System integrates with existing officer traits and compatibility systems
- All relationship data persists and updates in real-time
- Social interactions create memories and affect future interactions

The system creates emergent storytelling through autonomous character relationships while maintaining game balance through the existing loyalty system for core mechanics.

⏳ Waiting for turbo edits...

<dyad-write path="src/stores/gameStoreTypes.ts" description="Update Officer interface to include complex relationships">
// Types for original gameStore implementation
export type OfficerRank = 'Red Pole' | 'White Paper Fan' | 'Straw Sandal' | 'Blue Lantern' | 'Deputy (438)' | 'Dragonhead (489)';
export type DayPhase = 'morning' | 'day' | 'evening' | 'night';
export type GameScene = 'DISTRICT' | 'GLOBAL' | 'LEGAL' | 'COUNCIL';
export type BuildingType = 'Noodle Shop' | 'Mahjong Parlor' | 'Warehouse' | 'Nightclub' | 'Counterfeit Lab' | 'Police Station' | 'Drug Lab';
export type EventType = 'policeRaid' | 'betrayal' | 'rivalAttack' | 'criminalCaught' | 'soldierDesertion' | 'territoryUltimatum' | 'streetWar' | 'postConflictSummary' | 'coupAttempt' | 'newEra' | 'dailyBriefing' | 'policeShakedown' | 'streetBeef' | 'nightclubSuccess' | null;

export type CompatibilityLike = 'Respects Red Poles' | 'Values Loyalty' | 'Admires Ambition' | 'Appreciates Cunning' | 'Respects Old School';
export type CompatibilityDislike = 'Hates Ambitious' | 'Distrusts Calculating' | 'Despises Hot-headed' | 'Resents Ruthless' | 'Scorns Silver Tongue';

export interface OfficerSkills {
  enforcement: number;
  diplomacy: number;
  logistics: number;
  recruitment: number;
}

export interface OfficerRelationship {
  targetId: string;
  respect: number;
}

export interface StreetBeef {
  officer1Id: string;
  officer2Id: string;
  daysActive: number;
  isResolved: boolean;
}

export type DiploAction = 'trade' | 'alliance' | 'turfWar' | null;

import { OfficerRelationship as ComplexRelationship } from '@/types/relationships';

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  energy: number;
  maxEnergy: number;
  assignedBuildingId: string | null;
  skills: OfficerSkills;
  loyalty: number;
  daysAssigned: number;
  daysIdle: number;
  relationships: ComplexRelationship[];
  isBetraying: boolean;
  traits: string[];
  isWounded: boolean;
  isArrested: boolean;
  daysToRecovery: number;
  currentAgenda: string | null;
  face: number;
  grudge: boolean;
  isTraitor: boolean;
  isSuccessor: boolean;
  isTestingWaters: boolean;
  likes: CompatibilityLike[];
  dislikes: CompatibilityDislike[];
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  baseRevenue: number;
  heatGen: number;
  isOccupied: boolean;
  assignedOfficerId: string | null;
  inactiveUntilDay: number | null;
  isIllicit: boolean;
  foodProvided: number;
  entertainmentProvided: number;
  upgraded: boolean;
  isRebelBase: boolean;
  rebelSoldierCount: number;
}

export interface StreetSoldier {
  id: string;
  name: string;
  loyalty: number;
  needs: {
    food: number;
    entertainment: number;
    pay: number;
  };
  skill: number;
  isDeserting: boolean;
}

export interface RivalGang {
  id: string;
  name: string;
  district: string;
  strength: number;
  relationship: number;
  hasTradeAgreement: boolean;
  hasAlliance: boolean;
  isScouted: boolean;
  isActiveConflict: boolean;
}

export interface PostConflictSummaryData {
  type: 'raid' | 'streetWar' | 'civilWar';
  outcome: 'success' | 'failure';
  officerId: string | null;
  soldiersLost: number;
  reputationChange: number;
  faceChange: number;
  loyaltyChange: number;
  officerStatusEffect: 'none' | 'wounded' | 'arrested' | 'executed' | 'imprisoned';
  rivalName?: string;
}

export interface CouncilMotion {
  id: string;
  title: string;
  description: string;
  type: 'expansion' | 'internal';
  effect: (state: any) => Partial<any>;
  officerVotes: Record<string, 'yes' | 'no'>;
  isVetoed: boolean;
}