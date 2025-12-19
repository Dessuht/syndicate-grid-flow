import { useState } from 'react';
import { Sidebar, ViewType } from './Sidebar';
import { ResourceBar } from './ResourceBar';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { EventManager } from './EventManager';
import { RainOverlay } from './RainOverlay';
import { SyndicateRoster } from './SyndicateRoster';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const GameLayout = () => {
  const [activeView, setActiveView] = useState<ViewType>('district');
  const { syndicateMembers, recruitSyndicateMember, cash, recruitCost } = useGameStore();

  return (
    <div className="flex h-screen w-full bg-background bg-cyber-grid bg-grid overflow-hidden">
      {/* Rain Effect */}
      <RainOverlay />

      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Resource Bar */}
        <ResourceBar />

        {/* View Content */}
        <main className="flex-1 overflow-hidden flex gap-4 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-full"
            >
              {activeView === 'district' && <DistrictMap />}
              {activeView === 'global' && <GlobalMap />}
            </motion.div>
          </AnimatePresence>

          {/* Syndicate Roster Sidebar */}
          <div className="w-72 xl:w-80 flex-shrink-0 hidden lg:block">
            <SyndicateRoster
              characters={syndicateMembers}
              onRecruit={recruitSyndicateMember}
              canRecruit={cash >= recruitCost}
              recruitCost={recruitCost}
            />
          </div>
        </main>
      </div>

      {/* Event Modal System */}
      <EventManager />
    </div>
  );
};
