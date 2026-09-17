import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { providePermissions, type Permission } from '../access/usePermissions';
import { deriveNavGroups } from '../data/deriveNav';
import {
  projectStatus,
  projects,
  ssoSuperadminPermissions,
  ssoViewerPermissions,
  type MockProject,
} from '../mocks';
import type { ThemeMode } from '../theme/useTheme';
import DlAppShell from './DlAppShell.vue';
import DlDataTable, { type Column, type RowAction } from './DlDataTable.vue';
import type { NavGroup } from './DlNavDrawer.vue';
import DlPageHeader, { type HeaderAction } from './DlPageHeader.vue';
import type { StatusDefinition } from './DlStatusChip.vue';
import DlStatCard from './DlStatCard.vue';
import DlStatusChip from './DlStatusChip.vue';
import DlUserMenu from './DlUserMenu.vue';

/**
 * A casca inteira, montada como o console do SSO monta: o menu sai de
 * `deriveNavGroups` sobre as permissões do papel, e só o que o banco não guarda
 * (rótulo, ícone, grupo) vem de `overrides`.
 *
 * Os textos da página vêm dos JSON da aplicação de exemplo, em
 * `src/mocks/locales`, chamados com `t()`. Trocar a língua no menu do usuário
 * traduz a casca, a tabela e a página juntas, sem nada além desses arquivos.
 */

const shell = (permissions: Permission[], role: string) => ({
  components: { DlAppShell, DlUserMenu, DlPageHeader, DlStatCard, DlDataTable, DlStatusChip },
  setup() {
    providePermissions(ref(permissions), ref('/sso'));

    const { t } = useI18n();

    const open = ref(false);
    const collapsed = ref(false);
    const active = ref('project');
    const theme = ref<ThemeMode>('system');
    const signingOut = ref(false);

    const signOut = (): void => {
      signingOut.value = true;
      setTimeout(() => (signingOut.value = false), 1500);
    };

    // Computados: rótulo lido na hora de desenhar troca junto com a língua.
    const groups = computed<NavGroup[]>(() => [
      {
        key: 'home',
        items: [{ key: 'dashboard', label: t('nav.overview'), icon: 'mdi-view-dashboard-outline', to: '/' }],
      },
      ...deriveNavGroups(permissions, {
        overrides: {
          '/project': { label: t('nav.projects'), icon: 'mdi-apps', to: '/projects', group: 'catalogue', order: 1 },
          '/user': { label: t('nav.users'), icon: 'mdi-account-multiple-outline', to: '/users', group: 'catalogue', order: 2 },
          // Rotas e papéis moram dentro de cada projeto, e não no menu. Ver `Data/Route tree`.
          '/role': { hidden: true },
          '/route': { hidden: true },
          '/clientkey': { label: t('nav.clientKeys'), icon: 'mdi-key-variant', to: '/client-keys', group: 'credentials', order: 1 },
        },
        groups: [
          { key: 'catalogue', title: t('nav.catalogue') },
          { key: 'credentials', title: t('nav.credentials') },
        ],
      }),
    ]);

    const columns = computed<Column<MockProject>[]>(() => [
      { key: 'name', label: t('projects.columns.project') },
      { key: 'status', label: t('projects.columns.status'), width: '150px' },
      { key: 'clientId', label: t('projects.columns.clientId'), mono: true, secondary: true },
      { key: 'users', label: t('projects.columns.members'), align: 'end', width: '110px' },
    ]);

    const actions = computed<RowAction<MockProject>[]>(() => [
      { key: 'edit', label: t('projects.edit'), icon: 'mdi-pencil-outline', method: 'PUT', path: '/project/:id' },
      { key: 'delete', label: t('projects.delete'), icon: 'mdi-delete-outline', method: 'DELETE', path: '/project/:id', color: 'error' },
    ]);

    const headerActions = computed<HeaderAction[]>(() => [
      { key: 'create', label: t('projects.new'), icon: 'mdi-plus', method: 'POST', path: '/project' },
    ]);

    const statusMap = computed<Record<string, StatusDefinition>>(() =>
      Object.fromEntries(
        Object.entries(projectStatus).map(([status, definition]) => [status, { ...definition, label: t(`status.${status}`) }]),
      ),
    );

    return {
      t,
      open,
      collapsed,
      active,
      theme,
      signingOut,
      signOut,
      role,
      groups,
      rows: projects,
      columns,
      actions,
      headerActions,
      statusMap,
    };
  },
  template: `
    <div style="height: 720px; border: 1px solid var(--dl-outline); border-radius: 16px; overflow: hidden; position: relative;">
      <DlAppShell
        v-model:open="open"
        v-model:collapsed="collapsed"
        :groups="groups"
        :active="active"
        title="SSO"
        :subtitle="t('app.subtitle')"
        logo="mdi-shield-key-outline"
        @navigate="(item) => (active = item.key)"
      >
        <template #top-actions>
          <DlUserMenu
            v-model:themeMode="theme"
            name="Marina Albuquerque"
            email="marina.albuquerque@example.com"
            :role="role"
            :signing-out="signingOut"
            @sign-out="signOut"
          />
        </template>

        <DlPageHeader
          :title="t('projects.title')"
          :description="t('projects.description')"
          :actions="headerActions"
          :breadcrumbs="[{ label: t('nav.catalogue') }, { label: t('projects.title') }]"
          :with-menu="false"
        />

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
          <DlStatCard :label="t('projects.total')" :value="rows.length" icon="mdi-apps" />
          <DlStatCard :label="t('projects.active')" :value="2" icon="mdi-check-circle-outline" tone="success" />
          <DlStatCard :label="t('projects.pending')" :value="1" icon="mdi-clock-outline" tone="warning" />
        </div>

        <DlDataTable :columns="columns" :rows="rows" :actions="actions" :limit="20">
          <template #col-status="{ row }">
            <DlStatusChip :status="row.status" :map="statusMap" />
          </template>
        </DlDataTable>
      </DlAppShell>
    </div>
  `,
});

const meta: Meta<typeof DlAppShell> = {
  title: 'Layout/App shell',
  component: DlAppShell,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Side menu, top bar and content area. The menu comes from the role ' +
          'permissions, the account menu holds the theme, the language and the sign-out. ' +
          'The page texts come from the application translation files, called with t().',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlAppShell>;

export const Console: Story = {
  name: 'SSO console, superadmin',
  render: () => shell(ssoSuperadminPermissions, 'SUPERADMIN'),
};

export const ViewerRole: Story = {
  name: 'SSO console, viewer',
  parameters: {
    docs: {
      description: {
        story:
          'Same shell for a VIEWER. The credentials group disappears, and the table ' +
          'and the header lose every write action, because the role only reads.',
      },
    },
  },
  render: () => shell(ssoViewerPermissions, 'VIEWER'),
};
