import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { JOTFORM_APP_URL } from '../lib/jotform';

export function Pricing() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section className="py-24 lg:py-32 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block text-xs font-bold tracking-wider text-[#6366f1] uppercase mb-4">
            PRICING
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#041E42] mb-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Simple pricing.<br />
            <span className="text-[#6366f1]">Serious tools.</span>
          </h2>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
            One platform for payments, websites, AI analytics, and capital.<br />
            Start free — upgrade when you're ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#E5E7EB] hover:border-[#6366f1]/30 transition-all">
            <div className="mb-8">
              <h3 className="text-6xl font-bold text-[#041E42] mb-3" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                Free
              </h3>
              <p className="text-lg text-[#6B7280]">
                Everything you need to launch.
              </p>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Done-for-you template website</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Free mobile card reader</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Invoice & payment links</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Basic Lens AI dashboard</span>
              </li>
            </ul>

            <a href={JOTFORM_APP_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-4 px-6 rounded-xl border-2 border-[#041E42] text-[#041E42] font-semibold text-base hover:bg-[#080A28] hover:text-white transition-all text-center">
              Get Started — Free
            </a>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#6366f1] shadow-xl relative transform md:scale-105">
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#6366f1] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline mb-3">
                <span className="text-6xl font-bold text-[#041E42]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  $99
                </span>
                <span className="text-2xl text-[#6B7280] ml-2">/mo</span>
              </div>
              <p className="text-lg text-[#6B7280]">
                The full Delt system.
              </p>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Custom website with your domain</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Free wireless terminal <span className="text-[#6B7280]">($299 value)</span></span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Full Lens AI suite — analytics, forecasting & Ask Lens</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-[#6366f1] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#041E42]">Priority capital with preferred rates</span>
              </li>
            </ul>

            <button className="w-full py-4 px-6 rounded-xl bg-[#6366f1] text-white font-semibold text-base hover:bg-[#5558e3] hover:shadow-2xl transition-all">
              Start Free Trial
            </button>

            {/* Social Proof */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B7280]">
                <span className="font-semibold text-[#041E42]">2,847 businesses</span> started this week
              </p>
            </div>
          </div>
        </div>

        {/* Compare All Features */}
        <div className="text-center mb-20">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-[#6366f1] font-semibold hover:text-[#5558e3] transition-colors"
          >
            Compare all features
            <ChevronDown className={`w-5 h-5 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
          </button>

          {showComparison && (
            <div className="mt-8 max-w-4xl mx-auto bg-white rounded-2xl border-2 border-[#E5E7EB] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E5E7EB]">
                    <th className="text-left p-6 font-bold text-[#041E42]">Feature</th>
                    <th className="p-6 font-bold text-[#041E42]">Free</th>
                    <th className="p-6 font-bold text-[#6366f1] bg-[#6366f1]/5]">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {/* Payments */}
                  <tr>
                    <td className="p-6 font-semibold text-[#041E42]" colSpan={3}>Payments</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Processing rate</td>
                    <td className="p-6 text-center text-[#041E42]">2.9% + $0.30</td>
                    <td className="p-6 text-center text-[#041E42] bg-[#6366f1]/5">2.6% + $0.10</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Card reader</td>
                    <td className="p-6 text-center text-[#041E42]">Mobile</td>
                    <td className="p-6 text-center text-[#041E42] bg-[#6366f1]/5">Wireless terminal</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Invoice & payment links</td>
                    <td className="p-6 text-center"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                  
                  {/* Websites */}
                  <tr>
                    <td className="p-6 font-semibold text-[#041E42]" colSpan={3}>Websites</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Website type</td>
                    <td className="p-6 text-center text-[#041E42]">Template</td>
                    <td className="p-6 text-center text-[#041E42] bg-[#6366f1]/5">Custom design</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Custom domain</td>
                    <td className="p-6 text-center text-[#6B7280]">—</td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                  
                  {/* Lens AI */}
                  <tr>
                    <td className="p-6 font-semibold text-[#041E42]" colSpan={3}>Lens AI</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Analytics dashboard</td>
                    <td className="p-6 text-center text-[#041E42]">Basic</td>
                    <td className="p-6 text-center text-[#041E42] bg-[#6366f1]/5">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Forecasting</td>
                    <td className="p-6 text-center text-[#6B7280]">—</td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Ask Lens (AI assistant)</td>
                    <td className="p-6 text-center text-[#6B7280]">—</td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                  
                  {/* Capital */}
                  <tr>
                    <td className="p-6 font-semibold text-[#041E42]" colSpan={3}>Capital</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Pre-qualification</td>
                    <td className="p-6 text-center"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-6 text-[#6B7280] pl-10">Priority access & preferred rates</td>
                    <td className="p-6 text-center text-[#6B7280]">—</td>
                    <td className="p-6 text-center bg-[#6366f1]/5"><Check className="w-5 h-5 text-[#6366f1] mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Processing Rates at a Glance */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold tracking-wider text-[#6366f1] uppercase mb-3">
              PROCESSING RATES AT A GLANCE
            </h3>
            <h4 className="text-3xl font-bold text-[#041E42]">
              All-in rates. No hidden fees.
            </h4>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E7EB]">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-sm font-semibold text-[#6B7280] mb-2">Free Plan</div>
                <div className="text-4xl font-bold text-[#041E42] mb-2">2.9% + $0.30</div>
                <div className="text-sm text-[#6B7280]">Per transaction • No setup fees</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#6366f1] mb-2">Pro Plan</div>
                <div className="text-4xl font-bold text-[#6366f1] mb-2">2.6% + $0.10</div>
                <div className="text-sm text-[#6B7280]">Per transaction • No setup fees</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] text-center">
                What you see is what you pay — no interchange markups, no PCI compliance fees, no statement fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
