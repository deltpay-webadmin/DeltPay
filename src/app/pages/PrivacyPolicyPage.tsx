import { Shield, Lock, Eye, FileText } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-24 bg-[#F6F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-[#4945FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#041E42] mb-6">
              Privacy Policy
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
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Introduction</h2>
              <p className="text-[#6B7280] leading-relaxed">
                At Delt, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our payment processing services, website, and related products.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Information We Collect</h2>
              <div className="bg-[#F6F7FB] p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-[#041E42] mb-3">Personal Information</h3>
                <p className="text-[#6B7280] leading-relaxed mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>• Name, email address, and contact information</li>
                  <li>• Business information and tax identification numbers</li>
                  <li>• Payment and banking information</li>
                  <li>• Account credentials and security information</li>
                </ul>
              </div>

              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <h3 className="text-xl font-bold text-[#041E42] mb-3">Automatically Collected Information</h3>
                <p className="text-[#6B7280] leading-relaxed mb-3">
                  We automatically collect certain information when you use our services:
                </p>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>• Device information and IP addresses</li>
                  <li>• Usage data and transaction information</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Location data</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">How We Use Your Information</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Processing Transactions</h4>
                      <p className="text-sm text-[#6B7280]">To facilitate payments and provide our core services</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Fraud Prevention</h4>
                      <p className="text-sm text-[#6B7280]">To detect and prevent fraudulent activities</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Compliance</h4>
                      <p className="text-sm text-[#6B7280]">To comply with legal and regulatory requirements</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Service Improvement</h4>
                      <p className="text-sm text-[#6B7280]">To enhance and optimize our products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Data Sharing and Disclosure</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="space-y-3 text-[#6B7280]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4945FF] font-bold">•</span>
                  <span><strong className="text-[#041E42]">With service providers:</strong> We work with third-party vendors who help us operate our business</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4945FF] font-bold">•</span>
                  <span><strong className="text-[#041E42]">For legal compliance:</strong> When required by law or to protect our rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4945FF] font-bold">•</span>
                  <span><strong className="text-[#041E42]">With your consent:</strong> When you explicitly authorize us to share information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4945FF] font-bold">•</span>
                  <span><strong className="text-[#041E42]">In business transfers:</strong> In connection with mergers, acquisitions, or asset sales</span>
                </li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Data Security</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <div className="bg-[#EEF2FF] border-2 border-[#4945FF] p-6 rounded-xl mt-4">
                <ul className="space-y-2 text-[#041E42]">
                  <li>✓ End-to-end encryption for sensitive data</li>
                  <li>✓ PCI DSS Level 1 compliance</li>
                  <li>✓ Regular security audits and penetration testing</li>
                  <li>✓ Secure data centers with 24/7 monitoring</li>
                  <li>✓ Multi-factor authentication options</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Your Rights</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Access and Portability</h4>
                  <p className="text-[#6B7280] text-sm">Request access to your personal data and receive a copy in a portable format</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Correction</h4>
                  <p className="text-[#6B7280] text-sm">Request corrections to inaccurate or incomplete information</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Deletion</h4>
                  <p className="text-[#6B7280] text-sm">Request deletion of your personal data, subject to legal requirements</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Opt-Out</h4>
                  <p className="text-[#6B7280] text-sm">Opt out of marketing communications at any time</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Contact Us</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <p className="text-[#041E42] mb-2"><strong>Email:</strong> privacy@deltcapital.com</p>
                <p className="text-[#041E42] mb-2"><strong>Phone:</strong> 1-888-555-1234</p>
                <p className="text-[#041E42]"><strong>Mail:</strong> Delt Privacy Team, 123 Commerce Street, San Francisco, CA 94102</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
