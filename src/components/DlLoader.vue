<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDotlogText } from '../i18n/useDotlogText';

const props = withDefaults(
  defineProps<{
    active: boolean;
    variant?: 'bar' | 'inline' | 'overlay';
    message?: string;
    delay?: number;
  }>(),
  { variant: 'bar', delay: 220 },
);

const { t } = useDotlogText();

const visible = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.active,
  (active) => {
    clearTimeout(timer);

    if (!active) {
      visible.value = false;
      return;
    }

    timer = setTimeout(() => (visible.value = true), props.delay);
  },
  { immediate: true },
);
</script>

<template>
  <Transition :name="variant === 'bar' ? 'dl-loader-bar' : 'dl-loader-fade'">
    <div
      v-if="visible"
      class="dl-loader"
      :class="`dl-loader--${variant}`"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <template v-if="variant === 'bar'">
        <span class="dl-loader__sr">{{ message ?? t('common.loading') }}</span>
        <span class="dl-loader__track"><span class="dl-loader__indicator" /></span>
      </template>

      <template v-else>
        <VProgressCircular :size="variant === 'overlay' ? 38 : 28" width="3" color="primary" indeterminate />
        <p v-if="message" class="dl-loader__message">{{ message }}</p>
        <span v-else class="dl-loader__sr">{{ t('common.loading') }}</span>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.dl-loader__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.dl-loader--bar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 2500;
  height: 3px;
}

.dl-loader__track {
  display: block;
  height: 100%;
  width: 100%;
  background: rgba(var(--v-theme-primary), 0.16);
  overflow: hidden;
}

.dl-loader__indicator {
  display: block;
  height: 100%;
  width: 40%;
  background: var(--dl-primary);
  border-radius: 0 2px 2px 0;
  animation: dl-bar 1.3s var(--dl-easing) infinite;
}

@keyframes dl-bar {
  0% { transform: translateX(-100%) scaleX(0.6); }
  50% { transform: translateX(90%) scaleX(1); }
  100% { transform: translateX(260%) scaleX(0.6); }
}

.dl-loader--inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  min-height: 160px;
}

.dl-loader--overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(var(--v-theme-surface), 0.82);
  backdrop-filter: blur(2px);
}

.dl-loader__message {
  margin: 0;
  font-family: var(--dl-font);
  font-size: 13px;
  color: var(--dl-on-surface-muted);
  text-align: center;
  max-width: 40ch;
}

.dl-loader-fade-enter-active,
.dl-loader-fade-leave-active {
  transition: opacity var(--dl-motion-normal, 200ms) var(--dl-easing);
}

.dl-loader-fade-enter-from,
.dl-loader-fade-leave-to {
  opacity: 0;
}

.dl-loader-bar-enter-active,
.dl-loader-bar-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-loader-bar-enter-from,
.dl-loader-bar-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .dl-loader__indicator {
    animation: none;
    width: 100%;
    opacity: 0.7;
  }

  .dl-loader-fade-enter-active,
  .dl-loader-fade-leave-active,
  .dl-loader-bar-enter-active,
  .dl-loader-bar-leave-active {
    transition: opacity 1ms linear;
  }

  .dl-loader-bar-enter-from,
  .dl-loader-bar-leave-to {
    transform: none;
  }

  .dl-loader--overlay {
    backdrop-filter: none;
  }
}
</style>
