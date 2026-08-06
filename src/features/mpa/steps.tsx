// The seven MPA wizard steps. Each step is a controlled component over the
// shared ApplicationData + a client-side SecureData draft. Sensitive inputs
// are write-only: previously saved values surface as masked placeholders
// (from `masks`) and an empty input means "keep what's saved".

import { useRef, useState } from 'react';
import type { ApplicationData, Masks, Month, SecureData } from './types';
import { MONTHS, cardMixTotal, isAbaRouting, isEin, isSsn, needsCnpSection, emptyOwner } from './types';
import type { MpaBackend } from './api';
import {
  CheckLine, Field, PillGroup, SectionCard, SelectInput, TextAreaInput, TextInput, TwoCol,
} from './fields';
import {
  clampPct, digitsOnly, fileToBase64, formatAccountInput, formatEinInput,
  formatPhoneInput, formatRoutingInput, formatSsnInput,
} from './format';

export interface StepProps {
  data: ApplicationData;
  setData: (updater: (d: ApplicationData) => ApplicationData) => void;
  secure: SecureData;
  setSecure: (updater: (s: SecureData) => SecureData) => void;
  masks: Partial<Masks> | null;
  t: (k: string) => string;
  backend: MpaBackend;
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR',
];

function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SelectInput value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" />
      {US_STATES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </SelectInput>
  );
}

// ── Step 1: business identity ──────────────────────────────────────────

export function StepBusiness({ data, setData, t }: StepProps) {
  const b = data.business;
  const up = (patch: Partial<ApplicationData['business']>) =>
    setData((d) => ({ ...d, business: { ...d.business, ...patch } }));
  return (
    <div className="space-y-3">
      <TwoCol>
        <Field label={t('Legal business name')} required>
          <TextInput value={b.legalName} onChange={(e) => up({ legalName: e.target.value })} />
        </Field>
        <Field label={t('DBA (doing business as)')}>
          <TextInput value={b.dba} onChange={(e) => up({ dba: e.target.value })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('EIN (Federal Tax ID)')} required hint="XX-XXXXXXX">
          <TextInput
            inputMode="numeric"
            value={b.ein.length === 9 ? formatEinInput(b.ein) : b.ein}
            onChange={(e) => up({ ein: digitsOnly(e.target.value).slice(0, 9) })}
            placeholder="12-3456789"
          />
        </Field>
        <Field label={t('Date business started')} required>
          <TextInput type="month" value={b.establishedDate} onChange={(e) => up({ establishedDate: e.target.value })} />
        </Field>
      </TwoCol>
      <Field label={t('Ownership type')} required>
        <PillGroup
          value={b.ownershipType}
          onChange={(v) => up({ ownershipType: v })}
          options={[
            { value: 'sole_prop', label: t('Sole Proprietorship') },
            { value: 'llc', label: 'LLC' },
            { value: 'corporation', label: t('Corporation') },
            { value: 'partnership', label: t('Partnership') },
            { value: 'non_profit', label: t('Non-Profit') },
            { value: 'government', label: t('Government') },
          ]}
        />
      </Field>
      <TwoCol>
        <Field label={t('State of incorporation')}>
          <StateSelect value={b.stateIncorporated} onChange={(v) => up({ stateIncorporated: v })} />
        </Field>
        <Field label={t('Number of locations')}>
          <TextInput inputMode="numeric" value={b.numberOfLocations} onChange={(e) => up({ numberOfLocations: digitsOnly(e.target.value).slice(0, 3) })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Contact first name')} required>
          <TextInput value={b.contactFirstName} onChange={(e) => up({ contactFirstName: e.target.value })} />
        </Field>
        <Field label={t('Contact last name')} required>
          <TextInput value={b.contactLastName} onChange={(e) => up({ contactLastName: e.target.value })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Business phone')} required>
          <TextInput inputMode="tel" value={formatPhoneInput(b.phone)} onChange={(e) => up({ phone: digitsOnly(e.target.value).slice(0, 10) })} />
        </Field>
        <Field label={t('Contact email')} required>
          <TextInput type="email" value={b.email} onChange={(e) => up({ email: e.target.value })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Website')}>
          <TextInput value={b.website} onChange={(e) => up({ website: e.target.value })} placeholder="https://" />
        </Field>
        <Field label={t('Customer service phone')}>
          <TextInput inputMode="tel" value={formatPhoneInput(b.customerServicePhone)} onChange={(e) => up({ customerServicePhone: digitsOnly(e.target.value).slice(0, 10) })} />
        </Field>
      </TwoCol>
      <Field label={t('Customer service email')}>
        <TextInput type="email" value={b.customerServiceEmail} onChange={(e) => up({ customerServiceEmail: e.target.value })} />
      </Field>
    </div>
  );
}

export function validateBusiness(data: ApplicationData): string | null {
  const b = data.business;
  if (!b.legalName.trim()) return 'Legal business name is required';
  if (!isEin(b.ein)) return 'EIN must be 9 digits';
  if (!b.ownershipType) return 'Select the ownership type';
  if (!b.contactFirstName.trim() || !b.contactLastName.trim()) return 'Contact name is required';
  if (digitsOnly(b.phone).length !== 10) return 'Business phone must be 10 digits';
  if (!/.+@.+\..+/.test(b.email)) return 'A valid contact email is required';
  return null;
}

// ── Step 2: addresses ──────────────────────────────────────────────────

export function StepAddresses({ data, setData, t }: StepProps) {
  const loc = data.locationAddress;
  const bill = data.billingAddress;
  return (
    <div className="space-y-3">
      <SectionCard title={t('Business location (no PO Box)')}>
        <Field label={t('Street address')} required>
          <TextInput value={loc.line1} onChange={(e) => setData((d) => ({ ...d, locationAddress: { ...d.locationAddress, line1: e.target.value } }))} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('City')} required>
            <TextInput value={loc.city} onChange={(e) => setData((d) => ({ ...d, locationAddress: { ...d.locationAddress, city: e.target.value } }))} />
          </Field>
          <Field label={t('State')} required>
            <StateSelect value={loc.state} onChange={(v) => setData((d) => ({ ...d, locationAddress: { ...d.locationAddress, state: v } }))} />
          </Field>
          <Field label={t('ZIP')} required>
            <TextInput inputMode="numeric" value={loc.zip} onChange={(e) => setData((d) => ({ ...d, locationAddress: { ...d.locationAddress, zip: digitsOnly(e.target.value).slice(0, 5) } }))} />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title={t('Billing / mailing address')}>
        <CheckLine
          checked={bill.sameAsLocation}
          onChange={(v) => setData((d) => ({ ...d, billingAddress: { ...d.billingAddress, sameAsLocation: v } }))}
          label={t('Same as location')}
        />
        {!bill.sameAsLocation && (
          <>
            <Field label={t('Street address')} required>
              <TextInput value={bill.line1} onChange={(e) => setData((d) => ({ ...d, billingAddress: { ...d.billingAddress, line1: e.target.value } }))} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label={t('City')} required>
                <TextInput value={bill.city} onChange={(e) => setData((d) => ({ ...d, billingAddress: { ...d.billingAddress, city: e.target.value } }))} />
              </Field>
              <Field label={t('State')} required>
                <StateSelect value={bill.state} onChange={(v) => setData((d) => ({ ...d, billingAddress: { ...d.billingAddress, state: v } }))} />
              </Field>
              <Field label={t('ZIP')} required>
                <TextInput inputMode="numeric" value={bill.zip} onChange={(e) => setData((d) => ({ ...d, billingAddress: { ...d.billingAddress, zip: digitsOnly(e.target.value).slice(0, 5) } }))} />
              </Field>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

export function validateAddresses(data: ApplicationData): string | null {
  const loc = data.locationAddress;
  if (!loc.line1.trim() || !loc.city.trim() || !loc.state || loc.zip.length < 5) {
    return 'Complete the business location address';
  }
  if (/p\.?\s*o\.?\s*box/i.test(loc.line1)) return 'The location address cannot be a PO Box';
  const bill = data.billingAddress;
  if (!bill.sameAsLocation && (!bill.line1.trim() || !bill.city.trim() || !bill.state || bill.zip.length < 5)) {
    return 'Complete the billing address (or mark it same as location)';
  }
  return null;
}

// ── Step 3: business profile ───────────────────────────────────────────

export function StepProfile({ data, setData, t }: StepProps) {
  const p = data.profile;
  const up = (patch: Partial<ApplicationData['profile']>) =>
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  const mixTotal = cardMixTotal(p);
  const pctField = (label: string, key: 'pctCardPresent' | 'pctKeyedCardPresent' | 'pctMoto' | 'pctInternet') => (
    <Field label={label}>
      <TextInput
        inputMode="numeric"
        value={String(p[key])}
        onChange={(e) => up({ [key]: clampPct(Number(digitsOnly(e.target.value))) } as any)}
      />
    </Field>
  );
  return (
    <div className="space-y-3">
      <Field label={t('What do you sell?')} required>
        <TextAreaInput value={p.productsDescription} placeholder={t('Describe your products or services')} onChange={(e) => up({ productsDescription: e.target.value })} />
      </Field>
      <TwoCol>
        <Field label={t('Monthly card volume ($)')} required>
          <TextInput inputMode="decimal" value={p.monthlyVolume} onChange={(e) => up({ monthlyVolume: e.target.value.replace(/[^0-9.]/g, '') })} />
        </Field>
        <Field label={t('Monthly Amex volume ($)')}>
          <TextInput inputMode="decimal" value={p.monthlyAmexVolume} onChange={(e) => up({ monthlyAmexVolume: e.target.value.replace(/[^0-9.]/g, '') })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Average ticket ($)')} required>
          <TextInput inputMode="decimal" value={p.averageTicket} onChange={(e) => up({ averageTicket: e.target.value.replace(/[^0-9.]/g, '') })} />
        </Field>
        <Field label={t('Highest ticket ($)')} required>
          <TextInput inputMode="decimal" value={p.highestTicket} onChange={(e) => up({ highestTicket: e.target.value.replace(/[^0-9.]/g, '') })} />
        </Field>
      </TwoCol>
      <SectionCard title={t('How do you take cards? (must total 100%)')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pctField(t('Swiped / tapped in person'), 'pctCardPresent')}
          {pctField(t('Keyed, card present'), 'pctKeyedCardPresent')}
          {pctField(t('Mail / phone order'), 'pctMoto')}
          {pctField(t('Online / e-commerce'), 'pctInternet')}
        </div>
        <div className={`text-xs font-medium ${mixTotal === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
          {t('Percentages must total 100%. Current total:')} {mixTotal}%
        </div>
      </SectionCard>
      <TwoCol>
        <Field label={t('B2B %')}>
          <TextInput inputMode="numeric" value={String(p.pctB2b)} onChange={(e) => up({ pctB2b: clampPct(Number(digitsOnly(e.target.value))) })} />
        </Field>
        <Field label={t('International cards %')}>
          <TextInput inputMode="numeric" value={String(p.pctInternational)} onChange={(e) => up({ pctInternational: clampPct(Number(digitsOnly(e.target.value))) })} />
        </Field>
      </TwoCol>
      <Field label={t('Have you accepted cards before?')}>
        <PillGroup
          value={p.acceptedCardsBefore ? 'yes' : 'no'}
          onChange={(v) => up({ acceptedCardsBefore: v === 'yes' })}
          options={[{ value: 'yes', label: t('Yes') }, { value: 'no', label: t('No') }]}
        />
      </Field>
      <Field label={t('Refund policy')} required>
        <PillGroup
          value={p.refundPolicy}
          onChange={(v) => up({ refundPolicy: v })}
          options={[
            { value: 'none', label: t('No refunds') },
            { value: '30_days', label: t('Refund within 30 days') },
            { value: '7_days', label: t('Refund within 7 days') },
            { value: 'exchange_only', label: t('Exchange only') },
            { value: 'other', label: t('Other') },
          ]}
        />
      </Field>
      {p.refundPolicy === 'other' && (
        <Field label={t('Describe your refund policy')} required>
          <TextInput value={p.refundPolicyOther} onChange={(e) => up({ refundPolicyOther: e.target.value })} />
        </Field>
      )}
      <Field label={t('Is the business seasonal?')}>
        <PillGroup
          value={p.seasonal ? 'yes' : 'no'}
          onChange={(v) => up({ seasonal: v === 'yes' })}
          options={[{ value: 'yes', label: t('Yes') }, { value: 'no', label: t('No') }]}
        />
      </Field>
      {p.seasonal && (
        <Field label={t('Months closed')}>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((m: Month) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  up({
                    closedMonths: p.closedMonths.includes(m)
                      ? p.closedMonths.filter((x) => x !== m)
                      : [...p.closedMonths, m],
                  })}
                className={`rounded-md border px-2.5 py-1 text-xs uppercase ${
                  p.closedMonths.includes(m)
                    ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-700'
                    : 'border-gray-300 text-gray-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
      )}
    </div>
  );
}

export function validateProfile(data: ApplicationData): string | null {
  const p = data.profile;
  if (!p.productsDescription.trim()) return 'Describe what you sell';
  if (!p.monthlyVolume.trim()) return 'Monthly card volume is required';
  if (!p.averageTicket.trim()) return 'Average ticket is required';
  if (!p.highestTicket.trim()) return 'Highest ticket is required';
  if (cardMixTotal(p) !== 100) return 'Card-mix percentages must total exactly 100%';
  if (!p.refundPolicy) return 'Select a refund policy';
  if (p.refundPolicy === 'other' && !p.refundPolicyOther.trim()) return 'Describe your refund policy';
  if (p.seasonal && p.closedMonths.length === 0) return 'Select the months the business is closed';
  return null;
}

// ── Step 4: owners ─────────────────────────────────────────────────────

export function StepOwners({ data, setData, secure, setSecure, masks, t }: StepProps) {
  const upOwner = (i: number, patch: Partial<ApplicationData['owners'][number]>) =>
    setData((d) => ({ ...d, owners: d.owners.map((o, j) => (j === i ? { ...o, ...patch } : o)) }));
  const upSecure = (i: number, patch: Partial<SecureData['owners'][number]>) =>
    setSecure((s) => ({
      ...s,
      owners: s.owners.map((o, j) => (j === i ? { ...o, ...patch } : o)),
    }));

  return (
    <div className="space-y-4">
      {data.owners.map((o, i) => {
        const so = secure.owners[i] ?? { ssn: '', dob: '', driversLicenseNumber: '' };
        const m = masks?.owners?.[i];
        return (
          <SectionCard key={i} title={`${t('Owner')} ${i + 1}`}>
            {i > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-red-500 hover:text-red-600"
                onClick={() => {
                  setData((d) => ({ ...d, owners: d.owners.filter((_, j) => j !== i) }));
                  setSecure((s) => ({ ...s, owners: s.owners.filter((_, j) => j !== i) }));
                }}
              >
                {t('Remove')}
              </button>
            )}
            <TwoCol>
              <Field label={t('First name')} required>
                <TextInput value={o.firstName} onChange={(e) => upOwner(i, { firstName: e.target.value })} />
              </Field>
              <Field label={t('Last name')} required>
                <TextInput value={o.lastName} onChange={(e) => upOwner(i, { lastName: e.target.value })} />
              </Field>
            </TwoCol>
            <TwoCol>
              <Field label={t('Title')} required>
                <TextInput value={o.title} onChange={(e) => upOwner(i, { title: e.target.value })} placeholder="Owner / CEO / Managing Member" />
              </Field>
              <Field label={t('Ownership %')} required>
                <TextInput inputMode="numeric" value={String(o.equityPct)} onChange={(e) => upOwner(i, { equityPct: clampPct(Number(digitsOnly(e.target.value))) })} />
              </Field>
            </TwoCol>
            <CheckLine
              checked={o.isController}
              onChange={(v) => setData((d) => ({
                ...d,
                owners: d.owners.map((oo, j) => ({ ...oo, isController: j === i ? v : v ? false : oo.isController })),
              }))}
              label={t('This person is the controller (CEO/CFO/President…)')}
            />
            <TwoCol>
              <Field label={t('SSN')} required hint={m?.ssnLast4 && !so.ssn ? `${t('Saved')}: •••-••-${m.ssnLast4}` : undefined}>
                <TextInput
                  inputMode="numeric"
                  value={formatSsnInput(so.ssn)}
                  placeholder={m?.ssnLast4 ? `•••-••-${m.ssnLast4}` : '123-45-6789'}
                  onChange={(e) => upSecure(i, { ssn: digitsOnly(e.target.value).slice(0, 9) })}
                  autoComplete="off"
                />
              </Field>
              <Field label={t('Date of birth')} required hint={m?.dobYear && !so.dob ? `${t('Saved')}: ${m.dobYear}-••-••` : undefined}>
                <TextInput type="date" value={so.dob} onChange={(e) => upSecure(i, { dob: e.target.value })} />
              </Field>
            </TwoCol>
            <TwoCol>
              <Field label={t('Email')}>
                <TextInput type="email" value={o.email} onChange={(e) => upOwner(i, { email: e.target.value })} />
              </Field>
              <Field label={t('Cell phone')} required>
                <TextInput inputMode="tel" value={formatPhoneInput(o.cellPhone)} onChange={(e) => upOwner(i, { cellPhone: digitsOnly(e.target.value).slice(0, 10) })} />
              </Field>
            </TwoCol>
            <Field label={t('Home address')} required>
              <TextInput value={o.homeAddress} onChange={(e) => upOwner(i, { homeAddress: e.target.value })} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label={t('City')} required>
                <TextInput value={o.city} onChange={(e) => upOwner(i, { city: e.target.value })} />
              </Field>
              <Field label={t('State')} required>
                <StateSelect value={o.state} onChange={(v) => upOwner(i, { state: v })} />
              </Field>
              <Field label={t('ZIP')} required>
                <TextInput inputMode="numeric" value={o.zip} onChange={(e) => upOwner(i, { zip: digitsOnly(e.target.value).slice(0, 5) })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label={t("Driver's license #")} hint={m?.dlLast4 && !so.driversLicenseNumber ? `${t('Saved')}: •••${m.dlLast4}` : undefined}>
                <TextInput value={so.driversLicenseNumber} onChange={(e) => upSecure(i, { driversLicenseNumber: e.target.value })} autoComplete="off" />
              </Field>
              <Field label={t('DL state')}>
                <StateSelect value={o.driversLicenseState} onChange={(v) => upOwner(i, { driversLicenseState: v })} />
              </Field>
              <Field label={t('Passport # (non-US citizens)')}>
                <TextInput value={so.passportNumber ?? ''} onChange={(e) => upSecure(i, { passportNumber: e.target.value })} autoComplete="off" />
              </Field>
            </div>
          </SectionCard>
        );
      })}
      {data.owners.length < 4 && (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-emerald-500 hover:text-emerald-600"
          onClick={() => {
            setData((d) => ({ ...d, owners: [...d.owners, emptyOwner()] }));
            setSecure((s) => ({ ...s, owners: [...s.owners, { ssn: '', dob: '', driversLicenseNumber: '' }] }));
          }}
        >
          + {t('Add another owner')}
        </button>
      )}
      <p className="text-xs text-gray-400">{t('This information is encrypted and used only for your merchant application.')}</p>
    </div>
  );
}

export function validateOwners(data: ApplicationData, secure: SecureData, masks: Partial<Masks> | null): string | null {
  if (data.owners.length === 0) return 'Add at least one owner';
  let equity = 0;
  for (let i = 0; i < data.owners.length; i++) {
    const o = data.owners[i];
    const so = secure.owners[i] ?? { ssn: '', dob: '', driversLicenseNumber: '' };
    const m = masks?.owners?.[i];
    const n = i + 1;
    if (!o.firstName.trim() || !o.lastName.trim()) return `Owner ${n}: name is required`;
    if (!o.title.trim()) return `Owner ${n}: title is required`;
    if (!(so.ssn ? isSsn(so.ssn) : Boolean(m?.ssnLast4))) return `Owner ${n}: SSN must be 9 digits`;
    if (!(so.dob || m?.dobYear)) return `Owner ${n}: date of birth is required`;
    if (digitsOnly(o.cellPhone).length !== 10) return `Owner ${n}: cell phone must be 10 digits`;
    if (!o.homeAddress.trim() || !o.city.trim() || !o.state || o.zip.length < 5) return `Owner ${n}: complete the home address`;
    equity += Number(o.equityPct) || 0;
  }
  if (equity > 100) return 'Total ownership percentage cannot exceed 100%';
  if (!data.owners.some((o) => o.isController || (Number(o.equityPct) || 0) >= 25)) {
    return 'At least one owner must hold 25%+ equity or be marked as the controller';
  }
  return null;
}

// ── Step 5: online & delivery (conditional) ────────────────────────────

export function StepCnp({ data, setData, t }: StepProps) {
  const c = data.cnp;
  const up = (patch: Partial<ApplicationData['cnp']>) => setData((d) => ({ ...d, cnp: { ...d.cnp, ...patch } }));
  const toggleAd = (m: ApplicationData['cnp']['advertisingMethods'][number]) =>
    up({
      advertisingMethods: c.advertisingMethods.includes(m)
        ? c.advertisingMethods.filter((x) => x !== m)
        : [...c.advertisingMethods, m],
    });
  return (
    <div className="space-y-3">
      <TwoCol>
        <Field label={t('Delivery timeframe')} required>
          <PillGroup
            value={c.deliveryDays}
            onChange={(v) => up({ deliveryDays: v })}
            options={[
              { value: '0-7', label: `0–7 ${t('days')}` },
              { value: '8-14', label: `8–14 ${t('days')}` },
              { value: '15-30', label: `15–30 ${t('days')}` },
              { value: '30+', label: `30+ ${t('days')}` },
            ]}
          />
        </Field>
        <Field label={t('Deposit required %')}>
          <TextInput inputMode="numeric" value={String(c.pctDepositRequired)} onChange={(e) => up({ pctDepositRequired: clampPct(Number(digitsOnly(e.target.value))) })} />
        </Field>
      </TwoCol>
      <Field label={t('When is the customer paid in full?')}>
        <PillGroup
          value={c.pctPaidUpfront}
          onChange={(v) => up({ pctPaidUpfront: v })}
          options={[
            { value: 'advance', label: t('100% paid in advance') },
            { value: 'delivery', label: t('100% paid on delivery') },
          ]}
        />
      </Field>
      <Field label={t('Who owns the product?')} required>
        <PillGroup
          value={c.productOwner}
          onChange={(v) => up({ productOwner: v })}
          options={[
            { value: 'merchant', label: t('Merchant') },
            { value: 'vendor', label: t('Vendor (drop ship)') },
          ]}
        />
      </Field>
      <TwoCol>
        <Field label={t('Fulfillment house (if any)')}>
          <TextInput value={c.fulfillmentHouse} onChange={(e) => up({ fulfillmentHouse: e.target.value })} />
        </Field>
        <Field label={t('Shopping cart / CRM (if any)')}>
          <TextInput value={c.shoppingCart} onChange={(e) => up({ shoppingCart: e.target.value })} />
        </Field>
      </TwoCol>
      <Field label={t('Third parties with access to card data')}>
        <TextInput value={c.thirdPartiesWithCardData} onChange={(e) => up({ thirdPartiesWithCardData: e.target.value })} />
      </Field>
      <TwoCol>
        <Field label={t('Shipping method')}>
          <PillGroup
            value={c.shippingMethod}
            onChange={(v) => up({ shippingMethod: v })}
            options={[
              { value: 'fedex', label: 'FedEx' },
              { value: 'ups', label: 'UPS' },
              { value: 'usps', label: 'USPS' },
              { value: 'other', label: t('Other') },
            ]}
          />
        </Field>
        {c.shippingMethod === 'other' && (
          <Field label={t('Other')}>
            <TextInput value={c.shippingMethodOther} onChange={(e) => up({ shippingMethodOther: e.target.value })} />
          </Field>
        )}
      </TwoCol>
      <Field label={t('How do you advertise?')}>
        <div className="flex flex-wrap gap-2">
          {([
            ['catalog', t('Catalog')],
            ['tv_radio', t('TV / Radio')],
            ['direct_mail', t('Direct mail / flyers')],
            ['internet', t('Internet')],
            ['other', t('Other')],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleAd(value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                c.advertisingMethods.includes(value)
                  ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      <TwoCol>
        <Field label={t('Warranty provided by')}>
          <PillGroup
            value={c.warrantyProvider}
            onChange={(v) => up({ warrantyProvider: v })}
            options={[
              { value: 'merchant', label: t('Merchant') },
              { value: 'manufacturer', label: t('Manufacturer') },
              { value: 'other', label: t('Other') },
            ]}
          />
        </Field>
        <Field label={t('Where will products be marketed/sold?')}>
          <TextInput value={c.geographySold} onChange={(e) => up({ geographySold: e.target.value })} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Call center (if any)')}>
          <TextInput value={c.callCenter} onChange={(e) => up({ callCenter: e.target.value })} />
        </Field>
        <Field label={t('Chargeback management system (if any)')}>
          <TextInput value={c.chargebackSystem} onChange={(e) => up({ chargebackSystem: e.target.value })} />
        </Field>
      </TwoCol>
    </div>
  );
}

export function validateCnp(data: ApplicationData): string | null {
  if (!needsCnpSection(data.profile)) return null;
  if (!data.cnp.deliveryDays) return 'Select a delivery timeframe';
  if (!data.cnp.productOwner) return 'Select who owns the product';
  return null;
}

// ── Step 6: banking ────────────────────────────────────────────────────

export function StepBanking({ data, setData, secure, setSecure, masks, t, backend }: StepProps) {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const fileRef = useRef<HTMLInputElement>(null);
  const mb = masks?.bank;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadState('uploading');
    try {
      const contentBase64 = await fileToBase64(file);
      await backend.uploadDoc({
        kind: 'voided_check',
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        contentBase64,
      });
      setUploadState('done');
    } catch {
      setUploadState('error');
    }
  };

  return (
    <div className="space-y-3">
      <TwoCol>
        <Field label={t('Bank name')} required>
          <TextInput value={data.bank.bankName} onChange={(e) => setData((d) => ({ ...d, bank: { ...d.bank, bankName: e.target.value } }))} />
        </Field>
        <Field label={t('Account type')}>
          <PillGroup
            value={data.bank.accountType}
            onChange={(v) => setData((d) => ({ ...d, bank: { ...d.bank, accountType: v } }))}
            options={[
              { value: 'checking', label: t('Checking') },
              { value: 'savings', label: t('Savings') },
            ]}
          />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label={t('Routing number')} required hint={mb?.routingLast4 && !secure.bank.routingNumber ? `${t('Saved')}: •••••${mb.routingLast4}` : undefined}>
          <TextInput
            inputMode="numeric"
            value={secure.bank.routingNumber}
            placeholder={mb?.routingLast4 ? `•••••${mb.routingLast4}` : ''}
            onChange={(e) => setSecure((s) => ({ ...s, bank: { ...s.bank, routingNumber: formatRoutingInput(e.target.value) } }))}
            autoComplete="off"
          />
        </Field>
        <Field label={t('Account number')} required hint={mb?.accountLast4 && !secure.bank.accountNumber ? `${t('Saved')}: •••••${mb.accountLast4}` : undefined}>
          <TextInput
            inputMode="numeric"
            value={secure.bank.accountNumber}
            placeholder={mb?.accountLast4 ? `•••••${mb.accountLast4}` : ''}
            onChange={(e) => setSecure((s) => ({ ...s, bank: { ...s.bank, accountNumber: formatAccountInput(e.target.value) } }))}
            autoComplete="off"
          />
        </Field>
      </TwoCol>
      <CheckLine
        checked={data.bank2 !== null}
        onChange={(v) => {
          setData((d) => ({ ...d, bank2: v ? { bankName: '' } : null }));
          setSecure((s) => ({ ...s, bank2: v ? { routingNumber: '', accountNumber: '' } : null }));
        }}
        label={t('Add a second account (withdrawals)')}
      />
      {data.bank2 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('Bank name')}>
            <TextInput value={data.bank2.bankName} onChange={(e) => setData((d) => ({ ...d, bank2: { bankName: e.target.value } }))} />
          </Field>
          <Field label={t('Routing number')}>
            <TextInput inputMode="numeric" value={secure.bank2?.routingNumber ?? ''} onChange={(e) => setSecure((s) => ({ ...s, bank2: { routingNumber: formatRoutingInput(e.target.value), accountNumber: s.bank2?.accountNumber ?? '' } }))} autoComplete="off" />
          </Field>
          <Field label={t('Account number')}>
            <TextInput inputMode="numeric" value={secure.bank2?.accountNumber ?? ''} onChange={(e) => setSecure((s) => ({ ...s, bank2: { routingNumber: s.bank2?.routingNumber ?? '', accountNumber: formatAccountInput(e.target.value) } }))} autoComplete="off" />
          </Field>
        </div>
      )}
      <Field label={t('Voided check (photo or PDF)')}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadState === 'uploading'}
          className={`rounded-lg border px-4 py-2 text-sm font-medium ${
            uploadState === 'done'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          {uploadState === 'uploading' ? t('Saving…') : uploadState === 'done' ? `✓ ${t('Uploaded')}` : t('Upload')}
        </button>
        {uploadState === 'error' && <span className="ml-2 text-xs text-red-500">Upload failed — try again</span>}
      </Field>
    </div>
  );
}

export function validateBanking(data: ApplicationData, secure: SecureData, masks: Partial<Masks> | null): string | null {
  if (!data.bank.bankName.trim()) return 'Bank name is required';
  const hasSavedBank = Boolean(masks?.bank?.routingLast4);
  if (secure.bank.routingNumber ? !isAbaRouting(secure.bank.routingNumber) : !hasSavedBank) {
    return 'Enter a valid 9-digit routing number';
  }
  if (!secure.bank.accountNumber && !masks?.bank?.accountLast4) return 'Enter the account number';
  return null;
}

// ── Step 7: review & submit ────────────────────────────────────────────

export function StepReview({ data, setData, masks, t }: StepProps) {
  const b = data.business;
  const rows: Array<[string, string]> = [
    [t('Legal business name'), b.legalName],
    ['DBA', b.dba],
    ['EIN', b.ein ? formatEinInput(b.ein) : ''],
    [t('Business phone'), formatPhoneInput(b.phone)],
    [t('Contact email'), b.email],
    [t('Business location (no PO Box)'), `${data.locationAddress.line1}, ${data.locationAddress.city}, ${data.locationAddress.state} ${data.locationAddress.zip}`],
    [t('Monthly card volume ($)'), data.profile.monthlyVolume],
    [t('Average ticket ($)'), data.profile.averageTicket],
    [t('Bank name'), data.bank.bankName],
    [t('Routing number'), masks?.bank?.routingLast4 ? `•••••${masks.bank.routingLast4}` : ''],
    [t('Account number'), masks?.bank?.accountLast4 ? `•••••${masks.bank.accountLast4}` : ''],
  ];
  return (
    <div className="space-y-4">
      <SectionCard>
        <dl className="divide-y divide-gray-100">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-1.5 text-sm">
              <dt className="text-gray-500">{k}</dt>
              <dd className="text-right font-medium text-gray-800">{v}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
      <SectionCard title={t('Owners & control')}>
        {data.owners.map((o, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">{o.firstName} {o.lastName} — {o.title}</span>
            <span className="text-gray-500">
              {o.equityPct}% · SSN •••-••-{masks?.owners?.[i]?.ssnLast4 ?? '????'}
            </span>
          </div>
        ))}
      </SectionCard>
      <Field label={t('Type your full legal name to attest')} required>
        <TextInput
          value={data.attestation.typedName}
          onChange={(e) => setData((d) => ({ ...d, attestation: { ...d.attestation, typedName: e.target.value } }))}
        />
      </Field>
      <CheckLine
        checked={Boolean(data.attestation.agreedAt)}
        onChange={(v) => setData((d) => ({ ...d, attestation: { ...d.attestation, agreedAt: v ? new Date().toISOString() : null } }))}
        label={t('I certify that the information provided is true, complete and correct.')}
      />
    </div>
  );
}

export function validateReview(data: ApplicationData): string | null {
  if (!data.attestation.typedName.trim()) return 'Type your full legal name to attest';
  if (!data.attestation.agreedAt) return 'Confirm the certification checkbox';
  return null;
}
