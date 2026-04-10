import { FundingApplicationDemo } from './FundingApplicationDemo';
import { CRMDashboardDemo } from './CRMDashboardDemo';
import { LensPhoneDemo } from './LensPhoneDemo';
import { ScrollReveal } from './MicroInteractions';

export function ProductShowcase() {
  return (
    <>
      {/* Section 1 - Payments */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* CRM Dashboard Demo Left */}
            <ScrollReveal direction="left">
              <CRMDashboardDemo />
            </ScrollReveal>

            {/* Content Right */}
            <ScrollReveal direction="right" delay={0.15}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#041E42] mb-6">
                Manage everything in one place
              </h2>
              <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">
                Your complete business command center. Track sales, manage customers, analyze performance, and grow your business with powerful insights.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4945FF] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#041E42]"><strong>Real-time dashboard</strong> – See your business performance at a glance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4945FF] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#041E42]"><strong>Transaction history</strong> – Every payment, organized and searchable</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4945FF] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#041E42]"><strong>Customer insights</strong> – Understand who's buying and when</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4945FF] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#041E42]"><strong>Export & reports</strong> – Download data for accounting and analysis</span>
                </li>
              </ul>
              <a
                href="#dashboard"
                className="inline-flex items-center bg-[#4945FF] text-white px-8 py-3 rounded-md font-medium hover:bg-[#3933CC] transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                See the Dashboard
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Section 2 - Lens Phone Demo */}
      <LensPhoneDemo />

      {/* Section 3 - Website Builder */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Browser mockup Left */}
            <ScrollReveal direction="left">
              <div className="bg-[#E5E7EB] rounded-lg p-2 shadow-2xl">
                <div className="bg-white rounded-t flex items-center gap-2 px-3 py-2.5 mb-1">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-[#F6F7FB] rounded px-3 py-1.5 text-xs text-[#6B7280]">
                    thenovarestaurant.com
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-b overflow-hidden max-h-[600px] overflow-y-auto">
                  {/* Fine Dining Restaurant Demo Website */}
                  <div className="bg-[#0D0D0D] border-b border-[#1A1A1A] px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="font-bold text-[#D4AF37] text-sm tracking-[0.2em]" style={{ letterSpacing: '0.2em' }}>NOVA</div>
                      <div className="flex gap-5 text-[10px] text-white/70 uppercase tracking-widest">
                        <span>Home</span><span>Menu</span><span>Gallery</span><span>Story</span><span>Book</span><span>Media</span>
                      </div>
                    </div>
                    <div className="bg-[#D4AF37] text-[#0A0A0A] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest">Reserve Table</div>
                  </div>
                  <div className="relative h-72 overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-8">
                        <div className="text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
                          EAT <span className="text-[#D4AF37]">&bull;</span> DRINK <span className="text-[#D4AF37]">&bull;</span> CELEBRATE
                        </div>
                        <div className="text-[11px] text-white/90 italic tracking-[0.25em] uppercase">"A Contemporary Culinary Journey"</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-10 py-14 bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F]">
                    <div className="text-center mb-10">
                      <div className="text-[#D4AF37] text-[9px] uppercase tracking-[0.25em] mb-2 font-semibold">Signature Dishes</div>
                      <div className="text-2xl font-bold text-white">Featured Menu</div>
                    </div>
                    <div className="space-y-5 max-w-xl mx-auto">
                      {[
                        { name: 'Wagyu Ribeye', desc: '12oz Japanese A5 Wagyu, truffle butter, seasonal vegetables', price: '$125' },
                        { name: 'Chilean Sea Bass', desc: 'Pan-seared with lemon beurre blanc, asparagus', price: '$65' },
                        { name: 'Duck Confit', desc: 'Crispy duck leg, cherry gastrique, wild mushroom risotto', price: '$48' },
                      ].map((dish) => (
                        <div key={dish.name} className="flex justify-between items-start border-b border-[#1A1A1A] pb-5">
                          <div className="flex-1">
                            <div className="text-base font-semibold text-white mb-1.5">{dish.name}</div>
                            <div className="text-[10px] text-white/50 leading-relaxed">{dish.desc}</div>
                          </div>
                          <div className="text-[#D4AF37] font-bold text-base ml-6">{dish.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A] px-10 py-12 text-center">
                    <div className="text-2xl font-bold text-white mb-2">Reserve Your Table</div>
                    <div className="text-[11px] text-white/50 mb-6">Experience culinary excellence in an intimate setting.</div>
                    <div className="bg-[#D4AF37] text-[#0A0A0A] px-7 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] inline-block">Book Now</div>
                  </div>
                  <div className="bg-[#0D0D0D] px-10 py-6 border-t border-[#1A1A1A]">
                    <div className="flex justify-between items-center text-[9px]">
                      <div className="font-bold text-[#D4AF37] tracking-[0.2em]">NOVA RESTAURANT</div>
                      <div className="text-white/30">&copy; 2026 Nova. All rights reserved.</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Content Right */}
            <ScrollReveal direction="right" delay={0.15}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#041E42] mb-6">
                Everything You Need to Sell Online
              </h2>
              <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">
                We create a professional website for your business where customers can browse, order, and pay—all securely and easily.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { bold: 'Custom site built for you', text: 'Professional website with payments and ordering integrated' },
                  { bold: 'Secure payment processing', text: 'Accept credit cards, debit, and digital payments safely' },
                  { bold: 'Online ordering made easy', text: 'Customers order directly from your site, 24/7' },
                  { bold: 'We host & maintain', text: 'Secure hosting and ongoing maintenance included' },
                ].map((item) => (
                  <li key={item.bold} className="flex items-start">
                    <svg className="w-6 h-6 text-[#4945FF] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#041E42]"><strong>{item.bold}</strong> – {item.text}</span>
                  </li>
                ))}
              </ul>
              <a href="#websites" className="inline-flex items-center bg-[#4945FF] text-white px-8 py-3 rounded-md font-medium hover:bg-[#3933CC] transition-all hover:shadow-lg hover:-translate-y-0.5">
                Get your website
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Section 4 - Capital */}
      <section className="py-20 lg:py-32 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content Left */}
            <ScrollReveal direction="left" className="lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#041E42] mb-6">
                Capital when you need it
              </h2>
              <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">
                Get fast funding for your business with flexible repayment based on your sales. No hidden fees, no surprises.
              </p>
              <div className="space-y-6 mb-8">
                {[
                  { num: '1', title: 'Check your offer', desc: 'See how much you qualify for in minutes' },
                  { num: '2', title: 'Get funded fast', desc: 'Receive funds in as little as 24 hours' },
                  { num: '3', title: 'Flexible repayment', desc: 'Repay as a percentage of daily sales' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start">
                    <div className="w-12 h-12 bg-[#4945FF] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">{step.title}</h4>
                      <p className="text-[#6B7280]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#capital" className="inline-flex items-center bg-[#4945FF] text-white px-8 py-3 rounded-md font-medium hover:bg-[#3933CC] transition-all hover:shadow-lg hover:-translate-y-0.5">
                Check your amount
              </a>
            </ScrollReveal>

            {/* Dashboard Right */}
            <ScrollReveal direction="right" delay={0.15} className="lg:order-2">
              <FundingApplicationDemo />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
