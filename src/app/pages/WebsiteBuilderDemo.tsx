import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Globe, Paintbrush, CreditCard, Zap, LayoutDashboard, Rocket, ArrowRight, Shield, Sparkles, BarChart3, Search } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import { Navigation } from '@/app/components/Navigation';
import heroShowcase from 'figma:asset/87f61ca0a3b109e548973daea39543468df32934.png';
import featuredSites from 'figma:asset/f5375380eb92f69afa1c29397b965cbf92ffe5cd.png';

/* ─── Design Tokens (matching WebsiteExamples) ─── */
const T = {
  bg: '#03152E',
  surface: '#071D3A',
  card: '#0A2444',
  border: '#163057',
  accent: '#4945FF',
  accentLight: '#6C69FF',
  accentDim: 'rgba(73,69,255,0.10)',
  green: '#22C55E',
  gold: '#F59E0B',
  blue: '#3B82F6',
  white: '#F4F4F6',
  gray1: '#C8CDD8',
  gray2: '#8B95A8',
  gray3: '#5E6A80',
  gray4: '#3A4358',
  heading: "'Plus Jakarta Sans', -apple-system, sans-serif",
  sans: "'DM Sans', -apple-system, sans-serif",
};

/* ─── Feature Data ─── */
const FEATURES = [
  {
    key: 'domain', label: 'Your Domain', icon: Globe, color: '#34D399',
    title: 'Found first. Chosen first.',
    desc: 'A real domain ranks higher. Your customers find you before they find competitors stuck on subdomains. Plus SSL, instant DNS, and zero-downtime deploys.',
    cta: 'How domains work →',
    body: "Your brand deserves its own home—joespizza.com, not a subdomain. We handle the technical heavy lifting with auto-provisioned security (SSL) and instant setup. Every update you push goes live immediately with zero downtime, ensuring your customers always have a fast, secure path to your door.",
  },
  {
    key: 'design', label: 'Design', icon: Paintbrush, color: '#F472B6',
    title: 'Looks like you hired an agency.',
    desc: 'Hand-crafted templates for restaurants, salons, retailers, law firms, and more. Real typography, real photography, real motion — not generic drag-and-drop.',
    cta: 'Browse templates →',
    body: "We don't just build \"pages\"; we build storefronts engineered to sell. Our designs are optimized for the modern SMB—clean, mobile-first, and high-end. Your website should look like a premium enterprise from day one.",
  },
  {
    key: 'payments', label: 'Payments', icon: CreditCard, color: '#A78BFA',
    title: 'Every dollar, every channel.',
    desc: 'Cards, ACH, Apple Pay, Google Pay — in-person and online, unified. Each transaction builds your Delt capital profile automatically.',
    cta: 'See payment features →',
    body: "Stop duct-taping third-party payment plugins to your site. Because your website is built on Delt, your checkout is natively connected to your merchant account. Lower abandonment, faster processing, every online dollar in your unified dashboard.",
  },
  {
    key: 'seo', label: 'SEO & Speed', icon: Zap, color: '#FBBF24',
    title: 'Rank. Load. Convert.',
    desc: 'Perfect Lighthouse scores out of the box. Semantic HTML, structured data, and global edge caching — so customers find you before they find your competition.',
    cta: 'See performance details →',
    body: "A beautiful site is useless if it's invisible. We optimize your digital vitals for Google from the start—lightning-fast load times and automated SEO tagging. When local customers search for what you do, your name appears.",
  },
  {
    key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#60A5FA',
    title: 'One screen runs it all.',
    desc: 'Revenue, foot traffic, online orders, Lens AI forecasts, and capital status — unified in a single live dashboard. No spreadsheets, no third-party tools.',
    cta: 'Explore the dashboard →',
    body: "Most owners have to log into four different places to see how their day is going. With Delt, your website traffic, online orders, and in-store sales are synthesized into one view. Manage inventory, update your site, check margins—all from a single login.",
  },
  {
    key: 'golive', label: 'Go Live', icon: Rocket, color: '#4945FF',
    title: 'Live in 5 days, not 5 months.',
    desc: 'Answer a few questions, pick your style, and our team takes it from there — professional copy, imagery, and integrations included. No agency retainer required.',
    cta: 'Start the process →',
    body: "We've removed the launch-day anxiety. Once your design is approved, we handle the deployment. Your site goes live on a global, secure network that scales with you. As your sales grow, Lens AI monitors your traffic.",
  },
];

/* ─── Feature Previews (rich dark cards) ─── */
function FeaturePreview({ feature }: { feature: typeof FEATURES[0] }) {
  const previews: Record<string, React.ReactNode> = {
    domain: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ background: T.surface, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: T.card, borderRadius: 6, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${T.border}` }}>
              <Shield size={11} style={{ color: T.green, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: T.white, fontFamily: T.sans, fontWeight: 500 }}>theharlownyc.com</span>
            </div>
          </div>
          <div style={{ height: 90, background: 'linear-gradient(135deg, #0A1628 0%, #0E2040 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: T.accentDim, border: `1px solid ${T.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={14} style={{ color: T.accentLight }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: T.sans }}>The Harlow NYC</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'SSL Certificate', value: 'Active', color: T.green, icon: '🔒' },
            { label: 'DNS Propagated', value: '< 60s', color: T.green, icon: '⚡' },
            { label: 'Uptime', value: '99.99%', color: T.green, icon: '✓' },
          ].map(s => (
            <div key={s.label} style={{ background: T.card, borderRadius: 10, padding: '12px 10px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: T.sans }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.gray3, fontFamily: T.sans, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.card, borderRadius: 10, padding: '10px 16px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.white, fontFamily: T.sans }}>Last deploy</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.gray2, fontFamily: T.sans }}>2 minutes ago · zero downtime</span>
        </div>
      </div>
    ),

    design: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { name: 'Harlow', type: 'Restaurant', tag: 'Premium' },
            { name: 'Studio K', type: 'Salon', tag: 'Minimal' },
            { name: 'Groundwork', type: 'Café', tag: 'Warm' },
            { name: 'Meridian', type: 'Law Firm', tag: 'Classic' },
          ].map(t => (
            <div key={t.name} style={{ background: T.card, borderRadius: 10, padding: '14px 14px', border: `1px solid ${T.border}` }}>
              <div style={{ height: 50, background: 'linear-gradient(135deg, #0A1628, #162D52)', borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: T.gray2, fontFamily: T.sans, fontWeight: 600 }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.white, fontFamily: T.sans }}>{t.type}</div>
              <div style={{ fontSize: 9, color: T.accentLight, fontFamily: T.sans, marginTop: 2 }}>{t.tag}</div>
            </div>
          ))}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.accent}0D, ${T.accent}06)`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.accent}22`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Paintbrush size={14} style={{ color: T.accentLight, marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.accentLight, fontFamily: T.sans, marginBottom: 2 }}>40+ templates</div>
            <div style={{ fontSize: 10, color: T.gray2, fontFamily: T.sans, lineHeight: 1.5 }}>Industry-specific designs hand-crafted for conversion. No drag-and-drop.</div>
          </div>
        </div>
      </div>
    ),

    payments: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { method: 'Visa ****4242', amount: '$128.50', status: 'Settled', color: T.green },
            { method: 'Apple Pay', amount: '$64.00', status: 'Settled', color: T.green },
            { method: 'ACH Transfer', amount: '$2,400.00', status: 'Processing', color: T.gold },
            { method: 'Google Pay', amount: '$89.99', status: 'Settled', color: T.green },
          ].map(p => (
            <div key={p.method} style={{ background: T.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.white, fontFamily: T.sans }}>{p.method}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.white, fontFamily: T.sans, marginTop: 4 }}>{p.amount}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: p.color, fontFamily: T.sans, marginTop: 2 }}>{p.status}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.card, borderRadius: 10, padding: '12px 16px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, color: T.gray3, fontFamily: T.sans, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today's Volume</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.white, fontFamily: T.sans }}>$2,682.49</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.green, fontFamily: T.sans }}>+18% ↑</div>
        </div>
      </div>
    ),

    seo: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Performance', score: 100, color: T.green },
            { label: 'Accessibility', score: 98, color: T.green },
            { label: 'Best Practices', score: 100, color: T.green },
            { label: 'SEO', score: 100, color: T.green },
          ].map(s => (
            <div key={s.label} style={{ background: T.card, borderRadius: 10, padding: '14px 8px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color, fontFamily: T.sans }}>{s.score}</span>
              </div>
              <div style={{ fontSize: 8, color: T.gray3, fontFamily: T.sans, letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.gray2, fontFamily: T.sans, marginBottom: 8, letterSpacing: '0.08em' }}>LOAD TIME</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: T.green, fontFamily: T.heading }}>0.8s</span>
            <span style={{ fontSize: 11, color: T.gray3, fontFamily: T.sans }}>First Contentful Paint</span>
          </div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: T.surface }}>
            <div style={{ height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green}, ${T.accentLight})`, width: '92%' }} />
          </div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.accent}0D, ${T.accent}06)`, borderRadius: 10, padding: '10px 14px', border: `1px solid ${T.accent}22`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Search size={12} style={{ color: T.accentLight, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: T.gray2, fontFamily: T.sans }}>Structured data, semantic HTML, and global edge caching — out of the box.</span>
        </div>
      </div>
    ),

    dashboard: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Revenue (MTD)', value: '$34,180', delta: '+22%', color: T.green },
            { label: 'Capital Available', value: '$60,000', delta: 'Ready', color: T.accentLight },
            { label: 'Lens AI Score', value: '92 / 100', delta: '↑ 5', color: T.gold },
          ].map(s => (
            <div key={s.label} style={{ background: T.card, borderRadius: 10, padding: '12px 10px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 8, color: T.gray3, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: T.sans, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.white, letterSpacing: -0.5, fontFamily: T.sans }}>{s.value}</div>
              <div style={{ fontSize: 9, color: s.color, marginTop: 2, fontWeight: 600, fontFamily: T.sans }}>{s.delta}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.card, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.gray2, letterSpacing: '0.08em', fontFamily: T.sans }}>DAILY REVENUE</span>
            <span style={{ fontSize: 10, color: T.accentLight, fontFamily: T.sans, fontWeight: 600 }}>Last 14 days</span>
          </div>
          <svg width="100%" height="70" viewBox="0 0 360 70" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d="M0,60 L25,52 L50,55 L75,42 L100,46 L125,38 L150,32 L175,28 L200,35 L225,22 L250,18 L275,24 L300,14 L325,10 L360,8 L360,70 L0,70Z" fill="url(#revGrad2)" />
            <path d="M0,60 L25,52 L50,55 L75,42 L100,46 L125,38 L150,32 L175,28 L200,35 L225,22 L250,18 L275,24 L300,14 L325,10 L360,8" fill="none" stroke={T.accentLight} strokeWidth="2" />
            <circle cx="360" cy="8" r="4" fill={T.accentLight} />
          </svg>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.accent}0D, ${T.accent}06)`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.accent}22`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: T.accentDim, border: `1px solid ${T.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={12} style={{ color: T.accentLight }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.accentLight, fontFamily: T.sans, marginBottom: 2 }}>Lens AI · Today</div>
            <div style={{ fontSize: 10, color: T.gray2, fontFamily: T.sans, lineHeight: 1.5 }}>Friday evenings drive 34% of weekly revenue. Consider extending hours or adding staff 5–9pm.</div>
          </div>
        </div>
      </div>
    ),

    golive: (
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { step: '01', title: 'Tell us about your business', desc: '~5 min onboarding — industry, style preferences, and your goals.', done: true },
            { step: '02', title: 'Choose your template', desc: 'Pick from 40+ industry-specific designs. We customise every detail.', done: true },
            { step: '03', title: 'We build it', desc: 'Copywriting, photography, payments, and integrations — all handled.', done: false },
            { step: '04', title: 'You go live', desc: 'Custom domain, SSL, SEO, and analytics — ready from day one.', done: false },
          ].map((s) => (
            <div key={s.step} style={{
              background: s.done ? `${T.accent}0D` : T.card,
              borderRadius: 10, padding: '14px 14px',
              border: `1px solid ${s.done ? T.accent + '33' : T.border}`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: s.done ? T.accentLight : T.gray3, letterSpacing: '0.1em', fontFamily: T.sans, marginBottom: 6 }}>STEP {s.step}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.done ? T.white : T.gray1, fontFamily: T.sans, lineHeight: 1.3, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 10, color: T.gray3, fontFamily: T.sans, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${T.accent}12, ${T.accent}06)`,
          borderRadius: 12, padding: '14px 20px',
          border: `1px solid ${T.accent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: T.gray2, fontFamily: T.sans }}>Average time to launch</div>
            <div style={{
              fontSize: 26, fontWeight: 900, letterSpacing: -1, fontFamily: T.heading,
              background: `linear-gradient(135deg, ${T.accentLight}, ${T.blue})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>5 days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: T.gray2, fontFamily: T.sans }}>vs. agency average</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.gray3, fontFamily: T.sans, textDecoration: 'line-through' }}>4–6 months</div>
          </div>
        </div>
      </div>
    ),
  };
  return <>{previews[feature.key] || null}</>;
}

/* ─── Animated Section Wrapper ─── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature Walkthrough (scroll-driven timeline) ─── */
function FeatureWalkthrough() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isScrollingToRef = useRef(false);

  const scrollToFeature = useCallback((idx: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.offsetTop;
    const sectionScrollable = section.offsetHeight - window.innerHeight;
    const targetProgress = (idx + 0.05) / FEATURES.length;
    const targetScroll = sectionTop + targetProgress * sectionScrollable;
    isScrollingToRef.current = true;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    setTimeout(() => { isScrollingToRef.current = false; }, 600);
    setActive(idx);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      if (isScrollingToRef.current) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = -rect.top;
      const sectionScrollable = section.offsetHeight - window.innerHeight;
      if (sectionScrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, sectionTop / sectionScrollable));
      const idx = Math.min(FEATURES.length - 1, Math.floor(progress * FEATURES.length));
      setActive(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: T.bg,
        height: `${(FEATURES.length + 1) * 100}vh`,
        position: 'relative',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase' as const, color: T.accentLight,
              fontFamily: T.sans, marginBottom: 14,
            }}>
              WHAT YOU GET
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
              fontFamily: T.heading,
              color: T.white, lineHeight: 1.1, letterSpacing: -1,
              margin: 0,
              WebkitFontSmoothing: 'antialiased',
            }}>
              Create, connect,<br />and go live.
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 0, minHeight: 420 }}>
            {/* Left nav — desktop */}
            <div className="hidden md:block" style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}` }}>
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    onClick={() => scrollToFeature(i)}
                    style={{
                      padding: '16px 20px', cursor: 'pointer',
                      borderLeft: `2px solid ${i === active ? T.accent : 'transparent'}`,
                      background: i === active ? T.accentDim : 'transparent',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={16} style={{ color: i === active ? f.color : T.gray3, transition: 'color 0.3s' }} />
                      <div style={{
                        fontSize: 15, fontWeight: 700,
                        color: i === active ? T.white : T.gray3,
                        transition: 'color 0.25s', fontFamily: T.sans,
                      }}>{f.label}</div>
                    </div>
                    <AnimatePresence initial={false}>
                      {i === active && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            fontSize: 12, color: T.gray2, lineHeight: 1.5,
                            marginTop: 8, maxWidth: 200, fontFamily: T.sans,
                          }}>{f.desc}</div>
                          <div style={{
                            marginTop: 10, fontSize: 11, fontWeight: 600,
                            color: T.accentLight, fontFamily: T.sans,
                          }}>{f.cta}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Mobile tabs */}
            <div className="md:hidden" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
                {FEATURES.map((f, i) => (
                  <button
                    key={f.key}
                    onClick={() => scrollToFeature(i)}
                    style={{
                      padding: '8px 14px', borderRadius: 50, border: 'none',
                      background: i === active ? T.accentDim : 'transparent',
                      color: i === active ? T.white : T.gray3,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      whiteSpace: 'nowrap', fontFamily: T.sans,
                      outline: i === active ? `1px solid ${T.accent}44` : 'none',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{
                background: T.surface, borderRadius: 16,
                border: `1px solid ${T.border}`, overflow: 'hidden',
              }}>
                <FeaturePreview feature={FEATURES[active]} />
              </div>
              <div style={{ marginTop: 12, padding: '0 4px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.white, fontFamily: T.heading, marginBottom: 4 }}>{FEATURES[active].title}</div>
                <div style={{ fontSize: 13, color: T.gray2, lineHeight: 1.5, fontFamily: T.sans }}>{FEATURES[active].desc}</div>
              </div>
            </div>

            {/* Right preview — desktop */}
            <div className="hidden md:block" style={{
              flex: 1, background: T.surface, borderRadius: '0 16px 16px 0',
              border: `1px solid ${T.border}`, borderLeft: 'none',
              overflow: 'hidden', position: 'relative',
            }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <FeaturePreview feature={FEATURES[active]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Scroll progress dots */}
          <div className="hidden md:flex" style={{
            justifyContent: 'center', gap: 8, marginTop: 28,
          }}>
            {FEATURES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === active ? 24 : 6, height: 6, borderRadius: 3,
                  background: i === active ? T.accent : T.gray4,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */
export function WebsiteBuilderDemo() {
  return (
    <div className="relative" style={{ background: '#03152E' }}>
      <Navigation />
      {/* ───── Hero ───── */}
      <section className="pt-36 pb-16 px-6 text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16C784]" />
            <span
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-[11px] tracking-[0.14em] uppercase text-[rgba(255,255,255,0.45)]"
            >
              Now accepting new merchants
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            className="text-4xl sm:text-5xl lg:text-[3.8rem] text-white leading-[1.08] mb-2 max-w-3xl mx-auto"
          >
            A website that looks like
          </h1>
          <p
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            className="text-4xl sm:text-5xl lg:text-[3.8rem] text-[#4945FF] leading-[1.15] mb-7"
          >
            you mean business.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            className="text-[rgba(255,255,255,0.45)] max-w-[520px] mx-auto mb-9 leading-[1.7]"
          >
            Your business makes a great first impression in person. Your website should too.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#4945FF] text-white rounded-xl font-medium hover:bg-[#3832E5] transition-all"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Get Your Site <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#examples"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[rgba(255,255,255,0.15)] text-white rounded-xl font-medium hover:border-[rgba(255,255,255,0.35)] transition-all"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              See Examples
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ───── Hero showcase strip ───── */}
      <FadeIn delay={0.4} className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <img
            src={heroShowcase}
            alt="Delt website showcase"
            className="w-full rounded-2xl"
          />
        </div>
      </FadeIn>

      {/* ───── Feature Walkthrough (scroll-driven timeline) ───── */}
      <FeatureWalkthrough />

      {/* ───── Featured Sites ───── */}
      <section id="examples" className="py-28 lg:py-36 px-6" style={{ background: '#041E42' }}>
        <FadeIn className="text-center mb-4">
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs tracking-[0.18em] uppercase text-[#4945FF]"
          >
            Featured Sites
          </span>
        </FadeIn>
        <FadeIn className="text-center mb-4" delay={0.1}>
          <h2
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] text-white"
          >
            See what we've built.
          </h2>
        </FadeIn>
        <FadeIn className="text-center mb-14" delay={0.15}>
          <p className="text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Real businesses. Real results. All powered by Delt.
          </p>
        </FadeIn>
        <FadeIn delay={0.2} className="max-w-6xl mx-auto">
          <img
            src={featuredSites}
            alt="Featured Delt sites"
            className="w-full rounded-2xl"
          />
        </FadeIn>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="py-28 lg:py-36 px-6 text-center" style={{ background: '#041E42' }}>
        <FadeIn>
          <h2
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] text-white mb-5 leading-[1.1]"
          >
            Your site. Live in days.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            className="text-[rgba(255,255,255,0.45)] max-w-[520px] mx-auto mb-10 leading-[1.7]"
          >
            One platform. Professional website, payment processing, capital access, and AI insights. All connected.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#4945FF] text-white rounded-xl font-medium text-lg hover:bg-[#3832E5] transition-all"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Get Your Delt Site <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="mt-5 text-xs text-[rgba(255,255,255,0.3)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            No contracts. No cancellation fees. Live in under a week.
          </p>
        </FadeIn>
      </section>

      {/* ───── Footer ───── */}
      <Footer />
    </div>
  );
}