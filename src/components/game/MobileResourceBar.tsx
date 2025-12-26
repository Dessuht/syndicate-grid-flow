"use client";

import { useGameStore } from '@/stores/gameStore';
import { DollarSign, Shield, Flame, Eye } from 'lucide-react';

export const MobileResourceBar = () => {
  const { cash, reputation, policeHeat, intel } = useGameStore();

  const resources = [
    { icon: DollarSign, value: cash >= 1000 ? `${(cash / 1000).toFixed(1)}k` : cash, color: 'text-neon-green' },
    { icon: Shield, value: reputation, color: 'text-neon-blue' },
    { icon: Flame, value: policeHeat, color: policeHeat > 70 ? 'text-neon-red' : 'text-neon-orange' },
    { icon: Eye, value: intel, color: 'text-neon-purple' },
  ];

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700">
      {resources.map((resource, index) => {
        const Icon = resource.icon;
        return (
          <div key={index} className="flex items-center gap-1">
            <Icon className={`w-4 h-4 ${resource.color}`} />
            <span className={`text-sm font-bold ${resource.color}`}>{resource.value}</span>
          </div>
        );
      })}
    </div>
  );
};
