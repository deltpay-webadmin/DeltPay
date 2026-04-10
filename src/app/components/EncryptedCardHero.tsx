import { useEffect, useRef } from 'react';
import deltLogo from 'figma:asset/c1caa4f78b35e50382a2178946fc9a6e1da11896.png';

export function EncryptedCardHero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const letters = lettersRef.current;
    const revealed = revealedRef.current;
    const glow = glowRef.current;

    if (!card || !letters || !revealed || !glow) return;

    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const paymentData = [
      "TXN#8821 $124.50 VISA *4821 APPROVED",
      "TXN#8822 $38.00 MC *9034 APPROVED",
      "TXN#8823 $512.75 AMEX *1122 APPROVED",
      "TXN#8824 $19.99 VISA *3341 APPROVED",
      "TXN#8825 $88.40 MC *7761 APPROVED",
      "ENC:AES256 TOKEN:4f9a2b SSL:TLS1.3",
      "PCI-DSS COMPLIANT GATEWAY ACTIVE",
      "TXN#8826 $245.00 VISA *5590 APPROVED",
      "SETTLE:$1,028.64 BATCH#441 COMPLETE",
      "TXN#8827 $67.20 DISC *8823 APPROVED",
    ];

    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const randomString = (n: number) => Array.from({ length: n }, randomChar).join('');
    const buildPaymentBlock = () => Array.from({ length: 60 }, (_, i) => paymentData[i % paymentData.length]).join('  ');

    // Initial random string
    letters.innerText = randomString(3000);

    // Start noise animation
    intervalRef.current = setInterval(() => {
      letters.innerText = randomString(3000);
    }, 80);

    function setPos(x: number, y: number) {
      [letters, revealed, glow].forEach(el => {
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
      });
    }

    function handleMove(e: MouseEvent | Touch) {
      const rect = card.getBoundingClientRect();
      const x = 'clientX' in e ? e.clientX : e.clientX;
      const y = 'clientY' in e ? e.clientY : e.clientY;
      setPos(x - rect.left, y - rect.top);
      revealed.innerText = buildPaymentBlock();
    }

    function handleLeave() {
      setPos(-999, -999);
      revealed.innerText = '';
    }

    function handleMouseMove(e: MouseEvent) {
      handleMove(e);
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0]);
      }
    }

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleLeave);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleLeave);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleLeave);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full">
      <style>{`
        .encrypted-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #050d1a 100%);
          border-radius: 20px;
          overflow: hidden;
          cursor: crosshair;
          border: 1px solid rgba(73, 69, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(73, 69, 255, 0.08);
        }
        .card-letters {
          position: absolute;
          inset: 0;
          padding: 24px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.6;
          letter-spacing: 0.04em;
          color: #4a6b96;
          word-break: break-all;
          overflow: hidden;
          -webkit-mask-image: radial-gradient(circle 140px at var(--x, -999px) var(--y, -999px), transparent 0%, transparent 60%, black 100%);
          mask-image: radial-gradient(circle 140px at var(--x, -999px) var(--y, -999px), transparent 0%, transparent 60%, black 100%);
          user-select: none;
          pointer-events: none;
        }
        .card-revealed {
          position: absolute;
          inset: 0;
          padding: 24px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.6;
          letter-spacing: 0.04em;
          color: #7c85ff;
          word-break: break-all;
          overflow: hidden;
          -webkit-mask-image: radial-gradient(circle 140px at var(--x, -999px) var(--y, -999px), black 0%, black 55%, transparent 100%);
          mask-image: radial-gradient(circle 140px at var(--x, -999px) var(--y, -999px), black 0%, black 55%, transparent 100%);
          user-select: none;
          pointer-events: none;
        }
        .card-edge-glow {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          pointer-events: none;
          -webkit-mask-image: radial-gradient(circle 160px at var(--x, -999px) var(--y, -999px), black 0%, transparent 100%);
          mask-image: radial-gradient(circle 160px at var(--x, -999px) var(--y, -999px), black 0%, transparent 100%);
          border: 1px solid #8a93ff;
          opacity: 0.7;
        }
        .card-logo {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          pointer-events: none;
          z-index: 10;
        }
        .logo-sub {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2a3f5f;
        }
      `}</style>

      <div className="encrypted-card" ref={cardRef}>
        <div className="card-letters" ref={lettersRef}></div>
        <div className="card-revealed" ref={revealedRef}></div>
        <div className="card-edge-glow" ref={glowRef}></div>
        <div className="card-logo">
          <img 
            src={deltLogo} 
            alt="Delt" 
            style={{ 
              width: '130px', 
              height: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>
      </div>
    </div>
  );
}