export function AnimatedClock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Clock circle */}
      <circle cx="12" cy="12" r="10" />
      
      {/* Hour hand (pointing at 10 o'clock) - stationary */}
      <line x1="12" y1="12" x2="9" y2="8" className="origin-center" />
      
      {/* Minute hand (pointing at 12) - rotating */}
      <line 
        x1="12" 
        y1="12" 
        x2="12" 
        y2="6" 
        className="origin-center animate-minute-hand"
      />
    </svg>
  );
}
