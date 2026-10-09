import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Event, Facility, Sensor } from '../../store/useAppStore';
import { normalizeCoordinates } from '../../utils/coordinates';
import { Building2, Activity, Wind } from 'lucide-react';

interface AeroTraceMapProps {
  events?: Event[];
  facilities?: Facility[];
  sensors?: Sensor[];
  selectedEventId?: string | null;
  selectedFacilityId?: string | null;
  onEventSelect?: (id: string) => void;
  onFacilitySelect?: (id: string) => void;
  trajectory?: any; // GeoJSON
  wind?: { direction: number; speed: number };
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  pitch?: number;
  className?: string;
  isBackendAvailable?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
}

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// The style object for MapLibre configuring OSM raster tiles
const mapStyle = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [TILE_URL],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export default function AeroTraceMap({
  events = [],
  facilities = [],
  sensors = [],
  selectedEventId = null,
  selectedFacilityId = null,
  onEventSelect,
  onFacilitySelect,
  trajectory,
  wind,
  center = [-118.2437, 34.0522],
  zoom = 10,
  pitch = 0,
  className = "w-full h-full",
  isBackendAvailable = true,
  interactive = true,
  children
}: AeroTraceMapProps) {
  
  const [popupInfo, setPopupInfo] = useState<Sensor | null>(null);

  // If no data is available
  const hasData = events.length > 0 || facilities.length > 0 || sensors.length > 0;

  return (
    <div className={`relative ${className}`}>
      <Map
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: zoom,
          pitch: pitch
        }}
        mapStyle={mapStyle as any}
        style={{ width: '100%', height: '100%' }}
        interactive={interactive}
      >
        <NavigationControl position="bottom-right" />

        {/* Trajectory Layer */}
        {trajectory && (
          <Source id="trajectory-source" type="geojson" data={trajectory}>
            <Layer 
              id="trajectory-layer"
              type="line"
              paint={{
                'line-color': '#12372A',
                'line-width': 3,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* Facilities */}
        {facilities.map(fac => {
          const [lng, lat] = normalizeCoordinates(fac.coordinates);
          const isSelected = fac.id === selectedFacilityId;
          return (
            <Marker 
              key={fac.id} 
              longitude={lng} 
              latitude={lat}
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (onFacilitySelect) onFacilitySelect(fac.id);
              }}
            >
              <div className={`p-1.5 rounded flex items-center justify-center border border-white cursor-pointer transition-all duration-300 shadow-md ${isSelected ? 'bg-brand-moss scale-125 z-20' : 'bg-brand-forest text-white'}`}>
                <Building2 size={isSelected ? 16 : 14} />
              </div>
            </Marker>
          );
        })}

        {/* Sensors */}
        {sensors.map(sen => {
          const [lng, lat] = normalizeCoordinates(sen.coordinates);
          const isOnline = sen.status.toLowerCase() === 'online';
          return (
            <Marker 
              key={sen.id} 
              longitude={lng} 
              latitude={lat}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(sen);
              }}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow cursor-pointer transition-transform hover:scale-125 ${isOnline ? 'bg-brand-data' : 'bg-gray-400'}`}></div>
            </Marker>
          );
        })}

        {/* Events */}
        {events.map(evt => {
          const [lng, lat] = normalizeCoordinates(evt.coordinates);
          const isSelected = evt.id === selectedEventId;
          return (
            <Marker 
              key={evt.id} 
              longitude={lng} 
              latitude={lat}
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (onEventSelect) onEventSelect(evt.id);
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer">
                {isSelected && <div className="absolute w-10 h-10 bg-brand-danger/30 rounded-full animate-ping" />}
                <div className={`rounded-full border-2 border-white relative z-10 shadow-lg transition-all ${isSelected ? 'w-5 h-5 bg-brand-danger' : 'w-4 h-4 bg-brand-danger/80'}`} />
              </div>
            </Marker>
          );
        })}

        {/* Sensor Popup */}
        {popupInfo && (
          <Popup
            longitude={normalizeCoordinates(popupInfo.coordinates)[0]}
            latitude={normalizeCoordinates(popupInfo.coordinates)[1]}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="flex flex-col gap-1 min-w-[150px]">
              <div className="font-semibold text-brand-forest border-b border-brand-soft pb-1 mb-1">{popupInfo.name}</div>
              <div className="text-xs text-brand-ink/70">ID: {popupInfo.id}</div>
              <div className="text-xs flex items-center gap-1">
                Status: <span className={popupInfo.status.toLowerCase() === 'online' ? 'text-brand-data font-medium' : 'text-brand-danger font-medium'}>{popupInfo.status}</span>
              </div>
              <div className="text-xs">Pollutants: {popupInfo.pollutant}</div>
            </div>
          </Popup>
        )}

        {children}
      </Map>

      {/* Wind indicator overlay (UI level, not geographic) */}
      {wind && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-brand-soft shadow p-3 rounded flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-brand-moss uppercase">Wind</span>
            <span className="text-sm font-medium">{wind.speed} m/s</span>
          </div>
          <div 
            className="w-8 h-8 rounded-full bg-brand-bg border border-brand-soft flex items-center justify-center"
            style={{ transform: `rotate(${wind.direction}deg)` }}
          >
            {/* The arrow points in the direction the wind is blowing towards. 
                Meteorological 270deg means coming FROM West, going TO East. 
                If rotate is 270, arrow points Left by default? 
                Usually 0 is North. Arrow pointing UP means wind blows to North (South wind).
                We will use an Arrow pointing UP, rotated by `direction`.
            */}
            <Wind size={16} className="text-brand-forest" />
          </div>
        </div>
      )}

      {/* Trajectory disclaimer */}
      {trajectory && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow border border-brand-soft text-xs text-brand-ink/70">
          Simplified trajectory approximation — not a regulatory-grade dispersion model.
        </div>
      )}

      {/* Overlays for empty or unavailable states */}
      {!isBackendAvailable && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-brand-danger text-xs font-medium px-3 py-1 rounded shadow-sm border border-brand-danger/20 flex items-center gap-2">
          <Activity size={12} />
          Live AeroTrace data unavailable
        </div>
      )}

      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur px-6 py-4 rounded shadow-lg border border-brand-soft text-brand-ink text-sm font-medium">
            No monitoring data available for this view.
          </div>
        </div>
      )}
    </div>
  );
}
