import { fetchApi } from './client';

export interface ApiWeather {
  id: number;
  sensor_id: number;
  observed_at: string;
  wind_speed_mps: number;
  wind_direction_deg: number;
  temperature_c: number;
  humidity_percent: number;
}

export interface WeatherResponse {
  items: ApiWeather[];
  total: number;
  limit: number;
  offset: number;
}

export const weatherApi = {
  getWeatherBySensor: async (sensorId: string): Promise<ApiWeather | undefined> => {
    try {
      const numericId = sensorId.replace('SEN-', '');
      const data = await fetchApi<WeatherResponse>(`/api/v1/weather?sensor_id=${numericId}&limit=1`);
      return data.items[0]; // most recent
    } catch (error) {
      console.warn(`Failed to fetch weather for sensor ${sensorId}.`);
      return undefined;
    }
  }
};
