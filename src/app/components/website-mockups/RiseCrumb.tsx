export function RiseCrumbMockup() {
  return (
    <div className="w-[1440px] h-[3000px] bg-[#FFF8F0] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🥖</div>
          <div>
            <div className="text-2xl font-bold text-[#8B4513]">Rise & Crumb</div>
            <div className="text-xs text-gray-500">Artisan Bakery</div>
          </div>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#D2691E] transition-colors">Daily Bread</a>
          <a href="#" className="hover:text-[#D2691E] transition-colors">Pastries</a>
          <a href="#" className="hover:text-[#D2691E] transition-colors">Custom Cakes</a>
          <a href="#" className="hover:text-[#D2691E] transition-colors">Wholesale</a>
          <a href="#" className="hover:text-[#D2691E] transition-colors">Visit</a>
        </div>
        <button className="bg-[#D2691E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A0522D] transition-colors">
          Order Online
        </button>
      </nav>

      {/* Hero */}
      <div className="relative py-24 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-[#D2691E] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              ⏰ Fresh Daily at 6 AM
            </div>
            <h1 className="text-6xl font-bold text-[#8B4513] mb-6 leading-tight">
              Baked with Love,<br />Every Morning
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Traditional European baking methods meet local ingredients. 
              From sourdough to croissants, everything is made by hand, in-house.
            </p>
            <div className="flex gap-4 mb-12">
              <button className="bg-[#D2691E] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#A0522D] transition-all shadow-lg">
                Order Pickup
              </button>
              <button className="border-2 border-[#D2691E] text-[#8B4513] px-8 py-4 rounded-lg font-semibold hover:bg-[#D2691E] hover:text-white transition-all">
                View Menu
              </button>
            </div>
            <div className="flex gap-6">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-2xl mb-1">🌾</div>
                <div className="text-xs text-gray-600">Organic<br />Flour</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-2xl mb-1">🧈</div>
                <div className="text-xs text-gray-600">Local<br />Butter</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-xs text-gray-600">24hr<br />Proof</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="text-2xl mb-1">👨‍🍳</div>
                <div className="text-xs text-gray-600">Master<br />Baker</div>
              </div>
            </div>
          </div>
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1768573263820-1b2f031f4389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYmFrZXJ5JTIwc2hvcCUyMGZyb250fGVufDF8fHx8MTc3MjA1Mjg3M3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Bakery"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl">
              <div className="text-sm text-gray-600 mb-1">Today's Special</div>
              <div className="text-2xl font-bold text-[#8B4513]">Fresh Cinnamon Rolls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Fresh */}
      <div className="py-24 px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-4">Baked Fresh Daily</h2>
            <p className="text-lg text-gray-600">Our signature breads & pastries</p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: 'Sourdough', time: '6 AM', price: '$8' },
              { name: 'Croissants', time: '7 AM', price: '$4' },
              { name: 'Baguettes', time: '6 AM', price: '$5' },
              { name: 'Focaccia', time: '11 AM', price: '$9' },
            ].map((item, i) => (
              <div key={i} className="bg-[#FFF8F0] rounded-2xl p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#D2691E]">
                <div className="w-full h-40 bg-gradient-to-br from-[#D2691E] to-[#A0522D] rounded-xl mb-4"></div>
                <h3 className="text-xl font-bold text-[#8B4513] mb-2">{item.name}</h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Ready: {item.time}</span>
                  <span className="text-lg font-bold text-[#D2691E]">{item.price}</span>
                </div>
                <button className="w-full bg-[#D2691E] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#A0522D] transition-colors">
                  Pre-Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Cakes */}
      <div className="py-24 px-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Custom Cakes for Every Occasion</h2>
            <p className="text-xl text-white/90 mb-8">
              Wedding cakes, birthday celebrations, or just because. 
              Our pastry chef works with you to create something truly special.
            </p>
            <ul className="space-y-4 mb-8">
              {['Wedding & tiered cakes', 'Custom flavors & fillings', 'Dietary accommodations', 'Delivery & setup available'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <button className="bg-white text-[#8B4513] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-xl">
              Request Consultation
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl mb-4">🎂</div>
              <h3 className="text-2xl font-bold mb-2">Wedding Cakes</h3>
              <p className="text-white/80">Starting at $350</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-5xl mb-4">🧁</div>
              <h3 className="text-2xl font-bold mb-2">Cupcakes & Mini Desserts</h3>
              <p className="text-white/80">Perfect for parties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale */}
      <div className="py-24 px-16 bg-[#FFF8F0]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-6">🏪</div>
          <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Wholesale Program</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Supply your cafe, restaurant, or market with our artisan breads. 
            Daily deliveries available. Minimum order: 20 loaves.
          </p>
          <button className="bg-[#D2691E] text-white px-10 py-4 rounded-lg font-semibold hover:bg-[#A0522D] transition-all shadow-lg">
            Get Wholesale Pricing
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#8B4513] text-white py-16 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-3xl mb-2">🥖</div>
            <div className="text-xl font-bold mb-4">Rise & Crumb</div>
            <p className="text-white/70 text-sm">
              Artisan bakery since 2020
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <div className="space-y-2 text-white/70 text-sm">
              <div><a href="#" className="hover:text-white">Breads</a></div>
              <div><a href="#" className="hover:text-white">Pastries</a></div>
              <div><a href="#" className="hover:text-white">Custom Orders</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Visit Us</h4>
            <div className="text-white/70 text-sm space-y-2">
              <p>456 Baker Street</p>
              <p>Portland, OR 97201</p>
              <p>(555) 789-0123</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="text-white/70 text-sm">
              <p>Mon-Sat: 6am - 6pm</p>
              <p>Sunday: 7am - 4pm</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/50 text-sm">
          © 2026 Rise & Crumb. All rights reserved. | Built with Delt
        </div>
      </footer>
    </div>
  );
}
