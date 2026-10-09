import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import AeroTraceMap from '../components/map/AeroTraceMap';
import { normalizeCoordinates } from '../utils/coordinates';

export default function Sensors() {
  const { sensors, initializeData, isLoading } = useAppStore();

  useEffect(() => {
    if (sensors.length === 0) {
      initializeData();
    }
  }, [sensors.length, initializeData]);

  if (isLoading) {
    return <div className="pt-32 px-12 text-center text-brand-moss uppercase tracking-widest text-sm">Loading Sensors...</div>;
  }

  // Calculate center based on first sensor, or default
  const mapCenter = sensors.length > 0 
    ? normalizeCoordinates(sensors[0].coordinates)
    : undefined;

  return (
    <div className="pt-32 px-8 md:px-24 pb-24 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-sm text-brand-moss uppercase tracking-[0.2em] mb-12">Monitoring Network</h1>
      <h2 className="text-5xl md:text-6xl font-light mb-16 text-brand-ink">Sensor Array</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 h-[400px] rounded-2xl border border-brand-soft overflow-hidden shadow-lg relative">
          <AeroTraceMap 
            sensors={sensors}
            center={mapCenter as [number, number]}
            zoom={11}
          />
        </div>
        
        <div className="bg-brand-soft/30 p-8 rounded-2xl border border-brand-soft flex flex-col justify-center">
          <div className="text-sm uppercase tracking-widest text-brand-moss mb-4">Network Status</div>
          <div className="text-7xl font-light mb-4 text-brand-ink">{sensors.length}</div>
          <div className="text-brand-ink/70 mb-8">Active hardware nodes deployed across the monitoring zone.</div>
          <div className="w-full bg-brand-soft h-2 rounded overflow-hidden">
            <div className="bg-brand-data w-[98%] h-full"></div>
          </div>
          <div className="text-xs font-mono text-brand-moss mt-3 text-right">98% UPTIME</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map(sensor => (
          <div key={sensor.id} className="p-6 border border-brand-soft bg-white hover:border-brand-moss/50 transition-colors rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-medium">{sensor.name}</h3>
                <p className="text-xs text-brand-ink/60 mt-1">{sensor.location}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-data"></div>
            </div>
            
            <div className="text-sm border-t border-brand-soft/50 pt-4 flex justify-between">
              <div>
                <div className="text-[10px] text-brand-moss uppercase tracking-widest mb-1">Target</div>
                <div className="font-medium">{sensor.pollutant}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-brand-moss uppercase tracking-widest mb-1">Last Seen</div>
                <div className="font-mono text-xs">{new Date(sensor.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
