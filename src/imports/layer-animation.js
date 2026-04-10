/**
 * DELT WEBSITE BUILDER — LAYER ANIMATION
 * 
 * 6 layers animate in two groups of 3, triggered by scroll.
 * Bottom 3 come in first (Always on → Your brand → Customers find you)
 * Top 3 come in on continued scroll (Looks like agency → Get paid → Live in days)
 * 
 * Each layer slides up from below with staggered delay within its group,
 * fades in, and settles into position. The active/expanded layer gets
 * a glow border and expanded content.
 * 
 * Uses: import { animate } from 'animejs'
 */

import { animate } from 'animejs';

// ─────────────────────────────────────
// CONFIG
// ─────────────────────────────────────

const LAYERS = [
  { id: 'layer-01', num: '01', title: 'Always on.', icon: '○', desc: '99.9% uptime. Bank-grade security. The foundation you never think about — because you never have to.' },
  { id: 'layer-02', num: '02', title: 'Your brand, your domain.', icon: '⊕', desc: 'yourbusiness.com — not yourname.squarespace.com. Your name, your identity, your corner of the internet.' },
  { id: 'layer-03', num: '03', title: 'Customers find you.', icon: 'Q', desc: 'SEO-ready. Mobile-first. Fast on every device. Your site doesn\'t just exist — it works.' },
  { id: 'layer-04', num: '04', title: 'Looks like you hired an agency.', icon: '✦', desc: 'Professional design. Smooth animations. Modern layouts. The site that makes you proud to share the link.' },
  { id: 'layer-05', num: '05', title: 'Get paid on your site.', icon: '▭', desc: 'Accept payments directly. Every transaction builds your Delt profile for better capital terms.' },
  { id: 'layer-06', num: '06', title: 'Live in days, not months.', icon: '⚡', desc: 'Every layer below is impressive — but this is the one that makes you think "I could do this right now."' },
];

// Split into two groups
const GROUP_1 = LAYERS.slice(0, 3); // bottom 3: 01, 02, 03
const GROUP_2 = LAYERS.slice(3, 6); // top 3: 04, 05, 06

// ─────────────────────────────────────
// ANIMATION FUNCTIONS
// ─────────────────────────────────────

/**
 * Animate a group of 3 layers in with stagger.
 * Each layer: translateY from 60px → 0, opacity 0 → 1, staggered by 120ms.
 * The last layer in each group auto-expands (gets the active state).
 */
function animateGroupIn(layerIds, activeIndex) {
  // Reset layers to hidden state
  layerIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(60px)';
    }
  });

  // Staggered entrance — each layer slides up and fades in
  layerIds.forEach((id, i) => {
    animate(`#${id}`, {
      translateY: [60, 0],
      opacity: [0, 1],
      duration: 700,
      delay: i * 150,
      easing: 'easeOutCubic',
    });
  });

  // After all 3 are in, expand the active one
  const activeId = layerIds[activeIndex];
  setTimeout(() => {
    expandLayer(activeId);
  }, layerIds.length * 150 + 400);
}

/**
 * Expand a layer to its active state.
 * - Border glows (box-shadow pulse)
 * - Description text fades in
 * - Dot indicator pulses
 * - Other layers in same group dim slightly
 */
function expandLayer(layerId) {
  const el = document.getElementById(layerId);
  if (!el) return;

  // Add active class for CSS styling
  el.classList.add('layer-active');

  // Glow border animation
  animate(`#${layerId}`, {
    boxShadow: [
      '0 0 0px rgba(91, 63, 228, 0)',
      '0 0 20px rgba(91, 63, 228, 0.3), inset 0 0 20px rgba(91, 63, 228, 0.05)',
    ],
    borderColor: ['rgba(255,255,255,0.08)', 'rgba(91, 63, 228, 0.6)'],
    duration: 600,
    easing: 'easeOutQuad',
  });

  // Description text slides in
  const desc = el.querySelector('.layer-desc');
  if (desc) {
    animate(desc, {
      translateY: [10, 0],
      opacity: [0, 1],
      duration: 500,
      delay: 200,
      easing: 'easeOutCubic',
    });
  }

  // Dot indicator pulse
  const dot = el.querySelector('.layer-dot');
  if (dot) {
    animate(dot, {
      scale: [1, 1.5, 1],
      opacity: [0.5, 1],
      duration: 600,
      easing: 'easeInOutQuad',
    });
  }
}

/**
 * Collapse a layer back to inactive state.
 */
function collapseLayer(layerId) {
  const el = document.getElementById(layerId);
  if (!el) return;

  el.classList.remove('layer-active');

  animate(`#${layerId}`, {
    boxShadow: '0 0 0px rgba(91, 63, 228, 0)',
    borderColor: 'rgba(255,255,255,0.08)',
    duration: 400,
    easing: 'easeOutQuad',
  });

  const desc = el.querySelector('.layer-desc');
  if (desc) {
    animate(desc, {
      opacity: 0,
      duration: 300,
      easing: 'easeOutQuad',
    });
  }
}

// ─────────────────────────────────────
// SCROLL TRIGGER SETUP
// ─────────────────────────────────────

/**
 * Sets up IntersectionObserver-based scroll triggers.
 * 
 * Trigger 1: When the layer stack container enters viewport → animate Group 1
 * Trigger 2: When the midpoint sentinel enters viewport → animate Group 2
 * 
 * Wire this up to two invisible sentinel divs in your HTML:
 *   <div id="scroll-trigger-group1"></div>  (above the stack)
 *   <div id="scroll-trigger-group2"></div>  (between group 1 and group 2)
 */
function initScrollTriggers() {
  let group1Fired = false;
  let group2Fired = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      if (entry.target.id === 'scroll-trigger-group1' && !group1Fired) {
        group1Fired = true;
        const ids = GROUP_1.map(l => l.id);
        animateGroupIn(ids, 2); // Layer 03 is active in first group
      }

      if (entry.target.id === 'scroll-trigger-group2' && !group2Fired) {
        group2Fired = true;

        // Collapse the previously active layer from group 1
        collapseLayer('layer-03');

        const ids = GROUP_2.map(l => l.id);
        animateGroupIn(ids, 2); // Layer 06 is active in second group
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -10% 0px',
  });

  const trigger1 = document.getElementById('scroll-trigger-group1');
  const trigger2 = document.getElementById('scroll-trigger-group2');
  if (trigger1) observer.observe(trigger1);
  if (trigger2) observer.observe(trigger2);
}

// ─────────────────────────────────────
// INTERACTIVE LAYER CLICK
// ─────────────────────────────────────

/**
 * When a merchant clicks/taps any layer, it expands and
 * collapses the previously active one. 
 * Also updates the right-side nav indicator.
 */
let currentActive = null;

function onLayerClick(layerId) {
  if (currentActive === layerId) return;
  
  if (currentActive) {
    collapseLayer(currentActive);
    
    // Dim the nav item
    const prevNav = document.querySelector(`[data-nav="${currentActive}"]`);
    if (prevNav) prevNav.classList.remove('nav-active');
  }

  expandLayer(layerId);
  currentActive = layerId;

  // Highlight the nav item
  const navItem = document.querySelector(`[data-nav="${layerId}"]`);
  if (navItem) navItem.classList.add('nav-active');
}

// ─────────────────────────────────────
// RIGHT-SIDE NAV ANIMATION
// ─────────────────────────────────────

/**
 * The right-side vertical nav (visible in your screenshot)
 * highlights the active layer. When the active layer changes,
 * the nav pill slides to the new position.
 */
function animateNavIndicator(layerId) {
  const navItems = document.querySelectorAll('.layer-nav-item');
  
  navItems.forEach(item => {
    const isActive = item.dataset.nav === layerId;
    
    animate(item, {
      scale: isActive ? 1.05 : 1,
      opacity: isActive ? 1 : 0.5,
      duration: 300,
      easing: 'easeOutQuad',
    });

    // Pill background
    const pill = item.querySelector('.nav-pill');
    if (pill) {
      animate(pill, {
        opacity: isActive ? 1 : 0,
        width: isActive ? '100%' : '0%',
        duration: 350,
        easing: 'easeOutCubic',
      });
    }
  });
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────

/**
 * Call this on DOMContentLoaded or in your framework's mount lifecycle.
 */
export function initLayerAnimations() {
  // Set all layers to initial hidden state
  LAYERS.forEach(layer => {
    const el = document.getElementById(layer.id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(60px)';
    }
  });

  // Wire up scroll triggers
  initScrollTriggers();

  // Wire up click handlers
  LAYERS.forEach(layer => {
    const el = document.getElementById(layer.id);
    if (el) {
      el.addEventListener('click', () => onLayerClick(layer.id));
    }
  });
}

// Auto-init if not in a module context
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayerAnimations);
  } else {
    initLayerAnimations();
  }
}

// ─────────────────────────────────────
// EXPECTED HTML STRUCTURE
// ─────────────────────────────────────

/*
<section class="layer-section">
  <h2>Your site, built layer by layer.</h2>
  <p>Bottom to top. Like a building going up.</p>

  <div class="layer-stack">
    
    <!-- Scroll trigger for group 1 -->
    <div id="scroll-trigger-group1"></div>

    <!-- Layer cards (reversed in DOM so 06 is visually on top) -->
    <div id="layer-06" class="layer-card">
      <div class="layer-icon">⚡</div>
      <span class="layer-num">06</span>
      <h3 class="layer-title">Live in days, not months.</h3>
      <p class="layer-desc">Every layer below is impressive — but this is the one that makes you think "I could do this right now."</p>
      <span class="layer-dot"></span>
    </div>

    <div id="layer-05" class="layer-card">
      <div class="layer-icon">▭</div>
      <span class="layer-num">05</span>
      <h3 class="layer-title">Get paid on your site.</h3>
      <p class="layer-desc">Accept payments directly. Every transaction builds your Delt profile.</p>
      <span class="layer-dot"></span>
    </div>

    <div id="layer-04" class="layer-card">
      <div class="layer-icon">✦</div>
      <span class="layer-num">04</span>
      <h3 class="layer-title">Looks like you hired an agency.</h3>
      <p class="layer-desc">Professional design. Smooth animations. Modern layouts.</p>
      <span class="layer-dot"></span>
    </div>

    <!-- Scroll trigger for group 2 -->
    <div id="scroll-trigger-group2"></div>

    <div id="layer-03" class="layer-card">
      <div class="layer-icon">Q</div>
      <span class="layer-num">03</span>
      <h3 class="layer-title">Customers find you.</h3>
      <p class="layer-desc">SEO-ready. Mobile-first. Fast on every device.</p>
      <span class="layer-dot"></span>
    </div>

    <div id="layer-02" class="layer-card">
      <div class="layer-icon">⊕</div>
      <span class="layer-num">02</span>
      <h3 class="layer-title">Your brand, your domain.</h3>
      <p class="layer-desc">yourbusiness.com — not yourname.squarespace.com.</p>
      <span class="layer-dot"></span>
    </div>

    <div id="layer-01" class="layer-card">
      <div class="layer-icon">○</div>
      <span class="layer-num">01</span>
      <h3 class="layer-title">Always on.</h3>
      <p class="layer-desc">99.9% uptime. Bank-grade security. You'll never think about it.</p>
      <span class="layer-dot"></span>
    </div>

  </div>

  <!-- Right-side nav -->
  <nav class="layer-nav">
    <div class="layer-nav-item" data-nav="layer-06"><span class="nav-pill"></span>Live in days, not months.</div>
    <div class="layer-nav-item" data-nav="layer-05"><span class="nav-pill"></span>Get paid on your site.</div>
    <div class="layer-nav-item" data-nav="layer-04"><span class="nav-pill"></span>Looks like you hired an agency.</div>
    <div class="layer-nav-item" data-nav="layer-03"><span class="nav-pill"></span>Customers find you.</div>
    <div class="layer-nav-item" data-nav="layer-02"><span class="nav-pill"></span>Your brand, your domain.</div>
    <div class="layer-nav-item" data-nav="layer-01"><span class="nav-pill"></span>Always on.</div>
  </nav>
</section>
*/

// ─────────────────────────────────────
// REQUIRED CSS
// ─────────────────────────────────────

/*
.layer-card {
  position: relative;
  padding: 20px 24px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background 0.3s ease;
  will-change: transform, opacity;
}

.layer-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.layer-card.layer-active {
  background: rgba(91, 63, 228, 0.06);
}

.layer-desc {
  opacity: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  margin-top: 6px;
}

.layer-active .layer-desc {
  /* animejs handles the reveal */
}

.layer-dot {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s;
}

.layer-active .layer-dot {
  background: #5B3FE4;
}

.layer-nav-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 16px;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.layer-nav-item.nav-active {
  color: #fff;
}

.nav-pill {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  pointer-events: none;
}
*/

export { LAYERS, GROUP_1, GROUP_2, animateGroupIn, expandLayer, collapseLayer, onLayerClick };