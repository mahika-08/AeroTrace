import { fetchApi } from './client';

export interface ApiMeasurement {
  id: number;
  sensor_id: number;
  timestamp: string;
  concentration: number;
  is_anomalous: boolean;
}

export interface MeasurementsResponse {
  items: ApiMeasurement[];
  total: number;
  limit: number;
  offset: number;
}

export const measurementsApi = {
  getMeasurementsBySensor: async (sensorId: string): Promise<ApiMeasurement[]> => {
    try {
      const numericId = sensorId.replace('SEN-', '');
      const data = await fetchApi<MeasurementsResponse>(`/api/v1/measurements?sensor_id=${numericId}&limit=24`);
      return data.items;
    } catch (error) {
      console.warn(`Failed to fetch measurements for sensor ${sensorId}.`);
      return [];
    }
  }
};
