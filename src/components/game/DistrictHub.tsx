import { useGameStore } from '@/stores/gameStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Users, DollarSign, TrendingUp, Zap, Building } from 'lucide-react';
import { UpgradesPanel } from './UpgradesPanel';
import { BuildingAcquisitionPanel } from './BuildingAcquisitionPanel';

const DiplomacyTab = () => {
  const { rivals } = useGameStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-amber-500">Diplomacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>Manage relationships with rival gangs.</p>
          <p>Use intelligence to scout territories and gather information.</p>
        </div>
      </CardContent>
    </Card>
  );
};

const HomeDistrictTab = () => {
  const { 
    homeDistrictLeaderId,
    syndicateMembers,
    assignSyndicateMember,
    unassignSyndicateMember,
    territoryFriction,
    territoryInfluence,
    cash
  } = useGameStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-500">Home District</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium">Friction Level</div>
              <div className="text-sm text-muted-foreground">{territoryFriction}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium">Influence Level</div>
              <div className="text-sm text-muted-foreground">{territoryInfluence}%</div>
            </div>
          </div>
        </div>
        
        <Progress value={territoryFriction} className="h-2 mt-2" />
        <Progress value={territoryInfluence} className="h-2 mt-2" />
        
        <div className="pt-4 border-t">
          <div className="font-medium mb-2">Assigned Member</div>
          {homeDistrictLeaderId ? (
            <div className="flex items-center justify-between">
              <span>{syndicateMembers.find(m => m.id === homeDistrictLeaderId)?.name || 'None'}</span>
              <Button variant="outline" size="sm" onClick={() => unassignSyndicateMember()}>
                Unassign
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground">No member assigned</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FinancesTab = () => {
  const { cash, homeDistrictRevenue } = useGameStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-yellow-500">Finances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="font-medium">Current Cash</div>
            <div className="text-2xl font-bold text-yellow-500">${cash.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium">District Revenue</div>
            <div className="text-2xl font-bold text-green-500">${homeDistrictRevenue.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DistrictHub = () => {
  const [activeTab, setActiveTab] = useState<'diplomacy' | 'home' | 'finances' | 'upgrades' | 'buildings'>('home');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Button
          variant={activeTab === 'diplomacy' ? 'default' : 'outline'}
          onClick={() => setActiveTab('diplomacy')}
          className="flex-1"
        >
          Diplomacy
        </Button>
        <Button
          variant={activeTab === 'home' ? 'default' : 'outline'}
          onClick={() => setActiveTab('home')}
          className="flex-1"
        >
          Home District
        </Button>
        <Button
          variant={activeTab === 'finances' ? 'default' : 'outline'}
          onClick={() => setActiveTab('finances')}
          className="flex-1"
        >
          Finances
        </Button>
        <Button
          variant={activeTab === 'upgrades' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upgrades')}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-1" />
          Upgrades
        </Button>
        <Button
          variant={activeTab === 'buildings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('buildings')}
          className="flex-1"
        >
          <Building className="w-4 h-4 mr-1" />
          Buildings
        </Button>
      </div>

      <div className="flex-1">
        {activeTab === 'diplomacy' && <DiplomacyTab />}
        {activeTab === 'home' && <HomeDistrictTab />}
        {activeTab === 'finances' && <FinancesTab />}
        {activeTab === 'upgrades' && <UpgradesPanel />}
        {activeTab === 'buildings' && <BuildingAcquisitionPanel />}
      </div>
    </motion.div>
  );
};