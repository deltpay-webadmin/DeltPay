/* =========================================================
   DeltPay UI Refinements — patch.js
   Companion to patch.css. Handles DOM-level fixes that can't
   be expressed in CSS alone. Layout-preserving.
   ========================================================= */
(function () {
  const LOG = (...a) => console.log('[delt-patch]', ...a);

  // ---------- R2: Title + meta rewrite ----------
  document.title = 'DeltPay — Payments, website, and capital in one dashboard';
  const setMeta = (name, content, isProperty) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('description', 'One dashboard for accepting payments, launching your website, and accessing capital — powered by AI that learns your business.');
  setMeta('og:title', 'DeltPay — Payments, website, and capital in one dashboard', true);
  setMeta('og:description', 'Fewer tools. More money. Less stress. Trusted by 10,000+ businesses.', true);

  // ---------- R3: reinforce the Business Funding visual ----------
  // The original site DOES have an image for this section
  // (alt="Business Funding", /assets/…Lm2FlDoj.png), but it can render with
  // opacity:0 due to a scroll-linked animation that doesn't always fire on
  // initial paint. We non-destructively force-visible the image and add a
  // lightweight fallback card only if the image never becomes visible.
  (function reinforceBusinessFundingPanel() {
    const fundingImg = document.querySelector('.fs-img-stage img[alt="Business Funding"]');
    if (fundingImg) {
      // Make sure the image renders even if the scroll observer hasn't fired yet.
      // We set a CSS class that patch.css promotes to opacity:1 when active.
      fundingImg.setAttribute('data-delt-ensured', '1');
    }
    // Do NOT inject a fallback card into the shared sticky side — it would
    // appear against every feature row. The CSS rule in patch.css keeps the
    // image visible; that's the correct non-destructive fix.
    LOG('R3 applied: funding image visibility reinforced');
    return;

    // --- Unreachable fallback block kept for reference -------------------
    const bfH2 = Array.from(document.querySelectorAll('h2'))
      .find(el => el.textContent.trim().startsWith('Capital waiting'));
    if (!bfH2) return;
    const scrollContainer = bfH2.closest('.fs-scroll-container');
    if (!scrollContainer) return;
    const side = scrollContainer.querySelector('.fs-sticky-side');
    if (!side) return;
    if (side.querySelector('[data-delt-funding-card]')) return;
    const card = document.createElement('div');
    card.setAttribute('data-delt-funding-card', '1');
    card.style.cssText = [
      'background:#fff',
      'border:1px solid #E5E7EB',
      'border-radius:20px',
      'box-shadow:0 12px 28px rgba(4,30,66,.08)',
      'padding:20px',
      'width:min(440px,92%)',
      'margin:auto',
      'font-family:"Plus Jakarta Sans",sans-serif',
      'color:#0F172A'
    ].join(';');
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#64748B;font-weight:500;">
          <span style="width:8px;height:8px;border-radius:50%;background:#16C784;display:inline-block;"></span>
          Capital Offer
        </div>
        <span style="font:600 11px/1 'JetBrains Mono',monospace;letter-spacing:.12em;color:#16C784;text-transform:uppercase;">Approved</span>
      </div>
      <div style="font-size:13px;color:#64748B;margin-bottom:6px;">Pre-qualified offer</div>
      <div style="font:700 36px/1.1 'Plus Jakarta Sans',sans-serif;color:#041E42;letter-spacing:-0.02em;">$45,000</div>
      <div style="font-size:13px;color:#334155;margin-top:6px;">Based on last 90 days of revenue</div>
      <div style="height:1px;background:#E5E7EB;margin:16px 0;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
        <div><div style="color:#64748B;margin-bottom:2px;">Funded in</div><div style="font-weight:600;color:#0F172A;">Under 48h</div></div>
        <div><div style="color:#64748B;margin-bottom:2px;">Repayment</div><div style="font-weight:600;color:#0F172A;">Flexes with sales</div></div>
      </div>
      <button style="margin-top:16px;width:100%;background:#4945FF;color:#fff;border:0;border-radius:999px;padding:12px;font:600 15px 'Plus Jakarta Sans',sans-serif;cursor:pointer;">Accept offer →</button>
    `;
    // (unreachable) previously cleared sticky side and appended card.
  })();

  // ---------- R8: inline email capture in hero ----------
  (function addHeroCapture() {
    // Find primary "Get Started" CTA in hero
    const ctas = Array.from(document.querySelectorAll('.ih-section a, .ih-section button'));
    const primary = ctas.find(a => /get started/i.test(a.textContent));
    if (!primary) return;
    if (primary.parentElement.querySelector('.delt-capture')) return;

    const wrap = document.createElement('div');
    wrap.className = 'delt-capture';
    wrap.innerHTML = `
      <input type="email" placeholder="your@email.com" aria-label="Email address" />
      <button type="button">Get Started →</button>
    `;
    // Insert before the primary CTA and hide the primary (but keep the secondary visible)
    primary.parentElement.insertBefore(wrap, primary);
    primary.style.display = 'none';
    LOG('R8 applied: hero email capture inserted');
  })();

  // ---------- R11: refresh trust strip label ----------
  (function trustLabel() {
    const label = document.querySelector('.ih-trust-label');
    if (label) label.textContent = 'Powering merchants across restaurants, retail, fitness & services';
  })();

  // ---------- R12: add a green outcome chip above testimonial ----------
  (function testimonialChip() {
    const quote = Array.from(document.querySelectorAll('*')).find(el =>
      (el.textContent || '').includes('Delt replaced three different tools') && el.children.length < 10);
    if (!quote) return;
    const container = quote.closest('section') || quote.parentElement;
    if (!container) return;
    if (container.querySelector('[data-delt-chip]')) return;
    const chip = document.createElement('div');
    chip.setAttribute('data-delt-chip', '1');
    chip.style.cssText = [
      'display:inline-flex','align-items:center','gap:6px',
      'background:rgba(22,199,132,.12)','color:#0E8C5C',
      'font:600 13px/1 "Plus Jakarta Sans",sans-serif',
      'padding:6px 12px','border-radius:999px',
      'margin:0 auto 16px','width:fit-content'
    ].join(';');
    chip.innerHTML = '↗ 3 tools replaced · 1 login';
    // insert above the quote's parent paragraph block
    const anchor = quote.parentElement;
    anchor.parentElement.insertBefore(chip, anchor);
    LOG('R12 applied: testimonial chip inserted');
  })();

  // ---------- R15: stats footnote ----------
  (function statsFootnote() {
    const statsSec = document.querySelector('.btn-section');
    if (!statsSec) return;
    if (statsSec.querySelector('[data-delt-footnote]')) return;
    // Append small footnote after the stats strip
    const fn = document.createElement('div');
    fn.setAttribute('data-delt-footnote', '1');
    fn.style.cssText = 'font:400 11px/1.5 "Plus Jakarta Sans",sans-serif;color:rgba(255,255,255,.55);text-align:center;margin-top:12px;letter-spacing:.02em;';
    fn.innerHTML = '¹ Figures reflect aggregated merchant outcomes across 2024–2025. Individual results vary.';
    // place near the top stats block
    const statsRow = statsSec.querySelector('[class*="btn-stats"], [class*="stats"]') || statsSec.firstElementChild;
    if (statsRow && statsRow.parentElement) statsRow.parentElement.insertBefore(fn, statsRow.nextSibling);
    LOG('R15 applied: footnote appended');
  })();

  LOG('All patches applied');
})();
