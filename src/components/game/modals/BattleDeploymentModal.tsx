import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Swords, Shield, Target, Users, Crown, Zap, 
  AlertTriangle, CheckCircle2, XCircle, Skull,
  ArrowRight, Crosshair, HandCoins, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleDeploymentModalProps {
  rivalId: string;
  onClose: () => void;
}

type BattleTactic = 'aggressive' | 'defensive' | 'guerrilla' | 'overwhelming';

const TACTICS: { id: BattleTactic; name: string; icon: any; description: string; strengthMod: number; casualtyMod: number }[] = [
  { id: 'aggressive', name: 'Aggressive Assault', icon: Swords, description: '+20% strength, +30% casualties', strengthMod: 1.2, casualtyMod: 1.3 },
  { id: 'defensive', name: 'Defensive Hold', icon: Shield, description: '-10% strength, -40% casualties', strengthMod: 0.9, casualtyMod: 0.6 },
  { id: 'guerrilla', name: 'Guerrilla Tactics', icon: Target, description: 'Normal strength, -20% casualties', strengthMod: 1.0, casualtyMod: 0.8 },
  { id: 'overwhelming', name: 'Overwhelming Force', icon: Crown, description: '+40% strength if 2x enemy, +50% casualties', strengthMod: 1.4, casualtyMod: 1.5 },
];

export const BattleDeploymentModal = ({ rivalId, onClose }: BattleDeploymentModalProps) => {
  const { 
    officers, soldiers, rivals, cash,
    launchBattle, negotiatePeace
  } = useGameStore();
  
  const rival = rivals.find(r => r.id === rivalId);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [soldiersDeployed, setSoldiersDeployed] = useState(Math.floor(soldiers.length / 2));
  const [selectedTactic, setSelectedTactic] = useState<BattleTactic>('guerrilla');
  const [battlePhase, setBattlePhase] = useState<'deploy' | 'battle' | 'result'>('deploy');
  const [battleResult, setBattleResult] = useState<any>(null);

  if (!rival) return null;

  const availableOfficers = officers.filter(o => !o.isWounded && !o.isArrested);
  const availableSoldiers = soldiers.filter(s => s.loyalty > 20);
  const loyalSoldiers = soldiers.filter(s => s.loyalty > 30);
  
  const tactic = TACTICS.find(t => t.id === selectedTactic)!;
  
  // Calculate our deployed strength
  const deployedSoldierStrength = loyalSoldiers
    .slice(0, soldiersDeployed)
    .reduce((sum, s) => sum + s.skill, 0);
  
  const officerStrength = selectedOfficerIds.reduce((sum, id) => {
    const officer = officers.find(o => o.id === id);
    if (!officer) return sum;
    return sum + officer.skills.enforcement + (officer.rank === 'Red Pole' ? 20 : 0);
  }, 0);
  
  const baseStrength = deployedSoldierStrength + officerStrength;
  const tacticalStrength = Math.floor(baseStrength * tactic.strengthMod);
  
  // Overwhelming force bonus
  const hasOverwhelmingForce = tacticalStrength > rival.strength * 2;
  const finalStrength = selectedTactic === 'overwhelming' && hasOverwhelmingForce 
    ? tacticalStrength 
    : selectedTactic === 'overwhelming' 
      ? Math.floor(baseStrength * 1.1) // Reduced bonus if not overwhelming
      : tacticalStrength;
  
  const winChance = Math.min(95, Math.max(5, Math.floor((finalStrength / (finalStrength + rival.strength)) * 100)));
  
  const toggleOfficer = (officerId: string) => {
    setSelectedOfficerIds(prev => 
      prev.includes(officerId) 
        ? prev.filter(id => id !== officerId)
        : [...prev, officerId]
    );
  };

  const handleLaunchBattle = () => {
    setBattlePhase('battle');
    
    // Simulate battle with animation delay
    setTimeout(() => {
      const result = launchBattle(rivalId, selectedOfficerIds, soldiersDeployed, selectedTactic);
      setBattleResult(result);
      setBattlePhase('result');
    }, 2000);
  };

  const handleNegotiatePeace = () => {
    negotiatePeace(rivalId);
    onClose();
  };

  const peaceCost = Math.floor(rival.strength * 20);

  if (battlePhase === 'battle') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
        <motion.div 
          className="relative p-8 text-center"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Swords className="w-20 h-20 mx-auto mb-4 text-neon-red animate-pulse" />
          <h2 className="font-display text-3xl font-bold text-neon-red mb-2">BATTLE IN PROGRESS</h2>
          <p className="text-muted-foreground">Your forces clash with {rival.name}...</p>
          <div className="mt-6 flex justify-center gap-4">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-neon-cyan font-bold"
            >
              ⚔️ {finalStrength}
            </motion.div>
            <span className="text-muted-foreground">vs</span>
            <motion.div
              animate={{ x: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-neon-red font-bold"
            >
              {rival.strength} ⚔️
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (battlePhase === 'result' && battleResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-lg mx-4 p-6 rounded-lg bg-card border-2"
          style={{ 
            borderColor: battleResult.victory ? 'hsl(var(--neon-green))' : 'hsl(var(--neon-red))',
            boxShadow: `0 0 30px ${battleResult.victory ? 'hsl(142 100% 50% / 0.3)' : 'hsl(0 100% 50% / 0.3)'}`
          }}
        >
          <div className="text-center mb-6">
            {battleResult.victory ? (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-neon-green" />
                <h2 className="font-display text-2xl font-bold text-neon-green">VICTORY!</h2>
                <p className="text-muted-foreground">You have defeated {rival.name}</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-3 text-neon-red" />
                <h2 className="font-display text-2xl font-bold text-neon-red">DEFEAT</h2>
                <p className="text-muted-foreground">{rival.name} has pushed back your forces</p>
              </>
            )}
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
              <span className="text-sm text-muted-foreground">Soldiers Lost</span>
              <span className={cn("font-bold", battleResult.soldiersLost > 0 ? "text-neon-red" : "text-neon-green")}>
                {battleResult.soldiersLost}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
              <span className="text-sm text-muted-foreground">Reputation</span>
              <span className={cn("font-bold", battleResult.reputationChange > 0 ? "text-neon-green" : "text-neon-red")}>
                {battleResult.reputationChange > 0 ? '+' : ''}{battleResult.reputationChange}
              </span>
            </div>
            {battleResult.cashGained > 0 && (
              <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
                <span className="text-sm text-muted-foreground">Loot Captured</span>
                <span className="font-bold text-neon-amber">+${battleResult.cashGained}</span>
              </div>
            )}
            {battleResult.territoryGained && (
              <div className="flex justify-between items-center p-2 rounded bg-neon-green/10 border border-neon-green/30">
                <span className="text-sm text-neon-green">Territory Claimed!</span>
                <span className="font-bold text-neon-green">+1 District</span>
              </div>
            )}
            {battleResult.officerWounded && (
              <div className="flex justify-between items-center p-2 rounded bg-neon-red/10 border border-neon-red/30">
                <span className="text-sm text-neon-red">Officer Wounded</span>
                <span className="font-bold text-neon-red">{battleResult.officerWounded}</span>
              </div>
            )}
            {battleResult.buildingLost && (
              <div className="flex justify-between items-center p-2 rounded bg-neon-red/10 border border-neon-red/30">
                <span className="text-sm text-neon-red">Building Lost</span>
                <span className="font-bold text-neon-red">{battleResult.buildingLost}</span>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full" 
            onClick={onClose}
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl mx-4 p-6 rounded-lg bg-card border-2 border-neon-red/50 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 0 30px hsl(0 100% 50% / 0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-neon-red/20 border border-neon-red/50">
            <Swords className="w-8 h-8 text-neon-red" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-neon-red">
              WAR: {rival.name}
            </h2>
            <p className="text-muted-foreground text-sm">{rival.district} • Enemy Strength: {rival.strength}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {/* Force Comparison */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Force Comparison</span>
            <span className={cn(
              "text-sm font-bold px-2 py-0.5 rounded",
              winChance >= 60 ? "bg-neon-green/20 text-neon-green" :
              winChance >= 40 ? "bg-neon-amber/20 text-neon-amber" :
              "bg-neon-red/20 text-neon-red"
            )}>
              {winChance}% Win Chance
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your Forces</p>
              <p className="text-2xl font-bold text-neon-cyan">{finalStrength}</p>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="text-neon-cyan">{soldiersDeployed} soldiers</span>
                {selectedOfficerIds.length > 0 && (
                  <span> • {selectedOfficerIds.length} officers</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Enemy Forces</p>
              <p className="text-2xl font-bold text-neon-red">{rival.strength}</p>
              <p className="text-xs text-muted-foreground mt-1">{rival.name}</p>
            </div>
          </div>
          <Progress 
            value={winChance} 
            className="h-2 mt-3"
          />
        </div>

        {/* Soldier Deployment */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-neon-cyan" />
              Deploy Soldiers
            </label>
            <span className="text-sm text-muted-foreground">
              {soldiersDeployed} / {loyalSoldiers.length} available
            </span>
          </div>
          <Slider
            value={[soldiersDeployed]}
            onValueChange={([val]) => setSoldiersDeployed(val)}
            max={loyalSoldiers.length}
            min={0}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Higher deployment = more strength, but more potential casualties
          </p>
        </div>

        {/* Officer Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-neon-amber" />
            Assign Officers to Battle
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableOfficers.map(officer => (
              <button
                key={officer.id}
                onClick={() => toggleOfficer(officer.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  selectedOfficerIds.includes(officer.id)
                    ? "border-neon-amber/60 bg-neon-amber/10"
                    : "border-border bg-secondary/30 hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedOfficerIds.includes(officer.id) && (
                    <CheckCircle2 className="w-4 h-4 text-neon-amber" />
                  )}
                  <span className="font-medium text-sm">{officer.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{officer.rank}</p>
                <p className="text-xs text-neon-cyan mt-1">+{officer.skills.enforcement} enforcement</p>
              </button>
            ))}
          </div>
          {selectedOfficerIds.length > 0 && (
            <p className="text-xs text-neon-amber mt-2">
              ⚠️ Officers in battle risk injury or arrest on defeat
            </p>
          )}
        </div>

        {/* Tactics Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Crosshair className="w-4 h-4 text-neon-purple" />
            Battle Tactics
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TACTICS.map(t => {
              const Icon = t.icon;
              const isSelected = selectedTactic === t.id;
              const isOverwhelming = t.id === 'overwhelming';
              const canUseOverwhelming = hasOverwhelmingForce;
              
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTactic(t.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-neon-purple/60 bg-neon-purple/10"
                      : "border-border bg-secondary/30 hover:border-border/80",
                    isOverwhelming && !canUseOverwhelming && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-4 h-4", isSelected ? "text-neon-purple" : "text-muted-foreground")} />
                    <span className="font-medium text-sm">{t.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  {isOverwhelming && !canUseOverwhelming && (
                    <p className="text-xs text-neon-red mt-1">Need 2x enemy strength</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
            onClick={handleNegotiatePeace}
            disabled={cash < peaceCost}
          >
            <HandCoins className="w-4 h-4" />
            Negotiate Peace (${peaceCost})
          </Button>
          <Button
            className="flex-1 gap-2 bg-neon-red hover:bg-neon-red/80 text-white"
            onClick={handleLaunchBattle}
            disabled={soldiersDeployed === 0 && selectedOfficerIds.length === 0}
          >
            <Swords className="w-4 h-4" />
            Launch Attack
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
