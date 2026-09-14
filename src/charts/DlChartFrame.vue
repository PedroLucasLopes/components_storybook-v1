<script setup lang="ts">
/**
 * Moldura comum a todo gráfico: título, legenda, estado vazio e **visão de
 * tabela**.
 *
 * ## A tabela não é opcional
 *
 * Três tons da paleta ficam abaixo de 3:1 contra a superfície clara. A regra de
 * alívio do método exige, nesse caso, rótulo direto **ou** visão de tabela, e
 * não é dispensável. Aqui vêm os dois: rótulo no gráfico e um botão que troca o
 * desenho por uma tabela com os mesmos números.
 *
 * Isso também resolve o resto: quem usa leitor de tela, quem vai imprimir, quem
 * precisa copiar o valor exato. Gráfico é resumo; tabela é o dado.
 *
 * ## A legenda existe sempre que houver duas séries ou mais
 *
 * Com uma série o título já diz o que é, e uma caixinha de legenda só ocupa
 * espaço. Com duas ou mais, identidade nunca pode depender só de cor.
 */
import { computed, ref } from 'vue';

export interface ChartSeriesMeta {
  label: string;
  color: string;
  /** Total ou valor de destaque, mostrado na legenda quando houver. */
  value?: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    series: ChartSeriesMeta[];
    /** Cabeçalhos da visão de tabela. */
    tableHeaders?: string[];
    /** Linhas da visão de tabela, já formatadas. */
    tableRows?: string[][];
    loading?: boolean;
    empty?: boolean;
    emptyMessage?: string;
  }>(),
  {
    tableHeaders: () => [],
    tableRows: () => [],
    emptyMessage: 'No data for the selected period.',
  },
);

const showTable = ref(false);

const hasLegend = computed(() => props.series.length >= 2);
const canToggleTable = computed(() => props.tableRows.length > 0);
</script>

<template>
  <figure class="dl-chart">
    <!-- O HTML exige `<figcaption>` como primeiro ou último filho DIRETO de
         `<figure>`. Aninhado num `<div>` ele deixa de nomear a figura, e o Vite
         avisa. Aqui dentro fica só título e descrição: o botão de tabela vai
         fora, senão o rótulo dele entraria no nome acessível do gráfico. -->
    <figcaption class="dl-chart__caption">
      <span class="dl-chart__title">{{ title }}</span>
      <span v-if="description" class="dl-chart__description">{{ description }}</span>
    </figcaption>

    <VBtn
      v-if="canToggleTable"
      :icon="showTable ? 'mdi-chart-box-outline' : 'mdi-table'"
      :aria-label="showTable ? 'Show chart' : 'Show data table'"
      :title="showTable ? 'Show chart' : 'Show data table'"
      variant="text"
      size="small"
      density="comfortable"
      class="dl-chart__toggle"
      @click="showTable = !showTable"
    />

    <div class="dl-chart__stage">
      <Transition name="dl-chart-swap" mode="out-in">
        <div v-if="loading" key="loading" class="dl-chart__placeholder">
          <slot name="loading" />
        </div>

        <p v-else-if="empty" key="empty" class="dl-chart__empty">{{ emptyMessage }}</p>

        <div v-else-if="showTable" key="table" class="dl-chart__table-wrap">
          <table class="dl-chart__table">
            <thead>
              <tr>
                <th v-for="header in tableHeaders" :key="header" scope="col">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in tableRows" :key="i">
                <td v-for="(cell, j) in row" :key="j" :class="{ 'dl-chart__num': j > 0 }">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else key="chart" class="dl-chart__canvas">
          <slot />
        </div>
      </Transition>
    </div>

    <!-- Identidade nunca por cor sozinha: a legenda traz a marca E o texto. -->
    <ul v-if="hasLegend && !showTable" class="dl-chart__legend">
      <li v-for="item in series" :key="item.label" class="dl-chart__legend-item">
        <span class="dl-chart__swatch" :style="{ background: item.color }" aria-hidden="true" />
        <span class="dl-chart__legend-label">{{ item.label }}</span>
        <span v-if="item.value" class="dl-chart__legend-value">{{ item.value }}</span>
      </li>
    </ul>
  </figure>
</template>

<style scoped>
/* Grade em vez de um cabeçalho embrulhando legenda e botão: é o que deixa o
   `<figcaption>` ser filho direto da `<figure>` e ainda ficar lado a lado com
   o botão de tabela. Palco e legenda ocupam as duas colunas. */
.dl-chart {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: 12px;
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  padding: 16px 18px 14px;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
  min-width: 0;
}

.dl-chart__caption {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  margin-bottom: 14px;
}

.dl-chart__toggle {
  grid-column: 2;
  justify-self: end;
}

.dl-chart__stage,
.dl-chart__legend {
  grid-column: 1 / -1;
}

.dl-chart__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.dl-chart__description {
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

.dl-chart__stage {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dl-chart__canvas,
.dl-chart__placeholder,
.dl-chart__table-wrap {
  min-width: 0;
}

.dl-chart__table-wrap {
  overflow-x: auto;
  max-height: 260px;
  overflow-y: auto;
}

.dl-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.dl-chart__table th {
  position: sticky;
  top: 0;
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: start;
  padding: 8px 10px;
}

.dl-chart__table td {
  padding: 7px 10px;
  border-top: 1px solid var(--dl-outline);
}

.dl-chart__num {
  text-align: end;
  font-family: var(--dl-font-mono);
  font-size: 12px;
}

.dl-chart__empty {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--dl-on-surface-muted);
  padding: 40px 12px;
}

.dl-chart__legend {
  list-style: none;
  margin: 14px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--dl-outline);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
}

.dl-chart__legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  min-width: 0;
}

.dl-chart__swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* O texto usa tinta de texto, nunca a cor da série: a marca ao lado é que
   carrega a identidade. */
.dl-chart__legend-label {
  color: var(--dl-on-surface-muted);
}

.dl-chart__legend-value {
  font-family: var(--dl-font-mono);
  color: var(--dl-on-surface);
}

.dl-chart-swap-enter-active,
.dl-chart-swap-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-chart-swap-enter-from,
.dl-chart-swap-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .dl-chart-swap-enter-active,
  .dl-chart-swap-leave-active {
    transition: opacity 1ms linear;
  }

  .dl-chart-swap-enter-from,
  .dl-chart-swap-leave-to {
    transform: none;
  }
}
</style>
