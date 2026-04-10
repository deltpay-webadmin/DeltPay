import { CreditCard, DollarSign, Globe, BarChart3, Smartphone, Monitor, Printer, Wallet, Clock, Shield, Zap, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function ProductsPage() {
  const navigate = useNavigate();
  const products = [
    {
      icon: CreditCard,
      title: 'Payment Processing',
      tagline: 'Accept payments anywhere, anytime',
      description: 'Process payments online, in-person, or on-the-go with our comprehensive payment solutions. Accept all major credit cards, mobile wallets, and contactless payments.',
      features: [
        'Accept all major payment methods',
        'Contactless & mobile wallets',
        'Online payment gateway',
        'Recurring billing',
        'International payments',
        'Real-time reporting'
      ],
      stats: [
        { value: '2.6%', label: 'Transaction fee' },
        { value: '1-2 days', label: 'Deposit time' },
        { value: '99.9%', label: 'Uptime' }
      ],
      color: 'from-[#4945FF] to-[#7C3AED]'
    },
    {
      icon: Wallet,
      title: 'Business Capital',
      tagline: 'Fast funding for your business',
      description: 'Get the capital you need to grow your business with flexible financing options. No lengthy applications or collateral required.',
      features: [
        'Fast approval process',
        'Flexible repayment terms',
        'No collateral required',
        'Competitive rates',
        'Same-day funding available',
        'Based on actual sales'
      ],
      stats: [
        { value: '$500-$500K', label: 'Funding range' },
        { value: '24 hours', label: 'Approval time' },
        { value: '8%', label: 'Starting rate' }
      ],
      color: 'from-[#10B981] to-[#059669]'
    },
    {
      icon: Globe,
      title: 'Website Builder',
      tagline: 'Build your online presence',
      description: 'Create a beautiful, professional website in minutes with our drag-and-drop builder. Includes hosting, SSL, and seamless payment integration.',
      features: [
        'Drag & drop builder',
        'Mobile-responsive designs',
        'Free hosting & SSL',
        'Built-in e-commerce',
        'SEO optimization',
        'Custom domain support'
      ],
      stats: [
        { value: '100+', label: 'Templates' },
        { value: '0', label: 'Coding needed' },
        { value: '24/7', label: 'Uptime monitoring' }
      ],
      color: 'from-[#06B6D4] to-[#3B82F6]'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      tagline: 'AI-powered insights for growth',
      description: 'Make data-driven decisions with powerful analytics and reporting tools. Get real-time insights into sales, customers, and business performance.',
      features: [
        'Real-time dashboards',
        'Predictive analytics',
        'Customer insights',
        'Sales forecasting',
        'Custom reports',
        'Performance tracking'
      ],
      stats: [
        { value: 'Real-time', label: 'Updates' },
        { value: 'AI-powered', label: 'Insights' },
        { value: 'Unlimited', label: 'Reports' }
      ],
      color: 'from-[#FF6B6B] to-[#FF8E53]'
    }
  ];

  const hardware = [
    {
      icon: Smartphone,
      name: 'Delt Terminal',
      price: '$299',
      description: 'All-in-one payment terminal with touchscreen',
      features: ['5" touchscreen', 'WiFi & LTE', 'All-day battery', 'Built-in printer']
    },
    {
      icon: Monitor,
      name: 'Delt Register',
      price: '$799',
      description: 'Complete POS system for your counter',
      features: ['13" display', 'Customer display', 'Cash drawer', 'Receipt printer']
    },
    {
      icon: Smartphone,
      name: 'Delt Reader',
      price: '$49',
      description: 'Mobile card reader for smartphones',
      features: ['Connects via Bluetooth', 'Accepts chip & tap', 'Portable', 'Long battery life']
    }
  ];

  const integrations = [
    'QuickBooks', 'Shopify', 'WooCommerce', 'WordPress', 'Mailchimp', 'Zapier',
    'Slack', 'Xero', 'NetSuite', 'Salesforce', 'HubSpot', 'Square'
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
            <h1 className="text-5xl font-bold mb-6">Everything you need to run your business</h1>
            <p className="text-xl text-white/80 mb-8">
              From payment processing to business analytics, Delt provides all the tools you need to grow and succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pricing"
                className="bg-white text-[#4945FF] px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Get Started
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

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-24">
            {products.map((product, index) => {
              const Icon = product.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className="relative">
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                    {/* Icon Section */}
                    <div className="w-full lg:w-2/5">
                      <div className={`bg-gradient-to-br ${product.color} rounded-3xl p-12 text-white shadow-2xl`}>
                        <Icon className="h-20 w-20 mb-6" />
                        <h2 className="text-3xl font-bold mb-3">{product.title}</h2>
                        <p className="text-white/90 text-lg">{product.tagline}</p>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
                          {product.stats.map((stat, idx) => (
                            <div key={idx}>
                              <div className="font-bold text-lg">{stat.value}</div>
                              <div className="text-white/70 text-sm">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full lg:w-3/5">
                      <p className="text-xl text-[#64748B] mb-6">
                        {product.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-[#4945FF] mt-0.5 flex-shrink-0" />
                            <span className="text-[#041E42]">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <a 
                        href="#"
                        className="inline-flex items-center gap-2 text-[#4945FF] font-semibold hover:gap-3 transition-all text-lg"
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

      {/* Hardware Section */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#041E42] mb-4">Hardware</h2>
              <p className="text-xl text-[#64748B]">
                Professional payment hardware designed for reliability and ease of use
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {hardware.map((device, index) => {
                const Icon = device.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow border border-[#E2E8F0]"
                  >
                    <div className="w-16 h-16 bg-[#F0F0FF] rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-[#4945FF]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#041E42] mb-2">{device.name}</h3>
                    <div className="text-3xl font-bold text-[#4945FF] mb-4">{device.price}</div>
                    <p className="text-[#64748B] mb-6">{device.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      {device.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-[#4945FF] flex-shrink-0" />
                          <span className="text-[#041E42]">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-colors">
                      Order Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#041E42] mb-4">Built for modern businesses</h2>
              <p className="text-xl text-[#64748B]">
                Everything you need, integrated into one platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: 'Bank-level Security', description: 'PCI-DSS compliant with end-to-end encryption' },
                { icon: Zap, title: 'Lightning Fast', description: 'Process payments in under 2 seconds' },
                { icon: Clock, title: 'Quick Setup', description: 'Start accepting payments in minutes' },
                { icon: Globe, title: 'Global Reach', description: 'Accept payments from 135+ countries' },
                { icon: BarChart3, title: 'Real-time Analytics', description: 'Track your business performance live' },
                { icon: CreditCard, title: 'All Payment Types', description: 'Cards, wallets, contactless, and more' }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center p-6">
                    <div className="w-16 h-16 bg-[#F0F0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-[#4945FF]" />
                    </div>
                    <h3 className="font-bold text-[#041E42] text-lg mb-2">{feature.title}</h3>
                    <p className="text-[#64748B]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Works with your favorite tools</h2>
            <p className="text-xl text-[#64748B] mb-12">
              Seamlessly integrate with the software you already use
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="bg-white px-6 py-3 rounded-lg border border-[#E2E8F0] font-medium text-[#041E42] hover:border-[#4945FF] hover:text-[#4945FF] transition-colors"
                >
                  {integration}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a 
                href="#"
                className="inline-flex items-center gap-2 text-[#4945FF] font-semibold hover:gap-3 transition-all"
              >
                View all integrations
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#041E42] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join millions of businesses that trust Delt for their payment needs.
            </p>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2 bg-[#4945FF] px-8 py-4 rounded-lg font-semibold hover:bg-[#3730FF] transition-colors"
            >
              View Pricing & Plans
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
