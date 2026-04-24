import { Building2, ShoppingBag, Utensils, Briefcase, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { BusinessScene } from '../components/BusinessScene';

export function CaseStudiesPage() {
  const caseStudies = [
    {
      icon: ShoppingBag,
      company: 'Urban Outfitters Boutique',
      industry: 'Retail',
      location: 'Brooklyn, NY',
      initials: 'UO',
      theme: 'retail' as const,
      metric: '+180%',
      metricLabel: 'Sales Growth',
      description: 'How a small boutique transformed their business with integrated payment processing and e-commerce tools.',
      results: [
        'Increased online sales by 180% in 6 months',
        'Reduced checkout abandonment by 45%',
        'Streamlined inventory management',
        'Expanded to 3 new locations',
      ],
    },
    {
      icon: Utensils,
      company: 'The Local Kitchen',
      industry: 'Restaurant',
      location: 'Austin, TX',
      initials: 'LK',
      theme: 'restaurant' as const,
      metric: '3x',
      metricLabel: 'Order Volume',
      description: 'A farm-to-table restaurant leveraged Delt\'s POS system and online ordering to triple their business.',
      results: [
        'Tripled delivery orders in first quarter',
        'Cut payment processing time by 60%',
        'Improved table turnover rate',
        'Added catering revenue stream',
      ],
    },
    {
      icon: Briefcase,
      company: 'Apex Consulting Group',
      industry: 'Professional Services',
      location: 'Chicago, IL',
      initials: 'AC',
      theme: 'office' as const,
      metric: '99%',
      metricLabel: 'On-time Payments',
      description: 'Professional services firm automated invoicing and improved cash flow with Delt\'s business tools.',
      results: [
        '99% of invoices paid on time',
        'Reduced admin time by 15 hours/week',
        'Automated recurring billing',
        'Improved client satisfaction scores',
      ],
    },
    {
      icon: Heart,
      company: 'Wellness Studio',
      industry: 'Beauty & Wellness',
      location: 'Portland, OR',
      initials: 'WS',
      theme: 'wellness' as const,
      metric: '$50K',
      metricLabel: 'Capital Funded',
      description: 'Spa and wellness center used Delt Capital to expand services and grow their customer base.',
      results: [
        'Secured $50K funding in 48 hours',
        'Added 3 new service rooms',
        'Hired 5 additional staff members',
        'Increased monthly revenue by 65%',
      ],
    },
    {
      icon: Sparkles,
      company: 'Luxe Beauty Co',
      industry: 'E-commerce',
      location: 'Los Angeles, CA',
      initials: 'LB',
      theme: 'salon' as const,
      metric: '250K',
      metricLabel: 'Monthly Transactions',
      description: 'Online beauty brand scaled from startup to processing 250K monthly transactions with Delt.',
      results: [
        'Process 250K+ transactions monthly',
        'Expanded to 12 international markets',
        '99.9% uptime on peak sales days',
        'Reduced fraud by 78%',
      ],
    },
    {
      icon: Building2,
      company: 'Metro Hardware Supply',
      industry: 'Retail',
      location: 'Denver, CO',
      initials: 'MH',
      theme: 'hardware' as const,
      metric: '$2M',
      metricLabel: 'Annual Savings',
      description: 'Hardware supply chain switched to Delt and saved $2M annually in payment processing fees.',
      results: [
        'Saved $2M in annual processing fees',
        'Unified 15 store locations',
        'Real-time inventory across all stores',
        'Improved vendor payment terms',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#041E42] mb-6">
              Success <span className="text-[#4945FF]">stories</span>
            </h1>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              See how businesses like yours are growing with Delt. From small startups to established enterprises, discover real results from real customers.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => {
              const Icon = study.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                >
                  {/* Photo header */}
                  <BusinessScene
                    theme={study.theme}
                    initials={study.initials}
                    businessName={study.company}
                    location={study.location}
                    metric={study.metric}
                    aspect="landscape"
                    variant={index % 2 === 0 ? 'navy' : 'purple'}
                    className="!rounded-none w-full"
                  />
                  <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#4945FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#4945FF]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#041E42] mb-1">
                        {study.company}
                      </h3>
                      <p className="text-sm text-[#475569]">{study.industry}</p>
                    </div>
                  </div>

                  <div className="bg-[#4945FF]/10 rounded-xl p-6 mb-6">
                    <div className="text-5xl font-bold text-[#4945FF] mb-2">
                      {study.metric}
                    </div>
                    <div className="text-sm text-[#041E42] font-semibold">
                      {study.metricLabel}
                    </div>
                  </div>

                  <p className="text-[#475569] leading-relaxed mb-6">
                    {study.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-bold text-[#041E42]">Key Results:</h4>
                    <ul className="space-y-2">
                      {study.results.map((result, resultIndex) => (
                        <li
                          key={resultIndex}
                          className="flex items-start gap-2 text-sm text-[#475569]"
                        >
                          <span className="text-[#4945FF] font-bold mt-0.5">✓</span>
                          <span>{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full mt-6 px-6 py-3 border-2 border-[#4945FF] text-[#4945FF] rounded-lg hover:bg-[#4945FF]/8 transition-colors font-semibold">
                    Read Full Story
                  </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footnote */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#475569] mt-8 max-w-3xl mx-auto text-center">
            Results described are based on individual customer experiences and may not reflect typical outcomes. Business results vary based on many factors including industry, business size, and market conditions. Delt does not guarantee specific results.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#041E42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to write your success story?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of businesses that trust Delt to power their growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/apply"
                className="px-8 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold"
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-[#041E42] rounded-lg hover:bg-[#F6F7FB] transition-colors font-semibold"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
