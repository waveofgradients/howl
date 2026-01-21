import { useEffect, useState, useMemo } from 'react';

interface ParticleExplosionProps {
  active: boolean;
  accentColor: string;
  onComplete?: () => void;
}

export function ParticleExplosion({ active, accentColor, onComplete }: ParticleExplosionProps) {
  const [visible, setVisible] = useState(false);
  
  // Pre-calculate particle positions (only 12 particles for performance)
  const particles = useMemo(() => {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
    
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 120 + (i % 3) * 60;
      return {
        id: i,
        x: centerX,
        y: centerY,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 10 + (i % 2) * 8,
      };
    });
  }, []);
  
  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute rounded-sm"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: accentColor,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
