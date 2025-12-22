import { useGameStore } from '../hooks/useGameStore';
import type { Officer, Building, DayPhase } from '../store/types';

export class GameEngine {
  private store = useGameStore();

  // Phase advancement logic
  advancePhase() {
    const { currentPhase, getCurrentDay, getBuildings, getOfficers, setPhase, setCurrentDay } = this.store;
    
    const phases: DayPhase[] = ['morning', 'day', 'evening', 'night'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextPhase = phases[(currentIndex + 1) % phases.length];
    const nextDay = nextPhase === 'morning' ? getCurrentDay() + 1 : getCurrentDay();
    
    // Process daily revenue and expenses at day transition
    if (currentPhase === 'night' && nextPhase === 'morning') {
      this.processDailyCycle(nextDay);
    }
    
    setPhase(nextPhase);
    setCurrentDay(nextDay);
  }

  // Daily cycle processing
  private processDailyCycle(day: number) {
    const { getBuildings, getOfficers, adjustCash, setReputation, setPoliceHeat } = this.store;
    
    const buildings = getBuildings();
    const officers = getOfficers();
    
    // Calculate daily revenue from occupied buildings
    const dailyRevenue = buildings
      .filter(b => b.isOccupied && !b.inactiveUntilDay)
      .reduce((sum, b) => sum + b.baseRevenue, 0);
    
    // Calculate daily expenses
    const stipendCost = 100; // TODO: Get from store
    const totalExpenses = stipendCost;
    
    // Apply changes
    adjustCash(dailyRevenue - totalExpenses);
    
    // Random events
    this.generateRandomEvent();
  }

  // Random event generation
  private generateRandomEvent() {
    const { triggerEvent } = this.store;
    const random = Math.random();
    
    if (random < 0.1) {
      // 10% chance of random event
      const events = [
        {
          id: `event-${Date.now()}`,
          type: 'policeRaid',
          title: 'Police Raid',
          description: 'The police are raiding your operations!',
          isBlocking: true,
          choices: [
            {
              id: 'bribe',
              text: 'Bribe ($2000)',
              description: 'Pay off the police to avoid trouble',
              effects: { cash: -2000, policeHeat: -20 }
            },
            {
              id: 'fight',
              text: 'Stand Your Ground',
              description: 'Fight back against the police raid',
              effects: { reputation: 10, policeHeat: 10 }
            },
            {
              id: 'escape',
              text: 'Escape',
              description: 'Abandon the operation and escape',
              effects: { cash: -500 }
            }
          ],
          data: {}
        }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      triggerEvent(randomEvent);
    }
  }

  // Officer assignment validation
  canAssignOfficer(officerId: string, buildingId: string): boolean {
    const { getOfficerById, getBuildingById } = this.store;
    
    const officer = getOfficerById(officerId);
    const building = getBuildingById(buildingId);
    
    if (!officer || !building) return false;
    if (officer.assignedBuildingId) return false;
    if (building.isOccupied) return false;
    if (officer.isWounded || officer.isArrested) return false;
    
    return true;
  }

  // Building upgrade validation
  canUpgradeBuilding(buildingId: string): boolean {
    const { getBuildingById } = this.store;
    const building = getBuildingById(buildingId);
    
    if (!building) return false;
    if (building.upgraded) return false;
    if (building.isRebelBase) return false;
    
    return true;
  }

  // Calculate total strength
  calculateTotalStrength(): number {
    const { getOfficers, getSoldiers } = this.store;
    
    const officerStrength = getOfficers().reduce((sum, o) => 
      sum + (o.loyalty > 30 ? o.skills.enforcement : 0), 0
    );
    
    const soldierStrength = getSoldiers().reduce((sum, s) => 
      sum + (s.loyalty > 30 ? s.skill : 0), 0
    );
    
    return officerStrength + soldierStrength;
  }
}