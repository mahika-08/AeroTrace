import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import AeroTraceMap from '../components/map/AeroTraceMap';
import { normalizeCoordinates } from '../utils/coordinates';

export default function Facilities() {
  const { facilities, initializeData, isLoading } = useAppStore();

  useEffect(() => {
    if (facilities.length === 0) {
      initializeData();
    }
  }, [facilities.length, initializeData]);

  if (isLoading) {
    return <div className="pt-32 px-12 text-center text-brand-moss uppercase tracking-widest text-sm">Loading Facilities...</div>;
  }

  const mapCenter = facilities.length > 0 
    ? normalizeCoordinates(facilities[0].coordinates)
    : undefined;

  return (
    <div className="pt-32 px-8 md:px-24 pb-24 max-w-7xl mx-auto min-h-screen flex flex-col">
      <h1 className="text-sm text-brand-moss uppercase tracking-[0.2em] mb-12">Source Intelligence</h1>
      <h2 className="text-5xl md:text-6xl font-light mb-16 text-brand-ink">Monitored Facilities</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 flex-1">
        
        {/* Facility List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-4 h-[600px]">
          {facilities.map(facility => (
            <div key={facility.id} className="p-6 border border-brand-soft bg-white hover:border-brand-moss transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-medium mb-1">{facility.name}</h3>
                  <p className="text-sm text-brand-ink/60">{facility.location}</p>
                </div>
                <div className="text-xs font-mono text-brand-moss bg-brand-soft/50 px-2 py-1 rounded">
                  {facility.id}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-brand-soft/50 pt-4">
                <div>
                  <div className="text-xs text-brand-moss uppercase tracking-widest mb-1">Type</div>
                  <div>{facility.type}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-moss uppercase tracking-widest mb-1">Status</div>
                  <div className="text-brand-data">{facility.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map View */}
        <div className="h-[600px] w-full rounded-2xl border border-brand-soft overflow-hidden shadow-lg relative">
          <AeroTraceMap 
            facilities={facilities}
            center={mapCenter as [number, number]}
            zoom={11}
          />
        </div>
        
      </div>
    </div>
  );
}
