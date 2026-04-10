export function TheHarlowMockup() {
  return (
    <div className="w-[1440px] h-[3200px] bg-[#F8F7F4] font-sans">
      {/* Top Banner */}
      <div className="bg-[#2C3E50] text-white py-2.5 px-16 text-center text-sm">
        <span className="font-medium">Spring Getaway: Save 20% on 3+ Night Stays | Use Code: SPRING26</span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="text-3xl font-serif italic text-[#2C3E50]">The Harlow</div>
        <div className="flex gap-10 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#C9A55A] transition-colors">Rooms & Suites</a>
          <a href="#" className="hover:text-[#C9A55A] transition-colors">Amenities</a>
          <a href="#" className="hover:text-[#C9A55A] transition-colors">Dining</a>
          <a href="#" className="hover:text-[#C9A55A] transition-colors">Experiences</a>
          <a href="#" className="hover:text-[#C9A55A] transition-colors">Events</a>
        </div>
        <button className="bg-[#C9A55A] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#B8944A] transition-colors">
          Book Your Stay
        </button>
      </nav>

      {/* Hero */}
      <div className="relative h-[800px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwbG9iYnklMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE5NTMyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Hotel Lobby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white text-center">
          <div className="max-w-4xl px-8">
            <div className="text-[#C9A55A] text-sm font-semibold tracking-widest mb-4">
              ✦ BOUTIQUE LUXURY IN THE HEART OF THE CITY ✦
            </div>
            <h1 className="text-7xl font-serif mb-6 leading-tight">
              Where Modern Luxury<br />Meets Timeless Charm
            </h1>
            <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              Experience refined accommodations, personalized service, 
              and curated local experiences in our historic boutique hotel
            </p>
            <button className="bg-[#C9A55A] text-white px-10 py-4 rounded-md font-semibold hover:bg-[#B8944A] transition-all shadow-2xl">
              Explore Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Check Availability Bar */}
      <div className="bg-white shadow-xl -mt-20 relative z-10 mx-16 rounded-2xl p-8">
        <div className="grid grid-cols-5 gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Check In</label>
            <div className="bg-[#F8F7F4] px-4 py-3 rounded-lg border border-gray-300">
              <span className="text-gray-900">Mar 15, 2026</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Check Out</label>
            <div className="bg-[#F8F7F4] px-4 py-3 rounded-lg border border-gray-300">
              <span className="text-gray-900">Mar 18, 2026</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
            <div className="bg-[#F8F7F4] px-4 py-3 rounded-lg border border-gray-300">
              <span className="text-gray-900">2 Adults</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
            <div className="bg-[#F8F7F4] px-4 py-3 rounded-lg border border-gray-300">
              <span className="text-gray-900">All Rooms</span>
            </div>
          </div>
          <button className="bg-[#2C3E50] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#34495E] transition-colors h-fit">
            Check Availability
          </button>
        </div>
      </div>

      {/* Rooms */}
      <div className="py-24 px-16 bg-white mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-4">Rooms & Suites</h2>
            <p className="text-lg text-gray-600">Thoughtfully designed spaces for every traveler</p>
          </div>
          <div className="space-y-12">
            {[
              { name: 'Deluxe Room', size: '350 sq ft', beds: 'King or Two Doubles', from: '$289', features: ['City View', 'Marble Bath', 'Smart TV', 'Mini Bar'] },
              { name: 'Executive Suite', size: '550 sq ft', beds: 'King Bed', from: '$489', features: ['Separate Living', 'Skyline View', 'Soaking Tub', 'Nespresso'] },
              { name: 'Penthouse Suite', size: '900 sq ft', beds: 'King Bed', from: '$789', features: ['Private Terrace', 'Full Kitchen', 'Butler Service', 'Fireplace'] },
            ].map((room, i) => (
              <div key={i} className="grid grid-cols-2 gap-8 bg-[#F8F7F4] rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <div className="h-[400px] bg-gradient-to-br from-[#2C3E50] to-[#34495E]"></div>
                <div className="p-10 flex flex-col justify-center">
                  <h3 className="text-3xl font-serif text-[#2C3E50] mb-4">{room.name}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 mb-6">
                    <span>📐 {room.size}</span>
                    <span>🛏️ {room.beds}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {room.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A55A]"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="text-3xl font-bold text-[#2C3E50]">{room.from}<span className="text-lg text-gray-500">/night</span></div>
                    </div>
                    <button className="bg-[#C9A55A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#B8944A] transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="py-24 px-16 bg-[#2C3E50] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Hotel Amenities</h2>
            <p className="text-lg text-white/80">Everything you need for a perfect stay</p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {[
              { icon: '🍽️', name: 'Rooftop Restaurant', desc: 'Farm-to-table dining' },
              { icon: '💪', name: 'Fitness Center', desc: '24/7 access' },
              { icon: '☕', name: 'Lobby Café', desc: 'Artisan coffee & pastries' },
              { icon: '🚗', name: 'Valet Parking', desc: 'Complimentary service' },
              { icon: '🏊', name: 'Rooftop Pool', desc: 'Seasonal (May-Sep)' },
              { icon: '💼', name: 'Business Center', desc: 'Meeting rooms available' },
              { icon: '🎭', name: 'Concierge', desc: 'Local experiences' },
              { icon: '🐕', name: 'Pet Friendly', desc: 'Dogs welcome' },
            ].map((amenity, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-4">{amenity.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{amenity.name}</h3>
                <p className="text-white/70 text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local Experiences */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-4">Curated Local Experiences</h2>
            <p className="text-lg text-gray-600">Let our concierge craft your perfect day</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: 'Art Gallery Walk', duration: '3 hours', price: 'Complimentary' },
              { name: "Chef's Market Tour", duration: '4 hours', price: '$150/person' },
              { name: 'Private Wine Tasting', duration: '2 hours', price: '$200/couple' },
            ].map((exp, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="h-[300px] bg-gradient-to-br from-[#C9A55A] to-[#B8944A] rounded-xl mb-6 group-hover:shadow-2xl transition-all"></div>
                <h3 className="text-2xl font-semibold text-[#2C3E50] mb-2">{exp.name}</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>⏱️ {exp.duration}</span>
                  <span className="font-semibold text-[#C9A55A]">{exp.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Tour CTA */}
      <div className="py-24 px-16 bg-gradient-to-br from-[#C9A55A] to-[#B8944A] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🏨</div>
          <h2 className="text-5xl font-serif mb-6">Experience The Harlow Virtually</h2>
          <p className="text-xl text-white/90 mb-10">
            Take a 360° tour of our rooms, amenities, and public spaces from anywhere
          </p>
          <button className="bg-white text-[#2C3E50] px-10 py-4 rounded-md font-semibold hover:bg-gray-100 transition-all shadow-xl">
            Launch Virtual Tour
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-[#2C3E50] mb-12">What Guests Say</h2>
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F8F7F4] rounded-xl p-8">
                <div className="text-[#C9A55A] text-2xl mb-4">★★★★★</div>
                <p className="text-gray-700 mb-6 italic">
                  "Absolutely stunning boutique hotel. The attention to detail and personalized service made our anniversary trip unforgettable."
                </p>
                <div className="font-semibold text-[#2C3E50]">Sarah & James K.</div>
                <div className="text-sm text-gray-500">Anniversary Stay</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2C3E50] text-white py-16 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-serif italic mb-4 text-[#C9A55A]">The Harlow</div>
            <p className="text-white/60 text-sm">
              Boutique luxury in the heart of the city
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <div className="space-y-2 text-white/60 text-sm">
              <div><a href="#" className="hover:text-white">Rooms & Suites</a></div>
              <div><a href="#" className="hover:text-white">Dining</a></div>
              <div><a href="#" className="hover:text-white">Experiences</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="text-white/60 text-sm space-y-2">
              <p>234 Heritage Avenue</p>
              <p>San Francisco, CA 94102</p>
              <p>(555) 987-6543</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-white/60 text-sm mb-4">Special offers & updates</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm"
              />
              <button className="bg-[#C9A55A] px-4 py-2 rounded-md hover:bg-[#B8944A] transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/40 text-sm">
          © 2026 The Harlow Hotel. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}