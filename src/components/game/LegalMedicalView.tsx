import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Heart, Lock, Clock, DollarSign, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LegalMedicalView = () => {
  const { 
    officers, 
    cash, 
    intel, 
    healOfficer, 
    releaseOfficer 
  } = useGameStore();

  const woundedOfficers = officers.filter(o => o.isWounded);
  const arrestedOfficers = officers.filter(o => o.isArrested);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold gradient-text">Legal & Medical</h2>
          <p className="text-sm text-muted-foreground">Manage your officers' health and legal issues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Hospital Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-neon-red/10 border border-neon-red/30">
              <Heart className="w-4 h-4 text-neon-red" />
            </div>
            <h3 className="font-display text-lg font-semibold neon-text-red">Hospital</h3>
            <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
              {woundedOfficers.length} wounded
            </span>
          </div>

          {woundedOfficers.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No wounded officers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {woundedOfficers.map((officer) => (
                <motion.div
                  key={officer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-red/30 to-secondary border-2 border-neon-red/50 flex items-center justify-center font-bold text-sm">
                        {officer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{officer.name}</h4>
                        <p className="text-xs text-muted-foreground">{officer.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-neon-red">
                        <Clock className="w-3 h-3" />
                        <span>{officer.daysToRecovery} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border flex justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>$2,000</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                      onClick={() => healOfficer(officer.id)}
                      disabled={cash < 2000}
                    >
                      <Heart className="w-3 h-3" />
                      Private Clinic
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Jail Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
              <Lock className="w-4 h-4 text-neon-amber" />
            </div>
            <h3 className="font-display text-lg font-semibold neon-text-amber">Jail</h3>
            <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
              {arrestedOfficers.length} arrested
            </span>
          </div>

          {arrestedOfficers.length === 0 ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No arrested officers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {arrestedOfficers.map((officer) => (
                <motion.div
                  key={officer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-amber/30 to-secondary border-2 border-neon-amber/50 flex items-center justify-center font-bold text-sm">
                      {officer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{officer.name}</h4>
                      <p className="text-xs text-muted-foreground">{officer.rank}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border flex justify-between">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="w-3 h-3" />
                        <span>$5,000</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Brain className="w-3 h-3" />
                        <span>50 Intel</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                      onClick={() => releaseOfficer(officer.id)}
                      disabled={cash < 5000 && intel < 50}
                    >
                      <Lock className="w-3 h-3" />
                      Bribe Official
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-card/50 border border-border rounded-lg p-4"
      >
        <h4 className="font-display text-sm font-semibold mb-2">Recovery System</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-secondary/30">
            <h5 className="font-medium mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3 text-neon-red" />
              Hospital Recovery
            </h5>
            <p className="text-muted-foreground">
              Wounded officers automatically recover 1 day per cycle. 
              Use Private Clinic to heal instantly for $2,000.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <h5 className="font-medium mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-neon-amber" />
              Jail Release
            </h5>
            <p className="text-muted-foreground">
              Release arrested officers by paying $5,000 or 50 Intel.
              Officers remain arrested until released.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};