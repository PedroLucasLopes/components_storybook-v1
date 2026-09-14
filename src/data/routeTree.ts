/**
 * Árvore de rotas a partir do catálogo plano.
 *
 * O SSO guarda `Route { method, path }` solto, uma linha por método. Com dez
 * rotas a lista resolve; com trezentas ninguém acha nada. A árvore agrupa pelo
 * que o próprio caminho já diz: `/equipment/:id/create` mora dentro de
 * `/equipment/:id`, que mora dentro de `/equipment`.
 *
 * ## Um nó por caminho, não por rota
 *
 * `GET /equipment/:id` e `DELETE /equipment/:id` são duas linhas no banco e o
 * mesmo endereço. O nó é o caminho, e os métodos vão juntos dentro dele.
 *
 * ## Prefixo sem rota vira grupo, só quando agrupa
 *
 * `/generate/contract/:id` e `/generate/closure/:id` não têm `/generate`
 * cadastrado. Soltos na raiz, dois irmãos óbvios ficariam separados, então
 * `/generate` entra como grupo. Prefixo com um filho só não entra: a cadeia
 * `/api` › `/api/v1` › `/api/v1/foo` para uma rota seria três cliques de nada.
 * É a compressão de uma árvore radix, por segmento.
 *
 * ## Segmento é texto, não padrão
 *
 * `/equipment/:id` e `/equipment/:projectId` são irmãos, não o mesmo nó. O
 * catálogo compara o texto do caminho, e a tela mostra o que o catálogo tem.
 */

export interface RouteTreeEntry {
  id: string;
  method: string;
  path: string;
  /** Aviso curto sobre esta rota, como "No role granted". Vira marca no nó. */
  warning?: string;
}

export interface RouteTreeNode<Entry extends RouteTreeEntry = RouteTreeEntry> {
  /** Caminho normalizado. Único na árvore: é o que `selected` e `expanded` guardam. */
  key: string;
  /** Caminho do nó logo acima, para a tela apagar o trecho herdado. Vazio no topo. */
  base: string;
  /** Uma rota por método, na ordem de leitura: GET, POST, PUT, PATCH, DELETE. */
  routes: Entry[];
  /** Prefixo sem rota própria, que só junta caminhos. */
  group: boolean;
  children: RouteTreeNode<Entry>[];
  /** Caminhos com rota abaixo deste, em todos os níveis. */
  descendants: number;
}

export interface RouteTreeFilter {
  /** Trecho do caminho, sem diferença de maiúscula. */
  query?: string;
  /** Métodos aceitos. Vazio aceita todos. */
  methods?: readonly string[];
}

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'UPDATE', 'DELETE'];

const methodRank = (method: string): number => {
  const index = METHOD_ORDER.indexOf(method.toUpperCase());

  return index === -1 ? METHOD_ORDER.length : index;
};

export const pathSegments = (path: string): string[] => path.split('/').filter(Boolean);

/** Barra no começo, nenhuma no fim, nenhuma repetida. Vazio vira `/`. */
export const normalizeRoutePath = (path: string): string => `/${pathSegments(path.trim()).join('/')}`;

const isDynamic = (segment: string): boolean => segment.startsWith(':') || segment.includes('*');

/** Parâmetros do caminho, sem os dois pontos: `/a/:id/b/:slug` dá `['id', 'slug']`. */
export const routeParams = (path: string): string[] =>
  pathSegments(path)
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.slice(1).replace(/\?$/, ''));

/**
 * Segmento fixo antes de parâmetro, que é como o roteador decide quem atende;
 * depois, alfabética. `/elease/start/:id` vem antes de `/elease/:id`.
 */
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

    // Prefixo sem rota e com um filho só não vira nível: o filho sobe.
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

/** Monta a árvore. A entrada pode vir em qualquer ordem, e não é alterada. */
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

  // `/` cadastrado entra como nó próprio, no topo e sem filhos. Pai de tudo não
  // ajudaria ninguém a achar nada.
  if (root.routes.length > 0) nodes.unshift(toNode('/', '', root.routes, []));

  return nodes;
}

/**
 * Poda a árvore ao que casa com o filtro, mantendo os ancestrais como contexto:
 * resultado sem o caminho até ele não diz onde está. `matches` separa o que
 * casou do que só ficou para dar contexto.
 */
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

/** Nó pela chave, em qualquer nível. */
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

/** Chaves dos ancestrais, do topo até o pai. Vazio para nó de topo ou chave ausente. */
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

/** Chaves de todo nó que tem filho: é o "expandir tudo". */
export function routeBranchKeys<Entry extends RouteTreeEntry>(nodes: readonly RouteTreeNode<Entry>[]): string[] {
  return nodes.flatMap((node) =>
    node.children.length > 0 ? [node.key, ...routeBranchKeys(node.children)] : [],
  );
}

/** Quantidade de nós, em todos os níveis. */
export function countRouteNodes<Entry extends RouteTreeEntry>(nodes: readonly RouteTreeNode<Entry>[]): number {
  return nodes.reduce((total, node) => total + 1 + countRouteNodes(node.children), 0);
}
