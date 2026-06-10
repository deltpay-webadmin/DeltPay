import React from 'react';

/* ──────────────────────────────────────────────────────────────
   CustomerCarousel — Plaid-style "powered by Delt" customer
   showcase. Three continuous marquee lanes scroll across the
   section at different speeds and directions, each carrying a
   diversified set of real-sounding SMB merchants from the
   industries Delt actually serves (restaurants, retail, salons,
   automotive, fitness, healthcare, professional services, etc).

   The cards are pure HTML/CSS — wordmark + industry tag + city —
   so the strip stays dynamic on any screen size without external
   image assets. Hover lifts a card and intensifies its border.
   ────────────────────────────────────────────────────────────── */

type Customer = {
  name: string;
  industry: string;
  city: string;
  /** Two-letter mark shown in the chip avatar. */
  mark: string;
  /** Accent color for the mark background. */
  accent: string;
};

// 30+ real-sounding SMBs across the industries Delt processes for.
// Names are fictional but feel like real Main-Street businesses.
const CUSTOMERS: Customer[] = [
  { name: 'Ironwood Coffee Co.',     industry: 'Café',                 city: 'Austin, TX',         mark: 'IW', accent: '#7C3AED' },
  { name: 'Halcyon Hair Studio',     industry: 'Salon',                city: 'Miami, FL',          mark: 'HH', accent: '#EC4899' },
  { name: 'Northside Auto Repair',   industry: 'Automotive',           city: 'Chicago, IL',        mark: 'NA', accent: '#F59E0B' },
  { name: 'Bluefin Sushi Bar',       industry: 'Restaurant',           city: 'Seattle, WA',        mark: 'BS', accent: '#06B6D4' },
  { name: 'Stonecut Barbershop',     industry: 'Barber',               city: 'Brooklyn, NY',       mark: 'SC', accent: '#10B981' },
  { name: 'Coastal Pediatric Care',  industry: 'Healthcare',           city: 'San Diego, CA',      mark: 'CP', accent: '#3B82F6' },
  { name: 'Cedar & Vine Boutique',   industry: 'Apparel',              city: 'Nashville, TN',      mark: 'CV', accent: '#A855F7' },
  { name: 'Pacific Strength Gym',    industry: 'Fitness',              city: 'Long Beach, CA',     mark: 'PS', accent: '#EF4444' },
  { name: 'Maple Leaf Bakery',       industry: 'Bakery',               city: 'Portland, OR',       mark: 'ML', accent: '#D97706' },
  { name: 'Sun Valley Dental',       industry: 'Dental',               city: 'Phoenix, AZ',        mark: 'SV', accent: '#0EA5E9' },
  { name: 'Granite Peak Outfitters', industry: 'Outdoor Retail',       city: 'Denver, CO',         mark: 'GP', accent: '#22C55E' },
  { name: 'La Rosita Taquería',      industry: 'Restaurant',           city: 'Los Angeles, CA',    mark: 'LR', accent: '#F97316' },
  { name: 'Brightline Pet Hospital', industry: 'Veterinary',           city: 'Charlotte, NC',      mark: 'BP', accent: '#14B8A6' },
  { name: 'Atlas Print & Sign',      industry: 'Print Services',       city: 'Houston, TX',        mark: 'AP', accent: '#6366F1' },
  { name: 'Vesper Wine Bar',         industry: 'Wine Bar',             city: 'San Francisco, CA',  mark: 'VW', accent: '#9333EA' },
  { name: 'Pinecrest Florals',       industry: 'Florist',              city: 'Asheville, NC',      mark: 'PF', accent: '#84CC16' },
  { name: 'Riverstone Yoga',         industry: 'Wellness',             city: 'Boulder, CO',        mark: 'RY', accent: '#10B981' },
  { name: 'Old Forge Pizza',         industry: 'Restaurant',           city: 'Scranton, PA',       mark: 'OF', accent: '#DC2626' },
  { name: 'Magnolia Med Spa',        industry: 'Med Spa',              city: 'Atlanta, GA',        mark: 'MM', accent: '#E879F9' },
  { name: 'Harborlight Optometry',   industry: 'Optometry',            city: 'Baltimore, MD',      mark: 'HO', accent: '#0284C7' },
  { name: 'Copperline Hardware',     industry: 'Hardware Store',       city: 'Tulsa, OK',          mark: 'CH', accent: '#B45309' },
  { name: 'Saltwater Surf Shop',     industry: 'Sporting Goods',       city: 'Wilmington, NC',     mark: 'SW', accent: '#0891B2' },
  { name: 'The Velvet Lounge',       industry: 'Nightlife',            city: 'New Orleans, LA',    mark: 'VL', accent: '#7E22CE' },
  { name: 'Sterling Tailors',        industry: 'Apparel',              city: 'Boston, MA',         mark: 'ST', accent: '#475569' },
  { name: 'Greenline Cannabis Co.',  industry: 'Cannabis Retail',      city: 'Denver, CO',         mark: 'GC', accent: '#65A30D' },
  { name: 'Pier 42 Seafood Market',  industry: 'Specialty Grocery',    city: 'Portland, ME',       mark: 'P4', accent: '#0369A1' },
  { name: 'Lone Star Smokehouse',    industry: 'BBQ Restaurant',       city: 'Dallas, TX',         mark: 'LS', accent: '#B91C1C' },
  { name: 'Skyline Drone Repair',    industry: 'Electronics Repair',   city: 'San Jose, CA',       mark: 'SD', accent: '#2563EB' },
  { name: 'Roselawn Funeral Home',   industry: 'Professional Services',city: 'Cleveland, OH',      mark: 'RF', accent: '#52525B' },
  { name: 'Tidewater Charters',      industry: 'Tourism',              city: 'Key West, FL',       mark: 'TC', accent: '#0EA5E9' },
  { name: 'Aurora HVAC Solutions',   industry: 'Home Services',        city: 'Minneapolis, MN',    mark: 'AH', accent: '#F43F5E' },
  { name: 'Crescent Moon Yoga',      industry: 'Wellness',             city: 'Savannah, GA',       mark: 'CM', accent: '#A78BFA' },
  { name: 'Brick & Brew Pizzeria',   industry: 'Restaurant',           city: 'Pittsburgh, PA',     mark: 'BB', accent: '#EA580C' },
  { name: 'Westport Marine Supply',  industry: 'Marine Retail',        city: 'Newport, RI',        mark: 'WM', accent: '#1D4ED8' },
];

// Slice the master list into three lanes so each marquee carries a
// distinct, balanced mix of industries instead of clumping similar
// businesses together visually.
const LANE_1 = CUSTOMERS.filter((_, i) => i % 3 === 0);
const LANE_2 = CUSTOMERS.filter((_, i) => i % 3 === 1);
const LANE_3 = CUSTOMERS.filter((_, i) => i % 3 === 2);

function CustomerCard({ c }: { c: Customer }) {
  return (
    <div
      className="customer-card"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 22px 14px 14px',
        marginRight: 18,
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
        transition: 'transform 220ms ease, background 220ms ease, border-color 220ms ease',
        cursor: 'default',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--dc-font-display)',
          fontWeight: 600,
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.85)',
          letterSpacing: '-0.01em',
          flex: '0 0 auto',
        }}
      >
        {c.mark}
      </div>
      <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: 'var(--dc-font-display)',
            fontWeight: 600,
            fontSize: 16,
            color: 'var(--dc-on-dark, #fff)',
            letterSpacing: '-0.015em',
          }}
        >
          {c.name}
        </span>
        <span
          style={{
            marginTop: 4,
            fontFamily: 'var(--dc-font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          {c.industry} · {c.city}
        </span>
      </div>
    </div>
  );
}

type LaneProps = {
  items: Customer[];
  direction: 'left' | 'right';
  duration: number;
};

function Lane({ items, direction, duration }: LaneProps) {
  // Duplicate the list so the loop is seamless when the inner track
  // translates exactly -50% / 0%.
  const doubled = [...items, ...items];
  return (
    <div
      className="customer-lane"
      style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}
    >
      <div
        style={{
          display: 'inline-flex',
          animation: `dc-cust-${direction} ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {doubled.map((c, i) => (
          <CustomerCard key={`${c.name}-${i}`} c={c} />
        ))}
      </div>
    </div>
  );
}

export function CustomerCarousel() {
  return (
    <section
      style={{
        background: 'var(--dc-bg-navy, #080A28)',
        color: 'var(--dc-on-dark, #fff)',
        padding: '88px 0 104px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 24px 40px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--dc-font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          — Built for Main Street
        </div>
        <h2
          style={{
            marginTop: 14,
            fontFamily: 'var(--dc-font-display)',
            fontSize: 'clamp(34px, 4.4vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 1.02,
            maxWidth: 920,
          }}
        >
          Thousands of merchants{' '}
          <span
            style={{
              fontFamily: 'var(--dc-font-serif-italic)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#A5B4FC',
            }}
          >
            power
          </span>{' '}
          their business with Delt.
        </h2>
        <p
          style={{
            marginTop: 16,
            maxWidth: 540,
            fontFamily: 'var(--dc-font-body)',
            fontSize: 16,
            lineHeight: 1.55,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          From neighborhood cafés to multi-location service shops, Delt processes payments and
          funds growth for businesses across every industry.
        </p>
      </div>

      {/* Three lanes, alternating directions and speeds for a dynamic feel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Lane items={LANE_1} direction="left" duration={68} />
        <Lane items={LANE_2} direction="right" duration={82} />
        <Lane items={LANE_3} direction="left" duration={56} />
      </div>

      <style>{`
        @keyframes dc-cust-left {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes dc-cust-right {
          0%   { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .customer-card:hover {
          transform: translateY(-3px);
          background: rgba(73, 69, 255, 0.12) !important;
          border-color: rgba(73, 69, 255, 0.55) !important;
        }
        /* Pause the marquee when the user hovers the lane so the
           cards are easy to read. */
        .customer-lane:hover > div {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .customer-lane > div { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

export default CustomerCarousel;
