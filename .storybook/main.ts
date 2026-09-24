import type { StorybookConfig } from '@storybook/vue3-vite';
import Vue from '@vitejs/plugin-vue';

/**
 * ⚠️ Duas coisas aqui nao sao obvias, e as duas custaram tempo.
 *
 * **O plugin do Vue entra a mao.** O `@storybook/vue3-vite` 10.6 nao injeta
 * `@vitejs/plugin-vue` na config resolvida com Vite 8. Sem ele, todo arquivo
 * `.vue` vai parar no parser de JavaScript e o erro que aparece e um
 * "Unexpected JSX expression" apontando para a linha 1 do `<script setup>`,
 * que nao ajuda em nada.
 *
 * **Sem `vite-plugin-vuetify`.** A versao 2.1.3 quebra com Vite 8: no
 * `configResolved` ela procura o plugin do Vue, nao acha, e faz
 * `config.plugins[-1].api`. O plugin so serve para tree-shaking e auto-import;
 * num Storybook isso nao vale o risco, e `preview.ts` registra todos os
 * componentes do Vuetify de uma vez. A aplicacao continua usando o plugin
 * normalmente, onde ele funciona.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.plugins = config.plugins ?? [];

    // `flat(Infinity)` faz o TypeScript tentar inferir o tipo de plugin do Vite
    // recursivamente e estourar em TS2589. Um nivel basta aqui.
    const nomes = new Set(
      config.plugins
        .flat()
        .map((plugin) =>
          plugin && typeof plugin === 'object' && 'name' in plugin ? String(plugin.name) : '',
        ),
    );

    if (!nomes.has('vite:vue')) config.plugins.push(Vue());

    return config;
  },
};

export default config;
