import { fetchApi } from './client';
import type { Sensor as StoreSensor } from '../store/useAppStore';

interface ApiSensor {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  last_seen_at: string;
}

interface SensorsResponse {
  items: ApiSensor[];
  total: number;
  limit: number;
  offset: number;
}

function normalizeSensor(s: ApiSensor): StoreSensor {
  return {
    id: `SEN-${s.id}`,
    name: s.name,
    location: `${s.latitude?.toFixed(4) || '0'}, ${s.longitude?.toFixed(4) || '0'}`,
    pollutant: "Multigas", // Backend sensor doesn't specify pollutant per sensor directly here
    status: s.active ? "Online" : "Offline",
    lastSeen: s.last_seen_at,
    coordinates: (s.longitude != null && s.latitude != null) ? [s.longitude, s.latitude] : [0, 0],
  };
}

export const sensorsApi = {
  getSensors: async (): Promise<StoreSensor[]> => {
    try {
      const data = await fetchApi<SensorsResponse>('/api/v1/sensors?limit=50');
      return data.items.map(normalizeSensor);
    } catch (error) {
      console.warn('Failed to fetch real sensors. Backend might be down.');
      throw error;
    }
  }
};
