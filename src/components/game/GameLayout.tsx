import { useState } from 'react';
import { Sidebar, ViewType } from './Sidebar';
import { ResourceBar } from './ResourceBar';
import { DistrictMap } from './DistrictMap';
import { GlobalMap } from './GlobalMap';
import { PoliceRaidModal } from './PoliceRaidModal';
import { RainOverlay } from './RainOverlay';
import { motion, AnimatePresence } from 'framer-motion';

export const GameLayout = () => {
  const [activeView, setActiveView] = useState<ViewType>('district');

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
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === 'district' && <DistrictMap />}
              {activeView === 'global' && <GlobalMap />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Event Modal */}
      <PoliceRaidModal />
    </div>
  );
};
