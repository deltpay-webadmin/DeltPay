/**
 * NewApplicationFlow — 3-step Stripe-style onboarding for underwriting applications.
 */

import React, { useState } from 'react';
import {
  OnboardingFlow,
  TextField,
  SelectField,
  TextArea,
  RadioCards,
  ReviewCard,
  ReviewRow,
} from './OnboardingFlow';
import {
  underwritingActions,
  useLeads,
  type ProductType,
  type UWApplication,
} from '../crmStore';
import { dealSubmissionActions } from '../dealSubmissionsStore';

const INDUSTRIES = [
  'Restaurant',
  'Retail',
  'Automotive',
  'Health & Wellness',
  'Technology',
  'Construction',
  'Beauty & Salon',
  'Home Services',
  'Professional Services',
  'Other',
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const SOURCES = [
  'Direct \u2014 Website',
  'Referral Partner',
  'ISO',
  'Broker Network',
  'Inbound Call',
  'Other',
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export interface NewApplicationFlowProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (app: UWApplication) => void;
}

export function NewApplicationFlow({ open, onClose, onCreated }: NewApplicationFlowProps) {
  const leads = useLeads();
  const [leadId, setLeadId] = useState('');
  const [form, setForm] = useState({
    businessName: '',
    industry: 'Restaurant',
    state: 'NY',
    productType: 'MCA' as ProductType,
    source: 'Direct \u2014 Website',
    requestedAmountStr: '50000',
    monthlyRevenueStr: '30000',
    creditScoreStr: '650',
    monthsInBusinessStr: '24',
    notes: '',
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const requestedAmount = Number(form.requestedAmountStr) || 0;
  const monthlyRevenue = Number(form.monthlyRevenueStr) || 0;
  const creditScore = Number(form.creditScoreStr) || 0;
  const monthsInBusiness = Number(form.monthsInBusinessStr) || 0;

  return (
    <OnboardingFlow
      open={open}
      onClose={onClose}
      title="New application"
      subtitle="Submit a new underwriting application."
      submitLabel="Submit application"
      steps={[
        {
          title: 'Business',
          description: 'Tell us who\u2019s applying and for what product.',
          validate: () => (form.businessName.trim() ? true : 'Business name is required.'),
          render: () => (
            <div className="space-y-4">
              {/* Spine link: an unlinked file can't produce a decision memo,
                  open a Deal Room, or pass the funding gate. */}
              <div>
                <label className="text-[12px] font-medium text-gray-600 block mb-1">Pipeline lead (recommended)</label>
                <select
                  value={leadId}
                  onChange={e => {
                    const id = e.target.value;
                    setLeadId(id);
                    const l = leads.find(x => x.id === id);
                    if (l) {
                      setForm(f => ({
                        ...f,
                        businessName: f.businessName || l.businessName,
                        industry: INDUSTRIES.includes(l.industry) ? l.industry : f.industry,
                      }));
                    }
                  }}
                  className="w-full border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] bg-white"
                >
                  <option value="">No lead — standalone file (no Deal Room, no decision memo)</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.businessName}{l.contactName ? ` — ${l.contactName}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <TextField
                    label="Business name"
                    value={form.businessName}
                    onChange={v => update('businessName', v)}
                    placeholder="Acme Bakery LLC"
                    autoFocus
                  />
                </div>
                <SelectField
                  label="Industry"
                  value={form.industry}
                  onChange={v => update('industry', v)}
                  options={INDUSTRIES}
                />
                <SelectField
                  label="State"
                  value={form.state}
                  onChange={v => update('state', v)}
                  options={STATES}
                />
                <SelectField
                  label="Source"
                  value={form.source}
                  onChange={v => update('source', v)}
                  options={SOURCES}
                />
              </div>

              <RadioCards<ProductType>
                label="Product type"
                value={form.productType}
                onChange={v => update('productType', v)}
                options={[
                  { value: 'MCA', label: 'MCA', description: 'Revenue-based, daily holdback.' },
                  { value: 'Term Loan', label: 'Term Loan', description: 'Fixed monthly payments.' },
                  { value: 'Line of Credit', label: 'Line of Credit', description: 'Revolving facility.' },
                  { value: 'Revenue Based', label: 'Revenue Based', description: 'Revenue-share financing.' },
                ]}
              />
            </div>
          ),
        },
        {
          title: 'Financials',
          description: 'The numbers underwriting needs to move forward.',
          validate: () => {
            if (requestedAmount <= 0) return 'Requested amount must be greater than $0.';
            if (monthlyRevenue <= 0) return 'Monthly revenue must be greater than $0.';
            if (creditScore < 300 || creditScore > 900) return 'Credit score must be 300\u2013900.';
            return true;
          },
          render: () => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label="Requested amount"
                value={form.requestedAmountStr}
                onChange={v => update('requestedAmountStr', v.replace(/[^0-9.]/g, ''))}
                prefix="$"
                inputMode="decimal"
                autoFocus
              />
              <TextField
                label="Monthly revenue"
                value={form.monthlyRevenueStr}
                onChange={v => update('monthlyRevenueStr', v.replace(/[^0-9.]/g, ''))}
                prefix="$"
                inputMode="decimal"
              />
              <TextField
                label="Credit score"
                value={form.creditScoreStr}
                onChange={v => update('creditScoreStr', v.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
              />
              <TextField
                label="Months in business"
                value={form.monthsInBusinessStr}
                onChange={v => update('monthsInBusinessStr', v.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
              />
            </div>
          ),
        },
        {
          title: 'Review',
          description: 'Confirm everything, then submit.',
          render: () => (
            <div className="space-y-3">
              <ReviewCard title="Business">
                <ReviewRow label="Name" value={form.businessName} />
                <ReviewRow label="Industry" value={form.industry} />
                <ReviewRow label="State" value={form.state} />
                <ReviewRow label="Product" value={form.productType} />
                <ReviewRow label="Source" value={form.source} />
              </ReviewCard>
              <ReviewCard title="Financials">
                <ReviewRow label="Requested" value={fmtMoney(requestedAmount)} />
                <ReviewRow label="Monthly revenue" value={fmtMoney(monthlyRevenue)} />
                <ReviewRow label="Credit score" value={creditScore} />
                <ReviewRow label="Months in business" value={monthsInBusiness} />
              </ReviewCard>
              <TextArea
                label="Underwriting notes"
                value={form.notes}
                onChange={v => update('notes', v)}
                placeholder="Context, red flags, opportunities…"
                optional
              />
            </div>
          ),
        },
      ]}
      onSubmit={async () => {
        // Linked files ride the deal spine: create (or reuse) the lead's
        // submission so the memo, Deal Room, and funding gate all connect.
        const lead = leads.find(l => l.id === leadId);
        const submissionId = lead
          ? await dealSubmissionActions.createFromLead({
              id: lead.id,
              businessName: lead.businessName,
              contactName: lead.contactName,
              contactPhone: lead.contactPhone,
              contactEmail: lead.contactEmail,
              industry: lead.industry,
              monthlySales: lead.monthlySales,
              type: lead.type,
              products: lead.products,
              assignedAgent: lead.assignedAgent,
            })
          : null;
        const created = underwritingActions.create({
          businessName: form.businessName.trim(),
          industry: form.industry,
          state: form.state,
          productType: form.productType,
          source: form.source,
          requestedAmount,
          monthlyRevenue,
          creditScore,
          monthsInBusiness,
          notes: form.notes,
          leadId: lead?.id,
          submissionId: submissionId ?? undefined,
          contactName: lead?.contactName || undefined,
          contactEmail: lead?.contactEmail || undefined,
          contactPhone: lead?.contactPhone || undefined,
        });
        onCreated?.(created);
        return {
          title: `${created.applicationId} submitted`,
          description: `${created.businessName} is in the pipeline \u2014 connect Plaid to start scoring. Assigned to ${created.reviewer}.`,
          primaryCta: { label: 'View application', onClick: onClose },
          secondaryCta: { label: 'Done', onClick: onClose },
        };
      }}
    />
  );
}
