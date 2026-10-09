import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export default function AttributionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { selectedEventId, events } = useAppStore();
  const eventIdToInvestigate = selectedEventId || (events.length > 0 ? events[0].id : 'EVT-001');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.attr-text', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1
      });
      
      gsap.from('.workspace-button', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.5)',
        delay: 0.4
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 px-8 text-center bg-brand-ink text-brand-bg">
      
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="attr-text text-sm text-brand-soft uppercase tracking-[0.2em] mb-8">Attribution Complete</h2>
        
        <h3 className="attr-text text-5xl md:text-7xl font-medium mb-12 leading-tight">
          The environment has a memory. We just give it a voice.
        </h3>
        
        <p className="attr-text text-xl font-light text-brand-soft/80 mb-16 max-w-2xl leading-relaxed">
          The system has isolated the most probable source of the pollution event. Transition to the Investigation Workspace to analyze the raw data and generate the final compliance report.
        </p>
        
        <button 
          onClick={() => navigate(`/investigation/${eventIdToInvestigate}`)}
          className="workspace-button px-12 py-5 bg-brand-moss text-white hover:bg-brand-forest transition-colors rounded text-sm uppercase tracking-[0.15em] font-medium shadow-2xl flex items-center gap-4 group"
        >
          Enter Investigation Workspace
          <span className="group-hover:translate-x-2 transition-transform">→</span>
        </button>
      </div>
      
    </section>
  );
}
