import { Briefcase, MapPin, Clock, ArrowRight, Lightbulb, Star, Users, Scale, Heart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router';

export function CareersPage() {
  const navigate = useNavigate();
  const openPositions = [
    {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      payRange: '$140,000\u2013$220,000 USD',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'New York, NY / Remote',
      type: 'Full-time',
      payRange: '$120,000\u2013$200,000 USD',
    },
    {
      title: 'Account Executive',
      department: 'Sales',
      location: 'Chicago, IL',
      type: 'Full-time',
      payRange: '$110,000\u2013$200,000 USD (OTE)',
    },
    {
      title: 'Customer Success Manager',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      payRange: '$75,000\u2013$120,000 USD',
    },
    {
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Austin, TX / Remote',
      type: 'Full-time',
      payRange: '$100,000\u2013$170,000 USD',
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      payRange: '$100,000\u2013$170,000 USD',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#041E42] mb-6">
              Build the future of <span className="text-[#4945FF]">commerce</span>
            </h1>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              We build the tools that help business owners run their shops, serve more customers, and keep more of what they earn. Come work on something that matters every day.
            </p>
          </div>
        </div>
      </section>

      {/* Why Delt */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Why work at Delt?</h2>
            <p className="text-xl text-[#475569]">
              We care about the work and the people doing it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Lightbulb className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Innovation</h3>
              <p className="text-[#475569]">
                Work on real problems — the kind that show up when a restaurant owner is closing out on a Friday night or a shop is trying to get paid faster.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Star className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Growth</h3>
              <p className="text-[#475569]">
                Mentorship, learning budget, and a clear path forward. You grow here.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Users className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Culture</h3>
              <p className="text-[#475569]">
                A team that gives honest feedback, shares the credit, and actually enjoys working together.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Scale className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Balance</h3>
              <p className="text-[#475569]">
                Flexible schedules, generous time off, and the trust to manage your own time.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Heart className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Benefits</h3>
              <p className="text-[#475569]">
                Full health coverage, 401(k) match, equity, and wellness support.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Globe className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Impact</h3>
              <p className="text-[#475569]">
                The restaurants, salons, and shops that use Delt are real businesses run by real people. Your work helps them thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#041E42] mb-4">Open positions</h2>
            <p className="text-xl text-[#475569]">
              Good work, honest pay, real purpose
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-[#E5E7EB] hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#041E42] mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {position.department}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] mt-2">Estimated base salary: {position.payRange}, depending on experience and location. This role may include equity compensation.</p>
                  </div>
                  <button onClick={() => navigate('/contact-sales')} className="flex items-center gap-2 px-6 py-3 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold whitespace-nowrap">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#041E42] mb-6">
              Don't see the right role?
            </h2>
            <p className="text-xl text-[#475569] mb-8">
              Don't see a match? We're always open to meeting people who care about the work. Send us your resume and we'll reach out when something fits.
            </p>
            <button onClick={() => { window.location.href = 'mailto:careers@delt.com'; }} className="px-8 py-4 bg-[#4945FF] text-white rounded-lg hover:bg-[#3730FF] transition-colors font-semibold">
              Send Us Your Resume
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-[#F6F7FB] rounded-xl text-sm text-[#475569]">Delt is an equal opportunity employer. We do not discriminate on the basis of race, color, religion, sex, national origin, age, disability, veteran status, or any other characteristic protected by applicable law. We are committed to creating an inclusive environment for all employees.</div>
        </div>
      </section>
    </div>
  );
}
