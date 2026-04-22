import { useState } from 'react';
import { Rss, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';

/* ─── Data ───────────────────────────────────────────── */
type Tag = 'All' | 'Product' | 'API' | 'Security' | 'Compliance';

interface ChangelogItem {
  date: string;
  tag: Exclude<Tag, 'All'>;
  title: string;
  description: string;
}

const ITEMS: ChangelogItem[] = [
  {
    date: 'Apr 18, 2026',
    tag: 'Product',
    title: 'Lens AI now writes your weekly recap.',
    description:
      "Every Monday morning, Lens AI automatically compiles your week's key metrics — revenue, top-selling items, and outstanding tasks — into a crisp, one-page summary. You can customise the format or ask follow-up questions directly in the chat.",
  },
  {
    date: 'Apr 14, 2026',
    tag: 'API',
    title: 'New /v2/payouts/schedule endpoint.',
    description:
      'Merchants and developers can now programmatically retrieve and update payout schedule preferences via the new /v2/payouts/schedule endpoint. The endpoint supports daily, weekly, and monthly cadences and returns ISO 8601 next-payout timestamps.',
  },
  {
    date: 'Apr 09, 2026',
    tag: 'Security',
    title: 'SOC 2 Type II report refreshed for FY26.',
    description:
      'Our annual SOC 2 Type II audit covering the full FY2026 period is complete and available to enterprise customers under NDA. The report covers security, availability, and confidentiality trust-service criteria across all Delt infrastructure.',
  },
  {
    date: 'Apr 02, 2026',
    tag: 'Product',
    title: 'Auto-save drafts in Websites Builder.',
    description:
      'No more lost work. The Websites Builder now saves your changes automatically every 10 seconds and maintains a 30-day version history. You can restore any prior save from the new "History" panel in the editor toolbar.',
  },
  {
    date: 'Mar 28, 2026',
    tag: 'Compliance',
    title: 'PCI DSS 4.0 certification complete.',
    description:
      'Delt has achieved full PCI DSS 4.0 compliance across all card-processing infrastructure. Merchants no longer need to complete their own SAQ-A questionnaire for standard integrations — our updated compliance documentation explains what this means for your business.',
  },
  {
    date: 'Mar 21, 2026',
    tag: 'Product',
    title: 'Capital pre-qualified offers now in dashboard home.',
    description:
      'Eligible merchants will now see their pre-qualified Capital offer displayed on the dashboard home screen, with a one-click path to apply. Offers are recalculated nightly based on processing volume and are available to businesses processing $2k+ per month.',
  },
  {
    date: 'Mar 14, 2026',
    tag: 'API',
    title: 'Webhooks v3: signed, versioned, rotatable keys.',
    description:
      'Webhooks v3 introduces HMAC-SHA256 request signing, versioned event schemas, and the ability to rotate signing keys without downtime. All existing webhooks have been migrated automatically; see the migration guide for changes to the event envelope format.',
  },
  {
    date: 'Mar 07, 2026',
    tag: 'Product',
    title: 'Inventory low-stock alerts by SMS.',
    description:
      'Set per-product stock thresholds and receive an SMS the moment inventory dips below your chosen level. Alerts are configured per location, making this especially useful for multi-site merchants who want to act before a product sells out.',
  },
  {
    date: 'Feb 28, 2026',
    tag: 'Security',
    title: 'Passkey support for all admins.',
    description:
      'All admin accounts can now register a passkey (Face ID, Touch ID, or hardware key) as a primary or secondary authentication method. Passkeys are phishing-resistant and eliminate the need for one-time codes sent by SMS or authenticator apps.',
  },
  {
    date: 'Feb 21, 2026',
    tag: 'Product',
    title: 'Apple Tap to Pay on iPhone — generally available.',
    description:
      'Accept contactless payments directly on any iPhone XS or later — no card reader required. Tap to Pay on iPhone is now generally available to all US merchants on Delt Payments, with support for credit, debit, and digital wallets including Apple Pay and Google Pay.',
  },
];

const TAG_COLORS: Record<Exclude<Tag, 'All'>, { bg: string; text: string }> = {
  Product:    { bg: `${PURPLE}15`, text: PURPLE },
  API:        { bg: `${NAVY}12`,   text: NAVY },
  Security:   { bg: `${NAVY}18`,   text: NAVY },
  Compliance: { bg: `${PURPLE}10`, text: PURPLE },
};

/* ─── Sub-components ─────────────────────────────────── */
function TagPill({ tag }: { tag: Exclude<Tag, 'All'> }) {
  const c = TAG_COLORS[tag];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {tag}
    </span>
  );
}

function FeedCard({ item }: { item: ChangelogItem }) {
  return (
    <div
      className="group flex gap-6 rounded-2xl border p-6 transition-all duration-200"
      style={{
        background: WHITE,
        borderColor: `${NAVY}1A`,
        boxShadow: '0 1px 3px rgba(4,30,66,.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(4,30,66,.04)';
      }}
    >
      {/* Left meta */}
      <div className="flex-shrink-0 w-40 pt-0.5">
        <p className="text-sm text-[#475569]">{item.date}</p>
        <div className="mt-2">
          <TagPill tag={item.tag} />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-[#041E42]/10 self-stretch flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold tracking-tight text-[#041E42] mb-1.5">
          {item.title}
        </h3>
        <p className="text-sm text-[#475569] leading-relaxed mb-4">
          {item.description}
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: PURPLE }}
        >
          Read more <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function WhatsNewPage() {
  const [activeTab, setActiveTab] = useState<Tag>('All');

  const filtered = activeTab === 'All'
    ? ITEMS
    : ITEMS.filter(i => i.tag === activeTab);

  const tabs: Tag[] = ['All', 'Product', 'API', 'Security', 'Compliance'];

  return (
    <div style={{ background: WHITE, color: NAVY, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-24 pb-20 px-6"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${PURPLE}22 0%, transparent 70%), ${WHITE}`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: PURPLE }}>
            What's new
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-5"
            style={{ color: NAVY, lineHeight: 1.08 }}
          >
            Every ship, every week.
          </h1>
          <p className="text-lg text-[#475569] mb-8 max-w-xl">
            Updates, features, and fixes shipped at Delt.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: PURPLE }}
          >
            <Rss size={15} />
            Subscribe to RSS
          </a>
        </div>
      </section>

      {/* ══ FILTER TABS ════════════════════════════════════════ */}
      <div className="sticky top-0 z-10 border-b" style={{ background: WHITE, borderColor: `${NAVY}1A` }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-1 py-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={
                  activeTab === tab
                    ? { background: `${PURPLE}12`, color: PURPLE }
                    : { color: '#475569' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEED ═══════════════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            {filtered.map((item, i) => (
              <FeedCard key={i} item={item} />
            ))}
          </div>

          {/* Pagination */}
          <div
            className="mt-12 flex items-center justify-center gap-6 text-sm"
            style={{ color: '#475569' }}
          >
            <button
              className="inline-flex items-center gap-1.5 transition-colors"
              disabled
              style={{ opacity: 0.35, cursor: 'default' }}
            >
              <ArrowLeft size={14} />
              Previous
            </button>
            <span className="font-medium" style={{ color: NAVY }}>Page 1 of 4</span>
            <button
              className="inline-flex items-center gap-1.5 font-medium transition-colors"
              style={{ color: PURPLE }}
            >
              Next
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER CTA ════════════════════════════════════════ */}
      <section className="py-16 px-6 border-t" style={{ background: BG, borderColor: `${NAVY}1A` }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-[#041E42] mb-1">Stay in the loop</p>
            <p className="text-sm text-[#475569]">Get product updates directly in your inbox.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: PURPLE, color: WHITE }}
          >
            Subscribe to updates
            <ChevronRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
