import { useState } from 'react';
import heroImg from 'figma:asset/4ccdfdc7faf2c40e8c84cf695b41067facff4a61.png';
import apexLogo from 'figma:asset/5f1faa4167483dd529f502f896ffc8a79242afe5.png';
import coachKimImg from 'figma:asset/72b38ba6a07b9377b24bfc0c711bc7baca96ef01.png';
import coachOkaforImg from 'figma:asset/2148e2e209f8c4c500ac00aefec2c37ac7018c5e.png';

const bagImg = 'https://images.unsplash.com/photo-1570442387127-66eb80e00938?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBnbG92ZXMlMjBwdW5jaGluZyUyMGJhZyUyMGRhcmt8ZW58MXx8fHwxNzcyMTQyOTA4fDA&ixlib=rb-4.1.0&q=80&w=1080';
const ringImg = 'https://images.unsplash.com/photo-1636581563815-9c40c35abe0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXRobGV0ZSUyMGJveGluZyUyMHJpbmd8ZW58MXx8fHwxNzcyMTQyOTA4fDA&ixlib=rb-4.1.0&q=80&w=1080';

type NavSection = 'home' | 'classes' | 'trainers' | 'membership' | 'book';

const classes = [
  { day: 'Monday', sessions: [
    { time: '6:00 AM', name: 'Morning Burn', trainer: 'Coach Rivera', spots: 4, type: 'HIIT' },
    { time: '12:00 PM', name: 'Lunch Power Hour', trainer: 'Coach Okafor', spots: 8, type: 'Boxing' },
    { time: '6:00 PM', name: 'Fight Night Prep', trainer: 'Coach Kim', spots: 2, type: 'Boxing' },
  ]},
  { day: 'Tuesday', sessions: [
    { time: '6:00 AM', name: 'Speed & Agility', trainer: 'Coach Kim', spots: 6, type: 'Conditioning' },
    { time: '12:00 PM', name: 'Bag Work Basics', trainer: 'Coach Rivera', spots: 10, type: 'Boxing' },
    { time: '7:00 PM', name: 'Advanced Sparring', trainer: 'Coach Okafor', spots: 3, type: 'Sparring' },
  ]},
  { day: 'Wednesday', sessions: [
    { time: '6:00 AM', name: 'Core Blitz', trainer: 'Coach Rivera', spots: 7, type: 'HIIT' },
    { time: '5:30 PM', name: 'Technique Lab', trainer: 'Coach Kim', spots: 5, type: 'Boxing' },
    { time: '7:00 PM', name: 'Open Gym', trainer: 'All Coaches', spots: 15, type: 'Open' },
  ]},
  { day: 'Thursday', sessions: [
    { time: '6:00 AM', name: 'Cardio Kickboxing', trainer: 'Coach Okafor', spots: 9, type: 'Kickboxing' },
    { time: '12:00 PM', name: 'Lunch Crunch', trainer: 'Coach Rivera', spots: 6, type: 'HIIT' },
    { time: '6:00 PM', name: 'Fight Camp', trainer: 'Coach Kim', spots: 1, type: 'Sparring' },
  ]},
  { day: 'Friday', sessions: [
    { time: '6:00 AM', name: 'Total Body', trainer: 'Coach Rivera', spots: 5, type: 'Conditioning' },
    { time: '5:00 PM', name: 'Friday Knockouts', trainer: 'Coach Okafor', spots: 4, type: 'Boxing' },
    { time: '7:00 PM', name: 'Community Spar', trainer: 'All Coaches', spots: 8, type: 'Sparring' },
  ]},
];

const trainers = [
  {
    name: 'Coach Rivera',
    specialty: 'HIIT & Conditioning',
    bio: 'Former pro boxer turned coach with 15+ years of experience. Specializes in high-intensity training and fight preparation.',
    record: '24-3 Pro Record',
    certifications: ['NASM CPT', 'USA Boxing Coach', 'TRX Certified'],
  },
  {
    name: 'Coach Okafor',
    specialty: 'Boxing Fundamentals',
    bio: 'Olympic-level coach focused on technique and footwork. Known for transforming beginners into confident fighters.',
    record: 'Olympic Coach 2020',
    certifications: ['ISSA CPT', 'Olympic Coach Cert', 'First Aid'],
  },
  {
    name: 'Coach Kim',
    specialty: 'Sparring & Competition',
    bio: 'World kickboxing champion coaching elite-level fighters and competitive amateurs for over a decade.',
    record: '3x World Champion',
    certifications: ['ACE CPT', 'WKA Coach', 'Sports Nutrition'],
  },
];

const plans = [
  {
    name: 'Drop-In',
    price: 35,
    period: 'per class',
    features: ['Single class access', 'Equipment provided', 'Locker room access'],
    popular: false,
  },
  {
    name: 'Contender',
    price: 149,
    period: '/month',
    features: ['Unlimited classes', 'Open gym access', 'Apex+ app access', '1 PT session/month', 'Nutrition guide'],
    popular: true,
  },
  {
    name: 'Champion',
    price: 249,
    period: '/month',
    features: ['Everything in Contender', '4 PT sessions/month', 'Competition coaching', 'Recovery suite access', 'Priority booking', 'Guest passes (2/mo)'],
    popular: false,
  },
];

export function ApexMockup() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [showPromo, setShowPromo] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', goal: 'general' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedTrainer, setExpandedTrainer] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (section: NavSection) => {
    setActiveSection(section);
    const el = document.getElementById(`apex-${section}`);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const toggleBookClass = (classId: string) => {
    setBookedClasses(prev =>
      prev.includes(classId) ? prev.filter(c => c !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="w-[1440px] bg-[#0A0A0A] text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Promo Banner */}
      {showPromo && (
        <div className="bg-[#c8102e] py-3 px-8 flex items-center justify-center gap-4 relative">
          <span className="text-sm font-semibold tracking-wide">GET YOUR FIRST MONTH ON US — Use code <span className="bg-white/20 px-2 py-0.5 rounded ml-1">APEX1FREE</span></span>
          <button
            onClick={() => scrollTo('book')}
            className="bg-white text-[#c8102e] px-4 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Claim Offer
          </button>
          <button
            onClick={() => setShowPromo(false)}
            className="absolute right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-5 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <img src={apexLogo} alt="Apex" className="h-20 w-auto" />
        </div>
        <div className="flex gap-8 text-sm font-medium">
          {(['home', 'classes', 'trainers', 'membership'] as NavSection[]).map(section => (
            <button
              key={section}
              onClick={() => scrollTo(section)}
              className={`capitalize transition-colors cursor-pointer ${
                activeSection === section ? 'text-[#c8102e]' : 'text-white/70 hover:text-white'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTo('book')}
          className="bg-[#c8102e] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#a00d24] transition-all hover:shadow-lg hover:shadow-red-900/25 cursor-pointer"
        >
          Book Free Trial
        </button>
      </nav>

      {/* Hero Section */}
      <div id="apex-home" className="relative h-[900px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Boxing training" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full px-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#c8102e]/20 border border-[#c8102e]/40 px-4 py-2 rounded-full mb-6 w-fit">
            <div className="w-2 h-2 bg-[#c8102e] rounded-full animate-pulse" />
            <span className="text-[#c8102e] text-sm font-semibold">NOW OPEN — DOWNTOWN LOCATION</span>
          </div>
          <h1 className="text-7xl font-black mb-6 leading-[0.95] tracking-tight">
            TRAIN LIKE A<br />
            <span className="text-[#c8102e]">CHAMPION.</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
            Elite boxing & fitness training for all levels. Build strength, confidence,
            and discipline with world-class coaches in a community that pushes you forward.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => scrollTo('book')}
              className="bg-[#c8102e] text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#a00d24] transition-all hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 cursor-pointer"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => scrollTo('classes')}
              className="border-2 border-white/30 px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer"
            >
              View Schedule
            </button>
          </div>
          <div className="flex gap-12 mt-16">
            {[
              { val: '5,000+', label: 'Members Strong' },
              { val: '50+', label: 'Classes Weekly' },
              { val: '15+', label: 'Expert Coaches' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white">{stat.val}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Schedule Section */}
      <div id="apex-classes" className="bg-[#111111] py-24 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#c8102e] text-sm font-bold tracking-widest">WEEKLY SCHEDULE</span>
            <h2 className="text-5xl font-black mt-3 mb-4">Class Schedule</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              From beginner-friendly sessions to advanced sparring — find the class that fits your goals
            </p>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-xl w-fit mx-auto">
            {classes.map((day, i) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(i)}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  selectedDay === i
                    ? 'bg-[#c8102e] text-white shadow-lg shadow-red-900/25'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          {/* Class Cards */}
          <div className="grid grid-cols-3 gap-6">
            {classes[selectedDay].sessions.map((session, i) => {
              const classId = `${classes[selectedDay].day}-${session.time}`;
              const isBooked = bookedClasses.includes(classId);
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-6 border transition-all ${
                    isBooked
                      ? 'bg-[#c8102e]/10 border-[#c8102e]/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{session.type}</span>
                    <span className={`text-xs font-semibold ${session.spots <= 3 ? 'text-[#c8102e]' : 'text-white/50'}`}>
                      {session.spots} spots left
                    </span>
                  </div>
                  <div className="text-white/50 text-sm mb-1">{session.time}</div>
                  <h3 className="text-xl font-bold mb-2">{session.name}</h3>
                  <p className="text-white/50 text-sm mb-6">{session.trainer}</p>
                  <button
                    onClick={() => toggleBookClass(classId)}
                    className={`w-full py-3 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                      isBooked
                        ? 'bg-[#c8102e] text-white hover:bg-[#a00d24]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isBooked ? '✓ Booked — Cancel' : 'Book This Class'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-width Image Break */}
      <div className="relative h-[500px] overflow-hidden">
        <img src={bagImg} alt="Punching bag training" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#111111]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-6xl font-black tracking-tight">EVERY REP COUNTS.</h2>
            <p className="text-white/70 mt-4 text-xl">Push past your limits. We'll be right there with you.</p>
          </div>
        </div>
      </div>

      {/* Trainers Section */}
      <div id="apex-trainers" className="bg-[#0A0A0A] py-24 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#c8102e] text-sm font-bold tracking-widest">OUR TEAM</span>
            <h2 className="text-5xl font-black mt-3 mb-4">World-Class Coaches</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Train with champions. Our coaches bring decades of professional experience to every session.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {trainers.map((trainer, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#c8102e]/30 transition-all group"
              >
                <div className="h-72 overflow-hidden relative">
                  <img
                    src={i === 0 ? ringImg : i === 1 ? coachOkaforImg : coachKimImg}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent h-24" />
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-[#c8102e] text-xs font-bold px-3 py-1 rounded-full">{trainer.record}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{trainer.name}</h3>
                  <p className="text-[#c8102e] text-sm font-semibold mb-3">{trainer.specialty}</p>
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">{trainer.bio}</p>
                  <button
                    onClick={() => setExpandedTrainer(expandedTrainer === i ? null : i)}
                    className="text-[#c8102e] text-sm font-semibold hover:underline cursor-pointer"
                  >
                    {expandedTrainer === i ? 'Hide Details ↑' : 'View Certifications →'}
                  </button>
                  {expandedTrainer === i && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 mb-2 font-semibold">CERTIFICATIONS</p>
                      <div className="flex flex-wrap gap-2">
                        {trainer.certifications.map((cert, j) => (
                          <span key={j} className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">{cert}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apex+ App Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] py-24 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#c8102e]/10 border border-[#c8102e]/30 px-4 py-2 rounded-full mb-6">
              <span className="text-[#c8102e] text-sm font-bold">NEW — APEX+ APP</span>
            </div>
            <h2 className="text-5xl font-black mb-6 leading-tight">Your Training.<br />Your Pocket.</h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Track workouts, book classes, view your progress, and connect with coaches — all from the Apex+ app. Available free with any membership.
            </p>
            <div className="space-y-4 mb-10">
              {[
                { icon: '📅', text: 'Book & manage classes instantly' },
                { icon: '📊', text: 'Track your training progress' },
                { icon: '🎥', text: 'Access on-demand workout library' },
                { icon: '💬', text: 'Message coaches directly' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">{feature.icon}</div>
                  <span className="text-white/80">{feature.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-3.5 rounded-lg font-bold hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2">
                <span className="text-xl">🍎</span> App Store
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2">
                <span className="text-xl">▶</span> Google Play
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-[#c8102e] rounded-3xl p-8 h-[600px] flex items-center justify-center">
              <div className="bg-black rounded-[2rem] w-[280px] h-[520px] p-4 shadow-2xl">
                <div className="bg-[#1A1A1A] rounded-[1.5rem] w-full h-full p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs text-white/50">Welcome back</div>
                      <div className="font-bold text-sm">Alex M.</div>
                    </div>
                    <div className="w-8 h-8 bg-[#c8102e] rounded-full flex items-center justify-center text-xs font-bold">A</div>
                  </div>
                  <div className="bg-[#c8102e] rounded-xl p-4 mb-4">
                    <div className="text-xs text-white/80 mb-1">Next Class</div>
                    <div className="font-bold text-sm">Fight Night Prep</div>
                    <div className="text-xs text-white/70 mt-1">Today 6:00 PM • Coach Kim</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="text-xs text-white/50 mb-2">This Week</div>
                    <div className="flex justify-between">
                      <div className="text-center">
                        <div className="font-bold text-lg">4</div>
                        <div className="text-[10px] text-white/50">Classes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">6.2</div>
                        <div className="text-[10px] text-white/50">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">2,400</div>
                        <div className="text-[10px] text-white/50">Calories</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex justify-around border-t border-white/10 pt-3">
                    {['🏠', '📅', '📊', '👤'].map((icon, i) => (
                      <button key={i} className="text-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">{icon}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div id="apex-membership" className="bg-[#111111] py-24 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#c8102e] text-sm font-bold tracking-widest">MEMBERSHIP</span>
            <h2 className="text-5xl font-black mt-3 mb-4">Pick Your Plan</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              No contracts. No hidden fees. Just honest training at a fair price.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                onClick={() => setSelectedPlan(i)}
                className={`rounded-2xl p-8 border-2 transition-all cursor-pointer relative ${
                  selectedPlan === i
                    ? 'bg-[#c8102e]/10 border-[#c8102e] shadow-xl shadow-red-900/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8102e] text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black">${plan.price}</span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/80">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        selectedPlan === i ? 'bg-[#c8102e]' : 'bg-white/20'
                      }`}>✓</div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => { e.stopPropagation(); scrollTo('book'); }}
                  className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    selectedPlan === i
                      ? 'bg-[#c8102e] text-white hover:bg-[#a00d24]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {selectedPlan === i ? 'Get Started →' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking / Free Trial Form */}
      <div id="apex-book" className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] py-24 px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#c8102e] text-sm font-bold tracking-widest">GET STARTED</span>
            <h2 className="text-5xl font-black mt-3 mb-6">Book Your Free<br />Trial Class</h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Experience Apex for yourself. No commitment, no pressure — just show up and see what you're made of. Your first class is always free.
            </p>
            <div className="space-y-4">
              {[
                'Free gloves & wraps provided',
                'All fitness levels welcome',
                'Shower & locker facilities',
                'Free parking available',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#c8102e] rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-[#c8102e] rounded-full border-2 border-[#111] flex items-center justify-center text-[10px] font-bold">
                      {['J', 'M', 'S', 'A'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/50">+2,400 joined this month</div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#c8102e] text-sm">★</span>
                ))}
                <span className="text-white/50 text-sm ml-2">4.9/5 from 1,200+ reviews</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            {formSubmitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#c8102e]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🥊</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">You're In!</h3>
                <p className="text-white/60 mb-6">Check your email for confirmation details. See you in the ring!</p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-[#c8102e] font-semibold text-sm hover:underline cursor-pointer"
                >
                  Book another class →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold mb-6">Claim Your Free Class</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Martinez"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8102e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@email.com"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8102e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8102e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">What's your goal?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'general', label: 'General Fitness' },
                        { id: 'boxing', label: 'Learn Boxing' },
                        { id: 'weight', label: 'Lose Weight' },
                        { id: 'compete', label: 'Compete' },
                      ].map(goal => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, goal: goal.id })}
                          className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            formData.goal === goal.id
                              ? 'bg-[#c8102e] text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {goal.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-[#c8102e]" defaultChecked />
                      <span className="text-xs text-white/50">Apply promo code <span className="text-[#c8102e] font-semibold">APEX1FREE</span> for first month free</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#c8102e] text-white py-4 rounded-lg font-bold text-lg mt-6 hover:bg-[#a00d24] transition-all hover:shadow-lg hover:shadow-red-900/25 cursor-pointer"
                >
                  Book My Free Class →
                </button>
                <p className="text-center text-xs text-white/30 mt-4">No credit card required. Cancel anytime.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#111111] py-24 px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: 'Sarah K.', text: 'Apex completely changed my relationship with fitness. The coaches genuinely care about your progress.', months: '8 months' },
              { name: 'Marcus T.', text: 'I came in not knowing how to throw a jab. Now I\'m competing in amateur bouts. Incredible coaching.', months: '14 months' },
              { name: 'Priya R.', text: 'The community here is unmatched. Everyone supports each other. Best gym I\'ve ever been part of.', months: '6 months' },
            ].map((review, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-[#c8102e] text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#c8102e] rounded-full flex items-center justify-center font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{review.name}</div>
                    <div className="text-xs text-white/40">Member for {review.months}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-16 px-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <img src={apexLogo} alt="Apex" className="h-20 w-auto" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Elite boxing & fitness training. Building champions since 2018.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <div className="space-y-2 text-white/50 text-sm">
              {['Classes', 'Trainers', 'Membership', 'Apex+ App'].map(link => (
                <div key={link}><button className="hover:text-white transition-colors cursor-pointer">{link}</button></div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Location</h4>
            <div className="space-y-2 text-white/50 text-sm">
              <p>456 Fight Street</p>
              <p>Downtown, NY 10002</p>
              <p>(555) BOX-APEX</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Hours</h4>
            <div className="space-y-2 text-white/50 text-sm">
              <p>Mon–Fri: 5am – 10pm</p>
              <p>Saturday: 7am – 8pm</p>
              <p>Sunday: 8am – 6pm</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex items-center justify-between text-white/30 text-sm">
          <span>© 2026 Apex Fitness. All rights reserved.</span>
          <span>Built with Delt</span>
        </div>
      </footer>
    </div>
  );
}