const MOCK_SENSORS = [
  { id: "SEN-101", name: "North-West Array", location: "Zone A", pollutant: "Multigas", status: "Online", lastSeen: new Date().toISOString(), coordinates: [34.0520, -118.2430] as [number, number] },
  { id: "SEN-102", name: "River Monitor", location: "Zone B", pollutant: "SO2", status: "Online", lastSeen: new Date().toISOString(), coordinates: [34.0620, -118.2530] as [number, number] }
];

export const sensorsApi = {
  getSensors: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_SENSORS;
  }
};
