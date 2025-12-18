import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, Handshake, Swords, ShoppingCart, X, Check, Users, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Territory locations in Hong Kong (lat, lng)
const TERRITORY_LOCATIONS: Record<string, { coords: [number, number]; label: string }> = {
  'player': { coords: [114.1694, 22.2783], label: 'Wan Chai' }, // Wan Chai
  'rival-1': { coords: [114.1849, 22.3282], label: 'Kowloon City' }, // Kowloon City
  'rival-2': { coords: [114.1694, 22.3193], label: 'Mong Kok' }, // Mong Kok
  'rival-3': { coords: [114.1722, 22.2988], label: 'Tsim Sha Tsui' }, // TST
};

// Gang colors
const GANG_COLORS: Record<string, string> = {
  'player': '#00FFFF', // Cyan - player
  'rival-1': '#FF4444', // Red
  'rival-2': '#4488FF', // Blue
  'rival-3': '#44FF44', // Green
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
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem('mapbox_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [selectedRival, setSelectedRival] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const activeRival = activeDiplomacy ? rivals.find(r => r.id === activeDiplomacy.rivalId) : null;
  const selectedRivalData = selectedRival ? rivals.find(r => r.id === selectedRival) : null;

  // Calculate our military strength
  const ourStrength = soldiers.reduce((sum, s) => sum + (s.loyalty > 30 ? s.skill : 0), 0);

  const saveToken = () => {
    localStorage.setItem('mapbox_token', mapboxToken);
    setShowTokenInput(false);
    setMapError(null);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [114.17, 22.30], // Hong Kong center
        zoom: 11.5,
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        'top-left'
      );

      map.current.on('load', () => {
        addMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Invalid Mapbox token. Please check and try again.');
      });

    } catch (error) {
      console.error('Map init error:', error);
      setMapError('Failed to initialize map. Please check your token.');
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, showTokenInput]);

  // Add territory markers
  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Player territory
    const playerEl = createMarkerElement('player', GANG_COLORS['player'], true);
    const playerMarker = new mapboxgl.Marker({ element: playerEl })
      .setLngLat(TERRITORY_LOCATIONS['player'].coords)
      .addTo(map.current);
    markersRef.current.push(playerMarker);

    // Rival territories
    rivals.forEach((rival, index) => {
      const rivalKey = `rival-${index + 1}` as keyof typeof TERRITORY_LOCATIONS;
      const location = TERRITORY_LOCATIONS[rivalKey];
      if (!location) return;

      const color = rival.hasAlliance 
        ? '#44FF44' 
        : rival.relationship < -20 
          ? '#FF4444' 
          : GANG_COLORS[rivalKey] || '#AA44FF';

      const el = createMarkerElement(rival.id, color, false, rival.name.charAt(0));
      el.addEventListener('click', () => {
        setSelectedRival(selectedRival === rival.id ? null : rival.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(location.coords)
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  };

  const createMarkerElement = (id: string, color: string, isPlayer: boolean, initial?: string) => {
    const el = document.createElement('div');
    el.className = 'territory-marker';
    el.style.cssText = `
      width: ${isPlayer ? '50px' : '40px'};
      height: ${isPlayer ? '50px' : '40px'};
      background: ${color}33;
      border: 3px solid ${color};
      border-radius: 50%;
      cursor: ${isPlayer ? 'default' : 'pointer'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${isPlayer ? '14px' : '12px'};
      color: ${color};
      box-shadow: 0 0 20px ${color}66;
      transition: all 0.2s ease;
    `;
    el.innerHTML = isPlayer ? '★' : (initial || '');
    
    if (!isPlayer) {
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.boxShadow = `0 0 30px ${color}`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 20px ${color}66`;
      });
    }
    
    return el;
  };

  // Update markers when rivals change
  useEffect(() => {
    if (map.current && !showTokenInput) {
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
            <p className="text-sm text-muted-foreground">Intel: {intel} • Our Strength: {ourStrength}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTokenInput(true)}
            title="Map Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
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
        {/* Map Container */}
        <div className="lg:col-span-2 relative rounded-lg overflow-hidden border border-border bg-card">
          {showTokenInput ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card p-6">
              <div className="max-w-md w-full space-y-4">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-neon-purple" />
                  <h3 className="font-display text-lg font-bold mb-2">Mapbox Token Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your Mapbox public token to display the Hong Kong map. 
                    Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-neon-cyan underline">mapbox.com</a>
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="pk.eyJ1Ijoi..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="font-mono text-sm"
                />
                {mapError && (
                  <p className="text-sm text-neon-red">{mapError}</p>
                )}
                <Button 
                  onClick={saveToken} 
                  disabled={!mapboxToken}
                  className="w-full"
                  variant="cyber"
                >
                  Load Map
                </Button>
              </div>
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0" />
          )}
        </div>

        {/* Selected Territory Info */}
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
                  Click a territory marker to view gang details
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Overview */}
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
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: GANG_COLORS[`rival-${index + 1}`] }} 
                    />
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