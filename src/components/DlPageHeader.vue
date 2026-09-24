<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { usePermissions } from '../access/usePermissions';
import { useDotlogText } from '../i18n/useDotlogText';

export interface HeaderAction {
  key: string;
  label: string;
  icon?: string;
  method: string;
  path: string;
  color?: string;
  variant?: 'flat' | 'tonal' | 'outlined' | 'text';
}

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    actions?: HeaderAction[];
    breadcrumbs?: { label: string; to?: string }[];
    withMenu?: boolean;
  }>(),
  { actions: () => [], breadcrumbs: () => [], withMenu: true },
);

const emit = defineEmits<{
  action: [key: string];
  openMenu: [];
  navigate: [to: string];
}>();

const { can } = usePermissions();
const { mdAndDown } = useDisplay();
const { t } = useDotlogText();

const visibleActions = computed(() =>
  props.actions.filter((action) => can(action.method, action.path)),
);
</script>

<template>
  <header class="dl-header">
    <div class="dl-header__left">
      <VBtn
        v-if="withMenu && mdAndDown"
        icon="mdi-menu"
        :aria-label="t('common.openMenu')"
        variant="text"
        density="comfortable"
        @click="emit('openMenu')"
      />

      <div class="dl-header__text">
        <nav v-if="breadcrumbs.length" class="dl-header__crumbs" :aria-label="t('header.breadcrumb')">
          <template v-for="(item, index) in breadcrumbs" :key="item.label">
            <button
              v-if="item.to && index < breadcrumbs.length - 1"
              type="button"
              class="dl-header__crumb dl-header__crumb--link"
              @click="emit('navigate', item.to)"
            >
              {{ item.label }}
            </button>
            <span v-else class="dl-header__crumb">{{ item.label }}</span>
            <span
              v-if="index < breadcrumbs.length - 1"
              class="dl-header__crumb-sep"
              aria-hidden="true"
            >/</span>
          </template>
        </nav>

        <h1 class="dl-header__title">{{ title }}</h1>
        <p v-if="description" class="dl-header__description">{{ description }}</p>
      </div>
    </div>

    <div v-if="visibleActions.length || $slots.actions" class="dl-header__actions">
      <slot name="actions" />
      <VBtn
        v-for="action in visibleActions"
        :key="action.key"
        :prepend-icon="action.icon"
        :color="action.color ?? 'primary'"
        :variant="action.variant ?? 'flat'"
        @click="emit('action', action.key)"
      >
        {{ action.label }}
      </VBtn>
    </div>
  </header>
</template>

<style scoped>
.dl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dl-space-md, 16px);
  padding-bottom: var(--dl-space-md, 16px);
  flex-wrap: wrap;
}

.dl-header__left {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.dl-header__text {
  min-width: 0;
}

.dl-header__crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--dl-on-surface-muted);
  flex-wrap: wrap;
}

.dl-header__crumb {
  color: inherit;
}

.dl-header__crumb--link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dl-header__crumb--link:hover {
  color: var(--dl-primary);
}

.dl-header__crumb-sep {
  opacity: 0.5;
}

.dl-header__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--dl-on-surface);
}

.dl-header__description {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--dl-on-surface-muted);
  max-width: 64ch;
}

.dl-header__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

@media (max-width: 599px) {
  .dl-header__actions {
    width: 100%;
  }

  .dl-header__actions > * {
    flex: 1 1 auto;
  }
}
</style>
