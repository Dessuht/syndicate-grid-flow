import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { OfficerRelationship } from '@/types/relationships';

export const useOfficerRelationships = (officerId: string) => {
  const { officers, relationshipSystem } = useGameStore();

  const relationships = useMemo(() => {
    if (!relationshipSystem) return [];

    const rels: Array<{
      officer: any;
      relationship: OfficerRelationship;
    }> = [];

    officers.forEach(otherOfficer => {
      if (otherOfficer.id !== officerId) {
        const relationship = relationshipSystem.getRelationship?.(officerId, otherOfficer.id);
        if (relationship) {
          rels.push({ officer: otherOfficer, relationship });
        }
      }
    });

    return rels.sort((a, b) => b.relationship.relationship - a.relationship.relationship);
  }, [officerId, officers, relationshipSystem]);

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

  return {
    relationships,
    getRelationshipTypeColor,
    getRelationshipTypeLabel
  };
};