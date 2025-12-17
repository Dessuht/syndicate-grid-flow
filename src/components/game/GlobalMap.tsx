import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Globe, Lock, Unlock, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface District {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  intelCost: number;
  unlocked: boolean;
  potentialRevenue: string;
}

const DISTRICTS: District[] = [
  {
    id: 'kowloon',
    name: 'Kowloon Walled City',
    nameZh: '九龍城寨',
    description: 'Your home turf. Dense, chaotic, and full of opportunity.',
    intelCost: 0,
    unlocked: true,
    potentialRevenue: '$2,500/day',
  },
  {
    id: 'mongkok',
    name: 'Mong Kok',
    nameZh: '旺角',
    description: 'The nightlife district. High risk, higher rewards.',
    intelCost: 3000,
    unlocked: false,
    potentialRevenue: '$4,000/day',
  },
  {
    id: 'tsimshatsui',
    name: 'Tsim Sha Tsui',
    nameZh: '尖沙咀',
    description: 'Tourist central. Clean money laundering opportunities.',
    intelCost: 5000,
    unlocked: false,
    potentialRevenue: '$6,500/day',
  },
  {
    id: 'central',
    name: 'Central',
    nameZh: '中環',
    description: 'The financial heart. Corporate connections await.',
    intelCost: 8000,
    unlocked: false,
    potentialRevenue: '$10,000/day',
  },
];

export const GlobalMap = () => {
  const { cash, buyIntel } = useGameStore();

  return (
    <div className="p-6 h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
          <Globe className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'hsl(var(--neon-purple))' }}>
            Hong Kong Territory
          </h2>
          <p className="text-sm text-muted-foreground">Expand your influence across the city</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DISTRICTS.map((district, index) => (
          <motion.div
            key={district.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-6 rounded-lg border transition-all duration-300
              ${district.unlocked 
                ? 'bg-card border-neon-green/30 hover:border-neon-green/50' 
                : 'bg-card/50 border-border hover:border-neon-purple/30'}
            `}
          >
            {/* Lock/Unlock Icon */}
            <div className={`
              absolute top-4 right-4 p-2 rounded-full
              ${district.unlocked ? 'bg-neon-green/20' : 'bg-secondary'}
            `}>
              {district.unlocked 
                ? <Unlock className="w-4 h-4 text-neon-green" />
                : <Lock className="w-4 h-4 text-muted-foreground" />
              }
            </div>

            {/* District Info */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`
                p-2 rounded-lg border
                ${district.unlocked 
                  ? 'bg-neon-green/10 border-neon-green/30' 
                  : 'bg-secondary border-border'}
              `}>
                <MapPin className={`w-5 h-5 ${district.unlocked ? 'text-neon-green' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{district.name}</h3>
                <p className="text-lg text-muted-foreground/70">{district.nameZh}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{district.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-neon-amber" />
                <span className="text-sm text-neon-amber">{district.potentialRevenue}</span>
              </div>
            </div>

            {/* Action */}
            {!district.unlocked && (
              <Button
                variant="outline"
                className="w-full border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple/50"
                disabled={cash < district.intelCost}
                onClick={() => buyIntel(district.id)}
              >
                Buy Intel (${district.intelCost.toLocaleString()})
              </Button>
            )}

            {district.unlocked && district.id === 'kowloon' && (
              <div className="px-4 py-2 rounded bg-neon-green/10 border border-neon-green/30 text-center">
                <span className="text-sm text-neon-green font-medium">Active Territory</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-lg bg-secondary/30 border border-border text-center"
      >
        <p className="text-sm text-muted-foreground">
          Territory expansion coming soon. Buy intel to unlock new building types and opportunities.
        </p>
      </motion.div>
    </div>
  );
};
