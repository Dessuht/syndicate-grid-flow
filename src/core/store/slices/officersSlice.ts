import { create } from 'zustand';
import { Officer, OfficerRank, OfficerSkills } from '../types';

interface OfficersState {
  officers: Officer[];
  selectedOfficerId: string | null;
}

interface OfficersActions {
  // Basic officer management
  assignOfficer: (officerId: string, buildingId: string) => void;
  unassignOfficer: (officerId: string) => void;
  
  // Officer interactions
  shareTea: (officerId: string) => void;
  giveBonus: (officerId: string) => void;
  reprimandOfficer: (officerId: string) => void;
  promoteOfficer: (officerId: string, newRank: OfficerRank) => void;
  designateSuccessor: (officerId: string) => void;
  
  // Officer status
  healOfficer: (officerId: string) => void;
  releaseOfficer: (officerId: string) => void;
  processRecovery: () => void;
  
  // Selection
  selectOfficer: (officerId: string | null) => void;
}

export type OfficersSlice = OfficersState & OfficersActions;

export const createOfficersSlice = (set: any, get: any) => ({
  officers: [],
  selectedOfficerId: null,
  
  // Actions
  assignOfficer: (officerId: string, buildingId: string) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      const building = (state as any).buildings?.find((b: any) => b.id === buildingId);
      
      if (!officer || !building || building.isOccupied || officer.assignedBuildingId) {
        return state;
      }

      return {
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? { ...o, assignedBuildingId: buildingId, daysIdle: 0 }
            : o
        ),
        buildings: (state as any).buildings?.map((b: any) =>
          b.id === buildingId
            ? { ...b, isOccupied: true, assignedOfficerId: officerId }
            : b
        ),
      };
    });
  },

  unassignOfficer: (officerId: string) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      if (!officer || !officer.assignedBuildingId) return state;

      const buildingId = officer.assignedBuildingId;
      return {
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? { ...o, assignedBuildingId: null, daysAssigned: 0 }
            : o
        ),
        buildings: (state as any).buildings?.map((b: any) =>
          b.id === buildingId
            ? { ...b, isOccupied: false, assignedOfficerId: null }
            : b
        ),
      };
    });
  },

  shareTea: (officerId: string) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      if (!officer) return state;

      // Increase Loyalty (+5)
      const newLoyalty = Math.min(100, officer.loyalty + 5);

      // Reveal Agenda (if null)
      let newAgenda = officer.currentAgenda;
      if (!newAgenda) {
        const AGENDAS = [
          'Wants to own a Noodle Shop',
          'Wants to own a Nightclub',
          'Wants a higher rank',
          'Wants to reduce police heat',
          'Wants a trade agreement with Sun Yee On',
        ];
        newAgenda = AGENDAS[Math.floor(Math.random() * AGENDAS.length)];
      }

      // Spend time (modelled as energy cost)
      const newEnergy = Math.max(0, officer.energy - 10);

      return {
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? { ...o, loyalty: newLoyalty, currentAgenda: newAgenda, energy: newEnergy }
            : o
        ),
      };
    });
  },

  giveBonus: (officerId: string) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      const cost = 1000;
      if (!officer || (state as any).cash < cost) return state;

      // Spend $1,000 Cash
      // Boost Loyalty (+20)
      const newLoyalty = Math.min(100, officer.loyalty + 20);

      // Lower 'Hunger' for promotion (clear agenda if promotion/building related)
      let newAgenda = officer.currentAgenda;
      if (newAgenda && (newAgenda.includes('rank') || newAgenda.includes('own'))) {
        newAgenda = null;
      }

      return {
        cash: (state as any).cash - cost,
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? { ...o, loyalty: newLoyalty, currentAgenda: newAgenda }
            : o
        ),
      };
    });
  },

  reprimandOfficer: (officerId: string) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      if (!officer) return state;

      // 1. Lower District Heat (-10)
      const newHeat = Math.max(0, (state as any).policeHeat - 10);

      // 2. Significantly lower Loyalty (-20)
      const newLoyalty = Math.max(0, officer.loyalty - 20);
      
      let updates: any = {
        policeHeat: newHeat,
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? { ...o, loyalty: newLoyalty }
            : o
        ),
      };

      // 3. Risk of Snitching/Quitting if Loyalty is low (< 20)
      if (newLoyalty < 20 && Math.random() < 0.3) {
        if (Math.random() < 0.5) {
          // Snitch: Increase global heat, officer arrested
          updates.policeHeat = Math.min(100, (state as any).policeHeat + 10);
          updates.officers = (state as any).officers?.map((o: any) =>
            o.id === officerId
              ? { ...o, loyalty: newLoyalty, status: { ...o.status, isArrested: true }, assignedBuildingId: null, energy: 0 }
              : o
          );
          updates.pendingEvents = [...((state as any).pendingEvents || []), {
            type: 'criminalCaught',
            data: { criminalName: officer.name, crime: 'snitching' }
          }];
        } else {
          // Quit: Officer removed
          updates.officers = (state as any).officers?.filter((o: any) => o.id !== officerId);
          updates.buildings = (state as any).buildings?.map((b: any) =>
            b.assignedOfficerId === officerId
              ? { ...b, isOccupied: false, assignedOfficerId: null }
              : b
          );
        }
      }

      return { ...state, ...updates };
    });
  },

  promoteOfficer: (officerId: string, newRank: OfficerRank) => {
    set((state: any) => {
      const officer = (state as any).officers?.find((o: any) => o.id === officerId);
      const cost = 5000; // PROMOTION_COST
      const requiredFace = 50; // PROMOTION_FACE_REQUIREMENT

      if (!officer || (state as any).cash < cost || officer.face < requiredFace) return state;
      if (officer.rank === newRank) return state;

      // Determine skill boost based on new rank
      let skillBoost: Partial<OfficerSkills> = {};
      let maxEnergyBoost = 0;
      let loyaltyBoost = 0;

      switch (newRank) {
        case 'Deputy (438)':
          skillBoost = { diplomacy: 15, logistics: 15 };
          maxEnergyBoost = 20;
          loyaltyBoost = 10;
          break;
        case 'Dragonhead (489)':
          skillBoost = { enforcement: 20, recruitment: 20 };
          maxEnergyBoost = 30;
          loyaltyBoost = 20;
          break;
        default:
          return state;
      }

      return {
        cash: (state as any).cash - cost,
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId
            ? {
                ...o,
                rank: newRank,
                face: 0, // Reset face after promotion
                loyalty: Math.min(100, o.loyalty + loyaltyBoost),
                maxEnergy: o.maxEnergy + maxEnergyBoost,
                energy: o.energy + maxEnergyBoost,
                skills: {
                  enforcement: Math.min(100, o.skills.enforcement + (skillBoost.enforcement || 0)),
                  diplomacy: Math.min(100, o.skills.diplomacy + (skillBoost.diplomacy || 0)),
                  logistics: Math.min(100, o.skills.logistics + (skillBoost.logistics || 0)),
                  recruitment: Math.min(100, o.skills.recruitment + (skillBoost.recruitment || 0)),
                }
              }
            : o
        ),
        reputation: (state as any).reputation + 10, // Reputation gain for successful ceremony
      };
    });
  },

  designateSuccessor: (officerId: string) => {
    set((state: any) => ({
      officers: (state as any).officers?.map((o: any) => ({
        ...o,
        isSuccessor: o.id === officerId,
      })),
    }));
  },

  healOfficer: (officerId: string) => {
    set((state: any) => {
      if ((state as any).cash < 2000) return state;
      
      return {
        cash: (state as any).cash - 2000,
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId && o.status?.isWounded
            ? { ...o, status: { ...o.status, isWounded: false, daysToRecovery: 0 } }
            : o
        ),
      };
    });
  },

  releaseOfficer: (officerId: string) => {
    set((state: any) => {
      // Check if we have enough intel or cash
      if ((state as any).intel < 50 && (state as any).cash < 5000) return state;
      
      return {
        intel: (state as any).intel >= 50 ? (state as any).intel - 50 : (state as any).intel,
        cash: (state as any).cash >= 5000 ? (state as any).cash - 5000 : (state as any).cash,
        officers: (state as any).officers?.map((o: any) =>
          o.id === officerId && o.status?.isArrested
            ? { ...o, status: { ...o.status, isArrested: false } }
            : o
        ),
      };
    });
  },

  processRecovery: () => {
    set((state: any) => {
      const updatedOfficers = (state as any).officers?.map((o: any) => {
        if (o.status?.isWounded && o.status.daysToRecovery > 0) {
          const newDaysToRecovery = o.status.daysToRecovery - 1;
          // If recovery is complete, heal the officer
          if (newDaysToRecovery === 0) {
            return { ...o, status: { ...o.status, isWounded: false, daysToRecovery: 0 } };
          }
          return { ...o, status: { ...o.status, daysToRecovery: newDaysToRecovery } };
        }
        return o;
      });
      
      return { officers: updatedOfficers };
    });
  },

  selectOfficer: (officerId: string | null) => {
    set({ selectedOfficerId: officerId });
  },
});