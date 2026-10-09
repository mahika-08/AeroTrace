import { fetchApi } from './client';
import type { Facility as StoreFacility } from '../store/useAppStore';

interface ApiFacility {
  id: number;
  name: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  emission_categories: string[];
}

interface FacilitiesResponse {
  items: ApiFacility[];
  total: number;
  limit: number;
  offset: number;
}

function normalizeFacility(f: ApiFacility): StoreFacility {
  return {
    id: `FAC-${f.id.toString().padStart(3, '0')}`,
    name: f.name,
    location: `${f.latitude?.toFixed(4) || '0'}, ${f.longitude?.toFixed(4) || '0'}`,
    type: f.type.charAt(0).toUpperCase() + f.type.slice(1).toLowerCase(),
    status: 'Active',
    coordinates: (f.longitude != null && f.latitude != null) ? [f.longitude, f.latitude] : [0, 0],
  };
}

export const facilitiesApi = {
  getFacilities: async (): Promise<StoreFacility[]> => {
    try {
      const data = await fetchApi<FacilitiesResponse>('/api/v1/facilities?limit=50');
      return data.items.map(normalizeFacility);
    } catch (error) {
      console.warn('Failed to fetch real facilities. Backend might be down.');
      throw error;
    }
  },
  getFacility: async (id: string): Promise<StoreFacility | undefined> => {
    // There is no GET /api/v1/facilities/{id} in the backend currently
    // We will just fetch all and filter
    try {
      const data = await fetchApi<FacilitiesResponse>('/api/v1/facilities?limit=100');
      const all = data.items.map(normalizeFacility);
      return all.find(f => f.id === id);
    } catch (error) {
      console.warn(`Failed to fetch facility ${id}.`);
      throw error;
    }
  }
};
