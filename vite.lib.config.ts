import { fileURLToPath, URL } from 'node:url';
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import Vuetify from 'vite-plugin-vuetify';

/**
 * Build de biblioteca: é o que o `npm publish` empacota.
 *
 * **O nome não é `vite.config.ts` de propósito.** O Storybook carrega sozinho o
 * `vite.config.*` da raiz e mescla com o dele. Um `build.lib` mesclado ali
 * transformaria o `build-storybook` em build de pacote.
 *
 * **Vue, vue-i18n e Vuetify ficam de fora do pacote.** São `peerDependencies`:
 * duas cópias do Vue na mesma página quebram `inject`, e é por `inject` que tema,
 * permissão e língua chegam aos componentes. Os textos internos do Vuetify
 * (`vuetify/locale`) também ficam com a aplicação, e só os usados entram no build.
 *
 * **Cada componente do Vuetify sai importado.** No código-fonte, `<VBtn>` é só
 * uma tag: o Storybook registra o Vuetify inteiro, e a aplicação que compilava o
 * fonte tinha o próprio auto-import. O pacote compilado não conta com nenhum dos
 * dois, então o `vite-plugin-vuetify` escreve o `import` de cada componente
 * usado. O CSS do Vuetify continua com a aplicação, que tem a própria
 * configuração de SASS; daqui só sai o CSS dos componentes `Dl*`.
 */
export default defineConfig({
  plugins: [Vue(), Vuetify({ autoImport: true, styles: 'none' })],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: [/^vue($|\/)/, /^vue-i18n($|\/)/, /^vuetify($|\/)/],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
