Build an interactive scroll-driven webpage section for Delt's website that visually deconstructs a sample merchant website to reveal all the infrastructure Delt powers behind the scenes. Use anime.js for all animations.
THE CONCEPT:
The user sees what looks like a normal, functioning e-commerce website (a mock storefront). As they scroll down, the website literally breaks apart — layers separate in 3D space, text splits, panels float away — revealing labeled infrastructure layers beneath. Think of it like an exploded diagram of a product, but for a website.
USE THIS ANIME.JS CODE AS THE ANIMATION BASE:
jsimport { createTimeline, splitText, stagger, utils } from 'animejs';
const split = splitText('p', { debug: true });

const showAccessibleClone = createTimeline({
  defaults: { ease: 'inOutQuad' },
})
.add('p', {
  rotateX: 0,
  rotateY: 60
}, 0)
.add(split.words, {
  z: '6rem',
  opacity: .75,
  outlineColor: { from: '#FFF0' },
  duration: 750,
  delay: stagger(40, { from: 'random' })
}, 0)
.init();
Adapt the rotateY, z depth separation, splitText, and stagger patterns to drive the scroll-based deconstruction.
SCROLL SEQUENCE (5 stages tied to scroll position):
Stage 1 — "The Surface" (scroll 0-15%)
Show a polished mock e-commerce site rendered as a flat card/iframe-like element centered on the page. It should look like a real merchant website: nav bar, hero image, product grid, footer. Title above it: "This is what your customers see." Subtitle: "Here's what Delt does underneath."
The mock site sits flat, facing the viewer (rotateX: 0, rotateY: 0, z: 0).
Stage 2 — "The Tilt" (scroll 15-30%)
The mock website card begins to rotate in 3D space (rotateY: 0 → 45deg) and tilt slightly (rotateX: 5deg). A subtle perspective shift reveals it has depth — it's not a flat image, it's a stack of layers. Use ease: 'inOutQuad' matching the reference code.
As it tilts, the heading text on the mock site uses splitText with words: { wrap: 'clip' } — words separate in z-space (z: '2rem' → z: '6rem') with stagger(40, { from: 'random' }) exactly like the reference code. The site visually starts to feel "deconstructed."
Stage 3 — "The Explosion" (scroll 30-55%)
The mock website fully explodes into separate floating layers in 3D space. Each layer slides apart on the Z-axis with different depths, labeled with what Delt handles:

Layer 1 (front, z: 0): "Custom Domain & SSL" — The URL bar / browser chrome separates. Label: "Your brand. Your domain. Auto-provisioned SSL."
Layer 2 (z: -3rem): "Frontend & CDN" — The visible HTML/CSS/images layer. Label: "Global edge delivery. Sub-100ms load times."
Layer 3 (z: -6rem): "Smart Routing" — A translucent layer showing URL paths and route arrows. Label: "Intelligent traffic routing. Zero-downtime deploys."
Layer 4 (z: -9rem): "Payment Processing" — A layer showing a checkout form and card icons. Label: "PCI-DSS Level 1. Tokenized transactions."
Layer 5 (z: -12rem): "Security & DDoS" — A shield/grid layer. Label: "WAF. Rate limiting. Bot detection. Always on."
Layer 6 (z: -15rem, back): "Hosting Infrastructure" — A dark layer with server rack icons. Label: "Auto-scaling. 99.99% uptime. Multi-region redundancy."

Each layer animates in using stagger: delay: stagger(80), with opacity: 0 → 0.85 and z values spreading apart. The labels fade in with splitText word-by-word using the same stagger(40, { from: 'random' }) pattern.
Stage 4 — "The Focus" (scroll 55-80%)
As the user continues scrolling, the exploded layers stay in place but one layer at a time comes "into focus" — it moves forward (z += 4rem), increases to opacity: 1, and scales up slightly (scale: 1.05) while the others dim to opacity: 0.3. The label for the focused layer expands with more detail text that animates in using splitText on the detail paragraph.
The focus order follows layers 1 → 6, each getting ~4% of scroll range.
Stage 5 — "The Reassembly" (scroll 80-100%)
All layers animate back together — z → 0, rotateY → 0, opacity → 1. The mock website reassembles into its original flat form. The final text appears below: "All of this. One platform." with splitText character reveal using chars: { wrap: 'clip', clone: 'bottom' }, staggered from center.
A CTA button fades in: "Start building with Delt →"
SCROLL BINDING:

Use window.addEventListener('scroll', ...) or Intersection Observer to calculate scroll percentage (0-1) within the section
Map scroll position to anime.js timeline progress using timeline.seek(scrollPercent * timeline.duration)
The entire animation is scrubbed by scroll — not auto-playing
Wrap the entire experience in a container with height: 500vh (5x viewport) to give enough scroll runway

THE MOCK WEBSITE SHOULD INCLUDE:

Nav bar with logo placeholder, "Shop", "About", "Cart" links
Hero section with a product image area and "New Arrivals" text
3-column product grid with placeholder cards (image, name, price)
A mini footer

STYLING CONSTRAINTS:

Background: #0a1628 (Delt dark navy)
Accent color: #4945ff (Electric Indigo)
Layer labels: white text, Inter font, small caps
Layer cards: slight border rgba(73,69,255,0.15), subtle backdrop blur
The mock website uses light theme (white bg) to contrast against the dark Delt background
All 3D transforms need perspective: 1200px on the parent container
Use transform-style: preserve-3d on the layer stack

IMPORTANT:

The animation should feel premium and smooth — no jank, no sudden jumps
Every text animation uses anime.js splitText and stagger patterns from the reference code
The scroll experience should work on mobile (simplify to opacity/translateY transitions if no 3D support)
Don't change any Delt branding — use their exact colors and Inter font
The section should be self-contained and droppable into an existing page