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
npm i @pedrolucaslopes/dotlog-ui vue vuetify @mdi/font
```

`vue` e `vuetify` são `peerDependencies`: vale a cópia da aplicação. Duas cópias do Vue na mesma
página quebram `inject`, que é por onde tema e permissão chegam aos componentes.

## Uso

```ts
// plugins/vuetify.ts
import { vuetifyOptions } from '@pedrolucaslopes/dotlog-ui'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@pedrolucaslopes/dotlog-ui/styles'

export default createVuetify({ ...vuetifyOptions })
```

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
