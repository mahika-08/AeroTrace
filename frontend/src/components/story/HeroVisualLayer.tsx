import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AtmosphericParticles from './AtmosphericParticles';
import { useAppStore } from '../../store/useAppStore';

export default function HeroVisualLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { selectedEventId } = useAppStore();

  useEffect(() => {
    // Subtle breathing animation for the background image
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 20,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 
        The background image itself.
        We position it to dominate the center/right.
        Using object-cover and setting transform origin to bias right.
      */}
      <img 
        ref={imageRef}
        src="/images/aerotrace-atmosphere-hero.png" 
        alt="Atmospheric Flow Visualization" 
        className="absolute inset-0 w-full h-full object-cover origin-right"
        style={{
          // On mobile, keep it centered. On desktop, shift right slightly if needed, but object-cover usually handles it
          objectPosition: '80% 50%' 
        }}
      />
      
      {/* 
        A masking gradient to ensure UI readability on the left side and top.
        Also crop/obscure any embedded fake UI from the generated image at the edges.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/50 via-transparent to-brand-bg/30" />

      {/* Edge vignettes to hide fake UI from the generated image */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-bg to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-brand-bg to-transparent" />
      
      {/* Subtle motion layer: particles representing atmospheric movement */}
      {/* The particles will move faster or change direction based on state if needed */}
      <AtmosphericParticles windDirection={selectedEventId ? 60 : 45} windSpeed={selectedEventId ? 3 : 1.5} />
      
      {/* Additional subtle pulsing overlay to simulate plume activity */}
      <div className="absolute inset-0 bg-brand-danger mix-blend-overlay opacity-10 animate-pulse" />
    </div>
  );
}
