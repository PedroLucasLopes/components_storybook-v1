<script setup lang="ts" generic="Entry extends RouteTreeEntry">
/**
 * Catálogo de rotas como árvore: o caminho base é o pai, e o que começa com
 * ele mora dentro.
 *
 * ## Por que árvore, e não tabela com filtro
 *
 * Tabela resolve dez rotas. Com trezentas, a pessoa não procura um texto, ela
 * procura um lugar: "o que existe debaixo de `/elease`". A árvore responde isso
 * sem digitar, e o filtro continua existindo para quem já sabe o nome.
 *
 * ## Tudo é clicável
 *
 * Clicar na linha seleciona, e abre o nó se ele estava fechado. A seta só abre
 * e fecha, sem mudar a seleção, para quem quer espiar o que tem dentro. Grupo
 * também seleciona: ele não é rota, mas o detalhe dele diz o que junta. Com
 * `selectable` desligado, a linha inteira só abre e fecha.
 *
 * ## Teclado como numa árvore de arquivos
 *
 * O padrão da WAI-ARIA para `tree`: setas sobem e descem, direita abre ou
 * entra, esquerda fecha ou volta ao pai, Home e End vão às pontas, Enter e
 * Espaço ativam. Só um item fica no Tab, então Tab sai da árvore em vez de
 * atravessar trezentas linhas.
 *
 * ## Filtro mostra o caminho até o resultado
 *
 * Resultado solto não diz onde está. Os ancestrais ficam, apagados, e tudo o
 * que leva a um resultado abre sozinho enquanto o filtro existir. Ao limpar, a
 * árvore volta a abrir o que a pessoa tinha aberto.
 *
 * ## Só abrir e fechar anima
 *
 * As linhas de um ramo entram descendo do pai e saem recolhendo nele. Filtro,
 * expandir tudo e dado novo trocam seco: dezenas de linhas saindo juntas se
 * amontoam antes de sumir, e movimento que não ajuda a acompanhar é ruído.
 *
 * ## Linhas planas, com nível declarado
 *
 * A árvore é desenhada como lista plana com `aria-level`, `aria-setsize` e
 * `aria-posinset`, que a especificação aceita. É o que deixa as linhas
 * entrarem e saírem com animação sem aninhar um grupo dentro do outro.
 */
import { computed, nextTick, ref, watch } from 'vue';
import { httpMethodStatus } from '../data/httpMethods';
import { useDotlogText } from '../i18n/useDotlogText';
import {
  buildRouteTree,
  countRouteNodes,
  filterRouteTree,
  routeAncestorKeys,
  routeBranchKeys,
  type RouteTreeEntry,
  type RouteTreeNode,
} from '../data/routeTree';
import DlRoutePath from './DlRoutePath.vue';
import DlStatusChip, { type StatusDefinition } from './DlStatusChip.vue';

const props = withDefaults(
  defineProps<{
    /** Rotas no formato plano do catálogo. Ignorado quando há `nodes`. */
    routes?: readonly Entry[];
    /** Árvore já montada, para desenhar um pedaço dela: o que fica abaixo de um nó. */
    nodes?: readonly RouteTreeNode<Entry>[];
    /** Trecho do caminho a procurar. */
    query?: string;
    /** Métodos a mostrar. Vazio mostra todos. */
    methods?: readonly string[];
    /** Clique seleciona. Desligado, a linha só abre e fecha. */
    selectable?: boolean;
    /** Esconde as pastilhas de método, para quem desenha as próprias em `node-end`. */
    hideMethods?: boolean;
    loading?: boolean;
    /** Nome da árvore para o leitor de tela. */
    label?: string;
    /** Aparência dos métodos. */
    methodMap?: Record<string, StatusDefinition>;
    /** Até esta quantidade de caminhos a árvore nasce aberta; acima, fechada. */
    openLimit?: number;
    emptyTitle?: string;
    emptyDescription?: string;
  }>(),
  {
    routes: () => [],
    nodes: undefined,
    query: '',
    methods: () => [],
    selectable: true,
    hideMethods: false,
    loading: false,
    label: undefined,
    methodMap: () => httpMethodStatus,
    openLimit: 40,
    emptyTitle: undefined,
    emptyDescription: undefined,
  },
);

const { t } = useDotlogText();

/** Chave do nó selecionado, que é o caminho normalizado. */
const selected = defineModel<string | null>('selected', { default: null });

/** Chaves dos nós abertos. Sem `v-model`, a árvore guarda sozinha. */
const expanded = defineModel<string[] | undefined>('expanded', { default: undefined });

const emit = defineEmits<{ select: [node: RouteTreeNode<Entry>] }>();

defineSlots<{
  empty?: () => unknown;
  'node-end'?: (scope: { node: RouteTreeNode<Entry>; selected: boolean }) => unknown;
}>();

const INDENT = 24;
const SKELETON = [0, 1, 1, 2, 0, 1];

const tree = computed<readonly RouteTreeNode<Entry>[]>(() => props.nodes ?? buildRouteTree(props.routes));

const filtering = computed(() => props.query.trim() !== '' || props.methods.length > 0);

const filtered = computed(() =>
  filtering.value ? filterRouteTree(tree.value, { query: props.query, methods: props.methods }) : null,
);

const visibleTree = computed(() => filtered.value?.nodes ?? tree.value);

/** Liga a transição das linhas. Só um abrir ou fechar pedido pela pessoa liga. */
const animated = ref(false);

/* Até `openLimit` caminhos a árvore nasce aberta: cabe na tela e mostra a
   hierarquia de uma vez. Acima disso nasce fechada, e cada ramo abre quando
   pedem. Decide uma vez só, para uma rota nova não fechar tudo de repente. */
watch(
  tree,
  (nodes) => {
    animated.value = false;

    if (expanded.value !== undefined || nodes.length === 0) return;

    expanded.value = countRouteNodes(nodes) <= props.openLimit ? routeBranchKeys(nodes) : [];
  },
  { immediate: true },
);

/* Durante o filtro tudo abre; o que a pessoa fechar ali fica só nesta busca. */
const filterClosed = ref<Set<string>>(new Set());

watch(
  () => `${props.query}|${props.methods.join(',')}`,
  () => {
    animated.value = false;
    filterClosed.value = new Set();
  },
);

const openKeys = computed(() => new Set(expanded.value ?? []));

const isOpen = (key: string): boolean =>
  filtering.value ? !filterClosed.value.has(key) : openKeys.value.has(key);

interface Row {
  node: RouteTreeNode<Entry>;
  level: number;
  setSize: number;
  position: number;
  parent: string | null;
  /** Por nível acima do pai: se a linha vertical daquele ancestral continua. */
  guides: boolean[];
  last: boolean;
  open: boolean;
  /** Só está aqui como caminho até um resultado do filtro. */
  context: boolean;
  warnings: string[];
}

const rows = computed<Row[]>(() => {
  const result: Row[] = [];
  const matches = filtered.value?.matches;

  const walk = (
    list: readonly RouteTreeNode<Entry>[],
    level: number,
    parent: string | null,
    guides: boolean[],
  ): void => {
    list.forEach((node, index) => {
      const last = index === list.length - 1;
      const open = node.children.length > 0 && isOpen(node.key);

      result.push({
        node,
        level,
        setSize: list.length,
        position: index + 1,
        parent,
        guides,
        last,
        open,
        context: !!matches && !matches.has(node.key),
        warnings: node.routes
          .filter((route) => route.warning)
          .map((route) => `${route.method.toUpperCase()}: ${route.warning}`),
      });

      if (open) walk(node.children, level + 1, node.key, level === 1 ? [] : [...guides, !last]);
    });
  };

  walk(visibleTree.value, 1, null, []);

  return result;
});

const summary = computed(() => {
  const count = filtered.value?.matches.size;

  if (count === undefined) return '';
  if (count === 0) return t('routeTree.noMatch');

  return t('routeTree.matches', { count });
});

const describe = (row: Row): string => {
  const { node } = row;
  const parts = [
    node.key,
    node.group ? t('routeTree.groupDescription') : node.routes.map((route) => route.method.toUpperCase()).join(', '),
  ];

  if (node.descendants > 0) parts.push(t('routeTree.below', { count: node.descendants }));

  return [...parts, ...row.warnings].join(', ');
};

/* ------------------------------ foco ------------------------------ */

const focusKey = ref<string | null>(null);
const elements = new Map<string, HTMLElement>();

const bindRow = (key: string, element: unknown): void => {
  if (element instanceof HTMLElement) elements.set(key, element);
  else elements.delete(key);
};

/** Um item só no Tab: o que teve foco, senão o selecionado, senão o primeiro. */
const tabKey = computed(() => {
  const keys = new Set(rows.value.map((row) => row.node.key));

  if (focusKey.value && keys.has(focusKey.value)) return focusKey.value;
  if (selected.value && keys.has(selected.value)) return selected.value;

  return rows.value[0]?.node.key ?? null;
});

const focusRow = (key: string): void => {
  focusKey.value = key;
  void nextTick(() => elements.get(key)?.focus());
};

/* ----------------------------- ações ------------------------------ */

const toggle = (node: RouteTreeNode<Entry>, open = !isOpen(node.key)): void => {
  if (node.children.length === 0) return;

  animated.value = true;

  if (filtering.value) {
    const closed = new Set(filterClosed.value);

    if (open) closed.delete(node.key);
    else closed.add(node.key);

    filterClosed.value = closed;
    return;
  }

  const keys = new Set(expanded.value ?? []);

  if (open) keys.add(node.key);
  else keys.delete(node.key);

  expanded.value = [...keys];
};

const activate = (row: Row): void => {
  focusKey.value = row.node.key;

  if (!props.selectable) {
    toggle(row.node);
    return;
  }

  if (row.node.children.length > 0 && !row.open) toggle(row.node, true);

  selected.value = row.node.key;
  emit('select', row.node);
};

const onKeydown = (event: KeyboardEvent, row: Row): void => {
  // Controle dentro da linha, como a caixa de marcar, cuida do próprio teclado.
  if (event.target !== event.currentTarget) return;

  const list = rows.value;
  const index = list.findIndex((item) => item.node.key === row.node.key);
  const go = (target: Row | undefined): void => {
    if (target) focusRow(target.node.key);
  };

  switch (event.key) {
    case 'ArrowDown':
      go(list[index + 1]);
      break;
    case 'ArrowUp':
      go(list[index - 1]);
      break;
    case 'Home':
      go(list[0]);
      break;
    case 'End':
      go(list[list.length - 1]);
      break;
    case 'ArrowRight':
      if (row.node.children.length === 0) return;
      if (row.open) go(list[index + 1]);
      else toggle(row.node, true);
      break;
    case 'ArrowLeft':
      if (row.open) toggle(row.node, false);
      else if (row.parent) focusRow(row.parent);
      else return;
      break;
    case 'Enter':
    case ' ':
      activate(row);
      break;
    default:
      return;
  }

  event.preventDefault();
};

/* Seleção vinda de fora, como link direto ou clique no detalhe: os ancestrais
   abrem, senão a linha selecionada ficaria escondida dentro de um ramo fechado. */
watch(
  [selected, tree],
  ([key, nodes]) => {
    if (!key || filtering.value) return;

    const current = new Set(expanded.value ?? []);
    const missing = routeAncestorKeys(nodes, key).filter((ancestor) => !current.has(ancestor));

    if (missing.length === 0) return;

    animated.value = false;
    expanded.value = [...current, ...missing];
  },
  { immediate: true },
);

/* Só quando a seleção muda, não quando a árvore relê: uma gravação no detalhe
   não pode arrastar a página de volta para a linha. */
watch(
  selected,
  (key) => {
    if (!key) return;

    void nextTick(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      elements.get(key)?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    });
  },
  { immediate: true },
);

defineExpose({
  expandAll: (): void => {
    animated.value = false;

    if (filtering.value) filterClosed.value = new Set();
    else expanded.value = routeBranchKeys(tree.value);
  },
  collapseAll: (): void => {
    animated.value = false;

    if (filtering.value) filterClosed.value = new Set(routeBranchKeys(visibleTree.value));
    else expanded.value = [];
  },
});
</script>

<template>
  <div class="dl-rtree">
    <p class="dl-rtree__sr" role="status" aria-live="polite">{{ summary }}</p>

    <div v-if="loading" class="dl-rtree__skeleton" aria-hidden="true">
      <span
        v-for="(depth, index) in SKELETON"
        :key="index"
        class="dl-rtree__skeleton-row"
        :style="{ marginLeft: `${depth * INDENT}px` }"
      />
    </div>

    <template v-else-if="tree.length === 0">
      <slot name="empty">
        <div class="dl-rtree__empty">
          <VIcon icon="mdi-sitemap-outline" size="28" class="dl-rtree__empty-icon" />
          <p class="dl-rtree__empty-title">{{ emptyTitle ?? t('routeTree.emptyTitle') }}</p>
          <p class="dl-rtree__empty-text">{{ emptyDescription ?? t('routeTree.emptyDescription') }}</p>
        </div>
      </slot>
    </template>

    <p v-else-if="rows.length === 0" class="dl-rtree__nomatch">{{ t('routeTree.noMatch') }}</p>

    <!-- Fora do abrir e fechar, `css` desligado troca na hora: nem espera o
         próximo quadro, que numa aba em segundo plano não chega. -->
    <TransitionGroup
      v-else
      tag="div"
      :name="animated ? 'dl-rtree-row' : 'dl-rtree-still'"
      :css="animated"
      role="tree"
      :aria-label="label ?? t('routeTree.label')"
      class="dl-rtree__rows"
    >
      <div
        v-for="row in rows"
        :key="row.node.key"
        :ref="(element) => bindRow(row.node.key, element)"
        role="treeitem"
        class="dl-rtree__row"
        :class="{
          'dl-rtree__row--selected': selectable && selected === row.node.key,
          'dl-rtree__row--context': row.context,
          'dl-rtree__row--inert': !selectable && row.node.children.length === 0,
        }"
        :tabindex="tabKey === row.node.key ? 0 : -1"
        :aria-level="row.level"
        :aria-setsize="row.setSize"
        :aria-posinset="row.position"
        :aria-expanded="row.node.children.length > 0 ? row.open : undefined"
        :aria-selected="selectable ? selected === row.node.key : undefined"
        :aria-label="describe(row)"
        @click="activate(row)"
        @keydown="onKeydown($event, row)"
        @focus="focusKey = row.node.key"
      >
        <span
          v-for="(continues, index) in row.guides"
          :key="index"
          class="dl-rtree__guide"
          :class="{ 'dl-rtree__guide--line': continues }"
          aria-hidden="true"
        />
        <span
          v-if="row.level > 1"
          class="dl-rtree__guide dl-rtree__guide--elbow"
          :class="{ 'dl-rtree__guide--last': row.last }"
          aria-hidden="true"
        />

        <button
          v-if="row.node.children.length > 0"
          type="button"
          class="dl-rtree__toggle"
          tabindex="-1"
          aria-hidden="true"
          @click.stop="toggle(row.node)"
        >
          <VIcon
            icon="mdi-chevron-right"
            size="18"
            class="dl-rtree__chevron"
            :class="{ 'dl-rtree__chevron--open': row.open }"
          />
        </button>
        <span v-else class="dl-rtree__toggle" aria-hidden="true"><span class="dl-rtree__dot" /></span>

        <span class="dl-rtree__content">
          <span class="dl-rtree__main">
            <DlRoutePath :path="row.node.key" :base="row.node.base" :highlight="query" class="dl-rtree__path" />
            <span v-if="row.node.group" class="dl-rtree__group">{{ t('routeTree.group') }}</span>
            <span v-else-if="!hideMethods" class="dl-rtree__methods">
              <DlStatusChip
                v-for="route in row.node.routes"
                :key="route.id"
                :status="route.method.toUpperCase()"
                :map="methodMap"
                :with-icon="false"
              />
            </span>
          </span>

          <span
            v-if="row.warnings.length > 0 || row.node.descendants > 0 || $slots['node-end']"
            class="dl-rtree__meta"
          >
            <VIcon
              v-if="row.warnings.length > 0"
              icon="mdi-alert-circle-outline"
              size="16"
              class="dl-rtree__warning"
              :title="row.warnings.join('\n')"
              aria-hidden="true"
            />
            <span
              v-if="row.node.descendants > 0"
              class="dl-rtree__count"
              :title="t('routeTree.below', { count: row.node.descendants })"
              aria-hidden="true"
            >{{ row.node.descendants }}</span>
            <span v-if="$slots['node-end']" class="dl-rtree__end" @click.stop @keydown.stop>
              <slot name="node-end" :node="row.node" :selected="selected === row.node.key" />
            </span>
          </span>
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.dl-rtree {
  position: relative;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
}

.dl-rtree__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.dl-rtree__rows {
  position: relative;
  padding: 6px 0;
}

.dl-rtree__row {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 40px;
  padding: 0 12px;
  cursor: pointer;
  outline: none;
  transition: background-color var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-rtree__row:hover {
  background: var(--dl-surface-variant);
}

/* Sem seleção e sem filhos, o clique não faz nada: o cursor não promete. */
.dl-rtree__row--inert {
  cursor: default;
}

/* Foco visível é requisito de navegação por teclado, não enfeite. */
.dl-rtree__row:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dl-primary);
}

.dl-rtree__row--selected,
.dl-rtree__row--selected:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Cor não vai sozinha: a barra lateral marca a seleção para quem não distingue o fundo. */
.dl-rtree__row--selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--dl-primary);
}

.dl-rtree__guide {
  position: relative;
  flex: 0 0 24px;
}

.dl-rtree__guide--line::before,
.dl-rtree__guide--elbow::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  border-left: 1px solid var(--dl-outline);
}

/* A dobra fica na altura da primeira linha, não no meio da linha inteira:
   caminho longo quebra em duas no telefone, e a seta continua na primeira. */
.dl-rtree__guide--last::before {
  bottom: auto;
  height: 20px;
}

.dl-rtree__guide--elbow::after {
  content: '';
  position: absolute;
  left: 11px;
  top: 20px;
  width: 11px;
  border-top: 1px solid var(--dl-outline);
}

.dl-rtree__toggle {
  flex: 0 0 24px;
  align-self: flex-start;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin: 8px 6px 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--dl-radius-sm, 6px);
  background: none;
  color: var(--dl-on-surface-muted);
}

button.dl-rtree__toggle {
  cursor: pointer;
}

button.dl-rtree__toggle:hover {
  color: var(--dl-on-surface);
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.dl-rtree__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--dl-outline);
}

.dl-rtree__chevron {
  transition: transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-rtree__chevron--open {
  transform: rotate(90deg);
}

.dl-rtree__content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  padding: 8px 0;
}

.dl-rtree__main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
}

.dl-rtree__methods {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dl-rtree__group {
  font-size: 12px;
  font-style: italic;
  color: var(--dl-on-surface-muted);
}

.dl-rtree__row--context .dl-rtree__path {
  color: var(--dl-on-surface-muted);
}

.dl-rtree__meta {
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dl-rtree__warning {
  color: rgb(var(--v-theme-warning));
}

.dl-rtree__count {
  min-width: 22px;
  padding: 0 7px;
  line-height: 20px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  border-radius: var(--dl-radius-pill, 999px);
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-variant-numeric: tabular-nums;
}

.dl-rtree__row:hover .dl-rtree__count,
.dl-rtree__row--selected .dl-rtree__count {
  background: var(--dl-surface);
}

.dl-rtree__end {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: default;
}

.dl-rtree__skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
}

.dl-rtree__skeleton-row {
  display: block;
  height: 22px;
  max-width: 360px;
  border-radius: var(--dl-radius-sm, 6px);
  background: var(--dl-surface-variant);
  animation: dl-rtree-pulse 1.4s ease-in-out infinite;
}

.dl-rtree__empty {
  padding: 40px 24px;
  text-align: center;
}

.dl-rtree__empty-icon {
  color: var(--dl-on-surface-muted);
  opacity: 0.6;
}

.dl-rtree__empty-title {
  margin: 10px 0 4px;
  font-size: 15px;
  font-weight: 500;
}

.dl-rtree__empty-text {
  margin: 0 auto;
  max-width: 44ch;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-rtree__nomatch {
  margin: 0;
  padding: 28px 24px;
  text-align: center;
  font-size: 14px;
  color: var(--dl-on-surface-muted);
}

/* Linha entra descendo do pai; a que sai recolhe nele, e as de baixo deslizam. */
.dl-rtree-row-enter-active,
.dl-rtree-row-leave-active {
  transition:
    opacity var(--dl-motion-normal, 200ms) var(--dl-easing),
    transform var(--dl-motion-normal, 200ms) var(--dl-easing);
}

.dl-rtree-row-enter-from,
.dl-rtree-row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.dl-rtree-row-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.dl-rtree-row-move {
  transition: transform var(--dl-motion-normal, 200ms) var(--dl-easing);
}

@keyframes dl-rtree-pulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.9;
  }
}

/* O estado fica, o movimento sai. */
@media (prefers-reduced-motion: reduce) {
  .dl-rtree__row,
  .dl-rtree__chevron,
  .dl-rtree-row-enter-active,
  .dl-rtree-row-leave-active,
  .dl-rtree-row-move {
    transition: none;
  }

  .dl-rtree-row-enter-from,
  .dl-rtree-row-leave-to {
    transform: none;
  }

  .dl-rtree__skeleton-row {
    animation: none;
  }
}
</style>
