<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    count?: number | string;
    padded?: boolean;
    headingLevel?: 2 | 3;
  }>(),
  { padded: true, headingLevel: 2 },
);
</script>

<template>
  <section class="dl-section">
    <header class="dl-section__head">
      <div class="dl-section__heading">
        <component :is="`h${headingLevel}`" class="dl-section__title">
          <slot name="title">{{ title }}</slot>
          <span v-if="count !== undefined" class="dl-section__count">{{ count }}</span>
        </component>
        <p v-if="description" class="dl-section__description">{{ description }}</p>
      </div>

      <div v-if="$slots.actions" class="dl-section__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="dl-section__body" :class="{ 'dl-section__body--padded': padded }">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="dl-section__foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.dl-section {
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
  min-width: 0;
  overflow: hidden;
}

.dl-section__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--dl-outline);
  flex-wrap: wrap;
}

.dl-section__heading {
  min-width: 0;
}

.dl-section__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.dl-section__count {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: var(--dl-radius-pill, 999px);
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-variant-numeric: tabular-nums;
}

.dl-section__description {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dl-on-surface-muted);
  max-width: 72ch;
}

.dl-section__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dl-section__body--padded {
  padding: 18px;
}

.dl-section__foot {
  padding: 12px 18px;
  border-top: 1px solid var(--dl-outline);
  font-size: 13px;
  color: var(--dl-on-surface-muted);
}

@media (max-width: 599px) {
  .dl-section__actions {
    width: 100%;
  }

  .dl-section__actions > * {
    flex: 1 1 auto;
  }
}
</style>
