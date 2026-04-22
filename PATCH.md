# UI Polish Patch — R1–R16

This repo currently ships a **non-invasive UI patch** loaded from `public/patch.css` and `public/patch.js`, referenced from `index.html`. The patch applies 16 prioritized visual + copy improvements without changing component source or layout.

## Why a runtime patch?

The patch was produced from an audit of `www.deltpay.com`. Every change traces back to a finding in `design_spec.md` → `recommendations.md` (kept alongside the audit artifacts — see the PR description for links). A runtime patch was chosen so the diff surface is minimal and every change is easy to review and revert.

## What it changes

| # | Recommendation |
|---|---|
| R1 | Mobile H1: prevent kinetic accent truncation on <768px |
| R2 | SEO `<title>` + meta description + OG tags |
| R3 | `.fs-img-stage img[alt="Business Funding"]` forced to opacity:1 (non-destructive) |
| R4 | Font roles locked: Plus Jakarta Sans / Playfair (`.ih-title-accent`) / JetBrains Mono (`.btn-stat-trait`) |
| R5 | Single indigo ramp across CTAs via `--delt-indigo-500/600` |
| R6 | `.fs-scroll-container` / `.fs-text-section` min-height 100vh → 55vh |
| R7 | `.dp-lens` popover pinned bottom-right of `.dp-wrapper`, 300px / max 44%; dashboard `scale(.95)` |
| R8 | Hero email capture injected into `.ih-ctas` before primary button |
| R9 | Logo left-aligned, `height:52px` |
| R10 | `.btn-stat-trait` normalized: 12px mono, uppercase, `--delt-success` green |
| R11 | `.ih-trust-label` copy rewritten |
| R12 | Testimonial credibility chip ("↗ 3 tools replaced · 1 login") |
| R13 | Marquee type scale + opacity + lilac tint |
| R14 | `section.bg-white.py-24.px-6.md:px-12` → `#F7F3EE` |
| R15 | Stats footnote appended to `.btn-section` |
| R16 | Footer `gap:32px`, reduced vertical padding |

## How it loads

`index.html`:

```html
<link rel="stylesheet" href="/patch.css" />  <!-- in <head> -->
<script defer src="/patch.js"></script>      <!-- just before </body> -->
```

Both files live in `public/` and are served verbatim by Vite.

`patch.js` is idempotent — it guards each DOM mutation with `data-delt-*` markers so repeated executions are safe.

## How to retire

Each R# is a section header in `patch.css` and a function in `patch.js`. When a recommendation is absorbed into the real component source:

1. Delete its block in `patch.css` and/or its function call in `patch.js`.
2. Verify the live site matches by comparing against the before/after screenshots captured during the audit.
3. Once every block is upstreamed, delete `public/patch.*` and both `<link>`/`<script>` tags from `index.html`, and remove this file.

## Known limitations

- The trust marquee still carries the fictional-sounding brand names — R11 rewrote only the label.
- `prefers-reduced-motion` is not honored by the H1 cycler. Out of scope.
- If the markup changes (class renames), selectors in the patch may silently no-op — rerun the audit after any large refactor.
