import { fetchApi } from './client';
import type { Event as StoreEvent } from '../store/useAppStore';

// Raw backend response type
interface ApiEvent {
  id: number;
  sensor_id: number;
  pollutant: string | null;
  severity: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  peak_value: number;
  baseline_value: number;
  unit: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface EventsResponse {
  items: ApiEvent[];
  total: number;
  limit: number;
  offset: number;
}

function normalizeEvent(apiEvent: ApiEvent): StoreEvent {
  const formatValue = (val: number, unit: string | null) => `${val.toFixed(1)} ${unit || 'ppm'}`;
  
  return {
    id: `EVT-${apiEvent.id}`,
    pollutant: apiEvent.pollutant || 'Unknown',
    concentration: formatValue(apiEvent.peak_value, apiEvent.unit),
    baseline: formatValue(apiEvent.baseline_value, apiEvent.unit),
    sensorId: `SEN-${apiEvent.sensor_id}`,
    timestamp: apiEvent.started_at,
    locationName: `Sector ${apiEvent.sensor_id} Area`,
    severity: apiEvent.severity,
    status: apiEvent.status === 'OPEN' ? 'Investigating' : apiEvent.status === 'ANALYZED' ? 'Analyzed' : 'Resolved',
    coordinates: (apiEvent.longitude != null && apiEvent.latitude != null) 
      ? [apiEvent.longitude, apiEvent.latitude] 
      : [0, 0] // GeoJSON is [lng, lat]
  };
}

export const eventsApi = {
  getEvents: async (): Promise<StoreEvent[]> => {
    try {
      const data = await fetchApi<EventsResponse>('/api/v1/events?limit=50');
      return data.items.map(normalizeEvent);
    } catch (error) {
      console.warn('Failed to fetch real events. Backend might be down.');
      throw error;
    }
  },
  getEvent: async (id: string): Promise<StoreEvent | undefined> => {
    try {
      const numericId = id.replace('EVT-', '');
      const apiEvent = await fetchApi<ApiEvent>(`/api/v1/events/${numericId}`);
      return normalizeEvent(apiEvent);
    } catch (error) {
      console.warn(`Failed to fetch event ${id}.`);
      throw error;
    }
  },
  analyzeEvent: async (id: string): Promise<any> => {
    const numericId = id.replace('EVT-', '');
    return fetchApi(`/api/v1/events/${numericId}/analyze`, { method: 'POST' });
  },
  getAttribution: async (id: string): Promise<any> => {
    const numericId = id.replace('EVT-', '');
    return fetchApi(`/api/v1/events/${numericId}/attribution`);
  }
};
