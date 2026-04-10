export function BrightSmilesMockup() {
  return (
    <div className="w-[1440px] h-[3000px] bg-white font-sans">
      {/* Top Bar */}
      <div className="bg-[#0EA5E9] text-white py-3 px-16 flex justify-between items-center text-sm">
        <div className="flex gap-6">
          <span>📞 (555) 123-SMILE</span>
          <span>📍 123 Health Plaza, Suite 200</span>
        </div>
        <div>
          <span className="font-semibold">Now Accepting New Patients</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-full flex items-center justify-center text-white text-2xl">
            ✓
          </div>
          <div>
            <div className="text-xl font-bold text-[#1E293B]">Bright Smiles Dental</div>
            <div className="text-xs text-gray-500">Family & Cosmetic Dentistry</div>
          </div>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#0EA5E9] transition-colors">Services</a>
          <a href="#" className="hover:text-[#0EA5E9] transition-colors">Our Team</a>
          <a href="#" className="hover:text-[#0EA5E9] transition-colors">Patient Portal</a>
          <a href="#" className="hover:text-[#0EA5E9] transition-colors">Insurance</a>
          <a href="#" className="hover:text-[#0EA5E9] transition-colors">Contact</a>
        </div>
        <button className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#0284C7] transition-colors shadow-lg">
          Book Appointment
        </button>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#F0F9FF] to-white py-24 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-[#0EA5E9] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              ✨ Same-Day Appointments Available
            </div>
            <h1 className="text-6xl font-bold text-[#1E293B] mb-6 leading-tight">
              Your Family's<br />Dental Health Partner
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Comprehensive dental care in a comfortable, modern environment. 
              From routine cleanings to advanced cosmetic procedures.
            </p>
            <div className="flex gap-4 mb-12">
              <button className="bg-[#0EA5E9] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0284C7] transition-all shadow-xl">
                Schedule Visit
              </button>
              <button className="border-2 border-[#0EA5E9] text-[#0EA5E9] px-8 py-4 rounded-lg font-semibold hover:bg-[#0EA5E9] hover:text-white transition-all">
                Virtual Consultation
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="text-3xl font-bold text-[#0EA5E9] mb-1">20+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="text-3xl font-bold text-[#0EA5E9] mb-1">4.9★</div>
                <div className="text-sm text-gray-600">Patient Rating</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="text-3xl font-bold text-[#0EA5E9] mb-1">5K+</div>
                <div className="text-sm text-gray-600">Happy Patients</div>
              </div>
            </div>
          </div>
          <div className="relative h-[600px] bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1762625570087-6d98fca29531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkZW50YWwlMjBjbGluaWMlMjBvZmZpY2V8ZW58MXx8fHwxNzcxOTYxNjk3fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Dental Office"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1E293B] mb-4">Comprehensive Dental Services</h2>
            <p className="text-lg text-gray-600">Everything your family needs under one roof</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: '🦷', name: 'General Dentistry', desc: 'Cleanings, fillings, checkups' },
              { icon: '✨', name: 'Cosmetic Dentistry', desc: 'Whitening, veneers, bonding' },
              { icon: '🔧', name: 'Restorative Care', desc: 'Crowns, bridges, implants' },
              { icon: '👶', name: 'Pediatric Dentistry', desc: 'Gentle care for kids' },
              { icon: '😴', name: 'Sedation Dentistry', desc: 'Anxiety-free treatments' },
              { icon: '🚨', name: 'Emergency Care', desc: 'Same-day appointments' },
            ].map((service, i) => (
              <div key={i} className="bg-gradient-to-br from-[#F0F9FF] to-white rounded-2xl p-8 border-2 border-transparent hover:border-[#0EA5E9] transition-all hover:shadow-xl group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-2xl font-bold text-[#1E293B] mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-6">{service.desc}</p>
                <button className="text-[#0EA5E9] font-semibold text-sm hover:underline">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Portal */}
      <div className="py-24 px-16 bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Patient Portal</h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Manage your dental health online. Book appointments, view records, 
              and pay bills—all in one convenient place.
            </p>
            <div className="space-y-4 mb-10">
              {[
                'Schedule & manage appointments',
                'Access dental records & X-rays',
                'View treatment plans & costs',
                'Make payments & check insurance',
                'Message our team directly',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</div>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button className="bg-white text-[#0EA5E9] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-xl">
                Sign In
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
                Register
              </button>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <div className="bg-white rounded-2xl p-8 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#0EA5E9] rounded-full"></div>
                <div>
                  <div className="font-semibold text-[#1E293B]">Welcome back, Sarah!</div>
                  <div className="text-sm text-gray-500">Next appointment: Mar 15</div>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-[#F0F9FF] text-[#0EA5E9] py-3 rounded-lg font-medium text-sm">
                  View Upcoming Appointments
                </button>
                <button className="w-full bg-[#F0F9FF] text-[#0EA5E9] py-3 rounded-lg font-medium text-sm">
                  Request Prescription Refill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance & Payment */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#1E293B] mb-6">Flexible Payment Options</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We accept most insurance plans and offer payment plans to make quality dental care accessible
          </p>
          <div className="grid grid-cols-4 gap-8 mb-12">
            {['PPO Accepted', 'Payment Plans', 'CareCredit', 'FSA/HSA'].map((option, i) => (
              <div key={i} className="bg-[#F0F9FF] rounded-xl p-6 border border-[#0EA5E9]/20">
                <div className="text-3xl text-[#0EA5E9] mb-3">✓</div>
                <h3 className="font-semibold text-[#1E293B]">{option}</h3>
              </div>
            ))}
          </div>
          <button className="bg-[#0EA5E9] text-white px-10 py-4 rounded-lg font-semibold hover:bg-[#0284C7] transition-all shadow-lg">
            Check Insurance Coverage
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 px-16 bg-gradient-to-br from-[#1E293B] to-[#334155] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready for a Healthier Smile?</h2>
          <p className="text-xl text-white/80 mb-10">
            New patients welcome! Book your appointment today.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#0EA5E9] text-white px-10 py-4 rounded-lg font-semibold hover:bg-[#0284C7] transition-all shadow-xl">
              Schedule Appointment
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              Call (555) 123-SMILE
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-white py-16 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0EA5E9] rounded-full flex items-center justify-center">✓</div>
              <span className="font-bold">Bright Smiles</span>
            </div>
            <p className="text-white/60 text-sm">
              Your trusted dental care partner
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-white/60 text-sm">
              <div><a href="#" className="hover:text-white">Services</a></div>
              <div><a href="#" className="hover:text-white">Our Team</a></div>
              <div><a href="#" className="hover:text-white">Patient Portal</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="text-white/60 text-sm space-y-2">
              <p>123 Health Plaza, Suite 200</p>
              <p>Seattle, WA 98101</p>
              <p>(555) 123-SMILE</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="text-white/60 text-sm">
              <p>Mon-Thu: 8am - 6pm</p>
              <p>Fri: 8am - 4pm</p>
              <p>Sat: 9am - 2pm</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/40 text-sm">
          © 2026 Bright Smiles Dental. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}
