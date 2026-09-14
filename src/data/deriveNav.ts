import type { NavGroup, NavItem } from '../components/DlNavDrawer.vue';
import type { Permission } from '../access/usePermissions';
import { humanize } from './inferColumns';

/**
 * Menu a partir das rotas que o SSO já persiste.
 *
 * O SSO guarda `Route { path, method }` por projeto, e `GET /auth/me` devolve
 * exatamente as que o papel da pessoa alcança. Daqui sai o menu, sem ninguém
 * manter uma lista por aplicação: `/accessory` vira "Accessories", `/equipment`
 * vira "Equipment", e o KRLoc ganha as abas dele sem escrever nada.
 *
 * ## O que entra
 *
 * Uma rota vira item de menu quando é **`GET`**, **sem parâmetro** e **de um
 * segmento só**.
 *
 * - **`GET`** porque item de menu leva a uma listagem. `POST /equipment` é a
 *   ação de criar, que mora no cabeçalho da tela, não na barra lateral.
 * - **Sem parâmetro** porque não faz sentido clicar em `/accessory/:id`: não há
 *   `id` nenhum no momento do clique. Essas rotas continuam existindo e sendo
 *   verificadas pela permissão; elas só não são destino.
 * - **Um segmento** porque `/project/:id/overview` é uma tela de dentro de um
 *   registro, alcançada pela listagem, não pela barra.
 *
 * ## O que a rota NÃO tem
 *
 * Ícone, ordem e agrupamento. Nenhum dos três está no banco, e inventar ícone a
 * partir de `/elease` não dá certo. O padrão é um ícone neutro e ordem
 * alfabética, que já funciona; `overrides` conserta o que ficar feio, uma chave
 * por vez. É muito menos que manter o menu inteiro à mão.
 */

export interface NavOverride {
  label?: string;
  icon?: string;
  /** Rota do front, se diferente do caminho da API. */
  to?: string;
  /** Chave do grupo. Sem isso, tudo cai num grupo só. */
  group?: string;
  /** Menor primeiro. Sem isso, alfabética pelo rótulo. */
  order?: number;
  badge?: string | number;
  /** Esconde este caminho do menu, mesmo sendo elegível. */
  hidden?: boolean;
}

export interface DeriveNavOptions {
  /** Ajuste por caminho, sem declarar o menu inteiro. */
  overrides?: Record<string, NavOverride>;
  /** Títulos dos grupos, na ordem em que devem aparecer. */
  groups?: { key: string; title?: string }[];
  /** Ícone de quem não tem override. */
  defaultIcon?: string;
  /** Prefixo da rota do front. Ex.: `/app` faz `/equipment` virar `/app/equipment`. */
  routePrefix?: string;
}

/** Um segmento, sem parâmetro e sem curinga. */
const isClickable = (path: string): boolean => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length !== 1) return false;

  return !segments[0].startsWith(':') && segments[0] !== '*';
};

/**
 * Substantivos que não têm plural em inglês. Sem esta lista, `/equipment`
 * viraria "Equipments", que não é palavra, e é justamente um dos caminhos mais
 * usados do ecossistema.
 */
const UNCOUNTABLE = new Set([
  'equipment', 'staff', 'software', 'hardware', 'information', 'data',
  'news', 'access', 'inventory', 'maintenance', 'health', 'stock',
]);

/**
 * Plural simples para o rótulo. `/accessory` vira "Accessories".
 *
 * É palpite, e palpite erra: `/elease` viraria "Eleases". Quando errar, o
 * conserto é uma linha em `overrides`, não uma lista de menu inteira.
 */
const pluralize = (word: string): string => {
  if (UNCOUNTABLE.has(word.toLowerCase())) return word;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;

  return `${word}s`;
};

/**
 * Constrói os grupos do menu a partir da lista de permissões.
 *
 * Grupo que ficou sem item não é devolvido: quem desenha nunca recebe um
 * cabeçalho de seção vazia.
 */
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
      // A permissão que originou o item continua sendo a que o libera. Manter
      // isso explícito deixa o guard do menu funcionar do mesmo jeito.
      permission: { method: 'GET', path },
      badge: override.badge,
      group: override.group ?? '',
      order: override.order ?? Number.MAX_SAFE_INTEGER,
    });
  }

  // Ordem declarada primeiro, alfabética depois. Sem `order`, o menu já sai
  // estável e previsível em vez de seguir a ordem do banco.
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

  // Grupo usado num override mas não declarado em `groups` ainda aparece, no
  // fim. Perder item por causa de configuração incompleta seria pior.
  for (const [key, bucket] of byGroup) {
    if (bucket.length) result.push({ key: key || 'default', title: undefined, items: bucket });
  }

  return result;
}
