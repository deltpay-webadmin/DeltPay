import { useState } from 'react';
import { useNavigate } from 'react-router';
import { serverFetch } from '../lib/supabase';

const NAVY   = '#041E42';
const INDIGO = '#4945FF';
const JAK    = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

type Field = {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
};

type Group = { title: string; fields: Field[] };

/* Field definitions — keys mirror the edge-function APPLICATION_FIELDS. */
const GROUPS: Group[] = [
  {
    title: 'Owner Information',
    fields: [
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'cellPhone', label: 'Cell Phone Number', type: 'tel', placeholder: '(000) 000-0000' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'example@example.com' },
      { key: 'ssn', label: 'Social Security Number', required: true },
      { key: 'dob', label: 'Date of Birth', type: 'date' },
      { key: 'homeAddress', label: 'Home Address', required: true },
      { key: 'homeCity', label: 'Home City', required: true },
      { key: 'homeState', label: 'Home State', required: true },
      { key: 'homeZip', label: 'Home Zip Code', required: true },
    ],
  },
  {
    title: 'Business Information',
    fields: [
      { key: 'legalBusinessName', label: 'Legal Business Name', required: true },
      { key: 'dba', label: 'DBA' },
      { key: 'businessType', label: 'Business Type', required: true },
      { key: 'businessAddress', label: 'Business Address', required: true },
      { key: 'businessCity', label: 'Business City', required: true },
      { key: 'businessState', label: 'Business State', required: true },
      { key: 'businessZip', label: 'Business Zip Code', required: true },
      { key: 'businessPhone', label: 'Business Phone Number', required: true, type: 'tel', placeholder: '(000) 000-0000' },
      { key: 'connectionType', label: 'Connection Type', required: true },
      { key: 'yearsInBusiness', label: 'Years in Business' },
      { key: 'averageTicket', label: 'Average Ticket' },
      { key: 'wantTips', label: 'Do you want tips?', type: 'select', options: ['Yes', 'No'] },
      { key: 'autoBatchTime', label: 'Auto Batch Time', required: true },
      { key: 'monthlyVolume', label: 'Total Monthly Card Volume', required: true },
      { key: 'highTicket', label: 'High Ticket', required: true },
      { key: 'ein', label: 'EIN Federal Tax ID #', required: true },
      { key: 'ebtFsn', label: 'EBT FSN #' },
      { key: 'acceptWex', label: 'Accept WEX/Fleet Cards?', required: true, type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    title: 'Bank & Deposit Information',
    fields: [
      { key: 'bankName', label: 'Bank Name', required: true },
      { key: 'accountHolderName', label: 'Account Holder Name', required: true },
      { key: 'routingNumber', label: 'Routing Number', required: true },
      { key: 'accountNumber', label: 'Account Number', required: true },
      { key: 'accountType', label: 'Account Type', required: true, type: 'select', options: ['Checking', 'Savings'] },
    ],
  },
];

const ALL_FIELDS = GROUPS.flatMap((g) => g.fields);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #D1D5DB',
  fontSize: 15,
  fontFamily: JAK,
  color: '#1F2937',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

export function StartApplicationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const missing = ALL_FIELDS.filter((f) => f.required && !(form[f.key] || '').trim());
    if (missing.length) {
      setError(`Please complete the required fields: ${missing.map((f) => f.label).join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await serverFetch('/applications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to submit right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: JAK, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '64px 56px', maxWidth: 560, width: '100%', textAlign: 'center', boxShadow: '0 16px 60px rgba(4,30,66,0.10)' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(73,69,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Thank You!</h1>
          <p style={{ fontSize: 16, color: '#5B6472', lineHeight: 1.7, margin: 0 }}>
            Your DeltPay merchant application has been received. Our team will review your
            information and reach out within <strong>1 business day</strong>.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ marginTop: 32, padding: '14px 32px', borderRadius: 10, background: NAVY, color: '#fff', fontFamily: JAK, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={{ minHeight: '100vh', fontFamily: JAK, background: '#F4F5F7', padding: '0 0 64px' }}>
      <style>{`
        .app-input:focus { border-color: ${INDIGO} !important; box-shadow: 0 0 0 3px rgba(73,69,255,0.12); }
        .app-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 28px; }
        @media (max-width: 640px) { .app-grid { grid-template-columns: 1fr; } .app-body { padding: 24px 18px !important; } }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, padding: '44px 24px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          DeltPay Merchant Application
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '10px 0 0' }}>
          Complete this secure application to begin processing payments with DeltPay
        </p>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 860, margin: '32px auto 0', padding: '0 24px' }}>
        <div className="app-body" style={{ background: '#fff', borderRadius: 16, padding: '40px 40px', boxShadow: '0 8px 40px rgba(4,30,66,0.06)', border: '1px solid rgba(4,30,66,0.05)' }}>
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', color: '#B91C1C', borderRadius: 10, padding: '14px 16px', fontSize: 14, marginBottom: 28 }}>
              {error}
            </div>
          )}

          {GROUPS.map((group, gi) => (
            <div key={group.title} style={{ marginTop: gi === 0 ? 0 : 40 }}>
              <div style={{ borderLeft: `4px solid ${INDIGO}`, background: '#F0F1FF', padding: '10px 16px', borderRadius: 6, marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                  {group.title}
                </h2>
              </div>

              <div className="app-grid">
                {group.fields.map((f) => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                      {f.label}
                      {f.required && <span style={{ color: INDIGO, marginLeft: 3 }}>*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        className="app-input"
                        style={inputStyle}
                        value={form[f.key] || ''}
                        onChange={(e) => set(f.key, e.target.value)}
                      >
                        <option value="">Please Select</option>
                        {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        className="app-input"
                        style={inputStyle}
                        type={f.type || 'text'}
                        placeholder={f.placeholder}
                        value={form[f.key] || ''}
                        onChange={(e) => set(f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 40,
              width: '100%',
              height: 54,
              borderRadius: 10,
              background: submitting ? '#33436b' : NAVY,
              color: '#fff',
              fontFamily: JAK,
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: submitting ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#9AA2B1' }}>
            Your information is encrypted and securely transmitted.
          </p>
        </div>
      </form>
    </div>
  );
}
