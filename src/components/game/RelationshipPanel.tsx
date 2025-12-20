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