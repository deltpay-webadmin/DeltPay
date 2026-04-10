import { useEffect, useRef } from 'react';

export function CPULoadingAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <style>{`
        @keyframes cpu-trace-flow {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.7;
          }
        }

        .cpu-trace-bg {
          fill: none;
          stroke: rgba(59, 130, 246, 0.08);
          stroke-width: 2;
        }

        .cpu-trace-flow {
          fill: none;
          stroke-width: 2.5;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          stroke-linecap: round;
        }

        .cpu-trace-flow.purple {
          stroke: #5E6BFF;
          animation: cpu-trace-flow 2.5s ease-in-out infinite;
        }

        .cpu-trace-flow.blue {
          stroke: #60A5FA;
          animation: cpu-trace-flow 2.5s ease-in-out infinite 0.3s;
        }

        .cpu-trace-flow.cyan {
          stroke: #2BB8F9;
          animation: cpu-trace-flow 2.5s ease-in-out infinite 0.6s;
        }

        .cpu-trace-flow.teal {
          stroke: #6FD1B0;
          animation: cpu-trace-flow 2.5s ease-in-out infinite 0.9s;
        }

        .cpu-trace-flow.lavender {
          stroke: #93C5FD;
          animation: cpu-trace-flow 2.5s ease-in-out infinite 0.45s;
        }

        @keyframes cpu-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        .cpu-core-pulse {
          animation: cpu-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 800 500"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[400px]"
        style={{ filter: 'drop-shadow(0 0 20px rgba(94, 107, 255, 0.15))' }}
      >
        <defs>
          <linearGradient id="cpuChipGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E6BFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2BB8F9" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="cpuTextGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#5E6BFF" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="cpuPinGradient" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#5E6BFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2BB8F9" stopOpacity="0.15" />
          </linearGradient>

          <filter id="cpuGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#5E6BFF" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Data traces */}
        <g id="traces">
          {/* Left side traces */}
          <path d="M100 100 H200 V210 H326" className="cpu-trace-bg" />
          <path d="M100 100 H200 V210 H326" className="cpu-trace-flow purple" />

          <path d="M80 180 H180 V230 H326" className="cpu-trace-bg" />
          <path d="M80 180 H180 V230 H326" className="cpu-trace-flow blue" />

          <path d="M60 260 H150 V250 H326" className="cpu-trace-bg" />
          <path d="M60 260 H150 V250 H326" className="cpu-trace-flow cyan" />

          <path d="M100 350 H200 V270 H326" className="cpu-trace-bg" />
          <path d="M100 350 H200 V270 H326" className="cpu-trace-flow teal" />

          {/* Right side traces */}
          <path d="M700 90 H560 V210 H474" className="cpu-trace-bg" />
          <path d="M700 90 H560 V210 H474" className="cpu-trace-flow blue" />

          <path d="M740 160 H580 V230 H474" className="cpu-trace-bg" />
          <path d="M740 160 H580 V230 H474" className="cpu-trace-flow teal" />

          <path d="M720 250 H590 V250 H474" className="cpu-trace-bg" />
          <path d="M720 250 H590 V250 H474" className="cpu-trace-flow lavender" />

          <path d="M680 340 H570 V270 H474" className="cpu-trace-bg" />
          <path d="M680 340 H570 V270 H474" className="cpu-trace-flow cyan" />
        </g>

        {/* CPU chip body */}
        <rect
          x="330"
          y="190"
          width="140"
          height="100"
          rx="12"
          ry="12"
          fill="url(#cpuChipGradient)"
          stroke="#5E6BFF"
          strokeWidth="2"
          strokeOpacity="0.3"
          filter="url(#cpuGlow)"
        />

        {/* Left pins */}
        <g>
          <rect x="322" y="205" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="322" y="225" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="322" y="245" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="322" y="265" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
        </g>

        {/* Right pins */}
        <g>
          <rect x="470" y="205" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="470" y="225" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="470" y="245" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
          <rect x="470" y="265" width="8" height="10" fill="url(#cpuPinGradient)" rx="2" />
        </g>

        {/* Center text */}
        <text
          x="400"
          y="242"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="18"
          fontWeight="500"
          fill="url(#cpuTextGradient)"
          textAnchor="middle"
          className="cpu-core-pulse"
        >
          Analyzing...
        </text>

        {/* Data source nodes (left) */}
        <circle cx="100" cy="100" r="5" fill="#5E6BFF" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="80" cy="180" r="5" fill="#60A5FA" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="60" cy="260" r="5" fill="#2BB8F9" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="100" cy="350" r="5" fill="#6FD1B0" opacity="0.7" className="cpu-core-pulse" />

        {/* Data destination nodes (right) */}
        <circle cx="700" cy="90" r="5" fill="#60A5FA" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="740" cy="160" r="5" fill="#6FD1B0" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="720" cy="250" r="5" fill="#93C5FD" opacity="0.7" className="cpu-core-pulse" />
        <circle cx="680" cy="340" r="5" fill="#2BB8F9" opacity="0.7" className="cpu-core-pulse" />
      </svg>
    </div>
  );
}