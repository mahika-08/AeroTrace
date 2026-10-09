import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface AtmosphericParticlesProps {
  windDirection?: number; // degrees, 0 is North, 90 is East
  windSpeed?: number;
  active?: boolean;
}

export default function AtmosphericParticles({ 
  windDirection = 45, 
  windSpeed = 2,
  active = true
}: AtmosphericParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 40 : 150;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const rad = (windDirection - 90) * (Math.PI / 180);
      const targetVx = Math.cos(rad) * windSpeed;
      const targetVy = Math.sin(rad) * windSpeed;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      particles.forEach((p) => {
        // Smoothly adjust velocity towards target
        p.vx += (targetVx - p.vx) * 0.05;
        p.vy += (targetVy - p.vy) * 0.05;
        
        // Add a bit of turbulence
        p.x += p.vx + (Math.random() - 0.5) * 0.5;
        p.y += p.vy + (Math.random() - 0.5) * 0.5;
        
        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [windDirection, windSpeed, active]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
