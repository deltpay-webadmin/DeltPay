export function LumiereMockup() {
  return (
    <div className="w-[1440px] h-[3000px] bg-[#FAFAF9] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="text-2xl font-serif italic text-[#1F1F1F]">Lumière</div>
        <div className="flex gap-10 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#B8860B] transition-colors">Collections</a>
          <a href="#" className="hover:text-[#B8860B] transition-colors">Engagement</a>
          <a href="#" className="hover:text-[#B8860B] transition-colors">Custom Design</a>
          <a href="#" className="hover:text-[#B8860B] transition-colors">About</a>
        </div>
        <button className="bg-[#1F1F1F] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-black transition-colors">
          Book Appointment
        </button>
      </nav>

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-white to-[#FAFAF9] py-32 px-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block text-[#B8860B] text-sm font-semibold tracking-widest mb-6">
            ✦ FINE JEWELRY SINCE 1985 ✦
          </div>
          <h1 className="text-7xl font-serif text-[#1F1F1F] mb-8 leading-tight">
            Timeless Elegance,<br />Crafted for You
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover our curated collection of engagement rings, fine jewelry, 
            and bespoke pieces designed to celebrate life's most precious moments.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#B8860B] text-white px-10 py-4 rounded-md font-semibold hover:bg-[#9A7008] transition-all shadow-xl">
              Shop Collections
            </button>
            <button className="border-2 border-[#1F1F1F] text-[#1F1F1F] px-10 py-4 rounded-md font-semibold hover:bg-[#1F1F1F] hover:text-white transition-all">
              Custom Design
            </button>
          </div>
        </div>
      </div>

      {/* Featured Collections */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#1F1F1F] mb-4">Signature Collections</h2>
            <p className="text-lg text-gray-600">Exquisitely crafted, eternally cherished</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: 'Eternal', desc: 'Engagement Rings', pieces: '120+ Designs' },
              { name: 'Lumière', desc: 'Diamond Collection', pieces: 'GIA Certified' },
              { name: 'Heritage', desc: 'Vintage-Inspired', pieces: 'Limited Edition' },
            ].map((collection, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative h-[400px] bg-gradient-to-br from-[#F5F5F4] to-[#E7E5E4] rounded-2xl overflow-hidden mb-6 group-hover:shadow-2xl transition-all">
                  <img 
                    src="https://images.unsplash.com/photo-1764512680324-048f158cab2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwc3RvcmUlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjAwNjI4M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <button className="bg-white text-[#1F1F1F] px-6 py-3 rounded-md font-semibold">
                      Explore Collection →
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-[#1F1F1F] mb-2">{collection.name}</h3>
                  <p className="text-gray-600 mb-1">{collection.desc}</p>
                  <p className="text-sm text-[#B8860B] font-semibold">{collection.pieces}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Try-On */}
      <div className="py-24 px-16 bg-gradient-to-br from-[#1F1F1F] to-[#3F3F3F] text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-[#B8860B] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              ✨ New Technology
            </div>
            <h2 className="text-5xl font-serif mb-6">Virtual Try-On</h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Experience our jewelry from home with augmented reality. 
              See how pieces look on your hand in real-time before visiting our showroom.
            </p>
            <ul className="space-y-4 mb-10">
              {['Realistic 3D visualization', 'Try multiple styles instantly', 'Save favorites to your account', 'Schedule virtual consultation'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#B8860B] rounded-full flex items-center justify-center text-sm">✓</div>
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="bg-[#B8860B] text-white px-10 py-4 rounded-md font-semibold hover:bg-[#9A7008] transition-all shadow-xl">
              Launch Virtual Try-On
            </button>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 h-[500px] flex items-center justify-center">
            <div className="text-center text-white/40">
              <div className="text-8xl mb-4">💍</div>
              <p className="text-lg">Interactive Try-On Demo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Design */}
      <div className="py-24 px-16 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#1F1F1F] mb-4">Bespoke Design Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Work one-on-one with our master jewelers to create a unique piece that tells your story
            </p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Consultation', desc: 'Share your vision' },
              { step: '02', title: 'Design', desc: '3D renderings & CAD' },
              { step: '03', title: 'Crafting', desc: 'Expert fabrication' },
              { step: '04', title: 'Delivery', desc: 'Your masterpiece' },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#B8860B] transition-all hover:shadow-lg">
                <div className="text-4xl font-serif text-[#B8860B] mb-4">{step.step}</div>
                <h3 className="text-xl font-semibold text-[#1F1F1F] mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="bg-[#1F1F1F] text-white px-10 py-4 rounded-md font-semibold hover:bg-black transition-all shadow-lg">
              Start Custom Project
            </button>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-[#1F1F1F] mb-12">Certified Excellence</h2>
          <div className="grid grid-cols-4 gap-8">
            {['GIA Certified', 'Conflict-Free', 'Lifetime Warranty', 'Free Appraisals'].map((cert, i) => (
              <div key={i} className="p-8">
                <div className="w-16 h-16 bg-[#B8860B]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="text-2xl text-[#B8860B]">✦</div>
                </div>
                <h3 className="font-semibold text-[#1F1F1F]">{cert}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1F1F1F] text-white py-16 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-serif italic mb-4 text-[#B8860B]">Lumière</div>
            <p className="text-white/60 text-sm">
              Fine jewelry & custom design since 1985
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <div className="space-y-2 text-white/60 text-sm">
              <div><a href="#" className="hover:text-white">Engagement</a></div>
              <div><a href="#" className="hover:text-white">Collections</a></div>
              <div><a href="#" className="hover:text-white">Custom Design</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Visit</h4>
            <div className="text-white/60 text-sm space-y-2">
              <p>789 Fifth Avenue</p>
              <p>New York, NY 10022</p>
              <p>(555) 234-5678</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="text-white/60 text-sm">
              <p>Mon-Sat: 10am - 7pm</p>
              <p>Sunday: 12pm - 5pm</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/40 text-sm">
          © 2026 Lumière Jewelry. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}
