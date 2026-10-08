import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../../store/useAppStore';
import AeroTraceMap from '../map/AeroTraceMap';
import ConcentrationChart from '../ConcentrationChart';
import { normalizeCoordinates } from '../../utils/coordinates';

export default function DetectSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { events, selectedEventId } = useAppStore();
  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const chartData = selectedEvent ? Array.from({ length: 24 }).map((_, i) => {
    const time = new Date(new Date(selectedEvent.timestamp).getTime() - (23 - i) * 3600000).toISOString();
    let value = parseInt(selectedEvent.baseline, 10);
    if (i > 18 && i < 22) {
      value = parseInt(selectedEvent.concentration, 10) * (i === 20 ? 1 : 0.6);
    }
    value += Math.random() * 5;
    return { time, value };
  }) : [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // The section pins, and the chart draws based on scroll
      gsap.fromTo('.detect-chart-overlay', 
        { width: '100%' }, 
        {
          width: '0%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 20%',
            end: 'bottom 80%',
            scrub: true,
          }
        }
      );
      
      gsap.from('.detect-text', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  if (!selectedEvent) return null;

  return (
    <section ref={containerRef} className="min-h-screen w-full py-32 px-8 md:px-24 flex flex-col justify-center relative z-10 border-t border-brand-soft/50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 lg:order-1 h-[700px] flex flex-col gap-6">
          <div className="h-2/3 w-full rounded-2xl overflow-hidden relative shadow-2xl border border-brand-soft/50">
            <AeroTraceMap 
              events={[selectedEvent]}
              selectedEventId={selectedEvent.id}
              center={normalizeCoordinates(selectedEvent.coordinates)}
              zoom={13}
              interactive={false}
            />
          </div>
          
          <div className="h-1/3 w-full bg-white rounded-2xl border border-brand-soft p-4 relative shadow-lg">
            <ConcentrationChart data={chartData} pollutant={selectedEvent.pollutant} />
            {/* Overlay that moves to reveal chart based on scroll */}
            <div className="detect-chart-overlay absolute top-0 right-0 bottom-0 bg-white/90 backdrop-blur-sm origin-right" style={{ borderLeft: '2px solid var(--color-brand-danger)' }}></div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="detect-text text-sm text-brand-danger uppercase tracking-[0.2em] mb-12">Event Detected</h2>
          <h3 className="detect-text text-5xl md:text-6xl font-medium mb-8 leading-tight">
            Massive spike in {selectedEvent.pollutant}.
          </h3>
          <p className="detect-text text-xl font-light text-brand-ink/80 mb-12">
            At {new Date(selectedEvent.timestamp).toLocaleTimeString()}, sensor <span className="font-medium text-brand-ink">{selectedEvent.sensorId}</span> located at <span className="font-medium text-brand-ink">{selectedEvent.locationName}</span> detected anomalous levels.
          </p>
          
          <div className="detect-text grid grid-cols-2 gap-8 py-8 border-y border-brand-soft">
            <div>
              <div className="text-sm text-brand-moss uppercase mb-2 tracking-widest">Peak Concentration</div>
              <div className="text-5xl text-brand-danger font-medium">{selectedEvent.concentration}</div>
            </div>
            <div>
              <div className="text-sm text-brand-moss uppercase mb-2 tracking-widest">Baseline</div>
              <div className="text-5xl text-brand-ink font-light">{selectedEvent.baseline}</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
