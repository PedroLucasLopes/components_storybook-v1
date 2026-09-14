/**
 * `@pedrolucaslopes/dotlog-ui` — componentes e tokens compartilhados pelos
 * fronts do ecossistema SSO.
 *
 * O pacote é o contrato de interface, do mesmo jeito que
 * `@pedrolucaslopes/sso-client` é o contrato de autenticação. Tem repositório
 * próprio e chega a cada front pelo npm, nunca por caminho relativo: cada
 * aplicação continua com repositório, infraestrutura e deploy próprios.
 */

/* ------------------------------- tema -------------------------------- */

export {
  breakpoints,
  darkColors,
  elevation,
  lightColors,
  motion,
  radius,
  spacing,
  typography,
  type ThemeColors,
} from './theme/tokens';

export {
  createDotlogVuetify,
  cssVariables,
  darkTheme,
  lightTheme,
  vuetifyOptions,
  THEME_DARK,
  THEME_LIGHT,
} from './theme/vuetify';

export {
  bindVuetifyTheme,
  useThemePreferences,
  type ThemeMode,
  type ThemePreferences,
} from './theme/useTheme';

/* ----------------------------- permissao ----------------------------- */

export {
  permits,
  providePermissions,
  usePermissions,
  PERMISSIONS_KEY,
  type Permission,
  type PermissionContext,
} from './access/usePermissions';

/* ---------------------------- componentes ---------------------------- */

export { default as DlTextField } from './components/DlTextField.vue';
export { default as DlSelect } from './components/DlSelect.vue';
export { default as DlRange } from './components/DlRange.vue';
export { default as DlDataTable } from './components/DlDataTable.vue';
export { default as DlNavDrawer } from './components/DlNavDrawer.vue';
export { default as DlPageHeader } from './components/DlPageHeader.vue';
export { default as DlStatusChip } from './components/DlStatusChip.vue';
export { default as DlExpansion } from './components/DlExpansion.vue';
export { default as DlConfirmDialog } from './components/DlConfirmDialog.vue';
export { default as DlFormDialog } from './components/DlFormDialog.vue';
export { default as DlButton } from './components/DlButton.vue';
export { default as DlSkeleton } from './components/DlSkeleton.vue';
export { default as DlLoader } from './components/DlLoader.vue';
export { default as DlEmptyState } from './components/DlEmptyState.vue';
export { default as DlStatCard } from './components/DlStatCard.vue';
export { default as DlDescriptionList } from './components/DlDescriptionList.vue';
export { default as DlSectionCard } from './components/DlSectionCard.vue';
export { default as DlTabs } from './components/DlTabs.vue';
export { default as DlUserMenu } from './components/DlUserMenu.vue';
export { default as DlAppShell } from './components/DlAppShell.vue';
export { default as DlSignIn } from './components/DlSignIn.vue';
export { default as DlSecretDialog } from './components/DlSecretDialog.vue';
export { default as DlRoutePath } from './components/DlRoutePath.vue';
export { default as DlRouteTree } from './components/DlRouteTree.vue';
export { default as DlMasterDetail } from './components/DlMasterDetail.vue';

/* --------------------------- tela dinamica --------------------------- */

export { httpMethodStatus } from './data/httpMethods';
export { humanize, inferColumns } from './data/inferColumns';
export type { InferOptions } from './data/inferColumns';
export { deriveNavGroups } from './data/deriveNav';
export type { DeriveNavOptions, NavOverride } from './data/deriveNav';
export {
  buildRouteTree,
  countRouteNodes,
  filterRouteTree,
  findRouteNode,
  normalizeRoutePath,
  pathSegments,
  routeAncestorKeys,
  routeBranchKeys,
  routeParams,
} from './data/routeTree';
export type { RouteTreeEntry, RouteTreeFilter, RouteTreeNode } from './data/routeTree';

/* ------------------------------ feedback ----------------------------- */

export { default as DlToastHost } from './feedback/DlToastHost.vue';
export { toast, useToasts } from './feedback/useToast';
export type { Toast, ToastKind, ToastOptions, ToastAction } from './feedback/useToast';

/* ------------------------------ graficos ----------------------------- */

export { default as DlChartFrame } from './charts/DlChartFrame.vue';
export { default as DlBarChart } from './charts/DlBarChart.vue';
export { default as DlDonutChart } from './charts/DlDonutChart.vue';
export { default as DlAreaChart } from './charts/DlAreaChart.vue';
export {
  chartSequential,
  chartSeriesDark,
  chartSeriesLight,
  seriesColor,
  MAX_SERIES,
} from './charts/palette';
export type { ChartSeriesMeta } from './charts/DlChartFrame.vue';
export type { BarDatum } from './charts/DlBarChart.vue';
export type { DonutSlice } from './charts/DlDonutChart.vue';
export type { AreaSeries } from './charts/DlAreaChart.vue';

export type { Column, RowAction } from './components/DlDataTable.vue';
export type { NavGroup, NavItem } from './components/DlNavDrawer.vue';
export type { HeaderAction } from './components/DlPageHeader.vue';
export type { StatusDefinition, StatusTone } from './components/DlStatusChip.vue';
export type { DescriptionItem } from './components/DlDescriptionList.vue';
export type { TabItem } from './components/DlTabs.vue';
export type { SignInError, SignInProvider } from './components/DlSignIn.vue';
