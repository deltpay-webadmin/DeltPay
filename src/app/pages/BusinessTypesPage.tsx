import { Utensils, Store, ShoppingBag, Coffee, Scissors, Briefcase, ArrowRight, CheckCircle, TrendingUp, Users, Clock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function BusinessTypesPage() {
  const navigate = useNavigate();
  const businessCategories = [
    {
      icon: Utensils,
      title: 'Restaurants & Food Service',
      description: 'Complete payment solutions for restaurants, cafes, food trucks, and catering businesses',
      features: [
        'Table management and POS',
        'Online ordering integration',
        'Split payments and tips',
        'Kitchen display systems'
      ],
      businesses: ['Full-service restaurants', 'Quick-service restaurants', 'Coffee shops', 'Food trucks', 'Catering'],
      color: 'from-[#FF6B6B] to-[#FF8E53]'
    },
    {
      icon: ShoppingBag,
      title: 'Retail',
      description: 'Powerful tools for brick-and-mortar and online retail businesses of all sizes',
      features: [
        'Inventory management',
        'Multi-location support',
        'Customer profiles',
        'E-commerce integration'
      ],
      businesses: ['Fashion & apparel', 'Electronics', 'Home goods', 'Specialty retail', 'Pop-up shops'],
      color: 'from-[#4945FF] to-[#7C3AED]'
    },
    {
      icon: Scissors,
      title: 'Services',
      description: 'Appointment-based solutions for salons, spas, and wellness businesses',
      features: [
        'Appointment scheduling',
        'Client management',
        'Recurring payments',
        'Staff commissions'
      ],
      businesses: ['Salons & spas', 'Fitness studios', 'Health & wellness', 'Personal care', 'Automotive services'],
      color: 'from-[#06B6D4] to-[#3B82F6]'
    },
    {
      icon: Briefcase,
      title: 'Professional Services',
      description: 'Streamlined invoicing and payment collection for professional service providers',
      features: [
        'Invoice management',
        'Project tracking',
        'Recurring billing',
        'Client portal access'
      ],
      businesses: ['Consulting', 'Legal services', 'Accounting', 'Marketing agencies', 'Real estate'],
      color: 'from-[#10B981] to-[#059669]'
    }
  ];

  const stats = [
    { value: '4M+', label: 'Businesses served' },
    { value: '99.9%', label: 'Uptime guarantee' },
    { value: '24/7', label: 'Support available' },
    { value: '$200B+', label: 'Processed annually' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#041E42] to-[#4945FF] text-white py-20">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Solutions for every business</h1>
            <p className="text-xl text-white/80 mb-8">
              Whether you're running a restaurant, retail store, service business, or professional practice, Delt has the tools you need to succeed.
            </p>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2 bg-white text-[#4945FF] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#4945FF] mb-2">{stat.value}</div>
                <div className="text-[#64748B]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-20">
            {businessCategories.map((category, index) => {
              const Icon = category.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                >
                  {/* Icon Card */}
                  <div className="w-full lg:w-1/3">
                    <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-12 text-white shadow-2xl`}>
                      <Icon className="h-20 w-20 mb-6" />
                      <h2 className="text-3xl font-bold">{category.title}</h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="w-full lg:w-2/3">
                    <p className="text-xl text-[#64748B] mb-6">
                      {category.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="font-bold text-[#041E42] mb-4">Key features:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-[#4945FF] mt-0.5 flex-shrink-0" />
                            <span className="text-[#041E42]">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Types */}
                    <div>
                      <h3 className="font-bold text-[#041E42] mb-3">Perfect for:</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.businesses.map((business, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-[#F0F0FF] text-[#4945FF] rounded-full text-sm"
                          >
                            {business}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <a 
                        href="#"
                        className="inline-flex items-center gap-2 text-[#4945FF] font-semibold hover:gap-3 transition-all"
                      >
                        Learn more
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#041E42] mb-4">Success stories</h2>
              <p className="text-xl text-[#64748B]">
                See how businesses like yours are growing with Delt
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  business: 'Artisan Coffee Co.',
                  type: 'Coffee Shop',
                  quote: 'Delt helped us streamline operations and increase sales by 40%',
                  metric: '40% increase in sales',
                  icon: Coffee
                },
                {
                  business: 'Bella Boutique',
                  type: 'Fashion Retail',
                  quote: 'The inventory management features have been a game-changer',
                  metric: '50% faster checkout',
                  icon: ShoppingBag
                },
                {
                  business: 'Elite Consulting Group',
                  type: 'Professional Services',
                  quote: 'Getting paid is now effortless with automated invoicing',
                  metric: '90% faster payments',
                  icon: Briefcase
                }
              ].map((story, index) => {
                const Icon = story.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-[#F0F0FF] rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-[#4945FF]" />
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-[#041E42] text-lg">{story.business}</h3>
                      <p className="text-sm text-[#94A3B8]">{story.type}</p>
                    </div>
                    <p className="text-[#64748B] mb-4 italic">"{story.quote}"</p>
                    <div className="flex items-center gap-2 text-[#4945FF] font-semibold">
                      <TrendingUp className="h-5 w-5" />
                      {story.metric}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#041E42] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to transform your business?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join millions of businesses that trust Delt to power their payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pricing"
                className="bg-[#4945FF] px-8 py-4 rounded-lg font-semibold hover:bg-[#3730FF] transition-colors"
              >
                View Pricing
              </Link>
              <Link 
                to="/support"
                className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
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
