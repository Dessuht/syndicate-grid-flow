import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { SocialFeedEntry } from '@/types/relationships';
import { formatDistanceToNow } from 'date-fns';

export const SocialFeed: React.FC = () => {
  const { socialFeed = [], officers } = useGameStore();

  const getOfficerName = (officerId: string) => {
    const officer = officers.find(o => o.id === officerId);
    return officer?.name || officerId;
  };

  const formatEntry = (entry: SocialFeedEntry) => {
    let description = entry.description;
    
    // Replace officer IDs with names
    officers.forEach(officer => {
      description = description.replace(new RegExp(officer.id, 'g'), officer.name);
    });

    return description;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">Social Feed</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {socialFeed.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent social activity</p>
        ) : (
          socialFeed.map((entry: SocialFeedEntry) => (
            <div
              key={entry.id}
              className="bg-gray-800 rounded p-2 text-sm"
            >
              <div className={`text-xs ${getImpactColor(entry.impact)}`}>
                {formatEntry(entry)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};