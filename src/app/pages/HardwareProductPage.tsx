/* ──────────────────────────────────────────────────────────────────────
   HardwareProductPage.tsx
   Per-device detail page modeled on Verifone's product pages
   (navy hero w/ dot-grid, alternating feature blocks, specs grid,
   bottom CTA card). Driven by URL slug: /hardware/:slug
   ─────────────────────────────────────────────────────────────────────── */

import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

/* Asset imports — transparent PNG versions for floating on navy */
import imgRegister     from '@/app/assets/hardware/register.png';
import imgHandheld     from '@/app/assets/hardware/handheld.png';
import imgTerminal     from '@/app/assets/hardware/terminal.png';
import imgStand        from '@/app/assets/hardware/stand.png';
import imgKiosk        from '@/app/assets/hardware/kiosk.png';
import imgReader       from '@/app/assets/hardware/reader-contactless.png';

/* ─── Brand palette ────────────────────────────────────────────────── */
const NAVY     = '#041E42';
const NAVY_DEEP = '#02132B';      // even deeper for hero
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const WHITE    = '#FFFFFF';

/* ─── Product catalog ──────────────────────────────────────────────── */
type SpecGroup = { title: string; rows: { label: string; value: string }[] };
type Feature = { title: string; body: string };
type Product = {
  slug: string;
  name: string;
  tagline: string;       // hero subtitle
  badge?: string;
  image: string;
  features: Feature[];   // 3 blocks
  specs: SpecGroup[];
  bullets: string[];     // quick highlights row
};

const PRODUCTS: Record<string, Product> = {
  'delt-register': {
    slug: 'delt-register',
    name: 'Delt Register',
    badge: 'NEW',
    tagline:
      'Two responsive screens for lightning-fast checkout — the all-in-one countertop POS engineered for high-volume counters.',
    image: imgRegister,
    features: [
      {
        title: 'Two screens, one flow',
        body: 'A merchant-facing display and a customer-facing display keep orders, line items, and tipping in sync — no awkward turn-around moments.',
      },
      {
        title: 'Tap, dip, and contactless',
        body: 'Accept every modern payment method out of the box. EMV chip, contactless cards, Apple Pay, Google Pay, and mobile wallets.',
      },
      {
        title: 'Built to run all day',
        body: 'Wired power, Ethernet, and Wi-Fi keep your register online during a rush. Plus offline-safe payments when the network drops.',
      },
    ],
    bullets: [
      'Dual responsive touchscreens',
      'EMV chip + contactless',
      'Wi-Fi & Ethernet',
      'PCI PTS 6.x certified',
    ],
    specs: [
      {
        title: 'Display',
        rows: [
          { label: 'Merchant display', value: '15.6" HD touchscreen' },
          { label: 'Customer display', value: '10.1" HD touchscreen' },
          { label: 'Touch technology', value: 'Capacitive multi-touch' },
        ],
      },
      {
        title: 'Payments',
        rows: [
          { label: 'Accepted methods', value: 'Tap, chip, mobile wallets' },
          { label: 'NFC', value: 'EMVCo L1 & L2 contactless' },
          { label: 'Certifications', value: 'PCI PTS 6.x, P2PE-ready' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Network', value: 'Wi-Fi 802.11 a/b/g/n/ac + Ethernet' },
          { label: 'Bluetooth', value: '5.0 LE' },
          { label: 'Ports', value: 'USB-C, USB-A, RJ-45, cash drawer' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Processor', value: 'Octa-core 64-bit' },
          { label: 'Power', value: 'AC adapter, wired' },
          { label: 'Operating system', value: 'Android-based, Delt POS' },
        ],
      },
    ],
  },

  'delt-handheld': {
    slug: 'delt-handheld',
    name: 'Delt Handheld',
    tagline: 'The powerful pocket POS that moves with you — line-busting, tableside, or curbside.',
    image: imgHandheld,
    features: [
      {
        title: 'Run your whole shift on one charge',
        body: 'All-day battery life keeps your team taking orders and accepting payments from open to close without swapping batteries mid-rush.',
      },
      {
        title: 'Wi-Fi + LTE built in',
        body: 'Cellular failover means a hiccup in the Wi-Fi never costs you a sale. Stay online wherever your customers are.',
      },
      {
        title: 'Full Delt POS in your hand',
        body: 'Restaurant, retail, and services workflows — orders, tickets, tips, refunds, inventory — all on a phone-sized device.',
      },
    ],
    bullets: ['Wi-Fi + LTE', 'All-day battery', 'EMV chip + contactless', 'Built-in receipt printer optional'],
    specs: [
      {
        title: 'Display',
        rows: [
          { label: 'Size', value: '5.5" HD touchscreen' },
          { label: 'Touch', value: 'Capacitive multi-touch' },
        ],
      },
      {
        title: 'Payments',
        rows: [
          { label: 'Accepted methods', value: 'Tap, chip, mobile wallets' },
          { label: 'NFC', value: 'EMVCo L1 & L2 contactless' },
          { label: 'Certifications', value: 'PCI PTS 6.x' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Network', value: 'Wi-Fi 802.11 a/b/g/n/ac + 4G LTE' },
          { label: 'Bluetooth', value: '5.0 LE' },
          { label: 'GPS', value: 'A-GPS, GLONASS' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Battery', value: '4,000 mAh — full shift on one charge' },
          { label: 'Weight', value: '~360 g' },
          { label: 'Operating system', value: 'Android-based, Delt POS' },
        ],
      },
    ],
  },

  'delt-terminal': {
    slug: 'delt-terminal',
    name: 'Delt Terminal',
    tagline: 'The all-in-one POS with a built-in receipt printer — simple, fast, countertop ready.',
    image: imgTerminal,
    features: [
      {
        title: 'Receipt printer built in',
        body: 'Print itemized receipts and end-of-day reports without a separate accessory. Everything you need on one device.',
      },
      {
        title: 'Plug in or go cordless',
        body: 'Run on AC power at the counter or untether the device when you need to take a payment in line or table-side.',
      },
      {
        title: 'Faster than a phone tap',
        body: 'A dedicated payment terminal designed for one thing — accepting every modern payment method in seconds.',
      },
    ],
    bullets: ['Built-in receipt printer', 'Wi-Fi / Ethernet', 'Cordless battery option', 'EMV chip + contactless'],
    specs: [
      {
        title: 'Display',
        rows: [
          { label: 'Size', value: '5.5" HD touchscreen' },
          { label: 'Touch', value: 'Capacitive multi-touch' },
        ],
      },
      {
        title: 'Printer',
        rows: [
          { label: 'Type', value: 'Built-in thermal printer' },
          { label: 'Speed', value: '~80 mm / sec' },
          { label: 'Paper', value: '58 mm thermal roll' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Network', value: 'Wi-Fi 802.11 a/b/g/n/ac + Ethernet' },
          { label: 'Bluetooth', value: '5.0 LE' },
          { label: 'Ports', value: 'USB-C, RJ-45' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Battery', value: 'Optional cordless module' },
          { label: 'Power', value: 'AC adapter (5V/3A)' },
          { label: 'Operating system', value: 'Android-based, Delt POS' },
        ],
      },
    ],
  },

  'delt-flip': {
    slug: 'delt-flip',
    name: 'Delt Flip',
    tagline: 'The swiveling countertop POS that flips to your customer for tap, sign, and tip.',
    image: imgStand,
    features: [
      {
        title: 'One device, two seats',
        body: 'Swivel the screen for tipping, signing, or email capture without handing over the whole register or buying a second device.',
      },
      {
        title: 'No extra tablet required',
        body: 'Delt Flip is a complete POS in itself. No separate iPad, no separate reader, no extra cables to manage.',
      },
      {
        title: 'Counter-top fast',
        body: 'Hard-wired Ethernet and Wi-Fi keep checkout snappy through every rush. Built for busy salons, cafés, and retail floors.',
      },
    ],
    bullets: ['Swiveling screen', 'Wi-Fi / Ethernet', 'No additional device required', 'EMV chip + contactless'],
    specs: [
      {
        title: 'Display',
        rows: [
          { label: 'Size', value: '13.3" HD touchscreen' },
          { label: 'Rotation', value: '180° swivel — merchant ↔ customer' },
        ],
      },
      {
        title: 'Payments',
        rows: [
          { label: 'Accepted methods', value: 'Tap, chip, mobile wallets' },
          { label: 'NFC', value: 'EMVCo L1 & L2 contactless' },
          { label: 'Certifications', value: 'PCI PTS 6.x' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Network', value: 'Wi-Fi 802.11 a/b/g/n/ac + Ethernet' },
          { label: 'Bluetooth', value: '5.0 LE' },
          { label: 'Ports', value: 'USB-C, USB-A, RJ-45, cash drawer' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Power', value: 'AC adapter, wired' },
          { label: 'Operating system', value: 'Android-based, Delt POS' },
          { label: 'POS software', value: 'Delt Restaurant / Retail / Services' },
        ],
      },
    ],
  },

  'delt-kiosk': {
    slug: 'delt-kiosk',
    name: 'Delt Kiosk',
    tagline: 'The self-service kiosk that lets customers order and pay themselves — without the line.',
    image: imgKiosk,
    features: [
      {
        title: 'Built to stand on its own',
        body: 'A floor- or counter-mount kiosk with everything customers need to browse, order, and pay — including contactless and chip.',
      },
      {
        title: 'No additional device required',
        body: 'Delt Kiosk is a complete self-serve station out of the box. No tablet to source separately, no reader to wire up.',
      },
      {
        title: 'Restaurant + retail ready',
        body: 'Runs Delt POS Self-Serve. Plug in your menu, your inventory, your prices — and let your customers do the rest.',
      },
    ],
    bullets: ['Self-service ordering', 'EMV chip + contactless', 'Floor or counter mount', 'No additional device required'],
    specs: [
      {
        title: 'Display',
        rows: [
          { label: 'Size', value: '21.5" HD touchscreen' },
          { label: 'Touch', value: 'Capacitive multi-touch' },
        ],
      },
      {
        title: 'Payments',
        rows: [
          { label: 'Accepted methods', value: 'Tap, chip, mobile wallets' },
          { label: 'NFC', value: 'EMVCo L1 & L2 contactless' },
          { label: 'Certifications', value: 'PCI PTS 6.x' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Network', value: 'Wi-Fi 802.11 a/b/g/n/ac' },
          { label: 'Ports', value: 'USB-C, USB-A, RJ-45' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Mounting', value: 'Floor stand or counter-top' },
          { label: 'Power', value: 'AC adapter, wired' },
          { label: 'POS software', value: 'Delt POS — Self-Serve' },
        ],
      },
    ],
  },

  'delt-reader': {
    slug: 'delt-reader',
    name: 'Delt Reader',
    tagline: 'A portable contactless and chip reader for every tap and dip — anywhere your business goes.',
    image: imgReader,
    features: [
      {
        title: 'Pocket-sized payments',
        body: 'Slip it in your apron, your bag, or your back pocket. Pair with any phone or tablet to start taking payments in seconds.',
      },
      {
        title: 'Tap, dip, or wallet',
        body: 'Accept every modern payment method — including contactless cards, Apple Pay, and Google Pay — no magstripe required.',
      },
      {
        title: 'Built for the road',
        body: 'Hours of battery, secure Bluetooth pairing, and Delt POS Mobile for service businesses, pop-ups, and on-site jobs.',
      },
    ],
    bullets: ['Bluetooth-paired', 'EMV chip + contactless', 'Hours of battery', 'Works with phone or tablet'],
    specs: [
      {
        title: 'Payments',
        rows: [
          { label: 'Accepted methods', value: 'Tap, chip, mobile wallets' },
          { label: 'NFC', value: 'EMVCo L1 & L2 contactless' },
          { label: 'Certifications', value: 'PCI PTS 6.x' },
        ],
      },
      {
        title: 'Connectivity',
        rows: [
          { label: 'Pairing', value: 'Bluetooth 5.0 LE' },
          { label: 'Network', value: 'Tethered to paired device' },
          { label: 'Charging', value: 'USB-C' },
        ],
      },
      {
        title: 'Hardware',
        rows: [
          { label: 'Battery', value: 'Up to 8 hours active use' },
          { label: 'Weight', value: '~95 g' },
          { label: 'Dimensions', value: '67 × 67 × 12 mm' },
        ],
      },
      {
        title: 'Software',
        rows: [
          { label: 'Paired device', value: 'iPhone, iPad, Android phone or tablet' },
          { label: 'POS software', value: 'Delt POS Mobile' },
          { label: 'Operating modes', value: 'Online + offline-safe payments' },
        ],
      },
    ],
  },
};

/* ─── Reusable: dot-grid background ────────────────────────────────── */
function DotGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        backgroundPosition: '0 0',
        maskImage:
          'radial-gradient(ellipse 80% 70% at 50% 90%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.0) 75%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 70% at 50% 90%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.0) 75%)',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export function HardwareProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const product = PRODUCTS[slug.toLowerCase()];

  /* Scroll-to-top on slug change */
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [slug]);

  if (!product) return <Navigate to="/hardware" replace />;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: NAVY_DEEP }}>

      {/* ═══ 1. HERO (centered text + product image) ═══════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY_DEEP, color: WHITE }}
      >
        <DotGrid />

        <div className="relative px-6 pt-28 pb-12 md:pt-36 md:pb-16">
          <div style={{ maxWidth: 1080, margin: '0 auto' }} className="text-center">
            {/* Back link */}
            <Link
              to="/hardware"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-8 opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: WHITE }}
            >
              <ArrowLeft size={14} /> All hardware
            </Link>

            {product.badge && (
              <div
                className="inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full mb-5"
                style={{ background: PURPLE, color: WHITE, letterSpacing: '0.18em' }}
              >
                {product.badge}
              </div>
            )}

            <h1
              className="font-bold leading-[1.02] mb-6 mx-auto"
              style={{
                fontSize: 'clamp(44px, 6.5vw, 84px)',
                letterSpacing: '-0.035em',
                color: WHITE,
                maxWidth: 900,
              }}
            >
              {product.name}
            </h1>

            <p
              className="mx-auto leading-relaxed mb-9"
              style={{
                fontSize: 'clamp(17px, 1.4vw, 22px)',
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 720,
              }}
            >
              {product.tagline}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: PURPLE, color: WHITE, fontSize: 15, letterSpacing: '-0.005em' }}
              >
                Get a quote <ArrowRight size={15} />
              </Link>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'transparent',
                  color: WHITE,
                  fontSize: 15,
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>

        {/* Product image floating directly on navy (no card) */}
        <div className="relative px-6 pb-20 md:pb-28">
          <div style={{ maxWidth: 720, margin: '0 auto' }} className="relative">
            {/* Soft purple glow beneath the device */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 60% 35% at 50% 78%, rgba(73,69,255,0.32), transparent 70%)',
                filter: 'blur(20px)',
                transform: 'translateY(15%)',
              }}
            />
            <img
              src={product.image}
              alt={product.name}
              className="relative"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: 560,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.5))',
              }}
            />
          </div>

          {/* Quick highlights row */}
          <div style={{ maxWidth: 1080, margin: '0 auto' }} className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {product.bullets.map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] md:text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  <Check size={14} style={{ color: PURPLE, flexShrink: 0 }} />
                  <span className="font-medium leading-snug">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. FEATURE BLOCKS (image left + 3 features right) ════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY, color: WHITE }}
      >
        <DotGrid />
        <div className="relative px-6 py-24 md:py-32">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image — floats on navy, no card */}
              <div className="relative order-2 lg:order-1">
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 55% 40% at 50% 70%, rgba(73,69,255,0.30), transparent 70%)',
                    filter: 'blur(24px)',
                  }}
                />
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 620,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.45))',
                  }}
                />
              </div>

              {/* Features list */}
              <div className="order-1 lg:order-2">
                <div
                  className="text-[12px] font-bold uppercase mb-4"
                  style={{ color: PURPLE, letterSpacing: '0.2em' }}
                >
                  Why {product.name}
                </div>
                <h2
                  className="font-bold leading-[1.1] mb-10"
                  style={{
                    fontSize: 'clamp(32px, 3.6vw, 44px)',
                    color: WHITE,
                    letterSpacing: '-0.025em',
                  }}
                >
                  Built for how you actually run your counter.
                </h2>

                <div className="space-y-9">
                  {product.features.map((f) => (
                    <div key={f.title}>
                      <h3
                        className="font-bold mb-2"
                        style={{
                          fontSize: 22,
                          color: WHITE,
                          letterSpacing: '-0.015em',
                        }}
                      >
                        {f.title}
                      </h3>
                      <p
                        className="leading-relaxed"
                        style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)' }}
                      >
                        {f.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. SPECS GRID ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY_DEEP, color: WHITE }}
      >
        <DotGrid />
        <div className="relative px-6 py-24 md:py-32">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="text-center mb-14">
              <div
                className="text-[12px] font-bold uppercase mb-4"
                style={{ color: PURPLE, letterSpacing: '0.2em' }}
              >
                Tech Specs
              </div>
              <h2
                className="font-bold leading-[1.1] mx-auto"
                style={{
                  fontSize: 'clamp(32px, 3.6vw, 44px)',
                  color: WHITE,
                  letterSpacing: '-0.025em',
                  maxWidth: 720,
                }}
              >
                {product.name} at a glance.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {product.specs.map((group) => (
                <div
                  key={group.title}
                  className="rounded-2xl p-7 md:p-8"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div
                    className="text-[11px] font-bold uppercase mb-5 pb-4"
                    style={{
                      color: PURPLE,
                      letterSpacing: '0.2em',
                      borderBottom: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    {group.title}
                  </div>
                  <dl className="space-y-3.5">
                    {group.rows.map((r) => (
                      <div
                        key={r.label}
                        className="grid grid-cols-5 gap-4 items-start"
                      >
                        <dt
                          className="col-span-2 text-[13px] font-medium"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                        >
                          {r.label}
                        </dt>
                        <dd
                          className="col-span-3 text-[14px] font-medium"
                          style={{ color: WHITE }}
                        >
                          {r.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <p
              className="text-center mt-10 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Specifications subject to change. Final configuration confirmed at quote.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 4. BOTTOM CTA CARD ═══════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: NAVY_DEEP }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            className="rounded-3xl px-8 py-12 md:px-14 md:py-16 relative overflow-hidden"
            style={{ background: PURPLE, color: WHITE }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative">
              <div className="md:col-span-3">
                <h3
                  className="font-bold leading-[1.1] mb-3"
                  style={{
                    fontSize: 'clamp(26px, 2.6vw, 36px)',
                    color: WHITE,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Ready to put {product.name} on your counter?
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 540 }}
                >
                  We'll match you with the right configuration and walk you through setup, processing rates, and migration.
                </p>
              </div>
              <div className="md:col-span-2 flex flex-wrap md:justify-end gap-3">
                <Link
                  to="/hardware"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
                  style={{
                    background: 'transparent',
                    color: WHITE,
                    border: '1px solid rgba(255,255,255,0.55)',
                    fontSize: 15,
                  }}
                >
                  Explore devices
                </Link>
                <Link
                  to="/contact-sales"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
                  style={{ background: WHITE, color: NAVY, fontSize: 15 }}
                >
                  Contact sales <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HardwareProductPage;
