import { setup, type Preview } from '@storybook/vue3-vite';
import { createVuetify } from 'vuetify';
// Sem tree-shaking aqui: o Storybook registra tudo, e assim nenhuma story
// precisa importar VBtn, VTextField e companhia a mao. Ver .storybook/main.ts.
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { watchEffect } from 'vue';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { darkColors, lightColors } from '../src/theme/tokens';
import { cssVariables, THEME_DARK, THEME_LIGHT, vuetifyOptions } from '../src/theme/vuetify';
import './preview.css';

const vuetify = createVuetify({ ...vuetifyOptions, components, directives });

setup((app) => {
  app.use(vuetify);
});

/**
 * O seletor de tema fica na barra do Storybook, e nao numa story separada.
 * Assim TODO componente e visto nos dois modos sem sair do lugar, que e o
 * unico jeito de pegar o par que passa no claro e some no escuro.
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
  },
  initialGlobals: { theme: 'light' },
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

        return {};
      },
      template: '<div class="dl-preview"><story /></div>',
    }),
  ],
};

export default preview;
