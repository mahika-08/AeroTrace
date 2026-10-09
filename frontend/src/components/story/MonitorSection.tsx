import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../../store/useAppStore';
import AeroTraceMap from '../map/AeroTraceMap';
import { normalizeCoordinates } from '../../utils/coordinates';

export default function MonitorSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeSensors, monitoredFacilities, activeEvents, sensors, facilities } = useAppStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-block', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
      });
      
      gsap.from('.map-reveal', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        opacity: 0,
        scale: 0.95,
        duration: 1.5,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const mapCenter = facilities.length > 0 
    ? normalizeCoordinates(facilities[0].coordinates)
    : undefined;

  return (
    <section ref={containerRef} className="min-h-screen w-full py-32 px-8 md:px-24 flex flex-col justify-center relative z-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-sm text-brand-moss uppercase tracking-[0.2em] mb-16">The Network</h2>
          
          <div className="space-y-16">
            <div className="stat-block">
              <div className="text-7xl md:text-8xl font-light text-brand-ink mb-2">{activeSensors}</div>
              <div className="text-sm font-medium tracking-wide uppercase text-brand-moss">Active Sensors</div>
            </div>
            
            <div className="stat-block">
              <div className="text-7xl md:text-8xl font-light text-brand-ink mb-2">{monitoredFacilities}</div>
              <div className="text-sm font-medium tracking-wide uppercase text-brand-moss">Monitored Facilities</div>
            </div>

            <div className="stat-block">
              <div className="text-7xl md:text-8xl font-light text-brand-danger mb-2">{activeEvents}</div>
              <div className="text-sm font-medium tracking-wide uppercase text-brand-danger">Active Events</div>
            </div>
          </div>
        </div>

        <div className="map-reveal h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl relative border border-brand-soft/50">
          <AeroTraceMap 
            facilities={facilities}
            sensors={sensors}
            center={mapCenter as [number, number]}
            zoom={11}
            interactive={false}
          />
          <div className="absolute inset-0 bg-brand-bg/10 pointer-events-none mix-blend-multiply"></div>
        </div>
      </div>
    </section>
  );
}
