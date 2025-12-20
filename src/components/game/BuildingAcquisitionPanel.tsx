import { useGameStore } from '@/stores/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  DollarSign, 
  Flame, 
  TrendingUp,
  Lock,
  ShoppingCart
} from 'lucide-react';

export const BuildingAcquisitionPanel = () => {
  const { 
    cash, 
    buildings, 
    acquireBuilding 
  } = useGameStore();

  const BUILDING_TYPES = [
    {
      type: 'Noodle Shop' as const,
      name: 'Noodle Shop',
      description: 'Legitimate front business with steady income',
      icon: Building,
      cost: 3000,
      revenue: 500,
      heat: 1,
      color: 'text-neon-green'
    },
    {
      type: 'Mahjong Parlor' as const,
      name: 'Mahjong Parlor',
      description: 'Gambling den with high entertainment value',
      icon: TrendingUp,
      cost: 5000,
      revenue: 800,
      heat: 3,
      color: 'text-neon-amber'
    },
    {
      type: 'Warehouse' as const,
      name: 'Warehouse',
      description: 'Storage facility for illegal operations',
      icon: Building,
      cost: 4000,
      revenue: 400,
      heat: 2,
      color: 'text-neon-cyan'
    },
    {
      type: 'Nightclub' as const,
      name: 'Nightclub',
      description: 'High-end entertainment venue',
      icon: TrendingUp,
      cost: 6000,
      revenue: 600,
      heat: 4,
      color: 'text-neon-purple'
    },
    {
      type: 'Counterfeit Lab' as const,
      name: 'Counterfeit Lab',
      description: 'Illegal money printing operation',
      icon: DollarSign,
      cost: 8000,
      revenue: 1200,
      heat: 5,
      color: 'text-neon-red'
    },
    {
      type: 'Drug Lab' as const,
      name: 'Drug Lab',
      description: 'High-risk, high-reward narcotics operation',
      icon: Flame,
      cost: 10000,
      revenue: 1500,
      heat: 6,
      color: 'text-neon-orange'
    }
  ];

  const getBuildingCount = (type: string) => {
    return buildings.filter(b => b.type === type).length;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Building className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Acquire Buildings</h3>
            <p className="text-xs text-muted-foreground">Expand your operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {BUILDING_TYPES.map((buildingType) => {
            const Icon = buildingType.icon;
            const count = getBuildingCount(buildingType.type);
            const canAfford = cash >= buildingType.cost;

            return (
              <Card 
                key={buildingType.type}
                className={`
                  p-4 border transition-all duration-200
                  ${canAfford 
                    ? 'bg-slate-700/50 border-slate-600 hover:border-neon-cyan/50 hover:bg-slate-700/70 cursor-pointer' 
                    : 'bg-slate-800/30 border-slate-700 opacity-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg border
                    ${canAfford 
                      ? 'bg-neon-cyan/10 border-neon-cyan/30' 
                      : 'bg-slate-700/30 border-slate-600'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${canAfford ? 'text-neon-cyan' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">{buildingType.name}</h4>
                      {count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {count} owned
                        </Badge>
                      )}
                      {!canAfford && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {buildingType.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className="text-sm font-bold text-neon-green">
                          ${buildingType.revenue}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Heat</div>
                        <div className="text-sm font-bold text-neon-red">
                          {buildingType.heat}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Cost</div>
                        <div className="text-sm font-bold text-neon-cyan">
                          ${buildingType.cost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {canAfford && (
                      <Button
                        size="sm"
                        variant="cyber"
                        onClick={() => acquireBuilding(buildingType.type)}
                        className="w-full text-xs"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Acquire Building
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available Funds</span>
            <span className="font-bold text-neon-green">${cash.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};