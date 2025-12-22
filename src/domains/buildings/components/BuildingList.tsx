import React from 'react';
import { BuildingCard } from './BuildingCard';
import { useGameStore } from '../../../core/hooks/useGameStore';
import type { Building } from '../../../core/store/types';

interface BuildingListProps {
  onSelectBuilding?: (building: Building) => void;
}

export const BuildingList: React.FC<BuildingListProps> = ({ onSelectBuilding }) => {
  const { getBuildings, selectedBuildingId } = useGameStore();

  const handleSelectBuilding = (building: Building) => {
    if (onSelectBuilding) {
      onSelectBuilding(building);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getBuildings().map((building) => (
        <BuildingCard
          key={building.id}
          building={building}
          onSelect={handleSelectBuilding}
          isSelected={selectedBuildingId === building.id}
        />
      ))}
    </div>
  );
};