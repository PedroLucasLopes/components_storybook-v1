import { computed } from 'vue';
import { useLocale } from 'vuetify';
import { languageName, languageRegion, storeLocale } from './languages';

export interface Language {
  code: string;
  name: string;
  region: string | null;
}

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
