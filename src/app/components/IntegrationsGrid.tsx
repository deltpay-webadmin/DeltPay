import { motion } from 'motion/react';
import { ScrollReveal, StaggerChildren, staggerItemVariants } from './MicroInteractions';

/* ──────────────────────────────────────────────────────────────
   IntegrationsGrid — "Built to fit your workflow".
   Light paper surface for contrast against the dark code section.
   Brand-agnostic tiles: white card + indigo-tint monogram square
   + wordmark. No external logo images. Hover lift via motion.
   A subtly highlighted center "Delt" hub tile anchors the grid.
   ────────────────────────────────────────────────────────────── */

interface Integration {
  name: string;
  initials: string;
  hub?: boolean;
}

const INTEGRATIONS: Integration[] = [
  { name: 'KORONA', initials: 'KO' },
  { name: 'eHopper', initials: 'eH' },
  { name: 'Paysafe', initials: 'PS' },
  { name: 'Verifone', initials: 'VF' },
  { name: 'Goat Payments', initials: 'GP' },
  { name: 'PAX', initials: 'PX' },
  { name: 'Delt', initials: 'D', hub: true },
  { name: 'LANDI', initials: 'LD' },
  { name: 'Plaid', initials: 'PL' },
  { name: 'Vercel', initials: 'V' },
  { name: 'Notion', initials: 'N' },
  { name: 'QuickBooks', initials: 'QB' },
  { name: 'Google Voice', initials: 'GV' },
];

function Monogram({ initials, hub }: { initials: string; hub?: boolean }) {
  return (
    <span
      className="flex items-center justify-center rounded-[8px] flex-shrink-0"
      style={{
        width: 44,
        height: 44,
        background: hub ? 'var(--dc-indigo)' : 'var(--dc-indigo-tint-08)',
        color: hub ? '#FFFFFF' : 'var(--dc-indigo)',
        fontFamily: 'var(--dc-font-display)',
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: '-0.02em',
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function IntegrationTile({ item }: { item: Integration }) {
  return (
    <motion.div
      variants={staggerItemVariants('up', 24)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-[12px] flex items-center gap-3.5 px-4 py-4"
      style={{
        background: item.hub ? 'var(--dc-indigo-tint-08)' : 'var(--dc-bg-white)',
        border: item.hub
          ? '1px solid rgba(73,69,255,0.30)'
          : '1px solid rgba(4,30,66,0.08)',
        boxShadow: 'var(--dc-shadow-card)',
      }}
    >
      <Monogram initials={item.initials} hub={item.hub} />
      <span className="min-w-0 flex flex-col">
        <span
          className="truncate text-[15px]"
          style={{
            fontFamily: 'var(--dc-font-display)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--dc-on-light)',
          }}
        >
          {item.name}
        </span>
        {item.hub && (
          <span
            className="text-[11px] mt-0.5"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--dc-indigo)',
            }}
          >
            Your hub
          </span>
        )}
      </span>
    </motion.div>
  );
}

export function IntegrationsGrid() {
  return (
    <section
      className="relative w-full py-24 lg:py-28"
      style={{ background: 'var(--dc-bg-paper)', color: 'var(--dc-on-light)' }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="max-w-[640px]">
          <div className="dc-eyebrow dc-on-light" style={{ color: 'var(--dc-indigo)' }}>
            INTEGRATIONS
          </div>
          <h2
            className="mt-5 dc-h2"
            style={{
              color: 'var(--dc-on-light)',
              fontSize: 'clamp(34px, 5vw, 56px)',
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: '-0.035em',
            }}
          >
            Built to fit your workflow
            <span style={{ color: 'var(--dc-indigo)' }}>.</span>
          </h2>
          <p
            className="mt-5 text-[16px] leading-[1.6]"
            style={{ color: 'var(--dc-on-light-muted)', fontFamily: 'var(--dc-font-body)' }}
          >
            Delt connects with the POS, processors, and tools you already run.
          </p>
        </ScrollReveal>

        {/* Tile grid */}
        <StaggerChildren
          className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          staggerDelay={0.05}
        >
          {INTEGRATIONS.map((item) => (
            <IntegrationTile key={item.name} item={item} />
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

export default IntegrationsGrid;
