export const LOCALE_STORAGE_KEY = 'dl.locale';

const canonical = (code: string): string | null => {
  try {
    return Intl.getCanonicalLocales(code)[0]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
};

export function matchLocale(requested: readonly string[], available: readonly string[]): string | null {
  const options = available.map((code) => {
    const tag = canonical(code);

    return { code, tag, language: tag?.split('-')[0] ?? null };
  });

  for (const wanted of requested) {
    const tag = canonical(wanted);

    if (!tag) continue;

    const exact = options.find((option) => option.tag === tag);

    if (exact) return exact.code;

    const language = tag.split('-')[0];
    const sameLanguage = options.find((option) => option.language === language);

    if (sameLanguage) return sameLanguage.code;
  }

  return null;
}

export function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLocale(code: string): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
  }
}

const browserLanguages = (): readonly string[] => {
  if (typeof navigator === 'undefined') return [];

  return navigator.languages?.length ? navigator.languages : [navigator.language];
};

export function preferredLocale(available: readonly string[], fallback = 'en'): string {
  const stored = readStoredLocale();

  if (stored && available.includes(stored)) return stored;

  return matchLocale(browserLanguages(), available) ?? matchLocale([fallback], available) ?? available[0] ?? fallback;
}

export function languageName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);

    if (!name) return code;

    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return code;
  }
}

export function languageRegion(code: string): string | null {
  try {
    return new Intl.Locale(code).maximize().region ?? null;
  } catch {
    return null;
  }
}
