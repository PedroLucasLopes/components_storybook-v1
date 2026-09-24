export interface RouteTreeEntry {
  id: string;
  method: string;
  path: string;
  warning?: string;
}

export interface RouteTreeNode<Entry extends RouteTreeEntry = RouteTreeEntry> {
  key: string;
  base: string;
  routes: Entry[];
  group: boolean;
  children: RouteTreeNode<Entry>[];
  descendants: number;
}

export interface RouteTreeFilter {
  query?: string;
  methods?: readonly string[];
}

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'UPDATE', 'DELETE'];

const methodRank = (method: string): number => {
  const index = METHOD_ORDER.indexOf(method.toUpperCase());

  return index === -1 ? METHOD_ORDER.length : index;
};

export const pathSegments = (path: string): string[] => path.split('/').filter(Boolean);

export const normalizeRoutePath = (path: string): string => `/${pathSegments(path.trim()).join('/')}`;

const isDynamic = (segment: string): boolean => segment.startsWith(':') || segment.includes('*');

export const routeParams = (path: string): string[] =>
  pathSegments(path)
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.slice(1).replace(/\?$/, ''));

const compareSegments = (a: string[], b: string[]): number => {
  const length = Math.min(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? '';
    const right = b[index] ?? '';

    if (left === right) continue;

    const dynamic = Number(isDynamic(left)) - Number(isDynamic(right));

    if (dynamic !== 0) return dynamic;

    return left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' }) || (left < right ? -1 : 1);
  }

  return a.length - b.length;
};

interface TrieNode<Entry> {
  segments: string[];
  routes: Entry[];
  children: Map<string, TrieNode<Entry>>;
}

function toNode<Entry extends RouteTreeEntry>(
  key: string,
  base: string,
  routes: Entry[],
  children: RouteTreeNode<Entry>[],
): RouteTreeNode<Entry> {
  return {
    key,
    base,
    routes: [...routes].sort(
      (a, b) => methodRank(a.method) - methodRank(b.method) || a.method.localeCompare(b.method),
    ),
    group: routes.length === 0,
    children,
    descendants: children.reduce((total, child) => total + child.descendants + (child.group ? 0 : 1), 0),
  };
}

function compress<Entry extends RouteTreeEntry>(parent: TrieNode<Entry>, base: string): RouteTreeNode<Entry>[] {
  const result: { segments: string[]; node: RouteTreeNode<Entry> }[] = [];

  for (const start of parent.children.values()) {
    let current = start;

    while (current.routes.length === 0 && current.children.size === 1) {
      const [only] = current.children.values();

      if (!only) break;

      current = only;
    }

    const key = `/${current.segments.join('/')}`;

    result.push({
      segments: current.segments,
      node: toNode(key, base, current.routes, compress(current, key)),
    });
  }

  return result.sort((a, b) => compareSegments(a.segments, b.segments)).map((item) => item.node);
}

export function buildRouteTree<Entry extends RouteTreeEntry>(entries: readonly Entry[]): RouteTreeNode<Entry>[] {
  const root: TrieNode<Entry> = { segments: [], routes: [], children: new Map() };

  for (const entry of entries) {
    let node = root;

    for (const segment of pathSegments(entry.path)) {
      let child = node.children.get(segment);

      if (!child) {
        child = { segments: [...node.segments, segment], routes: [], children: new Map() };
        node.children.set(segment, child);
      }

      node = child;
    }

    node.routes.push(entry);
  }

  const nodes = compress(root, '');

  if (root.routes.length > 0) nodes.unshift(toNode('/', '', root.routes, []));

  return nodes;
}

export function filterRouteTree<Entry extends RouteTreeEntry>(
  nodes: readonly RouteTreeNode<Entry>[],
  filter: RouteTreeFilter,
): { nodes: RouteTreeNode<Entry>[]; matches: Set<string> } {
  const query = filter.query?.trim().toLowerCase() ?? '';
  const methods = new Set((filter.methods ?? []).map((method) => method.toUpperCase()));
  const matches = new Set<string>();

  const visit = (list: readonly RouteTreeNode<Entry>[]): RouteTreeNode<Entry>[] => {
    const kept: RouteTreeNode<Entry>[] = [];

    for (const node of list) {
      const children = visit(node.children);
      const byQuery = !query || node.key.toLowerCase().includes(query);
      const byMethod = methods.size === 0 || node.routes.some((route) => methods.has(route.method.toUpperCase()));

      if (byQuery && byMethod) matches.add(node.key);

      if ((byQuery && byMethod) || children.length > 0) kept.push({ ...node, children });
    }

    return kept;
  };

  return { nodes: visit(nodes), matches };
}

export function findRouteNode<Entry extends RouteTreeEntry>(
  nodes: readonly RouteTreeNode<Entry>[],
  key: string,
): RouteTreeNode<Entry> | null {
  for (const node of nodes) {
    if (node.key === key) return node;

    const found = findRouteNode(node.children, key);

    if (found) return found;
  }

  return null;
}

export function routeAncestorKeys<Entry extends RouteTreeEntry>(
  nodes: readonly RouteTreeNode<Entry>[],
  key: string,
): string[] {
  const walk = (list: readonly RouteTreeNode<Entry>[], trail: string[]): string[] | null => {
    for (const node of list) {
      if (node.key === key) return trail;

      const found = walk(node.children, [...trail, node.key]);

      if (found) return found;
    }

    return null;
  };

  return walk(nodes, []) ?? [];
}

export function routeBranchKeys<Entry extends RouteTreeEntry>(nodes: readonly RouteTreeNode<Entry>[]): string[] {
  return nodes.flatMap((node) =>
    node.children.length > 0 ? [node.key, ...routeBranchKeys(node.children)] : [],
  );
}

export function countRouteNodes<Entry extends RouteTreeEntry>(nodes: readonly RouteTreeNode<Entry>[]): number {
  return nodes.reduce((total, node) => total + 1 + countRouteNodes(node.children), 0);
}
