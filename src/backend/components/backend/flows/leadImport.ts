/**
 * ────────────────────────────────────────────────────────────
 * Lead import — parsing, auto-mapping, and row transforms
 * ────────────────────────────────────────────────────────────
 * Pure logic for the spreadsheet lead importer (no React). Parses
 * .xlsx/.csv exports (Meta lead ads being the primary source),
 * auto-maps spreadsheet columns to CRM lead fields, and transforms
 * rows into pipeline_leads upsert payloads with per-row validation.
 */

import * as XLSX from 'xlsx';
import { toDbLead, type Lead, type TimelineItem } from '../crmStore';

// ── Target fields ──

export type LeadImportField =
  | 'externalId'
  | 'createdAt'
  | 'businessName'
  | 'contactName'
  | 'contactEmail'
  | 'contactPhone'
  | 'amountRequested'
  | 'industry'
  | 'city'
  | 'timeInBusiness'
  | 'campaign'
  | 'adName'
  | 'formName'
  | 'platform'
  | 'notes'
  | 'callResult'
  | 'metaLeadStatus'
  | 'skip';

export const FIELD_LABELS: Record<LeadImportField, string> = {
  externalId: 'Lead ID (dedupe key)',
  createdAt: 'Created date',
  businessName: 'Business name',
  contactName: 'Contact name',
  contactEmail: 'Email',
  contactPhone: 'Phone',
  amountRequested: 'Amount requested',
  industry: 'Industry / business type',
  city: 'City (→ notes)',
  timeInBusiness: 'Time in business (→ notes)',
  campaign: 'Campaign (→ source detail)',
  adName: 'Ad name (→ source detail)',
  formName: 'Form name (→ source detail)',
  platform: 'Platform (→ source detail)',
  notes: 'Notes',
  callResult: 'Call result (→ status + notes)',
  metaLeadStatus: 'Meta lead status (ignored)',
  skip: 'Skip column',
};

/** Fields that may be held by at most one column. */
export const IDENTITY_FIELDS: LeadImportField[] = [
  'externalId',
  'createdAt',
  'businessName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'amountRequested',
  'industry',
];

export interface ColumnMapping {
  /** Column index — headers can repeat, so index is the key. */
  index: number;
  /** Raw header text (trimmed for display). */
  header: string;
  field: LeadImportField;
  confidence: 'exact' | 'fuzzy' | 'none';
}

// ── Header normalization + auto-mapping ──

export function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents: cuánto → cuanto
    .replace(/[^a-z0-9]/g, ''); // strip ¿ ? _ spaces punctuation
}

const ALIASES: Record<string, LeadImportField> = {
  // ids + dates
  id: 'externalId',
  leadid: 'externalId',
  createdtime: 'createdAt',
  createddate: 'createdAt',
  created: 'createdAt',
  date: 'createdAt',
  // contact
  fullname: 'contactName',
  name: 'contactName',
  contactname: 'contactName',
  contact: 'contactName',
  email: 'contactEmail',
  emailaddress: 'contactEmail',
  correo: 'contactEmail',
  phonenumber: 'contactPhone',
  phone: 'contactPhone',
  mobile: 'contactPhone',
  telefono: 'contactPhone',
  // business
  nombredetunegocio: 'businessName',
  businessname: 'businessName',
  business: 'businessName',
  company: 'businessName',
  companyname: 'businessName',
  dba: 'businessName',
  quetipodenegociotienes: 'industry',
  industry: 'industry',
  businesstype: 'industry',
  typeofbusiness: 'industry',
  whattypeofbusinessdoyouhave: 'industry',
  // funding questions
  cuantodineronecesitas: 'amountRequested',
  amountrequested: 'amountRequested',
  howmuchmoneydoyouneed: 'amountRequested',
  fundingamount: 'amountRequested',
  loanamount: 'amountRequested',
  cuantotiempollevascontunegocio: 'timeInBusiness',
  timeinbusiness: 'timeInBusiness',
  howlonghaveyoubeeninbusiness: 'timeInBusiness',
  // location
  city: 'city',
  ciudad: 'city',
  // campaign metadata
  campaignname: 'campaign',
  adname: 'adName',
  formname: 'formName',
  platform: 'platform',
  // working columns
  notes: 'notes',
  note: 'notes',
  comments: 'notes',
  callresult: 'callResult',
  leadstatus: 'metaLeadStatus',
  // Meta plumbing — auto-skip
  adid: 'skip',
  adsetid: 'skip',
  adsetname: 'skip',
  campaignid: 'skip',
  formid: 'skip',
  isorganic: 'skip',
  inboxurl: 'skip',
};

/** Ordered fuzzy fallback rules, applied to normalized headers. */
const FUZZY: Array<[RegExp, LeadImportField]> = [
  [/email|correo/, 'contactEmail'],
  [/phone|telefono|celular|movil/, 'contactPhone'],
  [/(negocio|business|company|empresa).*(name|nombre)|(name|nombre).*(negocio|business|company|empresa)/, 'businessName'],
  [/dinero|amount|money|funding|capital|necesita/, 'amountRequested'],
  [/tipode|industry|industria|typeof/, 'industry'],
  [/tiempo|howlong|yearsin|timein/, 'timeInBusiness'],
  [/city|ciudad/, 'city'],
  [/campaign/, 'campaign'],
  [/status/, 'metaLeadStatus'],
  [/result|resultado/, 'callResult'],
  [/note|nota|comment/, 'notes'],
  [/name|nombre/, 'contactName'], // last: generic name → contact
];

export function autoMapHeaders(headers: string[]): ColumnMapping[] {
  const taken = new Set<LeadImportField>();
  return headers.map((raw, index) => {
    const header = raw.trim() || `Column ${index + 1}`;
    const norm = normalizeHeader(raw);
    let field: LeadImportField = 'skip';
    let confidence: ColumnMapping['confidence'] = 'none';
    if (norm && ALIASES[norm] !== undefined) {
      field = ALIASES[norm];
      confidence = 'exact';
    } else if (norm) {
      const hit = FUZZY.find(([re]) => re.test(norm));
      if (hit) {
        field = hit[1];
        confidence = 'fuzzy';
      }
    }
    // Identity fields can only be held once — demote later duplicates.
    if (IDENTITY_FIELDS.includes(field)) {
      if (taken.has(field)) {
        field = 'skip';
        confidence = 'none';
      } else {
        taken.add(field);
      }
    }
    return { index, header, field, confidence };
  });
}

// ── Spreadsheet parsing ──

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

export const MAX_IMPORT_ROWS = 5000;

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const isCsv = /\.csv$/i.test(file.name);
  const wb = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = sheetName ? wb.Sheets[sheetName] : undefined;
  if (!ws) throw new Error('No sheets found in file');
  const grid = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '', raw: false });
  const headers = (grid[0] ?? []).map(c => String(c ?? ''));
  const rows = grid
    .slice(1)
    .map(r => headers.map((_, i) => String(r[i] ?? '').trim()))
    .filter(r => r.some(c => c !== ''));
  if (headers.every(h => h.trim() === '')) throw new Error('File has no header row');
  if (rows.length === 0) throw new Error('File has no data rows');
  return { headers, rows };
}

// ── Row transform ──

export interface ImportRowResult {
  /** 1-based spreadsheet row including header (first data row = 2). */
  rowNumber: number;
  values: Partial<Record<LeadImportField, string>>;
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  warning?: string;
  /** Ready-to-upsert pipeline_leads row (null unless status === 'ok'). */
  dbRow: Record<string, any> | null;
}

const PLATFORM_NAMES: Record<string, string> = {
  ig: 'Instagram',
  fb: 'Facebook',
  msgr: 'Messenger',
  an: 'Audience Network',
};

function isTestLead(values: Partial<Record<LeadImportField, string>>): boolean {
  return Object.values(values).some(
    v => typeof v === 'string' && (/<test lead/i.test(v) || /dummy data/i.test(v) || v.trim().toLowerCase() === 'test@meta.com'),
  );
}

/** Simple djb2 hash → short stable id for rows without a lead-id column. */
function hashKey(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function transformRows(
  rows: string[][],
  mappings: ColumnMapping[],
): ImportRowResult[] {
  const seenIds = new Set<string>();
  const emailRows = new Map<string, number>();
  const results: ImportRowResult[] = [];

  rows.forEach((row, i) => {
    const rowNumber = i + 2;

    // Collect mapped values; note-ish fields may be multi-mapped → join.
    const values: Partial<Record<LeadImportField, string>> = {};
    for (const m of mappings) {
      if (m.field === 'skip') continue;
      const cell = (row[m.index] ?? '').trim();
      if (!cell) continue;
      values[m.field] = values[m.field] ? `${values[m.field]} | ${cell}` : cell;
    }

    // 1. Meta test leads
    if (isTestLead(values)) {
      results.push({ rowNumber, values, status: 'skipped', reason: 'Meta test lead', dbRow: null });
      return;
    }

    // 2. Clean
    const phone = (values.contactPhone ?? '').replace(/^p:/i, '').trim();
    const email = (values.contactEmail ?? '').trim();
    const contactName = (values.contactName ?? '').trim();

    // 3. Validate
    if (!contactName && !email && !phone) {
      results.push({ rowNumber, values, status: 'error', reason: 'No name, email, or phone', dbRow: null });
      return;
    }

    // 5. Date (before dedupe key — the fallback key uses it)
    const parsedDate = values.createdAt ? new Date(values.createdAt) : new Date();
    const createdDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const createdAtIso = createdDate.toISOString();

    // 4. Dedupe keys
    const rawId = (values.externalId ?? '').trim();
    let externalId: string;
    let id: string;
    if (rawId) {
      externalId = `meta:${rawId}`;
      id = `meta-${rawId.replace(/^l:/, '')}`;
    } else {
      const key = `${[email, phone, contactName].find(Boolean)}|${createdAtIso}`;
      externalId = `meta:${key}`;
      id = `meta-${hashKey(key)}`;
    }
    if (seenIds.has(externalId)) {
      results.push({ rowNumber, values, status: 'skipped', reason: 'Duplicate lead ID in file', dbRow: null });
      return;
    }
    seenIds.add(externalId);

    let warning: string | undefined;
    if (email) {
      const emailKey = email.toLowerCase();
      const prior = emailRows.get(emailKey);
      if (prior !== undefined) warning = `Email also appears on row ${prior}`;
      else emailRows.set(emailKey, rowNumber);
    }

    // 6. Status from call result
    const callResult = (values.callResult ?? '').trim();
    const status: Lead['status'] = /not\s*qualif|no\s*qualif|descalific/i.test(callResult) ? 'Lost' : 'New';

    // 7. Notes composition
    const platform = values.platform ? (PLATFORM_NAMES[values.platform.toLowerCase()] ?? values.platform) : '';
    const sourceDetail = [
      values.formName && `form: ${values.formName}`,
      values.campaign && `campaign: ${values.campaign}`,
      values.adName && `ad: ${values.adName}`,
      platform && `platform: ${platform}`,
    ]
      .filter(Boolean)
      .join(' · ');
    const bioLine = [values.city && `City: ${values.city}`, values.timeInBusiness && `Time in business: ${values.timeInBusiness}`]
      .filter(Boolean)
      .join(' · ');
    const notes = [
      `Imported from Meta lead ads${sourceDetail ? ` — ${sourceDetail}` : ''}`,
      bioLine,
      callResult && `Call result: ${callResult}`,
      values.notes && `Notes: ${values.notes}`,
    ]
      .filter(Boolean)
      .join('\n');

    // 8. Timeline
    const timeline: TimelineItem[] = [
      {
        title: 'Lead imported from Meta',
        description: sourceDetail || 'Spreadsheet import',
        user: 'Import',
        timestamp: formatDate(createdDate),
      },
    ];

    // 9-10. Build the lead + db row
    const lead: Lead = {
      id,
      businessName: values.businessName || contactName || 'Meta lead',
      industry: values.industry || 'General',
      contactName,
      contactEmail: email,
      contactPhone: phone,
      type: 'MCA',
      source: 'Meta Ads',
      monthlySales: '',
      amountRequested: values.amountRequested || '',
      score: 50,
      status,
      priority: 'Medium',
      lastActivity: formatDate(createdDate),
      assignedAgent: 'Unassigned',
      stage: 'New',
      timeline,
      notes,
      extraNotes: [],
      tasks: [],
    };
    const dbRow = { ...toDbLead(lead), external_id: externalId, created_at: createdAtIso };

    results.push({ rowNumber, values, status: 'ok', warning, dbRow });
  });

  return results;
}

/** True when the mappings can produce a dedupe key (id, or any contact field). */
export function hasDedupeCapableMapping(mappings: ColumnMapping[]): boolean {
  return mappings.some(m =>
    ['externalId', 'contactEmail', 'contactPhone', 'contactName'].includes(m.field),
  );
}
