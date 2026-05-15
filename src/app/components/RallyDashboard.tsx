import { useState, useRef, useEffect } from 'react';
import {
  Home,
  AlignLeft,
  MessageCircle,
  Bell,
  Activity,
  Briefcase,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  LayoutGrid,
  FileText,
  FolderOpen,
  MessagesSquare,
  Calendar,
  Users,
  Settings,
  MoreHorizontal,
  X,
  Check,
} from 'lucide-react';

const BLUE = '#4945FF';
const NAVY = '#041E42';
const WHITE = '#FFFFFF';

type RallyView = 'home' | 'timeline' | 'chat' | 'notifications' | 'feed' | 'my-stuff' | 'find' | 'assignments';

/* ── Top nav item ── */
function NavItem({ icon: Icon, label, active, onClick, badge }: {
  icon: any; label: string; active: boolean; onClick: () => void; badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm ${
        active
          ? 'text-[#4945FF] bg-[#4945FF]/8'
          : 'text-[#041E42]/60 hover:text-[#041E42] hover:bg-[#041E42]/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      {badge && <span className="w-2 h-2 rounded-full bg-[#4945FF] ml-0.5" />}
    </button>
  );
}

/* ── Empty state card ── */
function EmptyCard({ icon: Icon, title, description, dashed = true }: {
  icon: any; title: string; description: string; dashed?: boolean;
}) {
  return (
    <div className={`rounded-xl p-8 text-center ${
      dashed ? 'border-2 border-dashed border-[#041E42]/15' : 'border border-[#041E42]/10'
    } bg-white`}>
      <div className="w-14 h-14 rounded-full bg-[#4945FF]/8 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#4945FF]" />
      </div>
      <h3 className="text-[#041E42] mb-2" style={{ fontSize: '1.05rem' }}>{title}</h3>
      <p className="text-[#041E42]/50 text-sm max-w-sm mx-auto">{description}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOME VIEW
   ══════════════════════════════════════════════ */
function HomeView() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* User greeting */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#4945FF] flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl" style={{ fontWeight: 600 }}>SJ</span>
        </div>
        <h1 className="text-[#041E42] mb-1" style={{ fontSize: '1.65rem' }}>Welcome back</h1>
        <p className="text-[#041E42]/50 text-sm">Here's what's happening across your projects.</p>
      </div>

      {/* Create / Invite actions */}
      <div className="flex justify-center gap-3 mb-10">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#4945FF] text-white rounded-full text-sm hover:bg-[#3a37d4] transition-colors">
          <Plus className="w-4 h-4" />
          New project
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-[#041E42]/15 text-[#041E42] rounded-full text-sm hover:bg-[#041E42]/5 transition-colors">
          <Users className="w-4 h-4" />
          Invite people
        </button>
      </div>

      {/* Projects section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs tracking-wider text-[#041E42]/40 uppercase" style={{ fontWeight: 600 }}>Projects</span>
        </div>
        <EmptyCard
          icon={Briefcase}
          title="No projects yet"
          description="Create your first project to start organizing work with your team."
        />
      </div>

      {/* Schedule & Assignments */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <span className="text-xs tracking-wider text-[#041E42]/40 uppercase mb-4 block" style={{ fontWeight: 600 }}>Your Schedule</span>
          <MiniCalendar />
        </div>
        <div>
          <span className="text-xs tracking-wider text-[#041E42]/40 uppercase mb-4 block" style={{ fontWeight: 600 }}>Your Assignments</span>
          <EmptyCard
            icon={CheckCircle2}
            title="All clear"
            description="To-dos and cards assigned to you will show up here."
          />
        </div>
      </div>
    </div>
  );
}

/* ── Mini Calendar ── */
function MiniCalendar() {
  const today = new Date();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="border border-[#041E42]/10 rounded-xl bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <button className="w-7 h-7 rounded-full hover:bg-[#041E42]/5 flex items-center justify-center text-[#4945FF]">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-[#041E42]" style={{ fontWeight: 600 }}>{monthNames[month]} {year}</span>
        <button className="w-7 h-7 rounded-full hover:bg-[#041E42]/5 flex items-center justify-center text-[#4945FF]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] text-[#041E42]/40 py-1" style={{ fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`py-1.5 text-sm rounded-lg ${
              day === today.getDate()
                ? 'bg-[#4945FF] text-white'
                : day ? 'text-[#041E42]/70 hover:bg-[#041E42]/5 cursor-pointer' : ''
            }`}
            style={{ fontWeight: day === today.getDate() ? 600 : 400 }}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TIMELINE VIEW
   ══════════════════════════════════════════════ */
function LineupView() {
  const today = new Date();
  const weeks: Date[] = [];
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 42); // 6 weeks back
  for (let i = 0; i < 13; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    weeks.push(d);
  }

  const formatWeek = (d: Date) => {
    const day = d.getDate();
    const mon = d.toLocaleString('en-US', { month: 'short' });
    return `${day} ${mon}`;
  };

  const isTodayWeek = (d: Date) => {
    const weekEnd = new Date(d);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return today >= d && today <= weekEnd;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#041E42]/10">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-sm text-[#041E42]/60 hover:text-[#041E42] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Prev 6 weeks
          </button>
          <button className="px-3 py-1.5 border border-[#041E42]/15 rounded-full text-sm text-[#041E42] hover:bg-[#041E42]/5 transition-colors">
            Add marker
          </button>
        </div>
        {weeks.some(isTodayWeek) && (
          <div className="px-4 py-1.5 bg-[#4945FF] text-white rounded-full text-sm" style={{ fontWeight: 600 }}>
            Today, {today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        )}
        <button className="flex items-center gap-1 text-sm text-[#041E42]/60 hover:text-[#041E42] transition-colors">
          Next 6 weeks
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[900px] h-full flex flex-col">
          {/* Week headers */}
          <div className="flex border-b border-[#041E42]/10">
            {weeks.map((w, i) => (
              <div
                key={i}
                className={`flex-1 text-center py-3 text-xs ${
                  isTodayWeek(w) ? 'text-[#4945FF]' : 'text-[#041E42]/40'
                }`}
                style={{ fontWeight: isTodayWeek(w) ? 600 : 400 }}
              >
                {formatWeek(w)}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="flex-1 flex relative">
            {weeks.map((w, i) => (
              <div
                key={i}
                className={`flex-1 border-r border-[#041E42]/5 ${
                  isTodayWeek(w) ? 'bg-[#4945FF]/3' : ''
                }`}
              />
            ))}

            {/* Today line */}
            {(() => {
              const todayWeekIndex = weeks.findIndex(isTodayWeek);
              if (todayWeekIndex < 0) return null;
              const dayOfWeek = today.getDay();
              const pct = ((todayWeekIndex + dayOfWeek / 7) / weeks.length) * 100;
              return (
                <div
                  className="absolute top-0 bottom-0 w-px bg-[#4945FF]/40"
                  style={{ left: `${pct}%` }}
                />
              );
            })()}

            {/* Empty state centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white border-2 border-dashed border-[#041E42]/15 rounded-xl p-8 text-center max-w-md pointer-events-auto">
                <div className="w-12 h-12 rounded-full bg-[#4945FF]/8 flex items-center justify-center mx-auto mb-3">
                  <AlignLeft className="w-6 h-6 text-[#4945FF]" />
                </div>
                <h3 className="text-[#041E42] mb-2" style={{ fontSize: '1.05rem' }}>Welcome to the Timeline</h3>
                <p className="text-[#041E42]/50 text-sm mb-3">
                  Plot projects on a timeline for a visual snapshot of what's in play, who's working on what, and when projects start and end.
                </p>
                <button className="text-[#4945FF] text-sm hover:underline">
                  Add start/end dates to a project to view it on the Timeline.
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CHAT VIEW
   ══════════════════════════════════════════════ */
function PingsView() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#041E42]/30" />
        <input
          type="text"
          placeholder="Start a private chat with..."
          className="w-full pl-12 pr-5 py-3.5 border border-[#041E42]/15 rounded-xl text-sm text-[#041E42] placeholder-[#041E42]/35 focus:outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10 transition-all bg-white"
        />
      </div>
      <EmptyCard
        icon={MessageCircle}
        title="No chats yet"
        description="Chats are private conversations with one or more people. Start your first conversation by typing someone's name above."
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   NOTIFICATIONS VIEW
   ══════════════════════════════════════════════ */
function HeyView() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-[#4945FF]" style={{ fontWeight: 600 }}>New for you</span>
        <button className="text-sm text-[#041E42]/40 hover:text-[#041E42] transition-colors">Mark all read</button>
      </div>
      <EmptyCard
        icon={Bell}
        title="You're all caught up"
        description="Notifications about messages, to-dos, and updates will appear here."
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   FEED VIEW
   ══════════════════════════════════════════════ */
function ActivityView() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <EmptyCard
        icon={Activity}
        title="No recent activity"
        description="When your team starts working on projects, a feed of everything that's happening will show up here."
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MY STUFF VIEW
   ══════════════════════════════════════════════ */
function MyStuffView() {
  const items = [
    { icon: CheckCircle2, label: 'My assignments' },
    { icon: Briefcase, label: 'My bookmarks' },
    { icon: Calendar, label: 'My schedule' },
    { icon: FileText, label: 'My drafts' },
    { icon: Activity, label: 'My activity' },
  ];
  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <h2 className="text-[#041E42] text-center mb-8" style={{ fontSize: '1.4rem' }}>My Stuff</h2>
      <div className="space-y-2">
        {items.map(item => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#041E42]/10 bg-white hover:border-[#4945FF]/30 hover:bg-[#4945FF]/3 transition-all text-left"
          >
            <item.icon className="w-5 h-5 text-[#4945FF]" />
            <span className="text-sm text-[#041E42]">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-[#041E42]/30 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FIND VIEW
   ══════════════════════════════════════════════ */
function FindView() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#041E42]/30" />
        <input
          type="text"
          placeholder="Search for anything..."
          className="w-full pl-12 pr-5 py-3.5 border border-[#041E42]/15 rounded-xl text-sm text-[#041E42] placeholder-[#041E42]/35 focus:outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10 transition-all bg-white"
        />
      </div>
      <div className="text-center text-sm text-[#041E42]/40">
        <p>Search across all projects, messages, to-dos, and files.</p>
        <p className="mt-1">Press <kbd className="px-2 py-0.5 bg-[#041E42]/5 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-[#041E42]/5 rounded text-xs">J</kbd> anytime to jump.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ASSIGNMENTS VIEW
   ══════════════════════════════════════════════ */
function AssignmentsView() {
  const [tab, setTab] = useState<'mine' | 'assigned'>('mine');
  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#4945FF] flex items-center justify-center mx-auto mb-4">
          <span className="text-white" style={{ fontWeight: 600 }}>SJ</span>
        </div>
        <h1 className="text-[#041E42] mb-4" style={{ fontSize: '1.5rem' }}>Here are your assignments</h1>
        <div className="inline-flex border border-[#041E42]/15 rounded-lg overflow-hidden">
          <button
            onClick={() => setTab('mine')}
            className={`px-5 py-2 text-sm transition-colors ${
              tab === 'mine'
                ? 'bg-[#080A28] text-white'
                : 'bg-white text-[#041E42]/60 hover:text-[#041E42]'
            }`}
          >
            My assignments
          </button>
          <button
            onClick={() => setTab('assigned')}
            className={`px-5 py-2 text-sm transition-colors ${
              tab === 'assigned'
                ? 'bg-[#080A28] text-white'
                : 'bg-white text-[#041E42]/60 hover:text-[#041E42]'
            }`}
          >
            Stuff I've assigned
          </button>
        </div>
      </div>

      <EmptyCard
        icon={CheckCircle2}
        title={tab === 'mine' ? 'Nothing assigned yet' : 'Nothing assigned to others yet'}
        description={
          tab === 'mine'
            ? 'To-dos and cards that are assigned to you will show up here.'
            : 'To-dos and cards that you assign to others will show up here.'
        }
      />

      <div className="text-center mt-6">
        <button className="text-sm text-[#4945FF] border border-[#4945FF]/25 rounded-full px-5 py-2 hover:bg-[#4945FF]/5 transition-colors">
          Emailing my assignments every Monday
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROJECT DETAIL VIEW (when a project is opened)
   ══════════════════════════════════════════════ */
function ProjectDetailView({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#041E42]/50 hover:text-[#041E42] mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <div className="text-center mb-10">
        <h1 className="text-[#041E42] mb-2" style={{ fontSize: '1.65rem' }}>{name}</h1>
        <div className="flex items-center justify-center gap-3">
          <button className="text-sm text-[#041E42]/50 hover:text-[#041E42] transition-colors">Set up people</button>
          <span className="text-[#041E42]/20">|</span>
          <button className="text-sm text-[#041E42]/50 hover:text-[#041E42] transition-colors"><MoreHorizontal className="w-4 h-4 inline" /></button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: MessagesSquare, title: 'Message Board', desc: 'Post announcements, pitch ideas, and keep discussions organized.' },
          { icon: CheckCircle2, title: 'To-dos', desc: 'Create lists of work that needs to get done, assign items, and set due dates.' },
          { icon: LayoutGrid, title: 'Card Table', desc: 'Organize work visually on a kanban-style board with columns and cards.' },
          { icon: FolderOpen, title: 'Docs & Files', desc: 'Share documents, images, spreadsheets, and any other files with the team.' },
          { icon: MessageCircle, title: 'Chat', desc: 'Have real-time conversations with your team about this project.' },
          { icon: Calendar, title: 'Schedule', desc: 'Track important dates, milestones, and deadlines for this project.' },
        ].map(item => (
          <div
            key={item.title}
            className="border border-[#041E42]/10 rounded-xl p-6 bg-white hover:border-[#4945FF]/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#4945FF]/8 flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5 text-[#4945FF]" />
            </div>
            <h3 className="text-[#041E42] mb-1.5 text-sm" style={{ fontWeight: 600 }}>{item.title}</h3>
            <p className="text-[#041E42]/45 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN RALLY COMPONENT
   ══════════════════════════════════════════════ */
export function RallyDashboard() {
  const [activeView, setActiveView] = useState<RallyView>('home');
  const [openProject, setOpenProject] = useState<string | null>(null);

  const navItems: { id: RallyView; icon: any; label: string; badge?: boolean }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'timeline', icon: AlignLeft, label: 'Timeline' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: false },
    { id: 'feed', icon: Activity, label: 'Feed' },
    { id: 'my-stuff', icon: Briefcase, label: 'My Stuff' },
    { id: 'find', icon: Search, label: 'Find' },
  ];

  const renderView = () => {
    if (openProject) {
      return <ProjectDetailView name={openProject} onBack={() => setOpenProject(null)} />;
    }
    switch (activeView) {
      case 'home': return <HomeView />;
      case 'timeline': return <LineupView />;
      case 'chat': return <PingsView />;
      case 'notifications': return <HeyView />;
      case 'feed': return <ActivityView />;
      case 'my-stuff': return <MyStuffView />;
      case 'find': return <FindView />;
      case 'assignments': return <AssignmentsView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#041E42]/10 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4945FF] flex items-center justify-center">
            <span className="text-white text-xs" style={{ fontWeight: 700 }}>R</span>
          </div>
          <span className="text-[#041E42] text-sm" style={{ fontWeight: 700 }}>Rally</span>
        </div>

        {/* Center: Nav items */}
        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id && !openProject}
              onClick={() => { setActiveView(item.id); setOpenProject(null); }}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* Right: User avatar */}
        <button
          onClick={() => { setActiveView('assignments'); setOpenProject(null); }}
          className="w-8 h-8 rounded-full bg-[#4945FF] flex items-center justify-center hover:ring-2 hover:ring-[#4945FF]/30 transition-all"
        >
          <span className="text-white text-xs" style={{ fontWeight: 600 }}>SJ</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}