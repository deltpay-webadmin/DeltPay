import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ES } from './translations.es';

/**
 * Lightweight CRM localization. English strings are the keys; `t()` returns
 * the Spanish translation when the language is 'es' and the string is known,
 * otherwise the English original — untranslated corners degrade gracefully
 * instead of breaking. Choice persists per browser (localStorage).
 */

export type Lang = 'en' | 'es';
const STORAGE_KEY = 'delt-crm-lang';

interface LangInfo {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: string) => string;
  /** Translates the English fragments inside dynamic pricing-terms strings (e.g. "3.99% service fee (customer-paid)"). */
  tTerms: (s: string) => string;
}

/**
 * Pricing terms are built dynamically with numbers baked in, so they can't be
 * dictionary keys — translate their fixed fragments instead.
 */
const TERM_FRAGMENTS_ES: Array<[RegExp, string]> = [
  [/service fee \(customer-paid\)/g, 'tarifa de servicio (pagada por el cliente)'],
  [/\/mo program fee/g, '/mes cuota del programa'],
  [/\/txn/g, '/trans.'],
  [/all-in effective/g, 'tasa efectiva total'],
];

export function termsToEs(s: string): string {
  return TERM_FRAGMENTS_ES.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
}

const LangContext = createContext<LangInfo>({ lang: 'en', setLang: () => {}, t: s => s, tTerms: s => s });

export function useLang(): LangInfo {
  return useContext(LangContext);
}

function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch { /* private mode */ }
  }, []);

  const t = useCallback((s: string) => (lang === 'es' ? ES[s] ?? s : s), [lang]);
  const tTerms = useCallback((s: string) => (lang === 'es' ? termsToEs(s) : s), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, tTerms }), [lang, setLang, t, tTerms]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
