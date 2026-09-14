import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlNavDrawer, { type NavGroup } from './DlNavDrawer.vue';
import DlPageHeader from './DlPageHeader.vue';
import { providePermissions, type Permission } from '../access/usePermissions';

/**
 * O mesmo componente serve as duas aplicações. O que muda é o manifesto, que
 * vem do backend de cada uma. É por isso que ele não conhece "equipamento" nem
 * "projeto".
 */

const krlocMenu: NavGroup[] = [
  {
    key: 'operations',
    title: 'Operations',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
      {
        key: 'equipment',
        label: 'Equipment',
        icon: 'mdi-excavator',
        to: '/equipment',
        permission: { method: 'GET', path: '/equipment' },
        badge: 128,
      },
      {
        key: 'accessory',
        label: 'Accessories',
        icon: 'mdi-toolbox-outline',
        to: '/accessories',
        permission: { method: 'GET', path: '/accessory' },
      },
      {
        key: 'elease',
        label: 'Contracts',
        icon: 'mdi-file-document-outline',
        to: '/contracts',
        permission: { method: 'GET', path: '/elease' },
        badge: 7,
      },
    ],
  },
  {
    key: 'records',
    title: 'Records',
    items: [
      {
        key: 'client',
        label: 'Clients',
        icon: 'mdi-domain',
        to: '/clients',
        permission: { method: 'GET', path: '/client' },
      },
      {
        key: 'lessee',
        label: 'Lessees',
        icon: 'mdi-account-hard-hat-outline',
        to: '/lessees',
        permission: { method: 'GET', path: '/lessee' },
      },
    ],
  },
  {
    key: 'documents',
    title: 'Documents',
    items: [
      {
        key: 'generate',
        label: 'Generate document',
        icon: 'mdi-file-download-outline',
        to: '/documents',
        permission: { method: 'POST', path: '/generate/contract/:id' },
      },
    ],
  },
];

const ssoMenu: NavGroup[] = [
  {
    key: 'catalogue',
    title: 'Catalogue',
    items: [
      { key: 'project', label: 'Projects', icon: 'mdi-apps', to: '/projects', permission: { method: 'GET', path: '/project' } },
      { key: 'user', label: 'Users', icon: 'mdi-account-multiple-outline', to: '/users', permission: { method: 'GET', path: '/user' } },
      { key: 'role', label: 'Roles', icon: 'mdi-shield-account-outline', to: '/roles', permission: { method: 'GET', path: '/role' } },
    ],
  },
  {
    key: 'credentials',
    title: 'Credentials',
    items: [
      {
        key: 'clientkey',
        label: 'Client keys',
        icon: 'mdi-key-variant',
        to: '/keys',
        permission: { method: 'GET', path: '/clientkey' },
      },
      {
        key: 'generate-key',
        label: 'Generate key',
        icon: 'mdi-key-plus',
        to: '/keys/new',
        // Só SUPERADMIN tem esta permissão. Ver o bootstrap do SSO.
        permission: { method: 'POST', path: '/clientkey/generate' },
      },
    ],
  },
];

const stage = (groups: NavGroup[], permissions: Permission[], title: string, subtitle: string, prefix: string) => ({
  components: { DlNavDrawer, DlPageHeader },
  setup() {
    providePermissions(ref(permissions), ref(prefix));

    const open = ref(false);
    const collapsed = ref(false);
    const active = ref(groups[0]?.items[0]?.key ?? '');

    return { groups, open, collapsed, active, title, subtitle };
  },
  template: `
    <VLayout style="min-height: 520px; border: 1px solid var(--dl-outline); border-radius: 16px; overflow: hidden;">
      <DlNavDrawer
        v-model:open="open"
        v-model:collapsed="collapsed"
        :groups="groups"
        :active="active"
        :title="title"
        :subtitle="subtitle"
        @navigate="(item) => (active = item.key)"
      />
      <VMain style="background: var(--dl-background);">
        <div style="padding: 20px;">
          <DlPageHeader
            :title="title"
            description="Pick an item. Only what the role unlocks shows up."
            @open-menu="open = true"
          />
          <p style="font-size: 14px; color: var(--dl-on-surface-muted);">
            Active item: <code style="font-family: var(--dl-font-mono);">{{ active }}</code>
          </p>
        </div>
      </VMain>
    </VLayout>
  `,
});

const meta: Meta<typeof DlNavDrawer> = {
  title: 'Navigation/Sidebar',
  component: DlNavDrawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The manifest comes from each application backend. This component only ' +
          'draws it, and hides whatever the viewer role does not unlock.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlNavDrawer>;

export const Krloc: Story = {
  name: 'KRLoc, full access',
  render: () =>
    stage(
      krlocMenu,
      [
        { path: '/equipment', method: 'GET' },
        { path: '/accessory', method: 'GET' },
        { path: '/elease', method: 'GET' },
        { path: '/client', method: 'GET' },
        { path: '/lessee', method: 'GET' },
        { path: '/generate/contract/:id', method: 'POST' },
      ],
      'KRLoc',
      'Equipment rental',
      '/api',
    ),
};

export const KrlocRestricted: Story = {
  name: 'KRLoc, restricted role',
  parameters: {
    docs: {
      description: {
        story:
          'Same manifest, a role that only reaches equipment and accessories. The ' +
          'Records and Documents groups disappear entirely, heading included: ' +
          'an empty section header promises something that never arrives.',
      },
    },
  },
  render: () =>
    stage(
      krlocMenu,
      [
        { path: '/equipment', method: 'GET' },
        { path: '/accessory', method: 'GET' },
      ],
      'KRLoc',
      'Equipment rental',
      '/api',
    ),
};

export const Sso: Story = {
  name: 'SSO, administrator',
  parameters: {
    docs: {
      description: {
        story:
          'Another application, another manifest, the same component. This role is ' +
          'ADMIN: it reaches the catalogue and the keys, but not Generate key, ' +
          'which in the SSO catalogue is granted to SUPERADMIN only.',
      },
    },
  },
  render: () =>
    stage(
      ssoMenu,
      [
        { path: '/project', method: 'GET' },
        { path: '/user', method: 'GET' },
        { path: '/role', method: 'GET' },
        { path: '/route', method: 'GET' },
        { path: '/clientkey', method: 'GET' },
      ],
      'SSO',
      'Admin console',
      '/sso',
    ),
};

export const NoAccess: Story = {
  name: 'No access at all',
  parameters: {
    docs: {
      description: {
        story:
          'An authenticated person whose role unlocks nothing in this application. ' +
          'The empty menu explains the situation instead of showing a blank bar.',
      },
    },
  },
  render: () => stage(krlocMenu, [], 'KRLoc', 'Equipment rental', '/api'),
};
