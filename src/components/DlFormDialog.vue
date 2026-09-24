<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode?: 'create' | 'edit';
    title: string;
    description?: string;
    submitLabel?: string;
    cancelLabel?: string;
    error?: string | null;
    submitting?: boolean;
    dirty?: boolean;
    width?: number | string;
  }>(),
  {
    mode: 'create',
    cancelLabel: undefined,
    width: 560,
  },
);

const { t } = useDotlogText();

const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  submit: [];
  cancel: [];
}>();

const { smAndDown } = useDisplay();

const confirmingClose = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) confirmingClose.value = false;
  },
);

const primaryLabel = computed(
  () => props.submitLabel ?? (props.mode === 'create' ? t('form.create') : t('form.saveChanges')),
);

const requestClose = (): void => {
  if (props.submitting) return;

  if (props.dirty) {
    confirmingClose.value = true;
    return;
  }

  close();
};

const close = (): void => {
  confirmingClose.value = false;
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<template>
  <VDialog
    :model-value="modelValue"
    :max-width="smAndDown ? undefined : width"
    :fullscreen="smAndDown"
    :persistent="dirty || submitting"
    scrollable
    @update:model-value="$event ? emit('update:modelValue', true) : requestClose()"
    @keydown.esc.prevent="requestClose"
  >
    <VCard rounded="lg" class="dl-form-dialog">
      <header class="dl-form-dialog__head">
        <div class="dl-form-dialog__heading">
          <h2 class="dl-form-dialog__title">{{ title }}</h2>
          <p v-if="description" class="dl-form-dialog__description">{{ description }}</p>
        </div>
        <VBtn
          icon="mdi-close"
          :aria-label="t('common.close')"
          variant="text"
          size="small"
          density="comfortable"
          :disabled="submitting"
          @click="requestClose"
        />
      </header>

      <VProgressLinear
        v-if="submitting"
        color="primary"
        height="2"
        indeterminate
        class="dl-form-dialog__progress"
      />

      <div class="dl-form-dialog__body">
        <div v-if="error" class="dl-form-dialog__error" role="alert">
          <VIcon icon="mdi-alert-circle-outline" size="18" color="error" />
          <span>{{ error }}</span>
        </div>

        <slot />
      </div>

      <footer class="dl-form-dialog__foot">
        <slot name="secondary-action" />
        <VBtn variant="text" :disabled="submitting" @click="requestClose">
          {{ cancelLabel ?? t('common.cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="submitting"
          @click="emit('submit')"
        >
          {{ primaryLabel }}
        </VBtn>
      </footer>
    </VCard>

    <VDialog v-model="confirmingClose" :max-width="400" persistent>
      <VCard rounded="lg" class="dl-form-dialog__guard">
        <h3 class="dl-form-dialog__guard-title">{{ t('form.discardTitle') }}</h3>
        <p class="dl-form-dialog__guard-text">{{ t('form.discardText') }}</p>
        <div class="dl-form-dialog__guard-actions">
          <VBtn variant="text" @click="confirmingClose = false">{{ t('form.keepEditing') }}</VBtn>
          <VBtn color="error" variant="flat" @click="close">{{ t('form.discard') }}</VBtn>
        </div>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<style scoped>
.dl-form-dialog {
  background: var(--dl-surface);
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.dl-form-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 16px 14px 20px;
  border-bottom: 1px solid var(--dl-outline);
}

.dl-form-dialog__heading {
  min-width: 0;
}

.dl-form-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--dl-on-surface);
}

.dl-form-dialog__description {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-form-dialog__progress {
  flex-shrink: 0;
}

.dl-form-dialog__body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dl-form-dialog__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-error);
  background: rgb(var(--v-theme-error), 0.1);
  border: 1px solid rgb(var(--v-theme-error), 0.4);
  border-radius: var(--dl-radius-sm, 6px);
}

.dl-form-dialog__foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--dl-outline);
}

.dl-form-dialog__guard {
  padding: 20px;
  background: var(--dl-surface);
}

.dl-form-dialog__guard-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--dl-on-surface);
}

.dl-form-dialog__guard-text {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-form-dialog__guard-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

@media (max-width: 599px) {
  .dl-form-dialog__foot {
    padding-bottom: max(14px, env(safe-area-inset-bottom));
  }

  .dl-form-dialog__foot > * {
    flex: 1 1 auto;
  }
}
</style>
