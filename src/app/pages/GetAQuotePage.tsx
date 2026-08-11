import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { trackQuoteRequest } from '@/lib/pixel';
import { supabase } from '@/app/lib/supabase';
import { useHoneypot } from '@/app/components/Honeypot';
import logoWhite from 'figma:asset/419e83442bb1bf5965a966a8870b00dd4288dd57.png';

const NAVY   = '#041E42';
const INDIGO = '#4945FF';
const GREEN  = '#4945FF';
const JAK    = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ── Step data ── */
const TOTAL_STEPS = 4;

/* Step 1 — Features */
const FEATURES = [
  {
    id: 'website',
    label: 'Website & Storefront',
    sub: 'Custom site, online ordering, SEO',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    id: 'lens',
    label: 'Lens AI',
    sub: 'Revenue insights, forecasting, trends',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'payments',
    label: 'Payments',
    sub: 'In-person, online & mobile processing',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
      </svg>
    ),
  },
  {
    id: 'capital',
    label: 'Capital',
    sub: 'Revenue-based funding & advances',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'marketing',
    label: 'Marketing Suite',
    sub: 'CRM, loyalty, SMS, email',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 'payroll',
    label: 'Payroll & Team',
    sub: 'Payroll, scheduling, staff management',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    sub: 'Stock management and catalog tools',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Something else',
    sub: "I'll describe my needs below",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
      </svg>
    ),
  },
];

/* Step 2 — Business type (line-icon set, matches Step 1 style) */
const BIZ_TYPES: Array<{ id: string; label: string; icon: React.ReactNode }> = [
  {
    id: 'restaurant',
    label: 'Restaurant / Café',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7a3 3 0 0 0 3 3v10"/><path d="M9 2v20"/><path d="M9 9V2"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/>
      </svg>
    ),
  },
  {
    id: 'retail',
    label: 'Retail Shop',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v2a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V6l-3-4Z"/><path d="M3 8v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/><path d="M10 22v-6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v6"/>
      </svg>
    ),
  },
  {
    id: 'health',
    label: 'Health & Beauty',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
      </svg>
    ),
  },
  {
    id: 'services',
    label: 'Service Business',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    id: 'fitness',
    label: 'Fitness / Wellness',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
      </svg>
    ),
  },
];

/* Step 3 — Monthly volume */
const VOLUMES = [
  { id: 'under10k', label: 'Under $10,000', sub: 'Just getting started' },
  { id: '10k_50k', label: '$10,000 – $50,000', sub: 'Growing steadily' },
  { id: '50k_150k', label: '$50,000 – $150,000', sub: 'Established business' },
  { id: '150k_plus', label: '$150,000+', sub: 'High-volume merchant' },
];

/* ── Recommendation engine ── */
function getRecommendation(features: string[], volume: string): { plan: string; color: string; why: string } {
  const hasLens = features.includes('lens');
  const hasCapital = features.includes('capital');
  const hasPayroll = features.includes('payroll');
  const isHighVol = volume === '150k_plus' || volume === '50k_150k';

  if (hasLens || hasCapital || hasPayroll || (isHighVol && features.length >= 3)) {
    return {
      plan: 'Custom Pricing',
      color: NAVY,
      why: 'Based on your needs, a tailored package will unlock the best rates and features for your business.',
    };
  }
  if (features.length >= 2 || volume === '10k_50k' || volume === '50k_150k') {
    return {
      plan: 'Growth',
      color: INDIGO,
      why: 'The Growth plan covers everything you selected and grows with your business.',
    };
  }
  return {
    plan: 'Free',
    color: '#374151',
    why: 'The Free plan is a great starting point — you can upgrade anytime as your needs evolve.',
  };
}

/* ── Progress bar ── */
function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 640, margin: '0 auto 56px' }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const done = i < step;
        const active = i === step - 1;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: done || active ? INDIGO : '#E2E6ED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s',
              }}>
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10.5L8 14.5L16 6.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ fontFamily: JAK, fontSize: 15, fontWeight: 700, color: active ? '#fff' : '#94A3B8' }}>{i + 1}</span>
                )}
              </div>
              <span style={{ fontFamily: JAK, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? NAVY : '#94A3B8', marginTop: 8, whiteSpace: 'nowrap' }}>
                {['Features', 'Business', 'Volume', 'Contact'][i]}
              </span>
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? INDIGO : '#E2E6ED', margin: '0 4px', marginBottom: 24, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Checkbox card ── */
function FeatureCard({ item, selected, onToggle }: { item: typeof FEATURES[0]; selected: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '28px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
        border: `2px solid ${selected ? INDIGO : '#C8CDD6'}`,
        background: selected ? 'rgba(73,69,255,0.06)' : '#FFFFFF',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative', minHeight: 148,
      }}
    >
      <div style={{ color: selected ? INDIGO : '#4B5563', transition: 'color 0.2s', transform: 'scale(1.15)' }}>{item.icon}</div>
      <div>
        <div style={{ fontFamily: JAK, fontSize: 15, fontWeight: 700, color: selected ? NAVY : '#374151', lineHeight: 1.3 }}>{item.label}</div>
        <div style={{ fontFamily: JAK, fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>{item.sub}</div>
      </div>
      {/* Checkbox */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 20, height: 20, borderRadius: 5,
        border: `2px solid ${selected ? INDIGO : '#D1D5DB'}`,
        background: selected ? INDIGO : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </motion.button>
  );
}

/* ── Radio card ── */
function RadioCard({ label, sub, selected, icon, onClick }: { label: string; sub?: string; selected: boolean; icon?: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
        borderRadius: 12, cursor: 'pointer', textAlign: 'left',
        border: `2px solid ${selected ? INDIGO : '#E2E6ED'}`,
        background: selected ? 'rgba(73,69,255,0.05)' : '#FFFFFF',
        transition: 'border-color 0.2s, background 0.2s', width: '100%',
      }}
    >
      {icon && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            background: selected ? 'rgba(73,69,255,0.10)' : '#F4F5F8',
            color: selected ? INDIGO : '#475569',
            transition: 'color 0.2s, background 0.2s',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: JAK, fontSize: 16, fontWeight: 700, color: selected ? NAVY : '#374151' }}>{label}</div>
        {sub && <div style={{ fontFamily: JAK, fontSize: 13.5, color: '#94A3B8', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${selected ? INDIGO : '#D1D5DB'}`,
        background: selected ? INDIGO : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </motion.button>
  );
}

/* ══════════════════════════
   MAIN COMPONENT
══════════════════════════ */
export function GetAQuotePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [bizType, setBizType] = useState('');
  const [volume, setVolume] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  // Hybrid onboarding: lower-volume merchants can start their MPA application
  // immediately instead of waiting for the team to reach out.
  const [selfServeStatus, setSelfServeStatus] = useState<'none' | 'loading' | 'ready' | 'failed'>('none');
  const [selfServePath, setSelfServePath] = useState<string | null>(null);
  const { honeypotField, honeypotValue } = useHoneypot();

  const toggleFeature = (id: string) =>
    setFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const canNext1 = features.length > 0;
  const canNext2 = bizType !== '';
  const canNext3 = volume !== '';
  const canSubmit = form.name.trim() && form.email.trim();

  const rec = getRecommendation(features, volume);

  // Volume-tier routing: under $50K/mo gets the self-serve application lane;
  // $50K+ stays on the assisted "we'll reach out" quote lane.
  const isSelfServeTier = volume === 'under10k' || volume === '10k_50k';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Meta Pixel: quote request submitted — mid-funnel intent lead.
    trackQuoteRequest({
      content_name: `${bizType || 'unknown'}/${volume || 'unknown'}`,
    });
    // Email the submission to the team via the Vercel /api function.
    // Fire-and-forget: the success screen shows regardless of delivery.
    fetch('/api/leads/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        business: form.business,
        notes: form.notes,
        features,
        bizType,
        volume,
        recommendedPlan: rec.plan,
        route: isSelfServeTier ? 'self-serve' : 'assisted',
        hp_extra_field: honeypotValue(),
      }),
    }).catch(() => { /* non-blocking: success screen already shown */ });
    // Self-serve lane: open a merchant application and surface the secure
    // wizard link right on the success screen.
    if (isSelfServeTier) {
      setSelfServeStatus('loading');
      supabase.functions
        .invoke('mpa-application', {
          body: {
            action: 'self-start',
            name: form.name,
            email: form.email,
            phone: form.phone,
            business: form.business,
            volume,
            hp_extra_field: honeypotValue(),
          },
        })
        .then(({ data, error }) => {
          if (!error && data?.ok && typeof data.path === 'string') {
            setSelfServePath(data.path);
            setSelfServeStatus('ready');
          } else {
            setSelfServeStatus('failed');
          }
        })
        .catch(() => setSelfServeStatus('failed'));
    }
    setSubmitted(true);
  }

  /* ── Slide variants ── */
  const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: JAK }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ background: '#fff', borderRadius: 24, padding: '64px 56px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 16px 60px rgba(4,30,66,0.10)' }}
        >
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(22,199,132,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: JAK, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.5px', marginBottom: 12 }}>
            You're all set, {form.name.split(' ')[0]}!
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 8 }}>
            {isSelfServeTier ? (
              <>You can open your merchant account right now — the application takes about <strong>10 minutes</strong> and your progress saves as you go.</>
            ) : (
              <>Our team will review your needs and reach out within <strong>1 business day</strong> with a tailored quote.</>
            )}
          </p>
          <div style={{ display: 'inline-block', margin: '24px 0', padding: '14px 24px', borderRadius: 12, background: 'rgba(73,69,255,0.06)', border: '1.5px solid rgba(73,69,255,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INDIGO, marginBottom: 4 }}>Recommended plan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: rec.color }}>{rec.plan}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, maxWidth: 280 }}>{rec.why}</div>
          </div>
          {isSelfServeTier && selfServeStatus !== 'failed' && (
            <button
              onClick={() => selfServePath && navigate(selfServePath)}
              disabled={selfServeStatus !== 'ready'}
              style={{ display: 'block', width: '100%', padding: '15px', borderRadius: 10, background: selfServeStatus === 'ready' ? INDIGO : '#C7C9F5', color: '#fff', fontFamily: JAK, fontSize: 15, fontWeight: 700, border: 'none', cursor: selfServeStatus === 'ready' ? 'pointer' : 'wait', marginTop: 8 }}
            >
              {selfServeStatus === 'ready' ? 'Start my application →' : 'Preparing your secure application…'}
            </button>
          )}
          {isSelfServeTier && selfServeStatus === 'failed' && (
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '4px 0 8px' }}>
              We'll email you a secure application link shortly so you can finish opening your account.
            </p>
          )}
          {isSelfServeTier && (
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginTop: 12 }}>
              {volume === '10k_50k'
                ? 'Prefer to talk it through? A payments specialist will also check in within 1 business day.'
                : "Prefer to talk it through first? Just reply to the quote email we're sending you."}
            </p>
          )}
          <button
            onClick={() => navigate('/pricing')}
            style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, background: isSelfServeTier ? 'transparent' : INDIGO, color: isSelfServeTier ? '#6B7280' : '#fff', fontFamily: JAK, fontSize: 15, fontWeight: isSelfServeTier ? 600 : 700, border: isSelfServeTier ? '1.5px solid #E5E7EB' : 'none', cursor: 'pointer', marginTop: 8 }}
          >
            Back to pricing
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FB', fontFamily: JAK }}>
      <style>{`
        @media (max-width: 640px) {
          .gaq-content { padding: 40px 16px 80px !important; }
          .gaq-step4-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ background: NAVY, padding: '0 16px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img src={logoWhite} alt="Delt" style={{ height: 64, objectFit: 'contain' }} />
        </button>
        <div style={{ fontFamily: JAK, fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.01em' }}>
          Get a Custom Quote
        </div>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.5)', fontFamily: JAK, fontSize: 14, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          Exit
        </button>
      </div>

      {/* Content */}
      <div className="gaq-content" style={{ maxWidth: 960, margin: '0 auto', padding: '64px 32px 100px' }}>
        <ProgressBar step={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Features ── */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontFamily: JAK, fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: NAVY, letterSpacing: '-1px', marginBottom: 14 }}>
                  What features do you need?
                </h1>
                <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
                  Select everything that matters to your business. We'll find the right fit.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 48 }}>
                {FEATURES.map(f => (
                  <FeatureCard key={f.id} item={f} selected={features.includes(f.id)} onToggle={() => toggleFeature(f.id)} />
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => canNext1 && setStep(2)}
                  style={{
                    padding: '17px 60px', borderRadius: 12, border: 'none',
                    background: canNext1 ? INDIGO : '#D1D5DB',
                    color: '#fff', fontFamily: JAK, fontSize: 17, fontWeight: 700,
                    cursor: canNext1 ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
                  }}
                >
                  Continue →
                </button>
                {!canNext1 && <p style={{ fontSize: 14, color: '#94A3B8', marginTop: 12 }}>Select at least one feature</p>}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Business type ── */}
          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontFamily: JAK, fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: NAVY, letterSpacing: '-1px', marginBottom: 14 }}>
                  What kind of business do you run?
                </h2>
                <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
                  This helps us tailor your quote to your industry.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 48 }}>
                {BIZ_TYPES.map(b => (
                  <RadioCard key={b.id} label={b.label} icon={b.icon} selected={bizType === b.id} onClick={() => setBizType(b.id)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setStep(1)} style={{ padding: '17px 36px', borderRadius: 12, border: '1.5px solid #D1D5DB', background: '#fff', color: NAVY, fontFamily: JAK, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={() => canNext2 && setStep(3)}
                  style={{ padding: '17px 60px', borderRadius: 12, border: 'none', background: canNext2 ? INDIGO : '#D1D5DB', color: '#fff', fontFamily: JAK, fontSize: 17, fontWeight: 700, cursor: canNext2 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Volume ── */}
          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontFamily: JAK, fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: NAVY, letterSpacing: '-1px', marginBottom: 14 }}>
                  What's your monthly payment volume?
                </h2>
                <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
                  We use this to recommend the most cost-effective rates for your business.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 540, margin: '0 auto 48px' }}>
                {VOLUMES.map(v => (
                  <RadioCard key={v.id} label={v.label} sub={v.sub} selected={volume === v.id} onClick={() => setVolume(v.id)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setStep(2)} style={{ padding: '17px 36px', borderRadius: 12, border: '1.5px solid #D1D5DB', background: '#fff', color: NAVY, fontFamily: JAK, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={() => canNext3 && setStep(4)}
                  style={{ padding: '17px 60px', borderRadius: 12, border: 'none', background: canNext3 ? INDIGO : '#D1D5DB', color: '#fff', fontFamily: JAK, fontSize: 17, fontWeight: 700, cursor: canNext3 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Contact + Summary ── */}
          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontFamily: JAK, fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: NAVY, letterSpacing: '-1px', marginBottom: 14 }}>
                  Almost there — where should we send your quote?
                </h2>
                <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
                  We'll only use your contact info to send your quote and relevant product updates. Unsubscribe anytime.
                </p>
              </div>

              <div className="gaq-step4-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {honeypotField}
                  {[
                    { key: 'name', label: 'Full name', placeholder: 'Jane Smith', type: 'text', required: true },
                    { key: 'email', label: 'Work email', placeholder: 'jane@business.com', type: 'email', required: true },
                    { key: 'phone', label: 'Phone (optional)', placeholder: '+1 (555) 000-0000', type: 'tel', required: false },
                    { key: 'business', label: 'Business name (optional)', placeholder: 'Acme Coffee Co.', type: 'text', required: false },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontFamily: JAK, fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        style={{
                          width: '100%', padding: '14px 16px', borderRadius: 10,
                          border: '1.5px solid #D1D5DB', fontFamily: JAK, fontSize: 15,
                          color: NAVY, background: '#fff', outline: 'none', boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target.style.borderColor = INDIGO)}
                        onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontFamily: JAK, fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                      Anything else? (optional)
                    </label>
                    <textarea
                      placeholder="Tell us more about your specific needs..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={3}
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: 10,
                        border: '1.5px solid #D1D5DB', fontFamily: JAK, fontSize: 15,
                        color: NAVY, background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => (e.target.style.borderColor = INDIGO)}
                      onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  <p style={{ fontFamily: JAK, fontSize: 13, color: '#475569', marginTop: 4 }}>By submitting, you acknowledge our <a href="#/privacy" target="_blank" rel="noopener noreferrer" style={{ color: INDIGO, textDecoration: 'underline' }}>Privacy Policy</a> and agree to our <a href="#/terms" target="_blank" rel="noopener noreferrer" style={{ color: INDIGO, textDecoration: 'underline' }}>Terms of Service</a>.</p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(3)} style={{ padding: '16px 28px', borderRadius: 12, border: '1.5px solid #D1D5DB', background: '#fff', color: NAVY, fontFamily: JAK, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      style={{
                        flex: 1, padding: '16px', borderRadius: 12, border: 'none',
                        background: canSubmit ? INDIGO : '#D1D5DB',
                        color: '#fff', fontFamily: JAK, fontSize: 17, fontWeight: 700,
                        cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
                      }}
                    >
                      Get My Quote
                    </button>
                  </div>
                </form>

                {/* Summary card */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '32px', border: '1.5px solid #E2E6ED', boxShadow: '0 4px 24px rgba(4,30,66,0.07)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 18 }}>Your summary</div>

                  {/* Recommended plan */}
                  <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(73,69,255,0.05)', border: '1.5px solid rgba(73,69,255,0.15)', marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, marginBottom: 6 }}>Recommended</div>
                    <div style={{ fontFamily: JAK, fontSize: 22, fontWeight: 800, color: rec.color }}>{rec.plan}</div>
                    <div style={{ fontFamily: JAK, fontSize: 14, color: '#6B7280', marginTop: 6, lineHeight: 1.55 }}>{rec.why}</div>
                  </div>

                  {/* Selected features */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 10 }}>Features selected</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {features.map(id => {
                        const f = FEATURES.find(x => x.id === id);
                        return f ? (
                          <span key={id} style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(73,69,255,0.08)', fontFamily: JAK, fontSize: 13, fontWeight: 600, color: INDIGO }}>
                            {f.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Business & volume */}
                  {bizType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F2F5' }}>
                      <span style={{ fontFamily: JAK, fontSize: 14, color: '#94A3B8' }}>Business type</span>
                      <span style={{ fontFamily: JAK, fontSize: 14, fontWeight: 600, color: NAVY }}>
                        {BIZ_TYPES.find(b => b.id === bizType)?.label}
                      </span>
                    </div>
                  )}
                  {volume && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F2F5' }}>
                      <span style={{ fontFamily: JAK, fontSize: 14, color: '#94A3B8' }}>Monthly volume</span>
                      <span style={{ fontFamily: JAK, fontSize: 14, fontWeight: 600, color: NAVY }}>
                        {VOLUMES.find(v => v.id === volume)?.label}
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: 18, padding: '14px', borderRadius: 10, background: 'rgba(22,199,132,0.07)', border: '1px solid rgba(22,199,132,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M5 13l4 4L19 7" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily: JAK, fontSize: 13.5, color: '#374151', lineHeight: 1.55 }}>
                      No commitment required. We'll build your quote, you decide.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}