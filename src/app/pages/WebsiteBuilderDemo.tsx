import { useState } from 'react';
import { Palette, Search, Boxes, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

/* ─── Delt Websites — Toast-structured rebuild ─── */

const JAKARTA = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

/* ════════════════════════════════════════════
   BROWSER WINDOW MOCKUP
   ════════════════════════════════════════════ */
function BrowserMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Chrome bar */}
      <div className="bg-[#041E42] border-b border-white/10 px-4 py-3 flex items-center gap-3">
        {/* Traffic-light dots — white opacity variants only */}
        <span className="w-3 h-3 rounded-full bg-white/20 block" />
        <span className="w-3 h-3 rounded-full bg-white/30 block" />
        <span className="w-3 h-3 rounded-full bg-white/50 block" />
        {/* URL bar */}
        <div className="flex-1 ml-2 bg-white/10 rounded-full h-6 flex items-center px-4">
          <span className="text-white/40 text-xs tracking-wide">delt.co/your-restaurant</span>
        </div>
      </div>

      {/* Site preview */}
      <div className="bg-white">
        {/* Fake site nav */}
        <div className="bg-[#041E42] px-6 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm tracking-wide">PRESTO KITCHEN</span>
          <div className="hidden sm:flex items-center gap-5 text-white/70 text-xs">
            <span>Menu</span><span>Hours</span><span>Reserve</span>
          </div>
          <button className="bg-[#4945FF] text-white text-xs px-3 py-1.5 rounded-full font-semibold">
            Order now
          </button>
        </div>

        {/* Hero area */}
        <div
          className="relative h-36 sm:h-48 flex flex-col items-center justify-center text-center px-6"
          style={{ background: 'linear-gradient(135deg, rgba(73,69,255,0.15) 0%, rgba(4,30,66,0.05) 100%)' }}
        >
          <div className="text-[#041E42] font-bold text-xl sm:text-2xl mb-2 tracking-tight">
            Fresh. Local. Fast.
          </div>
          <div className="text-[#475569] text-xs mb-4">
            Dine-in · Takeout · Delivery · 7 days a week
          </div>
          <button className="bg-[#4945FF] text-white text-xs px-5 py-2 rounded-full font-semibold">
            Order online →
          </button>
        </div>

        {/* Menu grid */}
        <div className="px-4 py-4 grid grid-cols-3 gap-3 bg-white border-t border-[#041E42]/5">
          {['Starters', 'Mains', 'Drinks'].map((cat) => (
            <div key={cat} className="rounded-xl border border-[#041E42]/10 p-3 text-center">
              <div
                className="w-full h-14 rounded-lg mb-2"
                style={{ background: 'linear-gradient(135deg, rgba(73,69,255,0.12), rgba(4,30,66,0.06))' }}
              />
              <span className="text-[#041E42] text-xs font-semibold">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DRAG-DROP BUILDER MOCKUP
   ════════════════════════════════════════════ */
function BuilderMockup() {
  const blocks = ['Hero', 'Menu', 'Gallery', 'Contact'];
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-[#041E42]/10 bg-white flex flex-col sm:flex-row relative">
      {/* Sidebar */}
      <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-[#041E42]/10 bg-[#F6F7FB] p-4 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
        <p className="text-[#041E42] font-semibold text-xs mb-2 hidden sm:block tracking-wide uppercase">
          Blocks
        </p>
        {blocks.map((b) => (
          <div
            key={b}
            className="flex items-center gap-2 bg-white rounded-xl border border-[#041E42]/10 px-3 py-2 cursor-grab active:cursor-grabbing shadow-sm flex-shrink-0"
          >
            {/* Grip dots */}
            <div className="grid grid-cols-2 gap-0.5">
              {[0,1,2,3].map((i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-[#94A3B8]" />
              ))}
            </div>
            <span className="text-[#041E42] text-xs font-medium">{b}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 min-h-[220px] sm:min-h-0">
        {/* Canvas site preview */}
        <div className="w-full rounded-xl border-2 border-[#4945FF]/30 overflow-hidden">
          <div className="bg-[#041E42] px-4 py-2 flex items-center justify-between">
            <span className="text-white text-xs font-bold">PRESTO KITCHEN</span>
            <button className="bg-[#4945FF] text-white text-[10px] px-2.5 py-1 rounded-full font-semibold">
              Order
            </button>
          </div>
          <div
            className="h-20 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(73,69,255,0.12), rgba(4,30,66,0.04))' }}
          >
            <span className="text-[#041E42] text-sm font-bold">Fresh. Local. Fast.</span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 bg-white">
            {['Starters','Mains','Drinks'].map((c) => (
              <div key={c} className="h-10 rounded-lg bg-[#F6F7FB] border border-[#041E42]/8 flex items-center justify-center">
                <span className="text-[#041E42] text-[10px] font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating color-picker chip */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white shadow-lg rounded-full px-3 py-2 border border-[#041E42]/10">
        <span className="w-4 h-4 rounded-full bg-[#4945FF] shadow-sm" />
        <span className="text-[#041E42] text-xs font-mono font-semibold">#4945FF</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   FAQ ACCORDION
   ════════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: 'Is the website builder easy to use?',
    a: 'Yes — it\'s designed for operators, not developers. If you\'ve used a doc editor, you can use this.',
  },
  {
    q: 'Do you offer onboarding?',
    a: 'Yes. Delt offers onboarding for a one-time fee to get you typically live within your first week — timing depends on how quickly your content and domain are ready.'
  },
  {
    q: 'Does it integrate with other Delt products?',
    a: 'Yes. Websites talks to Payments, POS, Online Ordering, and Reservations natively — no plugins.',
  },
  {
    q: 'When can I start building?',
    a: 'As soon as your contract is complete, even before your POS activates.',
  },
  {
    q: 'Can I use a custom domain?',
    a: 'Yes. Bring your own domain or register one through us — included on all plans.',
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-[#041E42]/10">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="py-5">
          <button
            className="w-full flex items-center justify-between text-left gap-4 group"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="text-[#041E42] font-semibold text-base sm:text-lg leading-snug">
              {item.q}
            </span>
            <ChevronDown
              className="flex-shrink-0 w-5 h-5 text-[#4945FF] transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {open === i && (
            <p className="mt-3 text-[#475569] text-base leading-relaxed">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE EXPORT
   ════════════════════════════════════════════ */
export function WebsiteBuilderDemo() {
  return (
    <div className="bg-white" style={{ fontFamily: JAKARTA }}>

      {/* ════════ 1. HERO ════════ */}
      <section className="relative overflow-hidden bg-[#041E42] text-white pt-32 pb-24 px-6">
        {/* Glow accents */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[#4945FF]/25 blur-[160px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[360px] h-[360px] rounded-full bg-[#4945FF]/15 blur-[120px] pointer-events-none" />

        <div className="relative max-w-[1240px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/80 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#4945FF]" />
              Delt Websites
            </div>

            <h1
              className="font-bold leading-[1.0] tracking-tight mb-6 text-5xl sm:text-6xl lg:text-7xl"
            >
              Websites{' '}
              <span className="text-[#4945FF]">made easy.</span>
            </h1>

            <p className="text-white/65 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
              Delt's fully customizable website builder keeps your menu, online ordering, POS,
              and inventory in lockstep — update once, everywhere updates.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-[#4945FF] hover:bg-[#3b38e0] text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-150 text-sm"
              >
                Start your free trial <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-150 text-sm"
              >
                Book a demo
              </a>
            </div>
          </div>

          {/* Right: browser mockup */}
          <div className="w-full">
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* ════════ 2. FULLY INTEGRATED ════════ */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-bold text-[#041E42] leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              Fully integrated. Customizable. Easy to discover.{' '}
              <span className="text-[#4945FF]">And delightfully simple.</span>
            </h2>
            <p className="text-[#475569] text-lg">Build in minutes. Update in seconds.</p>
          </div>

          {/* 3-card row */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Palette className="w-6 h-6 text-[#4945FF]" />,
                title: 'Designer-grade templates',
                copy: 'Customize your site with a library of beautifully designed templates, custom fonts, colors, and images that actually look like you.',
              },
              {
                icon: <Search className="w-6 h-6 text-[#4945FF]" />,
                title: 'SEO built in',
                copy: 'Our sites are search-engine optimized out of the box, so customers find your business first when they search nearby.',
              },
              {
                icon: <Boxes className="w-6 h-6 text-[#4945FF]" />,
                title: 'One integrated stack',
                copy: 'Your site, online ordering, inventory, and checkout all speak the same language. No plugins. No duct tape.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#041E42]/10 bg-white p-8 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4945FF]/8 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-[#041E42] font-bold text-lg leading-snug">{card.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed flex-1">{card.copy}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[#4945FF] font-semibold text-sm hover:gap-2.5 transition-all duration-150"
                >
                  Learn how <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3. BUILDER PREVIEW ════════ */}
      <section className="bg-[#F6F7FB] py-24 px-6">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <h2
              className="font-bold text-[#041E42] leading-tight tracking-tight mb-6"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              Drag. Drop.{' '}
              <span className="text-[#4945FF]">Done.</span>
            </h2>
            <p className="text-[#475569] text-lg leading-relaxed">
              Edit your hero. Swap a menu item. Change your hours. Changes go live in seconds —
              no developer required.
            </p>
          </div>

          {/* Right: builder mockup */}
          <div className="w-full">
            <BuilderMockup />
          </div>
        </div>
      </section>

      {/* ════════ 4. DIGITAL STOREFRONT SUITE ════════ */}
      <section className="bg-[#041E42] py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* NEW pill */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4945FF] text-white text-xs font-bold px-4 py-1.5 tracking-widest uppercase">
              New
            </span>
          </div>

          <h2
            className="font-bold text-white leading-tight tracking-tight text-center mb-16 max-w-3xl mx-auto"
            style={{ fontSize: 'clamp(26px, 3.5vw, 44px)' }}
          >
            Websites is part of the Delt{' '}
            <span className="text-[#4945FF]">Digital Storefront Suite</span> — built to bring
            guests in with features that work better together.
          </h2>

          {/* 3 sub-feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Easily build and manage your business\'s website',
                copy: 'From first click to first booking, nothing falls through.',
              },
              {
                title: 'Stand out from search to storefront',
                copy: 'SEO, local listings, and Google Business sync included.',
              },
              {
                title: 'Every tool connected',
                copy: 'POS, payments, menu, inventory — one source of truth, always in sync.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/8 transition-colors duration-200"
              >
                <div className="w-8 h-1 rounded-full bg-[#4945FF] mb-6" />
                <h3 className="text-white font-bold text-lg leading-snug mb-3">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 5. FAQ ════════ */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-[740px] mx-auto">
          <h2
            className="font-bold text-[#041E42] tracking-tight mb-12 text-center"
            style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}
          >
            Frequently asked questions
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* ════════ 6. FINAL CTA BANNER ════════ */}
      <section className="bg-[#041E42] py-24 px-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#4945FF]/20 blur-[120px] pointer-events-none" />
        <div className="relative max-w-[640px] mx-auto">
          <h2
            className="font-bold text-white tracking-tight leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Get a demo and see every side of Delt.
          </h2>
          <p className="text-white/55 text-base mb-10">
            Already a Delt customer?{' '}
            <a href="#" className="text-white/80 underline underline-offset-2 hover:text-white transition-colors">
              Sign in
            </a>{' '}
            to launch your Digital Storefront Suite.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#4945FF] hover:bg-[#3b38e0] text-white font-semibold px-8 py-4 rounded-full transition-colors duration-150 text-sm"
            >
              Book a demo <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-150 text-sm"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
