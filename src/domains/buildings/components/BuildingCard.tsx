import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGameStore } from '../../../core/hooks/useGameStore';
import type { Building, BuildingType } from '../../../core/store/types';

interface BuildingCardProps {
  building: Building;
  onSelect?: (building: Building) => void;
  isSelected?: boolean;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building, onSelect, isSelected = false }) => {
  const { getOfficerById, selectBuilding, upgradeBuilding } = useGameStore();

  const handleSelect = () => {
    if (onSelect) {
      onSelect(building);
    } else {
      selectBuilding(building.id);
    }
  };

  const handleUpgrade = () => {
      if (!building.isUpgraded) {
        upgradeBuilding(building.id);
    }
  };

  const assignedOfficer = building.assignedOfficerId ? getOfficerById(building.assignedOfficerId) : null;
  const isUpgradable = !building.isRebelBase && !building.isUpgraded;

  const getStatusColor = () => {
    if (building.isRebelBase) return 'bg-red-500';
    if (building.isOccupied && building.assignedOfficerId) return 'bg-green-500';
    if (building.inactiveUntilDay) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (building.isRebelBase) return 'Rebel Base';
    if (building.isOccupied && assignedOfficer) return `Occupied by ${assignedOfficer.name}`;
    if (building.inactiveUntilDay) return `Inactive until Day ${building.inactiveUntilDay}`;
    return 'Available';
  };

  const getBuildingTypeColor = (type: BuildingType) => {
    const colors = {
      'Noodle Shop': 'bg-yellow-100 border-yellow-300',
      'Mahjong Parlor': 'bg-purple-100 border-purple-300',
      'Warehouse': 'bg-gray-100 border-gray-300',
      'Nightclub': 'bg-pink-100 border-pink-300',
      'Counterfeit Lab': 'bg-red-100 border-red-300',
      'Police Station': 'bg-blue-100 border-blue-300',
      'Drug Lab': 'bg-green-100 border-green-300',
    };
    return colors[type] || 'bg-gray-100 border-gray-300';
  };

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick={handleSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{building.name}</CardTitle>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getBuildingTypeColor(building.type)}`}>
            {building.type}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={building.isOccupied ? 'default' : 'secondary'}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Revenue */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Revenue:</span>
              <span className="font-medium">${building.baseRevenue}/day</span>
            </div>
            <div className="flex justify-between">
              <span>Heat:</span>
              <span className={building.heatGen > 0 ? 'text-red-600' : 'text-green-600'}>
                {building.heatGen > 0 ? '+' : ''}{building.heatGen}
              </span>
            </div>
          </div>

          {/* Resources Provided */}
          {(building.foodProvided > 0 || building.entertainmentProvided > 0) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {building.foodProvided > 0 && (
                <div className="flex justify-between">
                  <span>Food:</span>
                  <span>{building.foodProvided}</span>
                </div>
              )}
              {building.entertainmentProvided > 0 && (
                <div className="flex justify-between">
                  <span>Entertainment:</span>
                  <span>{building.entertainmentProvided}</span>
                </div>
              )}
            </div>
          )}

          {/* Assigned Officer */}
          {assignedOfficer && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Assigned Officer</span>
                <div className="text-right">
                  <div className="font-medium">{assignedOfficer.name}</div>
                  <div className="text-xs text-gray-500">{assignedOfficer.rank}</div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Button */}
          {isUpgradable && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleUpgrade}
                className="w-full"
                variant="outline"
              >
                Upgrade (${building.baseRevenue * 2})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};