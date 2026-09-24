<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { useDotlogText } from '../i18n/useDotlogText';
import DlLoader from './DlLoader.vue';
import DlNavDrawer, { type NavGroup, type NavItem } from './DlNavDrawer.vue';

withDefaults(
  defineProps<{
    groups: NavGroup[];
    active?: string;
    title: string;
    subtitle?: string;
    logo?: string;
    open?: boolean;
    collapsed?: boolean;
    loading?: boolean;
    maxWidth?: number | string;
  }>(),
  { open: false, collapsed: false, loading: false, maxWidth: 1280 },
);

const emit = defineEmits<{
  'update:open': [open: boolean];
  'update:collapsed': [collapsed: boolean];
  navigate: [item: NavItem];
}>();

const { mdAndDown } = useDisplay();
const { t } = useDotlogText();

const focusContent = (): void => {
  document.getElementById('dl-shell-content')?.focus();
};
</script>

<template>
  <VLayout class="dl-shell">
    <a href="#dl-shell-content" class="dl-shell__skip" @click.prevent="focusContent">
      {{ t('shell.skipToContent') }}
    </a>

    <DlLoader :active="loading" variant="bar" :message="t('shell.loadingPage')" />

    <DlNavDrawer
      :open="open"
      :collapsed="collapsed"
      :groups="groups"
      :active="active"
      :title="title"
      :subtitle="subtitle"
      :logo="logo"
      @update:open="emit('update:open', $event)"
      @update:collapsed="emit('update:collapsed', $event)"
      @navigate="emit('navigate', $event)"
    >
      <template v-if="$slots['nav-footer']" #footer>
        <slot name="nav-footer" />
      </template>
    </DlNavDrawer>

    <VAppBar flat height="60" color="surface" border="b" class="dl-shell__bar">
      <div class="dl-shell__bar-inner">
        <VBtn
          v-if="mdAndDown"
          icon="mdi-menu"
          :aria-label="t('common.openMenu')"
          variant="text"
          density="comfortable"
          @click="emit('update:open', true)"
        />
        <span v-if="mdAndDown" class="dl-shell__bar-title">{{ title }}</span>

        <div class="dl-shell__bar-start">
          <slot name="top-start" />
        </div>

        <div class="dl-shell__bar-end">
          <slot name="top-actions" />
        </div>
      </div>
    </VAppBar>

    <VMain class="dl-shell__main">
      <div
        id="dl-shell-content"
        class="dl-shell__content"
        tabindex="-1"
        :style="{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }"
      >
        <slot />
      </div>
    </VMain>
  </VLayout>
</template>

<style scoped>
.dl-shell {
  min-height: 100%;
  font-family: var(--dl-font);
}

.dl-shell__skip {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 3000;
  padding: 8px 14px;
  border-radius: var(--dl-radius-sm, 6px);
  background: var(--dl-primary);
  color: var(--dl-on-primary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: top var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-shell__skip:focus {
  top: 12px;
}

.dl-shell__bar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 16px;
}

.dl-shell__bar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--dl-on-surface);
  white-space: nowrap;
}

.dl-shell__bar-start {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
}

.dl-shell__bar-end {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dl-shell__main {
  background: var(--dl-background);
}

.dl-shell__content {
  margin: 0 auto;
  padding: 24px;
  outline: none;
}

@media (max-width: 599px) {
  .dl-shell__content {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dl-shell__skip {
    transition: none;
  }
}
</style>
