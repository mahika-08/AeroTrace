import type { Event, Facility, Sensor } from '../store/useAppStore';

// We use [lat, lng] for these mocks to match what the api mock returns.
// The normalizeCoordinates utility will flip them to [lng, lat] for MapLibre.

export const mockEvents: Event[] = [
  {
    id: 'EVT-2026-1049',
    pollutant: 'SO2',
    concentration: '450',
    baseline: '25',
    sensorId: 'SEN-882',
    timestamp: new Date().toISOString(),
    locationName: 'Industrial Zone B',
    severity: 'High',
    status: 'Investigating',
    coordinates: [34.0522, -118.2437] // LA
  }
];

export const mockFacilities: Facility[] = [
  {
    id: 'FAC-101',
    name: 'PetroChem Refinery',
    location: 'Zone B North',
    type: 'Refinery',
    status: 'Active',
    coordinates: [34.07, -118.26]
  },
  {
    id: 'FAC-102',
    name: 'Metals Processing Inc',
    location: 'Zone B East',
    type: 'Manufacturing',
    status: 'Active',
    coordinates: [34.06, -118.22]
  }
];

export const mockSensors: Sensor[] = [
  {
    id: 'SEN-882',
    name: 'Alpha Node',
    location: 'Sector 4',
    pollutant: 'SO2, NO2',
    status: 'Online',
    lastSeen: new Date().toISOString(),
    coordinates: [34.0522, -118.2437]
  },
  {
    id: 'SEN-883',
    name: 'Beta Node',
    location: 'Sector 5',
    pollutant: 'SO2, PM2.5',
    status: 'Online',
    lastSeen: new Date().toISOString(),
    coordinates: [34.04, -118.25]
  }
];

export const mockTrajectory = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    // These must be [lng, lat] per GeoJSON spec!
    coordinates: [
      [-118.2437, 34.0522],
      [-118.25, 34.06],
      [-118.26, 34.07]
    ]
  }
};

// Wind is 270 deg (FROM West TO East)
export const mockWind = {
  direction: 270,
  speed: 4.5
};
