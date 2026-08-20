import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Building2,
  CreditCard,
  Banknote,
  ShieldCheck,
  PartyPopper,
  ChevronDown,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DELTPAY MERCHANT-SERVICES SELF-ONBOARDING
   ─────────────────────────────────────────────────────────
   Mirrors the Delt Capital onboarding modal: dark navy stage,
   centered white card, numbered left rail + trust panel,
   right pane form, footer with status + Skip / Continue.

   Five steps:
     1. Business      — entity / location / contact
     2. Processing    — what you sell, volume, ticket size
     3. Bank          — Plaid (placeholder; UI-only for now — TODO: reuse
                        the /apply/intake hosted-link flow from ApplicationPage)
     4. Identity      — owner KYC details
     5. Done          — success state with next-step list
   ═══════════════════════════════════════════════════════════ */

// ── Tokens ────────────────────────────────────────────────
const NAVY = '#041E42';
const NAVY_DEEP = '#02132C';
const RAIL = '#0A1F3F';
const RAIL_LINE = '#15315A';
const ACCENT = '#4945FF';
const ACCENT_LIGHT = '#6C69FF';
const TEXT_DARK = '#0B1F3D';
const TEXT_MUTED = '#5B6B85';
const TEXT_FAINT = '#94A3B8';
const HAIRLINE = '#E5E9F2';
const FIELD_BORDER = '#D9DEEA';
const FIELD_BG = '#FFFFFF';
const FONT_SANS = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

type StepKey = 'business' | 'processing' | 'bank' | 'identity' | 'done';

const STEPS: { key: StepKey; label: string; eyebrow: string; icon: any }[] = [
  { key: 'business',   label: 'Business',   eyebrow: 'STEP 01', icon: Building2 },
  { key: 'processing', label: 'Processing', eyebrow: 'STEP 02', icon: CreditCard },
  { key: 'bank',       label: 'Bank',       eyebrow: 'STEP 03', icon: Banknote },
  { key: 'identity',   label: 'Identity',   eyebrow: 'STEP 04', icon: ShieldCheck },
  { key: 'done',       label: 'Done',       eyebrow: 'STEP 05', icon: PartyPopper },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const current = STEPS[stepIdx];
  const totalSteps = STEPS.length;

  // ── Form state ─────────────────────────────────────────
  const [form, setForm] = useState({
    // business
    legalName: '',
    dba: '',
    ein: '',
    entityType: 'LLC',
    state: 'CA',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // processing
    businessCategory: 'Restaurant',
    monthlyVolume: '$10k – $50k',
    averageTicket: '',
    acceptsCardToday: 'Yes',
    // bank
    bankConnected: false,
    // identity
    ownershipPct: '',
    dob: '',
    ssnLast4: '',
    addressLine1: '',
    city: '',
    zip: '',
  });

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canContinue = useMemo(() => {
    switch (current.key) {
      case 'business':
        return !!(form.legalName && form.ein && form.firstName && form.lastName && form.email);
      case 'processing':
        return !!(form.businessCategory && form.monthlyVolume && form.averageTicket);
      case 'bank':
        return form.bankConnected;
      case 'identity':
        return !!(form.dob && form.ssnLast4 && form.addressLine1 && form.zip);
      default:
        return true;
    }
  }, [current.key, form]);

  const next = () => {
    // "Submit application" (identity step -> done): email the application to
    // the team. Fire-and-forget; DOB and SSN are intentionally NOT sent.
    if (current.key === 'identity') {
      const { dob: _dob, ssnLast4: _ssn, ...safe } = form;
      fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'onboarding', ...safe }),
      }).catch(() => {});
    }
    if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1);
  };
  const back = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };
  const skipToIdentity = () => {
    const idx = STEPS.findIndex((s) => s.key === 'identity');
    if (idx >= 0) setStepIdx(idx);
  };
  const close = () => navigate('/');

  // ── Render ─────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 120% 80% at 50% -10%, #0A2350 0%, ${NAVY} 35%, ${NAVY_DEEP} 100%)`,
        fontFamily: FONT_SANS,
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 24px 80px',
      }}
    >
      {/* Faint backdrop word — matches the Capital screenshot atmosphere */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -32,
          top: 90,
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.025)',
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: FONT_SANS,
        }}
      >
        Your<br />business<br />processed.
      </div>

      {/* Card */}
      <div
        style={{
          position: 'relative',
          maxWidth: 1180,
          margin: '0 auto',
          borderRadius: 22,
          background: '#FFFFFF',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 320px) 1fr',
          minHeight: 640,
          boxShadow:
            '0 40px 90px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.25)',
        }}
      >
        {/* ── LEFT RAIL ───────────────────────────────────── */}
        <aside
          style={{
            background: `linear-gradient(180deg, ${RAIL} 0%, ${NAVY_DEEP} 100%)`,
            color: '#fff',
            padding: '26px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            borderRight: `1px solid ${RAIL_LINE}`,
          }}
        >
          {/* Brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                fontFamily: FONT_SANS,
              }}
            >
              D
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
              Delt&nbsp;<span style={{ opacity: 0.65, fontWeight: 500 }}>· Get processing</span>
            </div>
          </div>

          {/* Step list */}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {STEPS.map((s, i) => {
              const isActive = i === stepIdx;
              const isComplete = i < stepIdx;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => i < stepIdx && setStepIdx(i)}
                    disabled={i > stepIdx}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 10px',
                      borderRadius: 10,
                      background: isActive ? 'rgba(108,105,255,0.10)' : 'transparent',
                      border: isActive
                        ? `1px solid rgba(108,105,255,0.35)`
                        : '1px solid transparent',
                      color: isActive ? '#fff' : isComplete ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.50)',
                      cursor: i < stepIdx ? 'pointer' : 'default',
                      textAlign: 'left',
                      fontFamily: FONT_SANS,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: isActive
                          ? `1.5px solid ${ACCENT_LIGHT}`
                          : isComplete
                            ? `1.5px solid ${ACCENT_LIGHT}`
                            : '1.5px solid rgba(255,255,255,0.18)',
                        background: isComplete ? ACCENT_LIGHT : 'transparent',
                        color: isComplete ? '#fff' : isActive ? ACCENT_LIGHT : 'rgba(255,255,255,0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {isComplete ? <Check size={13} strokeWidth={3} /> : String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.45)',
                          fontFamily: FONT_MONO,
                          fontWeight: 600,
                        }}
                      >
                        {s.eyebrow}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{s.label}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Trust panel */}
          <div
            style={{
              borderTop: `1px solid ${RAIL_LINE}`,
              paddingTop: 18,
              fontSize: 12,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 8,
              }}
            >
              Trust &amp; Security
            </div>
            <div>· Soft-pull only (no hard inquiry)</div>
            <div>· Plaid read-only — no ACH yet</div>
            <div>· Data purged 30d if declined</div>
          </div>
        </aside>

        {/* ── RIGHT PANE ──────────────────────────────────── */}
        <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <div
            style={{
              padding: '20px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${HAIRLINE}`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: TEXT_MUTED,
              }}
            >
              <span style={{ color: TEXT_DARK, fontWeight: 700 }}>{stepIdx + 1}</span>
              <span style={{ opacity: 0.6 }}> / {totalSteps}</span>
              <span style={{ margin: '0 10px', opacity: 0.5 }}>·</span>
              {current.label}
            </div>
            <button
              onClick={close}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
                color: TEXT_MUTED,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '34px 36px 24px', overflowY: 'auto' }}>
            <Eyebrow>{current.eyebrow} · {current.label.toUpperCase()}</Eyebrow>

            {current.key === 'business' && (
              <BusinessStep form={form} update={update} />
            )}
            {current.key === 'processing' && (
              <ProcessingStep form={form} update={update} />
            )}
            {current.key === 'bank' && (
              <BankStep
                connected={form.bankConnected}
                onConnect={() => update('bankConnected', true)}
              />
            )}
            {current.key === 'identity' && (
              <IdentityStep form={form} update={update} />
            )}
            {current.key === 'done' && <DoneStep email={form.email} />}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 36px',
              borderTop: `1px solid ${HAIRLINE}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              background: '#FAFBFE',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: TEXT_MUTED,
              }}
            >
              <Lock size={12} />
              SECURED &nbsp;·&nbsp; PLAID &nbsp;·&nbsp; SOFT-PULL ONLY
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {stepIdx > 0 && current.key !== 'done' && (
                <button
                  onClick={back}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    color: TEXT_MUTED,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={13} /> BACK
                </button>
              )}
              {current.key === 'business' && (
                <button
                  onClick={skipToIdentity}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    border: `1px dashed ${FIELD_BORDER}`,
                    borderRadius: 10,
                    background: 'transparent',
                    color: TEXT_MUTED,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  SKIP &rarr; IDENTITY
                </button>
              )}

              {current.key === 'done' ? (
                <button
                  onClick={() => navigate('/')}
                  style={primaryBtn(true)}
                >
                  Back to home <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={next}
                  disabled={!canContinue}
                  style={primaryBtn(canContinue)}
                >
                  {current.key === 'identity' ? 'Submit application' : 'Continue'}{' '}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <p
        style={{
          maxWidth: 720,
          margin: '22px auto 0',
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7,
        }}
      >
        By continuing you authorize Delt and our verification partners to perform a soft-pull KYB
        check and to read transaction history through Plaid. We never sell your data, and we don't
        surface this application to credit bureaus.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function BusinessStep({
  form,
  update,
}: {
  form: any;
  update: (k: any, v: string | boolean) => void;
}) {
  return (
    <>
      <StepHeader
        title="Tell us about your business."
        subtitle="Used to verify entity formation and run a soft-pull KYB check. We don't hard-pull business credit and we don't surface this to bureaus."
      />
      <Grid>
        <Field label="Legal business name">
          <Input value={form.legalName} onChange={(v) => update('legalName', v)} placeholder="La Rosa Restaurant LLC" />
        </Field>
        <Field label="EIN" hint="9 digits">
          <Input value={form.ein} onChange={(v) => update('ein', v)} placeholder="12-3456789" />
        </Field>
        <Field label="Entity type">
          <Select
            value={form.entityType}
            onChange={(v) => update('entityType', v)}
            options={['LLC', 'Corporation', 'Sole Proprietor', 'Partnership', 'Nonprofit']}
          />
        </Field>
        <Field label="State of operation">
          <Select
            value={form.state}
            onChange={(v) => update('state', v)}
            options={['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'CO', 'GA', 'MA', 'PA', 'NJ', 'AZ', 'OR', 'NV', 'OH', 'NC', 'VA', 'MI']}
          />
        </Field>
        <Field label="First name">
          <Input value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="Maria" />
        </Field>
        <Field label="Last name">
          <Input value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Rodriguez" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="you@business.com" />
        </Field>
        <Field label="Phone">
          <Input type="tel" value={form.phone} onChange={(v) => update('phone', v)} placeholder="(555) 555-0199" />
        </Field>
      </Grid>
    </>
  );
}

function ProcessingStep({
  form,
  update,
}: {
  form: any;
  update: (k: any, v: string | boolean) => void;
}) {
  return (
    <>
      <StepHeader
        title="How do you take payments today?"
        subtitle="This sets your processing tier, default hardware, and underwriting band. You can change everything later — nothing here is locked in."
      />
      <Grid>
        <Field label="Business category">
          <Select
            value={form.businessCategory}
            onChange={(v) => update('businessCategory', v)}
            options={[
              'Restaurant',
              'Retail',
              'Salon / Spa',
              'Professional services',
              'E-commerce',
              'Auto / repair',
              'Healthcare',
              'Events / venue',
              'Other',
            ]}
          />
        </Field>
        <Field label="Monthly card volume">
          <Select
            value={form.monthlyVolume}
            onChange={(v) => update('monthlyVolume', v)}
            options={[
              'Under $10k',
              '$10k – $50k',
              '$50k – $250k',
              '$250k – $1M',
              '$1M+',
            ]}
          />
        </Field>
        <Field label="Average ticket">
          <Input value={form.averageTicket} onChange={(v) => update('averageTicket', v)} placeholder="$ 42" />
        </Field>
        <Field label="Already accepting cards?">
          <Select
            value={form.acceptsCardToday}
            onChange={(v) => update('acceptsCardToday', v)}
            options={['Yes', 'No', 'Switching providers']}
          />
        </Field>
      </Grid>

      <div
        style={{
          marginTop: 24,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#F4F6FF',
          border: `1px solid #DDE2F7`,
          color: TEXT_DARK,
          fontSize: 13,
          lineHeight: 1.6,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: ACCENT,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CreditCard size={15} />
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: 2 }}>Hardware on us.</strong>
          <span style={{ color: TEXT_MUTED }}>
            Based on your category we'll bundle a free Delt Reader (and a tableside flip-stand if
            you're food &amp; beverage). Ships once underwriting clears.
          </span>
        </div>
      </div>
    </>
  );
}

function BankStep({
  connected,
  onConnect,
}: {
  connected: boolean;
  onConnect: () => void;
}) {
  return (
    <>
      <StepHeader
        title="Connect your business bank."
        subtitle="We use Plaid in read-only mode to verify deposits and forecast your cash flow. We can't move money — that requires a separate ACH consent later."
      />

      <div
        style={{
          marginTop: 8,
          padding: '28px',
          borderRadius: 16,
          border: `1px solid ${HAIRLINE}`,
          background: '#FAFBFE',
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: connected ? '#DCFCE7' : '#EEF1FB',
            color: connected ? '#16A34A' : ACCENT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {connected ? <Check size={26} strokeWidth={3} /> : <Banknote size={26} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK }}>
            {connected ? 'Bank connected via Plaid' : 'Connect via Plaid'}
          </div>
          <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 2, lineHeight: 1.6 }}>
            {connected
              ? 'We pulled the last 90 days of deposits to underwrite your account. You can revoke access any time from settings.'
              : 'Choose your bank, sign in once, and Plaid sends us a read-only token. Takes about 60 seconds.'}
          </div>
        </div>
        {!connected && (
          <button onClick={onConnect} style={primaryBtn(true)}>
            Connect bank <ArrowRight size={15} />
          </button>
        )}
      </div>

      <ul
        style={{
          marginTop: 22,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {[
          ['Read-only access', 'No ACH, no debits, ever — without a second consent.'],
          ['Bank-grade security', '256-bit encryption + Plaid OAuth at every major bank.'],
          ['Faster underwriting', '90 days of deposits → an answer in under a business day.'],
        ].map(([t, d]) => (
          <li
            key={t}
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: '#fff',
              border: `1px solid ${HAIRLINE}`,
              fontSize: 12,
              color: TEXT_MUTED,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4, fontSize: 13 }}>{t}</div>
            {d}
          </li>
        ))}
      </ul>
    </>
  );
}

function IdentityStep({
  form,
  update,
}: {
  form: any;
  update: (k: any, v: string | boolean) => void;
}) {
  return (
    <>
      <StepHeader
        title="Verify your identity."
        subtitle="A federal requirement (Patriot Act / KYC). We do a soft-pull only — your personal credit score is unaffected."
      />
      <Grid>
        <Field label="Ownership %" hint="If you own 25% or more">
          <Input value={form.ownershipPct} onChange={(v) => update('ownershipPct', v)} placeholder="100" />
        </Field>
        <Field label="Date of birth">
          <Input type="date" value={form.dob} onChange={(v) => update('dob', v)} />
        </Field>
        <Field label="SSN" hint="Last 4 digits">
          <Input value={form.ssnLast4} onChange={(v) => update('ssnLast4', v)} placeholder="• • • •" />
        </Field>
        <Field label="Home address">
          <Input value={form.addressLine1} onChange={(v) => update('addressLine1', v)} placeholder="123 Mission St" />
        </Field>
        <Field label="City">
          <Input value={form.city} onChange={(v) => update('city', v)} placeholder="San Francisco" />
        </Field>
        <Field label="ZIP">
          <Input value={form.zip} onChange={(v) => update('zip', v)} placeholder="94103" />
        </Field>
      </Grid>
    </>
  );
}

function DoneStep({ email }: { email: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '36px 16px 16px' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(73,69,255,0.10)',
          color: ACCENT,
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid rgba(73,69,255,0.25)`,
        }}
      >
        <Check size={36} strokeWidth={2.5} />
      </div>
      <h2
        style={{
          margin: '0 0 8px',
          fontSize: 30,
          fontWeight: 800,
          color: TEXT_DARK,
          letterSpacing: '-0.025em',
        }}
      >
        You're in. Welcome to Delt.
      </h2>
      <p style={{ color: TEXT_MUTED, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
        We're underwriting your account now. Most merchants are approved within one business day —
        we'll email <strong style={{ color: TEXT_DARK }}>{email || 'you'}</strong> the moment you're cleared.
      </p>
      <ul
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: 0,
          listStyle: 'none',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {[
          'Underwriting decision within 1 business day',
          'Free Delt Reader ships once approved',
          'Start processing the same day hardware lands',
          'Capital pre-qualification available once you’re processing — opt in anytime',
        ].map((t) => (
          <li
            key={t}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#F8F9FE',
              border: `1px solid ${HAIRLINE}`,
              color: TEXT_DARK,
              fontSize: 14,
            }}
          >
            <Check size={16} style={{ color: ACCENT, marginTop: 2, flexShrink: 0 }} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ATOMS
   ═══════════════════════════════════════════════════════════ */

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h1
        style={{
          margin: '6px 0 8px',
          fontSize: 30,
          fontWeight: 800,
          color: TEXT_DARK,
          letterSpacing: '-0.025em',
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      <p style={{ margin: '0 0 28px', color: TEXT_MUTED, fontSize: 14.5, lineHeight: 1.65, maxWidth: 580 }}>
        {subtitle}
      </p>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: TEXT_FAINT,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px 20px',
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: TEXT_MUTED,
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: 11, color: TEXT_FAINT, fontStyle: 'italic' }}>{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: `1px solid ${FIELD_BORDER}`,
        background: FIELD_BG,
        color: TEXT_DARK,
        fontSize: 14.5,
        fontFamily: FONT_SANS,
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = ACCENT;
        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(73,69,255,0.12)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = FIELD_BORDER;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 38px 12px 14px',
          borderRadius: 10,
          border: `1px solid ${FIELD_BORDER}`,
          background: FIELD_BG,
          color: TEXT_DARK,
          fontSize: 14.5,
          fontFamily: FONT_SANS,
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: TEXT_MUTED,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function primaryBtn(enabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 12,
    border: 'none',
    background: enabled ? ACCENT : '#C7CCE0',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: FONT_SANS,
    cursor: enabled ? 'pointer' : 'not-allowed',
    boxShadow: enabled ? '0 6px 18px rgba(73,69,255,0.35)' : 'none',
    letterSpacing: '-0.005em',
    transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
  };
}
