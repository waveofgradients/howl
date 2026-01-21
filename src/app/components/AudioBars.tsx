import { useEffect, useRef, useCallback } from 'react';
import { 
  startAudioVisualization, 
  stopAudioVisualization, 
  getAudioLevels 
} from '@/utils/audio-visualizer';

interface AudioBarsProps {
  isActive: boolean;
  color: string;
}

export function AudioBars({ isActive, color }: AudioBarsProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Direct DOM updates - no React re-renders!
  const updateBars = useCallback(() => {
    const now = performance.now();
    // Throttle to ~30fps for performance
    if (now - lastUpdateRef.current < 33) {
      animationRef.current = requestAnimationFrame(updateBars);
      return;
    }
    lastUpdateRef.current = now;
    
    const levels = getAudioLevels();
    
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const scale = Math.max(0.3, levels[i]);
        bar.style.transform = `scaleY(${scale})`;
      }
    });
    
    animationRef.current = requestAnimationFrame(updateBars);
  }, []);
  
  useEffect(() => {
    if (!isActive) {
      // Reset bars
      barsRef.current.forEach(bar => {
        if (bar) bar.style.transform = 'scaleY(0.3)';
      });
      return;
    }
    
    const start = async () => {
      try {
        await startAudioVisualization();
        updateBars();
      } catch (err) {
        console.error('Failed to start audio bars:', err);
      }
    };
    
    start();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      stopAudioVisualization();
    };
  }, [isActive, updateBars]);
  
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
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}

