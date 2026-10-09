export const MOCK_EVENTS = [
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

export const MOCK_FACILITIES = [
  { id: "FAC-001", name: "ChemCorp Processing", location: "North Sector", type: "Chemical", status: "Active", coordinates: [34.0600, -118.2400] as [number, number] },
  { id: "FAC-002", name: "SteelWorks Inc.", location: "East Sector", type: "Metallurgy", status: "Active", coordinates: [34.0450, -118.2300] as [number, number] }
];

export const MOCK_SENSORS = [
  { id: "SEN-101", name: "North-West Array", location: "Zone A", pollutant: "Multigas", status: "Online", lastSeen: new Date().toISOString(), coordinates: [34.0520, -118.2430] as [number, number] },
  { id: "SEN-102", name: "River Monitor", location: "Zone B", pollutant: "SO2", status: "Online", lastSeen: new Date().toISOString(), coordinates: [34.0620, -118.2530] as [number, number] }
];
