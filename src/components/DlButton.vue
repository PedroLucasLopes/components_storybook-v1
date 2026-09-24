<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    appendIcon?: string;
    color?: string;
    variant?: 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
    size?: 'x-small' | 'small' | 'default' | 'large';
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    type?: 'button' | 'submit';
    spinnerDelay?: number;
  }>(),
  {
    color: 'primary',
    variant: 'flat',
    size: 'default',
    type: 'button',
    spinnerDelay: 220,
  },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const showSpinner = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.loading,
  (loading) => {
    clearTimeout(timer);

    if (!loading) {
      showSpinner.value = false;
      return;
    }

    timer = setTimeout(() => (showSpinner.value = true), props.spinnerDelay);
  },
  { immediate: true },
);

const locked = computed(() => props.loading || props.disabled);
</script>

<template>
  <VBtn
    :color="color"
    :variant="variant"
    :size="size"
    :block="block"
    :type="type"
    :disabled="locked"
    :aria-busy="loading || undefined"
    class="dl-button"
    :class="{ 'dl-button--busy': showSpinner }"
    @click="emit('click', $event)"
  >
    <span class="dl-button__content">
      <VIcon v-if="icon" :icon="icon" size="18" class="dl-button__icon" />
      <slot>{{ label }}</slot>
      <VIcon v-if="appendIcon" :icon="appendIcon" size="18" class="dl-button__icon" />
    </span>

    <Transition name="dl-button-spinner">
      <span v-if="showSpinner" class="dl-button__spinner">
        <VProgressCircular :size="size === 'small' || size === 'x-small' ? 16 : 20" width="2" indeterminate />
      </span>
    </Transition>
  </VBtn>
</template>

<style scoped>
.dl-button {
  position: relative;
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-button:not(:disabled):active {
  transform: translateY(1px);
}

.dl-button__content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-button--busy .dl-button__content {
  opacity: 0;
}

.dl-button__icon {
  flex-shrink: 0;
}

.dl-button__spinner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.dl-button-spinner-enter-active,
.dl-button-spinner-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-button-spinner-enter-from,
.dl-button-spinner-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (prefers-reduced-motion: reduce) {
  .dl-button,
  .dl-button__content,
  .dl-button-spinner-enter-active,
  .dl-button-spinner-leave-active {
    transition: none;
  }

  .dl-button:not(:disabled):active {
    transform: none;
  }

  .dl-button-spinner-enter-from,
  .dl-button-spinner-leave-to {
    transform: none;
  }
}
</style>
