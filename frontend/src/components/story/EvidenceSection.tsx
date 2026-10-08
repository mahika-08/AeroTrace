import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAppStore } from '../../store/useAppStore';
import { Marker } from 'react-map-gl/maplibre';
import AeroTraceMap from '../map/AeroTraceMap';

const EVIDENCE_FACTORS = [
  { id: 'wind', label: 'Wind Alignment', desc: 'Candidate facility lies directly upwind within a 15° margin of error during the event window.' },
  { id: 'time', label: 'Temporal Alignment', desc: 'Travel time computed using wind speed matches the lag between facility operation hours and sensor detection.' },
  { id: 'distance', label: 'Distance', desc: 'Facility is within a 5km radius, highly correlating with the severity of the concentration spike.' },
  { id: 'profile', label: 'Emission Profile', desc: 'Historical permit data indicates this facility processes chemicals matching the detected VOC signature.' }
];

export default function EvidenceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { facilities, selectedEvidenceFactor, setSelectedEvidenceFactor } = useAppStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.evidence-title', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        },
        y: 30,
        opacity: 0,
        duration: 1
      });
      
      gsap.from('.evidence-item', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        x: -40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen w-full py-32 px-8 md:px-24 flex flex-col justify-center relative z-10 border-t border-brand-soft/50 bg-brand-bg">
      
      <h2 className="evidence-title text-sm text-brand-moss uppercase tracking-[0.2em] mb-16">Follow The Evidence</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Interactive Evidence List */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-6">
          <h3 className="evidence-title text-4xl md:text-5xl font-medium mb-8 leading-tight">
            How do we isolate candidates?
          </h3>
          
          <div className="space-y-4">
            {EVIDENCE_FACTORS.map(factor => {
              const isActive = selectedEvidenceFactor === factor.id;
              return (
                <button 
                  key={factor.id}
                  onClick={() => setSelectedEvidenceFactor(isActive ? null : factor.id)}
                  className={`evidence-item w-full text-left p-6 border transition-all duration-500 rounded-lg group ${
                    isActive 
                      ? 'border-brand-ink bg-brand-ink text-brand-bg shadow-xl scale-[1.02]' 
                      : 'border-brand-soft hover:border-brand-moss bg-brand-bg text-brand-ink'
                  }`}
                >
                  <div className={`text-sm uppercase tracking-widest font-medium mb-3 transition-colors ${isActive ? 'text-brand-soft' : 'text-brand-moss'}`}>
                    {factor.label}
                  </div>
                  <div className={`text-lg transition-colors ${isActive ? 'text-white' : 'text-brand-ink/70'}`}>
                    {factor.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Visualization reacting to selected evidence */}
        <div className="lg:col-span-7 h-[700px] rounded-2xl border border-brand-soft/50 shadow-2xl relative overflow-hidden bg-brand-soft flex flex-col transition-all duration-700">
          
          {/* Default State: Show facilities on Map */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${!selectedEvidenceFactor || selectedEvidenceFactor === 'distance' || selectedEvidenceFactor === 'wind' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <AeroTraceMap 
              zoom={selectedEvidenceFactor === 'distance' ? 12.5 : 13.5}
              pitch={selectedEvidenceFactor === 'wind' ? 45 : 0}
              interactive={false}
              facilities={[]} // Provide our own custom rendering below
            >
              {facilities.map(fac => {
                const isHighlight = selectedEvidenceFactor === 'distance' ? fac.id === 'FAC-101' : true;
                return (
                  <Marker key={fac.id} longitude={fac.coordinates[1]} latitude={fac.coordinates[0]}>
                    <div className={`transition-all duration-500 ${isHighlight ? 'w-6 h-6 bg-brand-forest shadow-xl' : 'w-3 h-3 bg-brand-forest/40'} rounded border-2 border-white`}></div>
                  </Marker>
                );
              })}
              
              {/* Fake distance radius if distance is selected */}
              {selectedEvidenceFactor === 'distance' && (
                <Marker longitude={-118.2437} latitude={34.0522}>
                  <div className="w-[300px] h-[300px] bg-brand-danger/10 border border-brand-danger/30 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
                </Marker>
              )}
            </AeroTraceMap>
          </div>
          
          {/* Profile State: Show bar chart */}
          <div className={`absolute inset-0 bg-brand-bg p-12 transition-opacity duration-700 flex flex-col justify-center ${selectedEvidenceFactor === 'profile' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
             <div className="text-sm font-mono text-brand-moss mb-8 tracking-widest uppercase">Emission Signatures Compared</div>
             <div className="flex-1 flex items-end justify-center gap-16 border-b border-brand-soft pb-4">
               {/* Detected Signature */}
               <div className="flex flex-col items-center gap-4">
                 <div className="h-64 flex items-end gap-2">
                   <div className="w-12 bg-brand-danger shadow" style={{ height: '95%' }}></div>
                   <div className="w-12 bg-brand-danger/60" style={{ height: '30%' }}></div>
                   <div className="w-12 bg-brand-danger/30" style={{ height: '10%' }}></div>
                 </div>
                 <div className="font-medium text-lg">Detected Event</div>
               </div>
               
               {/* Candidate A */}
               <div className="flex flex-col items-center gap-4 opacity-50">
                 <div className="h-64 flex items-end gap-2">
                   <div className="w-12 bg-brand-ink/20" style={{ height: '20%' }}></div>
                   <div className="w-12 bg-brand-ink/20" style={{ height: '80%' }}></div>
                   <div className="w-12 bg-brand-ink/20" style={{ height: '40%' }}></div>
                 </div>
                 <div className="font-medium text-lg">SteelWorks Inc.</div>
               </div>
               
               {/* Candidate B */}
               <div className="flex flex-col items-center gap-4">
                 <div className="h-64 flex items-end gap-2">
                   <div className="w-12 bg-brand-data shadow" style={{ height: '85%' }}></div>
                   <div className="w-12 bg-brand-data/60" style={{ height: '40%' }}></div>
                   <div className="w-12 bg-brand-data/30" style={{ height: '15%' }}></div>
                 </div>
                 <div className="font-medium text-lg text-brand-data">ChemCorp Processing</div>
               </div>
             </div>
          </div>
          
          {/* Temporal State */}
          <div className={`absolute inset-0 bg-brand-bg p-12 transition-opacity duration-700 flex flex-col justify-center ${selectedEvidenceFactor === 'time' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="text-sm font-mono text-brand-moss mb-12 tracking-widest uppercase">Timeline Reconstruction</div>
            <div className="relative h-32 w-full border-t-2 border-brand-soft flex items-center">
              
              <div className="absolute top-[-10px] left-[10%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-brand-data shadow"></div>
                <div className="mt-4 text-center">
                  <div className="font-mono text-sm">08:15 AM</div>
                  <div className="font-medium text-sm text-brand-data">Facility Operation</div>
                </div>
              </div>
              
              <div className="absolute h-1 bg-brand-data/30 top-[-2px] left-[10%] w-[60%]"></div>
              
              <div className="absolute top-[-10px] left-[70%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-brand-danger shadow animate-pulse"></div>
                <div className="mt-4 text-center">
                  <div className="font-mono text-sm">08:45 AM</div>
                  <div className="font-medium text-sm text-brand-danger">Sensor Spike</div>
                </div>
              </div>
              
              <div className="absolute bottom-[-60px] left-[40%] text-brand-ink/60 italic text-sm text-center">
                ~30 min travel time based on wind speed
              </div>
              
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
