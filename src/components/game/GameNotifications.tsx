"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  AlertTriangle, 
  Shield, 
  Swords, 
  Users, 
  TrendingUp,
  Moon,
  Sun,
  Coffee,
  Sunset
} from 'lucide-react';

export const GameNotifications = () => {
  const { 
    currentPhase, 
    currentDay, 
    cash, 
    policeHeat, 
    soldiers, 
    officers,
    buildings,
    isCivilWarActive
  } = useGameStore();
  
  const prevPhaseRef = useRef(currentPhase);
  const prevDayRef = useRef(currentDay);
  const prevCashRef = useRef(cash);
  const prevHeatRef = useRef(policeHeat);

  // Phase change notifications
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      const phaseMessages = {
        morning: { icon: '☕', message: 'Morning - Assign your officers to buildings' },
        day: { icon: '☀️', message: 'Day - Operations are running' },
        evening: { icon: '🌅', message: 'Evening - Soldiers collect their pay' },
        night: { icon: '🌙', message: 'Night - Events may unfold...' },
      };
      
      const { icon, message } = phaseMessages[currentPhase];
      toast(message, { icon });
      
      prevPhaseRef.current = currentPhase;
    }
  }, [currentPhase]);

  // New day notification with summary
  useEffect(() => {
    if (prevDayRef.current !== currentDay && currentDay > 1) {
      const occupiedBuildings = buildings.filter(b => b.isOccupied && !b.inactiveUntilDay);
      const dailyRevenue = occupiedBuildings.reduce((sum, b) => sum + b.baseRevenue, 0);
      const dailyCost = soldiers.length * useGameStore.getState().stipend;
      const netIncome = dailyRevenue - dailyCost;
      
      toast.success(
        `Day ${currentDay} begins!\n💰 Expected: $${netIncome > 0 ? '+' : ''}${netIncome}`,
        { duration: 4000 }
      );
      
      prevDayRef.current = currentDay;
    }
  }, [currentDay, buildings, soldiers]);

  // Heat warning
  useEffect(() => {
    if (policeHeat > 70 && prevHeatRef.current <= 70) {
      toast.error('⚠️ Police Heat Critical! Expect a raid soon!', { duration: 5000 });
    } else if (policeHeat > 50 && prevHeatRef.current <= 50) {
      toast('🚨 Police are watching your operations...', { 
        icon: '👮',
        duration: 4000 
      });
    }
    prevHeatRef.current = policeHeat;
  }, [policeHeat]);

  // Civil war notification
  useEffect(() => {
    if (isCivilWarActive) {
      toast.error('⚔️ CIVIL WAR! An officer has rebelled!', { duration: 6000 });
    }
  }, [isCivilWarActive]);

  // Low loyalty warning
  useEffect(() => {
    const lowLoyaltyOfficers = officers.filter(o => o.loyalty < 30);
    if (lowLoyaltyOfficers.length > 0) {
      const names = lowLoyaltyOfficers.map(o => o.name).join(', ');
      toast(`⚠️ Low loyalty: ${names}`, { 
        icon: '😤',
        duration: 4000 
      });
    }
  }, [officers]);

  return null;
};