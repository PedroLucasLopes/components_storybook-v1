<script setup lang="ts">
/**
 * Faixa numérica, para filtro de valor, prazo ou quantidade.
 *
 * **Slider e campos juntos, não um ou outro.** O slider é bom para explorar
 * ("mais ou menos até aqui") e péssimo para precisão; digitar é o inverso. Quem
 * filtra diária entre 80 e 150 quer digitar. Quem está descobrindo a range
 * quer arrastar. Os dois editam o mesmo valor.
 *
 * **Ordem corrigida na saída, não no meio da digitação.** Se a pessoa digita
 * 200 no mínimo e o máximo é 150, inverter na hora faz o cursor pular e apaga o
 * que ela está escrevendo. A troca acontece quando o campo perde o foco.
 */
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** `[minimo, maximo]` escolhidos. */
    modelValue: [number, number];
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    hint?: string;
    /** Formata o valor mostrado. Ex.: moeda, dias, quilos. */
    format?: (value: number) => string;
    disabled?: boolean;
    /** Esconde os campos numéricos e deixa só o slider. */
    sliderOnly?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
  },
);

const emit = defineEmits<{ 'update:modelValue': [valor: [number, number]] }>();

const range = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

// Cópia local dos campos: enquanto a pessoa digita, o valor pode estar
// temporariamente inválido, e empurrar isso para fora faria a tela tremer.
const minText = ref(String(props.modelValue[0]));
const maxText = ref(String(props.modelValue[1]));

watch(
  () => props.modelValue,
  ([a, b]) => {
    minText.value = String(a);
    maxText.value = String(b);
  },
);

const clamp = (value: number): number =>
  Math.min(props.max, Math.max(props.min, value));

/** Chamado no blur. Ver a nota sobre ordem no topo do arquivo. */
const commit = (): void => {
  const a = clamp(Number(minText.value) || props.min);
  const b = clamp(Number(maxText.value) || props.max);
  const ordered: [number, number] = a <= b ? [a, b] : [b, a];

  minText.value = String(ordered[0]);
  maxText.value = String(ordered[1]);
  emit('update:modelValue', ordered);
};

const display = (value: number): string =>
  props.format ? props.format(value) : String(value);
</script>

<template>
  <fieldset class="dl-range" :disabled="disabled">
    <legend v-if="label" class="dl-range__label">{{ label }}</legend>

    <div class="dl-range__readout" aria-live="polite">
      <span class="dl-range__value">{{ display(range[0]) }}</span>
      <span class="dl-range__separator" aria-hidden="true">to</span>
      <span class="dl-range__value">{{ display(range[1]) }}</span>
    </div>

    <VRangeSlider
      v-model="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="label"
      color="primary"
      track-color="surface-variant"
      hide-details
      density="comfortable"
    >
      <!-- Rotulo so enquanto arrasta. Permanente ele colide com a leitura
           acima e repete a mesma informacao duas vezes. -->
      <template #thumb-label="{ modelValue }">{{ display(modelValue) }}</template>
    </VRangeSlider>

    <div v-if="!sliderOnly" class="dl-range__inputs">
      <VTextField
        v-model="minText"
        :min="min"
        :max="max"
        :disabled="disabled"
        label="Min"
        type="number"
        variant="outlined"
        density="compact"
        hide-details
        @blur="commit"
        @keydown.enter="commit"
      />
      <span class="dl-range__dash" aria-hidden="true">—</span>
      <VTextField
        v-model="maxText"
        :min="min"
        :max="max"
        :disabled="disabled"
        label="Max"
        type="number"
        variant="outlined"
        density="compact"
        hide-details
        @blur="commit"
        @keydown.enter="commit"
      />
    </div>

    <p v-if="hint" class="dl-range__hint">{{ hint }}</p>
  </fieldset>
</template>

<style scoped>
.dl-range {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}

.dl-range__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  padding: 0;
  margin-bottom: var(--dl-space-sm, 8px);
}

.dl-range__readout {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.dl-range__value {
  font-family: var(--dl-font-mono);
  font-size: 15px;
  color: var(--dl-on-surface);
}

.dl-range__separator {
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

.dl-range__inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.dl-range__dash {
  color: var(--dl-on-surface-muted);
  flex-shrink: 0;
}

.dl-range__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
}

/* Em telefone os dois campos empilham: lado a lado eles ficam estreitos
   demais para um número de quatro dígitos caber sem cortar. */
@media (max-width: 480px) {
  .dl-range__inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .dl-range__dash {
    display: none;
  }
}
</style>
