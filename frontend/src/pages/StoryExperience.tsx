import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import components
import AtmosphereSection from '../components/story/AtmosphereSection';
import MonitorSection from '../components/story/MonitorSection';
import DetectSection from '../components/story/DetectSection';
import WindSection from '../components/story/WindSection';
import EvidenceSection from '../components/story/EvidenceSection';
import AttributionSection from '../components/story/AttributionSection';

gsap.registerPlugin(ScrollTrigger);

export default function StoryExperience() {
  const { isLoading, error, initializeData } = useAppStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg relative overflow-hidden">
        <div className="noise-overlay pointer-events-none z-50"></div>
        <div className="atmospheric-bg pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-brand-moss/20 border-t-brand-moss rounded-full animate-spin"></div>
          <div className="text-sm font-mono tracking-widest text-brand-moss uppercase">Initializing Atmospheric Models...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg relative">
        <div className="noise-overlay pointer-events-none z-50"></div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl text-brand-danger mb-4">System Error</h2>
          <p className="text-brand-ink/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-brand-bg min-h-screen text-brand-ink overflow-x-hidden selection:bg-brand-moss/30 selection:text-brand-ink">
      {/* Global Environmental Effects */}
      <div className="noise-overlay pointer-events-none z-50 fixed inset-0"></div>
      <div className="atmospheric-bg pointer-events-none z-0 fixed inset-0"></div>
      
      {/* Narrative Sections */}
      <AtmosphereSection />
      <MonitorSection />
      <DetectSection />
      <WindSection />
      <EvidenceSection />
      <AttributionSection />

    </div>
  );
}
