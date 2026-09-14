<script setup lang="ts">
/**
 * Barras para comparar magnitude entre categorias.
 *
 * **Horizontal por padrão.** Rótulo de categoria em tela de gestão é texto
 * ("400L concrete mixer"), e texto deitado na vertical obriga a inclinar a
 * cabeça. Barra horizontal deixa o rótulo na horizontal e ainda acomoda nome
 * longo.
 *
 * **Uma escala só.** Nunca dois eixos. Duas medidas de grandeza diferente são
 * dois gráficos, não um com dois eixos, que é a forma mais fácil de sugerir uma
 * correlação que não existe.
 *
 * **Zero é o começo, sempre.** Barra cortada mente sobre proporção: dobro de
 * pixel vira dobro de valor na cabeça de quem olha.
 *
 * Especificações de marca: extremidade arredondada em 4px só do lado do dado,
 * 2px de folga entre barras vizinhas, grade recessiva, rótulo direto no valor.
 */
import { computed, ref } from 'vue';

export interface BarDatum {
  label: string;
  value: number;
  /** Cor da ENTIDADE. Filtrar a lista não pode repintar quem sobrou. */
  color: string;
}

const props = withDefaults(
  defineProps<{
    data: BarDatum[];
    /** Formata o valor no rótulo e na dica. */
    format?: (value: number) => string;
    /** Altura de cada barra. */
    barSize?: number;
    /** Largura reservada para o rótulo da categoria. */
    labelWidth?: number;
  }>(),
  { barSize: 26, labelWidth: 148 },
);

const display = (value: number): string =>
  props.format ? props.format(value) : String(value);

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)));

/** Largura reservada ao valor, para os numeros alinharem na vertical. */
const VALUE_WIDTH = 76;

const hovered = ref<number | null>(null);

/** Percentual da largura útil. A escala começa em zero, sempre. */
const widthOf = (value: number): number => (value / max.value) * 100;
</script>

<template>
  <div class="dl-bars" :style="{ '--dl-bar-label': labelWidth + 'px', '--dl-bar-value': VALUE_WIDTH + 'px' }">
    <div
      v-for="(datum, index) in data"
      :key="datum.label"
      class="dl-bars__row"
      :class="{ 'dl-bars__row--dim': hovered !== null && hovered !== index }"
      :style="{ height: barSize + 'px' }"
      @mouseenter="hovered = index"
      @mouseleave="hovered = null"
      @focusin="hovered = index"
      @focusout="hovered = null"
    >
      <span class="dl-bars__label" :title="datum.label">{{ datum.label }}</span>

      <div class="dl-bars__track">
        <div
          class="dl-bars__fill"
          :style="{ width: widthOf(datum.value) + '%', background: datum.color }"
          role="img"
          :aria-label="`${datum.label}: ${display(datum.value)}`"
          tabindex="0"
        />
      </div>

      <!-- Rótulo direto em todo valor: são poucas linhas e a leitura exata
           importa mais que a limpeza aqui. Ver a regra de alívio da paleta. -->
      <span class="dl-bars__value">{{ display(datum.value) }}</span>
    </div>
  </div>
</template>

<style scoped>
.dl-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.dl-bars__row {
  display: grid;
  grid-template-columns: var(--dl-bar-label) 1fr var(--dl-bar-value);
  align-items: center;
  gap: 10px;
  transition: opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
}

/* Apagar as outras ao passar o mouse guia o olho sem mover nada de lugar. */
.dl-bars__row--dim {
  opacity: 0.45;
}

.dl-bars__label {
  font-size: 12px;
  color: var(--dl-on-surface-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dl-bars__track {
  /* A trilha é a grade: recessiva, só o suficiente para dar a extensão. */
  background: var(--dl-surface-variant);
  border-radius: 4px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.dl-bars__fill {
  height: 100%;
  /* Arredonda só a extremidade do DADO; a base fica reta, ancorada no zero. */
  border-radius: 0 4px 4px 0;
  transition: width var(--dl-motion-slow, 320ms) var(--dl-easing);
  transform-origin: left center;
  animation: dl-bar-grow var(--dl-motion-slow, 320ms) var(--dl-easing);
}

@keyframes dl-bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.dl-bars__value {
  font-family: var(--dl-font-mono);
  font-size: 12px;
  color: var(--dl-on-surface);
  text-align: end;
}

.dl-bars__fill:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: 2px;
}

/* Em telefone o rótulo sobe para cima da barra: 148px de rótulo mais barra
   numa tela de 375px não deixa espaço para nenhum dos dois. */
@media (max-width: 599px) {
  .dl-bars__row {
    grid-template-columns: 1fr var(--dl-bar-value);
    grid-template-areas: 'label value' 'track track';
    height: auto !important;
    row-gap: 4px;
  }

  .dl-bars__label { grid-area: label; }
  .dl-bars__value { grid-area: value; }

  .dl-bars__track {
    grid-area: track;
    height: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-bars__row,
  .dl-bars__fill {
    transition: none;
    animation: none;
  }
}
</style>
