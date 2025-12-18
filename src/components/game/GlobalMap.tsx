import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, Handshake, Swords, ShoppingCart, X, Check, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Territory locations in Hong Kong (lat, lng)
const TERRITORY_LOCATIONS: Record<string, { coords: [number, number]; label: string }> = {
  'player': { coords: [22.2783, 114.1694], label: 'Wan Chai' },
  'rival-1': { coords: [22.3282, 114.1849], label: 'Kowloon City' },
  'rival-2': { coords: [22.3193, 114.1694], label: 'Mong Kok' },
  'rival-3': { coords: [22.2988, 114.1722], label: 'Tsim Sha Tsui' },
};

// Gang colors
const GANG_COLORS: Record<string, string> = {
  'player': '#00FFFF',
  'rival-1': '#FF4444',
  'rival-2': '#4488FF',
  'rival-3': '#44FF44',
};

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

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  
  const [selectedRival, setSelectedRival] = useState<string | null>(null);

  const activeRival = activeDiplomacy ? rivals.find(r => r.id === activeDiplomacy.rivalId) : null;
  const selectedRivalData = selectedRival ? rivals.find(r => r.id === selectedRival) : null;

  const ourStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Create map
    mapRef.current = L.map(mapContainer.current, {
      center: [22.31, 114.17],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark map tiles (CartoDB Dark Matter - free, no key needed)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add markers
    addMarkers();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const addMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Player marker
    const playerMarker = L.circleMarker(TERRITORY_LOCATIONS['player'].coords, {
      radius: 18,
      fillColor: GANG_COLORS['player'],
      fillOpacity: 0.4,
      color: GANG_COLORS['player'],
      weight: 3,
    }).addTo(mapRef.current);
    
    playerMarker.bindTooltip('Your Territory (Wan Chai)', {
      permanent: false,
      className: 'territory-tooltip',
    });
    markersRef.current.push(playerMarker);

    // Rival markers
    rivals.forEach((rival, index) => {
      const key = `rival-${index + 1}`;
      const location = TERRITORY_LOCATIONS[key];
      if (!location || !mapRef.current) return;

      const color = rival.hasAlliance 
        ? '#44FF44' 
        : rival.relationship < -20 
          ? '#FF4444' 
          : GANG_COLORS[key];

      const marker = L.circleMarker(location.coords, {
        radius: 15,
        fillColor: color,
        fillOpacity: 0.4,
        color: color,
        weight: 3,
      }).addTo(mapRef.current);

      marker.bindTooltip(`${rival.name} (${rival.district})`, {
        permanent: false,
        className: 'territory-tooltip',
      });

      marker.on('click', () => {
        setSelectedRival(selectedRival === rival.id ? null : rival.id);
      });

      marker.on('mouseover', () => {
        marker.setStyle({ radius: 20, fillOpacity: 0.6 });
      });

      marker.on('mouseout', () => {
        marker.setStyle({ radius: 15, fillOpacity: 0.4 });
      });

      markersRef.current.push(marker);
    });
  };

  // Update markers when data changes
  useEffect(() => {
    if (mapRef.current) {
      addMarkers();
    }
  }, [rivals, selectedRival]);

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
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <Globe className="w-5 h-5" style={{ color: 'hsl(var(--neon-purple))' }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>
              Hong Kong Territory
            </h2>
            <p className="text-sm text-muted-foreground">Intel: {intel} • Strength: {ourStrength}</p>
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

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 p-2 rounded-lg bg-card/50 border border-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00FFFF' }} />
          <span className="text-xs text-muted-foreground">You</span>
        </div>
        {rivals.map((rival, index) => (
          <div key={rival.id} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: rival.hasAlliance ? '#44FF44' : rival.relationship < -20 ? '#FF4444' : GANG_COLORS[`rival-${index + 1}`] 
              }} 
            />
            <span className="text-xs text-muted-foreground">{rival.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Map */}
        <div className="lg:col-span-2 relative rounded-lg overflow-hidden border border-border">
          <div ref={mapContainer} className="absolute inset-0" style={{ background: '#1a1a2e' }} />
        </div>

        {/* Info Panel */}
        <div className="space-y-4 overflow-auto">
          <AnimatePresence mode="wait">
            {selectedRivalData ? (
              <motion.div
                key={selectedRivalData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "p-5 rounded-lg border bg-card",
                  selectedRivalData.relationship > 20 ? 'border-neon-green/30' : 
                  selectedRivalData.relationship < -20 ? 'border-neon-red/30' : 'border-border'
                )}
              >
                <div className={cn(
                  "inline-block px-2 py-0.5 rounded text-xs font-medium mb-3",
                  selectedRivalData.relationship > 20 ? 'bg-neon-green/20 text-neon-green' : 
                  selectedRivalData.relationship < -20 ? 'bg-neon-red/20 text-neon-red' : 
                  'bg-secondary text-muted-foreground'
                )}>
                  Relationship: {selectedRivalData.relationship > 0 ? '+' : ''}{selectedRivalData.relationship}
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{selectedRivalData.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRivalData.district}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm">Strength: <span className="font-bold text-neon-cyan">{selectedRivalData.strength}</span></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRivalData.hasTradeAgreement && (
                    <span className="px-2 py-0.5 rounded text-xs bg-neon-amber/20 text-neon-amber border border-neon-amber/30">
                      Trade Partner
                    </span>
                  )}
                  {selectedRivalData.hasAlliance && (
                    <span className="px-2 py-0.5 rounded text-xs bg-neon-green/20 text-neon-green border border-neon-green/30">
                      Allied
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {!selectedRivalData.hasTradeAgreement && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                      onClick={() => initiateDiplomacy(selectedRivalData.id, 'trade')}
                      disabled={cash < 1000}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Trade ($1,000)
                    </Button>
                  )}
                  {!selectedRivalData.hasAlliance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                      onClick={() => initiateDiplomacy(selectedRivalData.id, 'alliance')}
                      disabled={selectedRivalData.relationship < 30}
                    >
                      <Handshake className="w-4 h-4" />
                      Alliance {selectedRivalData.relationship < 30 && '(+30)'}
                    </Button>
                  )}
                  {!selectedRivalData.hasAlliance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-neon-red/30 text-neon-red hover:bg-neon-red/10"
                      onClick={() => initiateDiplomacy(selectedRivalData.id, 'turfWar')}
                    >
                      <Swords className="w-4 h-4" />
                      Turf War
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
                  Click a territory marker on the map
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick List */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-display text-sm font-semibold mb-3 text-muted-foreground">All Territories</h4>
            <div className="space-y-2">
              {rivals.map((rival, index) => (
                <div 
                  key={rival.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                    selectedRival === rival.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                  )}
                  onClick={() => setSelectedRival(selectedRival === rival.id ? null : rival.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GANG_COLORS[`rival-${index + 1}`] }} />
                    <span className="text-sm">{rival.name}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    rival.relationship > 0 ? 'text-neon-green' : rival.relationship < 0 ? 'text-neon-red' : 'text-muted-foreground'
                  )}>
                    {rival.relationship > 0 ? '+' : ''}{rival.relationship}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Diplomacy Modal */}
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
                {activeDiplomacy.action === 'trade' && `Establish trade with ${activeRival.name} for $1,000.`}
                {activeDiplomacy.action === 'alliance' && `Form a defense pact with ${activeRival.name}.`}
                {activeDiplomacy.action === 'turfWar' && `Declare war on ${activeRival.name}.`}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={cancelDiplomacy}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  variant={activeDiplomacy.action === 'turfWar' ? 'danger' : 'cyber'}
                  className="flex-1"
                  onClick={confirmDiplomacy}
                  disabled={!canConfirmDiplomacy()}
                >
                  <Check className="w-4 h-4 mr-1" /> Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};