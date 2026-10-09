import { fetchApi } from './client';

export interface DashboardMetrics {
  total_events: number;
  open_events: number;
  analyzed_events: number;
  sensors_online: number;
  facilities_tracked: number;
  recent_events: Array<{
    id: number;
    pollutant: string | null;
    severity: string;
    status: string;
    peak_value: number;
    unit: string | null;
    started_at: string;
  }>;
}

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardMetrics> => {
    return await fetchApi<DashboardMetrics>('/api/v1/dashboard');
  }
};
