import { useState } from 'react';
import visaLogo from 'figma:asset/5cf2d9ae329933b6a54b2cba81d519f09d3ef10c.png';
import mastercardLogo from 'figma:asset/022b31c587f70b1784d7c7073c010a00f2155ca6.png';
import discoverLogo from 'figma:asset/c2dbb2b13b0ce77c8fa0aba3e1365f51c2c38c1d.png';
import amexLogo from 'figma:asset/b86df05545b773513de45dd20bea329a1ac7f63c.png';

export function TransparentPricing() {
  const [selectedMode, setSelectedMode] = useState<'in-person' | 'keyed'>('in-person');

  // Calculate prices based on mode (keyed is 30% higher)
  const pricing = {
    majorCards: selectedMode === 'in-person' ? { rate: '1.83', fee: '8' } : { rate: '2.38', fee: '10' },
    amex: selectedMode === 'in-person' ? { rate: '2.61', fee: '8' } : { rate: '3.39', fee: '10' },
    pinDebit: selectedMode === 'in-person' ? { rate: '1.00', fee: '8' } : { rate: '1.30', fee: '10' }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#041E42] mb-6">
            Small businesses <span className="text-[#4945FF] italic">save 25%</span>
            <br />
            on average with Delt.
          </h2>
          <p className="text-lg text-[#6B7280] max-w-[800px] mx-auto mb-8">
            Our pricing is 100% transparent and flat out saves you money. We keep your rates low and give you innovative ways to save money.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href="#/apply"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#4945FF] text-white rounded-xl font-medium hover:bg-[#3832E5] transition-all text-lg shadow-lg hover:shadow-xl"
            >
              Find your custom rate
            </a>
          </div>
          
          <a
            href="#/pricing"
            className="inline-flex items-center gap-2 text-[#4945FF] font-medium hover:underline"
          >
            How does it work?
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 7v6M10 7h.01" strokeLinecap="round" strokeWidth="1.5" stroke="currentColor" fill="none" />
            </svg>
          </a>
        </div>

        {/* Pricing Cards Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 lg:p-12" style={{ boxShadow: '0 8px 40px rgba(4,30,66,0.08), 0 2px 12px rgba(4,30,66,0.05)' }}>
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setSelectedMode('in-person')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedMode === 'in-person'
                    ? 'bg-white text-[#041E42] shadow-md'
                    : 'text-[#6B7280] hover:text-[#041E42]'
                }`}
              >
                In-person
              </button>
              <button
                onClick={() => setSelectedMode('keyed')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedMode === 'keyed'
                    ? 'bg-white text-[#041E42] shadow-md'
                    : 'text-[#6B7280] hover:text-[#041E42]'
                }`}
              >
                Keyed & Online
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Card 1: Major Cards */}
            <div className="text-center p-6 border-2 border-gray-200 rounded-2xl hover:border-[#4945FF] transition-all">
              <div className="mb-6">
                <div className="text-5xl lg:text-6xl font-bold text-[#041E42]">
                  {pricing.majorCards.rate}<span className="text-2xl align-top">%</span>
                  <span className="text-2xl font-semibold text-[#6B7280] ml-2">+ {pricing.majorCards.fee}¢</span>
                </div>
              </div>
              
              {/* Card Logos */}
              <div className="flex justify-center items-center gap-2 pt-6 border-t border-gray-200">
                <div className="border border-gray-300 rounded px-4 py-3 bg-white flex items-center justify-center min-w-[70px]">
                  <img src={mastercardLogo} alt="Mastercard" className="h-16 w-auto" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </div>
                <div className="border border-gray-300 rounded px-4 py-3 bg-white flex items-center justify-center min-w-[70px]">
                  <img src={visaLogo} alt="Visa" className="h-16 w-auto" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </div>
                <div className="border border-gray-300 rounded px-4 py-3 bg-white flex items-center justify-center min-w-[70px]">
                  <img src={discoverLogo} alt="Discover" className="h-16 w-auto" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </div>
              </div>
            </div>

            {/* Card 2: Amex */}
            <div className="text-center p-6 border-2 border-gray-200 rounded-2xl hover:border-[#4945FF] transition-all">
              <div className="mb-6">
                <div className="text-5xl lg:text-6xl font-bold text-[#041E42]">
                  {pricing.amex.rate}<span className="text-2xl align-top">%</span>
                  <span className="text-2xl font-semibold text-[#6B7280] ml-2">+ {pricing.amex.fee}¢</span>
                </div>
              </div>
              
              {/* Amex Logo */}
              <div className="flex justify-center items-center pt-6 border-t border-gray-200">
                <div className="border border-gray-300 rounded px-4 py-3 bg-white flex items-center justify-center min-w-[70px]">
                  <img src={amexLogo} alt="American Express" className="h-16 w-auto" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </div>
              </div>
            </div>

            {/* Card 3: PIN-Debit */}
            <div className="text-center p-6 border-2 border-gray-200 rounded-2xl hover:border-[#4945FF] transition-all">
              <div className="mb-6">
                <div className="text-5xl lg:text-6xl font-bold text-[#041E42]">
                  {pricing.pinDebit.rate}<span className="text-2xl align-top">%</span>
                  <span className="text-2xl font-semibold text-[#6B7280] ml-2">+ {pricing.pinDebit.fee}¢</span>
                </div>
              </div>
              
              {/* PIN-Debit Label */}
              <div className="flex justify-center items-center pt-6 border-t border-gray-200">
                <div className="text-sm font-semibold text-[#6B7280]">PIN-Debit</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#041E42] mb-2">
              Your expected processing costs
            </h3>
            <p className="text-[#6B7280]">
              Based on the typical mix of card types customers use and an average transaction of <span className="font-semibold text-[#041E42]">$200</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}