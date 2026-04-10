export function MezzalunaMockup() {
  return (
    <div className="w-[1440px] h-[3000px] bg-[#0A0A0A] text-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-black/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="text-2xl font-serif italic">Mezzaluna</div>
        <div className="flex gap-8 text-sm">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Menu</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Wine List</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Private Dining</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">About</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Contact</a>
        </div>
        <button className="bg-[#D4AF37] text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#C4A037] transition-colors">
          Reserve Table
        </button>
      </nav>

      {/* Hero */}
      <div className="relative h-[900px] flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] pt-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cHNjYWxlJTIwcmVzdGF1cmFudCUyMGludGVyaW9yJTIwZGluaW5nfGVufDF8fHx8MTc3MjAzMjk4OXww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center"></div>
        </div>
        <div className="text-center z-10 max-w-4xl px-8">
          <div className="text-[#D4AF37] text-sm font-semibold mb-4 tracking-widest">AUTHENTIC ITALIAN CUISINE</div>
          <h1 className="text-7xl font-serif mb-6 leading-tight">Where Tradition Meets<br />Modern Elegance</h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Experience the finest Italian dining with our chef's seasonal tasting menu, 
            paired with an award-winning wine selection
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-md font-semibold hover:bg-[#C4A037] transition-all hover:shadow-xl">
              Book Your Experience
            </button>
            <button className="border-2 border-white/30 px-8 py-4 rounded-md font-semibold hover:bg-white/10 transition-all">
              View Menu
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-[#0F0F0F] py-24 px-16">
        <div className="grid grid-cols-4 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-black text-2xl">★</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Michelin Recognized</h3>
            <p className="text-white/60 text-sm">Excellence in Italian cuisine</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-black text-2xl">🍷</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Wine Cellar</h3>
            <p className="text-white/60 text-sm">Over 500 Italian wines</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-black text-2xl">👨‍🍳</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chef's Table</h3>
            <p className="text-white/60 text-sm">Exclusive dining experience</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-black text-2xl">🎉</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Private Events</h3>
            <p className="text-white/60 text-sm">Intimate gatherings for 20-60</p>
          </div>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] py-24 px-16">
        <div className="text-center mb-16">
          <div className="text-[#D4AF37] text-sm font-semibold mb-4 tracking-widest">SEASONAL OFFERINGS</div>
          <h2 className="text-5xl font-serif mb-4">Chef's Tasting Menu</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            A 7-course journey through Italy's culinary traditions, reimagined with modern technique
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          {['Antipasti', 'Primi Piatti', 'Secondi'].map((course, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-serif mb-4 text-[#D4AF37]">{course}</h3>
              <p className="text-white/70 mb-6">
                Fresh seasonal ingredients sourced from local Italian farms and markets
              </p>
              <button className="text-[#D4AF37] text-sm font-semibold hover:underline">
                View Full Course →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation CTA */}
      <div className="bg-[#D4AF37] py-24 px-16 text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-serif mb-6">Reserve Your Table</h2>
          <p className="text-xl mb-8 opacity-90">
            Join us for an unforgettable dining experience. Reservations recommended.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-black text-white px-10 py-4 rounded-md font-semibold hover:bg-[#1A1A1A] transition-all">
              Book Now
            </button>
            <button className="border-2 border-black px-10 py-4 rounded-md font-semibold hover:bg-black/10 transition-all">
              Call (555) 123-4567
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-16 px-16">
        <div className="grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-serif italic mb-4 text-[#D4AF37]">Mezzaluna</div>
            <p className="text-white/60 text-sm">
              Authentic Italian dining in the heart of the city
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="text-white/60 text-sm space-y-2">
              <p>Tue-Thu: 5pm - 10pm</p>
              <p>Fri-Sat: 5pm - 11pm</p>
              <p>Sun-Mon: Closed</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Visit</h4>
            <div className="text-white/60 text-sm space-y-2">
              <p>123 Culinary Avenue</p>
              <p>New York, NY 10001</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors">IG</a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors">FB</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          © 2026 Mezzaluna. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}
