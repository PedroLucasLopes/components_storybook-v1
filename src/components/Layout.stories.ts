import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { providePermissions, type Permission } from '../access/usePermissions';
import { deriveNavGroups, type NavOverride } from '../data/deriveNav';
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
import DlStatCard from './DlStatCard.vue';
import DlStatusChip from './DlStatusChip.vue';
import DlUserMenu from './DlUserMenu.vue';

/**
 * A casca inteira, montada como o console do SSO monta: o menu sai de
 * `deriveNavGroups` sobre as permissões do papel, e só o que o banco não guarda
 * (rótulo, ícone, grupo) vem de `overrides`.
 */

const overrides: Record<string, NavOverride> = {
  '/project': { label: 'Projects', icon: 'mdi-apps', to: '/projects', group: 'catalogue', order: 1 },
  '/user': { label: 'Users', icon: 'mdi-account-multiple-outline', to: '/users', group: 'catalogue', order: 2 },
  '/role': { label: 'Roles', icon: 'mdi-shield-account-outline', to: '/roles', group: 'catalogue', order: 3 },
  // Rotas moram dentro de cada projeto, em árvore, e não no menu. Ver `Data/Route tree`.
  '/route': { hidden: true },
  '/clientkey': { label: 'Client keys', icon: 'mdi-key-variant', to: '/client-keys', group: 'credentials', order: 1 },
};

const groupsFor = (permissions: Permission[]): NavGroup[] => [
  {
    key: 'home',
    items: [{ key: 'dashboard', label: 'Overview', icon: 'mdi-view-dashboard-outline', to: '/' }],
  },
  ...deriveNavGroups(permissions, {
    overrides,
    groups: [
      { key: 'catalogue', title: 'Catalogue' },
      { key: 'credentials', title: 'Credentials' },
    ],
  }),
];

const columns: Column<MockProject>[] = [
  { key: 'name', label: 'Project' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'clientId', label: 'Client ID', mono: true, secondary: true },
  { key: 'users', label: 'Members', align: 'end', width: '110px' },
];

const actions: RowAction<MockProject>[] = [
  { key: 'edit', label: 'Edit', icon: 'mdi-pencil-outline', method: 'PUT', path: '/project/:id' },
  { key: 'delete', label: 'Delete', icon: 'mdi-delete-outline', method: 'DELETE', path: '/project/:id', color: 'error' },
];

const headerActions: HeaderAction[] = [
  { key: 'create', label: 'New project', icon: 'mdi-plus', method: 'POST', path: '/project' },
];

const shell = (permissions: Permission[], role: string) => ({
  components: { DlAppShell, DlUserMenu, DlPageHeader, DlStatCard, DlDataTable, DlStatusChip },
  setup() {
    providePermissions(ref(permissions), ref('/sso'));

    const open = ref(false);
    const collapsed = ref(false);
    const active = ref('project');
    const theme = ref<ThemeMode>('system');
    const signingOut = ref(false);

    const signOut = (): void => {
      signingOut.value = true;
      setTimeout(() => (signingOut.value = false), 1500);
    };

    return {
      open,
      collapsed,
      active,
      theme,
      signingOut,
      signOut,
      role,
      groups: groupsFor(permissions),
      rows: projects,
      columns,
      actions,
      headerActions,
      projectStatus,
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
        subtitle="Admin console"
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
          title="Projects"
          description="Applications connected to the SSO."
          :actions="headerActions"
          :breadcrumbs="[{ label: 'Catalogue' }, { label: 'Projects' }]"
          :with-menu="false"
        />

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
          <DlStatCard label="Projects" :value="rows.length" icon="mdi-apps" />
          <DlStatCard label="Active" :value="2" icon="mdi-check-circle-outline" tone="success" />
          <DlStatCard label="Pending" :value="1" icon="mdi-clock-outline" tone="warning" />
        </div>

        <DlDataTable :columns="columns" :rows="rows" :actions="actions" :limit="20">
          <template #col-status="{ row }">
            <DlStatusChip :status="row.status" :map="projectStatus" />
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
          'permissions, the account menu holds the theme and the sign-out.',
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
