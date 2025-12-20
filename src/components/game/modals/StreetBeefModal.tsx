import { useGameStore, Officer } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Scale, UserMinus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StreetBeefData {
  officer1Id: string;
  officer1Name: string;
  officer2Id: string;
  officer2Name: string;
  reason: string;
}

export const StreetBeefModal = () => {
  const { activeEvent, eventData, handleStreetBeefChoice, officers, influence } = useGameStore();
  const [showFireOptions, setShowFireOptions] = useState(false);

  if (activeEvent !== 'streetBeef') return null;
  
  const data: StreetBeefData = eventData;
  const officer1 = officers.find(o => o.id === data.officer1Id);
  const officer2 = officers.find(o => o.id === data.officer2Id);

  if (!officer1 || !officer2) return null;

  const canTalk = influence >= 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2 border-neon-amber/50 neon-glow-amber"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-neon-amber/20 border border-neon-amber/50">
              <Users className="w-8 h-8 text-neon-amber" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold neon-text-amber">STREET BEEF</h2>
              <p className="text-muted-foreground">Internal conflict erupts</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-foreground leading-relaxed mb-4">
              <span className="text-neon-cyan font-semibold">{data.officer1Name}</span> and{' '}
              <span className="text-neon-magenta font-semibold">{data.officer2Name}</span> have been at each other's 
              throats for days. Their infighting is damaging operations.
            </p>
            <div className="p-3 rounded bg-destructive/20 border border-destructive/30">
              <p className="text-sm text-destructive">
                <strong>Consequences:</strong> All building revenue reduced by 15% while this conflict remains unresolved. 
                Both officers lose loyalty daily.
              </p>
            </div>
          </div>

          {/* Officer Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-secondary/50 border border-neon-cyan/30">
              <p className="font-semibold text-neon-cyan">{officer1.name}</p>
              <p className="text-xs text-muted-foreground">{officer1.rank}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Dislikes: {officer1.dislikes.join(', ')}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-neon-magenta/30">
              <p className="font-semibold text-neon-magenta">{officer2.name}</p>
              <p className="text-xs text-muted-foreground">{officer2.rank}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Dislikes: {officer2.dislikes.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Choices */}
          {!showFireOptions ? (
            <div className="space-y-3">
              {/* Talk */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
                disabled={!canTalk}
                onClick={() => handleStreetBeefChoice('talk')}
              >
                <div className="p-2 rounded bg-neon-cyan/20">
                  <MessageCircle className="w-5 h-5 text-neon-cyan" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Mediate the Conflict</p>
                  <p className="text-xs text-muted-foreground">
                    Cost: 5 Influence • Both officers gain +5 Loyalty
                  </p>
                </div>
              </Button>

              {/* Council */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 border-neon-amber/30 hover:border-neon-amber/60 hover:bg-neon-amber/10"
                onClick={() => handleStreetBeefChoice('council')}
              >
                <div className="p-2 rounded bg-neon-amber/20">
                  <Scale className="w-5 h-5 text-neon-amber" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Call Family Council</p>
                  <p className="text-xs text-muted-foreground">
                    Let the council judge this matter formally
                  </p>
                </div>
              </Button>

              {/* Fire */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
                onClick={() => setShowFireOptions(true)}
              >
                <div className="p-2 rounded bg-neon-red/20">
                  <UserMinus className="w-5 h-5 text-neon-red" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Fire One Officer</p>
                  <p className="text-xs text-muted-foreground">
                    Remove one from the organization permanently
                  </p>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">Choose which officer to remove:</p>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
                onClick={() => handleStreetBeefChoice('fire', data.officer1Id)}
              >
                <div className="p-2 rounded bg-neon-red/20">
                  <UserMinus className="w-5 h-5 text-neon-red" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Fire {officer1.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {officer2.name} loses 10 Loyalty from witnessing this
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 border-neon-red/30 hover:border-neon-red/60 hover:bg-neon-red/10"
                onClick={() => handleStreetBeefChoice('fire', data.officer2Id)}
              >
                <div className="p-2 rounded bg-neon-red/20">
                  <UserMinus className="w-5 h-5 text-neon-red" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Fire {officer2.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {officer1.name} loses 10 Loyalty from witnessing this
                  </p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowFireOptions(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {!canTalk && !showFireOptions && (
            <p className="mt-4 text-xs text-neon-amber text-center">
              Not enough Influence to mediate (need 5).
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};