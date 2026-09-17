# 🎨 @pedrolucaslopes/dotlog-ui

Componentes Vuetify, tokens de design e Storybook compartilhados pelos fronts do ecossistema SSO.

É o contrato de **interface**, do mesmo jeito que [`@pedrolucaslopes/sso-client`](https://github.com/PedroLucasLopes/sso-lib-v1/blob/main/CLAUDE.md) é o
contrato de **autenticação**. Tem repositório próprio,
[`PedroLucasLopes/components_storybook-v1`](https://github.com/PedroLucasLopes/components_storybook-v1), e chega a cada front
**pelo npm**. Nenhum front importa `../ui/src`, nem por alias, nem por `paths`, nem por link de pasta.

```bash
npm run storybook        # localhost:6007
npm run build-storybook
npm run check:contrast   # valida a paleta contra a WCAG
npm run check:locales    # confere as traduções dos componentes contra o en.json
npm run type-check
npm run build            # o pacote: dist/index.js, dist/style.css e as declarações
```

> Projeto **independente**: repositório, `node_modules` e ciclo de versão próprios. Nesta máquina ele
> mora em `ui/`, com `.git` próprio, como o `sso-client`; o diretório de fora não é repositório. Quem
> consome são o console do SSO, `plataforma_sso-v1`, e o front do KRLoc, `plataforma_krloc-v1`, do mesmo
> jeito que qualquer front novo consumiria.

---

## 📦 Distribuição

O pacote é **`@pedrolucaslopes/dotlog-ui`**, privado, no GitHub Packages, publicado do repositório
`components_storybook-v1`. O nome do repositório não precisa bater com o do pacote; o **escopo** do npm precisa ser
o dono no GitHub, em minúsculas.

- **Publicar:** `npm version patch` e `git push --follow-tags`. A tag `v*` dispara
  `.github/workflows/publish.yml`, que confere a tag contra a versão, roda `check:contrast` e
  `build-storybook`, e publica com o `GITHUB_TOKEN` da própria execução. O `prepublishOnly` confere os
  tipos e compila. Nenhum token pessoal fica guardado em secret.
- **Instalar:** `.npmrc` com `@pedrolucaslopes:registry=https://npm.pkg.github.com` e
  `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}`. O token, com `read:packages`, vem do ambiente.
  No Docker entra como secret do BuildKit, nunca como `ARG` ou `ENV`, que ficam na imagem. Com a
  variável ausente, `npm run` continua funcionando; só a instalação do pacote falha.
- **Consumir:** `vue` e `vuetify` são `peerDependencies`; `vue-i18n` também, opcional, para quem
  traduz. A aplicação importa `@pedrolucaslopes/dotlog-ui/styles` **depois** de `vuetify/styles`,
  carrega `@mdi/font` e as fontes Roboto e Roboto Mono, chama `bindVuetifyTheme()` dentro do `App.vue`
  e liga a língua com `createDotlogLocale`. O `README.md` tem o exemplo.

| Vai no pacote | Fica fora |
|---|---|
| `dist/index.js` (ESM, com source map), `dist/style.css`, declarações `.d.ts` | stories, mocks, `.storybook/`, `scripts/` |

### Como o pacote é compilado

`vite.lib.config.ts` gera o JavaScript e o CSS; `tsconfig.build.json` gera as declarações com `vue-tsc`.

- **Vue e Vuetify são externos.** Duas cópias do Vue na mesma página quebram `inject`, que é por onde
  tema e permissão chegam aos componentes.
- **Cada componente do Vuetify sai importado.** No fonte, `<VBtn>` é só uma tag: o Storybook registra o
  Vuetify inteiro. O pacote compilado não conta com isso, então o `vite-plugin-vuetify` escreve o
  `import` de cada componente usado.
- **O CSS do Vuetify fica com a aplicação** (`styles: 'none'`), que tem a própria configuração de SASS.
  Daqui só sai o CSS dos componentes `Dl*`.

**Versão.** Correção é `patch`; prop, evento ou export novo é `minor`; mudar ou remover o que já existe
é `major`. O front fixa a faixa no `package.json` e sobe quando quiser, que é o ponto de ser pacote.

---

## 🎨 A paleta foi conferida, não escolhida

Todo par de texto sobre fundo passa por `npm run check:contrast` antes de entrar: 4.5:1 para texto
corrido, 3:1 para componente de interface. A story `Foundation/Colors` mostra a mesma tabela dentro do
Storybook, para ninguém precisar rodar script para ver.

| | Claro | Escuro |
|---|---|---|
| Fundo da página | `#F5F5F7` | `#121216` |
| Superfície | `#FFFFFF` | `#1A1A20` |
| Menor razão medida | 5,00:1 | 5,89:1 |

**O escuro não é `#000000`.** Preto puro causa halação em tela OLED, cansa a vista e destrói a
percepção de elevação, porque não sobra para onde escurecer. As cores de destaque do tema escuro são
mais claras e menos saturadas que as do claro: cor saturada sobre fundo escuro vibra.

**A hierarquia vem do contraste entre superfícies, não de sombra pesada.** No escuro, elevação é
clarear (`surfaceVariant`), não escurecer em volta.

---

## 🌐 Idioma: inglês na API, português no comentário

É a convenção do repositório inteiro, a mesma do `sso-client`. Prop, evento, tipo e título de story
em **inglês**; comentário e docstring em **português**, porque explicam decisão para quem mantém. O
texto que aparece na tela não é escrito em língua nenhuma dentro do componente: vem da tradução.

## 🗣️ Texto de tela em três línguas

Os componentes falam `en`, `es` e `pt-BR`, cada língua um JSON em `src/i18n/locales/`, e seguem a
língua corrente da aplicação.

**A aplicação traduz com vue-i18n; a biblioteca, com os próprios JSON.** Os textos dos componentes
não entram no vue-i18n da aplicação: `useDotlogText` lê a língua corrente pelo `useLocale()` do
Vuetify e resolve no catálogo daqui. Quem consome não registra, não mescla e não conhece estas
chaves. Língua que a aplicação tem e a biblioteca não tem cai no inglês, só nos componentes.

**Uma língua só para os três.** A aplicação cria o vue-i18n dela e passa ao Vuetify por
`createDotlogLocale({ i18n, useI18n })`, que:

- liga o Vuetify ao vue-i18n pelo adaptador oficial, então trocar `i18n.global.locale` troca tudo;
- põe em cada língua registrada os textos internos do Vuetify (`$vuetify`), senão o vue-i18n
  mostraria a chave crua num seletor vazio. O que a aplicação declarar em `$vuetify` prevalece;
- mantém `<html lang>` igual à língua, para o leitor de tela pronunciar certo.

**A língua inicial** sai de `preferredLocale`: a escolha guardada neste navegador (`dl.locale`), senão
as línguas do navegador, senão a de reserva. Quem pede `pt-PT` recebe `pt-BR` antes de inglês. O
armazenamento é lido de forma síncrona, pelo mesmo motivo do tema.

**O menu do usuário lista o que a aplicação registrou.** `useLanguages` lê as línguas das mensagens
do Vuetify; `DlUserMenu` mostra cada uma com o nome nela mesma (`Intl.DisplayNames`) e a bandeira do
país que o código completa (`Intl.Locale.maximize`: `en` vira Estados Unidos). Língua nova na
aplicação é só um JSON. Com uma língua só, a seção some.

**Bandeira em SVG, não emoji.** O Windows não desenha emoji de bandeira e mostra as duas letras.
`DlFlag` tem Brasil, Estados Unidos e Espanha; país sem desenho aparece como o código dele. Bandeira
usa as cores oficiais, a única exceção à regra de não escrever hex.

**O formato é o do vue-i18n**, para os JSON dos dois lados serem escritos igual: `{nome}` é parâmetro,
`a | b` é plural por `count`, e `@` literal precisa ser `{'@'}`. A biblioteca implementa o subconjunto
em `format.ts`; `check:locales` compila cada mensagem com o compilador do vue-i18n de verdade.

**Frase com marcação dentro** (`Para confirmar, digite <code>X</code>`) usa `splitAround`: divide a
frase traduzida no ponto do parâmetro, e a ordem das palavras fica com cada língua.

Língua nova nos componentes é um JSON com as mesmas chaves do `en.json`, registrado em `catalog.ts`.
O TypeScript recusa chave faltando; `npm run check:locales` recusa chave sobrando, parâmetro diferente
e plural com outro número de formas. O workflow de publicação roda os dois.

---

## 🎨 A coluna de situação

`DlStatusChip` compõe **três intensidades da mesma cor**:

| Camada | Intensidade | Papel |
|---|---|---|
| texto e ícone | cor cheia | o que informa |
| borda | 42% | delimita, e sobrevive a linha com hover ou zebra |
| fundo | 12% | agrupa, sem competir com o texto |

A borda não é enfeite: dentro da tabela a linha muda de fundo no hover, e uma pastilha só com
preenchimento fraco some nesse momento.

Os tons pedidos, já conferidos na composição acima:

| Situação | Tom | Claro | Escuro |
|---|---|---|---|
| `AVAILABLE` | `success` | verde | verde claro |
| `LEASED` | `info` | azul | azul claro |
| `MAINTENANCE` | `warning` | âmbar | âmbar claro |
| `RETIRED` | `dark` | quase preto | quase branco |
| `STOLEN` | `error` | vermelho | vermelho claro |

⚠️ **`dark` não é `#000000`.** Ele resolve para `on-surface`, então inverte com o tema. Preto fixo
desapareceria no tema escuro, e é justamente o estado arquivado que precisa continuar legível para
não ser confundido com célula vazia.

O `warning` do tema claro teve de escurecer de `#9A6400` para `#8F5D00`: no fundo tonal a 12% ele
dava 4,26:1, abaixo do mínimo.

---

## 🧩 Decisões que valem lembrar

**Cor nunca vai sozinha.** Pastilha de situação sempre carrega texto. Quem não distingue vermelho de
verde ficaria sem informação num sistema que só muda a cor.

**Esconder, e não desabilitar.** Ação que a pessoa nunca poderá exercer sai do DOM. Botão apagado
comunica "você poderia, mas não agora", que é mentira quando o papel dela simplesmente não inclui
aquilo. Desabilitado fica reservado para bloqueio temporário: registro em outro estado, formulário
incompleto, operação em andamento. Ver `DlDataTable` e `DlPageHeader`.

**A tabela não conhece domínio nenhum.** `columns`, `rows` e `actions` chegam por prop. O KRLoc passa
código, equipamento e diária; o SSO passa projeto, clientId e usuários; a próxima aplicação passa o
que for dela. A célula sai de `column.key`, de `column.format`, ou do slot `col-<key>` quando precisa
de componente, que é como a pastilha de situação entra sem a tabela saber o que é `AVAILABLE`. As
duas primeiras stories de `Data/Table` mostram os dois conjuntos, sem um único campo em comum.

**Tabela vira cartão no telefone.** Abaixo de 840px, `DlDataTable` troca a grade por lista. Tabela
com rolagem horizontal esconde justamente a coluna que importa e faz a pessoa arrastar procurando.

**Paginação cega, porque o backend é cego.** As APIs do ecossistema não devolvem total de registros
e respondem 404 para listagem vazia. A tabela avança enquanto vier página cheia e para quando vier
curta, sem inventar um número de páginas. Tabela curta e completa, como a de dentro de uma ficha,
desliga a barra com `:paged="false"`.

**O menu vem do backend.** `DlNavDrawer` recebe grupos e itens e desenha; ele não conhece
"equipamento" nem "projeto". É isso que permite o mesmo componente servir as duas aplicações. Grupo
que ficou sem item some junto com o título: cabeçalho de seção vazia promete algo que não vem.

**Tema com três estados.** `light`, `dark` e `system`, e `system` é o padrão, acompanhando o sistema
operacional em tempo real. Guardar "seguir o sistema" como estado próprio, em vez de resolver na
hora de salvar, é o que permite continuar acompanhando depois.

**O `localStorage` é lido de forma síncrona no boot**, antes de qualquer requisição. Sem isso a
página pinta clara e troca para escura quando a resposta do backend chega, e esse piscar branco é
exatamente o que incomoda quem escolheu o tema escuro. O backend é a verdade entre dispositivos e
reconcilia depois, por `hydrate()`.

---

## 🔁 Tela derivada da API, não escrita por projeto

Uma tabela por aplicação não escala. Estes algoritmos existem para que uma aplicação nova ganhe tela
funcionando sem declarar coluna, item de menu nem hierarquia de rota.

### Colunas, a partir da resposta

`inferColumns(rows)` olha uma amostra das linhas, não a primeira: um `null` no primeiro registro
apagaria a coluna inteira.

| Sinal na amostra | Vira |
|---|---|
| só números | alinhado à direita, monoespaçado, com separador de milhar |
| `true` / `false` | Yes / No |
| data ISO | data formatada |
| UUID ou hex longo | monoespaçado e **secundário**, some primeiro |
| objeto ou lista | ignorado, não cabe numa célula |

⚠️ **Isto tem um custo:** a tela passa a mudar quando a API muda. Um campo novo no serializador vira
coluna sem ninguém pedir, e um campo interno que vaze aparece na tela. Por isso existem `omit`,
`only` e `max`.

A humanização erra às vezes: `p_diary` vira "P diary". `overrides` conserta **uma chave**, sem
declarar as outras, o que continua sendo muito menos que manter a lista toda.

### Menu, a partir das rotas

`deriveNavGroups(permissions)` usa o que o SSO já persiste. Uma rota vira item quando é **`GET`**,
**sem parâmetro** e **de um segmento só**:

- **`GET`**, porque item de menu leva a uma listagem. `POST /equipment` é a ação de criar, que mora
  no cabeçalho da tela.
- **Sem parâmetro**, porque não há `id` no momento do clique. `/accessory/:id` continua existindo e
  sendo verificada pela permissão; ela só não é destino.
- **Um segmento**, porque `/project/:id/overview` é tela de dentro de um registro.

No exemplo do KRLoc, dezesseis rotas entram e cinco itens saem. O que for elegível e mesmo assim não
deva ser destino sai com `overrides: { '/route': { hidden: true } }`.

**O que a rota não tem:** ícone, ordem e agrupamento. Nenhum dos três está no banco. O padrão é
ícone neutro e ordem alfabética, que já funciona, e `overrides` ajusta o resto.

O plural é palpite e tem lista de incontáveis, senão `/equipment` viraria "Equipments", que não é
palavra e é um dos caminhos mais usados aqui.

### Árvore, a partir do catálogo de rotas

`buildRouteTree(routes)` transforma o catálogo plano do SSO na árvore que `DlRouteTree` desenha. Com
dez rotas uma lista resolve; com trezentas a pessoa não procura um texto, procura um lugar.

- **Um nó por caminho, não por rota.** `GET` e `DELETE /equipment/:id` são duas linhas no banco e o
  mesmo endereço; os métodos vão juntos no nó.
- **O pai é o prefixo por segmento.** `/equipment/:id/create` mora em `/equipment/:id`, que mora em
  `/equipment`. Segmento é texto, não padrão: `:id` e `:projectId` no mesmo nível são irmãos.
- **Prefixo sem rota vira grupo só quando agrupa.** `/generate` junta `contract/:id` e `closure/:id`.
  Prefixo com um filho só some e o filho sobe, a compressão de uma árvore radix; senão `/api/v1/foo`
  seriam três cliques de nada.
- **Fixo antes de parâmetro**, como o roteador decide: `/elease/start/:id` vem antes de `/elease/:id`.
- **O filtro mantém o caminho até o resultado.** Os ancestrais ficam, apagados, e abrem sozinhos
  enquanto o filtro existir. Resultado solto não diz onde está.

---

## 📈 Gráficos

A paleta de **séries** é separada da paleta de **estado**. Verde de sucesso nunca vira "série 3":
cor reservada numa barra qualquer faz um dado comum parecer alerta.

Os oito slots foram validados contra as nossas duas superfícies: banda de luminosidade, piso de
croma, separação para daltonismo (pior par adjacente ΔE 9,1) e piso de visão normal (ΔE 19,6).

⚠️ **No tema claro, três tons ficam abaixo de 3:1 contra o branco.** A regra de alívio se aplica e
não é dispensável: todo gráfico traz **rótulo direto** e **visão de tabela**. É por isso que o botão
de tabela do `DlChartFrame` não é opcional.

Regras que não se negociam, e que os componentes impõem por construção:

- **Slot fixo por entidade, nunca ciclado.** Filtrar uma série não repinta as que sobraram, porque
  quem desenha passa o índice da entidade, não a posição na lista filtrada. Acima de oito, agrupe.
- **Uma escala só.** Não existe opção de eixo duplo. Duas medidas de grandeza diferente viram dois
  gráficos, ou vão indexadas a uma base comum, como na story `Lines`.
- **Zero é o começo da barra**, sempre. Barra cortada mente sobre proporção.
- **Área só com uma série.** Duas áreas soltas se cobrem e a de baixo fica ilegível.
- **Texto usa tinta de texto**, nunca a cor da série. A marca ao lado é que carrega identidade.
- **Legenda sempre que houver duas séries ou mais.** Com uma, o título já diz o que é.

---

## 🔔 Avisos, modais e carregamento

**Erro não some sozinho.** Sucesso pode: a pessoa acabou de agir e já viu o resultado. Um aviso de
falha que sai antes de ser lido é pior que nenhum. Passar o mouse ou dar foco pausa a contagem.

**Duas regiões vivas.** Erro entra em `role="alert"`, que o leitor de tela interrompe para anunciar;
o resto entra em `role="status"`, que espera. Jogar tudo em `alert` faz o leitor cortar a pessoa no
meio de uma frase para dizer "salvo com sucesso", e aí ela desliga o som.

**Falha ao salvar não vira toast.** Ela aparece dentro do modal, ao lado do que causou o problema, e
o modal não fecha. Toast é para o que já terminou.

**Nada de indicador antes de ~220ms.** Um piscar de indicador numa resposta de 100ms lê como
defeito, não como progresso. O botão já trava desde o primeiro instante, o que é o que impede duplo
clique virar dois cadastros, mas o giro só aparece se a espera for real.

**O botão não muda de largura ao carregar.** O rótulo continua sustentando a caixa, invisível. Sem
isso os vizinhos andam e o cursor fica sobre outra coisa no instante em que a pessoa pode clicar.

**Esqueleto, não giro, para conteúdo.** Um giro diz "espere"; um esqueleto diz "vai aparecer aqui,
com esta forma", e quando o dado chega nada salta.

Três formas de carregamento de tela, para três situações: `bar` para navegação, que não bloqueia;
`inline` para um pedaço da tela; `overlay` só para o que não pode ser interrompido.

---

## 🧱 Peças de tela inteira

Vieram com o console do SSO e servem a qualquer front do ecossistema.

| Componente | Para quê | Decisão que vale lembrar |
|---|---|---|
| `DlAppShell` | menu lateral, barra superior e conteúdo | largura máxima no conteúdo, link de pular para o conteúdo, barra de carregamento única |
| `DlUserMenu` | quem entrou, tema, língua e saída | tema em três escolhas; línguas as que a aplicação registrou, com nome e bandeira; sair por último e em vermelho; iniciais, sem foto do provedor |
| `DlFlag` | bandeira de país | SVG, não emoji; decorativa, com o nome sempre ao lado; país sem desenho vira o código |
| `DlSignIn` | a tela de login do IdP | só oferece provedor com pedido pendente; diz a aplicação; erro por código, nunca texto da URL |
| `DlSecretDialog` | segredo mostrado uma vez | mascarado por padrão; copiar sem revelar; fechar exige confirmar que guardou |
| `DlTabs` | abas de tela de detalhe | aba sem permissão some, e a selecionada cai para a primeira visível |
| `DlSectionCard` · `DlDescriptionList` | ficha de registro | heading de verdade; `<dl>`; copiar ao lado do valor; slot `title` para título com forma própria |
| `DlStatCard` · `DlEmptyState` | painel e estados vazios | o número conta até o valor sem o leitor de tela assistir; o tom muda o ícone, não a página |
| `DlRouteTree` | catálogo de rotas em árvore | tudo clicável; teclado do padrão `tree`; um item só no Tab; só abrir e fechar anima |
| `DlRoutePath` | um caminho de rota | trecho herdado do pai apagado; parâmetro com cor própria; busca marcada mesmo atravessando `/` |
| `DlMasterDetail` | lista e detalhe na mesma tela | lado a lado com largura, um de cada vez sem; decide pela largura do componente, não da janela |

### Formulário e fluxo

Vieram com o front do KRLoc, e também não conhecem domínio nenhum.

| Componente | Para quê | Decisão que vale lembrar |
|---|---|---|
| `DlFileDrop` | um arquivo para enviar, como planilha de importação | arrastar e procurar na mesma frase; tipo e tamanho conferidos antes do envio; extensão vale tanto quanto o MIME; um arquivo por vez; erro do servidor vence |
| `DlMoneyField` | valor em dinheiro | separadores da língua da tela, moeda do negócio (`currency` obrigatório); formata ao sair do campo; sai número ou `null` |
| `DlLifecycle` | onde um registro está no ciclo de vida | `<ol>` com `aria-current="step"`; saída não é etapa, e o que ela pulou fica tracejado; vira coluna pela largura do próprio componente |

**`DlFileDrop` por dentro.** O `<input type="file">` fica escondido e só abre a janela do sistema; o
foco é do botão dentro da frase, que volta a receber o foco quando o arquivo é removido. `dragenter` e
`dragleave` disparam também nos filhos da área, então o destaque conta entradas e saídas. O `dragover`
sempre chama `preventDefault`, mesmo travado: sem isso o navegador abre o arquivo solto e a tela se
perde.

**`DlMoneyField` por dentro.** Os separadores, o símbolo e as casas saem de `formatToParts` na língua
corrente. Sem o separador decimal da língua no texto, o outro sinal seguido de uma ou duas casas no fim
é decimal ("12.50" colado numa tela em português); com três casas, é milhar. Um `type="number"` perderia
o valor de quem digita vírgula.

⚠️ **`DlLifecycle` usa container query.** A regra `@container` só alcança os descendentes do container,
então o `container-type` fica numa `<div>` em volta da `<ol>`: na própria lista ele não faria nada.

`permits(permissions, method, path)` é a mesma pergunta de `usePermissions().can`, para guard de rota
e store, que rodam fora de componente. `httpMethodStatus` dá a pastilha de método HTTP.
`DlConfirmDialog` aceita `error`, pela mesma regra do formulário: falha aparece dentro do modal.

**`DlRouteTree` por dentro.** É lista plana com `aria-level`, `aria-setsize` e `aria-posinset`, que a
especificação aceita, e é o que deixa as linhas entrarem e saírem sem aninhar grupo em grupo. A linha
seleciona e abre; a seta só abre e fecha. Com `selectable` desligado e `hide-methods`, o slot
`node-end` desenha controles próprios, como as caixas de permissão de um papel. Recebe `routes` planas
ou `nodes` já montados, para desenhar só o que fica abaixo de um nó.

**`DlMasterDetail` por dentro.** Com largura, o detalhe acompanha a rolagem e rola por dentro quando é
mais alto que a janela. Estreito, o detalhe toma o lugar da lista com um "voltar", o foco vai para ele,
e ao voltar retorna à linha de onde saiu, com a rolagem onde estava.

---

## 🚨 Armadilhas já pagas

⚠️ **Não desligue `utilities` no Vuetify.** Desligar parece razoável quando a aplicação usa Tailwind,
e quebra o framework inteiro: as classes geradas (`text-success`, `bg-primary`) são o mecanismo que
aplica a prop `color` de **qualquer** componente do Vuetify. Sem elas, o componente recebe a classe,
a variável do tema existe, e nada acontece. Chip de erro sai cinza, botão destrutivo sai neutro, e o
sintoma não aponta para a causa. A sobreposição real com o Tailwind é pequena.

⚠️ **`vite-plugin-vuetify` 2.1.3 quebra com Vite 8 dentro do Storybook.** No `configResolved` ele
procura o plugin do Vue pelos nomes `vite:vue` e `unplugin-vue`, não acha, e faz
`config.plugins[-1].api`. O erro que aparece é um `Cannot read properties of undefined (reading 'api')`
longe da causa. O Storybook aqui não usa o plugin: `preview.ts` registra todos os componentes de uma
vez. No build do pacote ele funciona, porque o plugin do Vue vem antes dele na mesma lista.

⚠️ **`@storybook/vue3-vite` 10.6 não injeta o plugin do Vue com Vite 8.** Sem ele, todo `.vue` cai no
parser de JavaScript e o erro é um `Unexpected JSX expression` apontando para a linha 1 do
`<script setup>`. O `.storybook/main.ts` adiciona o plugin à mão, conferindo antes se já está lá.

⚠️ **A config do pacote não pode se chamar `vite.config.ts`.** O Storybook carrega sozinho o
`vite.config.*` da raiz e mescla com o dele; um `build.lib` mesclado ali transformaria o
`build-storybook` em build de pacote. Por isso `vite.lib.config.ts` e `--config` no script.

⚠️ **Dezenas de linhas saindo juntas se amontoam.** A transição de lista do Vue tira do fluxo quem sai
(`position: absolute`), e com o filtro trocando trinta linhas de uma vez todas empilham no topo antes
de sumir. O `DlRouteTree` só anima abrir e fechar um ramo; no resto, `css` desligado troca na hora,
sem nem esperar o próximo quadro, que numa aba em segundo plano não chega.

⚠️ **O id da story vem do nome do export, não do `name`.** `export const Range` com
`name: 'Numeric range'` vira `form-controls--range`. Para descobrir o id real:
`curl -s localhost:6007/index.json`.

⚠️ **`<figcaption>` só pode ser filho direto de `<figure>`**, como primeiro ou último. Dentro de um
`<header>` ou `<div>` ele para de nomear a figura e o Vite avisa no build. O `DlChartFrame` usa grade
na própria `<figure>` para deixar legenda e botão lado a lado sem embrulho. E o botão de tabela fica
**fora** do `<figcaption>`, senão o rótulo dele entra no nome acessível do gráfico.

⚠️ **Componente que troca de forma em tempo de execução importa o componente do Vuetify.**
`<component :is="'VSelect'">` só resolve com o Vuetify registrado globalmente, como no Storybook. O
auto-import do build só enxerga tag estática, e o campo sumiria sem erro. Por isso `DlSelect` e
`DlTextField` importam de `vuetify/components`.

⚠️ **`DlSelect` devolve `unknown`.** O valor segue `itemValue`, que o TypeScript não acompanha: com
opções `{ title, value }`, o que volta é o `value`, não o objeto. Converter na borda é mais honesto do
que declarar `T`.

⚠️ **`npm install --prefix ui` a partir da raiz instala a raiz como dependência.** O npm tratou a
pasta de onde foi chamado como pacote a instalar, gravou `"rent-dashboard": "file:.."` no
`package.json` e criou uma junção em `node_modules` apontando para a pasta de cima. Instale sempre de
dentro da pasta do projeto. `npm run <script> --prefix` não tem o problema.

⚠️ **Nada exportado pelo `index.ts` pode vir de `i18n/catalog.ts`.** A declaração dele importa
`./locales/en.json`, e o `vue-tsc` não copia JSON para o `dist`: a aplicação receberia um `.d.ts`
apontando para um arquivo que não existe. Por isso a lista de línguas da biblioteca não é exportada.

⚠️ **`@` solto numa tradução quebra no vue-i18n.** Ele lê `@` como início de mensagem ligada, e
`marina@example.com` não compila. Escreva `marina{'@'}example.com`. O `check:locales` pega.

Para varrer todo aviso de aninhamento de uma vez:
`npm run build-storybook 2>&1 | grep -i "cannot be child"`.

---

## 📁 Estrutura

```bash
.github/workflows/     # publicação no GitHub Packages a cada tag v*
vite.lib.config.ts     # build do pacote. Não é vite.config.ts de propósito
tsconfig.build.json    # declarações .d.ts, sem stories nem mocks
src/
├─ theme/
│  ├─ tokens.ts        # cor, espaçamento, raio, tipografia, movimento
│  ├─ vuetify.ts       # ponte para o Vuetify + variáveis CSS `--dl-*`
│  ├─ useTheme.ts      # preferência por usuário, três estados, duas fontes
│  └─ Colors.stories.ts # paleta e tabela de contraste
├─ access/
│  └─ usePermissions.ts # `can('POST', '/equipment')`, mesmo matcher do servidor
├─ i18n/
│  ├─ locales/         # en.json, es.json, pt-BR.json: os textos dos componentes
│  ├─ catalog.ts       # resolve a chave na língua corrente, com o inglês de reserva
│  ├─ format.ts        # {parâmetro} e plural, o subconjunto do vue-i18n
│  ├─ languages.ts     # língua inicial, correspondência, nome e país de cada língua
│  ├─ useLanguages.ts  # as línguas registradas e a troca, para o menu do usuário
│  └─ createDotlogLocale.ts # liga Vuetify, biblioteca e vue-i18n da aplicação à mesma língua
├─ mocks/              # dados e traduções de exemplo das stories. Nada vai para o pacote
├─ data/               # inferência de coluna, derivação de menu, árvore de rotas
├─ feedback/           # toast (estado em módulo, sem Pinia) + host
├─ charts/             # paleta validada, moldura, barra, rosca, área
└─ components/         # Dl*.vue + Dl*.stories.ts
```

---

## ✅ Invariantes ao alterar

- Componente não escreve hex. Escreve token. A exceção é `DlFlag`: bandeira tem cor oficial.
- API em inglês, comentário em português.
- Texto de tela não nasce no componente. Vai para `src/i18n/locales/`, nas três línguas, e sai por
  `useDotlogText`. Prop de rótulo tem padrão `undefined` e cai na tradução.
- Mexeu numa tradução, rode `npm run check:locales`.
- Story usa dado de `src/mocks/`, nunca dado real nem `Lorem ipsum`. Conteúdo plausível é o que
  revela coluna que estoura e pastilha que quebra em duas linhas.
- Todo componente novo nasce com story nos **dois** temas. A barra do Storybook troca sem sair da
  página, e é assim que se pega o par que passa no claro e some no escuro.
- Ação gated por permissão sai do DOM, não fica desabilitada.
- Nada aqui importa de `sso/`, `krloc/` ou `sso_plataforma/`, e nenhum deles importa daqui por caminho.
  O pacote é folha, e a única porta é o npm.
- Export novo entra em `src/index.ts`. O que não está lá não é contrato.
- Story e mock nunca entram no pacote.
- Mudou a API pública, sobe a versão pela regra de `patch`, `minor` e `major` acima.
- Mexeu na paleta, rode `npm run check:contrast` antes de commitar.
- Paleta de série nunca usa cor de estado, e vice-versa.
- Gráfico novo nasce com rótulo direto e visão de tabela. Não é enfeite: é a regra de alívio do
  aviso de contraste do tema claro.
- Toda animação tem contrapartida em `prefers-reduced-motion`. O estado fica, o movimento sai.
- Tela nova não declara coluna nem item de menu à mão. Deriva, e conserta por `overrides` só o que
  o palpite errar.
- Dinheiro entra por `DlMoneyField`, nunca por `type="number"`, que só entende ponto decimal.
