export function VitalityBarMockup() {
  return (
    <div className="w-[1440px] h-[3000px] bg-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full"></div>
          <span className="text-2xl font-bold text-[#065F46]">Vitality</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#10B981] transition-colors">Menu</a>
          <a href="#" className="hover:text-[#10B981] transition-colors">Locations</a>
          <a href="#" className="hover:text-[#10B981] transition-colors">Rewards</a>
          <a href="#" className="hover:text-[#10B981] transition-colors">Catering</a>
          <a href="#" className="hover:text-[#10B981] transition-colors">About</a>
        </div>
        <button className="bg-[#10B981] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#059669] transition-colors shadow-lg">
          Order Now
        </button>
      </nav>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] py-24 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-[#10B981] text-white px-4 py-1 rounded-full text-sm font-semibold mb-6">
              🥤 Now Open Downtown
            </div>
            <h1 className="text-6xl font-bold text-[#065F46] mb-6 leading-tight">
              Fresh Pressed.<br />Pure Energy.
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              100% organic fruits & vegetables, cold-pressed daily. 
              Fuel your body with nature's best nutrients.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#10B981] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#059669] transition-all shadow-xl">
                Order Pickup
              </button>
              <button className="border-2 border-[#10B981] text-[#065F46] px-8 py-4 rounded-full font-semibold hover:bg-[#10B981] hover:text-white transition-all">
                Browse Menu
              </button>
            </div>
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-[#10B981]">50+</div>
                <div className="text-sm text-gray-600">Fresh Blends</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10B981]">100%</div>
                <div className="text-sm text-gray-600">Organic</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10B981]">5min</div>
                <div className="text-sm text-gray-600">Prep Time</div>
              </div>
            </div>
          </div>
          <div className="relative h-[600px] bg-gradient-to-br from-[#10B981] to-[#059669] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1624950240173-b651b9e40188?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBqdWljZSUyMHNtb290aGllJTIwYmFyfGVufDF8fHx8MTc3MjA1Mjg3MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Juice Bar"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#065F46] mb-4">Customer Favorites</h2>
            <p className="text-lg text-gray-600">Our most-loved blends, packed with nutrients</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: 'Green Goddess', desc: 'Kale, spinach, apple, lemon, ginger', cal: '120', price: '$8.50' },
              { name: 'Tropical Sunrise', desc: 'Mango, pineapple, coconut, turmeric', cal: '180', price: '$9.00' },
              { name: 'Berry Blast', desc: 'Mixed berries, banana, almond milk', cal: '160', price: '$8.00' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-[#ECFDF5] to-white rounded-2xl p-8 border-2 border-[#D1FAE5] hover:border-[#10B981] transition-all hover:shadow-xl">
                <div className="w-full h-48 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl mb-6"></div>
                <h3 className="text-2xl font-bold text-[#065F46] mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-500">{item.cal} calories</span>
                  <span className="text-2xl font-bold text-[#10B981]">{item.price}</span>
                </div>
                <button className="w-full bg-[#10B981] text-white py-3 rounded-full font-semibold hover:bg-[#059669] transition-colors">
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nutrition Calculator */}
      <div className="bg-gradient-to-br from-[#065F46] to-[#047857] py-24 px-16 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Nutrition Calculator</h2>
          <p className="text-xl text-white/90 mb-12">
            Build your perfect blend and see the nutritional breakdown instantly
          </p>
          <div className="grid grid-cols-4 gap-6 mb-12">
            {['Calories', 'Protein', 'Vitamins', 'Fiber'].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">--</div>
                <div className="text-sm text-white/80">{stat}</div>
              </div>
            ))}
          </div>
          <button className="bg-white text-[#065F46] px-10 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-xl">
            Start Building
          </button>
        </div>
      </div>

      {/* Rewards Program */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-3xl p-12 text-white h-[500px] flex flex-col justify-center">
            <div className="text-6xl mb-6">⭐</div>
            <h3 className="text-3xl font-bold mb-4">Vitality Rewards</h3>
            <p className="text-lg text-white/90 mb-8">
              Earn points with every purchase. Get a free juice after 10 visits!
            </p>
            <div className="flex gap-3 mb-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-12 h-12 bg-white/20 rounded-full"></div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#065F46] mb-6">Join the Movement</h2>
            <p className="text-lg text-gray-700 mb-8">
              Get exclusive perks, birthday rewards, and early access to new blends. 
              Plus, earn double points on Wellness Wednesdays!
            </p>
            <ul className="space-y-4 mb-8">
              {['Free birthday juice', 'Early access to seasonal items', 'Member-only promotions', 'Double points days'].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            <button className="bg-[#10B981] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#059669] transition-all shadow-lg">
              Sign Up Free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#065F46] text-white py-16 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#10B981] rounded-full"></div>
              <span className="text-xl font-bold">Vitality</span>
            </div>
            <p className="text-white/70 text-sm">
              Fresh pressed juices for a healthier you
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-white/70 text-sm">
              <div><a href="#" className="hover:text-white">Menu</a></div>
              <div><a href="#" className="hover:text-white">Locations</a></div>
              <div><a href="#" className="hover:text-white">Catering</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-white/70 text-sm">
              <p>hello@vitalitybar.com</p>
              <p>(555) JUICE-NOW</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="text-white/70 text-sm">
              <p>Mon-Fri: 7am - 7pm</p>
              <p>Sat-Sun: 8am - 6pm</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/50 text-sm">
          © 2026 Vitality Bar. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}
