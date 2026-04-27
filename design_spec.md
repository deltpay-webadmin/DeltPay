# DeltPay Design Spec

This document describes the **canonical design language** the DeltPay marketing
site is supposed to follow. It is derived from the home page hero
(`src/app/components/JuspayHero.tsx`), the navigation
(`src/app/components/Navigation.tsx`), and the design tokens in
`src/styles/theme.css`. Use it as the reference when auditing or building any
page.

> The companion document `design_audit.md` lists places where the live site
> drifts from this spec. Read this file first, then the audit.

---

## 1. Brand colors

All other shades on the site should be derived from these. Hard-coding new
near-matches (e.g. `#4f46ff`, `#5856FF`) is the most common drift on the site
today.

### Core palette

| Role               | Token         | Hex        | Usage                                              |
|--------------------|---------------|------------|----------------------------------------------------|
| Navy (foreground)  | `--navy`      | `#041E42`  | Body text, dark hero backgrounds, headings on light |
| Primary indigo     | `--primary`   | `#4945FF`  | Primary CTAs, accents, focus ring, links           |
| Hero CTA indigo    | (hero-only)   | `#4318FF`  | Used **only** for primary CTA on the JuspayHero    |
| Primary hover      |               | `#3933CC`  | Canonical hover for `#4945FF` buttons              |
| White              | `--white`     | `#FFFFFF`  | Page background, card surface                      |
| Light gray (panel) | `--light-gray`| `#F6F7FB`  | Section backgrounds, hover bg, input bg            |
| Border             | `--border`    | `#E5E7EB`  | Hairlines and card borders                         |
| Body text muted    | `--gray-600`  | `#6B7280`  | Secondary text                                     |
| Slate body         |               | `#475569`  | Long-form body / paragraph text                    |
| Micro / labels     |               | `#94A3B8`  | Eyebrow text, captions                             |
| Accent line        |               | `#E2E8F0`  | Form borders, dividers                             |
| Hover panel        |               | `#F0F0F0`  | Subtle row-hover background                        |

### Status / utility

| Role        | Hex        | Notes                                            |
|-------------|------------|--------------------------------------------------|
| Success     | `#16C784`  | Single canonical success / growth green          |
| Destructive | `#d4183d`  | Errors, delete, warning-critical                 |

### Allowed transparencies

- White over navy hero: `rgba(255,255,255,0.70)` for body, `0.50` for tertiary, `0.40` for marquee.
- Indigo accents on white: `bg-[#4945FF]/8`, `border-[#4945FF]/15`.
- Navy hairline on white: `rgba(4,30,66,0.10)` (`HAIRLINE`).

### Banned / off-spec colors

These hex values appear in the codebase but are **not part of the spec** and
should be normalized to one of the tokens above:

- `#020E22`, `#03152E`, `#0F172A` — should be `#041E42`
- `#4f46ff`, `#4945ff` (lowercase variant) — should be `#4945FF`
- `#5856FF`, `#6C69FF`, `#6D68FF`, `#7B61FF`, `#7B78FF` — should be derived from `#4945FF` opacity, not new hexes
- `#3712e0`, `#3510d4`, `#3730FF` (when used as `#4945FF` hover) — should be `#3933CC`
- `#C4BEFF`, `#EEEDFF` — replace with `#F6F7FB` or indigo-on-white tints
- `#00D924`, `#0e7a49`, `#22c55e`, `#10B981` — should be `#16C784`

---

## 2. Typography

### Font stack

Loaded in `src/styles/fonts.css`:

- **`Plus Jakarta Sans`** — primary. All headings, all body, all CTAs.
- **`Playfair Display`** italic 400/500 — accent only (single emphasized word in a heading).
- **`JetBrains Mono`** — code, numeric data, terminal/console styling.
- **`Bebas Neue`** — large all-caps display only (rare).
- **`DM Sans`** — listed in fonts.css but **not used** anywhere canonical; treat as deprecated.
- Body-level fallback per `fonts.css` is `Inter, -apple-system…` — Inter is the **fallback**, not a primary face. Setting `font-family: Inter, sans-serif` explicitly is a violation.

The repo also imports `"Codec Pro"` in three components (FreeAccountSection, CustomerStories, SocialProof) but **does not load the Codec Pro webfont**. Anything using Codec Pro currently silently falls back to Inter and should be migrated to Plus Jakarta Sans.

### Heading scale (canonical, from JuspayHero + theme.css)

| Level                | Font                | Weight | Size                       | Letter spacing | Line height |
|----------------------|---------------------|--------|----------------------------|----------------|-------------|
| Hero H1              | Plus Jakarta Sans   | 800    | `clamp(2.8rem, 5.5vw, 4.5rem)` | `-0.035em` | 1.1 |
| Section H2 (light)   | Plus Jakarta Sans   | 800    | 51–61px responsive         | `-0.02em`      | 1.1         |
| Section H2 (dark)    | Plus Jakarta Sans   | 800    | 40–64px (`clamp`)           | `-0.025em`     | 1.04        |
| Card H3              | Plus Jakarta Sans   | 600–650| 22px                       | `-0.01em`      | 1.2         |
| Body                 | Plus Jakarta Sans   | 400    | 15–18px                    | normal         | 1.6–1.75    |
| Subtitle (hero)      | Plus Jakarta Sans   | 400    | 18px                       | normal         | 1.75        |
| Eyebrow / tag        | Plus Jakarta Sans   | 700    | 11–13px **uppercase**      | `0.10–0.20em`  | 1.0         |
| Code / mono          | JetBrains Mono      | 400–600| 12–14px                    | normal         | 1.4         |
| Italic accent word   | Playfair Display    | 400 italic | matches H1             | inherit        | inherit     |

### Italic accent rule

Hero H1s should use **one** Playfair Display italic word for emphasis. The
canonical pattern is "Your business, *instantly paid.*" Body copy and section
headings should not use Playfair.

---

## 3. Layout

### Containers

- **Page max-width:** `1240–1300px` for content sections, `1080px` for the navigation pill.
- **Horizontal padding:** `48px` on desktop (24px on mobile).
- **Vertical section padding:** `120–200px` for major sections, `64–96px` for secondary.
- **Hero min-height:** `~110vh` (JuspayHero), with a 120px fade-out band at the bottom that bleeds into `#041E42`.

### Desktop "zoom"

`src/styles/theme.css` applies `body { zoom: 0.8 }` at `min-width: 1024px`.
Keep this in mind when authoring fixed-pixel widths — they render at 80% on
desktop. Components that opt out (e.g. `ScrollExpandingHero`) read raw
`window.innerWidth` to bypass the zoom.

### Section rhythm (home page reference)

```
Hero (#041E42, 110vh)
  → EmailCaptureBar (navy, beneath hero, no break)
  → ByTheNumbers (navy)
  → 160px navy spacer
  → SeeItInAction (light)
  → ScrollRevealText (light)
  → FeatureShowcase (light)
  → IndustryPanel (light)
  → ResultsBento (light)
  → SpotlightTestimonial (light)
  → FinalCTA (navy)
  → DeltMarquee (light)
  → Footer (light)
```

The pattern is "navy → light → navy → light → navy" with the final navy CTA
before footer. Other pages should follow the same rhythm: dark hero, light
content, optional final navy CTA before footer.

---

## 4. Components

### Navigation (`Navigation.tsx`)

- Fixed top, max-width `1080px`, `border-radius: 16px`.
- **Two states:**
  - **Transparent** — when on a "dark hero" page AND not scrolled AND not hovered AND no dropdown open. Logo is white, links white.
  - **Solid white frosted** — `#FFFFFF` bg, `0 12px 48px rgba(0,0,0,0.10)` shadow, `1px` outline, navy logo and links. Used everywhere else.
- **Dark-hero allow-list** (defined inline in `Navigation.tsx`):
  ```
  /, /payments, /delt-ai, /how-it-works, /website-examples, /industries/*
  ```
  **Any other page that uses a `#041E42` hero must be added to this list**, otherwise the white nav box appears stacked on a navy hero — visually correct but not the intended transparent treatment.
- Mega-menu dropdowns animate height (`height: 0 → auto`) with `0.25s` ease.
- Mobile drawer slides in from the right, `max-width 380px`.

### Footer (`Footer.tsx`)

- White background, navy text.
- Link columns + social icons + phone link.
- All footer paths must point to **registered** routes in `App.tsx` and to the
  most semantically correct destination (e.g. `Payments → /payments`, not `/products`).

### Buttons / CTAs

| Variant         | Background        | Text     | Border           | Radius          | Font              | Hover                |
|-----------------|-------------------|----------|------------------|-----------------|-------------------|----------------------|
| Primary (light) | `#4945FF`         | white    | none             | `9999px` (pill) | PJS 700, 14–16px  | `#3933CC`            |
| Primary (hero)  | `#4318FF`         | white    | none             | `12px`          | PJS 700, 15px     | `#3712e0` darken     |
| Ghost (dark)    | `rgba(255,255,255,0.10)` | rgba 0.7 | `rgba(255,255,255,0.15)` | `12px`  | PJS 600, 15px     | bg `0.08`, border `0.22` |
| Ghost (light)   | transparent       | navy     | `#041E42`        | `9999px`        | PJS 600, 14–16px  | bg `#F6F7FB`         |
| Tertiary link   | none              | indigo   | none             | n/a             | PJS 600, 13–14px  | `#3933CC`            |

### Cards

- White bg, `border-[#4945FF]/15`, `rounded-xl` (12px) or `rounded-2xl` (16px).
- Shadow: `0 2px 16px rgba(4,30,66,0.06)` for product/industry cards;
  `0 12px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)` for floating cards.
- Hover: lift `translateY(-1px)`, intensify shadow.

### Inputs

- `#FFFFFF` or `#F6F7FB` bg (form-on-white vs. form-on-light-panel).
- Border `1px solid #E2E8F0` (or `rgba(4,30,66,0.10)`).
- Focus ring: `4px ring-[#4945FF]/10` + `border-[#4945FF]`.
- Placeholder color `#94A3B8` on white, `#CBD5E1` on darker panels.
- Radius `8px` (`rounded-lg`).

### Animation

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-out-quint`) for entrances.
- Durations: 0.7s for hero fades, 0.55–0.5s for grid items, 0.25s for menus.
- Stagger: ~`0.06–0.15s` between sibling items.
- Hero mesh-gradient canvas + 3% noise overlay are the canonical hero
  background for navy heroes.

---

## 5. Iconography

- **Lucide React** is the only icon library.
- Stroke width: `1.5` for UI accents inside cards/menus; `2.5` for chevrons in nav.
- Icon size: 16px (inline body), 20px (form/menu), 24px (mobile menu trigger).
- Icon color matches text or uses `#4945FF` when calling out.

---

## 6. Page archetype rules

### Hero archetype A — "Dark navy hero" (Home, Payments, Delt-AI, How-It-Works, Website-Examples, Industries)

- `background: #041E42` + animated mesh / canvas / gradient.
- White H1, Playfair italic accent on the emphasized word.
- White `0.7` subtitle.
- Primary CTA `#4318FF` rounded-xl, ghost CTA white-on-white-10.
- Page must be in the Navigation `darkHeroPages` allow-list.

### Hero archetype B — "Light hero with eyebrow"

- White or `#F6F7FB` background.
- Indigo or navy eyebrow text (`text-[12px] font-bold uppercase tracking-[0.2em]`).
- Navy H1 (no white).
- Primary CTA `#4945FF` rounded-full.
- Used by Pricing, Sign-in, Sign-up, Contact, Apply, Calculator, etc.

### Hero archetype C — "Form / utility"

- `#F6F7FB` page background, white centered card with shadow.
- No marketing imagery in hero, just title + form.
- Used by Sign-in, Sign-up, Get-a-Quote, Application.

---

## 7. Routing

- Routing is `react-router` `HashRouter`.
- `App.tsx` defines two sets of routes:
  1. **Bare layout** (no nav/footer): `/sandbox`, `/dashboard`, `/demo`, `/get-a-quote`, `/signin`, `/signup`, `/cart`, `/delt-ai-chat`, `/lens-chat`, `/website-builder`.
  2. **Standard layout** (nav + footer): everything else under `*`.
- Every `.tsx` file under `src/app/pages/` should either be (a) imported and routed, or (b) deleted. Orphan pages are not allowed.
- Footer and Navigation links should only point to routes registered in `App.tsx`.

---

## 8. Document / shell

- `index.html` `<title>` should be a Delt-branded string (e.g. `"Delt — your business, instantly paid."`), **not** the Figma project name.
- `lang="en"`.
- A single mounted `<div id="root">`.
- Global CSS pipeline: `src/styles/index.css` → `fonts.css` + `tailwind.css` + `theme.css`. Do not import additional theme stylesheets at runtime.
- `default_shadcn_theme.css` at the repo root is **not** imported and should be removed or explicitly marked as a reference template.

---

## 9. Accessibility floors

- Every interactive element has a visible focus ring (`--ring: #4945FF`).
- Icon-only buttons need `aria-label`.
- Form fields need a visible `<label>` (placeholders are not labels).
- Color contrast: navy on white, white on navy, both pass AA. Off-spec greys
  (`#0F172A` etc.) on white still pass but break visual coherence.
- Disabled links should not be styled as live links — use `aria-disabled` and a
  muted color (the Footer "Sitemap" entry is the existing pattern).

---

## 10. Definition of "matches the spec"

A page matches the spec when:

1. Every color is one of the tokens in §1 (or an explicit transparency of one).
2. Every text node uses Plus Jakarta Sans, JetBrains Mono, or Playfair Display italic for accents — no Inter, no system stack overrides, no Codec Pro.
3. CTAs use one of the variants in §4.
4. Hero matches one of the three archetypes in §6 and (if dark) the route is in the Navigation allow-list.
5. The page is registered in `App.tsx` with the correct layout wrapper.
6. Footer/nav links pointing **into** the page point at the correct route, not a nearby one.
7. No off-spec hexes or rogue success/destructive colors leak through.
