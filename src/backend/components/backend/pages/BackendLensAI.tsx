import React, { useState } from 'react';
import { ArrowUp, Database, Sparkles } from 'lucide-react';

type Tab = 'dashboard' | 'ask';

export function BackendLensAI() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-500">Predictive intelligence for your portfolio</p>
          <div className="flex rounded-[10px] border border-gray-200 p-0.5">
            {(['dashboard', 'ask'] as const).map(item => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-[8px] transition-all ${
                  tab === item ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item === 'dashboard' ? 'Dashboard' : 'Ask Lens'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'dashboard' ? (
          <EmptyInsights />
        ) : (
          <div className="min-h-[420px] rounded-[12px] border border-gray-200 bg-white flex flex-col items-center justify-center px-6 text-center">
            <Sparkles className="w-9 h-9 text-gray-300 mb-3" />
            <h1 className="text-lg font-semibold text-gray-900">No Lens insights yet</h1>
            <p className="mt-1 max-w-md text-sm text-gray-400">Connect live portfolio data to enable Lens questions and generated insights.</p>
            <form
              className="mt-6 flex w-full max-w-xl gap-2"
              onSubmit={event => { event.preventDefault(); if (question.trim()) setSubmitted(true); }}
            >
              <input
                value={question}
                onChange={event => { setQuestion(event.target.value); setSubmitted(false); }}
                placeholder="Ask Lens about your live portfolio…"
                className="flex-1 rounded-[8px] border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button type="submit" className="rounded-[8px] bg-brand px-3 py-2 text-white" aria-label="Ask Lens">
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
            {submitted && <p className="mt-3 text-sm text-gray-400">Lens needs live portfolio data before it can answer.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyInsights() {
  return (
    <div className="min-h-[420px] rounded-[12px] border border-gray-200 bg-white flex flex-col items-center justify-center px-6 text-center">
      <Database className="w-9 h-9 text-gray-300 mb-3" />
      <h1 className="text-lg font-semibold text-gray-900">No Lens insights yet</h1>
      <p className="mt-1 max-w-md text-sm text-gray-400">Insights, forecasts, and portfolio alerts will appear here when live CRM data is available.</p>
    </div>
  );
}
