<script setup lang="ts">
/**
 * Indicador de painel: um número e o que ele significa.
 *
 * **O número conta até o valor, e o leitor de tela não assiste.** A contagem
 * dá a sensação de dado chegando, mas só para quem vê. O texto animado fica
 * `aria-hidden`, e o valor final vai inteiro para quem ouve, de uma vez.
 *
 * **Carregando mostra a forma do cartão.** Um zero provisório seria lido como
 * dado de verdade: "não há nenhum projeto" é uma informação, e errada.
 *
 * **Clicável só quando leva a algum lugar.** Com `interactive` o cartão vira
 * botão, com foco e teclado; sem isso é só leitura, e não finge ser link.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import DlSkeleton from './DlSkeleton.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: number | string | null;
    /** Ícone `mdi-*`. */
    icon?: string;
    /** Texto de apoio, abaixo do número. */
    hint?: string;
    tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    loading?: boolean;
    /** Vira botão e emite `select`. */
    interactive?: boolean;
    /** Formata números. Texto passa direto. */
    format?: (value: number) => string;
  }>(),
  { tone: 'primary', loading: false, interactive: false },
);

const emit = defineEmits<{ select: [] }>();

const display = (value: number): string =>
  props.format ? props.format(value) : value.toLocaleString('en-US');

const shown = ref<number | null>(null);

let frame = 0;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

watch(
  () => props.value,
  (next, previous) => {
    cancelAnimationFrame(frame);

    if (typeof next !== 'number') {
      shown.value = null;
      return;
    }

    const from = typeof previous === 'number' ? previous : 0;

    if (from === next || prefersReducedMotion()) {
      shown.value = next;
      return;
    }

    const start = performance.now();
    const duration = 520;

    const step = (now: number): void => {
      const progress = Math.min(1, (now - start) / duration);
      // Desacelera no fim: o olho percebe o número assentando no valor.
      const eased = 1 - Math.pow(1 - progress, 3);

      shown.value = Math.round(from + (next - from) * eased);

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
  },
  { immediate: true },
);

onBeforeUnmount(() => cancelAnimationFrame(frame));

const finalText = computed(() => {
  if (props.value === null) return '—';
  return typeof props.value === 'number' ? display(props.value) : props.value;
});

const visibleText = computed(() =>
  typeof props.value === 'number' && shown.value !== null ? display(shown.value) : finalText.value,
);
</script>

<template>
  <component
    :is="interactive ? 'button' : 'article'"
    :type="interactive ? 'button' : undefined"
    class="dl-stat"
    :class="[`dl-stat--${tone}`, { 'dl-stat--interactive': interactive }]"
    @click="interactive && emit('select')"
  >
    <header class="dl-stat__head">
      <span class="dl-stat__label">{{ label }}</span>
      <span v-if="icon" class="dl-stat__icon" aria-hidden="true">
        <VIcon :icon="icon" size="18" />
      </span>
    </header>

    <DlSkeleton v-if="loading" height="30px" width="56%" />

    <p v-else class="dl-stat__value">
      <span aria-hidden="true">{{ visibleText }}</span>
      <span class="dl-stat__sr">{{ finalText }}</span>
    </p>

    <p v-if="hint && !loading" class="dl-stat__hint">{{ hint }}</p>
  </component>
</template>

<style scoped>
.dl-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 16px 18px;
  text-align: start;
  font: inherit;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  transition:
    border-color var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing),
    box-shadow var(--dl-motion-fast, 120ms) var(--dl-easing);

  --dl-stat-rgb: var(--v-theme-primary);
}

.dl-stat--success { --dl-stat-rgb: var(--v-theme-success); }
.dl-stat--warning { --dl-stat-rgb: var(--v-theme-warning); }
.dl-stat--error { --dl-stat-rgb: var(--v-theme-error); }
.dl-stat--info { --dl-stat-rgb: var(--v-theme-info); }
.dl-stat--neutral { --dl-stat-rgb: var(--v-theme-on-surface-variant); }

.dl-stat--interactive {
  cursor: pointer;
}

.dl-stat--interactive:hover {
  border-color: rgba(var(--dl-stat-rgb), 0.5);
  transform: translateY(-1px);
}

.dl-stat--interactive:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: 2px;
}

.dl-stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dl-stat__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
}

.dl-stat__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--dl-radius-md, 10px);
  color: rgb(var(--dl-stat-rgb));
  background: rgba(var(--dl-stat-rgb), 0.12);
  flex-shrink: 0;
}

.dl-stat__value {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.dl-stat__hint {
  margin: 0;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

.dl-stat__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .dl-stat {
    transition: none;
  }

  .dl-stat--interactive:hover {
    transform: none;
  }
}
</style>
