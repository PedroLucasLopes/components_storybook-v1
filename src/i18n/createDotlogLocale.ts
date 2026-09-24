import { type Ref, watch } from 'vue';
import type { LocaleOptions } from 'vuetify';
import { en, es, pt } from 'vuetify/locale';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { matchLocale } from './languages';

type VueI18nParams = Parameters<typeof createVueI18nAdapter>[0];

type Tree = Record<string, unknown>;

const VUETIFY_MESSAGES: Readonly<Record<string, Tree>> = { en, es, pt };

const isTree = (value: unknown): value is Tree => !!value && typeof value === 'object' && !Array.isArray(value);

const merge = (base: Tree, override: unknown): Tree => {
  if (!isTree(override)) return base;

  const result: Tree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = result[key];

    result[key] = isTree(value) && isTree(current) ? merge(current, value) : value;
  }

  return result;
};

const syncDocumentLanguage = (current: Ref<string>): void => {
  if (typeof document === 'undefined') return;

  watch(
    current,
    (code) => {
      document.documentElement.lang = code;
    },
    { immediate: true },
  );
};

export function createDotlogLocale({ i18n, useI18n }: VueI18nParams): LocaleOptions {
  const { global } = i18n;
  const builtIn = Object.keys(VUETIFY_MESSAGES);

  for (const code of global.availableLocales) {
    const vuetify = VUETIFY_MESSAGES[matchLocale([code], builtIn) ?? 'en'] ?? en;
    const messages = global.getLocaleMessage(code) as Tree;

    global.setLocaleMessage(code, { ...messages, $vuetify: merge(vuetify, messages.$vuetify) });
  }

  const adapter = createVueI18nAdapter({ i18n, useI18n });

  syncDocumentLanguage(adapter.current);

  return { adapter };
}
