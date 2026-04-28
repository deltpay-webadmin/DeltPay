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
            <p className="text-lg text-[#475569]">
              Last Updated: April 22, 2026
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
              <p className="text-[#475569] leading-relaxed">
                Your privacy matters to us. Here's a plain-English summary of how we collect, use, and protect your information when you use Delt's payment services, website, and related products.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Information We Collect</h2>
              <div className="bg-[#F6F7FB] p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-[#041E42] mb-3">Personal Information</h3>
                <p className="text-[#475569] leading-relaxed mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="space-y-2 text-[#475569]">
                  <li>• Name, email address, and contact information</li>
                  <li>• Business information and tax identification numbers</li>
                  <li>• Payment and banking information</li>
                  <li>• Account credentials and security information</li>
                </ul>
              </div>

              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <h3 className="text-xl font-bold text-[#041E42] mb-3">Automatically Collected Information</h3>
                <p className="text-[#475569] leading-relaxed mb-3">
                  We automatically collect certain information when you use our services:
                </p>
                <ul className="space-y-2 text-[#475569]">
                  <li>• Device information and IP addresses</li>
                  <li>• Usage data and transaction information</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Location data</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">How We Use Your Information</h2>
              <p className="text-[#475569] leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Processing Transactions</h4>
                      <p className="text-sm text-[#475569]">To facilitate payments and provide our core services</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Fraud Prevention</h4>
                      <p className="text-sm text-[#475569]">To detect and prevent fraudulent activities</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Compliance</h4>
                      <p className="text-sm text-[#475569]">To comply with legal and regulatory requirements</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#4945FF] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#041E42] mb-1">Service Improvement</h4>
                      <p className="text-sm text-[#475569]">To enhance and optimize our products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Data Sharing and Disclosure</h2>
              <p className="text-[#475569] leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="space-y-3 text-[#475569]">
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
              <p className="text-[#475569] leading-relaxed">
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
              <p className="text-[#475569] leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Access and Portability</h4>
                  <p className="text-[#475569] text-sm">Request access to your personal data and receive a copy in a portable format</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Correction</h4>
                  <p className="text-[#475569] text-sm">Request corrections to inaccurate or incomplete information</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Deletion</h4>
                  <p className="text-[#475569] text-sm">Request deletion of your personal data, subject to legal requirements</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-2">Opt-Out</h4>
                  <p className="text-[#475569] text-sm">Opt out of marketing communications at any time</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Your Rights Under CCPA/CPRA (California)</h2>
              <p className="text-[#475569] leading-relaxed mb-4">
                If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
              </p>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Know</h4>
                  <p className="text-[#475569] text-sm">You may request information about the categories and specific pieces of personal information we have collected about you, and how we use and share it.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Delete</h4>
                  <p className="text-[#475569] text-sm">You may request deletion of your personal information, subject to certain exceptions.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Correct</h4>
                  <p className="text-[#475569] text-sm">You may request correction of inaccurate personal information we maintain about you.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Opt Out of Sale/Sharing</h4>
                  <p className="text-[#475569] text-sm">You may opt out of the sale or sharing of your personal information for cross-context behavioral advertising.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Limit Use of Sensitive Personal Information</h4>
                  <p className="text-[#475569] text-sm">You may direct us to limit use of your sensitive personal information to what is necessary to perform the services you requested.</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Your Rights Under GDPR</h2>
              <p className="text-[#475569] leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR):
              </p>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right of Access</h4>
                  <p className="text-[#475569] text-sm">You may request a copy of the personal data we hold about you.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Rectification</h4>
                  <p className="text-[#475569] text-sm">You may request correction of inaccurate or incomplete personal data.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Erasure</h4>
                  <p className="text-[#475569] text-sm">You may request deletion of your personal data where there is no compelling reason for us to continue processing it.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Data Portability</h4>
                  <p className="text-[#475569] text-sm">You may receive your personal data in a structured, commonly used, machine-readable format.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Restrict Processing</h4>
                  <p className="text-[#475569] text-sm">You may request that we restrict processing of your personal data in certain circumstances.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Right to Object</h4>
                  <p className="text-[#475569] text-sm">You may object to processing of your personal data for direct marketing or where processing is based on legitimate interests.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Legal Basis for Processing</h4>
                  <p className="text-[#475569] text-sm">We process your data on the following legal bases: contract performance (to provide our services), legitimate interests (fraud prevention, security, service improvement), and consent (marketing communications).</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Data Retention</h2>
              <div className="space-y-3">
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Transaction Records</h4>
                  <p className="text-[#475569] text-sm">Retained for 7 years for regulatory compliance.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Marketing Data</h4>
                  <p className="text-[#475569] text-sm">Retained until you opt out of marketing communications.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Support Transcripts</h4>
                  <p className="text-[#475569] text-sm">Retained for 2 years.</p>
                </div>
                <div className="bg-[#F6F7FB] p-4 rounded-lg">
                  <h4 className="font-bold text-[#041E42] mb-1">Account Data</h4>
                  <p className="text-[#475569] text-sm">Retained for the duration of your account plus 2 years following account closure.</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#041E42] mb-4">Contact Us</h2>
              <p className="text-[#475569] leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-[#F6F7FB] p-6 rounded-xl">
                <p className="text-[#041E42] mb-2"><strong>Email:</strong> privacy@delt.com</p>
                <p className="text-[#041E42] mb-2"><strong>Phone:</strong> (864) 729-3358</p>
                <p className="text-[#041E42]"><strong>Mail:</strong> Delt Pay LLC, Attn: Privacy, 2726 NW 72nd Ave, Miami, FL 33122</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
