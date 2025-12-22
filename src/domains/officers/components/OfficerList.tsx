import React from 'react';
import { OfficerCard } from './OfficerCard';
import { useGameStore } from '../../../core/hooks/useGameStore';
import type { Officer } from '../../../core/store/types';

interface OfficerListProps {
  onSelectOfficer?: (officer: Officer) => void;
}

export const OfficerList: React.FC<OfficerListProps> = ({ onSelectOfficer }) => {
  const { getOfficers, selectedOfficerId } = useGameStore();

  const handleSelectOfficer = (officer: Officer) => {
    if (onSelectOfficer) {
      onSelectOfficer(officer);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {getOfficers().map((officer) => (
        <OfficerCard
          key={officer.id}
          officer={officer}
          onSelect={handleSelectOfficer}
          isSelected={selectedOfficerId === officer.id}
        />
      ))}
    </div>
  );
};