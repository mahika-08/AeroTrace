import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import HeroVisualLayer from './HeroVisualLayer';

export default function AtmosphereSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-line', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
      );
      
      // ScrollTrigger animation for background parallax/fading
      gsap.to('.hero-visual-container', {
        yPercent: 30,
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative overflow-hidden bg-brand-bg">
      <div className="hero-visual-container absolute inset-0 z-0">
        <HeroVisualLayer />
      </div>
      
      <div className="h-full w-full flex flex-col justify-center px-8 md:px-24 relative z-10">
        <div className="max-w-7xl">
          <p className="hero-line text-brand-moss uppercase tracking-[0.2em] font-medium mb-12">AeroTrace</p>
          <h1 className="huge-typography font-medium text-brand-ink mb-8 mix-blend-multiply">
            <div className="hero-line overflow-hidden"><span className="block">WHERE DID</span></div>
            <div className="hero-line overflow-hidden"><span className="block">THE POLLUTION</span></div>
            <div className="hero-line overflow-hidden"><span className="block">COME FROM?</span></div>
          </h1>
          
          <div className="hero-line overflow-hidden mb-12 max-w-xl">
            <p className="text-xl md:text-2xl text-brand-forest font-light leading-relaxed block">
              Tracing pollution to its probable industrial sources.
            </p>
          </div>
          
          <div className="hero-line overflow-hidden">
            <button 
              onClick={() => {
                const nextSection = document.getElementById('monitor-section');
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback to events if sections are reorganized later
                  navigate('/events');
                }
              }}
              className="inline-flex items-center px-8 py-4 bg-brand-forest text-brand-bg font-medium tracking-wide hover:bg-brand-ink transition-colors duration-300 rounded-sm"
            >
              EXPLORE THE INVESTIGATION
              <svg className="ml-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
