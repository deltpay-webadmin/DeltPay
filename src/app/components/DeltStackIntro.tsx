import { useEffect, useRef } from 'react';

export function DeltStackIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const h2 = section.querySelector('.dsi-heading');
          if (!h2) return;
          import('animejs').then(({ animate, stagger, splitText }) => {
            const { chars } = splitText(h2 as HTMLElement, { words: false, chars: true });
            animate(chars, {
              y: [
                { to: '-2.75rem', ease: 'outExpo', duration: 600 },
                { to: 0, ease: 'outBounce', duration: 800, delay: 100 },
              ],
              rotate: {
                from: '-1turn',
                delay: 0,
              },
              delay: stagger(50),
              ease: 'inOutCirc',
              loop: false,
            });
          }).catch(() => {});
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#041E42',
        padding: '120px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 900 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            color: '#4945FF',
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            marginBottom: 28,
          }}
        >
          The Delt Stack
        </div>
        <h2
          className="dsi-heading"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: 28,
            overflow: 'hidden',
          }}
        >
          Your Business, All in One Place
        </h2>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.50)',
            margin: 0,
          }}
        >
          Most business owners are flying blind with a website they can't update, data they can't
          read, and payment fees they don't understand. We've built a better way to run things. We
          start by getting you online, then we find your hidden profit, fix your rates, and fund your
          next move.
        </p>
      </div>
    </section>
  );
}
