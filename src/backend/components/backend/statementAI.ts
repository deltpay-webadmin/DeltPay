// ── AI statement extraction client ──
// Sends the uploaded statement (PDF/image) to the `analyze-statement`
// Supabase Edge Function, where Claude reads the document and returns
// structured extraction data. Throws when Supabase or the function isn't
// configured — callers fall back to demo data.

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { StatementInput } from './interchangeEngine';

export type ExtractionConfidence = 'high' | 'medium' | 'low';

export interface AIExtraction {
  merchantName: string;
  statement: StatementInput;
  confidence: ExtractionConfidence;
  notes: string;
  model?: string;
}

interface WireExtraction {
  merchantName: string;
  currentProcessor: string;
  statementPeriod: string;
  totalVolume: number;
  totalTransactions: number;
  avgTicket: number;
  effectiveRatePct: number;
  currentMonthlyCost: number;
  chargebackCount: number;
  fees: { label: string; amount: number }[];
  confidence: ExtractionConfidence;
  notes: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1)); // strip data: prefix
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function analyzeStatementWithAI(file: File): Promise<AIExtraction> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('AI extraction unavailable: Supabase is not configured');
  }

  const dataBase64 = await fileToBase64(file);
  const { data, error } = await supabase.functions.invoke('analyze-statement', {
    body: {
      filename: file.name,
      mediaType: file.type || 'application/pdf',
      dataBase64,
    },
  });

  if (error) throw new Error(`AI extraction failed: ${error.message ?? 'edge function error'}`);
  if (data?.error) throw new Error(`AI extraction failed: ${data.message ?? data.error}`);
  const x = data?.extraction as WireExtraction | undefined;
  if (!x || typeof x.totalVolume !== 'number' || !Array.isArray(x.fees)) {
    throw new Error('AI extraction failed: malformed response');
  }

  return {
    merchantName: (x.merchantName || '').trim(),
    statement: {
      currentProcessor: x.currentProcessor || 'Unknown processor',
      statementPeriod: x.statementPeriod || 'Unknown period',
      totalVolume: x.totalVolume,
      totalTransactions: x.totalTransactions,
      avgTicket: x.avgTicket,
      effectiveRate: Number(x.effectiveRatePct.toFixed(2)),
      fees: x.fees,
      chargebackCount: x.chargebackCount,
      currentMonthlyCost: x.currentMonthlyCost,
    },
    confidence: x.confidence ?? 'medium',
    notes: x.notes ?? '',
    model: data?.model,
  };
}
