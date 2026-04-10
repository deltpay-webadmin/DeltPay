import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import hardwareImage from 'figma:asset/3e6a8b46e2ef1e6f1bad36c41d265aaf35d2f402.png';

export default function HardwareCarousel() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: '#041E42' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: 'rgba(73,69,255,0.2)', border: '1px solid rgba(73,69,255,0.4)' }}>
            <span className="text-xs font-bold tracking-wide" style={{ color: '#4945FF' }}>HARDWARE INCLUDED</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Built for the counter.
            <br />
            And beyond.
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Free hardware on every plan. EMV-certified terminals, mobile readers, and tap-to-pay on your iPhone — all included.
          </p>
        </div>

        {/* Hardware Image */}
        <div className="max-w-4xl mx-auto mb-12">
          <ImageWithFallback
            src={hardwareImage} 
            alt="Delt payment hardware" 
            className="w-full h-auto rounded-2xl"
            style={{ filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.4))' }}
          />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { title: 'Card Reader', desc: 'Accept chip, swipe, and contactless' },
            { title: 'Tap to Pay on iPhone', desc: 'Turn your iPhone into a payment terminal' },
            { title: 'Countertop Terminal', desc: 'Full-featured POS for high volume' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12">
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.3)' }}>
            All hardware is free with your monthly plan. No leasing. No contracts.
          </p>
        </div>
      </div>
    </section>
  );
}