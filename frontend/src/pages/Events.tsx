import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function Events() {
  const { events, initializeData, isLoading } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (events.length === 0) {
      initializeData();
    }
  }, [events.length, initializeData]);

  if (isLoading) {
    return <div className="pt-32 px-12 text-center text-brand-moss uppercase tracking-widest text-sm">Loading Events...</div>;
  }

  return (
    <div className="pt-32 px-8 md:px-24 pb-24 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-sm text-brand-moss uppercase tracking-[0.2em] mb-12">Investigation Browser</h1>
      <h2 className="text-5xl md:text-6xl font-light mb-16 text-brand-ink">Anomalous Events</h2>
      
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-6 gap-4 text-xs font-mono text-brand-moss uppercase tracking-widest border-b border-brand-soft pb-4 mb-4">
          <div className="col-span-1">Time</div>
          <div className="col-span-1">Pollutant</div>
          <div className="col-span-1">Location</div>
          <div className="col-span-1">Sensor</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {events.map(event => (
          <button 
            key={event.id}
            onClick={() => navigate(`/investigation/${event.id}`)}
            className="grid grid-cols-6 gap-4 text-sm text-left py-6 px-4 bg-white border border-brand-soft hover:border-brand-moss hover:shadow-lg transition-all items-center group"
          >
            <div className="col-span-1 font-mono text-brand-ink/70 group-hover:text-brand-ink">
              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <div className="text-xs text-brand-ink/40 mt-1">{new Date(event.timestamp).toLocaleDateString()}</div>
            </div>
            <div className="col-span-1 font-medium">{event.pollutant}</div>
            <div className="col-span-1 text-brand-ink/80">{event.locationName}</div>
            <div className="col-span-1 font-mono text-brand-ink/70">{event.sensorId}</div>
            <div className="col-span-1">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${event.severity === 'Critical' ? 'bg-brand-danger' : 'bg-brand-earth'}`}></span>
              {event.severity}
            </div>
            <div className="col-span-1 text-right font-medium text-brand-data uppercase tracking-widest text-xs">
              {event.status}
            </div>
          </button>
        ))}
        
        {events.length === 0 && (
          <div className="py-12 text-center text-brand-ink/50 italic">No events currently recorded.</div>
        )}
      </div>
    </div>
  );
}
