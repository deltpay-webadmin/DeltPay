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
      description: 'How a small boutique doubled down on online sales and grew fast.',
      results: [
        'Online sales up 180% in 6 months',
        '45% fewer abandoned carts',
        'Inventory management that actually works',
        'Opened 3 new locations',
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
      description: 'A farm-to-table restaurant used Delt\'s POS and online ordering to triple their order volume.',
      results: [
        'Delivery orders tripled in the first quarter',
        'Checkout 60% faster at the register',
        'Better table turnover',
        'Added a catering revenue stream',
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
      description: 'A consulting firm automated billing and got paid on time, every time.',
      results: [
        '99% of invoices paid on time',
        '15 fewer admin hours every week',
        'Recurring billing runs itself',
        'Happier clients, fewer payment headaches',
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
      description: 'A wellness studio got 0K in funding within 48 hours and used it to grow.',
      results: [
        '$50K approved in under 48 hours',
        'Added 3 treatment rooms',
        'Hired 5 new staff',
        'Monthly revenue up 65%',
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
      description: 'An online beauty brand scaled from zero to 250K monthly charges with Delt.',
      results: [
        'Processing 250K+ charges every month',
        'Expanded to 12 countries',
        '99.9% uptime on their busiest sales days',
        'Fraud down 78%',
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
      description: 'A 15-location hardware chain switched to Delt and saved $2M a year in processing fees.',
      results: [
        '$2M saved in processing fees each year',
        'All 15 stores connected in one dashboard',
        'Real-time inventory across every location',
        'Better terms with vendors',
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
              Results from real <span className="text-[#4945FF]">businesses</span>
            </h1>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              Real numbers from real business owners. See what happened when they switched to Delt.
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
                    <h4 className="font-bold text-[#041E42]">What changed:</h4>
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
                    Read the full story
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
            Results shown are based on individual customer experiences. Your results will vary depending on your industry, business size, and other factors. Delt does not guarantee specific outcomes.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#041E42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to build your own results?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Thousands of business owners already run on Delt. See what it looks like for yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/apply"
                className="px-8 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold"
              >
                Open a free account
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-[#041E42] rounded-lg hover:bg-[#F6F7FB] transition-colors font-semibold"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
