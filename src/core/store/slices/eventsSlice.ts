import { create } from 'zustand';
import { GameEvent, EventType, EventChoice } from '../types';
import { GameState } from '../types/base';

interface EventsState {
  activeEvent: GameEvent | null;
  eventData: any;
  pendingEvents: GameEvent[];
  eventHistory: GameEvent[];
}

interface EventsActions {
  // Event management
  triggerEvent: (event: GameEvent) => void;
  dismissEvent: () => void;
  resolveEvent: (choice: EventChoice) => void;
  addPendingEvent: (event: GameEvent) => void;
  
  // Event handling
  handleChoice: (choice: any) => void;
  clearActiveEvent: () => void;
}

export type EventsSlice = EventsState & EventsActions;

export const createEventsSlice = (set: any, get: any) => ({
  activeEvent: null,
  eventData: null,
  pendingEvents: [],
  eventHistory: [],
  
  triggerEvent: (event: GameEvent) => {
    set((state: GameState) => ({
      activeEvent: event,
      eventData: event.data,
    }));
  },
  
  dismissEvent: () => {
    set((state: any) => {
          const pendingEvents = (state as any).pendingEvents || [];
          if (pendingEvents.length > 0) {
            const [nextEvent, ...rest] = pendingEvents;
        return {
          activeEvent: nextEvent,
          eventData: nextEvent.data,
          pendingEvents: rest,
        };
      }

      return { activeEvent: null, eventData: null };
    });
  },
  
  resolveEvent: (choice: EventChoice) => {
    set((state: GameState) => {
      // Apply event effects
      const effects = choice.effects || {};
      let updates: any = {
              activeEvent: null,
              eventData: null,
      };

      // Apply resource changes
      if (effects.cash) {
        updates.resources = { ...state.resources, cash: state.resources.cash + effects.cash };
      }
      if (effects.reputation) {
        updates.resources = { ...updates.resources, reputation: state.resources.reputation + effects.reputation };
      }
      if (effects.policeHeat) {
        updates.resources = { ...updates.resources, policeHeat: state.resources.policeHeat + effects.policeHeat };
      }
      if (effects.intel) {
        updates.resources = { ...updates.resources, intel: state.resources.intel + effects.intel };
      }
      if (effects.influence) {
        updates.resources = { ...updates.resources, influence: state.resources.influence + effects.influence };
      }

      return updates;
    });
  },
  
  addPendingEvent: (event: GameEvent) => {
    set((state: any) => ({
          pendingEvents: [...((state as any).pendingEvents || []), event]
        }));
  },
  
  handleChoice: (choice: any) => {
    set((state: any) => {
          const event = (state as any).activeEvent;
          if (!event) return state;

      // Find the choice and apply its effects
      const selectedChoice = event.choices?.find((c: any) => c.text === choice);
      if (selectedChoice) {
        return {
          activeEvent: null,
          eventData: null,
        };
      }

      return state;
    });
  },
  
  clearActiveEvent: () => {
    set({ activeEvent: null, eventData: null });
  },
});