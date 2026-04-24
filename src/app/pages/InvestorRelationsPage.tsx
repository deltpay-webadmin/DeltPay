import { TrendingUp, DollarSign, Users, BarChart3, Download, Calendar, FileText, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function InvestorRelationsPage() {
  const financialHighlights = [
    { label: 'Revenue (2025)', value: '$2.4B', change: '+42%' },
    { label: 'Gross Payment Volume', value: '$156B', change: '+38%' },
    { label: 'Active Merchants', value: '2.8M', change: '+25%' },
    { label: 'Market Cap', value: '$48.2B', change: '+56%' },
  ];

  const quarterlyReports = [
    { quarter: 'Q4 2025', date: 'February 5, 2026', type: 'Earnings Release', link: '#' },
    { quarter: 'Q3 2025', date: 'November 7, 2025', type: 'Earnings Release', link: '#' },
    { quarter: 'Q2 2025', date: 'August 8, 2025', type: 'Earnings Release', link: '#' },
    { quarter: 'Q1 2025', date: 'May 9, 2025', type: 'Earnings Release', link: '#' },
  ];

  const annualReports = [
    { year: '2025', title: 'Annual Report & 10-K', date: 'March 15, 2026' },
    { year: '2024', title: 'Annual Report & 10-K', date: 'March 16, 2025' },
    { year: '2023', title: 'Annual Report & 10-K', date: 'March 18, 2024' },
  ];

  const leadership = [
    { name: 'Sarah Chen', title: 'Chief Executive Officer', image: '👩‍💼' },
    { name: 'Michael Roberts', title: 'Chief Financial Officer', image: '👨‍💼' },
    { name: 'Jennifer Lopez', title: 'Chief Technology Officer', image: '👩‍💼' },
    { name: 'David Kim', title: 'Chief Operating Officer', image: '👨‍💼' },
  ];

  const pressReleases = [
    {
      date: 'Feb 5, 2026',
      title: 'Delt Reports Record Q4 2025 Results: Revenue Up 42% Year-Over-Year',
      category: 'Earnings',
    },
    {
      date: 'Jan 18, 2026',
      title: 'Delt Expands International Presence with Launch in 15 New Markets',
      category: 'Business',
    },
    {
      date: 'Dec 12, 2025',
      title: 'Delt Named to Fortune 500 List for Third Consecutive Year',
      category: 'Recognition',
    },
    {
      date: 'Nov 7, 2025',
      title: 'Delt Q3 2025 Earnings: Gross Payment Volume Reaches $38B',
      category: 'Earnings',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-[#041E42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 bg-[#4945FF]/20 text-[#4945FF] rounded-full text-sm font-semibold mb-6">
              NASDAQ: DELT
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Investor Relations
            </h1>
            <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
              Powering commerce for millions of businesses worldwide. Explore our financial performance, corporate governance, and growth strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Q4 2025 Report
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold">
                Subscribe to Updates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Information */}
      <section className="py-12 bg-[#F6F7FB] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-sm text-[#475569] mb-1">Stock Price</div>
              <div className="text-3xl font-bold text-[#041E42]">$284.50</div>
              <div className="flex items-center gap-1 text-sm text-[#4945FF] font-semibold mt-1">
                <ArrowUpRight className="w-4 h-4" />
                +5.2% Today
              </div>
            </div>
            <div>
              <div className="text-sm text-[#475569] mb-1">52-Week High</div>
              <div className="text-3xl font-bold text-[#041E42]">$295.80</div>
            </div>
            <div>
              <div className="text-sm text-[#475569] mb-1">52-Week Low</div>
              <div className="text-3xl font-bold text-[#041E42]">$182.40</div>
            </div>
            <div>
              <div className="text-sm text-[#475569] mb-1">Volume</div>
              <div className="text-3xl font-bold text-[#041E42]">12.4M</div>
            </div>
          </div>
          <div className="mt-6 text-xs text-[#475569]">
            Market data as of February 9, 2026 4:00 PM EST. Data delayed by 15 minutes.
          </div>
        </div>
      </section>

      {/* Financial Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Financial Highlights</h2>
            <p className="text-base text-[#475569] mt-2">All figures as of the period noted; unaudited unless otherwise indicated.</p>
            <p className="text-xl text-[#475569]">
              Strong growth across all key metrics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialHighlights.map((item, index) => (
              <div key={index} className="bg-[#F6F7FB] p-8 rounded-2xl">
                <div className="text-sm text-[#475569] mb-2">{item.label}</div>
                <div className="text-4xl font-bold text-[#041E42] mb-2">{item.value}</div>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#4945FF]/10 text-[#4945FF] rounded-full text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  {item.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics Graph Section */}
      <section className="py-20 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#041E42] mb-8">Revenue Growth</h2>
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB]">
            <div className="grid grid-cols-5 gap-4 items-end h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#4945FF] rounded-t-lg" style={{ height: '40%' }}></div>
                <div className="text-sm font-semibold text-[#041E42]">2021</div>
                <div className="text-xs text-[#475569]">$0.8B</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#4945FF] rounded-t-lg" style={{ height: '55%' }}></div>
                <div className="text-sm font-semibold text-[#041E42]">2022</div>
                <div className="text-xs text-[#475569]">$1.2B</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#4945FF] rounded-t-lg" style={{ height: '70%' }}></div>
                <div className="text-sm font-semibold text-[#041E42]">2023</div>
                <div className="text-xs text-[#475569]">$1.5B</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#4945FF] rounded-t-lg" style={{ height: '85%' }}></div>
                <div className="text-sm font-semibold text-[#041E42]">2024</div>
                <div className="text-xs text-[#475569]">$1.7B</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#4945FF] rounded-t-lg" style={{ height: '100%' }}></div>
                <div className="text-sm font-semibold text-[#041E42]">2025</div>
                <div className="text-xs text-[#475569]">$2.4B</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports & Filings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#041E42] mb-12">Reports & Filings</h2>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Quarterly Reports */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#4945FF]" />
                </div>
                <h3 className="text-2xl font-bold text-[#041E42]">Quarterly Reports</h3>
              </div>
              <div className="space-y-4">
                {quarterlyReports.map((report, index) => (
                  <a
                    key={index}
                    href={report.link}
                    className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-lg hover:bg-[#EEF2FF] transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-[#041E42] mb-1">{report.quarter}</div>
                      <div className="text-sm text-[#475569]">{report.date}</div>
                    </div>
                    <Download className="w-5 h-5 text-[#4945FF] group-hover:translate-y-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Annual Reports */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#4945FF]" />
                </div>
                <h3 className="text-2xl font-bold text-[#041E42]">Annual Reports</h3>
              </div>
              <div className="space-y-4">
                {annualReports.map((report, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-lg hover:bg-[#EEF2FF] transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-[#041E42] mb-1">{report.year} {report.title}</div>
                      <div className="text-sm text-[#475569]">Published {report.date}</div>
                    </div>
                    <Download className="w-5 h-5 text-[#4945FF] group-hover:translate-y-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* SEC Filings */}
          <div className="bg-[#EEF2FF] border-2 border-[#4945FF] p-8 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#041E42] mb-2">SEC Filings</h3>
                <p className="text-[#475569]">
                  Access our complete filing history on the SEC's EDGAR database
                </p>
              </div>
              <a
                href="https://www.sec.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold whitespace-nowrap flex items-center gap-2"
              >
                View on SEC.gov
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Leadership Team</h2>
            <p className="text-xl text-[#475569]">
              Experienced executives driving our vision forward
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-center">
                <div className="text-6xl mb-4">{leader.image}</div>
                <h3 className="text-lg font-bold text-[#041E42] mb-1">{leader.name}</h3>
                <p className="text-sm text-[#475569]">{leader.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-[#041E42]">Recent Press Releases</h2>
            <a href="#" className="text-[#4945FF] font-semibold hover:text-[#3730FF] flex items-center gap-2">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <a
                key={index}
                href="#"
                className="block p-6 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-[#475569]">{release.date}</span>
                      <span className="px-3 py-1 bg-[#EEF2FF] text-[#4945FF] text-xs font-semibold rounded-full">
                        {release.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#041E42] hover:text-[#4945FF] transition-colors">
                      {release.title}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#4945FF] flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Contact */}
      <section className="py-20 bg-[#041E42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Investor Relations Contact</h2>
              <p className="text-xl text-white/80 mb-8">
                Our investor relations team is here to answer your questions and provide additional information.
              </p>
              <div className="space-y-4">
                <a href="mailto:ir@deltcapital.com" className="flex items-center gap-3 text-white hover:text-[#4945FF] transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="text-lg">ir@deltcapital.com</span>
                </a>
                <a href="tel:1-888-555-IR00" className="flex items-center gap-3 text-white hover:text-[#4945FF] transition-colors">
                  <Phone className="w-5 h-5" />
                  <span className="text-lg">1-888-555-IR00</span>
                </a>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">Email Alerts</h3>
              <p className="text-white/80 mb-6">
                Subscribe to receive the latest financial news, earnings releases, and SEC filings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4945FF]"
                />
                <button className="px-6 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-white/60 mt-2">By subscribing you agree to receive investor updates. See our <Link to="/privacy" className="underline">Privacy Policy</Link>. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-[#F6F7FB] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#94A3B8]/30 rounded-lg p-4 bg-[#F6F7FB] text-[#475569]">
            <p className="text-sm text-[#475569] text-center leading-relaxed">
              Forward-Looking Statements: This page contains forward-looking statements within the meaning of the federal securities laws. These statements are subject to risks and uncertainties that could cause actual results to differ materially from those projected. For more information, please refer to our SEC filings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
