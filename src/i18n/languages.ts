/**
 * Qual língua atende a pessoa, e como mostrar cada uma.
 *
 * ## A escolha tem três fontes, nesta ordem
 *
 * 1. **O que a pessoa escolheu**, guardado neste navegador. Vale só se a língua
 *    ainda estiver registrada: um JSON que saiu não prende ninguém nele.
 * 2. **As línguas do navegador**, na ordem de preferência dele. Quem pede
 *    `pt-PT` recebe `pt-BR` antes de inglês: mesma língua vale mais que a
 *    próxima da lista.
 * 3. **A língua de reserva**, e na falta dela a primeira registrada.
 *
 * O armazenamento é lido de forma síncrona, antes da primeira tela, pelo mesmo
 * motivo do tema: a interface não pode nascer em inglês e trocar de língua
 * quando a pessoa já começou a ler.
 *
 * ## Nome e bandeira saem do código da língua
 *
 * `Intl.DisplayNames` dá o nome na própria língua (English, Español, Português
 * (Brasil)), que é como cada pessoa procura a sua numa lista. `Intl.Locale`
 * completa o país que o código não diz: `en` vira Estados Unidos, `es` vira
 * Espanha. Nada disso precisa ser declarado: registrar o JSON basta.
 */

export const LOCALE_STORAGE_KEY = 'dl.locale';

const canonical = (code: string): string | null => {
  try {
    return Intl.getCanonicalLocales(code)[0]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
};

/**
 * Melhor correspondência, em ordem de preferência: para cada língua pedida,
 * primeiro o código exato, depois a mesma língua em outra variante.
 */
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

/** Leitura tolerante, como a do tema: aba anônima e site bloqueado lançam. */
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
    /* Conveniência, não requisito: sem armazenamento a escolha vale até recarregar. */
  }
}

const browserLanguages = (): readonly string[] => {
  if (typeof navigator === 'undefined') return [];

  return navigator.languages?.length ? navigator.languages : [navigator.language];
};

/** A língua com que a interface nasce. Ver a ordem no topo do arquivo. */
export function preferredLocale(available: readonly string[], fallback = 'en'): string {
  const stored = readStoredLocale();

  if (stored && available.includes(stored)) return stored;

  return matchLocale(browserLanguages(), available) ?? matchLocale([fallback], available) ?? available[0] ?? fallback;
}

/** Nome da língua nela mesma, com inicial maiúscula: Español, Português (Brasil). */
export function languageName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);

    if (!name) return code;

    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return code;
  }
}

/** País da bandeira, em ISO 3166-1 alfa-2. `null` quando nem o código completo diz. */
export function languageRegion(code: string): string | null {
  try {
    return new Intl.Locale(code).maximize().region ?? null;
  } catch {
    return null;
  }
}
