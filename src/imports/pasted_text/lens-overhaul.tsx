import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Eye,
  DollarSign,
  CreditCard,
  Store,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  MessageSquareText,
} from 'lucide-react';

const LensOverhaul = () => {
  const [active, setActive] = useState('payments');
  const [locked, setLocked] = useState('payments');

  const focusAreas = {
    payments: {
      eyebrow: 'Lens Focus',
      title: 'Payments Visibility',
      body:
        'Lens watches live payment activity, highlights failed transactions, and surfaces the trends that matter most — so merchants can understand what is happening without digging through reports.',
      stats: [
        ['Payment activity', 'Live'],
        ['Trend summaries', 'Instant'],
      ],
      cta: 'Focus payments',
      alert: 'Live Payment Insight',
      msg: 'Failed payments are rising on mobile checkout today. Lens recommends reviewing checkout friction and retry settings.',
      panelTitle: 'Today at a glance',
      panelLines: ['Sales pacing normally', 'Checkout friction flagged', 'Daily summary ready'],
    },
    onboarding: {
      eyebrow: 'Lens Focus',
      title: 'Merchant Setup',
      body:
        'Lens turns setup complexity into guided next steps, helping merchants understand onboarding status, required actions, and what needs attention before they can start taking payments.',
      stats: [
        ['Setup status', 'Clear'],
        ['Next steps', 'Guided'],
      ],
      cta: 'Focus setup',
      alert: 'Setup Reminder',
      msg: 'Your account setup is almost complete. Lens has grouped the final actions so you can finish faster.',
      panelTitle: 'Setup progress',
      panelLines: ['Business details complete', 'Owner details verified', 'One final action remains'],
    },
    reporting: {
      eyebrow: 'Lens Focus',
      title: 'Reporting Clarity',
      body:
        'Lens translates day-to-day payment activity into plain-English summaries, helping merchants understand deposits, processing patterns, and operational trends from one clearer view.',
      stats: [
        ['Summaries', 'Plain-English'],
        ['Visibility', 'Unified'],
      ],
      cta: 'Focus reporting',
      alert: 'Report Ready',
      msg: 'Weekly summary is ready. Deposits were steady, in-person volume increased, and one location outperformed plan.',
      panelTitle: 'Weekly report',
      panelLines: ['Deposits stable', 'In-person volume up', 'Action summary prepared'],
    },
  };

  const order = ['payments', 'onboarding', 'reporting'];

  const positions = {
    payments: { x: '-20%', y: '-2%', angle: '-18deg' },
    onboarding: { x: '0%', y: '10%', angle: '0deg' },
    reporting: { x: '20%', y: '-8%', angle: '18deg' },
  };

  const target = positions[active];
  const activeData = focusAreas[active];

  const capabilities = [
    {
      icon: <Eye size={20} />,
      title: 'Plain-language summaries',
      desc: 'Lens turns payment activity into readable updates that busy merchants can act on quickly.',
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Merchant trend detection',
      desc: 'Surface movement in volume, failed payments, and sales patterns before small issues become bigger ones.',
    },
    {
      icon: <Brain size={20} />,
      title: 'Recommended next steps',
      desc: 'Lens does not just report what changed. It suggests what the merchant should do next.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Guided operational clarity',
      desc: 'From setup to reporting, Lens helps merchants understand status, actions, and follow-through.',
    },
  ];

  const merchantStories = [
    {
      icon: <Store size={18} />,
      title: 'For storefront merchants',
      body:
        'Lens keeps daily operations understandable by summarizing payment activity, calling out exceptions, and helping teams stay ahead of issues without living in dashboards.',
    },
    {
      icon: <CreditCard size={18} />,
      title: 'For omnichannel sellers',
      body:
        'From online to in-person payments, Lens helps merchants see the full picture and understand how different channels are performing together.',
    },
    {
      icon: <Wallet size={18} />,
      title: 'For growing operators',
      body:
        'Lens creates a cleaner feedback loop between payment activity and business decisions, giving merchants better visibility into what deserves attention now.',
    },
  ];

  const cards = useMemo(
    () =>
      order.map((key) => ({
        key,
        ...focusAreas[key],
      })),
    []
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#041E42] selection:bg-[#4945ff]/20">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes beamPulse {
          0%, 100% { opacity: .35; filter: blur(8px); }
          50% { opacity: .92; filter: blur(2px); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-[#041E42]/8 bg-[#f3f4f6]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#080A28] text-white shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#041E42]/45">Delt intelligence</p>
              <p className="text-lg font-bold tracking-tight">Lens AI</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-[#041E42]/70 md:flex">
            <a href="#hero" className="transition hover:text-[#041E42]">Overview</a>
            <a href="#aperture" className="transition hover:text-[#041E42]">Aperture</a>
            <a href="#capabilities" className="transition hover:text-[#041E42]">Capabilities</a>
            <a href="#stories" className="transition hover:text-[#041E42]">Use cases</a>
          </nav>
          <button className="rounded-xl bg-[#4945ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(73,69,255,.22)] transition hover:-translate-y-0.5">
            Book a demo
          </button>
        </div>
      </header>

      <main>
        <section id="hero" className="mx-auto grid max-w-7xl gap-14 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pt-24">
          <div className="self-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4945ff]/20 bg-[#4945ff]/6 px-4 py-2 text-sm font-medium text-[#4945ff]">
              <Sparkles size={14} />
              Lens AI for modern merchant services
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">
              A merchant copilot that
              <span className="block text-[#4945ff]">turns payment noise into action.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[#041E42]/70 md:text-2xl">
              Lens helps merchants understand payment activity, setup progress, and reporting signals through a single intelligent interface designed to feel calm, premium, and immediately useful.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#080A28] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(4,30,66,.18)] transition hover:-translate-y-0.5">
                See Lens in action
                <ArrowRight size={18} />
              </button>
              <button className="rounded-2xl border border-[#041E42]/10 bg-white px-6 py-3.5 text-base font-semibold text-[#041E42] transition hover:bg-[#041E42]/[0.03]">
                Explore merchant flows
              </button>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              {[
                ['Live insights', 'Always on'],
                ['Merchant view', 'Plain-English'],
                ['Designed for', 'Payments teams'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] border border-[#041E42]/8 bg-white/70 p-4 shadow-[0_12px_30px_rgba(4,30,66,.05)]">
                  <p className="text-sm text-[#041E42]/50">{label}</p>
                  <p className="mt-2 text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[560px]">
            <div className="absolute right-0 top-2 h-[520px] w-[92%] rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(73,69,255,.28),rgba(255,255,255,.8)_38%,rgba(73,69,255,.18)_72%,rgba(4,30,66,.08))] shadow-[0_40px_90px_rgba(73,69,255,.18)]" />
            <div className="absolute right-6 top-12 h-[440px] w-[86%] rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_30px_70px_rgba(4,30,66,.12)] backdrop-blur-xl" style={{ animation: 'floatCard 7s ease-in-out infinite' }}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#041E42]/42">Lens Live Feed</p>
                  <h3 className="mt-2 text-2xl font-bold">Merchant command view</h3>
                </div>
                <div className="rounded-full bg-[#dff7ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c8f5a]">
                  Active
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-[1.5rem] border border-[#041E42]/8 bg-[#f7f8fc] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Lens summary</p>
                    <MessageSquareText size={18} className="text-[#4945ff]" />
                  </div>
                  <div className="mt-4 rounded-[1.25rem] bg-white p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-[#041E42]/72">
                      Today looks healthy overall. Mobile checkout friction increased this afternoon, and Lens recommends reviewing the failed-payment cluster before evening traffic rises.
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[1rem] bg-white p-3 shadow-sm">
                      <p className="text-xs text-[#041E42]/46">Payment pulse</p>
                      <p className="mt-2 text-2xl font-bold">Stable</p>
                    </div>
                    <div className="rounded-[1rem] bg-white p-3 shadow-sm">
                      <p className="text-xs text-[#041E42]/46">Needs attention</p>
                      <p className="mt-2 text-2xl font-bold text-[#4945ff]">1 issue</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-[#041E42]/8 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#041E42]/42">Setup status</p>
                    <div className="mt-4 h-2 rounded-full bg-[#041E42]/8">
                      <div className="h-full w-[82%] rounded-full bg-[#4945ff]" />
                    </div>
                    <p className="mt-3 text-sm text-[#041E42]/70">Almost complete. Lens grouped the final actions for review.</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#041E42]/8 bg-[#080A28] p-4 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Weekly report</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-3xl font-bold">Clear</p>
                        <p className="text-sm text-white/65">Summary quality</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-[#8f8bff]">Ready</p>
                        <p className="text-sm text-white/65">Next update</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#041E42]/8 bg-[#eef2ff] p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4945ff]">Operator note</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#041E42]/72">
                      Lens is built to explain what changed, why it matters, and what to do next.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="aperture" className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
          <div className="overflow-hidden rounded-[2.5rem] border border-[#041E42]/8 bg-[linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.55))] shadow-[0_40px_90px_rgba(4,30,66,.08)]">
            <div className="relative grid min-h-[860px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[285px_1fr_285px] lg:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(73,69,255,.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(73,69,255,.06),transparent_28%)]" />

              <div className="order-2 flex flex-col gap-5 lg:order-1 lg:pt-14">
                {cards.slice(0, 2).map((card) => {
                  const isActive = active === card.key;
                  const isLocked = locked === card.key;
                  return (
                    <button
                      key={card.key}
                      onMouseEnter={() => setActive(card.key)}
                      onFocus={() => setActive(card.key)}
                      onClick={() => {
                        setActive(card.key);
                        setLocked(card.key);
                      }}
                      className={`group rounded-[1.75rem] border p-6 text-left transition duration-500 ${
                        isActive || isLocked
                          ? 'border-[#4945ff]/35 bg-white shadow-[0_24px_60px_rgba(73,69,255,.12)]'
                          : 'border-[#041E42]/8 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#041E42]/42">{card.eyebrow}</p>
                      <h3 className="mb-3 text-3xl font-bold leading-tight">{card.title}</h3>
                      <p className="mb-6 text-base leading-relaxed text-[#041E42]/66">{card.body}</p>
                      <div className="space-y-3 border-t border-[#041E42]/8 pt-5 text-sm">
                        {card.stats.map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-[#041E42]/48">{label}</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#080A28] px-4 py-2 text-sm font-medium text-white transition group-hover:translate-x-0.5">
                        {card.cta}
                        <span>→</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="order-1 flex items-center justify-center lg:order-2">
                <div className="relative flex h-[640px] w-full max-w-[820px] items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.65),rgba(73,69,255,.10)_52%,transparent_72%)] blur-2xl" />

                  <div
                    className="absolute left-1/2 top-1/2 h-[12px] origin-left rounded-full bg-[#4945ff]/85 shadow-[0_0_30px_rgba(73,69,255,.35)] transition-all duration-700"
                    style={{
                      width: '36%',
                      transform: `translate(-5%, -50%) rotate(${target.angle})`,
                      animation: active === locked ? 'beamPulse 1.9s ease-in-out infinite' : 'none',
                    }}
                  />

                  <div
                    className="relative h-[470px] w-[470px] rounded-full"
                    style={{
                      transform: `translate(${target.x}, ${target.y})`,
                      transition: 'transform 700ms cubic-bezier(.22,1,.36,1)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border border-white/90 bg-white/18 shadow-[inset_0_0_60px_rgba(255,255,255,.45),0_24px_80px_rgba(4,30,66,.10)] backdrop-blur-xl" />
                    <div className="absolute inset-[22px] rounded-full border border-white/75 bg-white/10 backdrop-blur-xl" />
                    <div className="absolute inset-[56px] rounded-full border border-white/70 bg-[radial-gradient(circle,rgba(73,69,255,.10),rgba(255,255,255,.16))] shadow-[inset_0_0_40px_rgba(255,255,255,.35)] backdrop-blur-md" />

                    <div className="absolute inset-[12px] rounded-full border border-[#4945ff]/30" style={{ animation: 'rotateSlow 18s linear infinite' }} />
                    <div className="absolute inset-[42px] rounded-full border border-[#041E42]/10" style={{ animation: 'rotateReverse 14s linear infinite' }} />
                    <div className="absolute inset-[86px] rounded-full border border-[#4945ff]/20" style={{ animation: 'rotateSlow 10s linear infinite' }} />
                    <div className="absolute inset-[128px] rounded-full border border-[#041E42]/8" style={{ animation: 'rotateReverse 8s linear infinite' }} />

                    <div className="absolute inset-[118px] rounded-full bg-[radial-gradient(circle,rgba(73,69,255,.18),rgba(255,255,255,.24)_42%,rgba(255,255,255,.06)_58%,transparent_66%)] backdrop-blur-md" />
                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/50 shadow-[0_0_35px_rgba(73,69,255,.2)] backdrop-blur-xl" />
                    <div
                      className="absolute left-1/2 top-1/2 h-40 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#4945ff] to-transparent opacity-80"
                      style={{ transform: `translate(-50%, -50%) rotate(${target.angle})`, transition: 'transform 700ms cubic-bezier(.22,1,.36,1)' }}
                    />
                    <div className="absolute inset-0 rounded-full" style={{ animation: 'drift 7s ease-in-out infinite' }} />
                  </div>

                  <div className="absolute left-10 top-10 rounded-full border border-[#041E42]/8 bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#041E42]/45 backdrop-blur-md">
                    Hover or click a focus area
                  </div>

                  <div className="absolute bottom-8 left-1/2 w-[88%] max-w-xl -translate-x-1/2 rounded-[1.65rem] border border-white/50 bg-[#080A28] p-5 shadow-[0_24px_60px_rgba(4,30,66,.18)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Lens Status</p>
                        <h4 className="mt-2 text-2xl font-bold text-white">{activeData.title}</h4>
                      </div>
                      <div className="rounded-full bg-[#4945ff]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b3b1ff]">
                        locked on {locked}
                      </div>
                    </div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#dff7ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c8f5a]">
                      <CheckCircle2 size={14} />
                      {activeData.alert}
                    </div>
                    <p className="text-sm leading-relaxed text-white/72">{activeData.msg}</p>
                  </div>
                </div>
              </div>

              <div className="order-3 flex flex-col gap-5 lg:pt-24">
                {cards.slice(2).map((card) => {
                  const isActive = active === card.key;
                  const isLocked = locked === card.key;
                  return (
                    <button
                      key={card.key}
                      onMouseEnter={() => setActive(card.key)}
                      onFocus={() => setActive(card.key)}
                      onClick={() => {
                        setActive(card.key);
                        setLocked(card.key);
                      }}
                      className={`group rounded-[1.75rem] border p-6 text-left transition duration-500 ${
                        isActive || isLocked
                          ? 'border-[#4945ff]/35 bg-white shadow-[0_24px_60px_rgba(73,69,255,.12)]'
                          : 'border-[#041E42]/8 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#041E42]/42">{card.eyebrow}</p>
                      <h3 className="mb-3 text-3xl font-bold leading-tight">{card.title}</h3>
                      <p className="mb-6 text-base leading-relaxed text-[#041E42]/66">{card.body}</p>
                      <div className="space-y-3 border-t border-[#041E42]/8 pt-5 text-sm">
                        {card.stats.map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-[#041E42]/48">{label}</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#080A28] px-4 py-2 text-sm font-medium text-white transition group-hover:translate-x-0.5">
                        {card.cta}
                        <span>→</span>
                      </div>
                    </button>
                  );
                })}

                <div className="rounded-[1.75rem] border border-[#041E42]/8 bg-white/72 p-6 shadow-[0_18px_40px_rgba(4,30,66,.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#041E42]/42">Why this works</p>
                  <p className="mt-4 text-lg leading-relaxed text-[#041E42]/72">
                    The aperture turns Lens into a living interface. Instead of a static dashboard, the product visibly directs attention toward the merchant problem it is interpreting right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#4945ff]">Core capabilities</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">What Lens makes feel effortless.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#041E42]/66">
              A premium merchant experience depends on clarity. Lens is designed to interpret, prioritize, and explain what matters across the payment lifecycle.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-[#041E42]/8 bg-white p-6 shadow-[0_16px_40px_rgba(4,30,66,.05)] transition hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4945ff]">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#041E42]/66">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-28 lg:grid-cols-[.95fr_1.05fr] lg:px-10">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#4945ff]">How it feels</p>
            <h2 className="max-w-md text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Calm enough for merchants. Powerful enough for operators.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              ['Reads like a briefing', 'Lens speaks in plain language, not technical fragments or dashboard jargon.'],
              ['Shows what changed', 'Merchants should understand the new signal immediately and why it matters.'],
              ['Points toward action', 'Every important insight should create a next step, not just another metric.'],
            ].map(([title, text]) => (
              <div key={title} className="flex items-start gap-4 border-t border-[#041E42]/10 py-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4945ff]" />
                <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#041E42]/66">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="stories" className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#4945ff]">Merchant use cases</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">Built for modern merchant services.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {merchantStories.map((story) => (
              <div key={story.title} className="rounded-[2rem] border border-[#041E42]/8 bg-white p-7 shadow-[0_18px_40px_rgba(4,30,66,.05)] transition hover:-translate-y-1.5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#080A28] text-white">
                  {story.icon}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{story.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[#041E42]/68">{story.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-28 text-center lg:px-10">
          <div className="rounded-[2.5rem] border border-[#041E42]/8 bg-[linear-gradient(180deg,#041E42,#0b2a59)] px-8 py-16 shadow-[0_30px_80px_rgba(4,30,66,.18)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/10 text-white">
              <Sparkles size={26} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">A better Lens deserves a better stage.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/72">
              This redesign makes Lens feel like the hero product it should be: more premium, more focused, and more merchant-centered from the first scroll.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button className="rounded-2xl bg-[#4945ff] px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_40px_rgba(73,69,255,.3)] transition hover:-translate-y-0.5">
                Launch the demo
              </button>
              <button className="rounded-2xl border border-white/14 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/6">
                Review narrative
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LensOverhaul;
