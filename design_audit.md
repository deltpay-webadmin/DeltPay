# DeltPay Design Audit

Findings from auditing every page in `src/app/pages/` and the components they
compose against `design_spec.md`. Read the spec first.

**Nothing in this document has been changed yet.** It's a punch-list. Each
finding has a severity, a location (file:line where applicable), and a
recommended action so it can be triaged before any implementation.

| Severity | Meaning |
|----------|---------|
| **High**     | Visible regression, broken link, invisible content, wrong destination. Affects users now. |
| **Medium**   | Off-spec but not user-blocking — color drift, font mismatch, inconsistent hover. Erodes brand. |
| **Low**      | Cleanup, dead code, slightly off shade, comment-level. |

---

## High-severity findings

### H1. Footer "Payments" link points to `/products`, not `/payments`
- **File:** `src/app/components/Footer.tsx`, in `footerLinks` (Products column).
- **Detail:** `{ label: 'Payments', path: '/products' }`. The actual Payments page is `/payments`.
- **Why it matters:** Largest product surface in the footer routes users to the wrong page.
- **Fix:** Change `path` to `/payments`.

### H2. Footer "Capital" link points to `/apply`, not `/capital`
- **File:** `src/app/components/Footer.tsx`.
- **Detail:** `{ label: 'Capital', path: '/apply' }`. `/capital` is a real, registered route.
- **Fix:** Change `path` to `/capital`. ("Apply" should keep its own entry if it needs one.)

### H3. Footer "Help Center" link points to `/support`, not `/help-center`
- **File:** `src/app/components/Footer.tsx`.
- **Detail:** Both `/help-center` and `/support` exist as separate routes. The label says "Help Center" so users expect to land on `/help-center`.
- **Fix:** Change `path` to `/help-center`.

### H4. Footer industry links all collapse to `/business-types`
- **File:** `src/app/components/Footer.tsx`.
- **Detail:** Retail, Restaurants, Professional Services, and E-commerce all link to `/business-types` instead of their dedicated `/industries/<slug>` pages, which exist.
- **Fix:** Point each label to `/industries/restaurants`, `/industries/retail`, `/industries/professional-services`, `/industries/retail` (e-commerce shares retail) respectively.

### H5. `InvestorRelationsPage` is unrouted
- **File:** `src/app/pages/InvestorRelationsPage.tsx` exists but is not imported in `App.tsx`.
- **Why it matters:** Either users should be able to reach it (via footer/nav) or it's dead code that someone will resurrect by accident.
- **Fix:** Decide — register a route + add to footer, or delete the file.

### H6. `BlogPage` is overshadowed; both files coexist
- **Files:** `src/app/pages/BlogPage.tsx` (orphan) and `src/app/pages/NewBlogPage.tsx` (routed at `/blog`).
- **Why it matters:** Two competing blog implementations — no source of truth.
- **Fix:** Delete `BlogPage.tsx`, rename `NewBlogPage.tsx` → `BlogPage.tsx`, update import in `App.tsx`.

### H7. Page `<title>` is the Figma export name
- **File:** `index.html:7`.
- **Detail:** `<title>Merchant Services Site (Dashboard Locked)</title>`.
- **Why it matters:** That's the browser tab, the bookmark, the share preview. Not Delt-branded.
- **Fix:** Set to something like `Delt — your business, instantly paid.` Optionally add `<meta name="description">`.

---

## Medium-severity findings

### M1. Off-spec dark navies (`#020E22`, `#03152E`, `#0F172A`)
- **Spec value:** `#041E42`.
- **Files (sample):**
  - `src/app/pages/AboutUsPage.tsx:6` — `NAVY_DEEP = '#020E22'`
  - `src/app/pages/AboutUsPage.tsx:9` — `INK = '#0F172A'`
  - `src/app/pages/NewBlogPage.tsx:7,10` — same constants
  - `src/app/pages/WhatsNewPage.tsx:6,10` — same constants
  - `src/app/pages/LensChatPage.tsx:3` — `DEEP = '#03152E'`
  - `src/app/components/ScrollExpandingHero.tsx:6` — `BG = '#03152E'` (used by `/payments` hero)
  - `src/app/components/LensHero.tsx:9` — `DEEP = '#03152E'`
  - `src/app/components/LensPhoneDemo.tsx:7` — `DEEP = '#03152E'`
  - `src/app/components/ChatGPTvsLens.tsx:53` — inline `'#03152E'`
  - `src/app/components/HardwareCarouselSection.tsx:421` — `'#03152E'`
  - `src/app/components/ProductCallouts.tsx:257` — gradient with `#03152E`
  - `src/app/components/LensPreview.tsx:192,197` — `'#03152E'`
  - `src/app/components/WebsiteExamples.tsx:31` — `bg: '#03152E'`
  - `src/app/components/BrowserAddressBarAnimation.tsx:7` — `bg: '#03152E'`
  - `src/app/components/DashboardLitePreview.tsx:323` — `background: #03152E`
  - `src/app/components/DashboardPreview.tsx:164,213` — `color: #0F172A`
- **Why it matters:** "Dark navy" is the most-used brand color and three different shades are in production. It's barely visible per-page, very visible across pages.
- **Fix:** Replace all with `#041E42`. The Lens family ("DEEP = `#03152E`") is the worst offender — the entire Lens suite uses a slightly-too-dark navy.

### M2. Off-spec indigo variants (`#4f46ff`, `#6C69FF`, `#6D68FF`, `#7B61FF`, `#7B78FF`)
- **Spec value:** `#4945FF` (full opacity) or `rgba(73,69,255,X)` for tints.
- **Files (sample):**
  - `src/app/pages/DeltAiPage.tsx:19` — `indigo: '#4f46ff'` and `indigoLight: '#7b61ff'`
  - `src/app/pages/PricingPage.tsx:8` — `indigoLight: "#6C69FF"`
  - `src/app/pages/PricingPage.tsx:9` — `indigoPale: "#EEEDFF"`
  - `src/app/pages/PricingPage.tsx:18` — `green: "#4945FF"` (variable mis-named — token is the indigo color called `green`)
  - `src/app/pages/AboutUsPage.tsx:8` — `PURPLE_HI = '#6D68FF'`
  - `src/app/pages/NewBlogPage.tsx:9` — same
  - `src/app/pages/WhatsNewPage.tsx:8` — same
  - `src/app/components/HowItWorksPage` (`HowItWorksPage.tsx:306`) — `linear-gradient(... #7B78FF ...)`
  - `src/app/components/DomainGraphic.tsx:202` — gradient with `#6C69FF`
  - `src/app/components/SpeedGraphic.tsx:142,254,282,358` — `#6C69FF`
  - `src/app/components/WebsiteExamples.tsx:37,669` — `accentLight: '#6C69FF'`
  - `src/app/components/BrowserAddressBarAnimation.tsx:12` — `accentLight: '#6C69FF'`
- **Fix:** Pick one of two strategies — (a) replace with `#4945FF` and add opacity for tints, or (b) introduce a single `--primary-light` token and use it everywhere. Don't keep parallel hexes.

### M3. Lowercase indigo variant (`#4945ff`) used inconsistently
- **Files:** `src/app/components/PayoutDashboard.tsx:137,208,232,293,303`, `src/app/components/MarketingDashboard.tsx:124,410`, `src/app/components/SalesDashboard.tsx:73,331,352`.
- **Why it matters:** `bg-[#4945ff]` and `bg-[#4945FF]` are the same color but Tailwind treats them as separate classes — duplicates the generated CSS.
- **Fix:** Normalize to uppercase `#4945FF` site-wide.

### M4. Inconsistent primary-button hover color
- **Conflict:** Spec says `#3933CC`. The codebase ships both `#3933CC` (29 sites) and `#3730FF` (50 sites) as the hover for `#4945FF` buttons. A few one-offs use `#3712e0` and `#3510d4` (`ScrollExpandingHero.tsx`, `JuspayHero.tsx`).
- **Why it matters:** Identical-looking CTAs feel different on hover from page to page.
- **Fix:** Pick one canonical hover (recommend `#3933CC`, since spec & Navigation already use it) and replace `#3730FF`/`#3712e0`/`#3510d4` references.

### M5. Off-spec success greens
- **Spec value:** `#16C784`.
- **Files:**
  - `src/app/pages/SignUpPage.tsx:102,103` — `#00D924`
  - `src/app/pages/HelpCenterPage.tsx:351` — `#0e7a49`
  - Multiple component files use `#10B981` and `#22c55e` for success indicators (see grep: `CapitalDashboard`, `ScrollExpandingHero`, `StorefrontDashboard`, `MarketingDashboard`, etc.).
- **Fix:** Replace with `#16C784`.

### M6. Hard-coded `Inter, sans-serif` overrides
- **File:** `src/app/components/WebsiteDeconstruction.tsx` — 11 separate `fontFamily: 'Inter, sans-serif'` overrides (lines 176, 189, 212, 262, 271, 329, 338, 431, 446, 516, 530).
- **Detail:** This component pins itself to Inter instead of inheriting Plus Jakarta Sans.
- **Mitigating factor:** `WebsiteDeconstruction` is **not imported** anywhere — it's dead code (see L3).
- **Fix:** Delete the component, or remove the `fontFamily` overrides if it's resurrected.

### M7. References to unloaded `Codec Pro` font
- **Files:**
  - `src/app/components/FreeAccountSection.tsx:64`
  - `src/app/components/CustomerStories.tsx:85`
  - `src/app/components/SocialProof.tsx:65`
- **Detail:** `style={{ fontFamily: '"Codec Pro", "Codec", Inter, sans-serif' }}`. Codec Pro is **not** imported in `src/styles/fonts.css`, so these silently fall back to Inter — making the H2 inconsistent with every other heading on the site.
- **Note:** `FreeAccountSection` is used on `/payments`. `CustomerStories` and `SocialProof` are dead (see L4).
- **Fix:** Replace `"Codec Pro", "Codec", Inter` with `'Plus Jakarta Sans', sans-serif`.

### M8. `DM Sans` listed as font fallback in one component
- **File:** `src/app/components/SeeItInAction.tsx:54` — subtitle uses `'DM Sans', 'Plus Jakarta Sans'` (DM Sans first).
- **Detail:** DM Sans is loaded but the spec calls Plus Jakarta Sans canonical. Putting DM Sans first means it actually renders DM Sans.
- **Fix:** Reorder to `'Plus Jakarta Sans', sans-serif` only, or drop entirely.

### M9. `BusinessTypesPage` has a navy hero but is not in the Navigation dark-hero list
- **File:** `src/app/pages/BusinessTypesPage.tsx:104` — `style={{ background: '#041E42' }}` on the hero section.
- **Conflict:** `Navigation.tsx:112` `darkHeroPages` does not include `/business-types`, so the nav appears as a solid white pill on top of a navy hero — fine for legibility, but inconsistent with how every other dark-hero page treats its nav (transparent until scroll).
- **Fix:** Add `/business-types` to `darkHeroPages` in `Navigation.tsx`.

### M10. `ContactSalesPage` has a navy hero band but is not in the dark-hero list
- **File:** `src/app/pages/ContactSalesPage.tsx` — first hero block uses `bg-[#041E42]`.
- Same shape as M9 — `/contact-sales` should be in `darkHeroPages` if it's intended to feel transparent.
- **Fix:** Add `/contact-sales` to `darkHeroPages`, or change the hero band to a light treatment.

### M11. Off-spec lavender accents (`#C4BEFF`, `#EEEDFF`)
- **Files:**
  - `src/app/pages/AboutUsPage.tsx:55,89` — gradients with `#C4BEFF`
  - `src/app/pages/WhatsNewPage.tsx:329` — gradient with `#C4BEFF`
  - `src/app/pages/NewBlogPage.tsx:237` — gradient with `#C4BEFF`
  - `src/app/pages/PricingPage.tsx:9` — `indigoPale = '#EEEDFF'`
- **Fix:** If a soft lavender wash is needed, use `rgba(73,69,255,0.10)` over white, not new hexes.

### M12. `default_shadcn_theme.css` lives at repo root but isn't imported
- **File:** `default_shadcn_theme.css` — defines a totally different palette (`oklch` neutrals, `#030213` primary). Not referenced from any TS/CSS file.
- **Why it matters:** Future contributor will see it and assume it's the source of truth. Two themes is one too many.
- **Fix:** Delete it, or move to `guidelines/` with a comment that it's a reference template only.

### M13. `Pricing` defines a `green` token whose value is the indigo
- **File:** `src/app/pages/PricingPage.tsx:18` — `green: "#4945FF"`.
- **Why it matters:** Anyone reading the source assumes "green" means a green color. Anywhere `green` is referenced will silently theme as indigo.
- **Fix:** Either rename the token or use `#16C784` if green was actually intended.

---

## Low-severity findings

### L1. `AboutPage.tsx` ("legacy") routed at `/about-legacy`
- **File:** `App.tsx:77` — `<Route path="/about-legacy" element={<AboutPage />} />`.
- **Detail:** The "real" About is `AboutUsPage` at `/about`. The legacy route is unlinked from anywhere.
- **Fix:** Delete `AboutPage.tsx` and the route once the new About is confirmed shipped.

### L2. Body `zoom: 0.8` on desktop
- **File:** `src/styles/theme.css:10–14`.
- **Why it matters:** Forces every desktop pixel value to render at 80% scale. Components that use raw `window.innerWidth` (e.g. `ScrollExpandingHero`) need workarounds. Future contributors will be surprised.
- **Fix:** Long-term, recalibrate hard-coded sizes and remove the zoom rule. (Not a quick fix — listed for awareness.)

### L3. Dead component `WebsiteDeconstruction.tsx`
- Not imported by any page. Remove or document.

### L4. Dead components `CustomerStories.tsx`, `SocialProof.tsx`
- Not imported by any page (verified via `grep -rln "CustomerStories\|SocialProof" src/app/pages/`).
- Remove if confirmed unused.

### L5. `Footer` Sitemap link is a placeholder
- **File:** `src/app/components/Footer.tsx` footerLinks — `{ label: 'Sitemap', path: '/sitemap', ariaDisabled: true }`.
- **Detail:** No `/sitemap` route. It's flagged `ariaDisabled` so accessibility is OK, but it visually advertises a link that doesn't exist.
- **Fix:** Either generate a real sitemap page, or remove the entry.

### L6. Inconsistent constant naming for the same color
- Across pages: `NAVY`, `NAVY_DEEP`, `INK`, `BG`, `DEEP` all refer to "the dark background". Pages can't share helpers because they don't agree on what the constant is called.
- **Fix:** Adopt one name (`NAVY`) and one value (`#041E42`) per the spec.

### L7. `LensAIPage` defines indigo as `#4f46ff` in tokens but uses `#4945FF` in spec
- **File:** `src/app/pages/LensAIPage.tsx` (the agent's first-pass audit reported `#4f46ff` here, though my second pass confirmed it as `purple: '#4945FF'`). **Verify** the file's `C` token table once more before changing.
- **Action:** Read the file's `C` palette object. If `purple` or any indigo token is `#4f46ff`, normalize to `#4945FF`.

### L8. Routes `/dashboard` and `/demo` both alias `SandboxPage`
- **File:** `App.tsx:51–53`. Three routes for one page (`/sandbox`, `/dashboard`, `/demo`).
- **Detail:** Probably intentional, but worth confirming none of them are accidental dead-ends.

### L9. Hero CTA uses `#4318FF`, in-page primary uses `#4945FF`
- **Files:** `JuspayHero.tsx:467` (`#4318FF`) vs every other primary CTA (`#4945FF`).
- **Detail:** Spec acknowledges this as a deliberate hero-only variant, but it's worth flagging — anyone "fixing" the hero by aligning it to `#4945FF` would mute it. Comment in code, or codify the variant explicitly.

---

## Summary by file

| File / Area                                 | Findings           |
|---------------------------------------------|--------------------|
| `src/app/components/Footer.tsx`             | H1, H2, H3, H4, L5 |
| `src/app/components/Navigation.tsx`         | M9, M10            |
| `src/app/components/ScrollExpandingHero.tsx`| M1, M4             |
| `src/app/components/LensHero.tsx`           | M1                 |
| `src/app/components/LensPhoneDemo.tsx`      | M1                 |
| `src/app/components/LensPreview.tsx`        | M1                 |
| `src/app/components/ChatGPTvsLens.tsx`      | M1                 |
| `src/app/components/HardwareCarouselSection.tsx` | M1            |
| `src/app/components/ProductCallouts.tsx`    | M1                 |
| `src/app/components/DashboardLitePreview.tsx`| M1                |
| `src/app/components/DashboardPreview.tsx`   | M1 (text)          |
| `src/app/components/WebsiteExamples.tsx`    | M1, M2             |
| `src/app/components/BrowserAddressBarAnimation.tsx`| M1, M2      |
| `src/app/components/DomainGraphic.tsx`      | M2                 |
| `src/app/components/SpeedGraphic.tsx`       | M2                 |
| `src/app/components/PayoutDashboard.tsx`    | M3                 |
| `src/app/components/MarketingDashboard.tsx` | M3                 |
| `src/app/components/SalesDashboard.tsx`     | M3                 |
| `src/app/components/SeeItInAction.tsx`      | M8                 |
| `src/app/components/FreeAccountSection.tsx` | M7                 |
| `src/app/components/CustomerStories.tsx`    | M7, L4             |
| `src/app/components/SocialProof.tsx`        | M7, L4             |
| `src/app/components/WebsiteDeconstruction.tsx`| M6, L3           |
| `src/app/pages/HomePage.tsx`                | (clean)            |
| `src/app/pages/PricingPage.tsx`             | M2, M11, M13       |
| `src/app/pages/PaymentsPage.tsx`            | inherits M1 via ScrollExpandingHero |
| `src/app/pages/AboutUsPage.tsx`             | M1, M2, M11        |
| `src/app/pages/AboutPage.tsx`               | L1                 |
| `src/app/pages/NewBlogPage.tsx`             | M1, M2, M11        |
| `src/app/pages/BlogPage.tsx`                | H6                 |
| `src/app/pages/WhatsNewPage.tsx`            | M1, M2, M11        |
| `src/app/pages/HelpCenterPage.tsx`          | M5                 |
| `src/app/pages/SignUpPage.tsx`              | M5                 |
| `src/app/pages/LensChatPage.tsx`            | M1                 |
| `src/app/pages/LensAIPage.tsx`              | L7 (verify)        |
| `src/app/pages/DeltAiPage.tsx`              | M2                 |
| `src/app/pages/BusinessTypesPage.tsx`       | M9                 |
| `src/app/pages/ContactSalesPage.tsx`        | M10                |
| `src/app/pages/InvestorRelationsPage.tsx`   | H5                 |
| `src/app/pages/HowItWorksPage.tsx`          | M2                 |
| `index.html`                                | H7                 |
| `default_shadcn_theme.css`                  | M12                |
| `src/styles/theme.css`                      | L2                 |
| `App.tsx`                                   | L1, L8             |

---

## Recommended fix order

1. **Quick wins (15 min, no design decisions):** H1, H2, H3, H7, M3, M5, M8, L4 — pure renames, pure deletes.
2. **Decision needed but low-risk:** H4 (industry footer links), H5 (delete or route InvestorRelations), H6 (collapse Blog/NewBlog), L1 (drop legacy About).
3. **Color normalization sweep (single PR):** M1, M2, M11, M13, L7. Replace all off-spec dark-navy and indigo hexes via search-and-replace, audit the diff visually.
4. **Hover-color normalization sweep:** M4. One PR converting `#3730FF`/`#3712e0`/`#3510d4` → `#3933CC`.
5. **Font normalization:** M6, M7. Decide whether to delete `WebsiteDeconstruction` and the unused Codec components or fix them.
6. **Navigation allow-list update:** M9, M10. One-line PR to `Navigation.tsx`.
7. **Documentation cleanup:** M12 (delete default_shadcn_theme), L5 (sitemap or remove), L6 (rename constants).
8. **Background work:** L2 (remove desktop zoom). Largest blast radius — separate plan, not this audit.
