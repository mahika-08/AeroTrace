import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AeroTraceNavbar from './AeroTraceNavbar';
import { gsap } from 'gsap';

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      
      // Animate out
      gsap.to('.page-content', {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setDisplayLocation(location);
          // Animate in
          gsap.fromTo('.page-content', 
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
          );
        }
      });
    }
  }, [location, displayLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-ink">
      <AeroTraceNavbar />
      <main className="flex-1 w-full h-full page-content">
        {displayLocation.pathname === location.pathname ? children : null}
      </main>
    </div>
  );
}
