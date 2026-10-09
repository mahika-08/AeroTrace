import { create } from 'zustand';
import { eventsApi } from '../api/events';
import { facilitiesApi } from '../api/facilities';
import { sensorsApi } from '../api/sensors';
import { dashboardApi } from '../api/dashboard';

export interface Event {
  id: string;
  pollutant: string;
  concentration: string;
  baseline: string;
  sensorId: string;
  timestamp: string;
  locationName: string;
  severity: string;
  status: string;
  coordinates: [number, number];
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  coordinates: [number, number];
}

export interface Sensor {
  id: string;
  name: string;
  location: string;
  pollutant: string;
  status: string;
  lastSeen: string;
  coordinates: [number, number];
}

interface AppState {
  // Global stats
  activeSensors: number;
  monitoredFacilities: number;
  activeEvents: number;
  eventsUnderInvestigation: number;
  
  // Data arrays
  events: Event[];
  facilities: Facility[];
  sensors: Sensor[];

  // Global UI State
  isLoading: boolean;
  error: string | null;

  // Selection state
  selectedEventId: string | null;
  selectedFacilityId: string | null;
  selectedSensorId: string | null;
  selectedTimestamp: string | null;
  selectedEvidenceFactor: string | null;

  // Actions
  setSelectedEvent: (id: string | null) => void;
  setSelectedFacility: (id: string | null) => void;
  setSelectedSensor: (id: string | null) => void;
  setSelectedTimestamp: (ts: string | null) => void;
  setSelectedEvidenceFactor: (factor: string | null) => void;
  
  initializeData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  activeSensors: 0,
  monitoredFacilities: 0,
  activeEvents: 0,
  eventsUnderInvestigation: 0,

  events: [],
  facilities: [],
  sensors: [],

  isLoading: false,
  error: null,

  selectedEventId: null,
  selectedFacilityId: null,
  selectedSensorId: null,
  selectedTimestamp: null,
  selectedEvidenceFactor: null,

  setSelectedEvent: (id) => set({ selectedEventId: id }),
  setSelectedFacility: (id) => set({ selectedFacilityId: id }),
  setSelectedSensor: (id) => set({ selectedSensorId: id }),
  setSelectedTimestamp: (ts) => set({ selectedTimestamp: ts }),
  setSelectedEvidenceFactor: (factor) => set({ selectedEvidenceFactor: factor }),

  initializeData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [events, facilities, sensors, dashboard] = await Promise.all([
        eventsApi.getEvents(),
        facilitiesApi.getFacilities(),
        sensorsApi.getSensors(),
        dashboardApi.getDashboard().catch(() => null)
      ]);

      set({
        events,
        facilities,
        sensors,
        activeSensors: dashboard?.sensors_online ?? sensors.length,
        monitoredFacilities: dashboard?.facilities_tracked ?? facilities.length,
        activeEvents: dashboard?.total_events ?? events.length,
        eventsUnderInvestigation: dashboard?.open_events ?? events.filter(e => e.status === 'Investigating').length,
        selectedEventId: events.length > 0 ? events[0].id : null,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load data from backend.', isLoading: false });
    }
  }
}));
