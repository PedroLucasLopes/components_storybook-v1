<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePermissions } from '../access/usePermissions';

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  count?: number | string;
  permission?: { method: string; path: string };
}

const props = defineProps<{
  modelValue: string;
  tabs: TabItem[];
}>();

const emit = defineEmits<{ 'update:modelValue': [key: string] }>();

const { can } = usePermissions();

const visibleTabs = computed(() =>
  props.tabs.filter((tab) => !tab.permission || can(tab.permission.method, tab.permission.path)),
);

watch(
  [visibleTabs, () => props.modelValue],
  ([tabs, current]) => {
    const first = tabs[0];

    if (first && !tabs.some((tab) => tab.key === current)) {
      emit('update:modelValue', first.key);
    }
  },
  { immediate: true },
);

const active = computed(() => visibleTabs.value.find((tab) => tab.key === props.modelValue));
</script>

<template>
  <div class="dl-tabs">
    <VTabs
      :model-value="modelValue"
      color="primary"
      density="comfortable"
      show-arrows
      class="dl-tabs__bar"
      @update:model-value="emit('update:modelValue', String($event))"
    >
      <VTab
        v-for="tab in visibleTabs"
        :key="tab.key"
        :value="tab.key"
        :prepend-icon="tab.icon"
        class="dl-tabs__tab"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="dl-tabs__count">{{ tab.count }}</span>
      </VTab>
    </VTabs>

    <div class="dl-tabs__panel" role="tabpanel" :aria-label="active?.label">
      <Transition name="dl-tabs-swap" mode="out-in">
        <div :key="modelValue" class="dl-tabs__content">
          <slot :name="modelValue" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.dl-tabs {
  min-width: 0;
}

.dl-tabs__bar {
  border-bottom: 1px solid var(--dl-outline);
}

.dl-tabs__tab {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.dl-tabs__count {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  padding: 0 7px;
  line-height: 18px;
  border-radius: var(--dl-radius-pill, 999px);
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-variant-numeric: tabular-nums;
}

.dl-tabs__panel {
  padding-top: 16px;
}

.dl-tabs__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dl-tabs-swap-enter-active,
.dl-tabs-swap-leave-active {
  transition:
    opacity var(--dl-motion-fast, 120ms) var(--dl-easing),
    transform var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-tabs-swap-enter-from,
.dl-tabs-swap-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .dl-tabs-swap-enter-active,
  .dl-tabs-swap-leave-active {
    transition: opacity 1ms linear;
  }

  .dl-tabs-swap-enter-from,
  .dl-tabs-swap-leave-to {
    transform: none;
  }
}
</style>
