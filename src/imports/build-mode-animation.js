import { createTimeline, splitText, stagger, utils } from 'animejs';

const [ $button ] = utils.$('#toggle');

// Split the paragraph into words so it can “assemble” like a page being built.
const split = splitText('#copy', { debug: false });
const $target = split.$target;

// Create an accessible clone overlay (like your example)
// so the text remains readable and selectable in “build mode”.
const $accessible = $target.cloneNode(true);
$accessible.setAttribute('aria-hidden', 'false');
$accessible.classList.add('accessible-clone');

// Make sure clone is in the same stacking context.
$target.parentNode.insertBefore($accessible, $target.nextSibling);

// Style the clone similarly to your original snippet.
$accessible.style.cssText = `
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  color: rgba(246,248,255,.95);
`;

// Also keep the original paragraph positioned for overlay.
$target.style.position = 'relative';

// Animation: “Build Mode”
// - Accessible clone fades in (stays readable)
// - Original paragraph tilts slightly (3D)
// - Words pop forward in staggered sequence (like assembly)
const showBuildMode = createTimeline({
  defaults: { ease: 'inOutQuad' },
})
.add($accessible, {
  opacity: 1,
  z: '-2rem',
  duration: 450,
}, 0)
.add('#copy', {
  rotateX: 0,
  rotateY: 18,
  duration: 450,
}, 0)
.add(split.words, {
  z: '5rem',
  opacity: 0.85,
  duration: 750,
  delay: stagger(35, { from: 'center' }),
}, 0)
.init();

const toggleBuildMode = () => {
  const pressed = $button.getAttribute('aria-pressed') === 'true';
  $button.setAttribute('aria-pressed', String(!pressed));
  $button.textContent = pressed ? 'Preview Build Mode' : 'Exit Build Mode';
  showBuildMode.alternate().resume();
};

$button.addEventListener('click', toggleBuildMode);