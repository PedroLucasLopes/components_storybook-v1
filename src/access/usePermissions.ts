import { computed, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

export interface Permission {
  path: string;
  method: string;
}

export interface PermissionContext {
  permissions: Ref<Permission[]>;
  routePrefix: Ref<string>;
}

export const PERMISSIONS_KEY: InjectionKey<PermissionContext> =
  Symbol('dl.permissions');

const compile = (permissionPath: string): RegExp => {
  const pattern = permissionPath
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) return '[^/]+';
      if (segment === '*') return '[^/]*';

      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return new RegExp(`^${pattern}$`);
};

const cache = new Map<string, RegExp>();

const matcher = (permissionPath: string): RegExp => {
  const stored = cache.get(permissionPath);

  if (stored) return stored;

  const compiled = compile(permissionPath);

  cache.set(permissionPath, compiled);

  return compiled;
};

const normalize = (routePath: string, prefix: string): string => {
  let output = routePath;

  if (
    prefix &&
    output.startsWith(prefix) &&
    (output.length === prefix.length || output[prefix.length] === '/')
  ) {
    output = output.slice(prefix.length);
  }

  output = output.replace(/\/{2,}/g, '/');

  if (output.length > 1) output = output.replace(/\/+$/, '');

  return output.startsWith('/') ? output : `/${output}`;
};

export function permits(
  permissions: readonly Permission[],
  method: string,
  path: string,
  routePrefix = '',
): boolean {
  const upperMethod = method.toUpperCase();
  const target = normalize(path, routePrefix);

  return permissions.some(
    (permission) =>
      permission.method.toUpperCase() === upperMethod &&
      matcher(normalize(permission.path, '')).test(target),
  );
}

export function providePermissions(
  permissions: Ref<Permission[]>,
  routePrefix: Ref<string>,
): void {
  provide(PERMISSIONS_KEY, { permissions, routePrefix });
}

export function usePermissions() {
  const context = inject(PERMISSIONS_KEY, {
    permissions: ref<Permission[]>([]),
    routePrefix: ref(''),
  });

  const can = (method: string, path: string): boolean =>
    permits(context.permissions.value, method, path, context.routePrefix.value);

  const canAny = (methods: string[], path: string): boolean =>
    methods.some((method) => can(method, path));

  const canAll = (methods: string[], path: string): boolean =>
    methods.every((method) => can(method, path));

  return {
    can,
    canAny,
    canAll,
    permissions: computed(() => context.permissions.value),
    canRead: (path: string) => can('GET', path),
    canCreate: (path: string) => can('POST', path),
    canUpdate: (path: string) => canAny(['PUT', 'PATCH'], path),
    canDelete: (path: string) => can('DELETE', path),
  };
}
