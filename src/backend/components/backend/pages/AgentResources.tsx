import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  CheckCircle,
  Circle,
  BookOpen,
  ExternalLink,
  Award,
  ChevronDown,
  FileText,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { OBJECTIONS } from './BackendCostCalculator';
import { BONUS_BANDS, MULTI_PRODUCT_KICKER, TIERS, FAST_START, fmtUsd } from '../agentComp';

const CHECKLIST_KEY = 'delt-agent-certification';

const CHECKLIST: { id: string; label: string; detail: string }[] = [
  { id: 'comp', label: 'Read the comp plan', detail: 'Know your bonus bands, Fast Start milestones, and the tier ladder cold.' },
  { id: 'pitch', label: 'Learn the cash discount pitch', detail: 'The 0% processing story: discount for cash, not a surcharge for cards.' },
  { id: 'objections', label: 'Review all five objection playbooks', detail: 'Below on this page — reframes, talk tracks, and the data behind them.' },
  { id: 'analyzer', label: 'Run a practice statement analysis', detail: 'Upload any processing statement in Analysis and walk through the output.' },
  { id: 'calculator', label: 'Run the cost calculator on a real scenario', detail: 'Practice quoting savings live like you would in front of a merchant.' },
  { id: 'products', label: 'Know the full product line', detail: 'Processing, KORONA POS, Delt Capital, websites, Lens AI — every door has an angle.' },
  { id: 'highrisk', label: 'Read the high-risk playbook', detail: 'CBD, vape, liquor, nutra: the merchants aggregators reject are your best deals.' },
  { id: 'first-deal', label: 'Submit your first deal', detail: 'The pipeline tracker shows your pending bonus the moment it goes in.' },
];

function loadChecked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function AgentResources() {
  const { navigate } = useAppNavigate();
  const [checked, setChecked] = useState<Set<string>>(loadChecked);
  const [openObjection, setOpenObjection] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...checked]));
    } catch {
      /* private mode */
    }
  }, [checked]);

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pct = Math.round((checked.size / CHECKLIST.length) * 100);
  const certified = pct === 100;

  const objectionEntries = useMemo(() => Object.entries(OBJECTIONS), []);

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="text-sm text-gray-500">
        Everything you need to sell: training, playbooks, tools, and the program terms.
      </p>

      {/* Certification checklist */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Delt Certification
          </h2>
          {certified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-full">
              <Award className="w-3.5 h-3.5" />
              Delt Certified
            </span>
          ) : (
            <span className="text-xs text-gray-400">{checked.size}/{CHECKLIST.length} complete</span>
          )}
        </div>
        <div className="px-5 pt-4">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="p-3">
          {CHECKLIST.map(item => {
            const done = checked.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-[8px] text-left hover:bg-gray-50 transition-colors"
              >
                {done
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  : <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />}
                <span>
                  <span className={`block text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{item.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/analysis')}
          className="bg-white rounded-[8px] border border-gray-200 p-5 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">AI Statement Analyzer</p>
          </div>
          <p className="text-xs text-gray-500">Upload a prospect's Stripe/Square statement — get the savings comparison and quote in minutes. Your fastest close.</p>
        </button>
        <button
          onClick={() => navigate('/analysis')}
          className="bg-white rounded-[8px] border border-gray-200 p-5 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">Cost Calculator</p>
          </div>
          <p className="text-xs text-gray-500">Quote a merchant's savings live, with the objection scripts built in alongside.</p>
        </button>
      </div>

      {/* Objection playbooks */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Objection Playbooks — Cash Discount
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {objectionEntries.map(([key, obj]) => {
            const open = openObjection === key;
            return (
              <div key={key}>
                <button
                  onClick={() => setOpenObjection(open ? null : key)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{obj.title}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-5 pb-5 space-y-3">
                    <p className="text-xs font-semibold text-indigo-600">{obj.reframe}</p>
                    <div className="rounded-[8px] bg-gray-50 border border-gray-200 px-4 py-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Talk track</p>
                      <p className="text-sm text-gray-700">{obj.talk}</p>
                    </div>
                    <p className="text-xs text-gray-500"><span className="font-semibold">Back it up:</span> {obj.data}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Collateral */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Leave-Behinds & Merchant Pages
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Pricing & plans', href: '#/pricing', desc: 'Delt Zero, Growth, and add-ons — the page to walk a merchant through.' },
            { label: 'High-risk processing', href: '#/solutions/high-risk-processing', desc: 'CBD, vape, liquor, nutra — durable accounts, 48–72hr approvals.' },
            { label: 'Hardware & POS', href: '#/hardware', desc: 'Terminals, KORONA POS, and the free-reader entry plan.' },
            { label: 'Delt Capital', href: '#/capital', desc: '$1K–$300K, fixed fee, repaid from daily sales — the retention hook.' },
          ].map(c => (
            <a
              key={c.href}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-[8px] border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <span>
                <span className="block text-sm font-medium text-gray-900 group-hover:text-indigo-700">{c.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{c.desc}</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </div>

      {/* Program at a glance */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Program at a Glance</h2>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Activation bonuses</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {BONUS_BANDS.map(b => (
                  <tr key={b.label}>
                    <td className="py-1.5 text-gray-600">{b.label}</td>
                    <td className="py-1.5 text-right font-semibold text-gray-900">{fmtUsd(b.bonus)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1.5 text-gray-600">POS / Capital attached</td>
                  <td className="py-1.5 text-right font-semibold text-indigo-600">+{fmtUsd(MULTI_PRODUCT_KICKER)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Residual tier ladder</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {TIERS.map(t => (
                  <tr key={t.tier}>
                    <td className="py-1.5 text-gray-600">Tier {t.tier}{t.minAccounts > 0 ? ` — ${t.minAccounts}+ accounts` : ' — day one'}</td>
                    <td className="py-1.5 text-right font-semibold text-gray-900">{Math.round(t.split * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 mt-2">Lifetime residuals. Never clawed back.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fast Start (first 90 days)</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-1.5 text-gray-600">{FAST_START.first30.activations} activations in 30 days</td>
                  <td className="py-1.5 text-right font-semibold text-gray-900">+{fmtUsd(FAST_START.first30.bonus)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-600">{FAST_START.first90.activations} activations in 90 days</td>
                  <td className="py-1.5 text-right font-semibold text-gray-900">+{fmtUsd(FAST_START.first90.bonus)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 mt-2">Full terms are in your agent agreement and comp plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
