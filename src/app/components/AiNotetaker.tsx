import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Copy,
  Download,
  Share2,
  MoreHorizontal,
  Sparkles,
  MessageSquare,
  ListChecks,
  Lightbulb,
  ArrowRight,
  X,
  Check,
  Calendar,
  Video,
  Phone,
  Zap,
  BookOpen,
  Hash,
  Tag,
  Star,
  StarOff,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react';

/* ── Palette ── */
const BLUE = '#4945FF';
const NAVY = '#041E42';
const WHITE = '#FFFFFF';

/* ── Types ── */
interface TranscriptSegment {
  id: string;
  speaker: string;
  speakerInitials: string;
  speakerColor: string;
  timestamp: string;
  text: string;
  isHighlighted?: boolean;
}

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  due?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: { name: string; initials: string; color: string }[];
  type: 'video' | 'phone' | 'in-person';
  starred: boolean;
  tags: string[];
  summary: string;
  keyTopics: string[];
  actionItems: ActionItem[];
  transcript: TranscriptSegment[];
  sentiment: 'positive' | 'neutral' | 'mixed';
}

/* ── Mock data ── */
const MEETINGS: MeetingNote[] = [
  {
    id: 'm1',
    title: 'Q1 Revenue Strategy & Growth Planning',
    date: 'Mar 3, 2026 · 10:00 AM',
    duration: '47 min',
    participants: [
      { name: 'Sarah Johnson', initials: 'SJ', color: BLUE },
      { name: 'Michael Chen', initials: 'MC', color: '#0A2E5C' },
      { name: 'Emily Rodriguez', initials: 'ER', color: '#6B68FF' },
      { name: 'David Kim', initials: 'DK', color: NAVY },
    ],
    type: 'video',
    starred: true,
    tags: ['strategy', 'revenue', 'Q1'],
    summary: 'The team aligned on Q1 revenue targets of $1.2M with a focus on expanding the Downtown location and launching the new loyalty program. Key concerns around staffing during peak hours were addressed with a proposal to hire 3 part-time employees. The marketing budget was approved for a 15% increase to support the spring campaign.',
    keyTopics: [
      'Q1 revenue target: $1.2M (+18% YoY)',
      'Downtown expansion timeline moved to April',
      'Loyalty program soft launch scheduled for March 15',
      'Spring marketing campaign budget approved ($24K)',
      'Staffing plan for peak hours finalized',
    ],
    actionItems: [
      { id: 'a1', text: 'Draft the loyalty program rollout plan with tiered rewards structure', assignee: 'Emily Rodriguez', due: 'Mar 7', completed: false, priority: 'high' },
      { id: 'a2', text: 'Post 3 part-time barista positions on job board', assignee: 'Sarah Johnson', due: 'Mar 5', completed: true, priority: 'high' },
      { id: 'a3', text: 'Finalize spring campaign creative assets with agency', assignee: 'Michael Chen', due: 'Mar 10', completed: false, priority: 'medium' },
      { id: 'a4', text: 'Send Downtown lease amendment to legal for review', assignee: 'David Kim', due: 'Mar 12', completed: false, priority: 'medium' },
      { id: 'a5', text: 'Set up analytics tracking for loyalty program KPIs', assignee: 'Michael Chen', due: 'Mar 14', completed: false, priority: 'low' },
    ],
    transcript: [
      { id: 't1', speaker: 'Sarah Johnson', speakerInitials: 'SJ', speakerColor: BLUE, timestamp: '0:00', text: "Good morning everyone. Let's kick off our Q1 strategy session. I've pulled together the numbers from last quarter and I think we have a real opportunity here." },
      { id: 't2', speaker: 'Michael Chen', speakerInitials: 'MC', speakerColor: '#0A2E5C', timestamp: '0:32', text: "The December numbers were strong — $420K total. If we can maintain that momentum and layer in the loyalty program, hitting $1.2M for Q1 is very achievable." },
      { id: 't3', speaker: 'Emily Rodriguez', speakerInitials: 'ER', speakerColor: '#6B68FF', timestamp: '1:15', text: "I've been working on the loyalty program structure. We're looking at three tiers — Bronze, Silver, and Gold — with escalating rewards. The soft launch could be ready by March 15th if we lock down the tech integration this week.", isHighlighted: true },
      { id: 't4', speaker: 'David Kim', speakerInitials: 'DK', speakerColor: NAVY, timestamp: '2:08', text: "On the Downtown expansion — I spoke with the landlord. They're amenable to the lease amendment but want a 5-year commitment. I think it's worth it given the foot traffic data." },
      { id: 't5', speaker: 'Sarah Johnson', speakerInitials: 'SJ', speakerColor: BLUE, timestamp: '2:45', text: "Agreed. The Downtown location alone did $412K last quarter. David, can you get that amendment to legal this week? I want to move fast before the spring leasing cycle." },
      { id: 't6', speaker: 'Michael Chen', speakerInitials: 'MC', speakerColor: '#0A2E5C', timestamp: '3:22', text: "For the spring campaign, I'm proposing we increase the marketing budget by 15%. That gives us $24K to work with. I want to do a mix of local digital ads and an influencer partnership.", isHighlighted: true },
      { id: 't7', speaker: 'Emily Rodriguez', speakerInitials: 'ER', speakerColor: '#6B68FF', timestamp: '4:01', text: "The influencer angle worked well last fall. We saw a 34% lift in new customer visits during that two-week window. I'd support doubling down on that." },
      { id: 't8', speaker: 'Sarah Johnson', speakerInitials: 'SJ', speakerColor: BLUE, timestamp: '4:38', text: "Budget approved. Michael, coordinate with the agency on creative assets. I want everything finalized by March 10th so we can launch mid-month alongside the loyalty program." },
      { id: 't9', speaker: 'David Kim', speakerInitials: 'DK', speakerColor: NAVY, timestamp: '5:15', text: "One concern — staffing. The Downtown and Capitol Hill locations are stretched thin during the 7-9 AM and 12-1 PM rushes. If we're driving more traffic, we need bodies." },
      { id: 't10', speaker: 'Sarah Johnson', speakerInitials: 'SJ', speakerColor: BLUE, timestamp: '5:48', text: "Good point. I'll post three part-time positions this week. We should have people trained and ready by the campaign launch. Let's plan for overlap shifts during peak hours." },
    ],
    sentiment: 'positive',
  },
  {
    id: 'm2',
    title: 'Weekly Product Sync — Sprint 14 Review',
    date: 'Mar 2, 2026 · 2:00 PM',
    duration: '32 min',
    participants: [
      { name: 'Sarah Johnson', initials: 'SJ', color: BLUE },
      { name: 'Alex Park', initials: 'AP', color: '#0A2E5C' },
      { name: 'Lisa Wang', initials: 'LW', color: '#6B68FF' },
    ],
    type: 'video',
    starred: false,
    tags: ['product', 'sprint', 'engineering'],
    summary: 'Sprint 14 delivered 8 of 10 planned story points. The POS integration hit a snag with the payment gateway API rate limits. Team agreed to implement caching as a workaround. Mobile app beta feedback was mostly positive with a 4.2/5 satisfaction score.',
    keyTopics: [
      'Sprint 14: 8/10 story points completed',
      'POS integration delayed — API rate limit issue',
      'Mobile app beta: 4.2/5 satisfaction',
      'Caching layer proposed as API workaround',
      'Sprint 15 planning: focus on checkout flow',
    ],
    actionItems: [
      { id: 'b1', text: 'Implement API response caching layer for POS integration', assignee: 'Alex Park', due: 'Mar 6', completed: false, priority: 'high' },
      { id: 'b2', text: 'Compile mobile beta feedback report with priority rankings', assignee: 'Lisa Wang', due: 'Mar 4', completed: true, priority: 'medium' },
      { id: 'b3', text: 'Schedule design review for new checkout flow mockups', assignee: 'Sarah Johnson', due: 'Mar 5', completed: false, priority: 'medium' },
    ],
    transcript: [
      { id: 's1', speaker: 'Sarah Johnson', speakerInitials: 'SJ', speakerColor: BLUE, timestamp: '0:00', text: "Let's review Sprint 14. Alex, can you walk us through what shipped?" },
      { id: 's2', speaker: 'Alex Park', speakerInitials: 'AP', speakerColor: '#0A2E5C', timestamp: '0:15', text: "We completed 8 of our 10 planned story points. The two that slipped were both related to the POS payment gateway integration. We're hitting rate limits on their API during peak transaction volumes." },
      { id: 's3', speaker: 'Lisa Wang', speakerInitials: 'LW', speakerColor: '#6B68FF', timestamp: '0:52', text: "On the mobile side, the beta feedback came in strong. 4.2 out of 5 overall satisfaction. The main complaints were around the order history loading time and a minor layout issue on smaller screens." },
    ],
    sentiment: 'neutral',
  },
  {
    id: 'm3',
    title: 'Customer Success — Churn Risk Review',
    date: 'Feb 28, 2026 · 11:00 AM',
    duration: '28 min',
    participants: [
      { name: 'Sarah Johnson', initials: 'SJ', color: BLUE },
      { name: 'Rachel Torres', initials: 'RT', color: '#6B68FF' },
    ],
    type: 'phone',
    starred: false,
    tags: ['customers', 'retention', 'churn'],
    summary: 'Reviewed 14 high-value customers flagged by Lens AI as churn risks. Agreed to launch a targeted retention campaign with personalized offers. Rachel will segment the list and draft outreach emails by end of week.',
    keyTopics: [
      '14 high-value customers at churn risk',
      '$8,400/month in at-risk revenue',
      'Personalized retention campaign approved',
      'Win-back offer: 20% off + free loyalty upgrade',
    ],
    actionItems: [
      { id: 'c1', text: 'Segment churn-risk customers by visit frequency decline pattern', assignee: 'Rachel Torres', due: 'Mar 3', completed: true, priority: 'high' },
      { id: 'c2', text: 'Draft personalized win-back email templates (3 variants)', assignee: 'Rachel Torres', due: 'Mar 5', completed: false, priority: 'high' },
    ],
    transcript: [],
    sentiment: 'mixed',
  },
  {
    id: 'm4',
    title: 'Vendor Negotiation — Metro Foods Contract',
    date: 'Feb 26, 2026 · 3:30 PM',
    duration: '19 min',
    participants: [
      { name: 'David Kim', initials: 'DK', color: NAVY },
      { name: 'Sarah Johnson', initials: 'SJ', color: BLUE },
    ],
    type: 'phone',
    starred: true,
    tags: ['vendor', 'procurement', 'cost'],
    summary: 'Discussed the 22% price increase from Metro Foods flagged by Guardian. David negotiated a 12% compromise with a volume commitment. New contract terms to be finalized by March 10.',
    keyTopics: [
      'Metro Foods invoice 22% above contract',
      'Negotiated down to 12% increase',
      'Volume commitment: 15% more orders/month',
      'New contract effective April 1',
    ],
    actionItems: [
      { id: 'd1', text: 'Draft revised Metro Foods contract with 12% price adjustment', assignee: 'David Kim', due: 'Mar 10', completed: false, priority: 'medium' },
    ],
    transcript: [],
    sentiment: 'neutral',
  },
];

/* ── Live recording wave animation ── */
function RecordingWave() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[#EF4444]"
          animate={{ height: [6, 14 + Math.random() * 8, 6] }}
          transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

/* ── Typing dots ── */
function AiProcessingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#4945FF]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/* ── Priority badge ── */
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-[#FEE2E2] text-[#EF4444]',
    medium: 'bg-[#4945FF]/10 text-[#4945FF]',
    low: 'bg-[#041E42]/5 text-[#041E42]/50',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${styles[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

/* ── Sentiment indicator ── */
function SentimentBadge({ sentiment }: { sentiment: 'positive' | 'neutral' | 'mixed' }) {
  const config = {
    positive: { label: 'Positive', color: 'text-[#10B981]', bg: 'bg-[#D1FAE5]' },
    neutral: { label: 'Neutral', color: 'text-[#041E42]/60', bg: 'bg-[#041E42]/5' },
    mixed: { label: 'Mixed', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  };
  const c = config[sentiment];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.color}`}>{c.label}</span>;
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export function AiNotetaker() {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingNote>(MEETINGS[0]);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'actions'>('summary');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'starred'>('all');
  const [actionItems, setActionItems] = useState<ActionItem[]>(MEETINGS[0].actionItems);
  const [aiInsightOpen, setAiInsightOpen] = useState(false);
  const [aiInsightText, setAiInsightText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Update action items when meeting changes
  useEffect(() => {
    setActionItems(selectedMeeting.actionItems);
    setActiveTab('summary');
    setAiInsightOpen(false);
  }, [selectedMeeting]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleAction = (id: string) => {
    setActionItems(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateAiInsight = () => {
    setAiInsightOpen(true);
    setIsAiThinking(true);
    setAiInsightText('');
    setTimeout(() => {
      setIsAiThinking(false);
      setAiInsightText(
        `Based on this meeting, here are 3 strategic observations:\n\n` +
        `1. **Revenue Acceleration** — The combination of the loyalty program launch and spring marketing campaign creates a compounding growth opportunity. Consider timing them within the same week for maximum impact.\n\n` +
        `2. **Staffing Risk** — The 3 part-time hires need to be onboarded and trained before the campaign drives new traffic. Current timeline is tight — recommend starting interviews by Mar 6 at the latest.\n\n` +
        `3. **Cross-Initiative Dependencies** — The Downtown expansion, loyalty program, and marketing campaign are all interdependent. A delay in any one could cascade. Suggest creating a shared milestone tracker across all three workstreams.`
      );
    }, 2200);
  };

  const filteredMeetings = MEETINGS.filter(m => {
    if (sidebarFilter === 'starred' && !m.starred) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.tags.some(t => t.includes(q));
    }
    return true;
  });

  const TypeIcon = selectedMeeting.type === 'video' ? Video : selectedMeeting.type === 'phone' ? Phone : Users;

  return (
    <div className="h-full flex bg-[#F5F7FA] overflow-hidden">
      {/* ── LEFT: Meeting list sidebar ── */}
      <div className="w-80 bg-white border-r border-[#041E42]/10 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[#041E42]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4945FF] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#041E42] text-sm" style={{ fontWeight: 700 }}>AI Notetaker</span>
            </div>
            <button
              onClick={() => setShowNewMeetingModal(true)}
              className="w-8 h-8 rounded-lg bg-[#4945FF]/10 flex items-center justify-center text-[#4945FF] hover:bg-[#4945FF]/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#041E42]/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full pl-9 pr-3 py-2 border border-[#041E42]/10 rounded-lg text-sm text-[#041E42] placeholder-[#041E42]/30 focus:outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10 transition-all bg-white"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setSidebarFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sidebarFilter === 'all' ? 'bg-[#080A28] text-white' : 'text-[#041E42]/50 hover:bg-[#041E42]/5'
              }`}
            >
              All meetings
            </button>
            <button
              onClick={() => setSidebarFilter('starred')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                sidebarFilter === 'starred' ? 'bg-[#080A28] text-white' : 'text-[#041E42]/50 hover:bg-[#041E42]/5'
              }`}
            >
              <Star className="w-3 h-3" />
              Starred
            </button>
          </div>
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-[#041E42]/10 overflow-hidden"
            >
              <div className="p-4 bg-[#FEE2E2]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444] animate-pulse" />
                    <span className="text-sm text-[#041E42]" style={{ fontWeight: 600 }}>Recording...</span>
                    <span className="text-sm text-[#041E42]/50 font-mono">{formatTime(recordingTime)}</span>
                  </div>
                  <RecordingWave />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meeting list */}
        <div className="flex-1 overflow-y-auto">
          {filteredMeetings.map(meeting => (
            <button
              key={meeting.id}
              onClick={() => setSelectedMeeting(meeting)}
              className={`w-full text-left p-4 border-b border-[#041E42]/5 transition-colors ${
                selectedMeeting.id === meeting.id
                  ? 'bg-[#4945FF]/5 border-l-[3px] border-l-[#4945FF]'
                  : 'hover:bg-[#041E42]/3 border-l-[3px] border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className={`text-sm ${selectedMeeting.id === meeting.id ? 'text-[#041E42]' : 'text-[#041E42]/80'}`} style={{ fontWeight: 600, lineHeight: '1.3' }}>
                  {meeting.title}
                </span>
                {meeting.starred && <Star className="w-3.5 h-3.5 text-[#4945FF] flex-shrink-0 mt-0.5 ml-2 fill-[#4945FF]" />}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#041E42]/40 mb-2">
                <Clock className="w-3 h-3" />
                <span>{meeting.date}</span>
                <span>·</span>
                <span>{meeting.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {meeting.participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] border border-white" style={{ backgroundColor: p.color, fontWeight: 600 }}>
                      {p.initials}
                    </div>
                  ))}
                  {meeting.participants.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-[#041E42]/10 flex items-center justify-center text-[8px] text-[#041E42]/50 border border-white" style={{ fontWeight: 600 }}>
                      +{meeting.participants.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-auto">
                  {meeting.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#041E42]/5 text-[#041E42]/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Record button */}
        <div className="p-4 border-t border-[#041E42]/10">
          <button
            onClick={() => { setIsRecording(!isRecording); if (isRecording) setRecordingTime(0); }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all ${
              isRecording
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                : 'bg-[#4945FF] text-white hover:bg-[#3730FF]'
            }`}
            style={{ fontWeight: 600 }}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Recording
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Meeting detail ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-[#041E42]/10 px-6 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-[#041E42] mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedMeeting.title}</h1>
              <div className="flex items-center gap-3 text-xs text-[#041E42]/40">
                <div className="flex items-center gap-1">
                  <TypeIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{selectedMeeting.type}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedMeeting.date}
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedMeeting.duration}
                </div>
                <span>·</span>
                <SentimentBadge sentiment={selectedMeeting.sentiment} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateAiInsight}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4945FF]/10 text-[#4945FF] rounded-lg text-xs hover:bg-[#4945FF]/20 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Insights
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/40 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/40 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/40 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-[#041E42]/40 uppercase tracking-wider" style={{ fontWeight: 600 }}>Participants</span>
            <div className="flex items-center gap-1.5">
              {selectedMeeting.participants.map((p, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#041E42]/5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px]" style={{ backgroundColor: p.color, fontWeight: 700 }}>
                    {p.initials}
                  </div>
                  <span className="text-[11px] text-[#041E42]/70">{p.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1">
            {([
              { id: 'summary' as const, label: 'Summary', icon: FileText },
              { id: 'transcript' as const, label: 'Transcript', icon: MessageSquare },
              { id: 'actions' as const, label: `Action Items (${actionItems.length})`, icon: ListChecks },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#080A28] text-white'
                    : 'text-[#041E42]/50 hover:bg-[#041E42]/5 hover:text-[#041E42]'
                }`}
                style={{ fontWeight: activeTab === tab.id ? 600 : 500 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">

            {/* AI Insight Panel */}
            <AnimatePresence>
              {aiInsightOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-[#4945FF]/5 to-[#6B68FF]/5 border border-[#4945FF]/15 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#4945FF]" />
                        <span className="text-sm text-[#041E42]" style={{ fontWeight: 700 }}>AI Strategic Insights</span>
                      </div>
                      <button onClick={() => setAiInsightOpen(false)} className="w-6 h-6 rounded-full hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/30">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isAiThinking ? (
                      <div className="flex items-center gap-3 py-4">
                        <AiProcessingDots />
                        <span className="text-sm text-[#041E42]/50">Analyzing meeting context and generating insights...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-[#041E42]/70 leading-relaxed whitespace-pre-line">
                        {aiInsightText.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i} className="text-[#041E42]">{part}</strong> : <span key={i}>{part}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {/* AI Summary */}
                <div className="bg-white rounded-xl border border-[#041E42]/10 p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#4945FF]" />
                      <span className="text-sm text-[#041E42]" style={{ fontWeight: 700 }}>AI Summary</span>
                    </div>
                    <button
                      onClick={() => copyText(selectedMeeting.summary, 'summary')}
                      className="flex items-center gap-1 text-[11px] text-[#041E42]/40 hover:text-[#4945FF] transition-colors"
                    >
                      {copiedId === 'summary' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'summary' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-[#041E42]/70 leading-relaxed">{selectedMeeting.summary}</p>
                </div>

                {/* Key Topics */}
                <div className="bg-white rounded-xl border border-[#041E42]/10 p-6 mb-6">
                  <h3 className="text-sm text-[#041E42] mb-4" style={{ fontWeight: 700 }}>Key Topics & Decisions</h3>
                  <div className="space-y-3">
                    {selectedMeeting.keyTopics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#4945FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] text-[#4945FF]" style={{ fontWeight: 700 }}>{i + 1}</span>
                        </div>
                        <span className="text-sm text-[#041E42]/70">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick action items preview */}
                <div className="bg-white rounded-xl border border-[#041E42]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-[#041E42]" style={{ fontWeight: 700 }}>Action Items</h3>
                    <button onClick={() => setActiveTab('actions')} className="text-xs text-[#4945FF] hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {actionItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <button onClick={() => toggleAction(item.id)}>
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#041E42]/20" />
                          )}
                        </button>
                        <span className={`text-sm flex-1 ${item.completed ? 'line-through text-[#041E42]/30' : 'text-[#041E42]/70'}`}>
                          {item.text}
                        </span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transcript Tab */}
            {activeTab === 'transcript' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {selectedMeeting.transcript.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-[#041E42]/10 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#4945FF]/8 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-7 h-7 text-[#4945FF]" />
                    </div>
                    <h3 className="text-[#041E42] mb-2" style={{ fontWeight: 600 }}>No transcript available</h3>
                    <p className="text-sm text-[#041E42]/40 max-w-sm mx-auto">This meeting was recorded without live transcription. You can upload an audio file to generate a transcript.</p>
                    <button className="mt-4 px-4 py-2 bg-[#4945FF] text-white rounded-lg text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
                      Upload Audio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedMeeting.transcript.map((segment, i) => (
                      <div
                        key={segment.id}
                        className={`group flex gap-3 p-3 rounded-lg transition-colors ${
                          segment.isHighlighted ? 'bg-[#4945FF]/5 border-l-[3px] border-l-[#4945FF]' : 'hover:bg-white border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: segment.speakerColor, fontWeight: 700 }}>
                            {segment.speakerInitials}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-[#041E42]" style={{ fontWeight: 700 }}>{segment.speaker}</span>
                            <span className="text-[10px] text-[#041E42]/30 font-mono">{segment.timestamp}</span>
                            {segment.isHighlighted && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4945FF]/10 text-[#4945FF]" style={{ fontWeight: 600 }}>KEY MOMENT</span>
                            )}
                          </div>
                          <p className="text-sm text-[#041E42]/70 leading-relaxed">{segment.text}</p>
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyText(segment.text, segment.id)}
                            className="w-7 h-7 rounded-md hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/30"
                          >
                            {copiedId === segment.id ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Items Tab */}
            {activeTab === 'actions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {/* Progress bar */}
                <div className="bg-white rounded-xl border border-[#041E42]/10 p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#041E42]" style={{ fontWeight: 700 }}>Completion Progress</span>
                    <span className="text-sm text-[#041E42]/50">
                      {actionItems.filter(a => a.completed).length} of {actionItems.length} done
                    </span>
                  </div>
                  <div className="w-full bg-[#041E42]/5 rounded-full h-2.5">
                    <motion.div
                      className="bg-[#10B981] h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(actionItems.filter(a => a.completed).length / actionItems.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Action items list */}
                <div className="bg-white rounded-xl border border-[#041E42]/10 overflow-hidden">
                  {actionItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-4 transition-colors ${
                        i < actionItems.length - 1 ? 'border-b border-[#041E42]/5' : ''
                      } ${item.completed ? 'bg-[#041E42]/2' : 'hover:bg-[#041E42]/2'}`}
                    >
                      <button onClick={() => toggleAction(item.id)} className="mt-0.5 flex-shrink-0">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#041E42]/20 hover:text-[#4945FF] transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1.5 ${item.completed ? 'line-through text-[#041E42]/30' : 'text-[#041E42]/80'}`}>
                          {item.text}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-[#041E42]/40">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.assignee}
                          </div>
                          {item.due && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due {item.due}
                            </div>
                          )}
                        </div>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      <AnimatePresence>
        {showNewMeetingModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewMeetingModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-[480px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#041E42]" style={{ fontSize: '1.15rem', fontWeight: 700 }}>New Meeting Note</h2>
                  <button onClick={() => setShowNewMeetingModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#041E42]/5 flex items-center justify-center text-[#041E42]/40">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#041E42]/50 mb-1.5 block" style={{ fontWeight: 600 }}>Meeting Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Weekly Team Standup"
                      className="w-full px-3 py-2.5 border border-[#041E42]/10 rounded-lg text-sm text-[#041E42] placeholder-[#041E42]/30 focus:outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#041E42]/50 mb-1.5 block" style={{ fontWeight: 600 }}>Meeting Type</label>
                    <div className="flex gap-2">
                      {[
                        { icon: Video, label: 'Video Call' },
                        { icon: Phone, label: 'Phone' },
                        { icon: Users, label: 'In Person' },
                      ].map(opt => (
                        <button key={opt.label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#041E42]/10 rounded-lg text-sm text-[#041E42]/60 hover:border-[#4945FF]/30 hover:text-[#4945FF] hover:bg-[#4945FF]/5 transition-all">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#041E42]/50 mb-1.5 block" style={{ fontWeight: 600 }}>Tags</label>
                    <input
                      type="text"
                      placeholder="e.g., strategy, weekly, product"
                      className="w-full px-3 py-2.5 border border-[#041E42]/10 rounded-lg text-sm text-[#041E42] placeholder-[#041E42]/30 focus:outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowNewMeetingModal(false)} className="flex-1 py-2.5 border border-[#041E42]/10 rounded-lg text-sm text-[#041E42]/60 hover:bg-[#041E42]/5 transition-colors" style={{ fontWeight: 600 }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowNewMeetingModal(false); setIsRecording(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4945FF] text-white rounded-lg text-sm hover:bg-[#3730FF] transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <Mic className="w-4 h-4" />
                    Create & Record
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
