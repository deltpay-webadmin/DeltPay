import { useState, useEffect, useMemo } from 'react';
import { MousePointer2 } from 'lucide-react';
import dashboardImg from 'figma:asset/a80c623d79d039dc9bcadfb721af4dca42826e89.png';
import marketingHubImg from 'figma:asset/6285400ff31820e6a70b1ba2bc1064a075a8b09a.png';
import payoutsImg from 'figma:asset/86a7cd54a28cc1bb338677b0fb11613c2684e002.png';

type DashboardView = 'dashboard' | 'marketing' | 'payouts';

interface AnimationStep {
  x: number;
  y: number;
  duration: number;
  action: 'move' | 'click';
  nextView?: DashboardView;
  pause?: number;
}

export function CRMDashboardDemo() {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dashboardImages = useMemo(() => ({
    dashboard: dashboardImg,
    marketing: marketingHubImg,
    payouts: payoutsImg,
  }), []);

  const animationSequence = useMemo<AnimationStep[]>(() => [
    { x: 50, y: 50, duration: 1000, action: 'move', pause: 500 },
    { x: 7.5, y: 16.5, duration: 1200, action: 'move' },
    { x: 7.5, y: 16.5, duration: 200, action: 'click', pause: 400 },
    { x: 7.5, y: 20.5, duration: 600, action: 'move' },
    { x: 7.5, y: 20.5, duration: 200, action: 'click', nextView: 'dashboard', pause: 2500 },
    { x: 50, y: 40, duration: 800, action: 'move', pause: 1000 },
    { x: 7.5, y: 47, duration: 1200, action: 'move' },
    { x: 7.5, y: 47, duration: 200, action: 'click', pause: 400 },
    { x: 7.5, y: 51, duration: 600, action: 'move' },
    { x: 7.5, y: 51, duration: 200, action: 'click', nextView: 'marketing', pause: 2500 },
    { x: 55, y: 45, duration: 800, action: 'move', pause: 1000 },
    { x: 7.5, y: 52, duration: 1200, action: 'move' },
    { x: 7.5, y: 52, duration: 200, action: 'click', pause: 400 },
    { x: 7.5, y: 56, duration: 600, action: 'move' },
    { x: 7.5, y: 56, duration: 200, action: 'click', nextView: 'payouts', pause: 3000 },
    { x: 60, y: 50, duration: 800, action: 'move', pause: 2000 },
  ], []);

  useEffect(() => {
    let currentStep = 0;
    let timeoutId: number;

    const executeStep = () => {
      if (currentStep >= animationSequence.length) {
        currentStep = 0;
      }

      const step = animationSequence[currentStep];
      setCursorPosition({ x: step.x, y: step.y });

      if (step.action === 'click') {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 200);

        if (step.nextView) {
          setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentView(step.nextView!);
              setIsTransitioning(false);
            }, 150);
          }, 100);
        }
      }

      const nextDelay = step.duration + (step.pause || 0);
      currentStep++;
      timeoutId = window.setTimeout(executeStep, nextDelay);
    };

    timeoutId = window.setTimeout(executeStep, 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [animationSequence]);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-[#E5E7EB]" style={{ boxShadow: '0 8px 40px rgba(4,30,66,0.10), 0 2px 12px rgba(4,30,66,0.06)' }}>
      {/* Dashboard View */}
      <div className="relative w-full h-[700px] flex overflow-hidden bg-white">
        <div 
          className={`relative w-full h-full transition-opacity duration-150 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            src={dashboardImages[currentView]}
            alt="Delt dashboard"
            className="w-full h-full object-contain object-left-top"
          />
        </div>
      </div>

      {/* Animated Cursor */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute transition-all ease-out"
          style={{
            left: `${cursorPosition.x}%`,
            top: `${cursorPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            transitionDuration: '1200ms',
          }}
        >
          <div className={`relative transition-transform duration-200 ${isClicking ? 'scale-90' : 'scale-100'}`}>
            <MousePointer2 
              className="w-7 h-7 text-[#041E42] drop-shadow-xl" 
              fill="#FFFFFF"
              strokeWidth={2.5}
            />
            
            {/* Click ripple */}
            {isClicking && (
              <div className="absolute top-0 left-0 w-7 h-7 bg-[#4945FF] rounded-full opacity-30 animate-ping" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}