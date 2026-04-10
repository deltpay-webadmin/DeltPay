import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

interface LockedWidgetProps {
  children: React.ReactNode;
  blurAmount?: number;
  label?: string;
  height?: string | number;
  dimOverlay?: boolean;
}

export function LockedWidget({
  children,
  blurAmount = 7,
  label = 'Start trial to explore',
  height,
  dimOverlay = false,
}: LockedWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden" style={height !== undefined ? { minHeight: height } : {}}>
      {/* Blurred content */}
      <div
        style={{
          filter: `blur(${blurAmount}px)`,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>

      {/* Overlay */}
      {dimOverlay && (
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(255,255,255,0.32)' }}
        />
      )}

      {/* CTA button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-xs transition-all hover:shadow-md active:scale-95"
          style={{
            fontWeight: 500,
            color: '#333',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
            letterSpacing: '-0.1px',
          }}
        >
          <Lock className="w-3 h-3" style={{ color: '#aaa' }} />
          {label}
        </button>
      </div>
    </div>
  );
}
