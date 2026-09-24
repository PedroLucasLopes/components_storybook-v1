import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { providePermissions, type Permission } from '../access/usePermissions';
import { httpMethodStatus } from '../data/httpMethods';
import {
  projectStatus,
  projects,
  ssoAdminPermissions,
  ssoRoutes,
  ssoViewerPermissions,
  type MockRoute,
} from '../mocks';
import DlButton from './DlButton.vue';
import DlDataTable, { type Column } from './DlDataTable.vue';
import DlDescriptionList, { type DescriptionItem } from './DlDescriptionList.vue';
import DlEmptyState from './DlEmptyState.vue';
import DlSectionCard from './DlSectionCard.vue';
import DlStatCard from './DlStatCard.vue';
import DlStatusChip from './DlStatusChip.vue';
import DlTabs, { type TabItem } from './DlTabs.vue';

const meta: Meta = {
  title: 'Data/Display',
  parameters: {
    docs: {
      description: {
        component:
          'Building blocks for detail and dashboard screens. None of them knows the ' +
          'domain: content arrives through props, exactly like the table.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const card = 'background: var(--dl-surface); border: 1px solid var(--dl-outline); border-radius: 16px;';

export const StatCards: Story = {
  name: 'Stat cards',
  parameters: {
    docs: {
      description: {
        story:
          'Numbers count up to their value, while screen readers get the final value at ' +
          'once. The last card is loading: a placeholder zero would read as real data.',
      },
    },
  },
  render: () => ({
    components: { DlStatCard },
    setup() {
      const loading = ref(true);

      setTimeout(() => (loading.value = false), 1600);

      return { loading };
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
        <DlStatCard label="Projects" :value="12" icon="mdi-apps" hint="3 waiting for activation" />
        <DlStatCard label="Active projects" :value="9" icon="mdi-check-circle-outline" tone="success" />
        <DlStatCard label="Users" :value="148" icon="mdi-account-multiple-outline" tone="info" interactive hint="Opens the user list" />
        <DlStatCard label="Routes" :value="412" icon="mdi-sitemap-outline" tone="neutral" :loading="loading" />
      </div>
    `,
  }),
};

const project = projects[0];

const details: DescriptionItem[] = [
  { key: 'name', label: 'Name', value: project?.name },
  { key: 'status', label: 'Status', value: project?.status },
  {
    key: 'clientId',
    label: 'Client ID',
    value: '68cb386ac54e76c1a90f2b6d7e1c33f4b8a2d9e0c5f6a7b8c9d0e1f2a3b4c5d6',
    mono: true,
    copyable: true,
    hint: 'Public identifier. The proof is the private key.',
  },
  { key: 'createdAt', label: 'Created', value: 'Mar 04, 2026' },
  { key: 'activatedAt', label: 'Activated', value: 'Mar 05, 2026' },
  { key: 'suspendedAt', label: 'Suspended', value: null },
];

export const DescriptionList: Story = {
  name: 'Description list',
  render: () => ({
    components: { DlDescriptionList, DlStatusChip },
    setup: () => ({ details, projectStatus }),
    template: `
      <div style="${card} padding: 20px; max-width: 760px;">
        <DlDescriptionList :items="details">
          <template #item-status="{ item }">
            <DlStatusChip :status="String(item.value)" :map="projectStatus" />
          </template>
        </DlDescriptionList>
      </div>
    `,
  }),
};

const routeColumns: Column<MockRoute>[] = [
  { key: 'method', label: 'Method', width: '120px' },
  { key: 'path', label: 'Path', mono: true },
  { key: 'roles', label: 'Roles', align: 'end', width: '90px' },
];

export const SectionCard: Story = {
  name: 'Section card with a table',
  render: () => ({
    components: { DlSectionCard, DlDataTable, DlStatusChip, DlButton },
    setup() {
      providePermissions(ref(ssoAdminPermissions), ref('/sso'));

      return { rows: ssoRoutes, routeColumns, httpMethodStatus };
    },
    template: `
      <div style="max-width: 820px;">
        <DlSectionCard
          title="Routes"
          :count="rows.length"
          description="What this application exposes. Each route is granted to roles through permissions."
          :padded="false"
        >
          <template #actions>
            <DlButton icon="mdi-plus" variant="tonal">Add route</DlButton>
          </template>

          <DlDataTable :columns="routeColumns" :rows="rows" :limit="50" bare>
            <template #col-method="{ row }">
              <DlStatusChip :status="row.method" :map="httpMethodStatus" :with-icon="false" />
            </template>
          </DlDataTable>
        </DlSectionCard>
      </div>
    `,
  }),
};

export const EmptyStates: Story = {
  name: 'Empty, blocked and error states',
  render: () => ({
    components: { DlEmptyState, DlButton },
    setup: () => ({ card }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        <div :style="card">
          <DlEmptyState
            title="No redirect URIs yet"
            description="The SSO only sends the sign-in back to addresses registered here."
            icon="mdi-link-variant"
            compact
          >
            <DlButton icon="mdi-plus" variant="tonal">Add redirect URI</DlButton>
          </DlEmptyState>
        </div>
        <div :style="card">
          <DlEmptyState
            title="You cannot open this page"
            description="Your role does not include this area. Ask an administrator if you need it."
            icon="mdi-lock-outline"
            tone="warning"
            compact
          />
        </div>
        <div :style="card">
          <DlEmptyState
            title="The SSO did not respond"
            description="Check your connection and try again. Nothing was changed."
            icon="mdi-cloud-alert-outline"
            tone="error"
            compact
          >
            <DlButton icon="mdi-refresh" variant="outlined">Try again</DlButton>
          </DlEmptyState>
        </div>
      </div>
    `,
  }),
};

const projectTabs: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: 'mdi-information-outline' },
  {
    key: 'routes',
    label: 'Routes',
    icon: 'mdi-sitemap-outline',
    count: 6,
    permission: { method: 'GET', path: '/project/:id/overview' },
  },
  {
    key: 'members',
    label: 'Members',
    icon: 'mdi-account-multiple-outline',
    count: 14,
    permission: { method: 'GET', path: '/project/:id/overview' },
  },
  {
    key: 'keys',
    label: 'Client keys',
    icon: 'mdi-key-variant',
    count: 2,
    permission: { method: 'GET', path: '/clientkey' },
  },
];

const tabsStage = (permissions: Permission[]) => ({
  components: { DlTabs, DlEmptyState },
  setup() {
    providePermissions(ref(permissions), ref('/sso'));

    const current = ref('keys');

    return { current, projectTabs };
  },
  template: `
    <div style="max-width: 820px;">
      <DlTabs v-model="current" :tabs="projectTabs">
        <template #overview>
          <DlEmptyState title="Overview" description="Identity, credential and activation status." icon="mdi-information-outline" compact />
        </template>
        <template #routes>
          <DlEmptyState title="Routes" description="What the application exposes." icon="mdi-sitemap-outline" compact />
        </template>
        <template #members>
          <DlEmptyState title="Members" description="Who can use it, and with which role." icon="mdi-account-multiple-outline" compact />
        </template>
        <template #keys>
          <DlEmptyState title="Client keys" description="Public halves used for private_key_jwt." icon="mdi-key-variant" compact />
        </template>
      </DlTabs>
    </div>
  `,
});

export const Tabs: Story = {
  name: 'Tabs, administrator',
  render: () => tabsStage(ssoAdminPermissions),
};

export const TabsViewer: Story = {
  name: 'Tabs, viewer role',
  parameters: {
    docs: {
      description: {
        story:
          'Same tabs, a VIEWER role. The tabs that need the overview or the keys ' +
          'disappear, and the selected one falls back to the first visible tab.',
      },
    },
  },
  render: () => tabsStage(ssoViewerPermissions),
};
