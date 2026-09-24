<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open?: string[];
    panels: { key: string; title: string; summary?: string; icon?: string }[];
    multiple?: boolean;
    density?: 'default' | 'comfortable' | 'compact';
  }>(),
  { open: () => [], density: 'comfortable' },
);

const emit = defineEmits<{ 'update:open': [open: string[]] }>();

const toggle = (value: unknown): void => {
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value];

  emit('update:open', list as string[]);
};
</script>

<template>
  <VExpansionPanels
    :model-value="multiple ? open : open[0]"
    :multiple="multiple"
    :flat="true"
    variant="accordion"
    class="dl-expansion"
    @update:model-value="toggle"
  >
    <VExpansionPanel
      v-for="panel in panels"
      :key="panel.key"
      :value="panel.key"
      elevation="0"
    >
      <VExpansionPanelTitle>
        <div class="dl-expansion__head">
          <VIcon v-if="panel.icon" :icon="panel.icon" size="18" class="dl-expansion__icon" />
          <span class="dl-expansion__title">{{ panel.title }}</span>
          <span v-if="panel.summary" class="dl-expansion__summary">{{ panel.summary }}</span>
        </div>
      </VExpansionPanelTitle>

      <VExpansionPanelText>
        <slot :name="panel.key" />
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style scoped>
.dl-expansion {
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  overflow: hidden;
  background: var(--dl-surface);
}

.dl-expansion__head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
}

.dl-expansion__icon {
  color: var(--dl-on-surface-muted);
  flex-shrink: 0;
}

.dl-expansion__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--dl-on-surface);
  flex-shrink: 0;
}

.dl-expansion__summary {
  font-size: 13px;
  color: var(--dl-on-surface-muted);
  margin-left: auto;
  padding-left: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .dl-expansion__summary { display: none; }
}
</style>
