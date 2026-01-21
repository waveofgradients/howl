import { useEffect, useRef } from 'react';

interface AudioBarsProps {
  isActive: boolean;
  color: string;
}

export function AudioBars({ isActive, color }: AudioBarsProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isActive) {
      // Reset bars to idle state
      barsRef.current.forEach(bar => {
        if (bar) bar.style.transform = 'scaleY(0.3)';
      });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    // Animate bars with randomized wave pattern
    // This avoids mic conflicts with Web Speech API on iOS
    let phase = 0;
    
    const animate = () => {
      phase += 0.15;
      
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          // Create wave-like animation with some randomness
          const wave = Math.sin(phase + i * 0.8) * 0.35 + 0.5;
          const noise = Math.random() * 0.15;
          const scale = Math.max(0.25, Math.min(1, wave + noise));
          bar.style.transform = `scaleY(${scale})`;
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
    <div className="flex items-center justify-center gap-[3px] h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          ref={el => barsRef.current[i] = el}
          className="w-[4px] h-7 rounded-full origin-center"
          style={{
            backgroundColor: color,
            transform: 'scaleY(0.3)',
            transition: 'transform 0.05s ease-out',
          }}
        />
      ))}
    </div>
  );
}
