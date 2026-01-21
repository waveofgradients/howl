interface CircularProgressProps {
  accentColor: string;
  dailyProgress: number;
  feedback: string;
}

export function CircularProgress({ 
  accentColor, 
  dailyProgress, 
  feedback,
}: CircularProgressProps) {
  return (
    <div className="relative w-[194px] h-[194px]">
      {/* Background stroke ring (white, 20% opacity) */}
      <svg 
        className="absolute inset-0 w-[194px] h-[194px]"
        viewBox="0 0 194 194"
      >
        <circle 
          cx="97" 
          cy="97" 
          r="83" 
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="22"
          fill="none"
        />
      </svg>
      
      {/* Progress stroke ring */}
      <svg 
        className="absolute inset-0 w-[194px] h-[194px]"
        viewBox="0 0 194 194"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle 
          cx="97" 
          cy="97" 
          r="83" 
          stroke={accentColor}
          strokeWidth="22"
          fill="none"
          strokeDasharray={`${dailyProgress * 521.5} 521.5`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.5s ease-out',
            filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.02)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.06))',
          }}
        />
      </svg>
      
      {/* Feedback text inside ring */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
      >
        <span 
          className="font-bricolage font-bold text-[20px] tracking-tight text-center"
          style={{ color: accentColor }}
        >
          {feedback || ''}
        </span>
      </div>
    </div>
  );
}
