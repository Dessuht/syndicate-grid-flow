import { useGameStore } from '@/stores/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Heart, 
  TrendingUp,
  Lock,
  CheckCircle
} from 'lucide-react';

export const UpgradesPanel = () => {
  const { 
    cash, 
    intel, 
    policeHeat, 
    unlockedUpgrades, 
    purchaseUpgrade 
  } = useGameStore();

  const UPGRADES = [
    {
      id: 'betterIntel',
      name: 'Enhanced Intelligence',
      description: 'Permanently increases intel gathering capabilities',
      icon: Zap,
      cost: 2000,
      effect: '+25 Intel immediately',
      color: 'text-neon-purple'
    },
    {
      id: 'reducedHeat',
      name: 'Heat Reduction',
      description: 'Reduces current police heat level',
      icon: Shield,
      cost: 3000,
      effect: '-10 Police Heat',
      color: 'text-neon-cyan'
    },
    {
      id: 'loyaltyBoost',
      name: 'Loyalty Program',
      description: 'Increases loyalty of all officers',
      icon: Heart,
      cost: 1500,
      effect: '+15 Loyalty to all officers',
      color: 'text-neon-green'
    },
    {
      id: 'revenueBonus',
      name: 'Revenue Enhancement',
      description: 'Permanently increases building revenue',
      icon: TrendingUp,
      cost: 2500,
      effect: '+20% Building Revenue',
      color: 'text-neon-amber'
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <Zap className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Upgrades</h3>
            <p className="text-xs text-muted-foreground">Permanent improvements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {UPGRADES.map((upgrade) => {
            const Icon = upgrade.icon;
            const isUnlocked = unlockedUpgrades.includes(upgrade.id);
            const canAfford = cash >= upgrade.cost;

            return (
              <Card 
                key={upgrade.id}
                className={`
                  p-4 border transition-all duration-200
                  ${isUnlocked 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : canAfford 
                      ? 'bg-slate-700/50 border-slate-600 hover:border-neon-purple/50 hover:bg-slate-700/70 cursor-pointer'
                      : 'bg-slate-800/30 border-slate-700 opacity-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg border
                    ${isUnlocked 
                      ? 'bg-green-800/30 border-green-600/50' 
                      : `bg-${upgrade.color.split('-')[1]}-900/20 border-${upgrade.color.split('-')[1]}-700/30`
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${isUnlocked ? 'text-green-400' : upgrade.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">{upgrade.name}</h4>
                      {isUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : !canAfford ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : null}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {upgrade.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isUnlocked ? 'text-green-400' : upgrade.color}`}>
                        {upgrade.effect}
                      </span>
                      
                      {!isUnlocked && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neon-green">
                            ${upgrade.cost.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant={canAfford ? "cyber" : "outline"}
                            onClick={() => canAfford && purchaseUpgrade(upgrade.id)}
                            disabled={!canAfford}
                            className="text-xs h-6 px-2"
                          >
                            Purchase
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {unlockedUpgrades.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {unlockedUpgrades.length} / {UPGRADES.length} Unlocked
              </Badge>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-2 rounded-full transition-all duration-300"
                style={{ width: `${(unlockedUpgrades.length / UPGRADES.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};