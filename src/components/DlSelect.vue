<script setup lang="ts" generic="T">
import { computed } from 'vue';
import { VAutocomplete, VSelect } from 'vuetify/components';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    options: readonly T[];
    label?: string;
    hint?: string;
    placeholder?: string;
    error?: string | null;
    itemTitle?: string;
    itemValue?: string;
    multiple?: boolean;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    icon?: string;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    itemTitle: 'title',
    itemValue: 'value',
    density: 'comfortable',
    clearable: true,
  },
);

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>();

const { t } = useDotlogText();

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const withSearch = computed(() => props.searchable ?? props.options.length >= 8);

const component = computed(() => (withSearch.value ? VAutocomplete : VSelect));
</script>

<template>
  <div class="dl-select">
    <label v-if="label" class="dl-select__label" :for="label">
      {{ label }}
      <span v-if="required" class="dl-select__required" aria-hidden="true">*</span>
    </label>

    <component
      :is="component"
      :id="label"
      v-model="value"
      :items="options"
      :item-title="itemTitle"
      :item-value="itemValue"
      :placeholder="placeholder"
      :multiple="multiple"
      :chips="multiple"
      :closable-chips="multiple"
      :disabled="disabled || loading"
      :loading="loading"
      :clearable="clearable"
      :error="!!error"
      :error-messages="error ?? undefined"
      :hint="error ? undefined : hint"
      :persistent-hint="!!hint"
      :prepend-inner-icon="icon"
      :density="density"
      :aria-required="required || undefined"
      variant="outlined"
      :no-data-text="t('select.noOptions')"
      menu-icon="mdi-chevron-down"
    >
      <template v-if="loading" #no-data>
        <div class="dl-select__loading">{{ t('select.loadingOptions') }}</div>
      </template>
      <template v-for="(_, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data ?? {}" />
      </template>
    </component>
  </div>
</template>

<style scoped>
.dl-select {
  display: flex;
  flex-direction: column;
  gap: var(--dl-space-xs, 4px);
  min-width: 0;
}

.dl-select__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  line-height: 1.3;
}

.dl-select__required {
  color: var(--dl-error);
  margin-left: 2px;
}

.dl-select__loading {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--dl-on-surface-muted);
}
</style>
