/* ═══════════════════════════════════════════════════════════
   CAROUSEL PREVIEWS
   16 unique mini-website previews designed for the hero
   carousel on the Website Examples page. Each represents a
   different industry with its own modern professional look.
   Rendered at ~320x220, so use compact scale (fontSize 6–11,
   tight spacing). Previews match the visual language of the
   ShowcaseGrid previews but cover different verticals.
   ═══════════════════════════════════════════════════════════ */

const F = { sans: "'Plus Jakarta Sans', sans-serif", serif: "'Instrument Serif', Georgia, serif" };

/* ── Shared Unsplash hero imagery (industry-appropriate) ── */
const imgDental = 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80';
const imgFitness = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';
const imgRealEstate = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
const imgFlorist = 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80';
const imgYoga = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80';
const imgLaw = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
const imgBooks = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80';
const imgAgency = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
const imgJewelry = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';
const imgWine = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80';
const imgPet = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80';
const imgAuto = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
const imgPilates = 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80';
const imgHotel = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
const imgPhoto = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80';
const imgAccounting = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80';

/* ───── 1. CLARITY DENTAL — light, clinical, modern blue ───── */
export function ClarityDentalPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F4F7FB', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(30,58,95,0.08)' }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: '#1E3A5F' }}>CLARITY<span style={{ color: '#60A5FA' }}>.</span></span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Services', 'Team', 'Book'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(30,58,95,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '12px 14px', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 6, letterSpacing: 3, color: '#60A5FA', marginBottom: 4, fontWeight: 700 }}>MODERN DENTAL CARE</div>
          <div style={{ fontSize: 16, fontWeight: 300, color: '#0B2342', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>A reason to<br/>smile.</div>
          <div style={{ fontSize: 6, color: 'rgba(30,58,95,0.55)', lineHeight: 1.6, marginBottom: 8 }}>Gentle, precise care from a team that actually listens.</div>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 50, background: '#1E3A5F', fontSize: 6, fontWeight: 700, color: '#fff' }}>Book Visit</div>
        </div>
        <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={imgDental} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 12px' }}>
        {[{ l: 'Whitening', p: '$299' }, { l: 'Invisalign', p: '$2,800' }, { l: 'Cleaning', p: '$120' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 6, border: '1px solid rgba(30,58,95,0.06)' }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#0B2342' }}>{s.l}</div>
            <div style={{ fontSize: 6, color: '#60A5FA', marginTop: 1 }}>{s.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── 2. APEX — dark, cyan-accented training studio ───── */
export function ApexFitnessPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1620', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={imgFitness} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, color: '#67E8F9' }}>APEX/</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Train', 'Classes', 'Coaches', 'Join'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px' }}>
          <div style={{ fontSize: 6, letterSpacing: 4, color: '#67E8F9', marginBottom: 6, fontWeight: 700 }}>STRENGTH + CONDITIONING</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.8, lineHeight: 1, marginBottom: 6 }}>BUILT<br/>FOR MORE.</div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 170, marginBottom: 10 }}>Small group training with coaches who've been in your shoes.</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ padding: '5px 14px', borderRadius: 4, background: '#67E8F9', fontSize: 6, fontWeight: 800, color: '#0B1620', letterSpacing: 1 }}>START FREE</div>
            <div style={{ padding: '5px 14px', borderRadius: 4, border: '1px solid rgba(103,232,249,0.3)', fontSize: 6, fontWeight: 700, color: '#67E8F9', letterSpacing: 1 }}>CLASSES</div>
          </div>
        </div>
        <div style={{ display: 'flex', padding: '8px 14px 10px', gap: 0, background: 'rgba(11,22,32,0.82)', backdropFilter: 'blur(6px)', borderTop: '1px solid rgba(103,232,249,0.15)' }}>
          {[{ n: '240+', l: 'MEMBERS' }, { n: '18', l: 'CLASSES/WK' }, { n: '4.9★', l: 'RATING' }].map(s => (
            <div key={s.l} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#67E8F9' }}>{s.n}</div>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 3. MERIDIAN — warm neutral real estate ───── */
export function MeridianRealtyPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F2EDE6', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: 4, color: '#1A1A1A', fontFamily: F.serif, fontStyle: 'italic' }}>Meridian</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Listings', 'Sell', 'Agents'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(0,0,0,0.45)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ position: 'relative', height: '42%', overflow: 'hidden' }}>
        <img src={imgRealEstate} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', left: 10, bottom: 8, padding: '4px 8px', background: 'rgba(255,255,255,0.95)', borderRadius: 4, fontSize: 6, fontWeight: 700, color: '#1A1A1A' }}>
          $2.4M · 4BR · Brooklyn
        </div>
      </div>
      <div style={{ padding: '8px 14px 10px' }}>
        <div style={{ fontSize: 6, letterSpacing: 3, color: 'rgba(0,0,0,0.35)', marginBottom: 3, fontWeight: 600 }}>CURATED PROPERTIES</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: '#1A1A1A', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Homes with<br/>character.</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ c: 'Brooklyn', n: 42 }, { c: 'Queens', n: 28 }, { c: 'Manhattan', n: 19 }].map(s => (
            <div key={s.c} style={{ flex: 1, padding: '4px 6px', background: '#fff', borderRadius: 5, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: '#1A1A1A' }}>{s.c}</div>
              <div style={{ fontSize: 5, color: 'rgba(0,0,0,0.4)' }}>{s.n} homes</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 4. BLOOM — pastel florist ───── */
export function BloomFloristPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FBF3F6', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
        <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: 3, color: '#B13F6E', fontFamily: F.serif, fontStyle: 'italic' }}>bloom &amp; co.</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Shop', 'Events', 'Visit'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(177,63,110,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 14px 10px', gap: 8, alignItems: 'stretch' }}>
        <div style={{ flex: 1.1, padding: '6px 0' }}>
          <div style={{ fontSize: 6, letterSpacing: 3, color: '#B13F6E', fontWeight: 700, marginBottom: 4 }}>SEASONAL · SPRING '26</div>
          <div style={{ fontSize: 18, fontWeight: 300, color: '#5E1E38', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Fresh<br/>every day.</div>
          <div style={{ fontSize: 6, color: 'rgba(94,30,56,0.55)', lineHeight: 1.6, marginBottom: 8 }}>Locally sourced stems, arranged by hand.</div>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 50, background: '#B13F6E', fontSize: 6, fontWeight: 700, color: '#fff' }}>Shop Bouquets</div>
        </div>
        <div style={{ width: 100, borderRadius: 10, overflow: 'hidden' }}>
          <img src={imgFlorist} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ display: 'flex', padding: '8px 14px', gap: 6, borderTop: '1px solid rgba(177,63,110,0.08)' }}>
        {[{ n: 'Peony', p: '$42' }, { n: 'Ranunculus', p: '$36' }, { n: 'Garden', p: '$58' }].map(x => (
          <div key={x.n} style={{ flex: 1, fontSize: 6 }}>
            <div style={{ fontWeight: 700, color: '#5E1E38' }}>{x.n}</div>
            <div style={{ color: '#B13F6E' }}>{x.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── 5. ROAST & RITUAL — dark specialty coffee ───── */
export function RoastRitualPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1F1612', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#E0A370' }}>ROAST &amp; RITUAL</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Beans', 'Brew', 'Visit'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding: '6px 14px 10px' }}>
        <div style={{ fontSize: 6, letterSpacing: 4, color: '#E0A370', marginBottom: 6, fontWeight: 700 }}>SMALL BATCH · ROASTED WEEKLY</div>
        <div style={{ fontSize: 22, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>A slow ritual,<br/>one cup at a time.</div>
      </div>
      <div style={{ display: 'flex', padding: '0 14px 10px', gap: 6 }}>
        {[
          { n: 'Ethiopia Yirgacheffe', note: 'Blueberry · Jasmine', p: '$24' },
          { n: 'Colombia Huila', note: 'Caramel · Stone fruit', p: '$22' },
          { n: 'House Blend', note: 'Cocoa · Hazelnut', p: '$18' },
        ].map(c => (
          <div key={c.n} style={{ flex: 1, background: 'rgba(224,163,112,0.06)', border: '1px solid rgba(224,163,112,0.12)', borderRadius: 8, padding: 6 }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.n}</div>
            <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{c.note}</div>
            <div style={{ fontSize: 6, color: '#E0A370', fontWeight: 700 }}>{c.p}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '8px 14px 10px', gap: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '4px 12px', borderRadius: 50, background: '#E0A370', fontSize: 6, fontWeight: 800, color: '#1F1612' }}>Shop beans</div>
        <div style={{ padding: '4px 12px', borderRadius: 50, border: '1px solid rgba(224,163,112,0.3)', fontSize: 6, fontWeight: 700, color: '#E0A370' }}>Subscribe</div>
      </div>
    </div>
  );
}

/* ───── 6. STILL — minimal yoga / meditation studio ───── */
export function StillYogaPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#E9E3D8', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={imgYoga} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(233,227,216,0.35), rgba(233,227,216,0.85))' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 300, letterSpacing: 8, color: '#3B3527', fontFamily: F.serif, fontStyle: 'italic' }}>still.</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Classes', 'Teachers', 'Join'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(59,53,39,0.5)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 6, letterSpacing: 5, color: '#8A7A5A', marginBottom: 8, fontWeight: 600 }}>YOGA · BREATHWORK · REST</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: '#3B3527', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 8 }}>Come as<br/>you are.</div>
          <div style={{ fontSize: 6, color: 'rgba(59,53,39,0.55)', lineHeight: 1.6, maxWidth: 150, marginBottom: 10 }}>Small, warm classes in a space built for slowing down.</div>
          <div style={{ padding: '5px 16px', borderRadius: 50, border: '1px solid #3B3527', fontSize: 6, fontWeight: 700, color: '#3B3527', letterSpacing: 1 }}>Book a Class</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '8px 14px 10px' }}>
          {['Vinyasa', 'Yin', 'Restorative', 'Breathwork'].map(x => (
            <span key={x} style={{ fontSize: 5, letterSpacing: 2, color: 'rgba(59,53,39,0.45)', fontWeight: 600 }}>{x}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 7. HARGROVE — serif law firm ───── */
export function HargroveLawPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0D1418', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: 5, color: '#D4B886', fontFamily: F.serif, fontStyle: 'italic' }}>Hargrove &amp; Vale</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Practice', 'Attorneys', 'Contact'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '12px 14px', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 5, letterSpacing: 4, color: '#D4B886', marginBottom: 6, fontWeight: 700 }}>CORPORATE · LITIGATION · TAX</div>
          <div style={{ fontSize: 17, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>Counsel,<br/>not just advice.</div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 8 }}>Three decades representing founders, funds, and family offices.</div>
          <div style={{ display: 'inline-block', padding: '4px 12px', border: '1px solid #D4B886', fontSize: 6, fontWeight: 700, color: '#D4B886', letterSpacing: 1 }}>SCHEDULE CONSULT</div>
        </div>
        <div style={{ width: 90, display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          {[{ n: '32', l: 'YRS' }, { n: '$4B+', l: 'IN DEALS' }, { n: '92%', l: 'RETAIN' }].map(s => (
            <div key={s.l} style={{ flex: 1, padding: '5px 8px', borderLeft: '2px solid #D4B886' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{s.n}</div>
              <div style={{ fontSize: 5, color: 'rgba(212,184,134,0.7)', letterSpacing: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 8. LEDGER — bookstore ───── */
export function LedgerBooksPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FDF9F1', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: '#2E1A0F' }}>LEDGER BOOKS</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Shop', 'Events', 'Staff Picks'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(46,26,15,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding: '10px 14px 8px' }}>
        <div style={{ fontSize: 6, letterSpacing: 3, color: '#B56B3B', marginBottom: 4, fontWeight: 700 }}>STAFF PICKS · APRIL</div>
        <div style={{ fontSize: 18, fontWeight: 300, color: '#2E1A0F', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 8 }}>Well-read is<br/>well-lived.</div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px' }}>
        {[
          { t: 'On Marrow', a: 'L. Halden', c: '#8B3A2B' },
          { t: 'Field Notes', a: 'R. Ocampo', c: '#2E4A3A' },
          { t: 'The Archive', a: 'K. Sato', c: '#3A2E5E' },
          { t: 'Small Moons', a: 'J. Park', c: '#B56B3B' },
        ].map(b => (
          <div key={b.t} style={{ flex: 1 }}>
            <div style={{ aspectRatio: '3/4', background: b.c, borderRadius: 3, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 5, fontWeight: 800, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1 }}>{b.t}</div>
            </div>
            <div style={{ fontSize: 5, color: 'rgba(46,26,15,0.6)', marginTop: 3 }}>{b.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── 9. FORM — creative agency ───── */
export function FormAgencyPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0E0E10', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ position: 'absolute', width: 120, height: 120, left: -20, top: -20, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #FF5E3A, #B53FFF 60%, transparent 75%)', filter: 'blur(20px)', opacity: 0.65 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 4, color: '#fff' }}>FORM®</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Work', 'Studio', 'Journal'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px' }}>
          <div style={{ fontSize: 6, letterSpacing: 4, color: '#FF5E3A', marginBottom: 6, fontWeight: 700 }}>BRAND · DIGITAL · MOTION</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 0.95, marginBottom: 8 }}>We make<br/><span style={{ background: 'linear-gradient(90deg,#FF5E3A,#B53FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>brands move.</span></div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 190, marginBottom: 10 }}>An independent studio partnering with ambitious teams from Series A to IPO.</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ padding: '5px 12px', borderRadius: 50, background: '#fff', fontSize: 6, fontWeight: 800, color: '#0E0E10' }}>See work</div>
            <div style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.25)', fontSize: 6, fontWeight: 700, color: '#fff' }}>Start a project</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {['Linear', 'Pitch', 'Stripe', 'Arc', 'Vercel'].map(c => (
            <span key={c} style={{ fontSize: 6, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, fontWeight: 700 }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 10. ORBIT — fine jewelry ───── */
export function OrbitJewelryPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAF8F4', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: 6, color: '#1A1A1A' }}>ORBIT</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Rings', 'Necklaces', 'Bespoke'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(0,0,0,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ position: 'relative', height: '40%', overflow: 'hidden' }}>
        <img src={imgJewelry} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, #FAF8F4 100%)' }} />
      </div>
      <div style={{ padding: '6px 14px 10px' }}>
        <div style={{ fontSize: 5, letterSpacing: 4, color: '#B08A4E', marginBottom: 3, fontWeight: 700 }}>NEW · THE ECLIPSE COLLECTION</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: '#1A1A1A', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Made to<br/>be remembered.</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ n: 'Eclipse Ring', p: '$1,850' }, { n: 'Luna Band', p: '$920' }, { n: 'Meridian Chain', p: '$1,240' }].map(x => (
            <div key={x.n} style={{ flex: 1, padding: '4px 6px', background: '#fff', borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: '#1A1A1A' }}>{x.n}</div>
              <div style={{ fontSize: 5, color: '#B08A4E', marginTop: 1 }}>{x.p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 11. CASK — natural wine bar ───── */
export function CaskWinePreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#2A0F18', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={imgWine} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(42,15,24,0.3) 0%, rgba(42,15,24,0.85) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 300, letterSpacing: 5, color: '#E9A6B8', fontFamily: F.serif, fontStyle: 'italic' }}>cask.</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['List', 'Food', 'Reserve'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px' }}>
          <div style={{ fontSize: 6, letterSpacing: 4, color: '#E9A6B8', marginBottom: 6, fontWeight: 700 }}>NATURAL WINE · SMALL PLATES</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Bottles with<br/>opinions.</div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 180, marginBottom: 10 }}>A rotating list of 80+ low-intervention producers, pulled fresh every Tuesday.</div>
          <div style={{ padding: '5px 14px', borderRadius: 50, border: '1px solid #E9A6B8', fontSize: 6, fontWeight: 700, color: '#E9A6B8', letterSpacing: 1, display: 'inline-block', width: 'fit-content' }}>Book a Table</div>
        </div>
        <div style={{ display: 'flex', padding: '8px 14px 10px', gap: 6, background: 'rgba(42,15,24,0.7)', backdropFilter: 'blur(6px)', borderTop: '1px solid rgba(233,166,184,0.18)' }}>
          {[{ n: "Jura '22", v: 'Ganevat', p: '$14' }, { n: "Etna '21", v: 'Cornelissen', p: '$17' }, { n: "Loire '23", v: 'Brendan Tracey', p: '$12' }].map(w => (
            <div key={w.n} style={{ flex: 1, fontSize: 6 }}>
              <div style={{ fontWeight: 700, color: '#fff' }}>{w.n}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>{w.v}</div>
              <div style={{ color: '#E9A6B8', marginTop: 1 }}>{w.p} / gls</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 12. PAWS & CO — friendly pet clinic ───── */
export function PawsClinicPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#EFF7F3', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#0E5E42' }}>PAWS &amp; CO<span style={{ color: '#30C090' }}>.</span></span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Services', 'Adopt', 'Book'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(14,94,66,0.55)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 14px 10px', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 6, letterSpacing: 3, color: '#30C090', marginBottom: 4, fontWeight: 700 }}>VETERINARY CARE, REIMAGINED</div>
          <div style={{ fontSize: 17, fontWeight: 300, color: '#0E5E42', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>Loved like<br/>family.</div>
          <div style={{ fontSize: 6, color: 'rgba(14,94,66,0.6)', lineHeight: 1.6, marginBottom: 8 }}>Same-day checkups, open evenings, transparent pricing.</div>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 50, background: '#0E5E42', fontSize: 6, fontWeight: 700, color: '#fff' }}>Book Checkup</div>
        </div>
        <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={imgPet} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px' }}>
        {[{ l: 'Wellness', p: 'from $45' }, { l: 'Dental', p: 'from $120' }, { l: 'Surgery', p: 'from $450' }].map(s => (
          <div key={s.l} style={{ flex: 1, padding: '5px 6px', background: '#fff', borderRadius: 6, border: '1px solid rgba(14,94,66,0.08)' }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#0E5E42' }}>{s.l}</div>
            <div style={{ fontSize: 6, color: '#30C090', marginTop: 1 }}>{s.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── 13. IRON & WAX — auto detailing ───── */
export function IronWaxDetailPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0F0F10', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={imgAuto} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, color: '#FFD93A' }}>IRON &amp; WAX</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Services', 'Packages', 'Book'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px' }}>
          <div style={{ fontSize: 6, letterSpacing: 4, color: '#FFD93A', marginBottom: 6, fontWeight: 700 }}>PREMIUM DETAILING · CERAMIC · PPF</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.8, lineHeight: 0.95, marginBottom: 6 }}>SHOWROOM<br/>SHINE. DAILY.</div>
          <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 180, marginBottom: 10 }}>Ceramic coatings, paint correction, and interior restoration — mobile or in-bay.</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ padding: '5px 14px', borderRadius: 4, background: '#FFD93A', fontSize: 6, fontWeight: 900, color: '#0F0F10', letterSpacing: 1 }}>GET QUOTE</div>
            <div style={{ padding: '5px 14px', borderRadius: 4, border: '1px solid rgba(255,217,58,0.35)', fontSize: 6, fontWeight: 800, color: '#FFD93A', letterSpacing: 1 }}>PACKAGES</div>
          </div>
        </div>
        <div style={{ display: 'flex', padding: '8px 14px 10px', gap: 6, background: 'rgba(15,15,16,0.82)', backdropFilter: 'blur(6px)', borderTop: '1px solid rgba(255,217,58,0.2)' }}>
          {[{ n: 'Essential', p: '$180' }, { n: 'Paint Correction', p: '$650' }, { n: 'Ceramic 5yr', p: '$1,400' }].map(p => (
            <div key={p.n} style={{ flex: 1, fontSize: 6 }}>
              <div style={{ fontWeight: 700, color: '#fff' }}>{p.n}</div>
              <div style={{ color: '#FFD93A', marginTop: 1 }}>{p.p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── 14. RESET — pilates studio ───── */
export function ResetPilatesPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F3EFEA', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 5, color: '#2E2A24' }}>RESET —</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Classes', 'Coaches', 'Start'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(46,42,36,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 14px 10px', gap: 10 }}>
        <div style={{ flex: 1.1, padding: '6px 0' }}>
          <div style={{ fontSize: 6, letterSpacing: 3, color: '#C2715B', marginBottom: 4, fontWeight: 700 }}>REFORMER · MAT · PRIVATES</div>
          <div style={{ fontSize: 19, fontWeight: 300, color: '#2E2A24', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Move<br/>with intention.</div>
          <div style={{ fontSize: 6, color: 'rgba(46,42,36,0.55)', lineHeight: 1.6, marginBottom: 8 }}>Six-person classes. Zero choreography. All results.</div>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 2, background: '#2E2A24', fontSize: 6, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>INTRO · 3 FOR $60</div>
        </div>
        <div style={{ width: 90, borderRadius: 10, overflow: 'hidden' }}>
          <img src={imgPilates} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ padding: '8px 14px 10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6 }}>
          <div style={{ color: 'rgba(46,42,36,0.5)', letterSpacing: 1.5, fontWeight: 600 }}>MON</div>
          <div style={{ color: 'rgba(46,42,36,0.5)', letterSpacing: 1.5, fontWeight: 600 }}>TUE</div>
          <div style={{ color: '#C2715B', letterSpacing: 1.5, fontWeight: 700 }}>WED · 6A · 9A · 5P</div>
          <div style={{ color: 'rgba(46,42,36,0.5)', letterSpacing: 1.5, fontWeight: 600 }}>THU</div>
          <div style={{ color: 'rgba(46,42,36,0.5)', letterSpacing: 1.5, fontWeight: 600 }}>FRI</div>
        </div>
      </div>
    </div>
  );
}

/* ───── 15. NORDEN — boutique hotel ───── */
export function NordenHotelPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#141618', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={imgHotel} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,22,24,0.2) 0%, rgba(20,22,24,0.9) 85%)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
          <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: 6, color: '#E7DFD2', fontFamily: F.serif, fontStyle: 'italic' }}>Norden</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Rooms', 'Dine', 'Stay'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(231,223,210,0.55)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 14px 12px' }}>
          <div style={{ fontSize: 6, letterSpacing: 5, color: '#E7DFD2', marginBottom: 6, fontWeight: 600 }}>BOUTIQUE HOTEL · OSLO</div>
          <div style={{ fontSize: 24, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1, marginBottom: 8 }}>Quiet luxury,<br/>at the water's edge.</div>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: 6, backdropFilter: 'blur(8px)' }}>
            <div style={{ flex: 1, padding: '0 4px' }}>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>CHECK IN</div>
              <div style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>Fri · May 8</div>
            </div>
            <div style={{ flex: 1, padding: '0 4px', borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>CHECK OUT</div>
              <div style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>Sun · May 10</div>
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 3, background: '#E7DFD2', fontSize: 6, fontWeight: 800, color: '#141618', letterSpacing: 1, display: 'flex', alignItems: 'center' }}>SEARCH</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── 16. FRAME — photography studio ───── */
export function FrameStudioPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FFFFFF', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 4, color: '#111' }}>FRAME·STUDIO</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Work', 'Clients', 'Book'].map(n => <span key={n} style={{ fontSize: 6, color: 'rgba(0,0,0,0.45)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding: '8px 14px 6px' }}>
        <div style={{ fontSize: 6, letterSpacing: 3, color: 'rgba(0,0,0,0.4)', marginBottom: 3, fontWeight: 600 }}>EDITORIAL · PORTRAIT · COMMERCIAL</div>
        <div style={{ fontSize: 16, fontWeight: 300, color: '#111', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.05, marginBottom: 6 }}>Seeing is<br/>the work.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4, padding: '0 14px 10px', height: 80 }}>
        <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <img src={imgPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', left: 6, bottom: 5, fontSize: 5, color: '#fff', letterSpacing: 1, fontWeight: 700 }}>VOGUE · 03/26</div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
          <div style={{ background: 'linear-gradient(135deg, #222, #555)', borderRadius: 4 }} />
          <div style={{ background: 'linear-gradient(135deg, #C0A47A, #E6D5B3)', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6 }}>
        {['Vogue', 'NYT Mag', 'Apple', 'Hermès', 'Aesop'].map(c => (
          <span key={c} style={{ fontSize: 5, color: 'rgba(0,0,0,0.4)', letterSpacing: 2, fontWeight: 700 }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

/* ───── REGISTRY ───── */
export type CarouselSite = { name: string; type: string; accent: string; preview: React.FC };

export const CAROUSEL_PREVIEWS: CarouselSite[] = [
  { name: 'Clarity Dental',     type: 'Dental Studio',      accent: '#60A5FA', preview: ClarityDentalPreview },
  { name: 'Apex Fitness',       type: 'Training Studio',    accent: '#67E8F9', preview: ApexFitnessPreview },
  { name: 'Meridian Realty',    type: 'Real Estate',        accent: '#C8A87A', preview: MeridianRealtyPreview },
  { name: 'Bloom & Co.',        type: 'Florist',            accent: '#B13F6E', preview: BloomFloristPreview },
  { name: 'Roast & Ritual',     type: 'Specialty Coffee',   accent: '#E0A370', preview: RoastRitualPreview },
  { name: 'Still',              type: 'Yoga Studio',        accent: '#8A7A5A', preview: StillYogaPreview },
  { name: 'Hargrove & Vale',    type: 'Law Firm',           accent: '#D4B886', preview: HargroveLawPreview },
  { name: 'Ledger Books',       type: 'Bookstore',          accent: '#B56B3B', preview: LedgerBooksPreview },
  { name: 'Form®',              type: 'Creative Agency',    accent: '#FF5E3A', preview: FormAgencyPreview },
  { name: 'Orbit',              type: 'Fine Jewelry',       accent: '#B08A4E', preview: OrbitJewelryPreview },
  { name: 'Cask',               type: 'Natural Wine Bar',   accent: '#E9A6B8', preview: CaskWinePreview },
  { name: 'Paws & Co.',         type: 'Pet Clinic',         accent: '#30C090', preview: PawsClinicPreview },
  { name: 'Iron & Wax',         type: 'Auto Detailing',     accent: '#FFD93A', preview: IronWaxDetailPreview },
  { name: 'Reset',              type: 'Pilates Studio',     accent: '#C2715B', preview: ResetPilatesPreview },
  { name: 'Norden',             type: 'Boutique Hotel',     accent: '#E7DFD2', preview: NordenHotelPreview },
  { name: 'Frame Studio',       type: 'Photography',        accent: '#111111', preview: FrameStudioPreview },
];
