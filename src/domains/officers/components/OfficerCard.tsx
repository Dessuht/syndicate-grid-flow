import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGameStore } from '../../../core/hooks/useGameStore';
import type { Officer } from '../../../core/store/types';

interface OfficerCardProps {
  officer: Officer;
  onSelect?: (officer: Officer) => void;
  isSelected?: boolean;
}

export const OfficerCard: React.FC<OfficerCardProps> = ({ officer, onSelect, isSelected = false }) => {
  const { selectOfficer } = useGameStore();

  const handleSelect = () => {
    if (onSelect) {
      onSelect(officer);
    } else {
      selectOfficer(officer.id);
    }
  };

  const getHealthColor = () => {
      if (officer.status?.isWounded) return 'bg-red-500';
      if (officer.status?.isArrested) return 'bg-orange-500';
    if (officer.energy < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
      if (officer.status?.isWounded) return { text: 'Wounded', variant: 'destructive' as const };
      if (officer.status?.isArrested) return { text: 'Arrested', variant: 'secondary' as const };
      if (officer.status?.isBetraying) return { text: 'Betraying', variant: 'destructive' as const };
      if (officer.status?.isSuccessor) return { text: 'Successor', variant: 'default' as const };
    return null;
  };

  const statusBadge = getStatusBadge();

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick={handleSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{officer.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{officer.rank}</Badge>
            {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {/* Health and Energy */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Health</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getHealthColor()}`}
                  style={{ width: `${(officer.energy / officer.maxEnergy) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Energy</span>
              <span>{officer.energy}/{officer.maxEnergy}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Skills</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Enforcement:</span>
                <span>{officer.skills.enforcement}</span>
              </div>
              <div className="flex justify-between">
                <span>Diplomacy:</span>
                <span>{officer.skills.diplomacy}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics:</span>
                <span>{officer.skills.logistics}</span>
              </div>
              <div className="flex justify-between">
                <span>Recruitment:</span>
                <span>{officer.skills.recruitment}</span>
              </div>
            </div>
          </div>

          {/* Loyalty */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Loyalty</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${officer.loyalty}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{officer.loyalty}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Face</span>
              <span>{officer.face}</span>
            </div>
          </div>

          {/* Assignment */}
          {officer.assignedBuildingId && (
            <div className="text-sm">
              <span className="text-gray-600">Assigned to: </span>
              <span className="font-medium">Building #{officer.assignedBuildingId}</span>
            </div>
          )}

          {/* Traits */}
          {officer.traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {officer.traits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};