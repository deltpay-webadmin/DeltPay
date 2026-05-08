import { Briefcase, MapPin, Clock, ArrowRight, Lightbulb, Star, Users, Scale, Heart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router';

export function CareersPage() {
  const navigate = useNavigate();
  const openPositions = [
    {
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'Miami, FL / Remote',
      type: 'Full-time',
      payRange: '$110,000\u2013$180,000 USD',
    },
    {
      title: 'Account Executive',
      department: 'Sales',
      location: 'Miami, FL',
      type: 'Full-time',
      payRange: '$70,000\u2013$160,000 USD (OTE)',
    },
    {
      title: 'Support Staff',
      department: 'Merchant Support',
      location: 'Miami, FL / Remote',
      type: 'Full-time',
      payRange: '$45,000\u2013$70,000 USD',
    },
    {
      title: 'Installation Technician',
      department: 'Field Operations',
      location: 'South Florida — on-site',
      type: 'Full-time',
      payRange: '$50,000\u2013$75,000 USD',
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
              Join our team of innovators, builders, and dreamers who are transforming how businesses operate and grow. We're looking for talented people who want to make a real impact.
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
              We offer more than just a job—we offer a career with purpose
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Lightbulb className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Innovation</h3>
              <p className="text-[#475569]">
                Work on cutting-edge technology and solve complex problems that impact thousands of businesses.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Star className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Growth</h3>
              <p className="text-[#475569]">
                Continuous learning opportunities, mentorship programs, and clear career progression paths.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Users className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Culture</h3>
              <p className="text-[#475569]">
                Collaborative environment with talented colleagues who are passionate about what they do.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Scale className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Balance</h3>
              <p className="text-[#475569]">
                Flexible work arrangements, generous PTO, and a focus on sustainable work-life balance.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Heart className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Benefits</h3>
              <p className="text-[#475569]">
                Comprehensive health coverage, 401(k) matching, equity options, and wellness programs.
              </p>
            </div>

            <div className="bg-[#F6F7FB] p-8 rounded-2xl">
              <Globe className="w-10 h-10 text-[#4945FF] mb-4" />
              <h3 className="text-xl font-bold text-[#041E42] mb-3">Impact</h3>
              <p className="text-[#475569]">
                Make a real difference by helping businesses succeed and empowering entrepreneurs worldwide.
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
              Find your next opportunity at Delt
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
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
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
