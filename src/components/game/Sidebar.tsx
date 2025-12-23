import { Building, Globe, Users, TrendingUp, Shield, Menu, AlertTriangle, Heart, Lock, Swords, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export type ViewType = 'district' | 'global' | 'legal' | 'council';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NAV_ITEMS = [
  {
    id: 'district' as ViewType,
    label: 'District',
    icon: Building,
    description: 'Manage buildings & personnel'
  },
  {
    id: 'global' as ViewType,
    label: 'Territory',
    icon: Globe,
    description: 'Diplomacy & expansion'
  },
  {
    id: 'legal' as ViewType,
    label: 'Legal & Medical',
    icon: Heart,
    description: 'Hospital & jail management'
  },
  {
    id: 'council' as ViewType,
    label: 'Family Council',
    icon: Scale,
    description: 'Call council meetings'
  },
];

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { rivals, officers, isCivilWarActive } = useGameStore();
  
  // Check if there's an active street war
  const hasActiveStreetWar = rivals.some(r => r.isActiveConflict);
  
  // Count wounded and arrested officers
  const woundedOfficers = officers.filter(o => o.isWounded);
  const arrestedOfficers = officers.filter(o => o.isArrested);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-background" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="font-display font-bold text-lg gradient-text leading-tight">
                KOWLOON
              </h1>
              <p className="text-xs text-muted-foreground">SYNDICATE</p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Civil War Alert */}
      {isCivilWarActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-2 bg-neon-red/20 border-b border-neon-red/50"
        >
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-neon-red animate-pulse shrink-0" />
            {!isCollapsed && (
              <p className="text-xs font-semibold text-neon-red leading-tight">
                CIVIL WAR ACTIVE
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            const showWarning = item.id === 'district' && hasActiveStreetWar;
            const showBadge = (item.id === 'legal' && (woundedOfficers.length > 0 || arrestedOfficers.length > 0));
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary neon-glow-cyan"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive && "text-primary"
                  )}
                />
                
                {!isCollapsed && (
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{item.label}</p>
                      {showWarning && (
                        <AlertTriangle className="w-4 h-4 text-neon-red animate-pulse" />
                      )}
                      {showBadge && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute h-2 w-2 rounded-full bg-neon-red opacity-75"></span>
                          <span className="relative h-2 w-2 rounded-full bg-neon-red"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Stats Preview */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-magenta" />
                <span className="text-muted-foreground">Officers</span>
              </div>
              <span className="font-medium">{officers.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neon-green" />
                <span className="text-muted-foreground">Revenue</span>
              </div>
              <span className="font-medium text-neon-green">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};