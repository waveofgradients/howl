import { useRef } from 'react';

interface CheckeredPatternProps {
  accentColor: string;
  position: 'top' | 'bottom';
  exploding?: boolean;
}

export function CheckeredPattern({ accentColor, position, exploding = false }: CheckeredPatternProps) {
  const isTop = position === 'top';
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use CSS calc with vw for responsive sizing
  // 8 squares + 7 gaps = 15 units, each unit = 100vw/15 = 6.667vw
  const unit = 'calc(100vw / 15)';
  
  // 4 rows, pattern height = 4 units (just the squares, rows overlap slightly)
  const patternHeight = 'calc(100vw / 15 * 4)';
  
  return (
    <div 
      ref={containerRef}
      className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 overflow-hidden ${exploding ? 'checker-explode overflow-visible' : ''}`}
      style={{ 
        height: patternHeight,
        ...(isTop ? { transform: 'scaleY(-1)' } : {})
      }}
    >
      {/* Row 0 (bottom): 8 squares */}
      <div className="absolute bottom-0 left-0 right-0 flex" style={{ gap: unit }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="checker-square" style={{ backgroundColor: accentColor, width: unit, height: unit }} />
        ))}
      </div>
      
      {/* Row 1: 7 squares, 1 unit up, offset 1 unit left */}
      <div className="absolute left-0 right-0 flex" style={{ bottom: unit, paddingLeft: unit, gap: unit }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="checker-square" style={{ backgroundColor: accentColor, width: unit, height: unit }} />
        ))}
      </div>
      
      {/* Row 2: 6 squares, 2 units up, offset 2 units left */}
      <div className="absolute left-0 right-0 flex" style={{ bottom: `calc(${unit} * 2)`, paddingLeft: `calc(${unit} * 2)`, gap: unit }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="checker-square" style={{ backgroundColor: accentColor, width: unit, height: unit }} />
        ))}
      </div>
      
      {/* Row 3 (top): 5 squares, 3 units up, offset 3 units left */}
      <div className="absolute left-0 right-0 flex" style={{ bottom: `calc(${unit} * 3)`, paddingLeft: `calc(${unit} * 3)`, gap: unit }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="checker-square" style={{ backgroundColor: accentColor, width: unit, height: unit }} />
        ))}
      </div>
    </div>
  );
}

