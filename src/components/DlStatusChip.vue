<script setup lang="ts">
import { computed } from 'vue';

export type StatusTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'dark';

export interface StatusDefinition {
  label: string;
  tone: StatusTone;
  icon?: string;
}

const props = withDefaults(
  defineProps<{
    status: string;
    map: Record<string, StatusDefinition>;
    size?: 'small' | 'default';
    withIcon?: boolean;
  }>(),
  { size: 'small', withIcon: true },
);

const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'on-surface-variant',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  dark: 'on-surface',
};

const definition = computed<StatusDefinition>(
  () => props.map[props.status] ?? { label: props.status, tone: 'neutral' },
);

const style = computed(() => ({
  '--dl-status-rgb': `var(--v-theme-${TONE_COLOR[definition.value.tone]})`,
}));
</script>

<template>
  <span class="dl-status" :class="`dl-status--${size}`" :style="style">
    <VIcon
      v-if="withIcon && definition.icon"
      :icon="definition.icon"
      :size="size === 'small' ? 14 : 16"
      class="dl-status__icon"
    />
    {{ definition.label }}
  </span>
</template>

<style scoped>
.dl-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-family: var(--dl-font);
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: var(--dl-radius-sm, 6px);

  color: rgb(var(--dl-status-rgb));
  background: rgba(var(--dl-status-rgb), 0.12);
  border: 1px solid rgba(var(--dl-status-rgb), 0.42);
}

.dl-status--small {
  font-size: 12px;
  padding: 1px 8px;
  line-height: 1.6;
}

.dl-status--default {
  font-size: 13px;
  padding: 3px 10px;
  line-height: 1.6;
}

.dl-status__icon {
  opacity: 0.9;
  flex-shrink: 0;
}
</style>
