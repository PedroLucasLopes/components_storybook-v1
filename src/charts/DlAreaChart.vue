<script setup lang="ts">
/**
 * Linha e área para mudança ao longo do tempo. É o gráfico de "ondas".
 *
 * **Uma escala só.** Nunca dois eixos. Duas medidas de grandeza diferente viram
 * dois gráficos, ou uma indexada a uma base comum. Eixo duplo é a forma mais
 * fácil de sugerir correlação que não existe, e por isso não existe aqui.
 *
 * **Área só com uma série, ou empilhada.** Duas áreas soltas se cobrem e a de
 * baixo fica ilegível. Com duas ou mais séries independentes, linha.
 *
 * **Mira vertical, não ponto por ponto.** Passar o mouse escolhe o instante
 * mais próximo no eixo do tempo e mostra TODAS as séries daquele instante. É a
 * pergunta que a pessoa faz olhando para um gráfico de tempo: "o que acontecia
 * aqui?", não "quanto vale este pixel?".
 *
 * Especificações de marca: linha de 2px, marcador de 8px com anel da superfície
 * para não se perder na linha, grade recessiva só na horizontal.
 */
import { computed, ref } from 'vue';

export interface AreaSeries {
  label: string;
  color: string;
  values: number[];
}

const props = withDefaults(
  defineProps<{
    /** Rótulos do eixo do tempo. Mesma quantidade dos valores de cada série. */
    labels: string[];
    series: AreaSeries[];
    format?: (value: number) => string;
    /** Preenche sob a linha. Use só com uma série. */
    filled?: boolean;
    height?: number;
  }>(),
  { height: 200 },
);

const display = (value: number): string =>
  props.format ? props.format(value) : String(value);

const W = 600;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

const max = computed(() => {
  const all = props.series.flatMap((s) => s.values);

  return Math.max(1, ...all);
});

const plotW = computed(() => W - PAD.left - PAD.right);
const plotH = computed(() => props.height - PAD.top - PAD.bottom);

const xAt = (index: number): number =>
  PAD.left + (props.labels.length <= 1 ? 0 : (index / (props.labels.length - 1)) * plotW.value);

const yAt = (value: number): number => PAD.top + plotH.value - (value / max.value) * plotH.value;

const lineOf = (values: number[]): string =>
  values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');

const areaOf = (values: number[]): string =>
  `${lineOf(values)} L ${xAt(values.length - 1)} ${PAD.top + plotH.value} L ${xAt(0)} ${PAD.top + plotH.value} Z`;

/** Quatro linhas de grade: o bastante para dar escala sem virar gaiola. */
const gridLines = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
    y: PAD.top + plotH.value * (1 - fraction),
    value: display(Math.round(max.value * fraction)),
  })),
);

const active = ref<number | null>(null);

/** Mira: o índice mais próximo do cursor, não o ponto sob ele. */
const onMove = (event: MouseEvent): void => {
  const svg = event.currentTarget as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const ratio = ((event.clientX - rect.left) / rect.width) * W;
  const step = plotW.value / Math.max(1, props.labels.length - 1);
  const index = Math.round((ratio - PAD.left) / step);

  active.value = Math.max(0, Math.min(props.labels.length - 1, index));
};
</script>

<template>
  <div class="dl-area">
    <svg
      :viewBox="`0 0 ${W} ${height}`"
      class="dl-area__svg"
      role="img"
      :aria-label="series.map((s) => s.label).join(', ')"
      @mousemove="onMove"
      @mouseleave="active = null"
    >
      <!-- Grade recessiva, só horizontal: vertical não ajuda a ler valor. -->
      <g class="dl-area__grid">
        <line
          v-for="line in gridLines"
          :key="line.y"
          :x1="PAD.left"
          :x2="W - PAD.right"
          :y1="line.y"
          :y2="line.y"
        />
      </g>

      <g class="dl-area__axis">
        <text v-for="line in gridLines" :key="line.value" :x="PAD.left - 8" :y="line.y + 4" text-anchor="end">
          {{ line.value }}
        </text>
      </g>

      <g v-if="filled && series.length === 1">
        <path :d="areaOf(series[0].values)" :fill="series[0].color" class="dl-area__fill" />
      </g>

      <path
        v-for="item in series"
        :key="item.label"
        :d="lineOf(item.values)"
        :stroke="item.color"
        class="dl-area__line"
        fill="none"
      />

      <!-- Mira e marcadores do instante escolhido. -->
      <g v-if="active !== null">
        <line
          :x1="xAt(active)"
          :x2="xAt(active)"
          :y1="PAD.top"
          :y2="PAD.top + plotH"
          class="dl-area__crosshair"
        />
        <circle
          v-for="item in series"
          :key="item.label"
          :cx="xAt(active)"
          :cy="yAt(item.values[active])"
          r="4.5"
          :fill="item.color"
          class="dl-area__marker"
        />
      </g>

      <g class="dl-area__axis">
        <text
          v-for="(label, index) in labels"
          :key="label"
          :x="xAt(index)"
          :y="height - 6"
          text-anchor="middle"
          :class="{ 'dl-area__axis--active': active === index }"
        >
          {{ label }}
        </text>
      </g>
    </svg>

    <!-- A dica responde "o que acontecia aqui", com TODAS as séries. -->
    <Transition name="dl-area-tip">
      <div v-if="active !== null" class="dl-area__tip">
        <p class="dl-area__tip-title">{{ labels[active] }}</p>
        <p v-for="item in series" :key="item.label" class="dl-area__tip-row">
          <span class="dl-area__tip-swatch" :style="{ background: item.color }" aria-hidden="true" />
          <span class="dl-area__tip-label">{{ item.label }}</span>
          <span class="dl-area__tip-value">{{ display(item.values[active]) }}</span>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dl-area {
  position: relative;
  min-width: 0;
}

.dl-area__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.dl-area__grid line {
  stroke: var(--dl-outline);
  stroke-width: 1;
  opacity: 0.55;
}

.dl-area__axis text {
  font-family: var(--dl-font);
  font-size: 10px;
  fill: var(--dl-on-surface-muted);
}

.dl-area__axis--active {
  fill: var(--dl-on-surface);
  font-weight: 600;
}

.dl-area__line {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* O traço se desenha da esquerda para a direita ao entrar. */
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: dl-area-draw 900ms var(--dl-easing) forwards;
}

.dl-area__fill {
  opacity: 0.14;
  animation: dl-area-rise var(--dl-motion-slow, 320ms) var(--dl-easing);
}

@keyframes dl-area-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes dl-area-rise {
  from { opacity: 0; }
  to { opacity: 0.14; }
}

.dl-area__crosshair {
  stroke: var(--dl-on-surface-muted);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0.6;
}

/* Anel da superfície em volta do marcador: sem ele o ponto some dentro da
   linha da própria cor. */
.dl-area__marker {
  stroke: var(--dl-surface);
  stroke-width: 2;
}

.dl-area__tip {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-sm, 6px);
  padding: 8px 10px;
  box-shadow: 0 4px 14px rgba(16, 18, 28, 0.14);
  pointer-events: none;
  min-width: 150px;
}

.dl-area__tip-title {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dl-on-surface);
}

.dl-area__tip-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

.dl-area__tip-swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.dl-area__tip-label {
  color: var(--dl-on-surface-muted);
  flex: 1;
}

.dl-area__tip-value {
  font-family: var(--dl-font-mono);
  color: var(--dl-on-surface);
}

.dl-area-tip-enter-active,
.dl-area-tip-leave-active {
  transition: opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-area-tip-enter-from,
.dl-area-tip-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dl-area__line {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    animation: none;
  }

  .dl-area__fill {
    animation: none;
  }

  .dl-area-tip-enter-active,
  .dl-area-tip-leave-active {
    transition: none;
  }
}
</style>
