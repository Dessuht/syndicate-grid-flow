import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, TrendingUp, Handshake, Swords, ShoppingCart, X, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const GlobalMap = () => {
  const { 
    cash, 
    intel,
    rivals, 
    soldiers,
    activeDiplomacy,
    initiateDiplomacy, 
    confirmDiplomacy,
    cancelDiplomacy,
    purchaseIntel 
  } = useGameStore();

  const activeRival = activeDiplomacy ? rivals.find(r => r.id === activeDiplomacy.rivalId) : null;

  // Calculate our military strength
  const ourStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);

  const getDiplomacyCost = () => {
    switch (activeDiplomacy?.action) {
      case 'trade': return 1000;
      case 'alliance': return 0;
      case 'turfWar': return 0;
      default: return 0;
    }
  };

  const canConfirmDiplomacy = () => {
    if (!activeDiplomacy || !activeRival) return false;
    switch (activeDiplomacy.action) {
      case 'trade': return cash >= 1000;
      case 'alliance': return activeRival.relationship >= 30;
      case 'turfWar': return true;
      default: return false;
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <Globe className="w-5 h-5" style={{ color: 'hsl(var(--neon-purple))' }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>
              Hong Kong Territory
            </h2>
            <p className="text-sm text-muted-foreground">Intel: {intel} • Our Strength: {ourStrength}</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => purchaseIntel(500)}
          disabled={cash < 500}
          className="gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Buy Intel ($500)
        </Button>
      </div>

      {/* Rival Gangs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rivals.map((rival, index) => (
          <motion.div
            key={rival.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-5 rounded-lg border transition-all duration-300 bg-card",
              rival.relationship > 20 ? 'border-neon-green/30' : rival.relationship < -20 ? 'border-neon-red/30' : 'border-border'
            )}
          >
            {/* Relationship Indicator */}
            <div className={cn(
              "absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium",
              rival.relationship > 20 ? 'bg-neon-green/20 text-neon-green' : 
              rival.relationship < -20 ? 'bg-neon-red/20 text-neon-red' : 
              'bg-secondary text-muted-foreground'
            )}>
              {rival.relationship > 0 ? '+' : ''}{rival.relationship}
            </div>

            {/* Gang Info */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-secondary border border-border">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{rival.name}</h3>
                <p className="text-sm text-muted-foreground">{rival.district}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm">Strength: <span className="font-bold text-neon-cyan">{rival.strength}</span></span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mb-4">
              {rival.hasTradeAgreement && (
                <span className="px-2 py-0.5 rounded text-xs bg-neon-amber/20 text-neon-amber border border-neon-amber/30">
                  Trade Partner
                </span>
              )}
              {rival.hasAlliance && (
                <span className="px-2 py-0.5 rounded text-xs bg-neon-green/20 text-neon-green border border-neon-green/30">
                  Allied
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {!rival.hasTradeAgreement && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                  onClick={() => initiateDiplomacy(rival.id, 'trade')}
                  disabled={cash < 1000}
                >
                  <TrendingUp className="w-4 h-4" />
                  Trade Agreement ($1,000)
                </Button>
              )}
              {!rival.hasAlliance && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  onClick={() => initiateDiplomacy(rival.id, 'alliance')}
                  disabled={rival.relationship < 30}
                >
                  <Handshake className="w-4 h-4" />
                  Form Alliance {rival.relationship < 30 && '(Need +30)'}
                </Button>
              )}
              {!rival.hasAlliance && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-neon-red/30 text-neon-red hover:bg-neon-red/10"
                  onClick={() => initiateDiplomacy(rival.id, 'turfWar')}
                >
                  <Swords className="w-4 h-4" />
                  Start Turf War
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Diplomacy Confirmation Modal */}
      <AnimatePresence>
        {activeDiplomacy && activeRival && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={cancelDiplomacy} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-card border border-border"
            >
              <h3 className="font-display text-lg font-bold mb-2">
                {activeDiplomacy.action === 'trade' && 'Trade Agreement'}
                {activeDiplomacy.action === 'alliance' && 'Form Alliance'}
                {activeDiplomacy.action === 'turfWar' && 'Declare Turf War'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeDiplomacy.action === 'trade' && `Establish trade routes with ${activeRival.name} for $1,000. Gain +100 Intel and improve relations.`}
                {activeDiplomacy.action === 'alliance' && `Form a mutual defense pact with ${activeRival.name}. They will not attack and may assist in conflicts.`}
                {activeDiplomacy.action === 'turfWar' && `Declare war on ${activeRival.name}. This will severely damage relations and trigger an immediate conflict.`}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelDiplomacy}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant={activeDiplomacy.action === 'turfWar' ? 'danger' : 'cyber'}
                  className="flex-1"
                  onClick={confirmDiplomacy}
                  disabled={!canConfirmDiplomacy()}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
