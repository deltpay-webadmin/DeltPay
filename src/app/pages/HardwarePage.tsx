/**
 * HardwarePage.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Delt hardware landing page — layout modeled 1:1 on Square's
 * https://squareup.com/us/en/hardware page, restyled in the Delt
 * design system (Navy / Purple / Lavender / Ivory).
 *
 * Sections, in order, match Square:
 *   1.  Hero — headline + 7-up product grid (hero card + 6 device tiles)
 *   2.  "Select devices to compare" — feature comparison matrix
 *   3.  "Take contactless payments with just your phone" — tap-to-pay band
 *   4.  "Customize your hardware setup" — kit vs accessories split
 *   5.  "A little peace of mind" — 4 trust callouts
 *   6.  "Made to power your business" — 3 use-case cards
 *   7.  Resources — Chat / Find a store style links
 *   8.  Final CTA
 *
 * Every product image renders as a placeholder <div> with a stable
 * `data-image-slot` attribute. Replace each placeholder with an <img>
 * once final art is available (see /docs/hardware-image-spec.md).
 * ──────────────────────────────────────────────────────────────────────────
 */
import {
  ArrowRight,
  Check,
  Minus,
  Smartphone,
  Monitor,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Leaf,
  Wifi,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router';

// Real hardware photography — wired to data-image-slot IDs
import imgRegister        from '@/app/assets/hardware/register.jpg';
import imgRegisterDelt    from '@/app/assets/hardware/register-delt.jpg';
import imgHandheld        from '@/app/assets/hardware/handheld.jpg';
import imgTerminal        from '@/app/assets/hardware/terminal.jpg';
import imgStand           from '@/app/assets/hardware/stand.jpg';
import imgKiosk           from '@/app/assets/hardware/kiosk.jpg';
import imgReader          from '@/app/assets/hardware/reader-contactless.jpg';
import imgTapToPay        from '@/app/assets/hardware/tap-to-pay.jpg';
import imgKitAccessories  from '@/app/assets/hardware/kit-accessories.jpg';
import imgKitBundle       from '@/app/assets/hardware/kit-bundle.jpg';
import imgUseServices     from '@/app/assets/hardware/use-services.jpg';

const SLOT_IMAGES: Record<string, string> = {
  'hero-register':              imgRegister,
  'product-handheld':           imgHandheld,
  'product-terminal':           imgTerminal,
  'product-stand':              imgStand,
  'product-kiosk':              imgKiosk,
  'product-reader-contactless': imgReader,
  // Compare-row thumbnails reuse the same source assets
  'compare-handheld':           imgHandheld,
  'compare-terminal':           imgTerminal,
  'compare-stand':              imgStand,
  'compare-register':           imgRegister,
  'compare-kiosk':              imgKiosk,
  'compare-reader':             imgReader,
  'tap-to-pay':                 imgTapToPay,
  // Customize-setup section
  'kit-bundle':                 imgKitBundle,
  'kit-accessories':            imgKitAccessories,
  // Use-case section
  'use-restaurant':             imgRegisterDelt, // recolored Delt register on stand
  'use-retail':                 imgTerminal,     // countertop terminal
  'use-services':               imgUseServices,  // VT + contactless reader bundle
};

/* ─── Design tokens (locked to Delt palette) ───────────────────── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const MICRO    = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

/* ─── Reusable image-placeholder block ─────────────────────────────
   Renders a neutral framed area sized to the slot dimensions so the
   layout is final TODAY. Swap each one for <img src=… alt=…/> after
   shooting the photos.
   ────────────────────────────────────────────────────────────────── */
function ImageSlot({
  slot,
  ratio = '4 / 3',
  label,
  tone = 'ivory',
  fit = 'contain',
}: {
  slot: string;
  ratio?: string;
  label: string;
  tone?: 'ivory' | 'lavender' | 'white';
  fit?: 'contain' | 'cover';
}) {
  const src = SLOT_IMAGES[slot];
  const bg =
    tone === 'lavender' ? '#FFFFFF' : tone === 'white' ? IVORY : '#FFFFFF';

  // Real photo wired in — render <img> with proper object-fit.
  if (src) {
    return (
      <div
        data-image-slot={slot}
        className="w-full rounded-2xl overflow-hidden flex items-center justify-center relative"
        style={{ aspectRatio: ratio, background: bg }}
      >
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="w-full h-full"
          style={{ objectFit: fit, display: 'block' }}
        />
      </div>
    );
  }

  // Placeholder fallback for slots still awaiting art.
  return (
    <div
      data-image-slot={slot}
      className="w-full rounded-2xl overflow-hidden flex items-center justify-center relative"
      style={{
        aspectRatio: ratio,
        background: bg,
        border: `1px dashed ${HAIRLINE}`,
      }}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <div
          className="text-[10px] font-bold uppercase"
          style={{ color: PURPLE, letterSpacing: '0.18em' }}
        >
          Image
        </div>
        <div
          className="text-[13px] font-semibold"
          style={{ color: NAVY, letterSpacing: '-0.01em' }}
        >
          {label}
        </div>
        <code
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: LAVENDER, color: NAVY }}
        >
          {slot}
        </code>
      </div>
    </div>
  );
}

export function HardwarePage() {
  /* ─── Product catalog (mirrors Square's hero grid order) ───────── */
  const heroProduct = {
    slot: 'hero-register',
    badge: 'NEW',
    name: 'Delt Register',
    blurb: 'Two responsive screens for lightning-fast checkout.',
    price: '$899',
    finance: 'or $44/mo over 24 months',
    href: '/contact-sales',
  };

  const lineup = [
    {
      slot: 'product-handheld',
      name: 'Delt Handheld',
      blurb: 'The powerful POS that moves with you.',
      price: '$399',
      finance: 'or $37/mo over 12 months',
    },
    {
      slot: 'product-terminal',
      name: 'Delt Terminal',
      blurb: 'The all-in-one POS with a receipt printer.',
      price: '$299',
      finance: 'or $27/mo over 12 months',
    },
    {
      slot: 'product-stand',
      name: 'Delt Stand',
      blurb: 'The intuitive, swiveling iPad POS.',
      price: '$149',
      finance: 'or $14/mo over 12 months',
    },
    {
      slot: 'product-kiosk',
      name: 'Delt Kiosk',
      blurb: 'The self-service iPad kiosk.',
      price: '$149',
      finance: 'or $14/mo over 12 months',
    },
    {
      slot: 'product-reader-contactless',
      name: 'Delt Reader (Contactless & Chip)',
      blurb: 'The portable reader for every tap and dip.',
      price: '$59',
      finance: '',
    },
  ];

  /* ─── Comparison matrix (mirrors Square's compare table) ───────── */
  const compareDevices = [
    { key: 'handheld',  name: 'Delt Handheld',  slot: 'compare-handheld'  },
    { key: 'terminal',  name: 'Delt Terminal',  slot: 'compare-terminal'  },
    { key: 'stand',     name: 'Delt Stand',     slot: 'compare-stand'     },
    { key: 'register',  name: 'Delt Register',  slot: 'compare-register'  },
    { key: 'kiosk',     name: 'Delt Kiosk',     slot: 'compare-kiosk'     },
    { key: 'reader',    name: 'Delt Reader',    slot: 'compare-reader'    },
  ];

  const compareRows: { label: string; values: Record<string, string | boolean> }[] = [
    {
      label: 'Accepted payments',
      values: {
        handheld: 'Tap, chip, magstripe*',
        terminal: 'Tap, chip, magstripe',
        stand:    'Tap, chip, magstripe',
        register: 'Tap, chip, magstripe',
        kiosk:    'Tap, chip',
        reader:   'Tap, chip',
      },
    },
    {
      label: 'Built-in receipt printer',
      values: { handheld: false, terminal: true, stand: false, register: true, kiosk: false, reader: false },
    },
    {
      label: 'Cordless / battery',
      values: { handheld: true, terminal: true, stand: false, register: false, kiosk: false, reader: true },
    },
    {
      label: 'Internet connection',
      values: {
        handheld: 'Wi-Fi + LTE',
        terminal: 'Wi-Fi / Ethernet',
        stand:    'Wi-Fi / Ethernet',
        register: 'Wi-Fi / Ethernet',
        kiosk:    'Wi-Fi',
        reader:   'Bluetooth (paired)',
      },
    },
    {
      label: 'Additional device required',
      values: {
        handheld: 'None',
        terminal: 'None',
        stand:    'iPad (sold separately)',
        register: 'None',
        kiosk:    'iPad (sold separately)',
        reader:   'Phone or tablet',
      },
    },
    {
      label: 'Compatible POS software',
      values: {
        handheld: 'Delt POS — Restaurant, Retail, Services',
        terminal: 'Delt POS — Restaurant, Retail, Services',
        stand:    'Delt POS — Retail, Services',
        register: 'Delt POS — Restaurant, Retail, Services',
        kiosk:    'Delt POS — Self-serve',
        reader:   'Delt POS Mobile',
      },
    },
    {
      label: 'Price',
      values: {
        handheld: '$399',
        terminal: '$299',
        stand:    '$149',
        register: '$899',
        kiosk:    '$149',
        reader:   '$59',
      },
    },
  ];

  /* ─── Trust callouts ───────────────────────────────────────────── */
  const peaceOfMind = [
    { icon: Shield,    title: 'No surprise fees',       text: 'No long-term contracts. Cancel any time.' },
    { icon: RotateCcw, title: 'Free 30-day returns',    text: 'Limited warranty included on every device.' },
    { icon: Truck,     title: 'Carbon-neutral shipping', text: 'Fast, free shipping on orders over $250.' },
    { icon: Wifi,      title: 'Secure offline payments', text: 'Keep taking payments even when the Wi-Fi drops.' },
  ];

  /* ─── Use-case trio ────────────────────────────────────────────── */
  const useCases = [
    {
      slot:  'use-restaurant',
      title: 'Restaurants',
      text:  'Turn tables, keep orders flowing, and run your restaurant smoothly with a full-counter register.',
    },
    {
      slot:  'use-retail',
      title: 'Retail',
      text:  'Simplify your day-to-day with a complete countertop terminal built for fast checkout.',
    },
    {
      slot:  'use-services',
      title: 'Salons & Services',
      text:  'Take payments anywhere with Delt Virtual Terminal plus a contactless reader — a service-business bundle for in-shop, by phone, or on-site.',
    },
  ];

  /* ───────────────────────────────────────────────────────────────────────
     RENDER
     ─────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. HERO + 7-UP PRODUCT GRID ═════════════════════════════ */}
      <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-20" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Eyebrow + headline */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: PURPLE }} />
              <span
                className="text-[12px] font-semibold uppercase"
                style={{ color: NAVY, letterSpacing: '0.14em' }}
              >
                Hardware
              </span>
            </div>
            <h1
              className="font-bold leading-[1.05] mb-6"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                letterSpacing: '-0.03em',
                color: NAVY,
                maxWidth: 900,
                margin: '0 auto',
              }}
            >
              A complete point-of-sale system built for busy counters.
            </h1>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.2vw, 18px)', color: MUTED, maxWidth: 620 }}
            >
              Professional payment hardware engineered for reliability,
              speed, and ease of use — backed by the Delt platform.
            </p>
          </div>

          {/* Hero product card (full-width, like Square's lead tile) */}
          <Link
            to={heroProduct.href}
            className="block rounded-3xl overflow-hidden transition-transform hover:-translate-y-0.5"
            style={{
              background: LAVENDER,
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
              <div className="p-8 md:p-12 order-2 md:order-1">
                <span
                  className="inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full mb-4"
                  style={{ background: PURPLE, color: '#fff', letterSpacing: '0.16em' }}
                >
                  {heroProduct.badge}
                </span>
                <h2
                  className="font-bold mb-3 leading-[1.1]"
                  style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', color: NAVY, letterSpacing: '-0.025em' }}
                >
                  {heroProduct.name}
                </h2>
                <p
                  className="mb-6 leading-relaxed"
                  style={{ color: MUTED, fontSize: 17, maxWidth: 460 }}
                >
                  {heroProduct.blurb}
                </p>
                <div className="flex items-baseline gap-2 mb-7">
                  <span className="font-bold" style={{ color: NAVY, fontSize: 28, letterSpacing: '-0.02em' }}>
                    {heroProduct.price}
                  </span>
                  <span className="text-sm" style={{ color: MICRO }}>{heroProduct.finance}</span>
                </div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white"
                  style={{ background: PURPLE, fontSize: 14, boxShadow: `0 4px 18px ${PURPLE}40` }}
                >
                  Shop now <ArrowRight size={14} />
                </span>
              </div>
              <div className="p-8 md:p-10 order-1 md:order-2">
                <ImageSlot
                  slot={heroProduct.slot}
                  ratio="4 / 3"
                  label="Delt Register hero photo (2 screens, on counter)"
                  tone="lavender"
                  fit="cover"
                />
              </div>
            </div>
          </Link>

          {/* 6-up product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {lineup.map((p) => (
              <Link
                key={p.slot}
                to="/contact-sales"
                className="rounded-2xl p-6 flex flex-col transition-transform hover:-translate-y-0.5"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <ImageSlot slot={p.slot} ratio="1 / 1" label={`${p.name} photo`} />
                <h3
                  className="font-bold mt-5 mb-1.5"
                  style={{ color: NAVY, fontSize: 19, letterSpacing: '-0.015em' }}
                >
                  {p.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4 flex-1"
                  style={{ color: MUTED }}
                >
                  {p.blurb}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-bold"
                    style={{ color: NAVY, fontSize: 18, letterSpacing: '-0.02em' }}
                  >
                    {p.price}
                  </span>
                  {p.finance && (
                    <span className="text-xs" style={{ color: MICRO }}>
                      {p.finance}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2. SELECT DEVICES TO COMPARE ════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: IVORY }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Compare
            </div>
            <h2
              className="font-bold leading-[1.1] mb-4"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Find the right device for your business.
            </h2>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 620 }}
            >
              Side-by-side specs to help you choose what fits your counter,
              your floor, or your back pocket.
            </p>
          </div>

          {/* Device thumbnail row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8">
            {compareDevices.map((d) => (
              <div key={d.key} className="text-center">
                <ImageSlot slot={d.slot} ratio="1 / 1" label={d.name} />
                <div
                  className="font-bold mt-3 text-[13px] md:text-sm"
                  style={{ color: NAVY, letterSpacing: '-0.01em' }}
                >
                  {d.name}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', border: `1px solid ${HAIRLINE}` }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 880, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: LAVENDER }}>
                    <th
                      className="text-left px-5 py-4 text-[11px] font-bold uppercase"
                      style={{ color: NAVY, letterSpacing: '0.14em' }}
                    >
                      Feature
                    </th>
                    {compareDevices.map((d) => (
                      <th
                        key={d.key}
                        className="text-left px-4 py-4 text-[11px] font-bold uppercase whitespace-nowrap"
                        style={{ color: NAVY, letterSpacing: '0.14em' }}
                      >
                        {d.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, ri) => (
                    <tr
                      key={row.label}
                      style={{ borderTop: ri === 0 ? 'none' : `1px solid ${HAIRLINE}` }}
                    >
                      <td
                        className="px-5 py-4 font-semibold text-sm"
                        style={{ color: NAVY }}
                      >
                        {row.label}
                      </td>
                      {compareDevices.map((d) => {
                        const v = row.values[d.key];
                        return (
                          <td
                            key={d.key}
                            className="px-4 py-4 text-sm align-top"
                            style={{ color: MUTED }}
                          >
                            {typeof v === 'boolean' ? (
                              v ? (
                                <Check size={16} color={PURPLE} strokeWidth={3} />
                              ) : (
                                <Minus size={16} color={MICRO} />
                              )
                            ) : (
                              v
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] mt-4" style={{ color: MICRO }}>
            * Magstripe via Delt Reader for magstripe, sold separately.
          </p>
        </div>
      </section>

      {/* ═══ 3. TAP-TO-PAY ON PHONE ══════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: NAVY }}>
        <div
          style={{ maxWidth: 1120, margin: '0 auto' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          <div>
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: '#A4A0FF', letterSpacing: '0.18em' }}
            >
              Tap to pay
            </div>
            <h2
              className="font-bold leading-[1.1] mb-5"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
              }}
            >
              Take contactless payments with just your phone.
            </h2>
            <p
              className="leading-relaxed mb-7"
              style={{ color: '#C7CCD6', fontSize: 17, maxWidth: 500 }}
            >
              No reader, no dongle. Accept contactless cards and digital
              wallets directly on your iPhone or Android — powered by the
              Delt POS app.
            </p>
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              style={{ background: '#FFFFFF', color: NAVY, fontSize: 14 }}
            >
              Learn more <ArrowRight size={14} />
            </Link>
          </div>
          <ImageSlot
            slot="tap-to-pay"
            ratio="4 / 5"
            label="Phone tap-to-pay (hand holding phone, card tapping)"
            tone="white"
            fit="cover"
          />
        </div>
      </section>

      {/* ═══ 4. CUSTOMIZE YOUR HARDWARE SETUP ════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Build your setup
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 44px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Customize your hardware setup.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { slot: 'kit-bundle',       title: 'Get started with a kit',     text: 'Pre-built bundles for restaurants, retail, and services — everything you need in one box.', cta: 'Shop kits' },
              { slot: 'kit-accessories',  title: 'Choose specific accessories', text: 'Receipt printers, cash drawers, scanners, mounts, stands and more — picked individually.', cta: 'Shop accessories' },
            ].map((c) => (
              <Link
                key={c.slot}
                to="/contact-sales"
                className="rounded-2xl p-7 md:p-9 flex flex-col transition-transform hover:-translate-y-0.5"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <ImageSlot slot={c.slot} ratio="16 / 10" label={c.title} />
                <h3
                  className="font-bold mt-6 mb-2"
                  style={{ color: NAVY, fontSize: 24, letterSpacing: '-0.02em' }}
                >
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
                  {c.text}
                </p>
                <span
                  className="inline-flex items-center gap-2 font-semibold"
                  style={{ color: PURPLE, fontSize: 14 }}
                >
                  {c.cta} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. A LITTLE PEACE OF MIND ═══════════════════════════════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: LAVENDER }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Peace of mind
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 44px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              A little peace of mind.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {peaceOfMind.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl p-6"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${PURPLE}12` }}
                  >
                    <Icon size={20} color={PURPLE} />
                  </div>
                  <h3
                    className="font-bold mb-1.5"
                    style={{ color: NAVY, fontSize: 16, letterSpacing: '-0.01em' }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                    {p.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 6. MADE TO POWER YOUR BUSINESS ══════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Built for your business
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 44px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Made to power your business.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((u) => (
              <Link
                key={u.slot}
                to="/business-types"
                className="rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <ImageSlot slot={u.slot} ratio="4 / 3" label={`${u.title} use-case photo`} />
                <div className="p-6 flex flex-col flex-1">
                  <h3
                    className="font-bold mb-2"
                    style={{ color: NAVY, fontSize: 20, letterSpacing: '-0.015em' }}
                  >
                    {u.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: MUTED }}>
                    {u.text}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 font-semibold"
                    style={{ color: PURPLE, fontSize: 14 }}
                  >
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. RESOURCES ════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: IVORY }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Resources
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              We're here to help.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'Chat with us',
                text: 'Connect with our customer support team for help whenever you need it.',
                href: '/support',
                cta: 'Start a chat',
              },
              {
                icon: MapPin,
                title: 'Find a partner',
                text: 'Want Delt hardware today? Find nearby authorized dealers and online retailers.',
                href: '/contact-sales',
                cta: 'Find one near you',
              },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.title}
                  to={r.href}
                  className="rounded-2xl p-7 flex items-start gap-5 transition-transform hover:-translate-y-0.5"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${PURPLE}12` }}
                  >
                    <Icon size={20} color={PURPLE} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold mb-1.5"
                      style={{ color: NAVY, fontSize: 18, letterSpacing: '-0.01em' }}
                    >
                      {r.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: MUTED }}>
                      {r.text}
                    </p>
                    <span
                      className="inline-flex items-center gap-2 font-semibold"
                      style={{ color: PURPLE, fontSize: 14 }}
                    >
                      {r.cta} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 8. FINAL CTA ════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24 text-center" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2
            className="font-bold mb-4 leading-[1.1]"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            Ready to upgrade your counter?
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 480 }}
          >
            Get a quote tailored to your business, plus a recommended
            hardware bundle in under 24 hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/get-a-quote"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: PURPLE, fontSize: 15, boxShadow: `0 4px 18px ${PURPLE}40` }}
            >
              Get a quote
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              Talk to sales
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 9. SMALL-PRINT LEGAL ════════════════════════════════════ */}
      <div
        className="px-6 pt-9 pb-11"
        style={{ background: '#FFFFFF', borderTop: `1px solid ${HAIRLINE}` }}
      >
        <div
          className="max-w-4xl mx-auto"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Hardware pricing and financing offers shown are illustrative
            and subject to change. Financing terms require credit approval.
            Magstripe support on Delt Handheld requires the optional Delt
            Reader for magstripe, sold separately.
          </p>
        </div>
      </div>

    </div>
  );
}

export default HardwarePage;
