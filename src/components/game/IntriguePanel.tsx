"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  AlertTriangle, 
  Users, 
  Target,
  Clock,
  ShieldAlert,
  Skull,
  DollarSign,
  Crown
} from 'lucide-react';
import type { Scheme, PersonalAmbition } from '@/types/intrigue';

interface IntriguePanelProps {
  schemes: Scheme[];
  ambitions: Record<string, PersonalAmbition[]>;
  rumors: string[];
  onInvestigateScheme: (schemeId: string) => void;
}

const SCHEME_ICONS: Record<string, React.ElementType> = {
  coup: Crown,
  assassination: Skull,
  embezzlement: DollarSign,
  defection: Users,
  framing: Target,
  alliance: Users,
  blackmail: Eye,
  sabotage: AlertTriangle,
};

export const IntriguePanel = ({ schemes, ambitions, rumors, onInvestigateScheme }: IntriguePanelProps) => {
  const { officers, intel } = useGameStore();
  
  const discoveredSchemes = schemes.filter(s => s.evidence >= 50);
  const suspiciousSchemes = schemes.filter(s => s.evidence >= 20 && s.evidence < 50);
  
  // Get officers with concerning ambitions
  const concerningOfficers = Object.entries(ambitions)
    .filter(([_, ambs]) => ambs.some(a => a.urgency > 50))
    .map(([officerId, ambs]) => ({
      officer: officers.find(o => o.id === officerId),
      ambitions: ambs.filter(a => a.urgency > 50)
    }))
    .filter(item => item.officer);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-neon-purple" />
          <h3 className="font-display text-lg font-bold text-foreground">Intrigue</h3>
        </div>
        <Badge variant="outline" className="text-neon-purple border-neon-purple/50">
          <Eye className="w-3 h-3 mr-1" />
          Intel: {intel}
        </Badge>
      </div>

      {/* Rumors */}
      {rumors.length > 0 && (
        <Card className="bg-neon-amber/10 border-neon-amber/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-neon-amber" />
            <span className="text-sm font-medium text-neon-amber">Rumors</span>
          </div>
          <div className="space-y-1">
            {rumors.slice(-3).map((rumor, i) => (
              <p key={i} className="text-xs text-muted-foreground italic">
                "{rumor}"
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Discovered Schemes */}
      {discoveredSchemes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neon-red flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Active Conspiracies
          </h4>
          {discoveredSchemes.map(scheme => {
            const mastermind = officers.find(o => o.id === scheme.mastermindId);
            const Icon = SCHEME_ICONS[scheme.type] || AlertTriangle;
            
            return (
              <Card key={scheme.id} className="bg-neon-red/10 border-neon-red/30 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-neon-red" />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {scheme.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Led by {mastermind?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-neon-red/20 text-neon-red border-neon-red/50 text-xs">
                    {scheme.phase}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-neon-red">{scheme.progress}%</span>
                  </div>
                  <Progress value={scheme.progress} className="h-1.5" />
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="w-full mt-2 text-xs"
                  onClick={() => onInvestigateScheme(scheme.id)}
                >
                  Take Action
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Suspicious Activity */}
      {suspiciousSchemes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neon-amber flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Suspicious Activity
          </h4>
          {suspiciousSchemes.map(scheme => {
            const mastermind = officers.find(o => o.id === scheme.mastermindId);
            
            return (
              <Card key={scheme.id} className="bg-neon-amber/10 border-neon-amber/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">
                    Something is happening around <span className="font-medium">{mastermind?.name}</span>
                  </p>
                  <Badge variant="outline" className="text-xs text-neon-amber border-neon-amber/50">
                    {scheme.evidence}% evidence
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2 text-xs"
                  onClick={() => onInvestigateScheme(scheme.id)}
                  disabled={intel < 10}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Investigate (10 Intel)
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Concerning Officers */}
      {concerningOfficers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <Users className="w-4 h-4" />
            Officers to Watch
          </h4>
          {concerningOfficers.map(({ officer, ambitions: ambs }) => (
            <Card key={officer!.id} className="bg-secondary/30 border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{officer!.name}</p>
                  <p className="text-xs text-muted-foreground">{officer!.rank}</p>
                </div>
                <div className="flex gap-1">
                  {ambs.map(amb => (
                    <Badge key={amb.id} variant="secondary" className="text-xs capitalize">
                      {amb.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {discoveredSchemes.length === 0 && suspiciousSchemes.length === 0 && rumors.length === 0 && (
        <Card className="bg-secondary/20 border-border p-6 text-center">
          <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No suspicious activity detected
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Higher Intel helps uncover plots earlier
          </p>
        </Card>
      )}
    </div>
  );
};
