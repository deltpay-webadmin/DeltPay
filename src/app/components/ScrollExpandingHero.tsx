import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import deltLogo from 'figma:asset/ba16007295b082bbfe774b1ba0c31a403b5502d6.png';

const PURPLE  = '#4945FF';
const BG      = '#03152E';

const TOKENS = [
  'VISA','MC','AMEX','AUTH:','TXN:','CVV:','$','BIN:','PCI','EMV',
  'NFC','ACH','3DS','P2PE','EXP:','REF:','BATCH:','APPROVED',
  'ENCRYPTED','TOKENIZED','SETTLEMENT','CAPTURE',
];
const NOISE  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
const HEX    = '0123456789abcdef';
const DIGITS = '0123456789';
const FONT_SIZE = 11;
const COL_W     = 10; // wider columns → fewer draw calls per frame
const HEADLINE  = "Your money,\nwithout the wait.";

export function ScrollExpandingHero() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const logoRef       = useRef<HTMLDivElement>(null);
  const eyebrowRef    = useRef<HTMLDivElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const subRef        = useRef<HTMLDivElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const txnCountRef   = useRef<HTMLSpanElement>(null);
  const volCountRef   = useRef<HTMLSpanElement>(null);

  // Track rendered canvas dimensions so draw loop and logo share the same space
  const sizeRef           = useRef({ w: 0, h: 0 });
  const columnsRef        = useRef<{ chars: { char: string; y: number }[]; speed: number; x: number }[]>([]);
  const allCharsRef       = useRef<{ char: string; y: number }[]>([]);
  const scrollProgressRef = useRef(0);
  const charElsRef        = useRef<HTMLSpanElement[]>([]);
  const lastTypedIdxRef   = useRef(-1);

  useEffect(() => {
    const canvas   = canvasRef.current;
    const sticky   = stickyRef.current;
    if (!canvas || !sticky) return;
    const ctx = canvas.getContext('2d')!;

    // ── helpers ──────────────────────────────────────────────────────────────
    const rc   = () => NOISE[Math.floor(Math.random() * NOISE.length)];
    const rHex = (n: number) => { let s = ''; for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)]; return s; };
    const rDig = (n: number) => { let s = ''; for (let i = 0; i < n; i++) s += DIGITS[Math.floor(Math.random() * 10)]; return s; };

    const makeStr = () => {
      const r = Math.random();
      if (r < 0.08) return TOKENS[Math.floor(Math.random() * TOKENS.length)] + rHex(4);
      if (r < 0.15) return rDig(4) + ' ' + rDig(4);
      if (r < 0.22) return '$' + (Math.random() * 9999).toFixed(2);
      let s = '';
      for (let i = 0; i < Math.floor(Math.random() * 8) + 3; i++) s += rc();
      return s;
    };

    // ── canvas init: size from actual rendered element, NOT window ────────────
    const initCanvas = () => {
      // Use window.innerWidth/Height directly — these are real viewport pixels,
      // unaffected by body { zoom: 0.8 }. getBoundingClientRect() would return
      // zoomed-down values (80% of viewport), causing the canvas to under-fill.
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      sizeRef.current = { w, h };

      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / COL_W) + 2;   // a few extra cols to bleed edges
      const rows = Math.ceil(h / FONT_SIZE) + 2;
      columnsRef.current = [];

      for (let i = 0; i < cols; i++) {
        const chars: { char: string; y: number }[] = [];
        const speed  = 0.3 + Math.random() * 0.8;

        // Random phase offset per column — wrap into the visible cycle so every
        // column is already on-screen at frame 1, preserving even FONT_SIZE spacing.
        const cycleH      = h + 2 * FONT_SIZE;
        const phaseOffset = Math.random() * cycleH;

        for (let j = 0; j < rows; j++) {
          const rawY     = j * FONT_SIZE - phaseOffset;
          const wrappedY = ((rawY % cycleH) + cycleH) % cycleH - FONT_SIZE;
          chars.push({ char: rc(), y: wrappedY });
          if (Math.random() < 0.05) {
            const str = makeStr();
            for (let k = 0; k < str.length && j + k < rows; k++) {
              if (chars[j + k]) chars[j + k].char = str[k];
            }
          }
        }
        columnsRef.current.push({ chars, speed, x: i * COL_W });
      }

      // Flat list of all char objects for O(1) random mutation below
      allCharsRef.current = columnsRef.current.flatMap(c => c.chars);
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);

    // ── draw loop ─────────────────────────────────────────────────────────────
    let rafId   = 0;
    let running = false;
    let frameN  = 0;

    // Pre-allocated glow-ring staging buffers — reused every frame, no GC.
    const GLOW_MAX = 3000;
    const glowX  = new Float32Array(GLOW_MAX);
    const glowY  = new Float32Array(GLOW_MAX);
    const glowCh = new Array<string>(GLOW_MAX);
    let   glowN  = 0;

    const draw = () => {
      // ── 30fps cap: skip every other rAF tick ─────────────────────────────
      frameN++;
      if (frameN % 2 !== 0) {
        if (running) rafId = requestAnimationFrame(draw);
        return;
      }

      const { w, h } = sizeRef.current;
      if (!w || !h) { if (running) rafId = requestAnimationFrame(draw); return; }

      const p = scrollProgressRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${FONT_SIZE}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      const centerX = w / 2;
      const centerY = h / 2;
      const maxR    = Math.sqrt(w * w + h * h) / 2;

      const clearRadius =
        p < 0.3
          ? (p / 0.3) * maxR * 0.6
          : maxR * 0.6 + ((p - 0.3) / 0.7) * maxR * 0.4;

      // Mutate a fixed 20 random chars per frame — same visual flicker, minimal cost.
      const allChars = allCharsRef.current;
      if (allChars.length > 0) {
        for (let m = 0; m < 20; m++) {
          allChars[Math.floor(Math.random() * allChars.length)].char = rc();
        }
      }

      const skipEdge   = clearRadius - 30;
      const skipEdgeSq = skipEdge > 0 ? skipEdge * skipEdge : -1;
      const glowEdgeSq = (clearRadius + 40) * (clearRadius + 40);
      const fadeMul    = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      const baseAlpha  = 0.12 * fadeMul;

      // ── Pass 1: base characters ───────────────────────────────────────────
      // Set fillStyle and globalAlpha ONCE for all base chars — zero per-char
      // state changes.  Glow-ring chars are staged in the pre-allocated buffers
      // and handled in pass 2.
      glowN = 0;
      ctx.fillStyle   = '#ffffff';
      ctx.globalAlpha = baseAlpha;

      for (const col of columnsRef.current) {
        const colCX = col.x + COL_W / 2 - centerX;
        for (const ch of col.chars) {
          ch.y += col.speed;
          if (ch.y > h + FONT_SIZE) { ch.y = -FONT_SIZE; ch.char = rc(); }

          const dy     = ch.y + FONT_SIZE / 2 - centerY;
          const distSq = colCX * colCX + dy * dy;

          // Skip chars deep inside the clear zone (no sqrt needed)
          if (skipEdgeSq > 0 && distSq < skipEdgeSq) continue;

          if (distSq < glowEdgeSq) {
            // Near the glow ring — defer to pass 2 (needs per-char alpha)
            if (glowN < GLOW_MAX) {
              glowX[glowN]  = col.x;
              glowY[glowN]  = ch.y;
              glowCh[glowN] = ch.char;
              glowN++;
            }
            continue;
          }

          ctx.fillText(ch.char, col.x, ch.y);
        }
      }

      // ── Pass 2: glow-ring characters ──────────────────────────────────────
      // Only ~200–500 chars at any scroll position, each needing its own alpha.
      for (let i = 0; i < glowN; i++) {
        const gx   = glowX[i];
        const gy   = glowY[i];
        const dx   = gx + COL_W / 2 - centerX;
        const dy   = gy + FONT_SIZE / 2 - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Re-check skip threshold (chars between clearRadius-40 and clearRadius-30)
        if (skipEdge > 0 && dist < skipEdge) continue;

        let alpha = 0.12 + (1 - Math.abs(dist - clearRadius) / 40) * 0.25;
        alpha *= fadeMul;
        ctx.globalAlpha = alpha;
        ctx.fillText(glowCh[i], gx, gy);
      }

      ctx.globalAlpha = 1;

      if (running) rafId = requestAnimationFrame(draw);
    };

    const startDraw = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    };
    const stopDraw = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Only run the canvas while the hero is in the viewport
    const heroIO = new IntersectionObserver(
      ([entry]) => entry.isIntersecting ? startDraw() : stopDraw(),
      { threshold: 0 }
    );
    heroIO.observe(containerRef.current!);

    // ── typewriter headline (no cursor) ───────────────────────────────────────
    const buildHeadline = () => {
      if (!headlineRef.current) return;
      headlineRef.current.innerHTML = '';
      charElsRef.current = [];

      for (let i = 0; i < HEADLINE.length; i++) {
        if (HEADLINE[i] === '\n') {
          headlineRef.current.appendChild(document.createElement('br'));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'seh-typed-char' + (HEADLINE[i] === ' ' ? ' seh-space-char' : '');
        span.textContent = HEADLINE[i];
        headlineRef.current.appendChild(span);
        charElsRef.current.push(span);
      }
      // No cursor appended — removed per request
    };
    buildHeadline();

    // ── live counters ─────────────────────────────────────────────────────────
    let txnBase = 847293;
    let volBase = 12.4;

    const tick = () => {
      txnBase += Math.floor(Math.random() * 3);
      volBase += Math.random() * 0.01;
      if (txnCountRef.current) txnCountRef.current.textContent = txnBase.toLocaleString();
      if (volCountRef.current) volCountRef.current.textContent = volBase.toFixed(1) + 'M';
    };
    tick();
    const tickInterval = setInterval(tick, 800);

    // ── scroll handler ────────────────────────────────────────────────────────
    // DOM writes are batched into a single rAF callback so rapid scroll events
    // don't cause redundant style flushes within the same frame.
    const applyScrollState = (p: number) => {
      if (logoRef.current) {
        const logoOpacity = Math.max(0, 1 - Math.max(0, (p - 0.12) / 0.18));
        logoRef.current.style.opacity = String(logoOpacity);
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.05));
      }

      // Typewriter
      const typeProgress = Math.min(1, Math.max(0, (p - 0.2) / 0.3));
      const chars        = charElsRef.current;
      const targetIdx    = typeProgress > 0
        ? Math.min(Math.floor(typeProgress * chars.length) - 1, chars.length - 1)
        : -1;

      if (targetIdx !== lastTypedIdxRef.current) {
        chars.forEach((el, i) => {
          if (i <= targetIdx) el.classList.add('visible');
          else el.classList.remove('visible');
        });
        lastTypedIdxRef.current = targetIdx;
      }

      if (eyebrowRef.current) {
        const show = p > 0.18;
        eyebrowRef.current.style.opacity   = show ? '1' : '0';
        eyebrowRef.current.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
      }
      if (subRef.current) {
        const show = p > 0.48;
        subRef.current.style.opacity   = show ? '1' : '0';
        subRef.current.style.transform = show ? 'translateY(0)' : 'translateY(14px)';
      }
      if (ctaRef.current) {
        const show = p > 0.52;
        ctaRef.current.style.opacity       = show ? '1' : '0';
        ctaRef.current.style.transform     = show ? 'translateY(0)' : 'translateY(12px)';
        ctaRef.current.style.pointerEvents = show ? 'auto' : 'none';
      }
      if (counterRef.current) {
        counterRef.current.style.opacity = p > 0.56 ? '1' : '0';
      }
    };

    let scrollRafPending = false;
    const onScroll = () => {
      if (!containerRef.current) return;
      // Update the progress ref immediately (cheap number write, no DOM)
      const rect  = containerRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      scrollProgressRef.current = Math.min(1, Math.max(0, -rect.top / total));

      // Coalesce all DOM style writes into one rAF callback per frame
      if (scrollRafPending) return;
      scrollRafPending = true;
      requestAnimationFrame(() => {
        scrollRafPending = false;
        applyScrollState(scrollProgressRef.current);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      heroIO.disconnect();
      stopDraw();
      clearInterval(tickInterval);
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* ── Scroll hint ──────────────────────────────────────────────────── */}
      <div
        ref={scrollHintRef}
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.15)',
          }}
        >
          Scroll
        </span>
        <div className="seh-chev" />
      </div>

      {/* ── Main scroll container ─────────────────────────────────────────── */}
      <div ref={containerRef} style={{ position: 'relative', height: 'calc(500vh / var(--site-zoom, 1))' }}>
        <div
          ref={stickyRef}
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            // Match a single physical viewport under the active body-level zoom.
            // (Previously hard-coded /0.8 for an older zoom value; now reads
            // the current factor from --site-zoom.)
            height: 'calc(100vh / var(--site-zoom, 1))',
            overflow: 'hidden',
            background: BG,
          }}
        >
          {/* Canvas — fills sticky container via absolute inset; NO explicit px override */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />

          {/* Center logo — positioned at exact center matching canvas clear zone */}
          <div
            ref={logoRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              pointerEvents: 'none',
              opacity: 1,
            }}
          >
            <img src={deltLogo} alt="Delt" style={{ height: 174 }} />
          </div>

          {/* Reveal layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px',
              pointerEvents: 'none',
            }}
          >
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: PURPLE,
                marginBottom: 28,
                opacity: 0,
                transform: 'translateY(10px)',
                transition: 'opacity 0.8s, transform 0.8s',
              }}
            >
              Payment Processing
            </div>

            {/* Typewriter headline */}
            <div
              ref={headlineRef}
              style={{
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: '-0.035em',
                color: '#fff',
                marginBottom: 28,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                minHeight: '2.2em',
              }}
            />

            {/* Sub */}
            <div
              ref={subRef}
              style={{
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.45)',
                maxWidth: '48ch',
                marginBottom: 40,
                opacity: 0,
                transform: 'translateY(14px)',
                transition: 'opacity 0.8s 0.3s, transform 0.8s 0.3s',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Stop waiting days for your hard-earned revenue to clear. Delt settles your funds instantly, so you can reinvest in your business the moment the sale is&nbsp;made.
            </div>

            {/* CTA */}
            <div
              ref={ctaRef}
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                justifyContent: 'center',
                opacity: 0,
                transform: 'translateY(12px)',
                transition: 'opacity 0.8s 0.6s, transform 0.8s 0.6s',
                pointerEvents: 'none',
              }}
            >
              <Link
                to="/start"
                style={{
                  background: PURPLE,
                  color: '#fff',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background  = '#3510d4';
                  (e.currentTarget as HTMLElement).style.transform   = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow   = '0 8px 30px rgba(67,24,255,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background  = PURPLE;
                  (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow   = 'none';
                }}
              >
                Get Started — Free →
              </Link>
              <Link
                to="/contact"
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
                  (e.currentTarget as HTMLElement).style.color       = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                  (e.currentTarget as HTMLElement).style.color       = 'rgba(255,255,255,0.5)';
                }}
              >
                Talk to Sales
              </Link>
            </div>
          </div>

          {/* Live counter */}
          <div
            ref={counterRef}
            style={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              display: 'flex',
              gap: 32,
              opacity: 0,
              transition: 'opacity 0.8s 0.9s',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 6, display: 'inline-block', animation: 'sehCounterPulse 2s ease-in-out infinite', flexShrink: 0 }} />
                <span ref={txnCountRef}>12,847</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Transactions today</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                $<span ref={volCountRef}>387K</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Volume processed</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>99.6%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes sehChevBounce {
          0%, 100% { transform: rotate(45deg) translateY(0);   opacity: 0.2; }
          50%       { transform: rotate(45deg) translateY(5px); opacity: 0.7; }
        }
        @keyframes sehCounterPulse {
          0%, 100% { opacity: 1;   box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
        .seh-chev {
          width: 10px;
          height: 10px;
          border-right: 1px solid rgba(255,255,255,0.15);
          border-bottom: 1px solid rgba(255,255,255,0.15);
          transform: rotate(45deg);
          animation: sehChevBounce 2s ease-in-out infinite;
        }
        .seh-typed-char {
          opacity: 0;
          display: inline-block;
          transition: opacity 0.05s;
        }
        .seh-typed-char.visible {
          opacity: 1;
        }
        .seh-space-char {
          width: 0.3em;
        }
      `}</style>
    </>
  );
}