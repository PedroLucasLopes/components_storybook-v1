import { computed } from 'vue';
import { useLocale } from 'vuetify';
import { languageName, languageRegion, storeLocale } from './languages';

export interface Language {
  /** Código BCP 47, o mesmo nome do arquivo de tradução: `en`, `es`, `pt-BR`. */
  code: string;
  /** Nome na própria língua: English, Español, Português (Brasil). */
  name: string;
  /** País da bandeira, em ISO 3166-1 alfa-2. `null` quando o código não diz. */
  region: string | null;
}

/**
 * As línguas que a aplicação registrou, e a troca entre elas.
 *
 * A lista sai das mensagens do Vuetify, que com `createDotlogLocale` são as do
 * vue-i18n da aplicação: cada JSON registrado vira uma língua, sem declaração
 * nenhuma além dele. É o que `DlUserMenu` mostra.
 *
 * Trocar grava a escolha neste navegador. Na próxima visita ela vale antes da
 * língua do navegador; ver `preferredLocale`.
 */
export function useLanguages() {
  const locale = useLocale();

  const languages = computed<Language[]>(() =>
    Object.keys(locale.messages.value).map((code) => ({
      code,
      name: languageName(code),
      region: languageRegion(code),
    })),
  );

  const setLocale = (code: string): void => {
    locale.current.value = code;
    storeLocale(code);
  };

  return {
    locale: computed(() => locale.current.value),
    languages,
    setLocale,
  };
}
