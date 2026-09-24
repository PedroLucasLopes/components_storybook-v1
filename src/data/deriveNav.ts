import type { NavGroup, NavItem } from '../components/DlNavDrawer.vue';
import type { Permission } from '../access/usePermissions';
import { humanize } from './inferColumns';

export interface NavOverride {
  label?: string;
  icon?: string;
  to?: string;
  group?: string;
  order?: number;
  badge?: string | number;
  hidden?: boolean;
}

export interface DeriveNavOptions {
  overrides?: Record<string, NavOverride>;
  groups?: { key: string; title?: string }[];
  defaultIcon?: string;
  routePrefix?: string;
}

const isClickable = (path: string): boolean => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length !== 1) return false;

  return !segments[0].startsWith(':') && segments[0] !== '*';
};

const UNCOUNTABLE = new Set([
  'equipment', 'staff', 'software', 'hardware', 'information', 'data',
  'news', 'access', 'inventory', 'maintenance', 'health', 'stock',
]);

const pluralize = (word: string): string => {
  if (UNCOUNTABLE.has(word.toLowerCase())) return word;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;

  return `${word}s`;
};

export function deriveNavGroups(
  permissions: Permission[],
  options: DeriveNavOptions = {},
): NavGroup[] {
  const {
    overrides = {},
    groups = [],
    defaultIcon = 'mdi-circle-small',
    routePrefix = '',
  } = options;

  const seen = new Set<string>();
  const items: (NavItem & { group: string; order: number })[] = [];

  for (const permission of permissions) {
    if (permission.method.toUpperCase() !== 'GET') continue;

    const path = permission.path.startsWith('/') ? permission.path : `/${permission.path}`;

    if (!isClickable(path) || seen.has(path)) continue;

    seen.add(path);

    const override = overrides[path] ?? {};

    if (override.hidden) continue;

    const slug = path.slice(1);
    const label = override.label ?? pluralize(humanize(slug));

    items.push({
      key: slug,
      label,
      icon: override.icon ?? defaultIcon,
      to: override.to ?? `${routePrefix}${path}`,
      permission: { method: 'GET', path },
      badge: override.badge,
      group: override.group ?? '',
      order: override.order ?? Number.MAX_SAFE_INTEGER,
    });
  }

  items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  const declared = groups.length > 0 ? groups : [{ key: '', title: undefined }];
  const byGroup = new Map<string, NavItem[]>();

  for (const item of items) {
    const { group, order: _order, ...rest } = item;

    void _order;

    const bucket = byGroup.get(group) ?? [];

    bucket.push(rest);
    byGroup.set(group, bucket);
  }

  const result: NavGroup[] = [];

  for (const group of declared) {
    const bucket = byGroup.get(group.key);

    if (bucket?.length) {
      result.push({ key: group.key || 'default', title: group.title, items: bucket });
      byGroup.delete(group.key);
    }
  }

  for (const [key, bucket] of byGroup) {
    if (bucket.length) result.push({ key: key || 'default', title: undefined, items: bucket });
  }

  return result;
}
