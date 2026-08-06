// Context-free MPA wizard engine. Hosted by the CRM (staff fills it with
// the merchant present — the primary flow) and by the public tokenized
// link page (merchant self-completes). Persistence is injected via
// MpaBackend; the wizard never touches Supabase directly.
//
// Sensitive fields live in a client-side SecureData draft that is sent as a
// partial `secureUpdate` on save — blank fields mean "keep what's stored".
// The server re-encrypts and returns masks; full values never come back.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApplicationData, Masks, SecureData } from './types';
import { emptyApplicationData, emptySecureData, needsCnpSection } from './types';
import type { ClientApplication, MpaBackend } from './api';
import { translate, type MpaLang } from './i18n';
import {
  StepAddresses, StepBanking, StepBusiness, StepCnp, StepOwners, StepProfile, StepReview,
  validateAddresses, validateBanking, validateBusiness, validateCnp, validateOwners,
  validateProfile, validateReview, type StepProps,
} from './steps';

interface StepDef {
  key: string;
  title: string;
  description: string;
  render: (props: StepProps) => JSX.Element;
  validate: (data: ApplicationData, secure: SecureData, masks: Partial<Masks> | null) => string | null;
  hidden?: (data: ApplicationData) => boolean;
}

const STEPS: StepDef[] = [
  { key: 'business', title: 'Business identity', description: 'Tell us about the business entity.', render: (p) => <StepBusiness {...p} />, validate: (d) => validateBusiness(d) },
  { key: 'addresses', title: 'Addresses', description: 'Where the business operates and receives mail.', render: (p) => <StepAddresses {...p} />, validate: (d) => validateAddresses(d) },
  { key: 'profile', title: 'Business profile', description: 'What you sell and how you take payments.', render: (p) => <StepProfile {...p} />, validate: (d) => validateProfile(d) },
  { key: 'owners', title: 'Owners & control', description: 'Everyone with 25%+ ownership, plus a controller.', render: (p) => <StepOwners {...p} />, validate: validateOwners },
  { key: 'cnp', title: 'Online & delivery', description: 'Required because part of your volume is card-not-present.', render: (p) => <StepCnp {...p} />, validate: (d) => validateCnp(d), hidden: (d) => !needsCnpSection(d.profile) },
  { key: 'banking', title: 'Banking', description: 'Where your deposits will go.', render: (p) => <StepBanking {...p} />, validate: validateBanking },
  { key: 'review', title: 'Review & submit', description: 'Confirm everything is accurate.', render: (p) => <StepReview {...p} />, validate: (d) => validateReview(d) },
];

/** Merge a partial server payload over the full local scaffold so old rows
 * (or seeded drafts) never leave fields undefined. */
function hydrateData(partial: Partial<ApplicationData> | undefined): ApplicationData {
  const base = emptyApplicationData();
  if (!partial) return base;
  const merged: ApplicationData = {
    ...base,
    ...partial,
    business: { ...base.business, ...partial.business },
    locationAddress: { ...base.locationAddress, ...partial.locationAddress },
    billingAddress: { ...base.billingAddress, ...partial.billingAddress },
    profile: { ...base.profile, ...partial.profile },
    cnp: { ...base.cnp, ...partial.cnp },
    owners: partial.owners?.length ? partial.owners.map((o) => ({ ...base.owners[0], ...o })) : base.owners,
    bank: { ...base.bank, ...partial.bank },
    bank2: partial.bank2 ?? null,
    attestation: { ...base.attestation, ...partial.attestation },
  };
  return merged;
}

function blankSecureFor(data: ApplicationData): SecureData {
  const s = emptySecureData();
  s.owners = data.owners.map(() => ({ ssn: '', dob: '', driversLicenseNumber: '' }));
  s.bank2 = data.bank2 ? { routingNumber: '', accountNumber: '' } : null;
  return s;
}

export function MpaWizard({
  backend,
  initialLang = 'en',
  onDone,
}: {
  backend: MpaBackend;
  initialLang?: MpaLang;
  onDone?: (app: ClientApplication) => void;
}) {
  const [lang, setLang] = useState<MpaLang>(initialLang);
  const t = useCallback((k: string) => translate(lang, k), [lang]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [app, setApp] = useState<ClientApplication | null>(null);
  const [data, setDataRaw] = useState<ApplicationData>(emptyApplicationData);
  const [secure, setSecureRaw] = useState<SecureData>(emptySecureData);
  const [stepIdx, setStepIdx] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const dirtyRef = useRef(false);

  const setData = useCallback((updater: (d: ApplicationData) => ApplicationData) => {
    dirtyRef.current = true;
    setDataRaw(updater);
  }, []);
  const setSecure = useCallback((updater: (s: SecureData) => SecureData) => {
    dirtyRef.current = true;
    setSecureRaw(updater);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await backend.get();
        if (cancelled) return;
        const hydrated = hydrateData(loaded.data);
        setApp(loaded);
        setDataRaw(hydrated);
        setSecureRaw(blankSecureFor(hydrated));
        setStepIdx(Math.min(Math.max(loaded.currentStep ?? 0, 0), STEPS.length - 1));
        if (loaded.status === 'submitted' || loaded.status === 'boarded') setDone(true);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load the application');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [backend]);

  const visibleSteps = useMemo(() => STEPS.filter((s) => !s.hidden?.(data)), [data]);
  const clampedIdx = Math.min(stepIdx, visibleSteps.length - 1);
  const step = visibleSteps[clampedIdx];

  /** Only ship secure fields the user actually typed. */
  const secureUpdate = useCallback((): Partial<SecureData> | undefined => {
    if (!dirtyRef.current) return undefined;
    const anyOwner = secure.owners.some((o) => o.ssn || o.dob || o.driversLicenseNumber || o.passportNumber);
    const anyBank = Boolean(secure.bank.routingNumber || secure.bank.accountNumber);
    const anyBank2 = Boolean(secure.bank2 && (secure.bank2.routingNumber || secure.bank2.accountNumber));
    const ownersResized = secure.owners.length !== (app?.masks?.owners?.length ?? secure.owners.length);
    const bank2Removed = Boolean(app?.masks?.bank2) && secure.bank2 === null;
    if (!anyOwner && !anyBank && !anyBank2 && !ownersResized && !bank2Removed) return undefined;
    const update: Partial<SecureData> = { owners: secure.owners };
    if (anyBank) update.bank = secure.bank;
    if (anyBank2 || bank2Removed) update.bank2 = secure.bank2;
    return update;
  }, [secure, app]);

  const persist = useCallback(async (nextStepIdx: number) => {
    setSaving(true);
    try {
      const updated = await backend.save({
        data,
        secureUpdate: secureUpdate(),
        currentStep: nextStepIdx,
      });
      setApp(updated);
      // Secure draft was absorbed server-side; clear it so masks take over.
      setSecureRaw(blankSecureFor(hydrateData(updated.data)));
      dirtyRef.current = false;
      return true;
    } catch (err) {
      setStepError(err instanceof Error ? err.message : 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [backend, data, secureUpdate]);

  const goNext = async () => {
    setStepError(null);
    const problem = step.validate(data, secure, app?.masks ?? null);
    if (problem) {
      setStepError(problem);
      return;
    }
    if (clampedIdx === visibleSteps.length - 1) {
      // Final step: save, then submit.
      setSubmitting(true);
      try {
        const ok = await persist(clampedIdx);
        if (!ok) return;
        const submitted = await backend.submit();
        setApp(submitted);
        setDone(true);
        onDone?.(submitted);
      } catch (err) {
        setStepError(err instanceof Error ? err.message : 'Submit failed');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const next = clampedIdx + 1;
    const ok = await persist(next);
    if (ok) setStepIdx(next);
  };

  const goBack = async () => {
    setStepError(null);
    if (clampedIdx === 0) return;
    const prev = clampedIdx - 1;
    await persist(prev);
    setStepIdx(prev);
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">Loading…</div>;
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="text-base font-semibold text-gray-800">Something went wrong</div>
        <p className="mt-2 text-sm text-gray-500">{loadError}</p>
      </div>
    );
  }
  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
        <div className="text-lg font-semibold text-gray-800">{t('Application submitted')}</div>
        <p className="mt-2 text-sm text-gray-500">
          {t('Thank you — your application is complete. Your representative will take it from here.')}
        </p>
      </div>
    );
  }

  const stepProps: StepProps = { data, setData, secure, setSecure, masks: app?.masks ?? null, t, backend };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t(step.title)}</h2>
          <p className="text-sm text-gray-500">{t(step.description)}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-500 hover:border-gray-400"
        >
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* progress */}
      <div className="mb-6 flex items-center gap-1.5">
        {visibleSteps.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full ${i <= clampedIdx ? 'bg-emerald-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {step.render(stepProps)}

      {stepError && (
        <div className="mt-4 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {stepError}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={clampedIdx === 0 || saving || submitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
        >
          {t('Back')}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={saving || submitting}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting
            ? t('Submitting…')
            : saving
              ? t('Saving…')
              : clampedIdx === visibleSteps.length - 1
                ? t('Submit application')
                : t('Next')}
        </button>
      </div>
    </div>
  );
}
