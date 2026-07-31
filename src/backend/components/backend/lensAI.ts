// ── Delt Lens AI client ──
// Powers the "Ask Lens" chat with a real model via the nebius-chat edge
// function. Lens answers portfolio questions against a live snapshot of the
// CRM store (leads, deals, merchants, underwriting, onboarding) built at
// ask time, so answers cite real data instead of canned copy.

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AIError, unwrapInvokeError } from './aiErrors';
import type { Lead, Deal, Merchant, UWApplication, OnboardingApp } from './crmStore';

export interface LensAnswer {
  content: string;
  table?: { headers: string[]; rows: string[][] };
  source?: string;
}

interface CrmSnapshotInput {
  leads: Lead[];
  deals: Deal[];
  merchants: Merchant[];
  underwriting: UWApplication[];
  onboarding: OnboardingApp[];
}

const LENS_SYSTEM_PROMPT = `You are Delt Lens, the portfolio-intelligence assistant inside Delt Pay's back-office CRM. Staff ask you questions about their pipeline, deals, merchants, underwriting, and onboarding.

You are given a JSON snapshot of the live CRM data. Answer ONLY from that snapshot:
- Cite real names and numbers from the snapshot; never invent merchants, agents, deals, or figures.
- If the snapshot can't answer the question, say what data is missing — do not guess.
- Be concise and analytical: lead with the answer, then the numbers behind it.
- Currency in US dollars; percentages to one decimal.

Respond with ONLY a JSON object:
{
  "content": "markdown answer (bold key figures with **)",
  "table": { "headers": [...], "rows": [[...], ...] } | null,
  "source": "one sentence on the data basis, e.g. 'Based on 12 pipeline leads and 8 active deals in the CRM as of today.'"
}
Include "table" only when a comparison across 2+ items genuinely helps.`;

/** Compact the CRM store into a prompt-sized JSON snapshot (~caps applied). */
export function buildCrmSnapshot(crm: CrmSnapshotInput): string {
  const snapshot = {
    asOf: new Date().toISOString().slice(0, 10),
    pipelineLeads: crm.leads.slice(0, 40).map(l => ({
      business: l.businessName,
      industry: l.industry,
      type: l.type,
      stage: l.stage,
      status: l.status,
      monthlySales: l.monthlySales,
      amountRequested: l.amountRequested,
      score: l.score,
      agent: l.assignedAgent,
      source: l.source,
    })),
    deals: crm.deals.slice(0, 40).map(d => ({
      borrower: d.borrower,
      type: d.type,
      status: d.status,
      loanAmount: d.loanAmount,
      repaymentAmount: d.repaymentAmount,
      collected: d.collected,
      outstanding: Number((d.repaymentAmount - d.collected).toFixed(2)),
    })),
    merchants: crm.merchants.slice(0, 40).map(m => ({
      name: m.name,
      industry: m.industry,
      status: m.status,
      monthlyVolume: m.monthlyVolume,
      mcaBalance: m.mcaBalance,
      healthScore: m.healthScore,
      agent: m.agent,
      plan: m.plan,
    })),
    underwriting: crm.underwriting.slice(0, 25).map(u => ({
      business: u.businessName,
      stage: u.stage,
      requested: u.requestedAmount,
      monthlyRevenue: u.monthlyRevenue,
      creditScore: u.creditScore,
      riskScore: u.riskScore,
      tier: u.tier,
    })),
    onboarding: crm.onboarding.slice(0, 25).map(o => ({
      merchant: o.merchantName,
      step: o.currentStep,
      slaStatus: o.slaStatus,
      agent: o.agent,
    })),
    totals: {
      leads: crm.leads.length,
      deals: crm.deals.length,
      merchants: crm.merchants.length,
      underwriting: crm.underwriting.length,
      onboarding: crm.onboarding.length,
    },
  };
  return JSON.stringify(snapshot);
}

export async function askLens(
  question: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  crm: CrmSnapshotInput,
): Promise<LensAnswer> {
  if (!isSupabaseConfigured || !supabase) {
    throw new AIError('supabase_unconfigured', 'Supabase is not configured');
  }

  const { data, error } = await supabase.functions.invoke('nebius-chat', {
    body: {
      system: `${LENS_SYSTEM_PROMPT}\n\nCRM snapshot:\n${buildCrmSnapshot(crm)}`,
      json: true,
      maxTokens: 2048,
      // Analytical Q&A over fixed data — keep it near-deterministic so the
      // same question doesn't produce different figures run to run.
      temperature: 0.1,
      messages: [
        // Keep a short conversational window so follow-ups have context.
        ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: question },
      ],
    },
  });

  if (error) throw await unwrapInvokeError(error);
  if (data?.error) throw new AIError(data.error, data.message ?? data.error);
  if (typeof data?.content !== 'string') throw new AIError('empty_response', 'Lens returned an empty response');

  let parsed: { content?: string; table?: LensAnswer['table'] | null; source?: string };
  try {
    parsed = JSON.parse(data.content);
  } catch {
    // Model ignored JSON mode — treat the raw text as the answer.
    return { content: data.content, source: 'Live Lens analysis of the CRM snapshot.' };
  }

  const table =
    parsed.table && Array.isArray(parsed.table.headers) && Array.isArray(parsed.table.rows)
      ? { headers: parsed.table.headers.map(String), rows: parsed.table.rows.map(r => (Array.isArray(r) ? r.map(String) : [String(r)])) }
      : undefined;

  return {
    content: parsed.content || data.content,
    table,
    source: parsed.source || 'Live Lens analysis of the CRM snapshot.',
  };
}
