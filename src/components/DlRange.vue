<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue: [number, number];
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    hint?: string;
    format?: (value: number) => string;
    disabled?: boolean;
    sliderOnly?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
  },
);

const emit = defineEmits<{ 'update:modelValue': [value: [number, number]] }>();

const { t } = useDotlogText();

const range = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

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
      <span class="dl-range__separator" aria-hidden="true">{{ t('range.to') }}</span>
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
      <template #thumb-label="{ modelValue }">{{ display(modelValue) }}</template>
    </VRangeSlider>

    <div v-if="!sliderOnly" class="dl-range__inputs">
      <VTextField
        v-model="minText"
        :min="min"
        :max="max"
        :disabled="disabled"
        :label="t('range.min')"
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
        :label="t('range.max')"
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
