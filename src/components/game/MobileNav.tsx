"use client";

import { Map, Globe, Scale, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeView: 'district' | 'global' | 'legal' | 'council';
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'district', label: 'District', icon: Map },
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'council', label: 'Council', icon: Users },
];

export const MobileNav = ({ activeView, onViewChange }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
