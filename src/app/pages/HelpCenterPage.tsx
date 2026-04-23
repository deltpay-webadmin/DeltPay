import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Search, ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FAQ } from '@/app/components/FAQ';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const GREEN = '#16C784';
const JAKARTA = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── Browse by Topic Data ─── */
const topics = [
  {
    title: 'Getting Started',
    links: ['Creating your account', 'Setting up your storefront', 'Checklist for launching', 'Choosing the right plan'],
  },
  {
    title: 'Payments',
    links: ['Delt Payments overview', 'Processing fees explained', 'Accepting online payments', 'Payment disputes & chargebacks'],
  },
  {
    title: 'Delt Capital',
    links: ['How funding works', 'Eligibility requirements', 'Repayment terms', 'Managing your advance'],
  },
  {
    title: 'Your Account',
    links: ['Logging in to Delt', 'Managing your billing', 'Two-factor authentication', 'Account permissions'],
  },
  {
    title: 'Storefront & Website',
    links: ['Customizing your site', 'Adding products & services', 'Domain setup', 'SEO & analytics'],
  },
  {
    title: 'Delt Lens (AI)',
    links: ['What is Lens?', 'Using Lens insights', 'Lens chat assistant', 'Data & privacy'],
  },
  {
    title: 'Orders & Invoicing',
    links: ['Managing orders', 'Creating invoices', 'Refunds & returns', 'Shipping & fulfillment'],
  },
  {
    title: 'Integrations',
    links: ['Connecting third-party apps', 'Accounting software sync', 'Marketing tools', 'API documentation'],
  },
  {
    title: 'Security & Compliance',
    links: ['Data protection', 'PCI compliance', 'Fraud prevention', 'Privacy policy'],
  },
];

/* ─── Popular Articles ─── */
const popularArticles = [
  { title: 'How to set up Delt Payments', category: 'Payments', time: '3 min read' },
  { title: 'Understanding your Delt dashboard', category: 'Getting Started', time: '5 min read' },
  { title: 'How Delt Capital funding works', category: 'Capital', time: '4 min read' },
  { title: 'Customizing your storefront design', category: 'Storefront', time: '6 min read' },
  { title: 'Using Lens AI to grow your business', category: 'Lens', time: '4 min read' },
  { title: 'Setting up online ordering', category: 'Orders', time: '3 min read' },
];

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ fontFamily: JAKARTA }}>
      {/* ─── Hero Section ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #071F3D 50%, #0A2A52 100%)`,
          padding: '100px 24px 80px',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 max-w-[720px] mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            How can we help?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', marginBottom: 36 }}
          >
            Search our knowledge base or browse by topic below
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative max-w-[580px] mx-auto"
          >
            <div
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4"
              style={{
                boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            >
              <Search size={20} color="#9CA3AF" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 text-[16px] text-[#1A1A2E] placeholder-[#B0B7C3] bg-transparent focus:outline-none"
                style={{ fontFamily: JAKARTA }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: PURPLE }}
              >
                <ArrowRight size={16} color="#fff" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {['Getting started', 'Payments', 'Capital', 'Pricing'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={() => setSearchQuery(tag)}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Banner ─── */}
      <section className="max-w-[960px] mx-auto px-6 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: `linear-gradient(135deg, #1a1145 0%, #2d1b69 50%, #1a1145 100%)`,
            height: 200,
          }}
        >
          <div className="absolute inset-0 flex items-center px-10">
            <div>
              <div
                className="text-[12px] uppercase tracking-widest mb-2"
                style={{ color: GREEN, fontWeight: 700 }}
              >
                What&apos;s New
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                Delt Platform Update — Spring &apos;26
              </h3>
              <Link
                to="/whats-new"
                className="inline-flex items-center gap-1.5 text-[14px] no-underline"
                style={{ color: PURPLE, fontWeight: 600 }}
              >
                Explore 40+ updates <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          {/* Decorative gradient orb */}
          <div
            className="absolute -right-10 -top-10 w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${PURPLE}, transparent 70%)` }}
          />
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1698047682129-c3e217ac08b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjB3b3JraW5nJTIwdG9nZXRoZXIlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3NDQ1NjI0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Featured"
            className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-40"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)' }}
          />
        </motion.div>
      </section>

      {/* ─── Popular Articles ─── */}
      <section className="max-w-[960px] mx-auto px-6 py-16">
        <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Popular articles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularArticles.map((article) => (
            <motion.a
              key={article.title}
              href="#/support"
              className="block p-5 rounded-xl border border-[#E5E7EB] no-underline transition-all"
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
              style={{ background: '#FAFBFC' }}
            >
              <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: PURPLE, fontWeight: 700 }}>
                {article.category}
              </div>
              <div style={{ fontSize: 15, fontWeight: 650, color: NAVY, lineHeight: 1.4, marginBottom: 8 }}>
                {article.title}
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>{article.time}</div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ─── Browse by Topic ─── */}
      <section style={{ background: '#F8F9FB' }} className="py-16">
        <div className="max-w-[960px] mx-auto px-6">
          <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 32, letterSpacing: '-0.02em' }}>
            Browse by topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
            {topics.map((topic) => (
              <div key={topic.title}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
                  {topic.title}
                </h3>
                <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {topic.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#/support"
                        className="text-[14px] no-underline transition-colors hover:underline"
                        style={{ color: '#6B7280' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = PURPLE)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <FAQ />

      {/* ─── Still Need Help CTA ─── */}
      <section className="max-w-[960px] mx-auto px-6 pb-20">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: NAVY }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(73,69,255,0.15)' }}
          >
            <MessageCircle size={24} color={PURPLE} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Still need help?
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Our support team is available 24/7 to help you with anything
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] no-underline transition-colors"
              style={{ background: PURPLE, color: '#fff', fontWeight: 700 }}
            >
              <MessageCircle size={16} /> Chat with us
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] no-underline transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}