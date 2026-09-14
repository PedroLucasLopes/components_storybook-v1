import { computed, inject, provide, ref, type InjectionKey, type Ref } from 'vue';

/**
 * Permissão no front, a partir do que o backend já devolve.
 *
 * `GET /auth/me` traz `permissions: [{ path, method }]`, a mesma lista que o
 * guard usa do lado do servidor. Aqui ela vira uma pergunta simples: esta
 * pessoa pode `POST /equipment`?
 *
 * ## Isto não é controle de acesso
 *
 * É controle de **interface**. Quem decide é o backend, sempre, e ele continua
 * recusando mesmo que alguém force o botão a aparecer pelo console. O valor
 * disto é não mostrar caminho fechado: botão que some é melhor que botão que
 * some depois de um 403.
 *
 * ## Esconder, e não desabilitar
 *
 * Ação que a pessoa nunca vai poder usar sai da tela. Botão desabilitado
 * comunica "você poderia, mas não agora", que é mentira quando o papel dela
 * simplesmente não inclui aquilo. Desabilitado fica reservado para bloqueio
 * temporário: registro em outro estado, formulário incompleto, operação em
 * andamento.
 */

export interface Permission {
  path: string;
  method: string;
}

export interface PermissionContext {
  permissions: Ref<Permission[]>;
  /** Prefixo global da API, removido antes de comparar. Ex.: `/api`. */
  routePrefix: Ref<string>;
}

export const PERMISSIONS_KEY: InjectionKey<PermissionContext> =
  Symbol('dl.permissions');

/**
 * O padrão é montado a partir do caminho GUARDADO, nunca do caminho perguntado.
 *
 * É a mesma regra do servidor, e pela mesma razão: inverter isso transforma
 * metacaractere na pergunta em resposta positiva. `/equipment/:id` vira
 * `^/equipment/[^/]+$`, e quem pergunta só fornece texto.
 */
const compilar = (permissionPath: string): RegExp => {
  const padrao = permissionPath
    .split('/')
    .map((segmento) => {
      if (segmento.startsWith(':')) return '[^/]+';
      if (segmento === '*') return '[^/]*';

      return segmento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return new RegExp(`^${padrao}$`);
};

const cache = new Map<string, RegExp>();

const matcher = (permissionPath: string): RegExp => {
  const guardado = cache.get(permissionPath);

  if (guardado) return guardado;

  const compilado = compilar(permissionPath);

  cache.set(permissionPath, compilado);

  return compilado;
};

const normalizar = (caminho: string, prefixo: string): string => {
  let saida = caminho;

  // Recorte na fronteira: sem isto, `/apifoo` viraria `/foo`.
  if (
    prefixo &&
    saida.startsWith(prefixo) &&
    (saida.length === prefixo.length || saida[prefixo.length] === '/')
  ) {
    saida = saida.slice(prefixo.length);
  }

  saida = saida.replace(/\/{2,}/g, '/');

  if (saida.length > 1) saida = saida.replace(/\/+$/, '');

  return saida.startsWith('/') ? saida : `/${saida}`;
};

/**
 * A mesma pergunta de `can`, sem depender de injeção.
 *
 * Para quem roda fora de componente: guard de rota, store, interceptor. O
 * resultado é idêntico ao de `usePermissions().can`, que chama esta função.
 */
export function permits(
  permissions: readonly Permission[],
  method: string,
  path: string,
  routePrefix = '',
): boolean {
  const metodo = method.toUpperCase();
  const alvo = normalizar(path, routePrefix);

  return permissions.some(
    (permissao) =>
      permissao.method.toUpperCase() === metodo &&
      matcher(normalizar(permissao.path, '')).test(alvo),
  );
}

/**
 * Fornece o contexto de permissão. Chame uma vez, perto da raiz, com o que
 * veio de `/auth/me`.
 */
export function providePermissions(
  permissions: Ref<Permission[]>,
  routePrefix: Ref<string>,
): void {
  provide(PERMISSIONS_KEY, { permissions, routePrefix });
}

/**
 * Consome o contexto. Fora dele, responde `false` para tudo: sem saber o que a
 * pessoa pode, a interface fecha em vez de abrir.
 */
export function usePermissions() {
  const contexto = inject(PERMISSIONS_KEY, {
    permissions: ref<Permission[]>([]),
    routePrefix: ref(''),
  });

  const can = (method: string, path: string): boolean =>
    permits(contexto.permissions.value, method, path, contexto.routePrefix.value);

  /** Verdadeiro se QUALQUER um dos métodos for permitido naquele caminho. */
  const canAny = (methods: string[], path: string): boolean =>
    methods.some((metodo) => can(metodo, path));

  /** Verdadeiro só se TODOS forem permitidos. Útil para fluxo composto. */
  const canAll = (methods: string[], path: string): boolean =>
    methods.every((metodo) => can(metodo, path));

  return {
    can,
    canAny,
    canAll,
    permissions: computed(() => contexto.permissions.value),
    /** Atalhos legíveis, para o caso comum. */
    canRead: (path: string) => can('GET', path),
    canCreate: (path: string) => can('POST', path),
    canUpdate: (path: string) => canAny(['PUT', 'PATCH'], path),
    canDelete: (path: string) => can('DELETE', path),
  };
}
