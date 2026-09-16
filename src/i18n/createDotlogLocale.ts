import { type Ref, watch } from 'vue';
import type { LocaleOptions } from 'vuetify';
import { en, es, pt } from 'vuetify/locale';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { matchLocale } from './languages';

/**
 * Uma língua só para a aplicação, o Vuetify e a biblioteca.
 *
 * A aplicação cria o vue-i18n dela com os próprios JSON e passa aqui:
 *
 * ```ts
 * createVuetify({ ...vuetifyOptions, locale: createDotlogLocale({ i18n, useI18n }) })
 * ```
 *
 * Três coisas acontecem:
 *
 * - **O Vuetify passa a traduzir pelo vue-i18n**, com o adaptador oficial dele.
 *   A língua corrente é uma só: trocar em `i18n.global.locale`, ou no
 *   `DlUserMenu`, troca tudo.
 * - **Os textos internos do Vuetify entram em cada língua registrada**, em
 *   `$vuetify`, pela mesma língua ou variante. Sem eles o vue-i18n mostraria a
 *   chave crua ("$vuetify.noDataText") num seletor vazio. O que a aplicação já
 *   tiver declarado em `$vuetify` no próprio JSON prevalece.
 * - **`<html lang>` acompanha a língua**, para leitor de tela pronunciar certo
 *   e o navegador não oferecer traduzir uma página que já está na língua.
 *
 * `useI18n` vem da aplicação, e não daqui, pelo mesmo motivo de Vue e Vuetify
 * serem `peerDependencies`: duas cópias do vue-i18n não se enxergam.
 */

type VueI18nParams = Parameters<typeof createVueI18nAdapter>[0];

type Tree = Record<string, unknown>;

const VUETIFY_MESSAGES: Readonly<Record<string, Tree>> = { en, es, pt };

const isTree = (value: unknown): value is Tree => !!value && typeof value === 'object' && !Array.isArray(value);

/** Mescla em profundidade; o segundo lado ganha onde os dois têm valor. */
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
