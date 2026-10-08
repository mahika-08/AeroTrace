const MOCK_FACILITIES = [
  { id: "FAC-001", name: "ChemCorp Processing", location: "North Sector", type: "Chemical", status: "Active", coordinates: [34.0600, -118.2400] as [number, number] },
  { id: "FAC-002", name: "SteelWorks Inc.", location: "East Sector", type: "Metallurgy", status: "Active", coordinates: [34.0450, -118.2300] as [number, number] }
];

export const facilitiesApi = {
  getFacilities: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_FACILITIES;
  },
  getFacility: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_FACILITIES.find(f => f.id === id);
  }
};
