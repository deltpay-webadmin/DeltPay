import { Link, useLocation } from 'react-router';
import {
  ArrowRight,
  Check,
  Globe,
  CreditCard,
  Sparkles,
  Landmark,
  Quote,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCrossSell } from '@/app/components/ProductCrossSell';
import { KoronaPartnerBlock } from '@/app/components/KoronaPartnerBlock';
import industryRestaurants from '@/assets/industries/industry-restaurants.jpg';
import industryRetail from '@/assets/industries/industry-retail.jpg';
import industryServices from '@/assets/industries/industry-services.jpg';
import industrySalon from '@/assets/industries/industry-salon.jpg';
import industryWellness from '@/assets/industries/industry-wellness.jpg';

/* ════════════════════════════════════════════════════════════
   Wave 3 — Industry page (data-driven)
   Replaces IndustryPlaceholder. One component renders all
   5 industry pages with full content, photos, products,
   proof points, a testimonial, and final CTA.
   Palette: strictly #FFFFFF / #041E42 / #4945FF.
   ════════════════════════════════════════════════════════════ */

interface ProductHighlight {
  icon: 'website' | 'payments' | 'lens' | 'capital';
  title: string;
  body: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Industry {
  name: string;
  eyebrow: string;
  specialistLabel: string;
  heroTagline: string;
  heroLede: string;
  image: string;
  imageAlt: string;
  featureHeadline: string;
  features: { title: string; body: string }[];
  stats: Stat[];
  products: ProductHighlight[];
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
  finalHeadline: string;
  finalBody: string;
}

const INDUSTRIES: Record<string, Industry> = {
  restaurants: {
    name: 'Restaurants & Food Service',
    eyebrow: 'For restaurants, cafés, bars & food trucks',
    specialistLabel: 'a restaurant specialist',
    heroTagline: 'One platform for the dining room, the kitchen, and the line out the door.',
    heroLede:
      'From the first tap on the menu to the last payout of the night, Delt runs front-of-house, back-of-house, and your books on one brain — so your team stops juggling five tools and gets back to the food.',
    image: industryRestaurants,
    imageAlt: 'A guest tapping their card on a payment terminal at a modern restaurant counter',
    featureHeadline: 'Everything a restaurant actually needs — in one spot.',
    features: [
      {
        title: 'POS built for the line',
        body: 'Fire orders straight to the kitchen, split checks at the table, move courses, and comp items in two taps. Works on iPads, handhelds, and a printer-only kitchen if that’s your setup.',
      },
      {
        title: 'Your own ordering, not a marketplace',
        body: 'Branded online ordering, QR-code menus, and direct delivery with no 30% middleman fee. Orders land right in your POS queue — no extra tablets.',
      },
      {
        title: 'Tips, payroll, and same-day payouts',
        body: 'Automate tip pools the way your house actually runs them. Payroll is built in, taxes are filed for you, and staff can cash out after close.',
      },
      {
        title: 'Lens AI forecasts your week',
        body: 'Know before Friday lunch how much ribeye to prep, how many servers to schedule, and which items are quietly killing your margin.',
      },
    ],
    stats: [
      { value: '30%', label: 'Lower delivery fees vs. marketplaces' },
      { value: '2.6x', label: 'Faster table turns with handheld POS' },
      { value: '0', label: 'Extra tablets on the line' },
    ],
    products: [
      {
        icon: 'website',
        title: 'A site guests can actually order from',
        body: 'Menu, hours, reservations, and online ordering that looks like your restaurant — not a template.',
      },
      {
        icon: 'payments',
        title: 'Card, tap, tip — handled',
        body: 'Flat-rate card-present and card-not-present pricing. No PCI paperwork. Deposits hit by 8 a.m.',
      },
      {
        icon: 'lens',
        title: 'Lens AI, for the kitchen too',
        body: 'Daily prep sheets, food-cost alerts, and labor forecasts pulled straight from your sales history.',
      },
      {
        icon: 'capital',
        title: 'Capital for a new hood, not a pitch deck',
        body: 'Funding based on your sales, repaid as a small slice of every transaction. No fixed monthly payment.',
      },
    ],
    quote:
      'We moved off three different systems onto Delt and added back eight hours a week of manager time. The kitchen hasn’t dropped a ticket since.',
    quoteAuthor: 'Maya Ortiz',
    quoteRole: 'Owner, Rosella — Austin, TX',
    finalHeadline: 'Run the restaurant. Delt runs the rest.',
    finalBody:
      'Two-week white-glove onboarding, menu import done for you, and a dedicated pod on standby for your first Saturday night.',
  },

  retail: {
    name: 'Retail & E-commerce',
    eyebrow: 'For boutiques, shops, and multi-location retailers',
    specialistLabel: 'a retail specialist',
    heroTagline: 'Sell in-store, online, and anywhere in between — all running on one brain.',
    heroLede:
      'Your register, your storefront, and your stockroom talk to each other — so a sale in Aisle 3 updates the website in a second, and a refund online doesn’t blow up your inventory.',
    image: industryRetail,
    imageAlt: 'A clean modern retail boutique with curated merchandise on a light oak display table',
    featureHeadline: 'One source of truth for every channel.',
    features: [
      {
        title: 'Unified inventory, everywhere',
        body: 'Every SKU, every channel, every location — updated live. Sell the last one in-store and it disappears from the site before the next click.',
      },
      {
        title: 'Barcode, returns, gift cards — built in',
        body: 'Fast check-out with barcode scanning, frictionless returns (even cross-channel), and gift cards that just work. No plug-ins, no add-ons.',
      },
      {
        title: 'A real e-commerce store',
        body: 'Done-for-you online store that inherits your catalog, collections, and pricing. Ships with SEO, reviews, and abandoned-cart flows wired up.',
      },
      {
        title: 'Funding on your sales, not your credit score',
        body: 'Open a second location, buy into a trend, or stock up for Q4 — Capital offers you what your store can actually support.',
      },
    ],
    stats: [
      { value: '1', label: 'Inventory across every channel' },
      { value: '24h', label: 'From sign-up to storefront live' },
      { value: '18%', label: 'Average lift in AOV with upsells' },
    ],
    products: [
      {
        icon: 'website',
        title: 'A storefront that sells while you sleep',
        body: 'Fast, mobile-first online store synced with your POS. Launch in a day, not a quarter.',
      },
      {
        icon: 'payments',
        title: 'Flat rate, fast deposits',
        body: 'One transparent rate for in-store, online, and phone orders. Money lands the next business day.',
      },
      {
        icon: 'lens',
        title: 'Lens AI finds the hidden wins',
        body: 'Sell-through, dead stock, and price-elasticity signals — delivered weekly, in plain English.',
      },
      {
        icon: 'capital',
        title: 'Buy in, open up, scale up',
        body: 'Inventory, build-out, or marketing — funded on your terms and repaid from daily sales.',
      },
    ],
    quote:
      'Launching our online store used to mean a six-month project. Delt had us live in two weeks — and our in-store and web inventory finally match.',
    quoteAuthor: 'Priya Shah',
    quoteRole: 'Founder, North Field Supply — Portland, OR',
    finalHeadline: 'Stop stitching five tools together.',
    finalBody:
      'Register, website, inventory, and funding in one account — with real humans who help you migrate from whatever you’re using today.',
  },

  'professional-services': {
    name: 'Professional Services',
    eyebrow: 'For agencies, consultants, accountants, and law firms',
    specialistLabel: 'a services specialist',
    heroTagline: 'Get paid faster. Spend less time chasing invoices and more on clients.',
    heroLede:
      'Delt turns a patchwork of invoicing, accounting, and billing tools into one clean system — so revenue recognition, ACH, and project profitability aren’t three separate conversations anymore.',
    image: industryServices,
    imageAlt: 'A consultant working at a laptop in a calm modern office with natural daylight',
    featureHeadline: 'Billing, payments, and profitability — in one place.',
    features: [
      {
        title: 'Invoices, proposals, recurring billing',
        body: 'Send a proposal, convert it to an invoice, turn it into a monthly retainer. Clients pay by card, ACH, or bank — your fees stay predictable.',
      },
      {
        title: 'Client portal, on your domain',
        body: 'Clients see every invoice, save payment methods, and pay in one click. Auto-pay for retainers eliminates the monthly reminder email.',
      },
      {
        title: 'Project profitability, live',
        body: 'Lens AI ties time, expenses, and invoices to each engagement so you know which clients are paying the bills — and which are quietly losing money.',
      },
      {
        title: 'Capital on your receivables',
        body: 'Funding underwritten on your actual monthly invoices, not a personal credit score. Repay from what your clients already owe.',
      },
    ],
    stats: [
      { value: '18 days', label: 'Faster average time-to-pay' },
      { value: '90%+', label: 'Of invoices paid on ACH or auto-pay' },
      { value: '1', label: 'System for billing, books, and banking' },
    ],
    products: [
      {
        icon: 'website',
        title: 'A site that looks like your firm',
        body: 'Service pages, intake forms, and a booking calendar — without a dev. Ships with SEO and analytics set up.',
      },
      {
        icon: 'payments',
        title: 'ACH + card, no surprises',
        body: 'Flat rates for both rails. Surcharging and net-terms automation included if you use them.',
      },
      {
        icon: 'lens',
        title: 'Know your best clients',
        body: 'Engagement margin, utilization, and client LTV — scored and ranked so partners can make calls faster.',
      },
      {
        icon: 'capital',
        title: 'Bridge payroll without a bank',
        body: 'Capital advances against booked revenue. Pay staff on time even when clients are on net-60.',
      },
    ],
    quote:
      'We stopped chasing clients for checks. 94% of our invoices are now paid on ACH or auto-pay, and I actually see profitability by engagement for the first time.',
    quoteAuthor: 'Daniel Becker, CPA',
    quoteRole: 'Managing Partner, Becker & Wei — Chicago, IL',
    finalHeadline: 'Billing should be the easy part of running a firm.',
    finalBody:
      'Migrate your clients, contracts, and recurring charges in a weekend — with a concierge who does it with you, not for a fee.',
  },

  'salon-barber': {
    name: 'Salon & Barber',
    eyebrow: 'For salons, barbershops, and spa teams',
    specialistLabel: 'a salon specialist',
    heroTagline: 'Booking, payments, and tipping — made for the chair.',
    heroLede:
      'From the chair rental to the retail shelf, Delt handles the whole day: online booking, check-ins, tips, memberships, and the text that cuts your no-shows in half.',
    image: industrySalon,
    imageAlt: 'A premium modern salon chair with brass mirror, marble counter and tools on a styling station',
    featureHeadline: 'Built for how chairs actually get filled.',
    features: [
      {
        title: 'Online booking, synced to your calendar',
        body: 'Clients book the stylist they want, the service they want, the time you’re open. Changes sync to personal calendars — no double-booking.',
      },
      {
        title: 'Tipping that keeps more in the stylist’s pocket',
        body: 'Flat-rate tip processing with no skim. Split commissions automatically. Stylists see their day, their tips, and their take in the app.',
      },
      {
        title: 'Memberships + retail in one ticket',
        body: 'Sell a monthly blowout package and a $28 shampoo in the same check-out. Auto-bill memberships. Track retail sell-through.',
      },
      {
        title: 'Texts that cut no-shows by half',
        body: '24-hour and 2-hour reminders with easy rebook links. Waitlist auto-fills the chair when someone cancels.',
      },
    ],
    stats: [
      { value: '-50%', label: 'No-shows after enabling text reminders' },
      { value: '+22%', label: 'Average retail attach per ticket' },
      { value: '0%', label: 'Skim on tips — stylists keep it all' },
    ],
    products: [
      {
        icon: 'website',
        title: 'A site guests book from',
        body: 'Stylist profiles, services, pricing, and booking in one place — styled to match your brand.',
      },
      {
        icon: 'payments',
        title: 'Chair-side check-out',
        body: 'Tap-to-pay on phone or terminal. Tip prompts are fast and fair. Payouts arrive the next morning.',
      },
      {
        icon: 'lens',
        title: 'Lens AI spots slow days',
        body: 'See which days need a promo, which stylists are fully booked, and which services are quietly trending down.',
      },
      {
        icon: 'capital',
        title: 'Capital for a build-out',
        body: 'Add a chair, buy into a retail line, or open a second location — with funding tied to your books.',
      },
    ],
    quote:
      'The text reminders alone paid for Delt in the first month. We filled four chairs from the waitlist last Saturday that would have sat empty before.',
    quoteAuthor: 'Jade Williams',
    quoteRole: 'Owner, Sage & Shear — Brooklyn, NY',
    finalHeadline: 'Keep the chair full, keep the tips fair.',
    finalBody:
      'A concierge onboards your stylists, imports your clients, and sets up your services — usually in under a week.',
  },

  'health-wellness': {
    name: 'Health & Wellness',
    eyebrow: 'For studios, clinics, and wellness practices',
    specialistLabel: 'a wellness specialist',
    heroTagline: 'From the front desk to the follow-up, every touchpoint covered.',
    heroLede:
      'Delt keeps class packs, memberships, intake, and follow-up care running on one system — with HIPAA-ready workflows for practices that need them and flexible scheduling for studios that don’t.',
    image: industryWellness,
    imageAlt: 'A serene minimalist wellness studio with a yoga mat, plant and soft natural light',
    featureHeadline: 'One system from the first visit to the hundredth.',
    features: [
      {
        title: 'HIPAA-ready intake and payments',
        body: 'Digital intake, consent, and card-on-file that meet HIPAA standards. Optional for studios that don’t need it — on by default for practices that do.',
      },
      {
        title: 'Memberships, class packs, drop-ins',
        body: 'Sell any combination, auto-bill the recurring ones, and let clients manage their own packs. Family plans and gift memberships too.',
      },
      {
        title: 'Reminders, waitlists, rebooking',
        body: 'Automated confirmations, 24-hour reminders, and a smart waitlist that fills canceled slots in seconds.',
      },
      {
        title: 'Capital for equipment and expansion',
        body: 'New room, new franchise, new machine — funded on your actual revenue, repaid from daily receipts.',
      },
    ],
    stats: [
      { value: '92%', label: 'Of classes book full with waitlist on' },
      { value: '4 min', label: 'Average intake-to-paid at reception' },
      { value: '3x', label: 'Membership revenue with auto-bill' },
    ],
    products: [
      {
        icon: 'website',
        title: 'A site guests schedule from',
        body: 'Class schedules, service menus, provider bios, and booking on your own domain.',
      },
      {
        icon: 'payments',
        title: 'Card-on-file, drafted on time',
        body: 'Automated recurring billing for memberships. Failed-card retries and smart dunning built in.',
      },
      {
        icon: 'lens',
        title: 'Spot churn before it happens',
        body: 'Lens AI flags members who are missing classes — so you can win them back before they cancel.',
      },
      {
        icon: 'capital',
        title: 'Grow the next studio',
        body: 'Equipment, build-out, or a second location — funding underwritten on your existing books.',
      },
    ],
    quote:
      'We replaced three tools with Delt and our recurring revenue went up 30% in a quarter. Members self-manage their packs now, which freed the front desk up for actual hospitality.',
    quoteAuthor: 'Alex Tran',
    quoteRole: 'Founder, Hearth Pilates — Denver, CO',
    finalHeadline: 'Run a practice people come back to.',
    finalBody:
      'A dedicated onboarding pod handles your member migration, schedule import, and staff training — end to end.',
  },
};

/* ────────────────────────────────────────────────────────────
   Per-industry layout variants
   heroReverse: image left vs right
   featureLayout: '2col' (cards), '3col-mosaic' (mix sizes), 'alternating' (zig-zag rows)
   accentStyle: 'chip' | 'number' | 'dot' | 'bar'
   productLayout: 'grid' (2x2) | 'list' (stacked row) | 'split-hero'
   proofIcons: industry-specific icon set for stats
   ─────────────────────────────────────────────────────────── */
interface LayoutVariant {
  heroReverse: boolean;
  featureLayout: '2col' | '3col-mosaic' | 'alternating';
  accentStyle: 'chip' | 'number' | 'dot' | 'bar' | 'badge';
  productLayout: 'grid' | 'list' | 'split';
  statIcons: Array<React.ComponentType<{ className?: string; strokeWidth?: number }>>;
}

const LAYOUTS: Record<string, LayoutVariant> = {
  restaurants: {
    heroReverse: false,
    featureLayout: '3col-mosaic',
    accentStyle: 'number',
    productLayout: 'grid',
    statIcons: [Clock, TrendingUp, Shield],
  },
  retail: {
    heroReverse: true,
    featureLayout: '2col',
    accentStyle: 'chip',
    productLayout: 'list',
    statIcons: [Globe, Clock, DollarSign],
  },
  'professional-services': {
    heroReverse: false,
    featureLayout: 'alternating',
    accentStyle: 'bar',
    productLayout: 'grid',
    statIcons: [Clock, Check, Shield],
  },
  'salon-barber': {
    heroReverse: true,
    featureLayout: '2col',
    accentStyle: 'dot',
    productLayout: 'split',
    statIcons: [TrendingUp, DollarSign, Shield],
  },
  'health-wellness': {
    heroReverse: false,
    featureLayout: '3col-mosaic',
    accentStyle: 'badge',
    productLayout: 'list',
    statIcons: [Check, Clock, TrendingUp],
  },
};

const DEFAULT_LAYOUT: LayoutVariant = {
  heroReverse: false,
  featureLayout: '2col',
  accentStyle: 'chip',
  productLayout: 'grid',
  statIcons: [Clock, DollarSign, Shield],
};

function ProductIcon({ type }: { type: ProductHighlight['icon'] }) {
  const common = { className: 'w-5 h-5 text-[#4945FF]' } as const;
  if (type === 'website') return <Globe {...common} />;
  if (type === 'payments') return <CreditCard {...common} />;
  if (type === 'lens') return <Sparkles {...common} />;
  return <Landmark {...common} />;
}

function productLabel(icon: ProductHighlight['icon']): string {
  return icon === 'website'
    ? 'Website'
    : icon === 'payments'
    ? 'Payments'
    : icon === 'lens'
    ? 'Lens AI'
    : 'Capital';
}

function AccentMark({
  index,
  style,
  onDark = false,
}: {
  index: number;
  style: LayoutVariant['accentStyle'];
  onDark?: boolean;
}) {
  if (style === 'number') {
    return (
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-5 font-bold text-[14px] ${
          onDark ? 'bg-white/15 text-white' : 'bg-[#4945FF] text-white'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
    );
  }
  if (style === 'dot') {
    return (
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-[#4945FF]" />
        <span className="w-2 h-2 rounded-full bg-[#4945FF]/50" />
        <span className="w-2 h-2 rounded-full bg-[#4945FF]/20" />
      </div>
    );
  }
  if (style === 'bar') {
    return <div className="w-12 h-1 rounded-full bg-[#4945FF] mb-5" />;
  }
  if (style === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5 text-[10.5px] font-bold uppercase tracking-[0.14em] ${
          onDark ? 'bg-white/15 text-white' : 'bg-[#4945FF]/10 text-[#4945FF]'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${onDark ? 'bg-white' : 'bg-[#4945FF]'}`} />
        Built-in
      </div>
    );
  }
  // default 'chip' — existing check icon
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mb-5"
      style={{ background: 'rgba(73,69,255,0.1)' }}
    >
      <Check className="w-5 h-5 text-[#4945FF]" strokeWidth={2.4} />
    </div>
  );
}

export function IndustryPage() {
  const location = useLocation();
  const slug = location.pathname.replace('/industries/', '').replace(/\/$/, '');
  const data = INDUSTRIES[slug];
  const layout = LAYOUTS[slug] || DEFAULT_LAYOUT;

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#4945FF] mb-4">
            Industry
          </div>
          <h1
            className="text-[40px] font-bold text-[#041E42] leading-tight mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Coming soon
          </h1>
          <p className="text-[17px] text-[#475569] mb-8">
            This industry page is being built. In the meantime, see all industries or talk with our team.
          </p>
          <Link
            to="/business-types"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4945FF] text-white text-[15px] font-semibold hover:bg-[#3933CC] transition-colors"
          >
            See all industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ════════ Hero ════════ */}
      <section
        className="relative overflow-hidden pt-32 pb-24 px-6"
        style={{ background: '#080A28' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 15% 10%, rgba(73,69,255,0.32) 0%, transparent 55%)',
          }}
        />
        <div className={`relative max-w-[1240px] mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center ${layout.heroReverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-5">
              {data.eyebrow}
            </div>
            <h1
              className="text-white font-bold leading-[1.04] mb-6"
              style={{
                fontSize: 'clamp(40px, 5.2vw, 64px)',
                letterSpacing: '-0.025em',
                maxWidth: 820,
              }}
            >
              {data.heroTagline}
            </h1>
            <p className="text-[18px] text-white/70 max-w-[620px] leading-relaxed mb-10">
              {data.heroLede}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#4945FF] text-white text-[15px] font-semibold hover:bg-[#3933CC] transition-colors"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[15px] font-semibold hover:bg-white/15 transition-colors border border-white/15"
              >
                Talk with {data.specialistLabel}
              </Link>
            </div>
          </motion.div>

          {/* Hero photo card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              aspectRatio: '4 / 5',
              boxShadow: '0 30px 80px -30px rgba(73,69,255,0.45)',
            }}
          >
            <img
              src={data.image}
              alt={data.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(4,30,66,0) 55%, rgba(8,10,40,0.55) 100%)',
              }}
            />
            <div
              className="absolute top-5 left-5 px-3 py-1 rounded-full text-[10.5px] font-bold"
              style={{
                background: 'rgba(255,255,255,0.94)',
                color: '#041E42',
                letterSpacing: '0.14em',
                backdropFilter: 'blur(6px)',
              }}
            >
              {data.name.toUpperCase()}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ Industry-specific stats strip ════════ */}
      <section className="px-6 py-14 border-b border-[#EEF0F4]">
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
          {data.stats.map((s, i) => {
            const Icon = layout.statIcons[i] || Check;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#4945FF]/10 flex items-center justify-center mt-1">
                  <Icon className="w-5 h-5 text-[#4945FF]" strokeWidth={2.2} />
                </div>
                <div className="flex flex-col">
                  <div
                    className="text-[#041E42] font-bold mb-1.5"
                    style={{ fontSize: 'clamp(32px, 3.8vw, 46px)', letterSpacing: '-0.02em' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[14.5px] text-[#475569] leading-snug max-w-[300px]">
                    {s.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-[#475569] mt-6 max-w-[1240px] mx-auto">*Based on Delt merchant data; individual results vary.</p>
      </section>

      {/* ════════ Unified honest-stats ribbon (cross-site cohesion) ════════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-6 text-center">
            Delt by the numbers
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#EEF0F4] border-y border-[#EEF0F4]">
            {[
              { big: '<1 Day', small: 'Go live', sub: 'Speed' },
              { big: '$847', small: 'Avg. monthly savings', sub: 'Savings' },
              { big: '$50M', small: 'Capital deployed', sub: 'Scale' },
              { big: '97%', small: 'Merchant retention', sub: 'Reliability' },
            ].map((s) => (
              <div key={s.small} className="text-center py-6 md:py-4 px-4">
                <div
                  className="text-[#041E42] font-bold leading-none mb-2"
                  style={{ fontSize: 'clamp(28px, 3vw, 38px)', letterSpacing: '-0.02em' }}
                >
                  {s.big}
                </div>
                <div className="text-[13px] text-[#475569]">{s.small}</div>
                <div className="text-[10px] text-[#4945FF] font-semibold uppercase tracking-[0.18em] mt-2">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Feature grid ════════ */}
      <section className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-4">
            What's included
          </div>
          <h2
            className="text-[#041E42] font-bold leading-[1.08] mb-14 max-w-[780px]"
            style={{
              fontSize: 'clamp(32px, 4vw, 46px)',
              letterSpacing: '-0.02em',
            }}
          >
            {data.featureHeadline}
          </h2>
          {/* Feature layout varies by industry */}
          {layout.featureLayout === '2col' && (
            <div className="grid md:grid-cols-2 gap-5">
              {data.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-7 rounded-2xl border border-[#EEF0F4] bg-white hover:border-[#4945FF]/40 transition-colors"
                >
                  <AccentMark index={i} style={layout.accentStyle} />
                  <h3 className="text-[19px] font-semibold text-[#041E42] mb-2.5" style={{ letterSpacing: '-0.01em' }}>
                    {f.title}
                  </h3>
                  <p className="text-[15px] text-[#475569] leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
          )}

          {layout.featureLayout === '3col-mosaic' && (
            <div className="grid grid-cols-6 gap-5">
              {data.features.map((f, i) => {
                // First card spans wide, rest split
                const span = i === 0 ? 'col-span-6 md:col-span-4' : i === 1 ? 'col-span-6 md:col-span-2' : 'col-span-6 md:col-span-3';
                const isDark = i === 0;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`${span} p-7 rounded-2xl transition-colors ${
                      isDark
                        ? 'bg-[#080A28] text-white hover:bg-[#0a2850]'
                        : 'border border-[#EEF0F4] bg-white hover:border-[#4945FF]/40'
                    }`}
                  >
                    <AccentMark index={i} style={layout.accentStyle} onDark={isDark} />
                    <h3
                      className={`text-[19px] font-semibold mb-2.5 ${isDark ? 'text-white' : 'text-[#041E42]'}`}
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {f.title}
                    </h3>
                    <p className={`text-[15px] leading-relaxed ${isDark ? 'text-white/70' : 'text-[#475569]'}`}>
                      {f.body}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {layout.featureLayout === 'alternating' && (
            <div className="space-y-4">
              {data.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`grid md:grid-cols-[auto_1fr] gap-6 p-7 rounded-2xl border border-[#EEF0F4] bg-white items-start ${
                    i % 2 === 1 ? 'md:flex-row-reverse md:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <AccentMark index={i} style={layout.accentStyle} />
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#041E42] mb-2" style={{ letterSpacing: '-0.01em' }}>
                      {f.title}
                    </h3>
                    <p className="text-[15px] text-[#475569] leading-relaxed">{f.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ Products tuned for industry ════════ */}
      <section className="py-24 px-6" style={{ background: '#F7F7FB' }}>
        <div className="max-w-[1240px] mx-auto">
          <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-4">
            The full stack
          </div>
          <h2
            className="text-[#041E42] font-bold leading-[1.08] mb-14 max-w-[820px]"
            style={{
              fontSize: 'clamp(32px, 4vw, 46px)',
              letterSpacing: '-0.02em',
            }}
          >
            Website, Payments, Lens AI, and Capital — tuned for {data.name.toLowerCase()}.
          </h2>

          {/* Product layout varies by industry */}
          {layout.productLayout === 'grid' && (
            <div className="grid md:grid-cols-2 gap-5">
              {data.products.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-7 rounded-2xl bg-white border border-[#EEF0F4]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(73,69,255,0.1)' }}
                    >
                      <ProductIcon type={p.icon} />
                    </div>
                    <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-[#4945FF]">
                      {productLabel(p.icon)}
                    </div>
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#041E42] mb-2.5" style={{ letterSpacing: '-0.01em' }}>
                    {p.title}
                  </h3>
                  <p className="text-[15px] text-[#475569] leading-relaxed">{p.body}</p>
                </motion.div>
              ))}
            </div>
          )}

          {layout.productLayout === 'list' && (
            <div className="space-y-4">
              {data.products.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="grid md:grid-cols-[220px_1fr] gap-8 p-7 rounded-2xl bg-white border border-[#EEF0F4] hover:border-[#4945FF]/40 transition-colors items-start"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(73,69,255,0.1)' }}
                    >
                      <ProductIcon type={p.icon} />
                    </div>
                    <div className="text-[14px] font-bold text-[#041E42]">
                      {productLabel(p.icon)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#041E42] mb-2" style={{ letterSpacing: '-0.01em' }}>
                      {p.title}
                    </h3>
                    <p className="text-[15px] text-[#475569] leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {layout.productLayout === 'split' && (
            <div className="grid md:grid-cols-4 gap-4">
              {data.products.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`p-6 rounded-2xl transition-colors ${
                    i === 0
                      ? 'bg-[#080A28] text-white md:row-span-2'
                      : 'bg-white border border-[#EEF0F4]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      i === 0 ? 'bg-[#4945FF]' : ''
                    }`}
                    style={i === 0 ? {} : { background: 'rgba(73,69,255,0.1)' }}
                  >
                    <ProductIcon type={p.icon} />
                  </div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-[0.18em] mb-2 ${
                      i === 0 ? 'text-[#4945FF]' : 'text-[#4945FF]'
                    }`}
                  >
                    {productLabel(p.icon)}
                  </div>
                  <h3
                    className={`text-[18px] font-semibold mb-2 ${i === 0 ? 'text-white' : 'text-[#041E42]'}`}
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`text-[14px] leading-relaxed ${i === 0 ? 'text-white/70' : 'text-[#475569]'}`}
                  >
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ KORONA POS partnership (retail only) ════════
           Only the retail vertical aligns with KORONA's stated focus:
           high-inventory retailers, liquor stores, c-stores, specialty
           shops. Restaurants page intentionally omits KORONA — they
           only serve QSRs explicitly, and Delt's restaurants page is
           full-service-led. Salon/health/services are not a fit. */}
      {slug === 'retail' && (
        <section className="py-20 px-6" style={{ background: '#F6F7FB' }}>
          <div className="max-w-[1240px] mx-auto">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: '#4945FF', letterSpacing: '0.2em' }}
            >
              Built with the right POS
            </div>
            <h2
              className="font-extrabold leading-[1.05] mb-3"
              style={{
                color: '#041E42',
                fontSize: 'clamp(32px, 4vw, 48px)',
                letterSpacing: '-0.025em',
                maxWidth: 820,
              }}
            >
              For liquor, smoke, and high-SKU retail: Delt + KORONA POS.
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-10"
              style={{ color: '#475569', maxWidth: 720 }}
            >
              Boutiques and general retailers run beautifully on Delt alone.
              But if you carry thousands of SKUs, run a liquor or smoke shop,
              or operate multiple stores, we pair Delt with KORONA POS — a
              category-leading retail POS we vetted and chose because it
              handles the depth these operators need.
            </p>
            <KoronaPartnerBlock
              title="The POS we picked for high-inventory retail."
              body={
                "Delt handles payments, capital, your website, and Lens AI. "
                + "KORONA POS handles the register, inventory, vendor relationships, "
                + "and multi-location operations. Two specialists, one merchant "
                + "relationship \u2014 you call Delt, we coordinate the rest."
              }
              testimonial={{
                quote:
                  "Switching to KORONA POS was the best decision we made for our liquor store. The inventory management system makes it so easy to track our stock and reorder products before we run out. Highly recommend it.",
                name: 'Kristen L.',
                role: 'Pine and Peoria Liquor Store',
              }}
            />
          </div>
        </section>
      )}

      {/* ════════ Testimonial ════════ */}
      <section className="py-24 px-6">
        <div className="max-w-[980px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
            style={{ background: '#080A28' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 85% 15%, rgba(73,69,255,0.35) 0%, transparent 50%)',
              }}
            />
            <Quote
              className="w-10 h-10 mb-6 relative"
              style={{ color: '#4945FF' }}
              strokeWidth={2}
            />
            <blockquote
              className="relative text-white font-semibold leading-[1.25] mb-8"
              style={{
                fontSize: 'clamp(22px, 2.8vw, 32px)',
                letterSpacing: '-0.015em',
              }}
            >
              &ldquo;{data.quote} — Individual results vary.&rdquo;
            </blockquote>
            <div className="relative flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[16px]"
                style={{ background: '#4945FF', letterSpacing: '0.02em' }}
              >
                {data.quoteAuthor
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="text-white font-semibold text-[15px]">
                  {data.quoteAuthor}
                </div>
                <div className="text-white/60 text-[13.5px]">{data.quoteRole}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ Cross-sell for continuity ════════ */}
      <ProductCrossSell
        eyebrow={`Built for ${data.name}`}
        title="Pick your starting point"
        subtitle="Every product plugs into the same stack. Start with one, add the rest when you're ready."
      />

      {/* ════════ Final CTA ════════ */}
      <section className="pb-28 px-6 pt-24">
        <div className="max-w-[1100px] mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-12 md:p-16 border border-[#EEF0F4]"
            style={{ background: '#FFFFFF' }}
          >
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-4">
                  Ready when you are
                </div>
                <h2
                  className="text-[#041E42] font-bold leading-[1.1] mb-5"
                  style={{
                    fontSize: 'clamp(28px, 3.4vw, 40px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {data.finalHeadline}
                </h2>
                <p className="text-[16.5px] text-[#475569] leading-relaxed max-w-[520px]">
                  {data.finalBody}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#4945FF] text-white text-[15px] font-semibold hover:bg-[#3933CC] transition-colors"
                >
                  Start your free trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact-sales"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white text-[#041E42] text-[15px] font-semibold hover:bg-[#F2F3F7] transition-colors border border-[#E4E6EC]"
                >
                  Book a 20-minute demo
                </Link>
                <Link
                  to="/business-types"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[#4945FF] text-[14px] font-semibold hover:text-[#3933CC] transition-colors"
                >
                  See every industry <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
