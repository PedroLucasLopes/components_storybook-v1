<script setup lang="ts">
/**
 * Rosca para composição: quanto cada parte representa do todo.
 *
 * **Rosca, não pizza cheia.** O furo no meio devolve um lugar para o número que
 * importa de verdade, o total, e ainda reduz a área que o olho compara mal.
 *
 * **Poucas fatias.** Acima de cinco ou seis, ângulo vizinho vira indistinguível
 * e a resposta certa é barra. O componente não impede, mas a paleta para em
 * oito e o método manda agrupar em "Other" antes disso.
 *
 * **Percentual escrito, não deduzido.** Comparar ângulo é a coisa que o olho
 * humano faz pior; por isso cada fatia tem o número ao lado na legenda, e a
 * fatia sob o cursor mostra o valor no centro.
 *
 * Especificações de marca: 2px de folga da superfície entre fatias, para
 * separar sem borda; anel fino; sem sombra.
 */
import { computed, ref } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

const props = withDefaults(
  defineProps<{
    data: DonutSlice[];
    format?: (value: number) => string;
    /** Rótulo sob o total, no centro. */
    totalLabel?: string;
    size?: number;
    thickness?: number;
  }>(),
  { totalLabel: undefined, size: 190, thickness: 22 },
);

const { t } = useDotlogText();

const totalText = computed(() => props.totalLabel ?? t('chart.total'));

const display = (value: number): string =>
  props.format ? props.format(value) : String(value);

const total = computed(() => props.data.reduce((sum, slice) => sum + slice.value, 0));

const hovered = ref<number | null>(null);

const radius = computed(() => (props.size - props.thickness) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

/** Folga de 2px entre fatias, feita com o tracejado do próprio anel. */
const GAP_PX = 2;

const segments = computed(() => {
  let offset = 0;

  return props.data.map((slice, index) => {
    const fraction = total.value === 0 ? 0 : slice.value / total.value;
    const length = Math.max(0, fraction * circumference.value - GAP_PX);
    const segment = {
      ...slice,
      index,
      length,
      offset,
      percent: fraction * 100,
    };

    offset += fraction * circumference.value;

    return segment;
  });
});

const centreValue = computed(() =>
  hovered.value === null ? display(total.value) : display(props.data[hovered.value].value),
);

const centreLabel = computed(() =>
  hovered.value === null ? totalText.value : props.data[hovered.value].label,
);
</script>

<template>
  <div class="dl-donut">
    <svg
      :viewBox="`0 0 ${size} ${size}`"
      :width="size"
      :height="size"
      class="dl-donut__svg"
      role="img"
      :aria-label="`${totalText}: ${display(total)}`"
    >
      <g :transform="`rotate(-90 ${size / 2} ${size / 2})`">
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke-width="thickness"
          class="dl-donut__track"
          fill="none"
        />
        <circle
          v-for="segment in segments"
          :key="segment.label"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke="segment.color"
          :stroke-width="hovered === segment.index ? thickness + 4 : thickness"
          :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
          :stroke-dashoffset="-segment.offset"
          class="dl-donut__slice"
          fill="none"
          tabindex="0"
          :aria-label="`${segment.label}: ${display(segment.value)}, ${segment.percent.toFixed(1)}%`"
          @mouseenter="hovered = segment.index"
          @mouseleave="hovered = null"
          @focus="hovered = segment.index"
          @blur="hovered = null"
        />
      </g>
    </svg>

    <!-- O número no meio: o total, ou a fatia sob o cursor. -->
    <div class="dl-donut__centre" aria-hidden="true">
      <strong class="dl-donut__value">{{ centreValue }}</strong>
      <span class="dl-donut__label">{{ centreLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.dl-donut {
  position: relative;
  display: grid;
  place-items: center;
  justify-self: center;
}

.dl-donut__svg {
  display: block;
  max-width: 100%;
  height: auto;
}

.dl-donut__track {
  stroke: var(--dl-surface-variant);
}

.dl-donut__slice {
  transition:
    stroke-width var(--dl-motion-fast, 120ms) var(--dl-easing),
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
  cursor: pointer;
  /* A folga entre fatias é a própria superfície aparecendo, sem borda. */
  stroke-linecap: butt;
  animation: dl-donut-draw var(--dl-motion-slow, 320ms) var(--dl-easing);
}

.dl-donut__slice:focus-visible {
  outline: none;
  stroke-width: v-bind('thickness + 4');
  filter: brightness(1.1);
}

@keyframes dl-donut-draw {
  from { opacity: 0; transform: scale(0.94); transform-origin: center; }
  to { opacity: 1; transform: scale(1); }
}

.dl-donut__centre {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
  text-align: center;
  padding: 0 18%;
}

.dl-donut__value {
  font-family: var(--dl-font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--dl-on-surface);
  line-height: 1.1;
}

.dl-donut__label {
  font-size: 11px;
  color: var(--dl-on-surface-muted);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .dl-donut__slice {
    transition: none;
    animation: none;
  }
}
</style>
