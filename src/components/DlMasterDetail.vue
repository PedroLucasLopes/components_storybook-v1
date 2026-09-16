<script setup lang="ts">
/**
 * Lista e detalhe na mesma tela.
 *
 * **Com largura, os dois lado a lado.** Quem percorre um catálogo clica num
 * item, lê, clica no seguinte. Abrir e fechar uma tela por item faz perder o
 * lugar na lista a cada ida e volta.
 *
 * **Estreito, um de cada vez.** Sem largura para os dois, o detalhe toma o
 * lugar da lista, com um "voltar" no topo. A decisão sai da largura do próprio
 * componente, não da janela: com o menu lateral aberto, a mesma janela sobra
 * menos espaço para o conteúdo.
 *
 * **O detalhe acompanha a rolagem.** Lista longa, detalhe curto: sem fixar, o
 * detalhe sumiria para cima enquanto a pessoa desce procurando o próximo item.
 *
 * **O foco segue o que apareceu, só no estreito.** Lado a lado, o foco fica na
 * lista, para a pessoa continuar pelas setas. Quando o detalhe toma o lugar da
 * lista, o foco vai para ele, e ao voltar retorna ao item de onde saiu, com a
 * rolagem onde estava.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    /** Há algo selecionado: o detalhe aparece no lugar do marcador. */
    detailOpen: boolean;
    /** A cada valor novo, o conteúdo do detalhe troca com transição. */
    detailKey?: string | number | null;
    /** Largura do componente, em pixels, abaixo da qual lista e detalhe se revezam. */
    breakpoint?: number;
    /** Coluna da lista, como trilha de `grid-template-columns`. */
    masterSize?: string;
    backLabel?: string;
    /** Distância do topo ao fixar o detalhe. O padrão fica abaixo da barra do `DlAppShell`. */
    stickyTop?: number;
  }>(),
  {
    detailKey: null,
    breakpoint: 900,
    masterSize: 'minmax(300px, 5fr)',
    backLabel: undefined,
    stickyTop: 76,
  },
);

const { t } = useDotlogText();

const emit = defineEmits<{
  back: [];
  'update:narrow': [narrow: boolean];
}>();

const root = ref<HTMLElement | null>(null);
const detail = ref<HTMLElement | null>(null);
const narrow = ref(false);

let observer: ResizeObserver | undefined;

/* Largura zero é componente escondido, não estreito: mantém o que estava. */
const measure = (width: number): void => {
  if (width <= 0) return;

  const next = width < props.breakpoint;

  if (next !== narrow.value) {
    narrow.value = next;
    emit('update:narrow', next);
  }
};

onMounted(() => {
  if (!root.value) return;

  measure(root.value.getBoundingClientRect().width);
  emit('update:narrow', narrow.value);

  if (typeof ResizeObserver === 'undefined') return;

  observer = new ResizeObserver((entries) => {
    const entry = entries[0];

    if (entry) measure(entry.contentRect.width);
  });
  observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());

/** Traz o topo do componente para a vista, se ele ficou acima dela. */
const revealTop = (): void => {
  const top = root.value?.getBoundingClientRect().top ?? 0;

  if (top < props.stickyTop) window.scrollBy({ top: top - props.stickyTop });
};

let returnFocus: HTMLElement | null = null;
let returnScroll = 0;

watch(
  () => props.detailOpen,
  async (open, was) => {
    if (!narrow.value || open === was) return;

    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      returnScroll = window.scrollY;
      await nextTick();
      revealTop();
      detail.value?.focus({ preventScroll: true });
      return;
    }

    await nextTick();
    window.scrollTo({ top: returnScroll });

    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });

    returnFocus = null;
  },
);

/* Estreito, trocar de um detalhe para outro (um filho, o pai) começa do topo. */
watch(
  () => props.detailKey,
  async (key, previous) => {
    if (!narrow.value || !props.detailOpen || key === previous) return;

    await nextTick();
    revealTop();
  },
);
</script>

<template>
  <div
    ref="root"
    class="dl-md"
    :class="{ 'dl-md--narrow': narrow }"
    :style="{ '--dl-md-master': masterSize, '--dl-md-sticky': `${stickyTop}px` }"
  >
    <div v-show="!narrow || !detailOpen" class="dl-md__master">
      <slot name="master" :narrow="narrow" />
    </div>

    <div v-show="!narrow || detailOpen" ref="detail" class="dl-md__detail" tabindex="-1">
      <div v-if="narrow && detailOpen" class="dl-md__back">
        <VBtn prepend-icon="mdi-arrow-left" variant="text" size="small" color="primary" @click="emit('back')">
          {{ backLabel ?? t('common.back') }}
        </VBtn>
      </div>

      <Transition name="dl-md-swap" mode="out-in">
        <div v-if="detailOpen" :key="detailKey ?? 'detail'" class="dl-md__content">
          <slot name="detail" :narrow="narrow" />
        </div>
        <div v-else key="placeholder" class="dl-md__content">
          <slot name="placeholder" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.dl-md {
  display: grid;
  grid-template-columns: var(--dl-md-master) minmax(0, 7fr);
  gap: 16px;
  align-items: start;
  min-width: 0;
}

.dl-md--narrow {
  grid-template-columns: minmax(0, 1fr);
}

.dl-md__master,
.dl-md__detail {
  min-width: 0;
}

/* Detalhe mais alto que a janela rola por dentro. Sem isso, com a lista ainda
   mais longa, o fim do detalhe só apareceria no fim da lista. */
.dl-md:not(.dl-md--narrow) .dl-md__detail {
  position: sticky;
  top: var(--dl-md-sticky);
  max-height: calc(100vh - var(--dl-md-sticky) - 16px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  border-radius: var(--dl-radius-lg, 16px);
}

.dl-md__detail:focus {
  outline: none;
}

.dl-md__back {
  margin: -4px 0 8px -8px;
}

.dl-md__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.dl-md-swap-enter-active,
.dl-md-swap-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-md-swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.dl-md-swap-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dl-md-swap-enter-active,
  .dl-md-swap-leave-active {
    transition: opacity 1ms linear;
  }

  .dl-md-swap-enter-from {
    transform: none;
  }
}
</style>
