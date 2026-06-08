import { Link, useLocation } from 'react-router';
import { ArrowRight, ArrowUpRight, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCrossSell } from '@/app/components/ProductCrossSell';
import { KoronaPartnerBlock } from '@/app/components/KoronaPartnerBlock';
import industryRestaurants from '@/assets/industries/industry-restaurants.jpg';
import industryRetail from '@/assets/industries/industry-retail.jpg';
import industryServices from '@/assets/industries/industry-services.jpg';
import industrySalon from '@/assets/industries/industry-salon.jpg';
import industryWellness from '@/assets/industries/industry-wellness.jpg';

/* ════════════════════════════════════════════════════════════
   Industry pages — editorial template (v2)
   Replaces the previous cookie-cutter SaaS layout.
   One bold, editorial layout applied to all 5 verticals.
   Design DNA: full-bleed overlay hero, indexed feature scroller,
   oversized serif stat numerals, dark capability tiles,
   editorial pull-quote — anchored to Delt's navy/indigo palette.
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

function productLabel(icon: ProductHighlight['icon']): string {
  return icon === 'website'
    ? 'Website'
    : icon === 'payments'
    ? 'Payments'
    : icon === 'lens'
    ? 'Lens AI'
    : 'Capital';
}

export function IndustryPage() {
  const location = useLocation();
  const slug = location.pathname.replace('/industries/', '').replace(/\/$/, '');
  const data = INDUSTRIES[slug];

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

  // Brand-anchored editorial palette
  const SERIF = 'var(--dc-font-serif-italic, "Source Serif Pro", Georgia, serif)';
  const PAPER = '#FFFFFF'; // Delt white — on-brand neutral
  const INK = '#041E42';   // Delt navy
  const ACCENT = '#4945FF'; // Delt indigo

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      {/* ════════ 1. Full-bleed editorial hero ════════ */}
      <section className="relative w-full" style={{ minHeight: '92vh' }}>
        <div className="absolute inset-0">
          <img
            src={data.image}
            alt={data.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Editorial gradient — heavy bottom-left for left-aligned copy */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(110deg, rgba(4,30,66,0.78) 0%, rgba(4,30,66,0.55) 38%, rgba(4,30,66,0.18) 70%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(4,30,66,0.18) 0%, transparent 30%, transparent 60%, rgba(4,30,66,0.45) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-[1320px] mx-auto px-6 lg:px-10 pt-40 pb-28 lg:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[760px]"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 mb-7">
              — {data.eyebrow}
            </div>
            <h1
              className="text-white leading-[1.02] mb-8"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(44px, 6.4vw, 84px)',
                letterSpacing: '-0.025em',
              }}
            >
              {data.heroTagline}
            </h1>
            <p
              className="text-[17px] lg:text-[18.5px] text-white/85 leading-[1.55] mb-10 max-w-[600px]"
              style={{ fontFamily: 'var(--dc-font-body)' }}
            >
              {data.heroLede}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="group inline-flex items-center gap-2 pl-6 pr-5 py-4 rounded-full text-[14.5px] font-semibold transition-colors"
                style={{ background: PAPER, color: INK }}
              >
                Get started free
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-[14.5px] font-semibold transition-colors border border-white/30 text-white hover:bg-white/10"
              >
                Talk with {data.specialistLabel}
              </Link>
            </div>
          </motion.div>

          {/* Floating industry tag — editorial corner element */}
          <div
            className="absolute right-6 lg:right-10 bottom-10 px-4 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-[0.18em] backdrop-blur"
            style={{ background: 'rgba(246,242,234,0.92)', color: INK, letterSpacing: '0.18em' }}
          >
            {data.name}
          </div>
        </div>
      </section>

      {/* ════════ 2. Indexed feature scroller (Suede DNA, navy/indigo palette) ════════ */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1.05fr_1.1fr] gap-16 lg:gap-20">
          {/* Left rail — sticky photo + intro */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] mb-6" style={{ color: ACCENT }}>
              — What's included
            </div>
            <h2
              className="mb-8"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(34px, 4.2vw, 54px)',
                letterSpacing: '-0.022em',
                lineHeight: 1.06,
                color: INK,
              }}
            >
              {data.featureHeadline}
            </h2>
            <div
              className="relative overflow-hidden rounded-[28px]"
              style={{ aspectRatio: '4 / 5', boxShadow: '0 24px 60px -28px rgba(4,30,66,0.35)' }}
            >
              <img src={data.image} alt={data.imageAlt} className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, rgba(4,30,66,0.55) 100%)',
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1.5"
                >
                  In practice
                </div>
                <div className="text-[16px] font-semibold" style={{ letterSpacing: '-0.01em' }}>
                  {data.name}
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — indexed cards */}
          <div className="space-y-4">
            {data.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="grid grid-cols-[auto_1fr] gap-7 lg:gap-9 p-7 lg:p-9 rounded-[24px] transition-all hover:-translate-y-0.5"
                style={{
                  background: '#F8F9FC',
                  border: '1px solid rgba(4,30,66,0.08)',
                  boxShadow: '0 1px 0 rgba(4,30,66,0.02), 0 12px 28px -22px rgba(4,30,66,0.18)',
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: 'clamp(46px, 5vw, 72px)',
                    lineHeight: 0.9,
                    color: ACCENT,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3
                    className="text-[20px] lg:text-[22px] font-semibold mb-2.5"
                    style={{ color: INK, letterSpacing: '-0.012em', fontFamily: 'var(--dc-font-display)' }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[15px] lg:text-[15.5px] leading-[1.6]"
                    style={{ color: '#5C6478', fontFamily: 'var(--dc-font-body)' }}
                  >
                    {f.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3. Stats — oversized serif numerals, no cards ════════ */}
      <section
        className="px-6 lg:px-10 py-24 lg:py-28"
        style={{ background: INK, color: '#fff' }}
      >
        <div className="max-w-[1320px] mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] mb-6" style={{ color: '#A8A4FF' }}>
            — Real results
          </div>
          <h2
            className="mb-16 max-w-[900px]"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(32px, 4vw, 50px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
            }}
          >
            What our {data.name.toLowerCase()} merchants actually see in the first ninety days.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {data.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border-t pt-7"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    fontSize: 'clamp(64px, 7vw, 104px)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.035em',
                    color: '#A8A4FF',
                  }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-4 text-[15.5px] leading-snug max-w-[280px]"
                  style={{ color: 'rgba(255,255,255,0.78)', fontFamily: 'var(--dc-font-body)' }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
          <p
            className="text-[12px] mt-12 opacity-60"
            style={{ fontFamily: 'var(--dc-font-body)' }}
          >
            *Based on Delt merchant data; individual results vary.
          </p>
        </div>
      </section>

      {/* ════════ 4. Capability tiles — dark horizontal row ════════ */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 mb-14 items-end">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] mb-6" style={{ color: ACCENT }}>
                — The full stack
              </div>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'clamp(32px, 4.2vw, 52px)',
                  letterSpacing: '-0.022em',
                  lineHeight: 1.06,
                  color: INK,
                }}
              >
                Website, Payments, Lens AI, and Capital —
                <span className="text-[#4945FF]"> tuned for {data.name.toLowerCase()}.</span>
              </h2>
            </div>
            <p
              className="text-[16.5px] leading-[1.65] max-w-[520px] lg:justify-self-end"
              style={{ color: '#5C6478', fontFamily: 'var(--dc-font-body)' }}
            >
              Start with one product or take the whole stack. Either way, it's one merchant
              account, one login, one team behind it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {data.products.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative p-7 lg:p-8 rounded-[24px] flex flex-col min-h-[320px] transition-colors overflow-hidden"
                style={{
                  background: i === 0 ? ACCENT : '#0B1640',
                  color: '#fff',
                }}
              >
                <div
                  className="text-[10.5px] font-bold uppercase tracking-[0.22em] mb-auto"
                  style={{ color: i === 0 ? '#fff' : '#A8A4FF' }}
                >
                  {String(i + 1).padStart(2, '0')} · {productLabel(p.icon)}
                </div>
                <div className="mt-12">
                  <h3
                    className="text-[19px] lg:text-[21px] font-semibold mb-3 text-white"
                    style={{ letterSpacing: '-0.01em', fontFamily: 'var(--dc-font-display)' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-[14px] leading-[1.6]"
                    style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--dc-font-body)' }}
                  >
                    {p.body}
                  </p>
                </div>
                <ArrowUpRight
                  className="absolute top-7 right-7 w-5 h-5 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 5. KORONA POS partnership (retail only) ════════ */}
      {slug === 'retail' && (
        <section className="px-6 lg:px-10 py-20 lg:py-24">
          <div className="max-w-[1320px] mx-auto">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] mb-6" style={{ color: ACCENT }}>
              — Built with the right POS
            </div>
            <h2
              className="mb-5"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(30px, 3.8vw, 48px)',
                letterSpacing: '-0.022em',
                lineHeight: 1.08,
                color: INK,
                maxWidth: 880,
              }}
            >
              For liquor, smoke, and high-SKU retail: Delt + KORONA POS.
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-10"
              style={{ color: '#5C6478', maxWidth: 720, fontFamily: 'var(--dc-font-body)' }}
            >
              Boutiques and general retailers run beautifully on Delt alone. But if you carry
              thousands of SKUs, run a liquor or smoke shop, or operate multiple stores, we pair
              Delt with KORONA POS — a category-leading retail POS we vetted and chose because it
              handles the depth these operators need.
            </p>
            <KoronaPartnerBlock
              title="The POS we picked for high-inventory retail."
              body={
                'Delt handles payments, capital, your website, and Lens AI. ' +
                'KORONA POS handles the register, inventory, vendor relationships, ' +
                'and multi-location operations. Two specialists, one merchant ' +
                'relationship \u2014 you call Delt, we coordinate the rest.'
              }
              testimonial={{
                quote:
                  'Switching to KORONA POS was the best decision we made for our liquor store. The inventory management system makes it so easy to track our stock and reorder products before we run out. Highly recommend it.',
                name: 'Kristen L.',
                role: 'Pine and Peoria Liquor Store',
              }}
            />
          </div>
        </section>
      )}

      {/* ════════ 6. Editorial pull-quote ════════ */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[auto_1fr] gap-12 lg:gap-20 items-start">
          {/* Left: portrait card with initials — editorial monogram */}
          <div className="flex lg:flex-col items-center lg:items-start gap-5 lg:gap-7">
            <div
              className="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${INK} 100%)`,
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 56,
                letterSpacing: '-0.02em',
              }}
            >
              {data.quoteAuthor
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="lg:max-w-[200px]">
              <div className="text-[15.5px] font-semibold" style={{ color: INK }}>
                {data.quoteAuthor}
              </div>
              <div
                className="text-[13.5px] mt-1"
                style={{ color: '#5C6478', fontFamily: 'var(--dc-font-body)' }}
              >
                {data.quoteRole}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <Quote className="w-9 h-9 mb-6" style={{ color: ACCENT }} strokeWidth={1.8} />
            <blockquote
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(26px, 3.4vw, 44px)',
                letterSpacing: '-0.018em',
                lineHeight: 1.18,
                color: INK,
              }}
            >
              &ldquo;{data.quote}&rdquo;
            </blockquote>
            <div
              className="text-[12px] mt-6 opacity-55"
              style={{ color: INK, fontFamily: 'var(--dc-font-body)' }}
            >
              — Individual results vary.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ 7. Cross-sell for continuity ════════ */}
      <div style={{ background: '#fff' }}>
        <ProductCrossSell
          eyebrow={`Built for ${data.name}`}
          title="Pick your starting point"
          subtitle="Every product plugs into the same stack. Start with one, add the rest when you're ready."
        />
      </div>

      {/* ════════ 8. Final CTA — editorial center, no boxed card ════════ */}
      <section className="px-6 lg:px-10 py-28 lg:py-36 text-center" style={{ background: PAPER }}>
        <div className="max-w-[860px] mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] mb-7" style={{ color: ACCENT }}>
            — Ready when you are
          </div>
          <h2
            className="mb-7"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(36px, 5vw, 64px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.06,
              color: INK,
            }}
          >
            {data.finalHeadline}
          </h2>
          <p
            className="text-[17.5px] leading-relaxed max-w-[640px] mx-auto mb-12"
            style={{ color: '#5C6478', fontFamily: 'var(--dc-font-body)' }}
          >
            {data.finalBody}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/apply"
              className="group inline-flex items-center gap-2 pl-6 pr-5 py-4 rounded-full text-[14.5px] font-semibold text-white transition-colors"
              style={{ background: ACCENT }}
            >
              Start your free trial
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-[14.5px] font-semibold border transition-colors"
              style={{ borderColor: 'rgba(4,30,66,0.18)', color: INK }}
            >
              Book a 20-minute demo
            </Link>
            <Link
              to="/business-types"
              className="inline-flex items-center gap-2 px-6 py-4 text-[14px] font-semibold transition-colors"
              style={{ color: ACCENT }}
            >
              See every industry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
