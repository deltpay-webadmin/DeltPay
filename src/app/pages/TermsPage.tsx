import { FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-24 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-[#4945FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#041E42] mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-[#6B7280]">
              Last updated: February 9, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Agreement to Terms</h2>
              <p className="text-[#6B7280] leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of Delt's payment processing services, website, and related products (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Account Registration</h2>
              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  To use our Services, you must:
                </p>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>• Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>• Provide accurate, complete, and current information</li>
                  <li>• Maintain the security of your account credentials</li>
                  <li>• Accept full responsibility for all activities under your account</li>
                  <li>• Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Payment Processing Services</h2>
              <div className="space-y-4">
                <div className="bg-[#F6F7FB] p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-[#041E42] mb-3">Merchant Agreement</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    By using our payment processing services, you authorize Delt to process payments on your behalf. You agree to comply with all card network rules and regulations.
                  </p>
                </div>

                <div className="bg-[#F6F7FB] p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-[#041E42] mb-3">Fees and Pricing</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    You agree to pay all applicable fees as outlined in your pricing plan. Fees are subject to change with 30 days' notice. Transaction fees are deducted from each payment processed.
                  </p>
                </div>

                <div className="bg-[#F6F7FB] p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-[#041E42] mb-3">Settlements and Payouts</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Settlement timing depends on your pricing plan. We reserve the right to hold funds or delay settlements if we detect suspicious activity or potential fraud.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Prohibited Activities</h2>
              <div className="bg-[#FEF2F2] border-2 border-[#DC2626] p-6 rounded-xl">
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  You may not use our Services to:
                </p>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>✗ Process fraudulent or unauthorized transactions</li>
                  <li>✗ Engage in illegal activities or money laundering</li>
                  <li>✗ Sell prohibited goods or services</li>
                  <li>✗ Violate intellectual property rights</li>
                  <li>✗ Transmit malware or harmful code</li>
                  <li>✗ Bypass security measures or access controls</li>
                  <li>✗ Engage in deceptive or misleading practices</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Disputes and Chargebacks</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                You are responsible for handling customer disputes and chargebacks. Key points:
              </p>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <p className="text-[#6B7280]">
                    <strong className="text-[#041E42]">Chargeback Liability:</strong> You bear the cost of chargebacks plus applicable fees
                  </p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <p className="text-[#6B7280]">
                    <strong className="text-[#041E42]">Response Time:</strong> You must respond to dispute notifications within specified timeframes
                  </p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <p className="text-[#6B7280]">
                    <strong className="text-[#041E42]">High Chargeback Ratios:</strong> Excessive chargebacks may result in account suspension or termination
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Intellectual Property</h2>
              <p className="text-[#6B7280] leading-relaxed">
                All content, features, and functionality of the Services are owned by Delt and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works without our express permission.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Limitation of Liability</h2>
              <div className="bg-[#EEF2FF] border-2 border-[#4945FF] p-6 rounded-xl">
                <p className="text-[#041E42] leading-relaxed">
                  To the maximum extent permitted by law, Delt shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Termination</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We may suspend or terminate your access to the Services:
              </p>
              <ul className="space-y-2 text-[#6B7280]">
                <li>• For violation of these Terms</li>
                <li>• For suspected fraudulent activity</li>
                <li>• If required by law or card network rules</li>
                <li>• For extended inactivity</li>
                <li>• At our discretion with notice</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Changes to Terms</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Services. Continued use of the Services after changes constitutes acceptance of the updated Terms.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Governing Law</h2>
              <p className="text-[#6B7280] leading-relaxed">
                These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in San Francisco County, California.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Contact Information</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                For questions about these Terms, please contact:
              </p>
              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <p className="text-[#041E42] mb-2"><strong>Email:</strong> legal@deltcapital.com</p>
                <p className="text-[#041E42] mb-2"><strong>Phone:</strong> 1-888-555-1234</p>
                <p className="text-[#041E42]"><strong>Mail:</strong> Delt Legal Department, 123 Commerce Street, San Francisco, CA 94102</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
