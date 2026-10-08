// Mock Data (to be removed when backend is ready)
const MOCK_EVENTS = [
  {
    id: "EVT-2026-892",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    pollutant: "SO2",
    locationName: "Industrial Park North",
    severity: "High",
    status: "Investigating",
    concentration: "145 ppb",
    baseline: "15 ppb",
    sensorId: "SEN-101",
    coordinates: [34.0522, -118.2437] as [number, number]
  },
  {
    id: "EVT-2026-891",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    pollutant: "VOCs",
    locationName: "River Valley",
    severity: "Medium",
    status: "Analyzed",
    concentration: "80 ppb",
    baseline: "10 ppb",
    sensorId: "SEN-102",
    coordinates: [34.0622, -118.2537] as [number, number]
  }
];

export const eventsApi = {
  getEvents: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EVENTS;
  },
  getEvent: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EVENTS.find(e => e.id === id);
  }
};
