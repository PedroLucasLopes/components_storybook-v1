/**
 * Dados de exemplo para o Storybook. **Nada aqui vai para produção.**
 *
 * Existem para mostrar os componentes com conteúdo plausível: nome de
 * equipamento com tamanho real, identificador com a largura que ele tem de
 * verdade, situação em todos os estados possíveis. Componente testado só com
 * "Lorem ipsum" e três linhas esconde exatamente os problemas que aparecem
 * depois: coluna que estoura, pastilha que quebra em duas linhas, tabela que
 * não cabe.
 *
 * Os dois conjuntos são de aplicações diferentes de propósito. É o que mostra
 * que a tabela não sabe nada sobre o domínio de nenhuma delas.
 */
import type { Permission } from '../access/usePermissions';
import type { StatusDefinition } from '../components/DlStatusChip.vue';

/* ------------------------- KRLoc: equipamentos ------------------------- */

export interface MockEquipment extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  status: string;
  dailyRate: number;
  lastSeen: string;
}

export const equipment: MockEquipment[] = [
  { id: '9f1c2a', code: 'KR-0142', name: '400L concrete mixer', status: 'AVAILABLE', dailyRate: 85, lastSeen: '2026-09-09' },
  { id: '4b77de', code: 'KR-0143', name: 'Tubular scaffold 1.5m', status: 'LEASED', dailyRate: 12, lastSeen: '2026-09-11' },
  { id: 'c03e91', code: 'KR-0155', name: '20kg demolition hammer', status: 'MAINTENANCE', dailyRate: 140, lastSeen: '2026-09-02' },
  { id: '77aa10', code: 'KR-0161', name: 'Plate compactor', status: 'AVAILABLE', dailyRate: 190, lastSeen: '2026-09-10' },
  { id: '21bd04', code: 'KR-0177', name: '5.5 kVA generator', status: 'RETIRED', dailyRate: 260, lastSeen: '2026-06-18' },
  { id: 'ee5510', code: 'KR-0183', name: 'Hydraulic pallet truck', status: 'STOLEN', dailyRate: 45, lastSeen: '2026-08-27' },
  { id: '0a92c7', code: 'KR-0190', name: 'Aluminium extension ladder 9m', status: 'LEASED', dailyRate: 30, lastSeen: '2026-09-11' },
];

/**
 * Cores pedidas para a coluna de situação.
 *
 * `RETIRED` usa o tom `dark`, que resolve para `on-surface`: quase preto no
 * tema claro e quase branco no escuro. Preto fixo sumiria no tema escuro, e é
 * justamente o estado arquivado que precisa continuar legível.
 */
export const equipmentStatus: Record<string, StatusDefinition> = {
  AVAILABLE: { label: 'Available', tone: 'success', icon: 'mdi-check-circle-outline' },
  LEASED: { label: 'Leased', tone: 'info', icon: 'mdi-truck-outline' },
  MAINTENANCE: { label: 'Maintenance', tone: 'warning', icon: 'mdi-wrench-outline' },
  RETIRED: { label: 'Retired', tone: 'dark', icon: 'mdi-archive-outline' },
  STOLEN: { label: 'Stolen', tone: 'error', icon: 'mdi-alert-outline' },
};

/* ---------------------------- SSO: projetos ---------------------------- */

export interface MockProject extends Record<string, unknown> {
  id: string;
  name: string;
  clientId: string;
  status: string;
  users: number;
  createdAt: string;
}

export const projects: MockProject[] = [
  { id: 'a1', name: 'KRLoc', clientId: '68cb386ac54e76c1', status: 'ACTIVE', users: 14, createdAt: '2026-03-04' },
  { id: 'b2', name: 'Finance Dashboard', clientId: 'f2f0215097a0250a', status: 'PENDING', users: 0, createdAt: '2026-09-10' },
  { id: 'c3', name: 'Fleet Tracker', clientId: '31b8361c13694911', status: 'ACTIVE', users: 6, createdAt: '2026-05-22' },
  { id: 'd4', name: 'Legacy Portal', clientId: '0589e0cc90d94cba', status: 'SUSPENDED', users: 2, createdAt: '2025-11-08' },
];

export const projectStatus: Record<string, StatusDefinition> = {
  ACTIVE: { label: 'Active', tone: 'success', icon: 'mdi-check-circle-outline' },
  PENDING: { label: 'Pending', tone: 'warning', icon: 'mdi-clock-outline' },
  SUSPENDED: { label: 'Suspended', tone: 'error', icon: 'mdi-pause-circle-outline' },
  ARCHIVED: { label: 'Archived', tone: 'dark', icon: 'mdi-archive-outline' },
};

/* ----------------------------- SSO: console ---------------------------- */

/**
 * O que `GET /sso/me` poderia devolver para papéis de gestão do projeto do SSO.
 * Os papéis do SSO nascem vazios e cada ambiente marca as próprias rotas; estes
 * conjuntos são exemplos plausíveis para as stories, não um catálogo.
 */
export const ssoViewerPermissions: Permission[] = [
  { path: '/project', method: 'GET' },
  { path: '/project/:id', method: 'GET' },
  { path: '/role', method: 'GET' },
  { path: '/role/:id', method: 'GET' },
  { path: '/route', method: 'GET' },
  { path: '/route/:id', method: 'GET' },
  { path: '/user', method: 'GET' },
  { path: '/user/:id', method: 'GET' },
];

export const ssoAdminPermissions: Permission[] = [
  ...ssoViewerPermissions,
  { path: '/clientkey', method: 'GET' },
  { path: '/clientkey', method: 'POST' },
  { path: '/clientkey/:id', method: 'DELETE' },
  { path: '/permission', method: 'POST' },
  { path: '/permission/:id', method: 'DELETE' },
  { path: '/project', method: 'POST' },
  { path: '/project/:id', method: 'PUT' },
  { path: '/project/:id', method: 'DELETE' },
  { path: '/project/:id/overview', method: 'GET' },
  { path: '/project/:id/status', method: 'PATCH' },
  { path: '/projectuser', method: 'POST' },
  { path: '/redirecturi', method: 'POST' },
  { path: '/redirecturi/:id', method: 'PUT' },
  { path: '/role', method: 'POST' },
  { path: '/role/:id', method: 'PUT' },
  { path: '/role/:id', method: 'DELETE' },
  { path: '/route', method: 'POST' },
  { path: '/route/:id', method: 'PUT' },
  { path: '/route/:id', method: 'DELETE' },
  { path: '/user', method: 'POST' },
  { path: '/user/:id', method: 'PUT' },
  { path: '/user/:id', method: 'DELETE' },
];

/** Único papel que gera chave privada de cliente. */
export const ssoSuperadminPermissions: Permission[] = [
  ...ssoAdminPermissions,
  { path: '/clientkey/generate', method: 'POST' },
];

export interface MockRoute extends Record<string, unknown> {
  id: string;
  method: string;
  path: string;
  project: string;
  roles: number;
}

export const ssoRoutes: MockRoute[] = [
  { id: 'r1', method: 'GET', path: '/equipment', project: 'KRLoc', roles: 3 },
  { id: 'r2', method: 'POST', path: '/equipment', project: 'KRLoc', roles: 2 },
  { id: 'r3', method: 'PUT', path: '/equipment/:id', project: 'KRLoc', roles: 2 },
  { id: 'r4', method: 'DELETE', path: '/equipment/:id', project: 'KRLoc', roles: 1 },
  { id: 'r5', method: 'GET', path: '/elease', project: 'KRLoc', roles: 3 },
  { id: 'r6', method: 'POST', path: '/generate/contract/:id', project: 'KRLoc', roles: 2 },
];

/* ------------------------- SSO: árvore de rotas ------------------------- */

export interface MockCatalogRoute {
  id: string;
  method: string;
  path: string;
  warning?: string;
}

const NO_ROLE = 'No role granted';

/**
 * Catálogo de uma aplicação inteira, plano como o SSO guarda. Cobre o que a
 * árvore precisa resolver: vários métodos no mesmo caminho, parâmetros de nome
 * diferente no mesmo nível (`:id` e `:projectId`), filho de parâmetro
 * (`/equipment/:id/create`), prefixo sem rota própria (`/generate`) e nível
 * que só existe por dentro (`/lessee/lesseesbyclient`).
 */
export const routeCatalog: MockCatalogRoute[] = (
  [
    ['GET', '/equipment'],
    ['POST', '/equipment'],
    ['GET', '/equipment/:id'],
    ['PUT', '/equipment/:id'],
    ['DELETE', '/equipment/:id'],
    ['POST', '/equipment/:id/create', NO_ROLE],
    ['GET', '/equipment/:projectId', NO_ROLE],
    ['POST', '/equipment/upload'],
    ['GET', '/accessory'],
    ['POST', '/accessory'],
    ['GET', '/accessory/:id'],
    ['PUT', '/accessory/:id'],
    ['DELETE', '/accessory/:id'],
    ['POST', '/accessory/associate'],
    ['GET', '/client'],
    ['POST', '/client'],
    ['GET', '/client/:id'],
    ['PUT', '/client/:id'],
    ['GET', '/lessee'],
    ['POST', '/lessee'],
    ['GET', '/lessee/:id'],
    ['GET', '/lessee/lesseesbyclient/:clientId'],
    ['GET', '/elease'],
    ['POST', '/elease'],
    ['GET', '/elease/:id'],
    ['POST', '/elease/start/:id'],
    ['POST', '/elease/close/:id'],
    ['POST', '/elease/cancel/:id'],
    ['PUT', '/elease/status/:id'],
    ['PUT', '/elease/replace/:id', NO_ROLE],
    ['POST', '/generate/contract/:id'],
    ['POST', '/generate/finantial/:id'],
    ['POST', '/generate/closure/:id'],
    ['GET', '/finantial/:id'],
  ] as [string, string, string?][]
).map(([method, path, warning], index) => ({
  id: `rt-${String(index + 1).padStart(2, '0')}`,
  method,
  path,
  warning,
}));

export interface MockPerson extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  projects: number;
  linked: boolean;
}

/** Domínio `example.com`, reservado pela RFC 2606 para exemplo. */
export const ssoPeople: MockPerson[] = [
  { id: 'u1', name: 'Marina Albuquerque', email: 'marina.albuquerque@example.com', projects: 3, linked: true },
  { id: 'u2', name: 'Rafael Tavares', email: 'rafael.tavares@example.com', projects: 1, linked: true },
  { id: 'u3', name: 'Beatriz Nogueira Castanheira', email: 'beatriz.castanheira@example.com', projects: 2, linked: false },
  { id: 'u4', name: 'Joaquim Pires', email: 'joaquim.pires@example.com', projects: 0, linked: false },
];

/* ------------------------------ formato ------------------------------- */

export const currency = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const date = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
