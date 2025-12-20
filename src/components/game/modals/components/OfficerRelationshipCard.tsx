import { Officer } from '@/stores/gameStoreTypes';
import { OfficerRelationship } from '@/types/relationships';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface OfficerRelationshipCardProps {
  officer: Officer;
  relationship: OfficerRelationship;
  getTypeColor: (relationship: OfficerRelationship) => string;
  getTypeLabel: (relationship: OfficerRelationship) => string;
}

export const OfficerRelationshipCard = ({ 
  officer, 
  relationship, 
  getTypeColor, 
  getTypeLabel 
}: OfficerRelationshipCardProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{officer.name}</span>
          <Badge
            className={getTypeColor(relationship)}
            variant="secondary"
          >
            {getTypeLabel(relationship)}
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
  );
};