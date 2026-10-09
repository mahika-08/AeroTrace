import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Wind } from 'lucide-react';
import AeroTraceMap from '../map/AeroTraceMap';
import { Source, Layer } from 'react-map-gl/maplibre';

export default function WindSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.wind-text', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Fake wind trajectory GeoJSON
  const trajectoryData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-118.2437, 34.0522], // Event
            [-118.2600, 34.0550],
            [-118.2800, 34.0580],
            [-118.3000, 34.0620]
          ]
        },
        properties: {}
      }
    ]
  };

  return (
    <section ref={containerRef} className="min-h-screen w-full py-32 flex flex-col justify-center relative z-10 border-t border-brand-soft/50 bg-brand-soft/20 overflow-hidden">
      
      {/* Immersive Map Background */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply filter grayscale">
        <AeroTraceMap
          center={[-118.260, 34.055]}
          zoom={12}
          pitch={30}
          interactive={false}
          facilities={[]}
          sensors={[]}
          events={[]}
        >
          {/* Animated Trajectory */}
          <Source id="trajectory" type="geojson" data={trajectoryData as any}>
            <Layer
              id="trajectory-line"
              type="line"
              paint={{
                'line-color': '#17231D',
                'line-width': 4,
                'line-dasharray': [2, 4],
              }}
            />
          </Source>
        </AeroTraceMap>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg"></div>
      
      <div className="px-8 md:px-24 z-10 max-w-7xl mx-auto w-full">
        <h2 className="wind-text text-sm text-brand-moss uppercase tracking-[0.2em] mb-16 flex items-center gap-3">
          <Wind size={20} /> Follow The Wind
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h3 className="wind-text text-5xl md:text-7xl font-medium mb-12 leading-tight">
              Pollution<br/>moves with the<br/>atmosphere.
            </h3>
            <p className="wind-text text-2xl font-light text-brand-ink/80 max-w-lg leading-relaxed">
              We trace the trajectory backwards from the sensor, tracking the meteorological state exactly at the time of detection.
            </p>
          </div>
          
          <div className="flex flex-col justify-center gap-12 border-l border-brand-ink/20 pl-12">
            <div className="wind-text">
              <div className="text-8xl font-light tracking-tighter mb-4">270°</div>
              <div className="text-lg uppercase tracking-widest text-brand-moss font-medium">From West</div>
            </div>
            
            <div className="wind-text">
              <div className="text-8xl font-light tracking-tighter mb-4">18<span className="text-4xl text-brand-ink/50 ml-2">km/h</span></div>
              <div className="text-lg uppercase tracking-widest text-brand-moss font-medium">Wind Speed</div>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  );
}
