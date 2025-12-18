import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, Handshake, Swords, ShoppingCart, X, Check, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// SVG paths for Hong Kong districts (simplified but recognizable shapes)
const DISTRICT_PATHS: Record<string, { path: string; center: { x: number; y: number } }> = {
  'wan-chai': {
    path: 'M280,180 L320,165 L360,175 L380,200 L370,230 L330,245 L290,235 L270,210 Z',
    center: { x: 325, y: 205 }
  },
  'kowloon-city': {
    path: 'M200,80 L260,65 L310,75 L340,95 L350,130 L320,155 L270,165 L220,155 L190,125 L195,95 Z',
    center: { x: 270, y: 115 }
  },
  'mong-kok': {
    path: 'M120,100 L180,85 L200,95 L195,130 L180,155 L140,165 L100,150 L95,120 Z',
    center: { x: 150, y: 125 }
  },
  'tsim-sha-tsui': {
    path: 'M180,160 L220,155 L270,165 L280,180 L270,210 L230,225 L190,215 L170,190 Z',
    center: { x: 225, y: 190 }
  },
  'central': {
    path: 'M320,165 L370,155 L410,165 L430,190 L420,220 L380,235 L330,245 L320,220 Z',
    center: { x: 375, y: 195 }
  },
  'sham-shui-po': {
    path: 'M60,130 L100,115 L140,125 L150,155 L130,185 L90,195 L55,175 L45,150 Z',
    center: { x: 95, y: 155 }
  }
};

// Map rival IDs to district keys
const RIVAL_TO_DISTRICT: Record<string, string> = {
  'rival-1': 'kowloon-city',
  'rival-2': 'mong-kok',
  'rival-3': 'tsim-sha-tsui'
};

// Player's home territory
const PLAYER_DISTRICT = 'wan-chai';

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

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const activeRival = activeDiplomacy ? rivals.find(r => r.id === activeDiplomacy.rivalId) : null;
  const selectedRival = selectedDistrict ? rivals.find(r => RIVAL_TO_DISTRICT[r.id] === selectedDistrict) : null;

  // Calculate our military strength
  const ourStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);

  const getDistrictColor = (districtKey: string) => {
    if (districtKey === PLAYER_DISTRICT) {
      return 'hsl(var(--neon-cyan))';
    }
    const rival = rivals.find(r => RIVAL_TO_DISTRICT[r.id] === districtKey);
    if (rival) {
      if (rival.hasAlliance) return 'hsl(var(--neon-green))';
      if (rival.relationship < -20) return 'hsl(var(--neon-red))';
      if (rival.hasTradeAgreement) return 'hsl(var(--neon-amber))';
      return 'hsl(var(--neon-purple))';
    }
    return 'hsl(var(--muted))';
  };

  const getDistrictOpacity = (districtKey: string) => {
    if (hoveredDistrict === districtKey || selectedDistrict === districtKey) return 0.8;
    if (districtKey === PLAYER_DISTRICT) return 0.6;
    return 0.4;
  };

  const getDistrictLabel = (districtKey: string) => {
    if (districtKey === PLAYER_DISTRICT) return 'Wan Chai (You)';
    const rival = rivals.find(r => RIVAL_TO_DISTRICT[r.id] === districtKey);
    if (rival) return rival.district;
    const labels: Record<string, string> = {
      'central': 'Central',
      'sham-shui-po': 'Sham Shui Po'
    };
    return labels[districtKey] || districtKey;
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
      <div className="flex items-center justify-between mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 relative">
          <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden">
            {/* Map Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--neon-cyan) / 0.3) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
            
            <svg
              viewBox="0 0 500 300"
              className="w-full h-auto relative z-10"
              style={{ minHeight: '400px' }}
            >
              {/* Water/Background */}
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--background))" />
                  <stop offset="100%" stopColor="hsl(var(--card))" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <rect width="500" height="300" fill="url(#waterGradient)" />
              
              {/* Victoria Harbour representation */}
              <path
                d="M0,200 Q100,180 200,190 Q300,200 400,185 Q450,180 500,190 L500,220 Q400,210 300,220 Q200,230 100,215 Q50,210 0,220 Z"
                fill="hsl(var(--neon-cyan) / 0.1)"
                stroke="hsl(var(--neon-cyan) / 0.3)"
                strokeWidth="1"
              />
              
              {/* District Territories */}
              {Object.entries(DISTRICT_PATHS).map(([key, { path, center }]) => {
                const isPlayerTerritory = key === PLAYER_DISTRICT;
                const rival = rivals.find(r => RIVAL_TO_DISTRICT[r.id] === key);
                const isClickable = !!rival;
                
                return (
                  <g key={key}>
                    {/* Territory Shape */}
                    <motion.path
                      d={path}
                      fill={getDistrictColor(key)}
                      fillOpacity={getDistrictOpacity(key)}
                      stroke={getDistrictColor(key)}
                      strokeWidth={selectedDistrict === key || hoveredDistrict === key ? 3 : 1.5}
                      filter={selectedDistrict === key ? 'url(#glow)' : undefined}
                      style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      onClick={() => isClickable && setSelectedDistrict(selectedDistrict === key ? null : key)}
                      onMouseEnter={() => setHoveredDistrict(key)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* District Label */}
                    <text
                      x={center.x}
                      y={center.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-display text-xs font-bold pointer-events-none select-none"
                      fill={isPlayerTerritory ? 'hsl(var(--neon-cyan))' : 'hsl(var(--foreground))'}
                      style={{ textShadow: '0 0 8px hsl(var(--background))' }}
                    >
                      {getDistrictLabel(key).split(' ')[0]}
                    </text>
                    
                    {/* Status Indicators */}
                    {rival?.hasAlliance && (
                      <circle cx={center.x + 25} cy={center.y - 15} r="6" fill="hsl(var(--neon-green))" />
                    )}
                    {rival?.hasTradeAgreement && !rival?.hasAlliance && (
                      <circle cx={center.x + 25} cy={center.y - 15} r="6" fill="hsl(var(--neon-amber))" />
                    )}
                  </g>
                );
              })}
              
              {/* Legend */}
              <g transform="translate(10, 250)">
                <rect x="0" y="0" width="12" height="12" fill="hsl(var(--neon-cyan))" fillOpacity="0.6" rx="2" />
                <text x="18" y="10" className="text-xs" fill="hsl(var(--muted-foreground))">Your Territory</text>
                
                <rect x="100" y="0" width="12" height="12" fill="hsl(var(--neon-green))" fillOpacity="0.6" rx="2" />
                <text x="118" y="10" className="text-xs" fill="hsl(var(--muted-foreground))">Allied</text>
                
                <rect x="170" y="0" width="12" height="12" fill="hsl(var(--neon-red))" fillOpacity="0.6" rx="2" />
                <text x="188" y="10" className="text-xs" fill="hsl(var(--muted-foreground))">Hostile</text>
                
                <rect x="240" y="0" width="12" height="12" fill="hsl(var(--neon-purple))" fillOpacity="0.6" rx="2" />
                <text x="258" y="10" className="text-xs" fill="hsl(var(--muted-foreground))">Rival</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Selected District Info Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedRival ? (
              <motion.div
                key={selectedRival.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "p-5 rounded-lg border bg-card",
                  selectedRival.relationship > 20 ? 'border-neon-green/30' : 
                  selectedRival.relationship < -20 ? 'border-neon-red/30' : 'border-border'
                )}
              >
                {/* Relationship Indicator */}
                <div className={cn(
                  "inline-block px-2 py-0.5 rounded text-xs font-medium mb-3",
                  selectedRival.relationship > 20 ? 'bg-neon-green/20 text-neon-green' : 
                  selectedRival.relationship < -20 ? 'bg-neon-red/20 text-neon-red' : 
                  'bg-secondary text-muted-foreground'
                )}>
                  Relationship: {selectedRival.relationship > 0 ? '+' : ''}{selectedRival.relationship}
                </div>

                {/* Gang Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{selectedRival.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRival.district}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm">Strength: <span className="font-bold text-neon-cyan">{selectedRival.strength}</span></span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRival.hasTradeAgreement && (
                    <span className="px-2 py-0.5 rounded text-xs bg-neon-amber/20 text-neon-amber border border-neon-amber/30">
                      Trade Partner
                    </span>
                  )}
                  {selectedRival.hasAlliance && (
                    <span className="px-2 py-0.5 rounded text-xs bg-neon-green/20 text-neon-green border border-neon-green/30">
                      Allied
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {!selectedRival.hasTradeAgreement && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                      onClick={() => initiateDiplomacy(selectedRival.id, 'trade')}
                      disabled={cash < 1000}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Trade Agreement ($1,000)
                    </Button>
                  )}
                  {!selectedRival.hasAlliance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                      onClick={() => initiateDiplomacy(selectedRival.id, 'alliance')}
                      disabled={selectedRival.relationship < 30}
                    >
                      <Handshake className="w-4 h-4" />
                      Form Alliance {selectedRival.relationship < 30 && '(Need +30)'}
                    </Button>
                  )}
                  {!selectedRival.hasAlliance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-red/30 text-neon-red hover:bg-neon-red/10"
                      onClick={() => initiateDiplomacy(selectedRival.id, 'turfWar')}
                    >
                      <Swords className="w-4 h-4" />
                      Start Turf War
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-lg border border-dashed border-border bg-card/50 text-center"
              >
                <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Click on a rival territory to view details and diplomatic options
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-display text-sm font-semibold mb-3 text-muted-foreground">Territory Overview</h4>
            <div className="space-y-2">
              {rivals.map(rival => (
                <div 
                  key={rival.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                    selectedDistrict === RIVAL_TO_DISTRICT[rival.id] ? 'bg-secondary' : 'hover:bg-secondary/50'
                  )}
                  onClick={() => setSelectedDistrict(RIVAL_TO_DISTRICT[rival.id])}
                >
                  <span className="text-sm">{rival.name}</span>
                  <div className="flex items-center gap-2">
                    {rival.hasAlliance && <span className="w-2 h-2 rounded-full bg-neon-green" />}
                    {rival.hasTradeAgreement && !rival.hasAlliance && <span className="w-2 h-2 rounded-full bg-neon-amber" />}
                    {!rival.hasAlliance && !rival.hasTradeAgreement && rival.relationship < -20 && <span className="w-2 h-2 rounded-full bg-neon-red" />}
                    <span className={cn(
                      "text-xs font-medium",
                      rival.relationship > 0 ? 'text-neon-green' : rival.relationship < 0 ? 'text-neon-red' : 'text-muted-foreground'
                    )}>
                      {rival.relationship > 0 ? '+' : ''}{rival.relationship}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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