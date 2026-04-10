import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import lensOrbIcon from 'figma:asset/2bb89bf099aa846cbae2e04e01814e59ffa47260.png';
import {
  ArrowUp,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  MessageSquare,
  ChevronDown,
  Check,
  Layers,

  Download,
  Settings,
  X,
  Copy,
  FileText,
  FileSpreadsheet,
  Camera,
  Database,
  HelpCircle,
  ArrowLeft,
  Moon,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  User,
  LogOut,
  CreditCard,
  Zap,
  ChevronRight,
  Pin,
  PinOff,
  Lock,
} from 'lucide-react';
import type { PinnedChatData } from '../pages/SandboxPage';
import { useChatSessionsStorage } from './useLensChatStorage';
import type { StoredChatSession } from './useLensChatStorage';

/* ── Theme palettes ── */
const ACCENT = '#4945FF';
const SIDEBAR_BG = '#041E42';

const LIGHT_THEME = {
  bg: '#FFFFFF',
  surface: '#F0F1F4',
  border: '#E8E8E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#555770',
  textMuted: '#9496A8',
  textFaint: '#C0C2D0',
  hoverBg: '#ECEDF2',
} as const;

const DARK_THEME = {
  bg: '#0B1A2F',
  surface: '#112240',
  border: '#1E3A5F',
  textPrimary: '#E8ECF1',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textFaint: '#475569',
  hoverBg: '#152D4A',
} as const;

/* legacy aliases — used by sub‑components outside main fn */
const BG = LIGHT_THEME.bg;
const SURFACE = LIGHT_THEME.surface;
const BORDER = LIGHT_THEME.border;
const TEXT_PRIMARY = LIGHT_THEME.textPrimary;
const TEXT_SECONDARY = LIGHT_THEME.textSecondary;
const TEXT_MUTED = LIGHT_THEME.textMuted;
const TEXT_FAINT = LIGHT_THEME.textFaint;
const HOVER_BG = LIGHT_THEME.hoverBg;

/* ── Layer config ── */
const LAYER_COLORS = {
  revenue:  '#5E6BFF',
  flowcast: '#2BB8F9',
  guardian: '#F4A261',
  signals:  '#7C8CF8',
  engine:   '#4E5DE6',
  capital:  '#6FD1B0',
} as const;

const LAYER_DETAILS = [
  { key: 'revenue',  name: 'Revenue Lens',     color: LAYER_COLORS.revenue,  desc: 'Track revenue trends, breakdowns, and root-cause analysis' },
  { key: 'flowcast', name: 'FlowCast',         color: LAYER_COLORS.flowcast, desc: 'Forward-looking cash flow and revenue projections' },
  { key: 'engine',   name: 'Decision Engine',  color: LAYER_COLORS.engine,   desc: 'Simulate pricing, staffing, and strategy changes' },
  { key: 'signals',  name: 'CustomerSignals',  color: LAYER_COLORS.signals,  desc: 'Segment customers, detect churn, and find VIPs' },
  { key: 'guardian', name: 'Guardian',          color: LAYER_COLORS.guardian, desc: 'Anomaly detection, fraud alerts, and risk flags' },
  { key: 'capital',  name: 'Capital Index',     color: LAYER_COLORS.capital,  desc: 'Funding readiness scores and advance recommendations' },
];

/* ── Model versions ── */
interface ModelVersion { id: string; name: string; description: string; }
const MODEL_VERSIONS: ModelVersion[] = [
  { id: 'apex', name: 'Apex 2.0', description: 'Most capable for deep analysis' },
  { id: 'core', name: 'Core 2.0', description: 'Best balance of speed & insight' },
  { id: 'flash', name: 'Flash 1.5', description: 'Fastest for quick answers' },
];
const EXTRA_MODELS: ModelVersion[] = [
  { id: 'apex-mini', name: 'Apex Mini', description: 'Compact deep analysis model' },
  { id: 'sentinel', name: 'Sentinel 1.0', description: 'Optimized for anomaly detection' },
  { id: 'flow-preview', name: 'Flow Preview', description: 'Experimental forecasting model' },
];

/* ── Q&A pairs with category tags ── */
interface QA {
  question: string;
  shortLabel: string;
  layer: string;
  layerColor: string;
  answer: string;
  followUp?: string;
}

const SIMULATED_QA: QA[] = [
  {
    question: 'Why did revenue drop last Tuesday?',
    shortLabel: 'Revenue drop',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Revenue dropped 18% last Tuesday compared to the 4-week average, representing a $6,340 shortfall. The primary driver was a 34% decline at your Downtown location, correlated with a local street closure event on Main Street that restricted vehicle access from 9 AM to 6 PM. This closure eliminated your typical lunch rush and early dinner traffic. Average ticket size remained stable at $47.20, suggesting fewer transactions — not lower spend per customer. Transaction volume dropped from an average of 287 daily transactions to just 189, a decline of 98 transactions. Interestingly, your takeout and delivery orders increased by 23% during the closure period, partially offsetting the lost dine-in revenue.',
    followUp: 'Your Midtown location actually compensated with a 12% increase, adding $2,180 in additional revenue. This suggests customers diverted to your other locations during the disruption. Consider implementing a dynamic promotion system that automatically redirects foot traffic via SMS and app notifications during future disruptions.',
  },
  {
    question: "What's my projected revenue for next month?",
    shortLabel: 'Next month forecast',
    layer: 'FlowCast',
    layerColor: LAYER_COLORS.flowcast,
    answer: 'Based on current velocity, seasonal patterns, and economic indicators, your 30-day projection is $284,600 (±$12,400 confidence interval). This represents a 7.2% increase over the same period last year and a 4.1% increase over last month. Week-by-week breakdown: Week 1 projected at $68,200, Week 2 at $71,400, Week 3 at $82,800 (peak), and Week 4 at $62,200. Confidence score: 94.3%. Key assumptions: no major weather disruptions, staffing levels remain consistent, and current pricing holds steady.',
    followUp: 'Week 3 shows strongest performance due to an upcoming holiday weekend — historically your best 3-day window, generating 28% above average daily revenue. Consider increasing inventory orders by 15-20% for high-demand items and scheduling additional staff.',
  },
  {
    question: 'What if I raised prices by 5%?',
    shortLabel: 'Price simulation',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Modeling a 5% price increase across your entire menu: projected revenue impact is +2.8% net ($7,840/month), factoring in an estimated 3.1% reduction in transaction volume. Your lunch daypart is most price-elastic — a 5% lunch increase would result in a 4.8% volume decline, barely break-even. Dinner and weekend service show lower elasticity. Your top 20% high-value customers show minimal price sensitivity, while occasional visitors are 3x more likely to reduce frequency.',
    followUp: 'A 5% dinner-only increase shows +1.9% net revenue with only 0.4% volume loss. Alternative: 3% across-the-board plus 7% premium on signature items projects +3.4% net revenue with only 1.8% volume impact.',
  },
  {
    question: 'Who are my most valuable customers?',
    shortLabel: 'Top customers',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: 'Your top 8% of repeat customers (~340 customers) generate 31% of total revenue, contributing $86,800/month. They visit 3.2 times/month with $78.40 avg ticket vs. $47.20 overall. However, 14 high-value customers show declining visit frequency over 6 weeks, dropping from 3.8 to 1.2 visits/month. Seven have shifted to competitor locations. Their collective monthly contribution declined from $10,920 to $3,360.',
    followUp: 'A targeted retention campaign for these 14 customers could protect ~$4,200/month. Recommended: personalized outreach with exclusive offers, VIP reservation access, or early menu access. Historical data shows 65% recovery rate when deployed within 45 days.',
  },
  {
    question: 'Are there any anomalies I should know about?',
    shortLabel: 'Detect anomalies',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: 'Guardian flagged 2 items in the last 48 hours: (1) Refund rate at Terminal #4 spiked to 8.7% (3x baseline) — 18 of 23 refunds occurred during Tuesday dinner shift, suggesting hardware or training issues. Severity: 8.4/10. (2) A $2,340 transaction at Terminal #2 at 2:14 AM falls outside normal hours. The receipt shows 47 line items — inconsistent with your typical profile.',
    followUp: 'Recommend investigating Terminal #4 immediately — pull logs and interview Tuesday dinner staff. The after-hours transaction has been tagged for manager review with a monitoring alert on Terminal #2.',
  },
  {
    question: 'Am I ready for a capital advance?',
    shortLabel: 'Funding readiness',
    layer: 'Capital Index',
    layerColor: LAYER_COLORS.capital,
    answer: 'Your Funding Readiness Score is 87/100 ("Strong"). Revenue stability volatility index: 0.12 (below 0.18 concern threshold). 90-day trend positive at 4.3% MoM growth. Daily revenue variance: 14.2%. Recommended advance range: $45,000–$62,000 with 9–12 month repayment. Risk: Low to Moderate. Your lowest monthly revenue was still 78% of your highest.',
    followUp: 'A $55,000 advance would mean ~$203 daily repayment (2.2% of daily revenue) — well within comfort thresholds. Best ROI use cases: equipment upgrades (18-month payback), location expansion (24-month), or inventory optimization for peak season (4-month).',
  },
  {
    question: 'What are my best and worst selling products?',
    shortLabel: 'Product performance',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Top 5 by revenue (30 days): (1) Signature Burger — 2,340 units, $42,120 (14.8% of total); (2) Craft Lager Draft — 3,890 units, $31,120 (10.9%); (3) Truffle Fries — 2,670 units, $26,700 (9.4%); (4) Grilled Salmon — 1,180 units, $24,780 (8.7%); (5) Brunch Platter — 890 units, $22,250 (7.8%). Bottom 5: Seasonal Fruit Cup ($1,240), House Salad ($1,680), Sparkling Water ($890), Kids Pasta ($1,120), Herbal Tea ($640). Bottom 5 combined = less than 2% of revenue.',
    followUp: 'Consider replacing bottom 3 with variants of top sellers. Your Signature Burger has only 28% food cost — your highest-margin hero item. Featuring it more prominently could drive additional volume and increase average ticket by $2.80.',
  },
  {
    question: 'How is my inventory looking?',
    shortLabel: 'Inventory status',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: '3 items below reorder thresholds: (1) Premium ground beef — 42 lbs remaining (2.1 days supply). (2) Craft lager kegs — 3 remaining (1.8 days). (3) Avocados — 28 units (1.4 days). Waste risk detected: 18 lbs fresh salmon expiring in 2 days, but daily usage is only 6 lbs — estimated $86 spoilage risk.',
    followUp: 'Place emergency reorders for beef and kegs today. For surplus salmon, run a flash dinner special at $16.99 (normal $21) — salmon specials convert at 34% higher volume when promoted via email.',
  },
  {
    question: 'How are my labor costs trending?',
    shortLabel: 'Labor costs',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Labor cost ratio: 32.4% of gross revenue (benchmark: 30%). Labor costs increased 6.2% while revenue grew 4.1%. By shift: Morning is overstaffed at 38% labor ratio (14 txns/hr with 6 employees). Lunch is optimized at 26%. Dinner is understaffed at 29% — ticket times increase 22% after 7 PM. Late night runs 41% due to low volume. Overtime past 4 weeks: $4,380, concentrated among 3 Downtown employees.',
    followUp: 'Reducing morning staff by 1 and adding a dinner floater saves ~$2,800/month. Staggered shifts could eliminate 70% of overtime. Projected annual savings: $38,400.',
  },
  {
    question: 'When are my peak and slowest hours?',
    shortLabel: 'Peak hours',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Peak hours (30 days): #1 Friday 6–8 PM ($4,280/hr), #2 Saturday 7–9 PM ($3,960/hr), #3 Sunday 10 AM–12 PM ($3,440/hr). Slowest: Monday 2–5 PM ($380/hr), Tuesday 3–5 PM ($420/hr), weekday mornings 6–8 AM ($290/hr). Best hour generates 14.8x the revenue of your worst hour.',
    followUp: 'Monday/Tuesday afternoons are your biggest gap. Happy hour specials (3–5 PM) average 28% volume lift. Loyalty double-points during off-peak average 18% lift. Shifting 15% of peak demand to off-peak through promos could add $6,200/month.',
  },
  {
    question: 'What are my biggest expenses this month?',
    shortLabel: 'Top expenses',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Top expenses (total: $198,400): (1) Labor — $91,200 (46%), (2) COGS — $58,600 (29.5%), (3) Rent — $18,400 (9.3%), (4) Utilities — $6,800, (5) Marketing — $5,200, (6) Insurance — $3,400, (7) Supplies — $4,100, (8) Tech/POS — $2,800, (9) Maintenance — $4,200 (HVAC emergency at Downtown), (10) Misc — $3,700. COGS ratio crept from 28.1% to 29.5% due to supplier price increases on beef (+8%) and dairy (+5.2%).',
    followUp: 'Your Metro Foods contract is 12% above market on 4 items. Competitive bidding for top 10 ingredients could save $3,200/month.',
  },
  {
    question: "What's my profit margin and how can I improve it?",
    shortLabel: 'Profit margins',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Operating profit margin: 11.2% ($31,640 on $282,500). Below industry median of 14% but improved from 9.8% three months ago. By stream: Dine-in 14.6%, takeout 10.8%, delivery 4.2% (after 22% platform commissions). By location: Midtown 15.1%, Downtown 11.8%, Uptown 9.4%, Eastside 7.2%.',
    followUp: 'Three highest-impact levers: (1) Shift 20% delivery to direct ordering = $3,400/month saved. (2) Promote top-5 highest-margin items = +1.2 margin points. (3) Portion control audit — 6-8% overportioning detected = $2,100/month savings. Combined: margin jumps to ~17.8%.',
  },
  {
    question: 'Are my marketing campaigns working?',
    shortLabel: 'Marketing ROI',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: 'Past 30 days — (1) Email: $800 spend, 142 visits, $8,940 revenue, ROI 11.2x. "Weekend Special" had 34% open rate (industry: 21%). (2) Instagram ads: $2,100 spend, 89 visits, $4,680 revenue, ROI 2.2x — declined 18% due to ad fatigue. (3) Google local: $1,400 spend, 67 new customers, $3,820 revenue, ROI 2.7x. Blended marketing ROI: 4.1x on $4,300 total spend.',
    followUp: 'Email dramatically outperforms paid ads. Reduce Instagram by 40%, invest $400 in email list growth (2,400→4,000 subs), refresh Instagram with video content (3.2x better performance). Projected: +$2,600/month revenue with $440 less spend.',
  },
  {
    question: 'Should I run a promotion this weekend?',
    shortLabel: 'Promotion planning',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Saturday is tracking 8% below your 4-week average. Weather: clear (positive). No competing events. Simulation of "Saturday Night Special" (15% off appetizers + free drink with entree): projected 34-42 incremental visits, $2,800-$3,400 incremental revenue, $1,200-$1,500 promo cost. Net positive: $1,600-$1,900. Best deployment: push notification by Thursday evening (48-hour lead time maximizes 12.4% redemption).',
    followUp: 'Lower-cost alternative: social media flash deal ("Show this post for free appetizer with entree") costs $0 in ad spend and drives 18-24 incremental visits based on your engagement rates.',
  },
  {
    question: 'How are my online orders and delivery performing?',
    shortLabel: 'Online & delivery',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Online/delivery = 24.6% of total revenue ($69,500/month), up from 19.2% YoY. Third-party platforms: $42,300 (61%) at 22.4% commission. Direct website: $18,200 (26%) at 4% cost. Phone: $9,000 (13%). Avg delivery ticket: $52.80 (12% higher than dine-in). But after commissions, delivery margin is only 4.2% vs. dine-in 14.6%. Growth has plateaued at <1% MoM.',
    followUp: 'Each order shifted from third-party to direct saves $9.40. Include a flyer in every delivery bag offering 10% off first direct order (6-8% conversion benchmark). Shifting 25% of third-party volume to direct saves $5,280/month.',
  },
  {
    question: 'How do I compare to competitors?',
    shortLabel: 'Competitor analysis',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: 'Within 2-mile radius: You rank #3 of 8 in estimated monthly revenue. Avg ticket $47.20 is 6% above local median. Google rating 4.3 stars (682 reviews) = #4; top competitor has 4.6 stars (1,240 reviews). 18% of your regulars also frequent "Harbor Grill" (your #1 competitor), primarily for brunch. Your market growth of 4.1% outpaces the 3.2% overall market — you\'re gaining share.',
    followUp: 'Key gaps: (1) Need more reviews — implement post-visit prompts for 15-20 new reviews/month. (2) Brunch losing to Harbor Grill — enhance your weekend offering. (3) SEO ranks #5 for "restaurants near [area]" — basic optimization could reach #2-3, adding 40-60 discovery visits/month.',
  },
  {
    question: 'Will I have enough cash this month?',
    shortLabel: 'Cash flow check',
    layer: 'FlowCast',
    layerColor: LAYER_COLORS.flowcast,
    answer: 'Projected end-of-month cash: $34,200 (±$4,800). Current balance: $48,600. Weekly: Wk1 +$8,200, Wk2 -$2,400 (payroll + suppliers), Wk3 +$11,600 (peak week), Wk4 -$18,400 (rent + quarterly insurance). Low point: $29,800 on last day — above $25,000 minimum reserve but buffer is thin (ideal: $37,500).',
    followUp: 'Strengthen position: (1) Switch quarterly insurance to monthly, (2) Negotiate net-30 with top 3 suppliers (delays $8,400 in outflows), (3) Accelerate 2 corporate catering receivables at net-45 ($4,200 outstanding). This raises projected low-point to $42,400.',
  },
  {
    question: 'How should I prepare for tax season?',
    shortLabel: 'Tax preparation',
    layer: 'Capital Index',
    layerColor: LAYER_COLORS.capital,
    answer: 'Estimated annual gross: $3.39M. Taxable income: $378K-$412K. Federal liability: $84K-$96K (~23% effective). Key deductions: Section 179 depreciation ($18,400), vehicle expenses ($4,800-$6,200), employee benefits ($12,400), insurance ($13,600). You\'ve paid $42,000 in estimated taxes YTD — potentially $8K-$12K below actual liability, risking underpayment penalty.',
    followUp: 'Actions: (1) Make $10,000 catch-up estimated payment before quarter-end. (2) Organize receipt docs — 23 transactions over $500 missing receipts. (3) Review entity structure — S-corp election could save $18K-$24K/year in self-employment taxes.',
  },
  {
    question: 'What seasonal trends should I plan for?',
    shortLabel: 'Seasonal trends',
    layer: 'FlowCast',
    layerColor: LAYER_COLORS.flowcast,
    answer: 'Strongest: Q4 (Oct–Dec) averages 18% above baseline; December alone = 11.2% of annual revenue. Weakest: mid-Jan through mid-Feb, 22% below baseline. Summer runs 8% above with July 4th spike (+31%). Fridays/Saturdays = 42% of weekly revenue; Mon–Wed = 28%. First week of each month runs 6% higher than last week (paycheck cycles).',
    followUp: 'Strategy: (1) January — reduce staffing 15%, run health-focused promos. (2) Pre-holiday — inventory buildup by early Oct, hire seasonal staff by Oct 15. (3) Open patio by April 15 — added $14,200/month last summer.',
  },
  {
    question: 'What payment methods are customers using?',
    shortLabel: 'Payment methods',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: '12,840 transactions past 30 days: Credit cards 62.4% ($178,200) — Visa 34%, MC 18%, Amex 8%, Discover 2.4%. Debit 18.6% ($42,100). Mobile wallets 11.2% ($34,800) — up from 7.8% YoY. Cash 6.8% ($14,200) — down from 11.4%. Contactless tap-to-pay = 44% of card transactions. Avg processing fee: 2.74%, totaling $6,990/month.',
    followUp: 'Amex costs $1,840/month in higher fees, but Amex customers have 22% higher tickets — worth keeping. At your volume, negotiate interchange-plus pricing to save $800-$1,200/month.',
  },
  {
    question: 'What are customers saying in reviews?',
    shortLabel: 'Customer reviews',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: '148 reviews past 60 days (Google 92, Yelp 34, TripAdvisor 22). Sentiment: 4.18/5. Top positives: "delicious food" (41), "great atmosphere" (28), "excellent service" (24). Top negatives: "long wait times" (18 — your #1 complaint, Fri/Sat 7-8 PM), "parking" (11 — Downtown), "inconsistent quality" (7 — grilled chicken and pasta). Review response rate: only 34% (best practice: 90%+).',
    followUp: 'Priority: (1) Implement reservation/waitlist app for Fri/Sat dinner — eliminates #1 complaint. (2) Quality inconsistency correlates with sous chef absence — recipe standardization needed. (3) Respond to every review within 24 hours (5 min/day).',
  },
  {
    question: 'Am I getting good deals from my suppliers?',
    shortLabel: 'Supplier costs',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: '6 of 10 suppliers within 5% of market (acceptable). 4 show overpayment: Metro Foods (produce) — 14% above on greens, 9% above on dairy ($8,400/yr excess). Pacific Seafood — salmon 11% above ($3,200/yr). Cleaning supplies — 22% above ($1,800/yr). Paper goods — 18% above ($2,400/yr). Total annual overspend: $15,800. Metro Foods contract (3 years) never renegotiated despite 40% volume increase.',
    followUp: 'Request competitive bids from 2-3 alternatives. At $58,600/month COGS, you have strong leverage. Even 5% across-the-board reduction = $35,160/year savings. Metro Foods has a "preferred partner" tier with 8-12% discounts never applied to your account.',
  },
  {
    question: 'How are my locations performing?',
    shortLabel: 'Location comparison',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Past 30 days: Downtown — $108,200 (38.3%), +5.2% MoM, 11.8% margin, $52.40 avg ticket. Midtown — $79,400 (28.1%), +6.8% MoM, 15.1% margin (most efficient). Uptown — $58,900 (20.9%), +2.1% MoM, 9.4% margin. Eastside — $36,000 (12.7%), -1.4% MoM, 7.2% margin (declining 3 consecutive months).',
    followUp: 'Eastside decline correlates with: new competitor (0.3 mi away, opened Oct), construction reducing foot traffic, and vacant manager position (6 weeks). Invest in turnaround ($4,200/month) or evaluate lease exit — renewal in 4 months is a critical decision window.',
  },
  {
    question: 'Should I open a new location?',
    shortLabel: 'Expansion analysis',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Expansion readiness: 72/100 (Moderate — proceed with caution). Positives: Midtown proves model scales (15.1% margin), consistent 4-6% MoM growth, mature operations. Financials: Typical new location needs $120K-$180K. Your reserves ($48,600) plus available advance ($45K-$62K) = $93K-$110K — below recommended threshold. Cannibalization risk: location within 3 miles historically loses 8-15% at nearby stores.',
    followUp: 'Phased approach: (1) Resolve Eastside first (90 days). (2) Build reserves to $80K+ (4-6 months). (3) Target neighborhoods matching Midtown demographics. High-potential areas: Riverside District (growing 12%, underserved) and College Heights (strong weekends, low competition).',
  },
  {
    question: 'How effective is my loyalty program?',
    shortLabel: 'Loyalty program',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: '2,840 enrolled members (22% of unique customers). Active (30-day): 1,180 (41.5%). Members spend 34% more ($63.20 vs. $47.20) and visit 2.1x more often. Revenue from members: $89,400/month (31.6%). Redemption rate: 68% (industry avg: 54%). But enrollment plateaued — only 82 new members this month vs. 140 six months ago. Sign-up completion rate: only 44% due to too many required fields.',
    followUp: 'Quick wins: (1) Simplify to phone-number-only enrollment — doubles completion to 80%+. (2) Add welcome offer for 28% higher 30-day activation. (3) Referral program — referred customers have 37% higher LTV. (4) "We miss you" campaign for inactive members — 15-22% recovery rate.',
  },
  {
    question: 'What is my break-even point?',
    shortLabel: 'Break-even analysis',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Fixed costs: $142,800/month. Variable cost ratio: 38.4%. Each revenue dollar contributes $0.616. Break-even: $231,800/month. Current revenue ($282,500) provides $50,700 cushion (17.9% safety margin). By location: Downtown breaks even at $68,400 (actual $108,200 ✓), Midtown $42,800 ($79,400 ✓), Uptown $38,200 ($58,900 ✓), Eastside $31,400 ($36,000 — only 14.6% above, thinnest margin).',
    followUp: 'Eastside is concerning — 15% revenue decline puts it negative. Renegotiating Eastside lease and consolidating overlapping software ($480/month across 3 tools) would lower break-even. Every $1,000 fixed cost reduction = $1,623 less required revenue.',
  },
  {
    question: "What's my refund and chargeback situation?",
    shortLabel: 'Refunds & chargebacks',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: 'Past 30 days: 187 refunds, $8,940 (3.2% of gross — above 2.5% healthy threshold). Breakdown: wrong orders 42%, system errors 28%, cancellations 19%, manager discretionary 11%. Chargebacks: 4 disputes, $680 (0.031% rate — well below 1% penalty trigger). Win rate: 75%. Terminal #4 accounts for 34% of all refunds but only 18% of transactions.',
    followUp: 'Fixing Terminal #4 alone drops refund rate from 3.2% to 2.1%, saving ~$3,100/month. For chargebacks, submit evidence within 48 hours with receipts and timestamps. Consider pre-authorization holds for phone orders over $100.',
  },
  {
    question: 'How is my website performing?',
    shortLabel: 'Digital presence',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: '8,420 unique visitors this month (+6% MoM). Sources: Google organic 44%, Direct 22%, Social 18%, Google Maps 12%, Referral 4%. Google Business Profile: 14,200 views/month, 890 direction requests, 340 clicks. Online ordering conversion: 4.2% (above 3.8% benchmark). But mobile speed score: 42/100 — pages take 4.8 seconds. 53% of users abandon after 3 seconds. You\'re losing 18-24 orders/week.',
    followUp: 'Priorities: (1) Fix mobile speed — 2-second improvement = 15-20% more conversions ($630-$950/week). (2) Complete 4 missing Google Business fields (menu link, ordering link, holiday hours, service area) = +22% discovery. (3) Add 4-6 local content pages/year for SEO boost.',
  },
  {
    question: 'How can I optimize employee scheduling?',
    shortLabel: 'Schedule optimization',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Current: 448 labor hrs/week. Optimal model: 392 hrs/week (12.5% reduction). Inefficiencies: (1) Mon/Tue mornings — 6 staff, 14 txns/hr → reduce to 4 (saves 16 hrs/wk). (2) Weekday 2-4 PM — prep crew starts 1 hour early → shift to 3 PM (saves 10 hrs/wk). (3) Sunday 8-10 PM — 5 staff, 6 txns/hr → reduce to 3 (saves 8 hrs/wk). 3 servers cross-trained for flexible deployment.',
    followUp: 'Savings: 56 hours/week × $18.50 = $1,036/week ($53,900/year). No service quality impact — peak periods maintain current ratios. Roll out gradually over 2 weeks starting with Mon/Tue mornings.',
  },
  {
    question: 'What industry trends should I watch?',
    shortLabel: 'Industry trends',
    layer: 'FlowCast',
    layerColor: LAYER_COLORS.flowcast,
    answer: 'Key trends: (1) Digital ordering = 38% of industry revenue (you\'re at 24.6% — growth opportunity). (2) "Experience" dining sees 14% higher repeat rates. (3) Food costs projected +3-5% next 6 months. (4) Minimum wage increase (+$1.50 effective Jan) adds ~$6,200/month to labor. (5) AI-assisted operations adopted by 22% of multi-location operators with 8-12% margin improvement. (6) 67% of under-35 consumers factor sustainability into restaurant choice.',
    followUp: 'Actions: (1) Accelerate digital ordering (13 points behind industry). (2) Budget now for minimum wage impact. (3) Consider low-cost sustainability initiative — high marketing value with younger demographics. (4) Lock in protein pricing with suppliers for Q1.',
  },
  {
    question: 'Give me a summary of today',
    shortLabel: 'Daily summary',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Today (as of 9:47 PM): Total revenue $10,240 (+4.2% vs. $9,830 daily avg). 342 transactions (avg 326). Avg ticket: $29.94. Midtown led at $3,280 (strong lunch). Downtown solid at $4,120. Uptown $1,840 (slightly below avg). Eastside $1,000 (-12% vs. avg). Peak: 12:30-1:30 PM (48 txns across locations). No Guardian alerts. Zero overtime. Delivery: 84 orders, $4,430. Loyalty: 6 new sign-ups, 42 redemptions.',
    followUp: 'Vs. same day last week: revenue up 6.8%, led by Midtown. Eastside softness continues. Your new appetizer special (launched Monday) hit 127 orders this week — early data suggests top-10 item potential.',
  },
  {
    question: 'Am I paying too much in rent?',
    shortLabel: 'Rent analysis',
    layer: 'Capital Index',
    layerColor: LAYER_COLORS.capital,
    answer: 'Rent-to-revenue (benchmark 8-12%): Downtown $8,400/mo = 7.8% (healthy). Midtown $5,200 = 6.5% (excellent — 8% below market). Uptown $4,800 = 8.1% (acceptable — 5% above market). Eastside $4,200 = 11.7% (concerning with declining revenue). Blended: 8.0%.',
    followUp: 'Actions: (1) Eastside renewal in 4 months — negotiate 15-20% reduction or evaluate closure ($50,400/yr savings). (2) Lock in Midtown long-term before market catches up. (3) Use competitive offers as leverage for Uptown reduction at next renewal.',
  },
  {
    question: 'What KPIs should I track?',
    shortLabel: 'Key metrics',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: '12 critical KPIs: (1) Revenue growth 4.1% (target 5%+). (2) Profit margin 11.2% (target 14%+). (3) Labor cost 32.4% (target ≤30%). (4) Food cost 29.5% (target ≤28%). (5) Avg ticket $47.20 (target $50+). (6) Retention 62% (target 70%+). (7) Table turnover 2.8x (target 3.2x). (8) Online orders 24.6% (target 35%+). (9) Refund rate 3.2% (target <2.5%). (10) Employee turnover 18% quarterly (target <12%). (11) Google rating 4.3 (target 4.5+). (12) Cash reserve 5.3 days (target 14+ days). Hitting 3 of 12.',
    followUp: 'Biggest impact opportunities: (1) Labor cost -2.4 pts = $6,780/mo. (2) Food cost -1.5 pts = $4,238/mo. (3) Online to 35% = $8,200/mo. (4) Retention 62%→70% = $12,400/mo retained. Combined: margin jumps from 11.2% to ~17.8%.',
  },
  {
    question: 'How much am I spending on processing fees?',
    shortLabel: 'Processing fees',
    layer: 'Revenue Lens',
    layerColor: LAYER_COLORS.revenue,
    answer: 'Total processing fees this month: $6,990 (2.74% blended rate on $255,100 in electronic transactions). Breakdown by card network: Visa — $3,420 (2.4% avg rate), Mastercard — $1,980 (2.5%), Amex — $1,180 (3.4%), Discover — $220 (2.6%), Debit — $190 (0.45%). Mobile wallets carry the same interchange as underlying card. Your rate is 0.18% above the average for merchants at your volume tier — you\'re likely on tiered pricing rather than interchange-plus.',
    followUp: 'Switching to interchange-plus pricing at your volume ($255K/month electronic) would reduce your blended rate to approximately 2.52%, saving $560/month or $6,720/year. Request quotes from 2-3 processors — your volume qualifies for competitive rates. Also consider a cash discount program (offering 3% off for cash) to shift 5-8% of transactions to cash, saving an additional $150-$240/month in fees.',
  },
  {
    question: 'What\'s happening with employee turnover?',
    shortLabel: 'Staff turnover',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: 'Employee turnover rate: 18% quarterly (72% annualized) — above the 12% quarterly target and above industry median of 15%. In the past 90 days, 7 employees departed: 3 front-of-house (2 voluntary, 1 no-show), 3 back-of-house (all voluntary citing pay), 1 manager (relocated). Average tenure of departing employees: 4.2 months. Estimated cost per replacement: $3,400 (recruiting, training, productivity loss). Total quarterly turnover cost: ~$23,800. Your Eastside location accounts for 4 of 7 departures — a clear problem site. Exit interview themes: compensation below market (cited by 4 of 5 interviewed), inconsistent scheduling (3 of 5), limited growth opportunities (2 of 5).',
    followUp: 'Retention strategies with highest ROI: (1) A $1.50/hr raise for top performers costs ~$4,800/month but could reduce turnover by 40%, saving $9,500/quarter. (2) Implementing consistent 2-week advance scheduling reduces "inconsistent schedule" complaints by 60% at zero cost. (3) Create a "shift lead" title and $0.75/hr premium for experienced staff — provides growth path and reduces management burden.',
  },
  {
    question: 'How can I reduce food waste?',
    shortLabel: 'Food waste',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Estimated monthly food waste: $4,200-$5,100 (7.1-8.7% of COGS), above the 5% industry best-practice target. Top waste categories: (1) Produce — $1,800/month (over-ordering leafy greens, 22% spoilage rate vs. 12% benchmark). (2) Prepared items — $1,400/month (over-prepping soups and sauces for projected demand that didn\'t materialize, especially Mon-Wed). (3) Protein — $680/month (portion trim waste above standard, particularly salmon and steak cuts). (4) Bread/baked goods — $320/month (day-old items discarded). Waste peaks on Mondays (items prepped for weekend that weren\'t used) and Wednesdays (mid-week over-estimation).',
    followUp: 'Reducing waste to 5% target saves $1,200-$2,200/month. Actions: (1) Switch to daily produce ordering for high-spoilage items instead of 3x/week. (2) Reduce Mon-Wed prep quantities by 15% based on actual demand data. (3) Implement FIFO labeling system. (4) Donate day-old bread to local food bank (tax deduction + community goodwill). (5) Use salmon trim for a "fish taco" special instead of discarding.',
  },
  {
    question: 'Do I need new equipment or upgrades?',
    shortLabel: 'Equipment health',
    layer: 'Guardian',
    layerColor: LAYER_COLORS.guardian,
    answer: 'Equipment health scan based on maintenance records, age, and performance data: (1) Downtown walk-in cooler — 8 years old, 3 repair calls in past 6 months ($2,100 total). Industry lifespan: 10-12 years. Failure risk in next 12 months: moderate (35%). Replacement cost: $8,500. (2) POS Terminal #4 — persistent refund/error issues for 3 weeks. Likely needs replacement ($1,200). (3) Midtown dishwasher — running 18% longer cycles than spec, indicating wear. Estimated 6-12 months before failure. (4) All espresso machines performing within spec. (5) HVAC at Downtown just repaired ($2,800) — should be stable for 2-3 years. Overall equipment portfolio is aging — average age across major appliances is 5.8 years.',
    followUp: 'Priority investments: (1) Replace POS Terminal #4 immediately ($1,200) — will save $3,100/month in refund losses. ROI: 2.6x in first month alone. (2) Budget $8,500 for Downtown cooler replacement within 6 months — proactive replacement avoids emergency costs (typically 40% higher) and food spoilage risk. (3) Midtown dishwasher — begin researching replacements but no urgent action needed. Total recommended equipment budget for next 12 months: $14,500.',
  },
  {
    question: 'Can you help me with menu engineering?',
    shortLabel: 'Menu optimization',
    layer: 'Decision Engine',
    layerColor: LAYER_COLORS.engine,
    answer: 'Menu engineering analysis categorizes your 42 menu items into four quadrants: Stars (high profit, high popularity) — 8 items including Signature Burger (68% margin, 2,340 units), Truffle Fries (72% margin, 2,670 units), Craft Cocktails (78% margin, 1,890 units). Plowhorses (low profit, high popularity) — 6 items including House Salad (42% margin, 1,680 units) and Kids Pasta (38% margin, 560 units). Puzzles (high profit, low popularity) — 9 items including Grilled Lamb Chops (71% margin, but only 180 units). Dogs (low profit, low popularity) — 7 items that should be candidates for removal. Your current menu design gives equal visual weight to all items — Stars should occupy prime menu real estate (top right corner, boxed/highlighted).',
    followUp: 'Recommended changes: (1) Highlight your 8 Star items with visual callouts and descriptive language. (2) Reprice Plowhorses — a $1.50 increase on House Salad alone adds $2,520/month with minimal volume impact. (3) Test-promote Puzzle items with server recommendations — if Grilled Lamb Chops volume increases 3x with prompting, it becomes a Star. (4) Remove 4 of 7 Dog items to simplify operations and reduce inventory complexity. Projected impact: +$4,800/month revenue, +1.8 margin points.',
  },
  {
    question: 'How can I attract more new customers?',
    shortLabel: 'Customer acquisition',
    layer: 'CustomerSignals',
    layerColor: LAYER_COLORS.signals,
    answer: 'Your new customer acquisition rate: ~280 first-time visitors/month (8.7% of total transactions). Acquisition channels: Google discovery 34%, word-of-mouth/referral 28%, social media 18%, walk-ins 12%, delivery app discovery 8%. Cost per acquisition by channel: Google ads $20.90, social ads $23.60, organic/referral $0 (but requires ongoing content investment). Your 30-day return rate for new customers is only 22% — meaning 78% never come back. The industry benchmark is 30-35% first-visit-to-second conversion. This "leaky bucket" means you\'re spending to acquire customers but losing most of them immediately.',
    followUp: 'Focus on conversion, not just acquisition: (1) Implement a "first visit" offer that incentivizes return within 14 days (e.g., "Come back this week for 15% off") — merchants using this see 40% improvement in second-visit rates. (2) Capture email/phone on first visit via WiFi login or receipt prompt. (3) Send a personalized follow-up within 48 hours. (4) For paid acquisition, Google local ads have the best ROI at $20.90 CPA vs. social at $23.60. Improving first-visit retention from 22% to 30% at current acquisition volume = 22 additional repeat customers/month worth ~$12,800/year.',
  },
  {
    question: 'What catering opportunities am I missing?',
    shortLabel: 'Catering growth',
    layer: 'FlowCast',
    layerColor: LAYER_COLORS.flowcast,
    answer: 'Your current catering revenue: $8,400/month from 6 corporate accounts (+2 occasional orders/month). This represents only 3% of total revenue — the industry average for restaurants with your profile is 8-12%. Catering margins are typically 18-22% (vs. your 11.2% dine-in), making it your highest-margin potential channel. Your Downtown location is within 0.5 miles of 340+ offices with 50+ employees — a largely untapped market. Current catering menu has only 4 options, limiting appeal. Average catering order: $1,400. Lead time: typically 3-5 business days.',
    followUp: 'Growth plan: (1) Expand catering menu to 10-12 packages (breakfast, lunch, meeting snacks, event platters) — variety increases order frequency by 35%. (2) Hire a part-time catering sales rep ($2,400/month) to cold-call local offices — ROI typically achieved within 60 days. (3) Partner with catering platforms (ezCater, ZeroCater) for discovery. Target: $24,000/month in catering within 6 months (+$15,600/month at 20% margin = $3,120/month additional profit).',
  },
  {
    question: 'Is my insurance coverage adequate?',
    shortLabel: 'Insurance review',
    layer: 'Capital Index',
    layerColor: LAYER_COLORS.capital,
    answer: 'Current insurance portfolio: General liability ($1M/$2M) — $3,200/year. Property insurance (equipment + inventory) — $2,800/year covering $180,000 in assets. Workers comp — $6,400/year (rate 4.2% of payroll). Business interruption — NOT DETECTED. Cyber liability — NOT DETECTED. Umbrella policy — NOT DETECTED. Key gap: You have no business interruption insurance. If your Downtown location (38% of revenue) experienced a fire, flood, or extended closure, you would lose approximately $3,600/day in revenue with no coverage. At your revenue level, this is a critical gap. Your workers comp rate of 4.2% is above the 3.5% industry average — potentially due to 2 claims in the past 18 months.',
    followUp: 'Recommended additions: (1) Business interruption insurance — estimated $1,800-$2,400/year for coverage that would pay up to $108,000 over 30 days of closure. This is essential. (2) Cyber liability — $600-$900/year, covers POS data breaches (average breach cost: $45,000 for small businesses). (3) Umbrella policy ($1M) — $800-$1,200/year for additional lawsuit protection. Total additional cost: ~$3,200-$4,500/year. For workers comp, implementing a safety training program could reduce your rate modifier and save $400-$600/year.',
  },
];

/* ── Suggestion chips shown on landing — curated subset ── */
const SUGGESTION_CHIPS = SIMULATED_QA.slice(0, 6);

/* ── Pre-filled chat history conversations ── */
interface ChatHistoryItem {
  id: string;
  title: string;
  time: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  layer?: string;
  layerColor?: string;
  followUp?: string;
}

const CHAT_HISTORY: { label: string; items: ChatHistoryItem[] }[] = [
  {
    label: 'Today',
    items: [
      {
        id: 'h1', title: 'Revenue analysis for Q4', time: '2h ago',
        messages: [
          { id: 'h1u1', role: 'user', text: 'Give me a breakdown of Q4 revenue by location' },
          { id: 'h1a1', role: 'assistant', text: 'Q4 revenue totaled $1.14M across all locations. Downtown led with $412K (36%), followed by Midtown at $298K (26%), Uptown at $247K (22%), and Eastside at $183K (16%). Downtown showed the strongest growth at 11% YoY, while Eastside dipped 3% due to construction disruptions in November.', layer: 'Revenue Lens', layerColor: LAYER_COLORS.revenue, followUp: 'December was the standout month at $420K total — the holiday promotion drove a 24% spike in the first two weeks.' },
          { id: 'h1u2', role: 'user', text: 'What drove the Downtown growth?' },
          { id: 'h1a2', role: 'assistant', text: 'Downtown\'s 11% growth was driven by three factors: (1) Weekend evening traffic increased 18% after the new bar menu launched in October, (2) Corporate catering orders grew 34% from 6 new office accounts, and (3) Average ticket size rose from $44.80 to $49.10 — a 9.6% increase attributed to premium menu items.', layer: 'Revenue Lens', layerColor: LAYER_COLORS.revenue },
        ],
      },
      {
        id: 'h2', title: 'Customer churn predictions', time: '5h ago',
        messages: [
          { id: 'h2u1', role: 'user', text: 'Which customers are at risk of churning?' },
          { id: 'h2a1', role: 'assistant', text: 'CustomerSignals identified 23 high-value customers showing churn indicators. Of these, 14 have reduced visit frequency by 40%+ over the past 6 weeks. The remaining 9 have shifted to lower-value orders, suggesting price sensitivity. Combined, these customers represent $8,400/month in at-risk revenue.', layer: 'CustomerSignals', layerColor: LAYER_COLORS.signals, followUp: 'The most common churn pattern: customers who visited 3+ times/month dropping to once or less. A personalized outreach campaign could recover an estimated 60% of this group.' },
        ],
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 'h3', title: 'Pricing strategy simulation', time: '1d ago',
        messages: [
          { id: 'h3u1', role: 'user', text: 'Simulate a 10% price increase on premium items only' },
          { id: 'h3a1', role: 'assistant', text: 'Modeling a 10% increase on premium menu items (top 15 by price): projected net revenue impact is +4.2%, factoring in a 5.8% volume decrease on affected items. However, mid-tier items see a 2.1% boost from customers trading down. Overall margin improvement: +6.3%.', layer: 'Decision Engine', layerColor: LAYER_COLORS.engine, followUp: 'The simulation suggests pairing this with a "value combo" promotion on mid-tier items to capture the trade-down traffic and maximize total revenue.' },
        ],
      },
      {
        id: 'h4', title: 'Weekly anomaly report', time: '1d ago',
        messages: [
          { id: 'h4u1', role: 'user', text: 'Run the weekly anomaly check' },
          { id: 'h4a1', role: 'assistant', text: 'Guardian weekly scan complete. 4 items flagged:\n\n1. Terminal #4 refund rate: 8.7% (baseline: 2.9%) — persisting from last week\n2. Eastside location: 3 voids >$200 in single shift (Feb 24)\n3. Supplier invoice from "Metro Foods" 22% above contract rate\n4. Staff overtime at Downtown up 31% vs. budget\n\nSeverity: Items 1 and 3 rated HIGH. Items 2 and 4 rated MEDIUM.', layer: 'Guardian', layerColor: LAYER_COLORS.guardian, followUp: 'Terminal #4 has been flagged for two consecutive weeks now. Strongly recommend a physical inspection and staff retraining on refund procedures.' },
        ],
      },
      {
        id: 'h5', title: 'Capital readiness check', time: '1d ago',
        messages: [
          { id: 'h5u1', role: 'user', text: 'Check my funding readiness score' },
          { id: 'h5a1', role: 'assistant', text: 'Your Funding Readiness Score is 87/100 — up 3 points from last month. Key metrics: Revenue stability (94/100), Transaction consistency (88/100), Growth trajectory (82/100), Operating margin (84/100). You qualify for advances in the $45K–$62K range.', layer: 'Capital Index', layerColor: LAYER_COLORS.capital, followUp: 'Your score improved mainly due to 3 consecutive months of stable daily volume. Maintaining this trend for 2 more weeks could push you into the 90+ tier with better terms.' },
        ],
      },
    ],
  },
  {
    label: 'Previous 7 days',
    items: [
      {
        id: 'h6', title: 'Cash flow forecast Feb', time: '3d ago',
        messages: [
          { id: 'h6u1', role: 'user', text: 'Forecast my cash flow for the rest of February' },
          { id: 'h6a1', role: 'assistant', text: 'February remaining cash flow projection: Inflows of $142,300 (±$8,200) against projected outflows of $118,600. Net positive cash position of $23,700. Key dates: Rent payment of $18,400 due Feb 28. Payroll of $34,200 processes Feb 26. Supply orders of $12,800 scheduled Feb 25.', layer: 'FlowCast', layerColor: LAYER_COLORS.flowcast, followUp: 'Cash position dips to its lowest point on Feb 28 after rent clears. Recommend ensuring at least $28K in operating reserves by Feb 25.' },
        ],
      },
      {
        id: 'h7', title: 'Top customer segments', time: '5d ago',
        messages: [
          { id: 'h7u1', role: 'user', text: 'Break down my customer segments' },
          { id: 'h7a1', role: 'assistant', text: 'CustomerSignals identifies 4 primary segments:\n\n1. Power Users (8%): 3.2+ visits/month, $78 avg ticket — 31% of revenue\n2. Regulars (22%): 1.5–3 visits/month, $52 avg ticket — 38% of revenue\n3. Occasionals (41%): 0.5–1.5 visits/month, $44 avg ticket — 24% of revenue\n4. One-timers (29%): Single visit, $38 avg ticket — 7% of revenue\n\nPower Users have the highest retention (94%) but Occasionals represent the biggest growth opportunity.', layer: 'CustomerSignals', layerColor: LAYER_COLORS.signals },
        ],
      },
      {
        id: 'h8', title: 'Terminal refund audit', time: '6d ago',
        messages: [
          { id: 'h8u1', role: 'user', text: 'Deep dive into Terminal #4 refund issues' },
          { id: 'h8a1', role: 'assistant', text: 'Terminal #4 audit results: 47 refunds processed in the last 14 days totaling $2,180. Breakdown: 62% were same-item re-rings (suggesting input errors), 23% were genuine customer complaints, 15% were manager overrides with no documented reason. Peak refund times: 11:30 AM–1:00 PM (lunch rush) and 6:00–7:30 PM (dinner rush).', layer: 'Guardian', layerColor: LAYER_COLORS.guardian, followUp: 'The pattern strongly suggests a training issue rather than fraud. The terminal is primarily operated by 2 newer employees. Recommend targeted POS training session.' },
        ],
      },
    ],
  },
];

/* ── Time ago helper ── */
function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

/* ── Lens orb icon ── */
function LensSparkle({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <img src={lensOrbIcon} alt="" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
  );
}

/* ── Reusable overlay/modal backdrop ── */
function ModalOverlay({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 rounded-2xl overflow-hidden"
            style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', maxHeight: '85vh', maxWidth: '90vw' }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Hover button helper ── */
function HoverBtn({ children, onClick, className = '', style = {}, title }: { children: React.ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`cursor-pointer transition-colors ${className}`}
      style={{ color: TEXT_MUTED, ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = HOVER_BG; e.currentTarget.style.color = TEXT_SECONDARY; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = TEXT_MUTED; }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export function LensChatSimulator({ embedded = false, pinnedChats = [], onPinChat, onUnpinChat, darkMode = false }: { embedded?: boolean; pinnedChats?: PinnedChatData[]; onPinChat?: (chat: PinnedChatData) => void; onUnpinChat?: (chatId: string) => void; darkMode?: boolean }) {
  const navigate = useNavigate();

  /* ── Theme — shadow module‑level constants ── */
  const T = darkMode ? DARK_THEME : LIGHT_THEME;
  const BG = T.bg;
  const SURFACE = T.surface;
  const BORDER = T.border;
  const TEXT_PRIMARY = T.textPrimary;
  const TEXT_SECONDARY = T.textSecondary;
  const TEXT_MUTED = T.textMuted;
  const TEXT_FAINT = T.textFaint;
  const HOVER_BG = T.hoverBg;

  /* ── Themed helper buttons (need access to themed colors) ── */
  const ThemedHoverBtn = ({ children, onClick, className = '', style = {}, title }: { children: React.ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties; title?: string }) => (
    <button
      onClick={onClick}
      title={title}
      className={`cursor-pointer transition-colors ${className}`}
      style={{ color: TEXT_MUTED, ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = HOVER_BG; e.currentTarget.style.color = TEXT_SECONDARY; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = TEXT_MUTED; }}
    >
      {children}
    </button>
  );

  const ThemedModalOverlay = ({ open, onClose, children: modalChildren }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 rounded-2xl overflow-hidden"
            style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, boxShadow: `0 24px 64px rgba(0,0,0,${darkMode ? '0.4' : '0.15'})`, maxHeight: '85vh', maxWidth: '90vw' }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {modalChildren}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Persistent chat storage ── */
  const { sessions, saveSession, deleteSession, markPinned } = useChatSessionsStorage();

  /* ── Core chat state ── */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [queryCount, setQueryCount] = useState(0);
  const MAX_QUERIES = 3;
  const queryLimitReached = queryCount >= MAX_QUERIES;

  /* ── UI state ── */
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hide sidebar by default
  const [sidebarView, setSidebarView] = useState<'chats' | 'search' | 'layers'>('chats');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_VERSIONS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [showExtraModels, setShowExtraModels] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [headerTab, setHeaderTab] = useState<'history' | 'lens'>('lens'); // New header tab state

  /* ── Modal state ── */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* ── Refs ── */
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0 || isTyping;

  /* ── Toast helper ── */
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  /* ── Auto-save current chat session to localStorage ── */
  const saveCurrent = useCallback(() => {
    if (messages.length === 0) return;
    const firstUser = messages.find(m => m.role === 'user');
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    const chatId = activeChatId || `live-${messages[0]?.id}`;
    const isPinned = pinnedChats.some(c => c.id === chatId);
    const session: StoredChatSession = {
      id: chatId,
      title: firstUser?.text.slice(0, 60) || 'Lens Chat',
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: isPinned,
      layer: lastAssistant?.layer,
      layerColor: lastAssistant?.layerColor,
    };
    saveSession(session);
  }, [messages, activeChatId, pinnedChats, saveSession]);

  /* Save whenever messages change (debounced via effect) */
  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(saveCurrent, 500);
      return () => clearTimeout(timeout);
    }
  }, [messages, saveCurrent]);

  /* ── Scroll helpers ── */
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setModelDropdownOpen(false);
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) setAttachOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Focus search input when switching to search view ── */
  useEffect(() => {
    if (sidebarView === 'search') setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [sidebarView]);

  /* ── Build merged chat history: saved sessions + hardcoded demos ── */
  const mergedHistory = useMemo(() => {
    // Convert saved sessions into ChatHistoryItem-compatible entries
    const savedItems: ChatHistoryItem[] = sessions.map(s => ({
      id: s.id,
      title: s.title,
      time: formatTimeAgo(s.updatedAt),
      messages: s.messages,
    }));

    // Get IDs of hardcoded chats
    const hardcodedIds = new Set(CHAT_HISTORY.flatMap(g => g.items.map(i => i.id)));

    // Filter out saved sessions that share an ID with hardcoded ones
    const uniqueSaved = savedItems.filter(s => !hardcodedIds.has(s.id));

    // Build groups: "Saved Chats" first (if any), then the hardcoded groups
    const groups: { label: string; items: ChatHistoryItem[] }[] = [];
    if (uniqueSaved.length > 0) {
      groups.push({ label: 'Saved Chats', items: uniqueSaved });
    }
    groups.push(...CHAT_HISTORY);
    return groups;
  }, [sessions]);

  /* ── Filtered chat history for search ── */
  const filteredHistory = useMemo(() => {
    if (!sidebarSearch.trim()) return mergedHistory;
    const lower = sidebarSearch.toLowerCase();
    return mergedHistory.map(group => ({
      ...group,
      items: group.items.filter(item => item.title.toLowerCase().includes(lower)),
    })).filter(group => group.items.length > 0);
  }, [sidebarSearch, mergedHistory]);

  /* ── Q&A matching ── */
  const findBestMatch = (query: string): QA => {
    const lower = query.toLowerCase();
    const keywords: Record<number, string[]> = {
      0: ['revenue drop', 'sales drop', 'revenue decline', 'sales fell', 'revenue fell', 'why did revenue', 'sales down', 'revenue down', 'lost revenue', 'bad day', 'slow day', 'revenue decrease'],
      1: ['project', 'forecast', 'next month', 'predict', 'future revenue', 'expect', 'outlook', 'projection', 'next quarter', 'next week'],
      2: ['what if', 'raise price', 'price increase', 'pricing strategy', 'change price', 'price simulation', 'price model'],
      3: ['valuable customer', 'best customer', 'top customer', 'vip', 'high value', 'most valuable', 'who are my customer', 'loyal customer'],
      4: ['anomal', 'alert', 'flag', 'unusual', 'suspicious', 'fraud', 'warning', 'something wrong', 'anything wrong'],
      5: ['capital', 'fund', 'advance', 'loan', 'ready for fund', 'financing', 'borrow', 'credit line'],
      6: ['best selling', 'worst selling', 'top product', 'bottom product', 'product performance', 'menu item', 'what sells', 'popular item', 'best item', 'top item'],
      7: ['inventory', 'stock', 'low stock', 'reorder', 'supply level', 'running out', 'out of stock'],
      8: ['labor cost', 'staffing cost', 'payroll', 'overstaffed', 'understaffed', 'labor ratio', 'wage', 'employee cost'],
      9: ['peak hour', 'busiest', 'slowest', 'busy time', 'slow time', 'rush hour', 'dead hour', 'quiet time', 'traffic pattern'],
      10: ['biggest expense', 'top expense', 'where is money going', 'spending', 'cost breakdown', 'overhead', 'operating cost'],
      11: ['profit margin', 'margin', 'profitability', 'bottom line', 'net income', 'improve margin', 'make more money'],
      12: ['marketing', 'campaign', 'ad performance', 'advertising', 'roi on ads', 'instagram', 'email marketing', 'social media marketing'],
      13: ['promotion', 'deal', 'discount', 'special offer', 'run a promo', 'weekend special', 'happy hour', 'coupon'],
      14: ['online order', 'delivery', 'doordash', 'ubereats', 'grubhub', 'takeout', 'digital order'],
      15: ['competitor', 'competition', 'compare', 'how do i stack up', 'market position', 'other restaurant', 'rival'],
      16: ['cash flow', 'enough cash', 'liquidity', 'cover expense', 'make rent', 'pay bills', 'cash position', 'cash crunch'],
      17: ['tax', 'irs', 'deduction', 'write off', 'tax season', 'filing', 'estimated tax', 'tax prep'],
      18: ['seasonal', 'season', 'holiday', 'summer', 'winter', 'quarterly trend', 'time of year', 'cyclical'],
      19: ['payment method', 'credit card', 'debit', 'cash payment', 'apple pay', 'contactless', 'how are people paying', 'payment type'],
      20: ['review', 'feedback', 'rating', 'yelp', 'google review', 'complaint', 'what are customer saying', 'reputation', 'star rating'],
      21: ['supplier', 'vendor', 'good deal', 'supply cost', 'overcharg', 'procurement', 'wholesale'],
      22: ['location performance', 'store comparison', 'which location', 'branch', 'site performance', 'compare location', 'all location'],
      23: ['open new', 'expansion', 'new location', 'second location', 'grow', 'scale', 'expand'],
      24: ['loyalty', 'rewards', 'loyalty program', 'points', 'membership', 'repeat customer program'],
      25: ['break even', 'breakeven', 'break-even', 'minimum revenue', 'cover costs', 'fixed cost'],
      26: ['refund', 'chargeback', 'dispute', 'return', 'void', 'reversal'],
      27: ['website', 'online presence', 'seo', 'google business', 'digital', 'web traffic', 'site performance'],
      28: ['schedule', 'scheduling', 'shift', 'roster', 'optimize schedule', 'who should work', 'staffing schedule'],
      29: ['industry trend', 'market trend', 'what\'s new', 'industry', 'trend', 'what should i know'],
      30: ['today', 'daily summary', 'how did today go', 'end of day', 'today\'s number', 'recap', 'daily report'],
      31: ['rent', 'lease', 'occupancy', 'rent too high', 'paying too much rent', 'landlord', 'lease renewal'],
      32: ['kpi', 'metric', 'what should i track', 'key performance', 'dashboard', 'scorecard', 'benchmark'],
      33: ['processing fee', 'transaction fee', 'swipe fee', 'interchange', 'merchant fee', 'payment processing cost'],
      34: ['turnover', 'employee leaving', 'quit', 'retention', 'hiring', 'losing staff', 'employee churn', 'attrition'],
      35: ['food waste', 'waste', 'spoilage', 'expir', 'throw away', 'compost', 'reduce waste'],
      36: ['equipment', 'upgrade', 'repair', 'replace', 'machine', 'hardware', 'terminal', 'oven', 'cooler', 'dishwasher'],
      37: ['menu engineering', 'menu design', 'menu optimization', 'menu layout', 'menu mix', 'restructure menu'],
      38: ['new customer', 'attract customer', 'acquire', 'acquisition', 'get more customer', 'grow customer base', 'foot traffic', 'bring in'],
      39: ['catering', 'corporate order', 'large order', 'event', 'office lunch', 'bulk order', 'group order'],
      40: ['insurance', 'coverage', 'liability', 'workers comp', 'protect', 'policy', 'insured'],
    };
    let bestIdx = 0, bestScore = 0;
    Object.entries(keywords).forEach(([idx, words]) => {
      let score = 0;
      words.forEach(w => { if (lower.includes(w)) score += w.includes(' ') ? 3 : 1; });
      if (score > bestScore) { bestScore = score; bestIdx = parseInt(idx); }
    });
    if (bestScore === 0) bestIdx = Math.floor(Math.random() * SIMULATED_QA.length);
    return SIMULATED_QA[bestIdx];
  };

  /* ── Send message ���─ */
  const handleSend = useCallback(async (text?: string) => {
    const question = (text || inputValue).trim();
    if (!question || isTyping || queryLimitReached) return;
    setInputValue('');
    const userMsgId = `u-${Date.now()}`;
    // Assign a stable chat ID on first message if none exists
    if (!activeChatId && messages.length === 0) {
      setActiveChatId(`live-${userMsgId}`);
    }
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: question }]);
    setIsTyping(true);
    setQueryCount(prev => prev + 1);
    const match = findBestMatch(question);
    setActiveLayer(match.layer);
    const delay = deepAnalysis ? 2200 + Math.random() * 1200 : 1200 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`, role: 'assistant', text: match.answer,
      layer: match.layer, layerColor: match.layerColor, followUp: match.followUp,
    }]);
    setIsTyping(false);
    setActiveLayer(null);
  }, [inputValue, isTyping, deepAnalysis, activeChatId, messages.length, queryLimitReached]);

  /* ── Load history conversation ── */
  const loadHistoryChat = (item: ChatHistoryItem) => {
    // Save current chat before switching
    if (messages.length > 0) saveCurrent();
    setMessages(item.messages);
    setActiveChatId(item.id);
    setIsTyping(false);
    setActiveLayer(null);
    setSidebarView('chats');
  };

  /* ── New chat / reset ── */
  const handleReset = () => {
    // Save current chat before starting fresh
    if (messages.length > 0) saveCurrent();
    setMessages([]);
    setIsTyping(false);
    setActiveLayer(null);
    setActiveChatId(null);
    inputRef.current?.focus();
  };

  /* ── Export chat ── */
  const exportAsText = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : `Lens (${m.layer || 'General'})`}: ${m.text}${m.followUp ? `\n  Insight: ${m.followUp}` : ''}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lens-chat.txt'; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    showToast('Chat exported as .txt');
  };

  const copyToClipboard = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : `Lens (${m.layer || 'General'})`}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setExportOpen(false);
    showToast('Chat copied to clipboard');
  };

  /* ────────────────────────────────────────────────
     MODEL SELECTOR DROPDOWN
     ──────────────────────────────────────────────── */
  const modelSelector = (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
      {selectedModel.name}
      {deepAnalysis && <Zap size={12} style={{ color: '#F4A261' }} />}
    </div>
  );

  /* ────────────────────────────────────────────────
     INPUT BAR
     ──────────────────────────────────────────────── */
  const inputBar = (large = false) => queryLimitReached ? (
    <div className="w-full overflow-hidden rounded-2xl" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
      <div className="flex flex-col items-center gap-3 px-6 py-5 text-center">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ACCENT}14` }}>
          <Lock size={16} style={{ color: ACCENT }} />
        </div>
        <div>
          <p style={{ fontWeight: 650, color: TEXT_PRIMARY, fontSize: 14, marginBottom: 3 }}>Free query limit reached</p>
          <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>
            You've used all {MAX_QUERIES} free queries. Start a free trial to unlock unlimited Lens AI access.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => navigate('/signup')}
            className="flex-1 py-2.5 rounded-xl text-white text-sm"
            style={{ backgroundColor: ACCENT, fontWeight: 600 }}
          >
            Start Free Trial
          </button>
          <button
            onClick={() => { setQueryCount(0); setMessages([]); setActiveChatId(null); }}
            className="py-2.5 px-4 rounded-xl text-sm"
            style={{ color: TEXT_MUTED, border: `1px solid ${BORDER}`, fontWeight: 500 }}
          >
            Reset demo
          </button>
        </div>
        <p style={{ fontSize: 11, color: TEXT_FAINT }}>
          {MAX_QUERIES - queryCount < 0 ? 0 : MAX_QUERIES - queryCount} of {MAX_QUERIES} queries remaining
        </p>
      </div>
    </div>
  ) : (
    <div className="w-full overflow-hidden" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: large ? 24 : 20, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3" style={{ padding: large ? '16px 18px' : '14px 16px' }}>
        {/* Attach button with dropdown */}
        <div className="relative" ref={attachRef}>
          <ThemedHoverBtn onClick={() => setAttachOpen(!attachOpen)} className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36 }}>
            <Plus size={20} />
          </ThemedHoverBtn>
          <AnimatePresence>
            {attachOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden z-50"
                style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
              >
                {[
                  { icon: FileSpreadsheet, label: 'Upload CSV / Excel', action: () => { setAttachOpen(false); showToast('File upload coming soon — connect your data source in Settings'); } },
                  { icon: Camera, label: 'Paste screenshot', action: () => { setAttachOpen(false); showToast('Screenshot analysis coming soon'); } },
                  { icon: Database, label: 'Connect data source', action: () => { setAttachOpen(false); setSettingsOpen(true); } },
                  { icon: FileText, label: 'Paste text / notes', action: () => { setAttachOpen(false); setInputValue(inputValue + ' [paste your notes here]'); inputRef.current?.focus(); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors"
                    style={{ backgroundColor: 'rgba(0,0,0,0)', color: TEXT_SECONDARY, fontSize: 13 }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = HOVER_BG; e.currentTarget.style.color = TEXT_PRIMARY; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = TEXT_SECONDARY; }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          placeholder="How can Lens help you today?" disabled={isTyping}
          className="flex-1 bg-transparent outline-none" style={{ color: TEXT_PRIMARY, fontSize: large ? 17 : 16, '::placeholder': { color: TEXT_FAINT } } as any} />

        <div className="flex items-center gap-2 flex-shrink-0">
          {modelSelector}
          <motion.button type="submit" disabled={!inputValue.trim() || isTyping}
            className="rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
            style={{ width: 36, height: 36, backgroundColor: inputValue.trim() && !isTyping ? ACCENT : BORDER, color: inputValue.trim() && !isTyping ? '#FFFFFF' : TEXT_FAINT }}
            whileHover={inputValue.trim() && !isTyping ? { scale: 1.06 } : {}} whileTap={inputValue.trim() && !isTyping ? { scale: 0.95 } : {}}>
            <ArrowUp size={18} />
          </motion.button>
        </div>
      </form>
    </div>
  );

  /* ── Query counter badge — shown above input when queries remain ── */
  const queryCounterBadge = !queryLimitReached && queryCount > 0 ? (
    <div className="flex justify-end mb-1.5">
      <span style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>
        {MAX_QUERIES - queryCount} free {MAX_QUERIES - queryCount === 1 ? 'query' : 'queries'} remaining
      </span>
    </div>
  ) : null;

  /* ── Settings sections ── */
  const settingsSections = [
    { icon: Palette, label: 'Appearance', desc: 'Light mode active', action: () => showToast('Theme options coming soon') },
    { icon: Moon, label: 'Default model', desc: selectedModel.name, action: () => { setSettingsOpen(false); setModelDropdownOpen(true); } },
    { icon: Bell, label: 'Notifications', desc: 'Anomaly alerts enabled', action: () => showToast('Notification preferences saved') },
    { icon: Shield, label: 'Privacy & data', desc: 'Your data stays private', action: () => showToast('Privacy settings — all data encrypted at rest') },
    { icon: Database, label: 'Connected sources', desc: '2 sources linked', action: () => showToast('Manage POS, accounting, and CRM integrations') },
    { icon: Globe, label: 'Language & region', desc: 'English (US)', action: () => showToast('Language settings coming soon') },
    { icon: Trash2, label: 'Clear all chats', desc: 'Delete conversation history', action: () => { handleReset(); setSettingsOpen(false); showToast('All chats cleared'); } },
  ];

  /* ══════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════ */
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: BG }} ref={sectionRef}>
      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl"
            style={{ backgroundColor: TEXT_PRIMARY, border: `1px solid ${BORDER}`, color: '#FFFFFF', fontSize: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex" style={{ height: '100vh' }}>
        {/* ═══════════════════════════════════════════
            SIDEBAR
            ═══════════════════════════════════════════ */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex flex-col h-full" style={{ width: 260 }}>
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <button onClick={() => setSidebarOpen(false)} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors" title="Close sidebar"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <PanelLeftClose size={20} />
                  </button>
                  <button onClick={handleReset} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors" title="New chat"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Sidebar view tabs */}
                <div className="flex items-center gap-1 px-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {([
                    { key: 'search' as const, icon: Search, label: 'Search' },
                    { key: 'layers' as const, icon: Layers, label: 'Layers' },
                    { key: 'chats' as const, icon: MessageSquare, label: 'Chats' },
                  ]).map(tab => (
                    <button key={tab.key} onClick={() => setSidebarView(tab.key)} title={tab.label}
                      className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                      style={{ color: sidebarView === tab.key ? '#fff' : 'rgba(255,255,255,0.5)', backgroundColor: sidebarView === tab.key ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0)' }}
                      onMouseEnter={(e) => { if (sidebarView !== tab.key) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={(e) => { if (sidebarView !== tab.key) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; }}
                    >
                      <tab.icon size={20} />
                    </button>
                  ))}
                </div>

                {/* ── SIDEBAR CONTENT ── */}
                <div className="flex-1 overflow-y-auto px-2 pt-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) rgba(0,0,0,0)' }}>
                  {/* SEARCH VIEW */}
                  {sidebarView === 'search' && (
                    <div>
                      <div className="px-2 pb-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                          <Search size={15} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                          <input ref={searchInputRef} type="text" value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)}
                            placeholder="Search chats..." className="flex-1 bg-transparent outline-none placeholder-white/40"
                            style={{ color: '#fff', fontSize: 13 }} />
                          {sidebarSearch && (
                            <button onClick={() => setSidebarSearch('')} className="cursor-pointer" style={{ color: 'rgba(255,255,255,0.5)' }}><X size={14} /></button>
                          )}
                        </div>
                      </div>
                      {filteredHistory.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No results found</div>
                      ) : (
                        filteredHistory.map(group => (
                          <div key={group.label} className="mb-4">
                            <div className="px-3 py-1.5 text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{group.label}</div>
                            {group.items.map(item => (
                              <button key={item.id} onClick={() => loadHistoryChat(item)}
                                className="w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors block truncate"
                                style={{ color: activeChatId === item.id ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: 13, backgroundColor: activeChatId === item.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0)' }}
                                onMouseEnter={(e) => { if (activeChatId !== item.id) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
                                onMouseLeave={(e) => { if (activeChatId !== item.id) { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                              >
                                {item.title}
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* LAYERS VIEW */}
                  {sidebarView === 'layers' && (
                    <div className="space-y-1 px-1">
                      <div className="px-2 py-2 text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>AI LAYERS</div>
                      {LAYER_DETAILS.map(layer => (
                        <button key={layer.key}
                          onClick={() => {
                            const qa = SIMULATED_QA.find(q => q.layer === layer.name);
                            if (qa) handleSend(qa.question);
                          }}
                          className="w-full text-left px-3 py-3 rounded-lg cursor-pointer transition-colors"
                          style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
                        >
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}60` }} />
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{layer.name}</span>
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingLeft: 18 }}>{layer.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CHATS VIEW */}
                  {sidebarView === 'chats' && (
                    <>
                      {mergedHistory.map(group => (
                        <div key={group.label} className="mb-4">
                          <div className="px-3 py-1.5 text-xs tracking-wider" style={{ color: group.label === 'Saved Chats' ? '#6FD1B0' : 'rgba(255,255,255,0.55)' }}>{group.label}</div>
                          {group.items.map(item => {
                            const isChatPinned = pinnedChats.some(c => c.id === item.id);
                            return (
                              <button key={item.id} onClick={() => loadHistoryChat(item)}
                                className="w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                                style={{ color: activeChatId === item.id ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: 13, backgroundColor: activeChatId === item.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0)' }}
                                onMouseEnter={(e) => { if (activeChatId !== item.id) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
                                onMouseLeave={(e) => { if (activeChatId !== item.id) { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                              >
                                <span className="truncate flex-1">{item.title}</span>
                                {isChatPinned && <Pin size={11} style={{ color: '#fff', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Sidebar footer */}
                <div className="px-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', height: 44, flexShrink: 0 }}>
                  <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)} className="cursor-pointer" title="Profile">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#fff', color: ACCENT, fontSize: 13, fontWeight: 700 }}>D</div>
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute bottom-full left-0 mb-2 w-52 rounded-xl overflow-hidden z-50"
                          style={{ backgroundColor: '#0A2A50', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}
                        >
                          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Demo User</div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>demo@delt.com</div>
                          </div>
                          {[
                            { icon: User, label: 'Profile', action: () => { setProfileOpen(false); showToast('Profile settings coming soon'); } },
                            { icon: CreditCard, label: 'Billing', action: () => { setProfileOpen(false); showToast('Billing portal coming soon'); } },
                            { icon: LogOut, label: 'Sign out', action: () => { setProfileOpen(false); showToast('This is a demo — sign out disabled'); } },
                          ].map(item => (
                            <button key={item.label} onClick={item.action}
                              className="w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors"
                              style={{ backgroundColor: 'rgba(0,0,0,0)', color: 'rgba(255,255,255,0.75)', fontSize: 13 }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                            >
                              <item.icon size={16} />{item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Lens <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>by Delt</span></span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.2 }}>Demo User</span>
                  </div>
                  <div className="flex-1" />
                  <button onClick={() => { if (!hasMessages) { showToast('Start a conversation first to export'); return; } setExportOpen(true); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" title="Export chat"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    <Download size={16} />
                  </button>
                  <button onClick={() => setSettingsOpen(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" title="Settings"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════
            MAIN AREA
            ═══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col relative" style={{ minWidth: 0 }}>
          {/* New Header with History/Lens tabs */}
          <div className="flex items-center justify-between px-6 border-b" style={{ borderColor: '#E8E8E8', height: 54, flexShrink: 0 }}>
            <div className="flex items-center gap-1">
              {/* Hamburger menu icon */}
              <button
                onClick={() => setHeaderTab(headerTab === 'history' ? 'lens' : 'history')}
                className="w-8 h-8 flex flex-col justify-center items-center gap-[3px] cursor-pointer rounded-md mr-3"
                title="Toggle menu"
                style={{ flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = HOVER_BG; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div className="w-[14px] h-[2px] rounded-full" style={{ backgroundColor: TEXT_MUTED }} />
                <div className="w-[14px] h-[2px] rounded-full" style={{ backgroundColor: TEXT_MUTED }} />
                <div className="w-[14px] h-[2px] rounded-full" style={{ backgroundColor: TEXT_MUTED }} />
              </button>

              {/* History Tab */}
              <button
                onClick={() => setHeaderTab('history')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm"
                style={{
                  color: headerTab === 'history' ? TEXT_PRIMARY : TEXT_MUTED,
                  fontWeight: headerTab === 'history' ? 500 : 400,
                  backgroundColor: headerTab === 'history' ? HOVER_BG : 'transparent',
                }}
              >
                History
              </button>

              {/* Lens Tab — filled accent pill when active */}
              <button
                onClick={() => setHeaderTab('lens')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm"
                style={{
                  color: headerTab === 'lens' ? '#FFFFFF' : TEXT_MUTED,
                  fontWeight: headerTab === 'lens' ? 600 : 400,
                  backgroundColor: headerTab === 'lens' ? '#635bff' : 'transparent',
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: headerTab === 'lens' ? 'rgba(255,255,255,0.7)' : ACCENT }} />
                Lens
              </button>

              {/* Model label */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 ml-1" style={{ color: TEXT_MUTED, fontSize: 14 }}>
                {selectedModel.name}
                {deepAnalysis && <Zap size={12} style={{ color: '#F4A261' }} />}
              </div>
            </div>

            {/* New chat button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm"
              style={{
                borderColor: BORDER,
                color: TEXT_SECONDARY,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = HOVER_BG; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Plus size={16} />
              New chat
            </button>
          </div>

          {/* ── HISTORY VIEW ── */}
          {headerTab === 'history' && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl mb-6" style={{ fontWeight: 600, color: TEXT_PRIMARY }}>Chat History</h2>
                {mergedHistory.length === 0 ? (
                  <div className="text-center py-12" style={{ color: TEXT_MUTED }}>
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No chat history yet. Start a conversation to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {mergedHistory.map(group => (
                      <div key={group.label}>
                        <h3 className="text-xs font-medium tracking-wider mb-3 px-2" style={{ color: TEXT_MUTED }}>
                          {group.label}
                        </h3>
                        <div className="space-y-2">
                          {group.items.map(item => {
                            const isChatPinned = pinnedChats.some(c => c.id === item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => { loadHistoryChat(item); setHeaderTab('lens'); }}
                                className="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group"
                                style={{
                                  backgroundColor: activeChatId === item.id ? SURFACE : 'transparent',
                                  border: `1px solid ${activeChatId === item.id ? BORDER : 'transparent'}`,
                                }}
                                onMouseEnter={(e) => {
                                  if (activeChatId !== item.id) {
                                    e.currentTarget.style.backgroundColor = HOVER_BG;
                                    e.currentTarget.style.borderColor = BORDER;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (activeChatId !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'transparent';
                                  }
                                }}
                              >
                                <span className="text-sm truncate" style={{ color: TEXT_PRIMARY, fontWeight: 500 }}>
                                  {item.title}
                                </span>
                                {isChatPinned && (
                                  <Pin size={14} style={{ color: ACCENT, flexShrink: 0, marginLeft: 8 }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LENS VIEW (Empty State & Chat) ── */}
          {headerTab === 'lens' && (
            <>
              {/* ── EMPTY STATE ── */}
              <AnimatePresence>
                {!hasMessages && (
              <motion.div className="flex-1 flex flex-col items-center justify-center text-center px-6" style={{ paddingBottom: 40 }}
                initial={{ opacity: 1 }} exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}>
                <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <LensSparkle size={48} className="mb-5 mx-auto" />
                </motion.div>

                <motion.h2 className="tracking-tight mb-3"
                  style={{ color: TEXT_PRIMARY, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 600 }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  Ask <span style={{ color: ACCENT }}>Lens</span> anything
                </motion.h2>

                <motion.p className="max-w-md mx-auto mb-10" style={{ color: TEXT_MUTED, fontSize: 15 }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
                  Six layers of intelligence, ready to answer real business questions.
                </motion.p>

                <motion.div className="w-full max-w-2xl mx-auto mb-7"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  {queryCounterBadge}
                  {inputBar(true)}
                </motion.div>

                {/* Suggestion chips */}
                <motion.div className="flex flex-wrap justify-center gap-2.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
                  {SUGGESTION_CHIPS.map((qa, i) => (
                    <motion.button key={qa.shortLabel + i}
                      className="rounded-full cursor-pointer transition-colors flex items-center gap-2"
                      style={{ padding: '10px 18px', fontSize: 14, backgroundColor: 'rgba(0,0,0,0)', border: `1px solid ${BORDER}`, color: TEXT_SECONDARY }}
                      whileHover={{ borderColor: `${qa.layerColor}50`, backgroundColor: HOVER_BG, color: TEXT_PRIMARY }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSend(qa.question)}
                      layout
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: qa.layerColor, boxShadow: `0 0 6px ${qa.layerColor}50` }} />
                      {qa.shortLabel}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div className="mt-8 text-xs font-mono tracking-[0.25em]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <span className="px-4 py-1.5 rounded-full" style={{ backgroundColor: `${ACCENT}08`, border: `1px solid ${ACCENT}20`, color: ACCENT }}>
                    INTERACTIVE DEMO
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CHAT STATE ── */}
          <AnimatePresence>
            {hasMessages && (
              <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.1 }}>
                <div className="flex items-center justify-between px-6 pb-3">
                  <div className="flex items-center gap-3">
                    <LensSparkle size={20} />
                    <span style={{ color: TEXT_SECONDARY, fontSize: 15 }}>Lens</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: `${ACCENT}12`, color: ACCENT }}>
                      {selectedModel.name}
                    </span>
                    {deepAnalysis && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F4A26118', color: '#F4A261' }}>Deep</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Pin / Unpin button */}
                    {onPinChat && messages.length > 0 && (() => {
                      const chatId = activeChatId || `live-${messages[0]?.id}`;
                      const isPinned = pinnedChats.some(c => c.id === chatId);
                      return (
                        <button
                          onClick={() => {
                            if (isPinned) {
                              // Unpin: remove from Dashboard pinned data, but keep in chat memory
                              onUnpinChat?.(chatId);
                              markPinned(chatId, false);
                              showToast('Unpinned from Dashboard — chat still saved');
                            } else {
                              // Pin: save to Dashboard pinned data + mark in storage
                              const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
                              const firstUser = messages.find(m => m.role === 'user');
                              onPinChat({
                                id: chatId,
                                title: activeChatId
                                  ? (mergedHistory.flatMap(g => g.items).find(h => h.id === activeChatId)?.title || firstUser?.text.slice(0, 50) || 'Lens Chat')
                                  : (firstUser?.text.slice(0, 50) || 'Lens Chat'),
                                summary: lastAssistant ? lastAssistant.text.slice(0, 140) + (lastAssistant.text.length > 140 ? '...' : '') : 'No response yet',
                                layer: lastAssistant?.layer,
                                layerColor: lastAssistant?.layerColor,
                                messageCount: messages.length,
                                pinnedAt: Date.now(),
                              });
                              markPinned(chatId, true);
                              // Also ensure the chat is saved to storage
                              saveCurrent();
                              showToast('Pinned to Dashboard');
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                          style={{
                            fontSize: 13,
                            color: isPinned ? ACCENT : TEXT_MUTED,
                            backgroundColor: isPinned ? `${ACCENT}10` : 'rgba(0,0,0,0)',
                            border: `1px solid ${isPinned ? `${ACCENT}30` : 'rgba(0,0,0,0)'}`,
                          }}
                          onMouseEnter={(e) => { if (!isPinned) { e.currentTarget.style.backgroundColor = HOVER_BG; e.currentTarget.style.color = TEXT_SECONDARY; }}}
                          onMouseLeave={(e) => { if (!isPinned) { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.color = TEXT_MUTED; }}}
                        >
                          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                          {isPinned ? 'Unpin' : 'Pin to Dashboard'}
                        </button>
                      );
                    })()}
                    <button onClick={handleReset} className="flex items-center gap-2 cursor-pointer transition-colors" style={{ color: TEXT_MUTED, fontSize: 14 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_SECONDARY)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}>
                      <RotateCcw className="w-3.5 h-3.5" /> New chat
                    </button>
                  </div>
                </div>

                <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} rgba(0,0,0,0)` }}>
                  <div className="max-w-3xl mx-auto space-y-8">
                    {messages.map(msg => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {msg.role === 'user' ? (
                          <div className="flex justify-end">
                            <div className="max-w-[75%] px-5 py-3.5 rounded-2xl rounded-br-md" style={{ backgroundColor: SURFACE, color: TEXT_PRIMARY, fontSize: 16, lineHeight: 1.7 }}>
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {msg.layer && (
                              <div className="flex items-center gap-2.5 pl-1">
                                <LensSparkle size={18} />
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider"
                                  style={{ backgroundColor: `${msg.layerColor}12`, border: `1px solid ${msg.layerColor}25`, color: msg.layerColor }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.layerColor, boxShadow: `0 0 6px ${msg.layerColor}70` }} />
                                  {msg.layer}
                                </div>
                              </div>
                            )}
                            <div className="pl-1" style={{ color: TEXT_PRIMARY, fontSize: 16, lineHeight: 1.85 }}>{msg.text}</div>
                            {msg.followUp && (
                              <div className="ml-1 mt-3 pl-5 leading-relaxed" style={{ borderLeft: `2px solid ${msg.layerColor}30`, color: TEXT_SECONDARY, fontSize: 14 }}>
                                <span style={{ color: msg.layerColor, opacity: 0.85 }}>Insight — </span>{msg.followUp}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    <AnimatePresence>
                      {isTyping && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 pl-1">
                          <LensSparkle size={18} />
                          <div className="flex items-center gap-2">
                            {[0, 1, 2].map(i => (
                              <motion.div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }}
                                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                            ))}
                          </div>
                          {activeLayer && <span style={{ color: TEXT_MUTED, fontSize: 14 }}>Querying {activeLayer}…</span>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="px-6 pt-3 pb-6">
                  <div className="max-w-3xl mx-auto">{queryCounterBadge}{inputBar(false)}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}

          {/* ── Bottom bar ── */}
          <div className="flex items-center justify-end gap-2 px-4 flex-shrink-0" style={{ height: 44 }}>
            <button onClick={() => embedded ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/delt-ai')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: TEXT_MUTED, fontSize: 12 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_SECONDARY; e.currentTarget.style.backgroundColor = HOVER_BG; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={12} /> Back to site
            </button>
            <button onClick={() => setHelpOpen(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
              style={{ backgroundColor: SURFACE, color: TEXT_MUTED, border: `1px solid ${BORDER}` }}
              onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_SECONDARY; e.currentTarget.style.borderColor = TEXT_FAINT; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.borderColor = BORDER; }}
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════ */}

      {/* Settings modal */}
      <ThemedModalOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <div style={{ width: 420 }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h3 style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>Settings</h3>
            <ThemedHoverBtn onClick={() => setSettingsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"><X size={18} /></ThemedHoverBtn>
          </div>
          <div className="py-2">
            {settingsSections.map(s => (
              <button key={s.label} onClick={s.action}
                className="w-full text-left px-6 py-3.5 flex items-center gap-4 cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(0,0,0,0)', color: TEXT_PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = HOVER_BG)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
              >
                <s.icon size={18} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14 }}>{s.label}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 1 }}>{s.desc}</div>
                </div>
                <ChevronRight size={14} style={{ color: TEXT_FAINT }} />
              </button>
            ))}
          </div>
        </div>
      </ThemedModalOverlay>

      {/* Export modal */}
      <ThemedModalOverlay open={exportOpen} onClose={() => setExportOpen(false)}>
        <div style={{ width: 360 }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h3 style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>Export Chat</h3>
            <ThemedHoverBtn onClick={() => setExportOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"><X size={18} /></ThemedHoverBtn>
          </div>
          <div className="py-2">
            {[
              { icon: Copy, label: 'Copy to clipboard', desc: 'Paste anywhere', action: copyToClipboard },
              { icon: FileText, label: 'Download as .txt', desc: 'Plain text file', action: exportAsText },
            ].map(opt => (
              <button key={opt.label} onClick={opt.action}
                className="w-full text-left px-6 py-3.5 flex items-center gap-4 cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(0,0,0,0)', color: TEXT_PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = HOVER_BG)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
              >
                <opt.icon size={18} style={{ color: TEXT_MUTED }} />
                <div>
                  <div style={{ fontSize: 14 }}>{opt.label}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 12 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ThemedModalOverlay>

      {/* Help modal */}
      <ThemedModalOverlay open={helpOpen} onClose={() => setHelpOpen(false)}>
        <div style={{ width: 440 }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2">
              <LensSparkle size={20} />
              <h3 style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>How Lens Works</h3>
            </div>
            <ThemedHoverBtn onClick={() => setHelpOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"><X size={18} /></ThemedHoverBtn>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div>
              <div style={{ color: TEXT_SECONDARY, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Ask natural questions</div>
              <div style={{ color: TEXT_MUTED, fontSize: 13, lineHeight: 1.7 }}>
                Type any business question in plain English. Lens automatically routes it to the right AI layer for the most accurate answer.
              </div>
            </div>
            <div>
              <div style={{ color: TEXT_SECONDARY, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Six specialized layers</div>
              <div className="space-y-2">
                {LAYER_DETAILS.map(l => (
                  <div key={l.key} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span style={{ color: TEXT_MUTED, fontSize: 12 }}><span style={{ color: TEXT_PRIMARY }}>{l.name}</span> — {l.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: TEXT_SECONDARY, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Keyboard shortcuts</div>
              <div className="space-y-1.5">
                {[
                  { keys: 'Enter', desc: 'Send message' },
                  { keys: '/', desc: 'Focus input' },
                ].map(s => (
                  <div key={s.keys} className="flex items-center gap-3">
                    <kbd className="px-2 py-0.5 rounded" style={{ backgroundColor: SURFACE, color: TEXT_SECONDARY, fontSize: 12, border: `1px solid ${BORDER}` }}>{s.keys}</kbd>
                    <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div style={{ color: TEXT_MUTED, fontSize: 11 }}>This is an interactive demo. In production, Lens connects to your live business data.</div>
            </div>
          </div>
        </div>
      </ThemedModalOverlay>
    </section>
  );
}
