import { useEffect, useRef } from 'react';

interface AudioBarsProps {
  isActive: boolean;
  color: string;
}

export function AudioBars({ isActive, color }: AudioBarsProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const valuesRef = useRef([0.4, 0.6, 0.8, 0.6, 0.4]);
  const targetsRef = useRef([0.4, 0.6, 0.8, 0.6, 0.4]);
  
  useEffect(() => {
    if (!isActive) {
      // Reset bars
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = '8px';
      });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    let frameCount = 0;
    
    const animate = () => {
      frameCount++;
      
      // Update targets every few frames for smoother look
      if (frameCount % 4 === 0) {
        targetsRef.current = targetsRef.current.map(() => 
          0.3 + Math.random() * 0.7
        );
      }
      
      // Smoothly interpolate toward targets
      valuesRef.current = valuesRef.current.map((val, i) => {
        const target = targetsRef.current[i];
        return val + (target - val) * 0.3;
      });
      
      // Apply to DOM
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const height = 8 + valuesRef.current[i] * 20;
          bar.style.height = `${height}px`;
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive]);
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          ref={el => barsRef.current[i] = el}
          className="w-1 rounded-full"
          style={{
            backgroundColor: color,
            height: '8px',
          }}
        />
      ))}
    </div>
  );
}
