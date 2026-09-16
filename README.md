# @pedrolucaslopes/dotlog-ui

Componentes Vuetify, tokens de design e Storybook dos fronts do ecossistema SSO: tabela de gestão,
casca com menu derivado das permissões, tela de login do IdP, árvore de rotas, gráficos, avisos e
modais. Todo componente nasce aqui, com story nos dois temas, e só depois é consumido.

As decisões de desenho, a conferência de contraste e as armadilhas já pagas estão em
[`CLAUDE.md`](CLAUDE.md).

## Instalação

O pacote é **privado** e mora no GitHub Packages, que exige token até para instalar.

`.npmrc` da aplicação, versionado:

```ini
@pedrolucaslopes:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

O token **não** entra no arquivo. Ele vem da variável de ambiente `NODE_AUTH_TOKEN`, com um token do
GitHub que tenha `read:packages`. No build do Docker, passe como secret do BuildKit, nunca como `ARG`
ou `ENV`, que ficam gravados na imagem.

```bash
npm i @pedrolucaslopes/dotlog-ui vue vuetify vue-i18n @mdi/font
```

`vue`, `vuetify` e `vue-i18n` são `peerDependencies`: vale a cópia da aplicação. Duas cópias do Vue
na mesma página quebram `inject`, que é por onde tema, permissão e língua chegam aos componentes.
`vue-i18n` é opcional: sem ele, os componentes ficam em inglês.

## Uso

As traduções da aplicação são um JSON por língua, com o código como nome: `en.json`, `es.json`,
`pt-BR.json`. O menu do usuário lista sozinho as que estiverem registradas.

```ts
// plugins/i18n.ts
import { preferredLocale } from '@pedrolucaslopes/dotlog-ui'
import { createI18n } from 'vue-i18n'

// Todo JSON da pasta entra sozinho: língua nova é só um arquivo novo.
const files = import.meta.glob<Record<string, unknown>>('../locales/*.json', { eager: true, import: 'default' })
const messages = Object.fromEntries(
  Object.entries(files).map(([path, message]) => [path.slice(path.lastIndexOf('/') + 1, -'.json'.length), message]),
)

export const i18n = createI18n({
  legacy: false,
  locale: preferredLocale(Object.keys(messages), 'en'),
  fallbackLocale: 'en',
  messages,
})
```

```ts
// plugins/vuetify.ts
import { createDotlogLocale, vuetifyOptions } from '@pedrolucaslopes/dotlog-ui'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { i18n } from './i18n'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@pedrolucaslopes/dotlog-ui/styles'

// Vuetify, componentes da biblioteca e aplicação na mesma língua.
export default createVuetify({ ...vuetifyOptions, locale: createDotlogLocale({ i18n, useI18n }) })
```

`app.use(i18n)` antes do Vuetify. No código, `const { t } = useI18n()` e `t('projects.title')`; o
`DlUserMenu` troca a língua, guarda a escolha neste navegador e a tela inteira acompanha.

```vue
<!-- App.vue -->
<script setup lang="ts">
  import { bindVuetifyTheme, DlToastHost } from '@pedrolucaslopes/dotlog-ui'

  // Liga o tema do usuário ao Vuetify e publica os tokens como variáveis `--dl-*`.
  bindVuetifyTheme()
</script>

<template>
  <VApp>
    <RouterView />
    <DlToastHost />
  </VApp>
</template>
```

Quem monta a casca informa o que o papel alcança, e tabela, cabeçalho, abas e menu escondem o resto:

```ts
providePermissions(toRef(session, 'permissions'), ref('/sso'))
```

- **Fontes.** Os tokens usam Roboto e Roboto Mono. A aplicação carrega as duas, do jeito dela.
- **Componentes do Vuetify.** O pacote importa os que usa. O CSS deles vem de `vuetify/styles`, ou do
  SASS configurado no `vite-plugin-vuetify` da aplicação.

## Storybook

```bash
npm ci
npm run storybook        # localhost:6007
npm run check:contrast   # paleta contra a WCAG
npm run check:locales    # traduções dos componentes contra o en.json
npm run type-check
```

O seletor de tema fica na barra do Storybook. Toda story é conferida nos dois temas.

## Publicar uma versão

```bash
npm version patch
git push --follow-tags
```

A tag `v*` dispara `.github/workflows/publish.yml`, que confere a tag contra o `package.json`, a paleta
contra a WCAG e o build do Storybook, e então confere os tipos, compila e publica com o `GITHUB_TOKEN`
da própria execução.
