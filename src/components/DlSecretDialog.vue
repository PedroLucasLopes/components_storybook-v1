<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';
import DlButton from './DlButton.vue';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  secret: string;
  label?: string;
  description?: string;
  warning?: string;
  acknowledgeLabel?: string;
}>();

const { t } = useDotlogText();

const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  closed: [];
}>();

const revealed = ref(false);
const acknowledged = ref(false);
const copied = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    revealed.value = false;
    acknowledged.value = false;
    copied.value = false;
  },
);

const masked = computed(() => {
  const value = props.secret;

  if (value.length <= 16) return '•'.repeat(value.length);

  return `${value.slice(0, 6)}${'•'.repeat(22)}${value.slice(-6)}`;
});

const copy = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(props.secret);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1600);
  } catch {
  }
};

const close = (): void => {
  if (!acknowledged.value) return;

  emit('update:modelValue', false);
  emit('closed');
};

const selectAll = (event: FocusEvent): void => {
  (event.target as HTMLTextAreaElement | null)?.select();
};

const valueId = useId();
</script>

<template>
  <VDialog :model-value="modelValue" :max-width="560" persistent scrollable>
    <VCard rounded="lg" class="dl-secret">
      <header class="dl-secret__head">
        <span class="dl-secret__icon" aria-hidden="true">
          <VIcon icon="mdi-key-alert-outline" size="22" />
        </span>
        <div class="dl-secret__heading">
          <h2 class="dl-secret__title">{{ title }}</h2>
          <p v-if="description" class="dl-secret__description">{{ description }}</p>
        </div>
      </header>

      <div class="dl-secret__body">
        <div v-if="warning" class="dl-secret__warning" role="alert">
          <VIcon icon="mdi-alert-outline" size="18" class="dl-secret__warning-icon" />
          <span>{{ warning }}</span>
        </div>

        <div class="dl-secret__field">
          <label :for="valueId" class="dl-secret__label">{{ label ?? t('secret.label') }}</label>

          <Transition name="dl-secret-swap" mode="out-in">
            <textarea
              v-if="revealed"
              :id="valueId"
              key="revealed"
              class="dl-secret__value"
              :value="secret"
              rows="6"
              readonly
              spellcheck="false"
              autocomplete="off"
              @focus="selectAll"
            />
            <code v-else :id="valueId" key="masked" class="dl-secret__masked">{{ masked }}</code>
          </Transition>

          <div class="dl-secret__tools">
            <VBtn
              size="small"
              variant="tonal"
              :prepend-icon="revealed ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click="revealed = !revealed"
            >
              {{ revealed ? t('common.hide') : t('secret.reveal') }}
            </VBtn>
            <VBtn
              size="small"
              variant="tonal"
              :color="copied ? 'success' : undefined"
              :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              @click="copy"
            >
              {{ copied ? t('common.copied') : t('common.copy') }}
            </VBtn>
          </div>
        </div>

        <VCheckbox
          v-model="acknowledged"
          :label="acknowledgeLabel ?? t('secret.acknowledge')"
          color="primary"
          density="comfortable"
          hide-details
        />
      </div>

      <footer class="dl-secret__foot">
        <DlButton :disabled="!acknowledged" @click="close">{{ t('secret.done') }}</DlButton>
      </footer>
    </VCard>
  </VDialog>
</template>

<style scoped>
.dl-secret {
  background: var(--dl-surface);
  font-family: var(--dl-font);
}

.dl-secret__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--dl-outline);
}

.dl-secret__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--dl-radius-md, 10px);
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.12);
  flex-shrink: 0;
}

.dl-secret__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--dl-on-surface);
}

.dl-secret__description {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
}

.dl-secret__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
}

.dl-secret__warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface);
  background: rgba(var(--v-theme-warning), 0.1);
  border: 1px solid rgba(var(--v-theme-warning), 0.4);
  border-radius: var(--dl-radius-sm, 6px);
}

.dl-secret__warning-icon {
  color: rgb(var(--v-theme-warning));
  flex-shrink: 0;
}

.dl-secret__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dl-secret__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dl-on-surface-muted);
}

.dl-secret__masked,
.dl-secret__value {
  display: block;
  width: 100%;
  padding: 10px 12px;
  font-family: var(--dl-font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--dl-on-surface);
  background: var(--dl-surface-variant);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-sm, 6px);
  overflow-wrap: anywhere;
}

.dl-secret__value {
  resize: vertical;
  outline: none;
}

.dl-secret__value:focus-visible {
  border-color: var(--dl-primary);
}

.dl-secret__tools {
  display: flex;
  gap: 8px;
}

.dl-secret__foot {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid var(--dl-outline);
}

.dl-secret-swap-enter-active,
.dl-secret-swap-leave-active {
  transition: opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-secret-swap-enter-from,
.dl-secret-swap-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dl-secret-swap-enter-active,
  .dl-secret-swap-leave-active {
    transition: opacity 1ms linear;
  }
}
</style>
