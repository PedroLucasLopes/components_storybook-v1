import { setup, type Preview } from '@storybook/vue3-vite';
import { createI18n, useI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
// Sem tree-shaking aqui: o Storybook registra tudo, e assim nenhuma story
// precisa importar VBtn, VTextField e companhia a mao. Ver .storybook/main.ts.
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { watchEffect } from 'vue';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createDotlogLocale } from '../src/i18n/createDotlogLocale';
import { languageName } from '../src/i18n/languages';
import { appMessages } from '../src/mocks/locales';
import { darkColors, lightColors } from '../src/theme/tokens';
import { cssVariables, THEME_DARK, THEME_LIGHT, vuetifyOptions } from '../src/theme/vuetify';
import './preview.css';

/**
 * A lingua e montada como uma aplicacao monta: vue-i18n com os JSON dela, e
 * `createDotlogLocale` ligando o Vuetify e a biblioteca a mesma lingua. Os JSON
 * sao os de uma aplicacao de exemplo, em `src/mocks/locales`.
 */
const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: appMessages });

const vuetify = createVuetify({
  ...vuetifyOptions,
  locale: createDotlogLocale({ i18n, useI18n }),
  components,
  directives,
});

setup((app) => {
  app.use(i18n);
  app.use(vuetify);
});

type AppLocale = typeof i18n.global.locale.value;

/* A barra so manda quando muda. A troca feita dentro de uma story, pelo menu do
   usuario, sobrevive a trocar o tema, que remonta a story. */
let appliedLocale: string | null = null;

/**
 * Tema e lingua ficam na barra do Storybook, e nao numa story separada. Assim
 * TODO componente e visto nos dois modos e nas tres linguas sem sair do lugar,
 * que e o unico jeito de pegar o par que passa no claro e some no escuro, ou o
 * rotulo que cabe em ingles e quebra em portugues.
 */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema da interface',
      toolbar: {
        title: 'Tema',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Escuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Lingua da interface',
      toolbar: {
        title: 'Lingua',
        icon: 'globe',
        items: i18n.global.availableLocales.map((code) => ({ value: code, title: languageName(code) })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', locale: 'en' },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ['Fundacao', ['Cores', 'Tipografia', 'Espacamento'], 'Formulario', 'Dados', 'Navegacao', 'Feedback'],
      },
    },
  },
  decorators: [
    (story, context) => ({
      components: { story },
      setup() {
        watchEffect(() => {
          const dark = context.globals.theme === 'dark';
          const colors = dark ? darkColors : lightColors;

          vuetify.theme.change(dark ? THEME_DARK : THEME_LIGHT);

          for (const [nome, valor] of Object.entries(cssVariables(colors))) {
            document.documentElement.style.setProperty(nome, valor);
          }

          document.documentElement.dataset.dlTheme = dark ? 'dark' : 'light';
          document.body.style.background = colors.background;
          document.body.style.color = colors.onSurface;
        });

        const requested = context.globals.locale as AppLocale | undefined;

        if (requested && requested !== appliedLocale) {
          appliedLocale = requested;
          i18n.global.locale.value = requested;
        }

        return {};
      },
      template: '<div class="dl-preview"><story /></div>',
    }),
  ],
};

export default preview;
