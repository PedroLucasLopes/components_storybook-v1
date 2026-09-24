<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { usePermissions } from '../access/usePermissions';
import { useDotlogText } from '../i18n/useDotlogText';

export interface Column<Row> {
  key: string;
  label: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
  mono?: boolean;
  secondary?: boolean;
  format?: (row: Row) => string;
}

export interface RowAction<Row> {
  key: string;
  label: string;
  icon: string;
  method: string;
  path: string;
  color?: string;
  primary?: boolean;
  unavailable?: (row: Row) => boolean;
}

const props = withDefaults(
  defineProps<{
    columns: Column<T>[];
    rows: T[];
    rowKey?: string;
    actions?: RowAction<T>[];
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    page?: number;
    limit?: number;
    density?: 'default' | 'comfortable' | 'compact';
    bare?: boolean;
    paged?: boolean;
  }>(),
  {
    rowKey: 'id',
    actions: () => [],
    emptyTitle: undefined,
    emptyDescription: undefined,
    page: 1,
    limit: 20,
    density: 'comfortable',
    paged: true,
  },
);

const emit = defineEmits<{
  action: [key: string, row: T];
  'update:page': [page: number];
  rowClick: [row: T];
}>();

const { can } = usePermissions();
const { mdAndDown } = useDisplay();
const { t } = useDotlogText();

const visibleActions = computed(() =>
  props.actions.filter((action) => can(action.method, action.path)),
);

const visibleColumns = computed(() =>
  props.columns.filter((column) => !(mdAndDown.value && column.secondary)),
);

const valueOf = (row: T, column: Column<T>): string => {
  if (column.format) return column.format(row);

  const raw = row[column.key];

  return raw === null || raw === undefined || raw === '' ? '—' : String(raw);
};

const keyOf = (row: T, index: number): string => String(row[props.rowKey] ?? index);

const hasNext = computed(() => props.rows.length >= props.limit);
const hasPrevious = computed(() => props.page > 1);
</script>

<template>
  <div class="dl-table" :class="{ 'dl-table--bare': bare }">
    <div v-if="loading" class="dl-table__skeleton" role="status" aria-live="polite">
      <span class="dl-table__sr">{{ t('common.loading') }}</span>
      <div v-for="n in 6" :key="n" class="dl-table__skeleton-row" />
    </div>

    <div v-else-if="rows.length === 0" class="dl-table__empty">
      <VIcon icon="mdi-tray-remove" size="40" class="dl-table__empty-icon" />
      <p class="dl-table__empty-title">{{ emptyTitle ?? t('table.emptyTitle') }}</p>
      <p class="dl-table__empty-text">{{ emptyDescription ?? t('table.emptyDescription') }}</p>
      <slot name="empty-action" />
    </div>

    <div v-else-if="mdAndDown" class="dl-table__cards">
      <article
        v-for="(row, index) in rows"
        :key="keyOf(row, index)"
        class="dl-table__card"
        @click="emit('rowClick', row)"
      >
        <div v-for="column in columns" :key="column.key" class="dl-table__card-row">
          <span class="dl-table__card-label">{{ column.label }}</span>
          <span class="dl-table__card-value" :class="{ 'dl-table__mono': column.mono }">
            <slot :name="`col-${column.key}`" :row="row">{{ valueOf(row, column) }}</slot>
          </span>
        </div>

        <footer v-if="visibleActions.length" class="dl-table__card-actions">
          <VBtn
            v-for="action in visibleActions"
            :key="action.key"
            :prepend-icon="action.icon"
            :color="action.color ?? (action.primary ? 'primary' : undefined)"
            :variant="action.primary ? 'flat' : 'text'"
            :disabled="action.unavailable?.(row)"
            size="small"
            @click.stop="emit('action', action.key, row)"
          >
            {{ action.label }}
          </VBtn>
        </footer>
      </article>
    </div>

    <div v-else class="dl-table__scroll">
      <table class="dl-table__grid" :class="`dl-table__grid--${density}`">
        <thead>
          <tr>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :style="{ width: column.width, textAlign: column.align ?? 'start' }"
              scope="col"
            >
              {{ column.label }}
            </th>
            <th v-if="visibleActions.length" class="dl-table__actions-head" scope="col">
              <span class="dl-table__sr">{{ t('table.actions') }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="keyOf(row, index)"
            tabindex="0"
            @click="emit('rowClick', row)"
            @keydown.enter="emit('rowClick', row)"
          >
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              :class="{ 'dl-table__mono': column.mono }"
              :style="{ textAlign: column.align ?? 'start' }"
            >
              <slot :name="`col-${column.key}`" :row="row">{{ valueOf(row, column) }}</slot>
            </td>

            <td v-if="visibleActions.length" class="dl-table__actions">
              <div class="dl-table__actions-inner">
                <VBtn
                  v-for="action in visibleActions"
                  :key="action.key"
                  :icon="action.icon"
                  :color="action.color ?? (action.primary ? 'primary' : undefined)"
                  :variant="action.primary ? 'flat' : 'text'"
                  :rounded="action.primary ? 'circle' : undefined"
                  :aria-label="action.label"
                  :title="action.label"
                  :disabled="action.unavailable?.(row)"
                  size="small"
                  density="comfortable"
                  @click.stop="emit('action', action.key, row)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="paged && !loading && rows.length > 0" class="dl-table__pager" :aria-label="t('table.pagination')">
      <span class="dl-table__pager-info">{{ t('table.page', { page }) }}</span>
      <div class="dl-table__pager-buttons">
        <VBtn
          :disabled="!hasPrevious"
          prepend-icon="mdi-chevron-left"
          variant="text"
          size="small"
          @click="emit('update:page', page - 1)"
        >
          {{ t('table.previous') }}
        </VBtn>
        <VBtn
          :disabled="!hasNext"
          append-icon="mdi-chevron-right"
          variant="text"
          size="small"
          @click="emit('update:page', page + 1)"
        >
          {{ t('table.next') }}
        </VBtn>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.dl-table {
  background: var(--dl-surface);
  border: 1px solid var(--dl-outline);
  border-radius: var(--dl-radius-lg, 16px);
  overflow: hidden;
  font-family: var(--dl-font);
  color: var(--dl-on-surface);
}

.dl-table--bare {
  border: none;
  border-radius: 0;
}

.dl-table__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.dl-table__scroll {
  overflow-x: auto;
}

.dl-table__grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.dl-table__grid th {
  background: var(--dl-surface-variant);
  color: var(--dl-on-surface-muted);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 10px 16px;
  white-space: nowrap;
  border-bottom: 1px solid var(--dl-outline);
}

.dl-table__grid td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--dl-outline);
  vertical-align: middle;
}

.dl-table__grid--compact td {
  padding: 7px 16px;
}

.dl-table__grid--default td {
  padding: 16px;
}

.dl-table__grid tbody tr:last-child td {
  border-bottom: none;
}

.dl-table__grid tbody tr {
  cursor: pointer;
  transition: background var(--dl-motion-fast, 120ms) var(--dl-easing);
}

.dl-table__grid tbody tr:hover,
.dl-table__grid tbody tr:focus-visible {
  background: var(--dl-surface-variant);
}

.dl-table__grid tbody tr:focus-visible {
  outline: 2px solid var(--dl-primary);
  outline-offset: -2px;
}

.dl-table__mono {
  font-family: var(--dl-font-mono);
  font-size: 13px;
}

.dl-table__actions,
.dl-table__actions-head {
  width: 1%;
  white-space: nowrap;
  text-align: end;
}

.dl-table__actions-inner {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
}

.dl-table__actions-inner :deep(.v-btn--icon) {
  width: auto;
  aspect-ratio: 1;
}

.dl-table__cards {
  display: flex;
  flex-direction: column;
}

.dl-table__card {
  padding: 14px 16px;
  border-bottom: 1px solid var(--dl-outline);
  cursor: pointer;
}

.dl-table__card:last-child {
  border-bottom: none;
}

.dl-table__card-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 3px 0;
  font-size: 14px;
}

.dl-table__card-label {
  color: var(--dl-on-surface-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.dl-table__card-value {
  text-align: end;
  min-width: 0;
  overflow-wrap: anywhere;
}

.dl-table__card-actions {
  display: flex;
  gap: 4px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.dl-table__empty {
  padding: 56px 24px;
  text-align: center;
}

.dl-table__empty-icon {
  color: var(--dl-on-surface-muted);
  opacity: 0.6;
}

.dl-table__empty-title {
  margin: 12px 0 4px;
  font-size: 16px;
  font-weight: 500;
}

.dl-table__empty-text {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--dl-on-surface-muted);
}

.dl-table__skeleton {
  padding: 16px;
}

.dl-table__skeleton-row {
  height: 40px;
  border-radius: var(--dl-radius-sm, 6px);
  background: var(--dl-surface-variant);
  margin-bottom: 8px;
  animation: dl-pulse 1.4s ease-in-out infinite;
}

.dl-table__skeleton-row:nth-child(even) {
  opacity: 0.7;
}

@keyframes dl-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
  .dl-table__skeleton-row { animation: none; }
  .dl-table__grid tbody tr { transition: none; }
}

.dl-table__pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid var(--dl-outline);
  background: var(--dl-surface);
}

.dl-table__pager-info {
  font-size: 13px;
  color: var(--dl-on-surface-muted);
}

.dl-table__pager-buttons {
  display: flex;
  gap: 4px;
}
</style>
