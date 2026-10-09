import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Activity, Wind, ServerCrash } from 'lucide-react';
import { weatherApi, type ApiWeather } from '../api/weather';
import { measurementsApi, type ApiMeasurement } from '../api/measurements';
import 'maplibre-gl/dist/maplibre-gl.css';
import ConcentrationChart from '../components/ConcentrationChart';
import AeroTraceMap from '../components/map/AeroTraceMap';
import { mockTrajectory, mockWind } from '../mocks/mapData';
import { normalizeCoordinates } from '../utils/coordinates';

export default function InvestigationWorkspace() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, facilities, sensors, initializeData } = useAppStore();

  useEffect(() => {
    if (events.length === 0) {
      initializeData();
    }
  }, [events, initializeData]);

  const event = events.find(e => e.id === eventId) || events[0];

  if (!event) {
    return <div className="p-8">Event not found.</div>;
  }

  const [weather, setWeather] = useState<ApiWeather | null>(null);
  const [measurements, setMeasurements] = useState<ApiMeasurement[]>([]);

  useEffect(() => {
    if (event) {
      Promise.all([
        weatherApi.getWeatherBySensor(event.sensorId),
        measurementsApi.getMeasurementsBySensor(event.sensorId)
      ]).then(([w, m]) => {
        setWeather(w || null);
        setMeasurements(m);
      });
    }
  }, [event]);

  // Generate chart data from measurements if available, else fallback
  const chartData = measurements.length > 0 
    ? [...measurements].reverse().map(m => ({ time: m.timestamp, value: m.concentration }))
    : (event ? Array.from({ length: 24 }).map((_, i) => {
        const time = new Date(new Date(event.timestamp).getTime() - (23 - i) * 3600000).toISOString();
        let value = parseInt(event.baseline, 10);
        if (i > 18 && i < 22) {
          value = parseInt(event.concentration, 10) * (i === 20 ? 1 : 0.6);
        }
        value += Math.random() * 5;
        return { time, value };
      }) : []);

  // Format wind to match map expectations if weather exists
  const realWind = weather ? { direction: weather.wind_direction_deg, speed: weather.wind_speed_mps } : mockWind;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-brand-bg text-brand-ink">
      
      {/* Sidebar Panel */}
      <div className="w-[400px] border-r border-brand-soft/50 flex flex-col bg-brand-bg relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="p-6 border-b border-brand-soft/50 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-brand-moss hover:text-brand-ink transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-brand-moss font-medium mb-1">GIS Workspace</div>
            <div className="font-medium text-lg">{event.id}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Details */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-brand-moss mb-4 flex items-center gap-2">
              <Activity size={14} /> Overview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-brand-ink/60">Pollutant</span><span className="font-medium">{event.pollutant}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Status</span><span className="text-brand-data font-medium">{event.status}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Severity</span><span className="text-brand-danger font-medium">{event.severity}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Peak Conc.</span><span className="font-medium">{event.concentration}</span></div>
            </div>
          </section>

          {/* Source Candidates */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-brand-moss mb-4 flex items-center gap-2">
              <ServerCrash size={14} /> Source Candidates
            </h3>
            <div className="space-y-3">
              {facilities.map((fac, idx) => (
                <div key={fac.id} className="p-3 border border-brand-soft/80 rounded hover:border-brand-data/50 hover:bg-brand-soft/20 cursor-pointer transition-colors flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{fac.name}</div>
                    <div className="text-xs text-brand-ink/60">{fac.location}</div>
                  </div>
                  <div className={`font-mono text-lg ${idx === 0 ? 'text-brand-data' : 'text-brand-ink/50'}`}>
                    {idx === 0 ? '86' : '41'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Meteorology */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-brand-moss mb-4 flex items-center gap-2">
              <Wind size={14} /> Meteorology
            </h3>
            <div className="p-4 bg-brand-soft/30 rounded border border-brand-soft/50 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-brand-ink/60">Wind Direction</span><span className="font-medium">{weather ? `${weather.wind_direction_deg}°` : '270° (W)'}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Wind Speed</span><span className="font-medium">{weather ? `${weather.wind_speed_mps} m/s` : '12 km/h'}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Temperature</span><span className="font-medium">{weather ? `${weather.temperature_c}°C` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-brand-ink/60">Humidity</span><span className="font-medium">{weather ? `${weather.humidity_percent}%` : 'N/A'}</span></div>
            </div>
          </section>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-brand-soft">
        <AeroTraceMap 
          events={[event]}
          facilities={facilities}
          sensors={sensors}
          selectedEventId={event.id}
          center={normalizeCoordinates(event.coordinates)}
          zoom={13}
          trajectory={mockTrajectory}
          wind={realWind}
        />
        
        {/* Floating Panel on Map (e.g. Chart or timeline) */}
        <div className="absolute bottom-6 left-6 right-16 bg-white/90 backdrop-blur border border-brand-soft/80 p-4 rounded shadow-xl">
           <div className="text-xs font-mono tracking-widest text-brand-moss uppercase mb-2">Concentration Timeline</div>
           <div className="h-48 w-full flex items-center justify-center relative bg-brand-bg/50">
             <ConcentrationChart data={chartData} pollutant={event.pollutant} />
           </div>
        </div>
      </div>

    </div>
  );
}
