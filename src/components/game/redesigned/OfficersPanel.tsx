import { useGameStore } from '@/stores/core/gameStore';
import { OfficerSystem } from '@/stores/core/officers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Crown, 
  Sword, 
  Shield, 
  TrendingUp, 
  Star,
  Plus,
  ChevronUp
} from 'lucide-react';

export const OfficersPanel = () => {
  const { 
    officers, 
    resources, 
    recruitOfficer, 
    promoteOfficer,
    getAvailableOfficers
  } = useGameStore();

  const availableOfficers = getAvailableOfficers();

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'boss':
        return Crown;
      case 'underboss':
        return Star;
      case 'captain':
        return Shield;
      case 'lieutenant':
        return ChevronUp;
      default:
        return Sword;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'boss':
        return 'text-purple-500 border-purple-500';
      case 'underboss':
        return 'text-orange-500 border-orange-500';
      case 'captain':
        return 'text-blue-500 border-blue-500';
      case 'lieutenant':
        return 'text-green-500 border-green-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const getLoyaltyColor = (loyalty: number) => {
    if (loyalty >= 75) return 'text-green-500';
    if (loyalty >= 50) return 'text-yellow-500';
    if (loyalty >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const OfficerCard = ({ officer }: { officer: any }) => {
    const RankIcon = getRankIcon(officer.rank);
    const canPromote = OfficerSystem.canPromoteOfficer(officer, resources);
    const satisfaction = OfficerSystem.checkOfficerSatisfaction(officer);

    return (
      <Card className={`p-4 ${!officer.isAvailable ? 'opacity-50' : ''}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border ${getRankColor(officer.rank)}`}>
                <RankIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">{officer.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{officer.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={satisfaction === 'loyal' ? 'default' : 'secondary'}>
                {satisfaction}
              </Badge>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Skills</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Combat</span>
                  <span>{officer.skills.combat}</span>
                </div>
                <Progress value={officer.skills.combat} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Diplomacy</span>
                  <span>{officer.skills.diplomacy}</span>
                </div>
                <Progress value={officer.skills.diplomacy} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Logistics</span>
                  <span>{officer.skills.logistics}</span>
                </div>
                <Progress value={officer.skills.logistics} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Intelligence</span>
                  <span>{officer.skills.intelligence}</span>
                </div>
                <Progress value={officer.skills.intelligence} className="h-1" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Competence: </span>
              <span className="font-medium">{officer.competence}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Loyalty: </span>
              <span className={`font-medium ${getLoyaltyColor(officer.loyalty)}`}>
                {officer.loyalty}%
              </span>
            </div>
          </div>

          {/* Traits */}
          {officer.traits.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Traits</p>
              <div className="flex flex-wrap gap-1">
                {officer.traits.map((trait: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trait.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          {!officer.isAvailable && (
            <div className="text-xs text-center text-muted-foreground">
              Assigned to operation
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => promoteOfficer(officer.id)}
              disabled={!canPromote}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <ChevronUp className="w-3 h-3 mr-1" />
              Promote
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-bold text-lg">Officers</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {officers.length} total
            </Badge>
            <Badge variant="outline">
              {availableOfficers.length} available
            </Badge>
          </div>
        </div>
      </Card>

      {/* Recruit Button */}
      <Button
        onClick={recruitOfficer}
        disabled={resources.cash < 2000}
        className="w-full"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" />
        Recruit Officer ($2,000)
      </Button>

      {/* Officers List */}
      <div className="space-y-3 max-h-[600px] overflow-auto">
        {officers.map((officer) => (
          <OfficerCard key={officer.id} officer={officer} />
        ))}
      </div>
    </div>
  );
};