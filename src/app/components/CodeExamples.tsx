import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from './MicroInteractions';

/* ──────────────────────────────────────────────────────────────
   CodeExamples — developer-first tabbed code section.
   Dark navy surface for rhythm against the light sections around
   it. Vertical tab list (left) + animated code panel (right).
   Delt-flavored TS snippets with light, tasteful syntax coloring
   via spans — no syntax-highlighting library.
   ────────────────────────────────────────────────────────────── */

type Token =
  | { t: 'kw'; v: string }
  | { t: 'str'; v: string }
  | { t: 'com'; v: string }
  | { t: 'fn'; v: string }
  | { t: 'num'; v: string }
  | { t: 'p'; v: string };

interface Tab {
  id: string;
  label: string;
  filename: string;
  lines: Token[][];
}

const KW = '#A5B4FC';
const STR = '#7CE3C4';
const COM = 'rgba(247,245,240,0.40)';
const FN = '#C7B3FF';
const NUM = '#F5B400';
const PLAIN = 'rgba(247,245,240,0.92)';

function colorFor(t: Token['t']): string {
  switch (t) {
    case 'kw': return KW;
    case 'str': return STR;
    case 'com': return COM;
    case 'fn': return FN;
    case 'num': return NUM;
    default: return PLAIN;
  }
}

const TABS: Tab[] = [
  {
    id: 'payment',
    label: 'Accept a Payment',
    filename: 'accept-payment.ts',
    lines: [
      [{ t: 'com', v: '// Create a payment intent and charge a card' }],
      [{ t: 'kw', v: 'import' }, { t: 'p', v: ' { Delt } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " 'delt'" }, { t: 'p', v: ';' }],
      [],
      [{ t: 'kw', v: 'const' }, { t: 'p', v: ' delt = ' }, { t: 'kw', v: 'new' }, { t: 'fn', v: ' Delt' }, { t: 'p', v: '(process.env.DELT_SECRET_KEY);' }],
      [],
      [{ t: 'kw', v: 'const' }, { t: 'p', v: ' payment = ' }, { t: 'kw', v: 'await' }, { t: 'p', v: ' delt.payments.' }, { t: 'fn', v: 'create' }, { t: 'p', v: '({' }],
      [{ t: 'p', v: '  amount: ' }, { t: 'num', v: '4200' }, { t: 'p', v: ',' }, { t: 'com', v: ' // $42.00 in cents' }],
      [{ t: 'p', v: '  currency: ' }, { t: 'str', v: "'usd'" }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '  source: ' }, { t: 'str', v: "'tok_visa'" }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '  description: ' }, { t: 'str', v: "'In-store sale · Register 3'" }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '  capture: ' }, { t: 'kw', v: 'true' }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '});' }],
      [],
      [{ t: 'fn', v: 'console' }, { t: 'p', v: '.' }, { t: 'fn', v: 'log' }, { t: 'p', v: '(payment.id, payment.status);' }],
    ],
  },
  {
    id: 'customer',
    label: 'Create a Customer',
    filename: 'create-customer.ts',
    lines: [
      [{ t: 'com', v: '// Store a reusable customer profile' }],
      [{ t: 'kw', v: 'import' }, { t: 'p', v: ' { Delt } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " 'delt'" }, { t: 'p', v: ';' }],
      [],
      [{ t: 'kw', v: 'const' }, { t: 'p', v: ' delt = ' }, { t: 'kw', v: 'new' }, { t: 'fn', v: ' Delt' }, { t: 'p', v: '(process.env.DELT_SECRET_KEY);' }],
      [],
      [{ t: 'kw', v: 'const' }, { t: 'p', v: ' customer = ' }, { t: 'kw', v: 'await' }, { t: 'p', v: ' delt.customers.' }, { t: 'fn', v: 'create' }, { t: 'p', v: '({' }],
      [{ t: 'p', v: '  name: ' }, { t: 'str', v: "'Acme Coffee Co.'" }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '  email: ' }, { t: 'str', v: "'owner@acmecoffee.com'" }, { t: 'p', v: ',' }],
      [{ t: 'p', v: '  metadata: { tier: ' }, { t: 'str', v: "'growth'" }, { t: 'p', v: ' },' }],
      [{ t: 'p', v: '});' }],
      [],
      [{ t: 'com', v: '// Attach to future charges via customer.id' }],
      [{ t: 'fn', v: 'console' }, { t: 'p', v: '.' }, { t: 'fn', v: 'log' }, { t: 'p', v: '(customer.id);' }],
    ],
  },
  {
    id: 'webhook',
    label: 'Handle Webhooks',
    filename: 'webhook-handler.ts',
    lines: [
      [{ t: 'com', v: '// Verify and react to Delt events' }],
      [{ t: 'kw', v: 'import' }, { t: 'p', v: ' { Delt } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " 'delt'" }, { t: 'p', v: ';' }],
      [],
      [{ t: 'kw', v: 'export' }, { t: 'kw', v: ' async' }, { t: 'kw', v: ' function' }, { t: 'fn', v: ' POST' }, { t: 'p', v: '(req: Request) {' }],
      [{ t: 'p', v: '  ' }, { t: 'kw', v: 'const' }, { t: 'p', v: ' sig = req.headers.' }, { t: 'fn', v: 'get' }, { t: 'p', v: '(' }, { t: 'str', v: "'delt-signature'" }, { t: 'p', v: ');' }],
      [{ t: 'p', v: '  ' }, { t: 'kw', v: 'const' }, { t: 'p', v: ' event = delt.webhooks.' }, { t: 'fn', v: 'verify' }, { t: 'p', v: '(' }, { t: 'kw', v: 'await' }, { t: 'p', v: ' req.' }, { t: 'fn', v: 'text' }, { t: 'p', v: '(), sig);' }],
      [],
      [{ t: 'p', v: '  ' }, { t: 'kw', v: 'if' }, { t: 'p', v: ' (event.type === ' }, { t: 'str', v: "'payment.succeeded'" }, { t: 'p', v: ') {' }],
      [{ t: 'p', v: '    ' }, { t: 'fn', v: 'fulfillOrder' }, { t: 'p', v: '(event.data.id);' }],
      [{ t: 'p', v: '  }' }],
      [],
      [{ t: 'p', v: '  ' }, { t: 'kw', v: 'return' }, { t: 'kw', v: ' new' }, { t: 'fn', v: ' Response' }, { t: 'p', v: '(' }, { t: 'str', v: "'ok'" }, { t: 'p', v: ', { status: ' }, { t: 'num', v: '200' }, { t: 'p', v: ' });' }],
      [{ t: 'p', v: '}' }],
    ],
  },
];

function CodePanel({ tab }: { tab: Tab }) {
  const [copied, setCopied] = useState(false);

  const plainText = tab.lines
    .map((line) => line.map((tok) => tok.v).join(''))
    .join('\n');

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(plainText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      });
    }
  };

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: '#0B0D24',
        border: '1px solid var(--dc-rule-on-dark)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}
    >
      {/* Panel chrome */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--dc-rule-on-dark)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(247,245,240,0.18)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(247,245,240,0.18)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(247,245,240,0.18)' }} />
          </span>
          <span
            className="text-[12px] truncate"
            style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
          >
            {tab.filename}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-[6px] transition-colors flex-shrink-0"
          style={{
            fontFamily: 'var(--dc-font-mono)',
            color: copied ? '#7CE3C4' : 'var(--dc-on-dark-muted)',
            border: '1px solid var(--dc-rule-on-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
          aria-label="Copy code"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code body — horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <pre
          className="px-5 py-5 text-[13px] leading-[1.7] min-w-max"
          style={{ fontFamily: 'var(--dc-font-mono)', margin: 0 }}
        >
          <code>
            {tab.lines.map((line, i) => (
              <div key={i} className="flex">
                <span
                  className="select-none pr-5 text-right inline-block"
                  style={{ width: 28, color: 'rgba(247,245,240,0.22)' }}
                >
                  {i + 1}
                </span>
                <span className="whitespace-pre">
                  {line.length === 0
                    ? ' '
                    : line.map((tok, j) => (
                        <span key={j} style={{ color: colorFor(tok.t) }}>
                          {tok.v}
                        </span>
                      ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function CodeExamples() {
  const [active, setActive] = useState(0);
  const activeTab = TABS[active];

  return (
    <section
      className="relative w-full overflow-hidden py-24 lg:py-28"
      style={{ background: 'var(--dc-bg-navy)', color: 'var(--dc-on-dark)' }}
    >
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 480px at 18% 30%, rgba(73,69,255,0.16), transparent 60%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="max-w-[640px]">
          <div className="dc-eyebrow" style={{ color: '#A5B4FC' }}>
            DEVELOPER-FIRST
          </div>
          <h2
            className="mt-5 dc-h2"
            style={{
              color: 'var(--dc-on-dark)',
              fontSize: 'clamp(34px, 5vw, 56px)',
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: '-0.035em',
            }}
          >
            Built for builders
            <span style={{ color: 'var(--dc-indigo)' }}>.</span>
          </h2>
          <p
            className="mt-5 text-[16px] leading-[1.6]"
            style={{ color: 'var(--dc-on-dark-muted)', fontFamily: 'var(--dc-font-body)' }}
          >
            A clean, predictable API. Drop in a few lines and start moving
            money — payments, customers, and webhooks, all from one SDK.
          </p>
        </ScrollReveal>

        {/* Tabs + panel */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
          {/* Tab list */}
          <div
            className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0"
            role="tablist"
            aria-label="Code examples"
          >
            {TABS.map((tab, i) => {
              const isActive = i === active;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className="relative text-left px-4 py-3 rounded-[8px] transition-colors flex-shrink-0 whitespace-nowrap lg:whitespace-normal"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    fontSize: 13,
                    letterSpacing: '0.02em',
                    color: isActive ? 'var(--dc-on-dark)' : 'var(--dc-on-dark-subtle)',
                    background: isActive ? 'rgba(73,69,255,0.12)' : 'transparent',
                    border: isActive
                      ? '1px solid rgba(73,69,255,0.35)'
                      : '1px solid transparent',
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="hidden lg:block absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                      style={{ background: 'var(--dc-indigo)' }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Animated code panel */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CodePanel tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CodeExamples;
