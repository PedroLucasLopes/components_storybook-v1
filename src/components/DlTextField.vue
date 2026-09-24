<script setup lang="ts">
import { computed, ref } from 'vue';
import { VTextarea, VTextField } from 'vuetify/components';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    label?: string;
    hint?: string;
    placeholder?: string;
    error?: string | null;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    mono?: boolean;
    copyable?: boolean;
    icon?: string;
    loading?: boolean;
    reserveError?: boolean;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  {
    modelValue: '',
    type: 'text',
    density: 'comfortable',
    reserveError: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  copied: [value: string];
}>();

const { t } = useDotlogText();

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const justCopied = ref(false);

const copy = async (): Promise<void> => {
  const text = String(props.modelValue ?? '');

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    justCopied.value = true;
    emit('copied', text);
    setTimeout(() => (justCopied.value = false), 1400);
  } catch {
  }
};

const passwordVisible = ref(false);

const effectiveType = computed(() =>
  props.type === 'password' && passwordVisible.value ? 'text' : props.type,
);

const field = computed(() => (props.rows ? VTextarea : VTextField));
</script>

<template>
  <div class="dl-field">
    <label v-if="label" class="dl-field__label" :for="label">
      {{ label }}
      <span v-if="required" class="dl-field__required" aria-hidden="true">*</span>
    </label>

    <component
      :is="field"
      :id="label"
      v-model="value"
      :type="rows ? undefined : effectiveType"
      :rows="rows"
      :auto-grow="rows ? true : undefined"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :loading="loading"
      :error="!!error"
      :error-messages="error ?? undefined"
      :hint="error ? undefined : hint"
      :persistent-hint="!!hint"
      :prepend-inner-icon="icon"
      :density="density"
      :class="{ 'dl-field__input--mono': mono }"
      :hide-details="reserveError ? false : 'auto'"
      :aria-required="required || undefined"
      :aria-invalid="!!error || undefined"
      variant="outlined"
    >
      <template v-if="!rows && (copyable || type === 'password')" #append-inner>
        <VBtn
          v-if="type === 'password'"
          :icon="passwordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :aria-label="passwordVisible ? t('common.hide') : t('common.show')"
          variant="text"
          size="small"
          density="comfortable"
          @click="passwordVisible = !passwordVisible"
        />
        <VBtn
          v-if="copyable"
          :icon="justCopied ? 'mdi-check' : 'mdi-content-copy'"
          :aria-label="justCopied ? t('common.copied') : t('common.copy')"
          :color="justCopied ? 'success' : undefined"
          variant="text"
          size="small"
          density="comfortable"
          @click="copy"
        />
      </template>
    </component>
  </div>
</template>

<style scoped>
.dl-field {
  display: flex;
  flex-direction: column;
  gap: var(--dl-space-xs, 4px);
  min-width: 0;
}

.dl-field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
  line-height: 1.3;
}

.dl-field__required {
  color: var(--dl-error);
  margin-left: 2px;
}

.dl-field__input--mono :deep(input),
.dl-field__input--mono :deep(textarea) {
  font-family: var(--dl-font-mono);
  font-size: 13px;
  letter-spacing: 0.01em;
}
</style>
