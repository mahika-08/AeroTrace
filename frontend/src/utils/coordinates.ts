/**
 * Normalizes coordinates from various backend formats into MapLibre's expected format: [longitude, latitude]
 */

export type LngLatArray = [number, number];

export function normalizeCoordinates(coords: any): LngLatArray {
  if (!coords) return [0, 0];

  // If it's already an array
  if (Array.isArray(coords)) {
    if (coords.length >= 2) {
      // Typically backends that return arrays return [lat, lng].
      // The current frontend code does `<Marker longitude={event.coordinates[1]} latitude={event.coordinates[0]}>`
      // So the backend (or mock) currently returns [lat, lng].
      // We normalize to MapLibre's [lng, lat].
      return [coords[1], coords[0]];
    }
    return [0, 0];
  }

  // If it's an object with lat/lng
  if (typeof coords === 'object') {
    const lat = coords.lat ?? coords.latitude ?? 0;
    const lng = coords.lng ?? coords.longitude ?? coords.lon ?? 0;
    return [lng, lat];
  }

  return [0, 0];
}
