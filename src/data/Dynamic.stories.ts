import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed, ref } from 'vue';
import DlDataTable from '../components/DlDataTable.vue';
import DlNavDrawer from '../components/DlNavDrawer.vue';
import DlPageHeader from '../components/DlPageHeader.vue';
import DlStatusChip from '../components/DlStatusChip.vue';
import { providePermissions, type Permission } from '../access/usePermissions';
import { inferColumns } from './inferColumns';
import { deriveNavGroups } from './deriveNav';
import { equipmentStatus } from '../mocks';

const meta: Meta = {
  title: 'Dynamic/From the API',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Columns are inferred from the response body; the sidebar is derived ' +
          'from the routes the SSO already persists. Nothing here is declared ' +
          'per project, so a new application gets a working screen without ' +
          'writing a table or a menu.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const krlocResponse = [
  {
    id: '9f1c2a4e-1f77-4b6e-9c0a-2b3d4e5f6a71',
    code: 'KR-0142',
    name: '400L concrete mixer',
    status: 'AVAILABLE',
    p_diary: 85,
    p_weekly: 480,
    available: true,
    createdAt: '2026-03-04T11:20:00.000Z',
    lessee: { id: 'x1', name: 'A0 Construction' },
  },
  {
    id: '4b77de02-8c11-4a3d-b2f0-91c7e4d5a682',
    code: 'KR-0143',
    name: 'Tubular scaffold 1.5m',
    status: 'LEASED',
    p_diary: 12,
    p_weekly: 70,
    available: false,
    createdAt: '2026-01-18T09:02:00.000Z',
    lessee: { id: 'x2', name: 'B7 Obras' },
  },
  {
    id: 'c03e9155-2d44-4f81-a7b3-55e1c2f39d04',
    code: 'KR-0155',
    name: '20kg demolition hammer',
    status: 'MAINTENANCE',
    p_diary: 140,
    p_weekly: 790,
    available: false,
    createdAt: '2025-11-27T16:45:00.000Z',
    lessee: null,
  },
  {
    id: '21bd0433-9a01-4c2e-8f16-7d0b3a5e2c98',
    code: 'KR-0177',
    name: '5.5 kVA generator',
    status: 'RETIRED',
    p_diary: 260,
    p_weekly: 1450,
    available: false,
    createdAt: '2025-06-02T08:10:00.000Z',
    lessee: null,
  },
];

const ssoResponse = [
  {
    id: 'a1f2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'KRLoc',
    clientId: '68cb386ac54e76c16a12369ecd0b2d84',
    status: 'ACTIVE',
    activatedAt: '2026-03-04T11:20:00.000Z',
  },
  {
    id: 'b2e3d4c5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
    name: 'Finance Dashboard',
    clientId: 'f2f0215097a0250aeacad96a76d4c79d',
    status: 'PENDING',
    activatedAt: null,
  },
];

const krlocRoutes: Permission[] = [
  { path: '/equipment', method: 'GET' },
  { path: '/equipment', method: 'POST' },
  { path: '/equipment/:id', method: 'GET' },
  { path: '/equipment/:id', method: 'PUT' },
  { path: '/equipment/:id', method: 'DELETE' },
  { path: '/accessory', method: 'GET' },
  { path: '/accessory/:id', method: 'GET' },
  { path: '/accessory/associate', method: 'POST' },
  { path: '/client', method: 'GET' },
  { path: '/client/:id', method: 'GET' },
  { path: '/lessee', method: 'GET' },
  { path: '/lessee/lesseesbyclient/:clientId', method: 'GET' },
  { path: '/elease', method: 'GET' },
  { path: '/elease/:id', method: 'GET' },
  { path: '/generate/contract/:id', method: 'POST' },
  { path: '/health', method: 'GET' },
];

export const TableFromResponse: Story = {
  name: 'Table, zero columns declared',
  parameters: {
    docs: {
      description: {
        story:
          'The only input is the response body. Numbers go right and monospaced, ' +
          'dates get formatted, booleans become Yes/No, the UUID is marked ' +
          'secondary so it drops first when width runs short, and the nested ' +
          '`lessee` object is skipped because it does not fit a cell.',
      },
    },
  },
  render: () => ({
    components: { DlDataTable },
    setup() {
      providePermissions(ref([{ path: '/equipment', method: 'GET' }]), ref('/api'));

      const columns = computed(() => inferColumns(krlocResponse));

      return { columns, rows: krlocResponse };
    },
    template: `
      <div style="padding: 20px;">
        <DlDataTable :columns="columns" :rows="rows" />
      </div>
    `,
  }),
};

export const SameTableOtherApi: Story = {
  name: 'Same table, another API',
  parameters: {
    docs: {
      description: {
        story:
          'Identical call, a response from the SSO instead. No shared field with ' +
          'the story above, and still nothing declared.',
      },
    },
  },
  render: () => ({
    components: { DlDataTable },
    setup() {
      providePermissions(ref([{ path: '/project', method: 'GET' }]), ref('/sso'));

      const columns = computed(() => inferColumns(ssoResponse));

      return { columns, rows: ssoResponse };
    },
    template: `
      <div style="padding: 20px;">
        <DlDataTable :columns="columns" :rows="rows" />
      </div>
    `,
  }),
};

export const TableWithOverrides: Story = {
  name: 'Table with a few fixes',
  parameters: {
    docs: {
      description: {
        story:
          'Humanising guesses, and sometimes it guesses badly: `p_diary` becomes ' +
          '"P diary". Overrides correct one key at a time, which is far less ' +
          'than maintaining the whole list. Here the two price columns get a ' +
          'proper label and currency, the id is hidden, and status renders as a ' +
          'chip through the `col-status` slot.',
      },
    },
  },
  render: () => ({
    components: { DlDataTable, DlStatusChip },
    setup() {
      providePermissions(ref([{ path: '/equipment', method: 'GET' }]), ref('/api'));

      const money = (value: unknown): string =>
        typeof value === 'number'
          ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
          : '—';

      const columns = computed(() =>
        inferColumns(krlocResponse, {
          omit: ['id'],
          overrides: {
            code: { label: 'Code', width: '120px' },
            name: { label: 'Equipment' },
            status: { label: 'Status', width: '160px' },
            p_diary: { label: 'Daily', align: 'end', format: (row) => money(row.p_diary) },
            p_weekly: { label: 'Weekly', align: 'end', format: (row) => money(row.p_weekly) },
            available: { label: 'In stock', width: '100px' },
          },
        }),
      );

      return { columns, rows: krlocResponse, equipmentStatus };
    },
    template: `
      <div style="padding: 20px;">
        <DlDataTable :columns="columns" :rows="rows">
          <template #col-status="{ row }">
            <DlStatusChip :status="row.status" :map="equipmentStatus" />
          </template>
        </DlDataTable>
      </div>
    `,
  }),
};

export const SidebarFromRoutes: Story = {
  name: 'Sidebar, derived from routes',
  parameters: {
    docs: {
      description: {
        story:
          'Sixteen routes go in, five menu items come out. `GET` only, because a ' +
          'menu item leads to a listing. No parameters, because there is no id ' +
          'to click with. One segment only, because `/generate/contract/:id` is ' +
          'a screen inside a record. Those routes still exist and are still ' +
          'checked by permission; they are simply not destinations.',
      },
    },
  },
  render: () => ({
    components: { DlNavDrawer, DlPageHeader },
    setup() {
      providePermissions(ref(krlocRoutes), ref('/api'));

      const open = ref(false);
      const collapsed = ref(false);

      const groups = computed(() =>
        deriveNavGroups(krlocRoutes, {
          groups: [
            { key: 'operations', title: 'Operations' },
            { key: 'records', title: 'Records' },
          ],
          overrides: {
            '/equipment': { icon: 'mdi-excavator', group: 'operations', order: 1 },
            '/accessory': { icon: 'mdi-toolbox-outline', group: 'operations', order: 2 },
            '/elease': { label: 'Contracts', icon: 'mdi-file-document-outline', group: 'operations', order: 3, badge: 7 },
            '/client': { icon: 'mdi-domain', group: 'records' },
            '/lessee': { icon: 'mdi-account-hard-hat-outline', group: 'records' },
            '/health': { hidden: true },
          },
        }),
      );

      const raw = computed(() =>
        krlocRoutes.map((r) => {
          const clickable =
            r.method === 'GET' &&
            r.path.split('/').filter(Boolean).length === 1 &&
            !r.path.includes(':');

          return { ...r, clickable };
        }),
      );

      return { groups, open, collapsed, raw };
    },
    template: `
      <VLayout style="min-height: 560px;">
        <DlNavDrawer
          v-model:open="open"
          v-model:collapsed="collapsed"
          :groups="groups"
          active="equipment"
          title="KRLoc"
          subtitle="Equipment rental"
          logo="mdi-excavator"
        />
        <VMain style="background: var(--dl-background);">
          <div style="padding: 20px;">
            <DlPageHeader
              title="Derived from the route catalogue"
              description="Sixteen routes in, five menu items out."
              @open-menu="open = true"
            />
            <table style="width: 100%; max-width: 460px; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--dl-on-surface-muted);">Route</th>
                  <th style="text-align: left; padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--dl-on-surface-muted);">In menu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in raw" :key="r.method + r.path" style="border-top: 1px solid var(--dl-outline);">
                  <td style="padding: 5px 10px; font-family: var(--dl-font-mono); font-size: 12px;">{{ r.method }} {{ r.path }}</td>
                  <td style="padding: 5px 10px; color: var(--dl-on-surface-muted);">{{ r.clickable ? 'yes' : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </VMain>
      </VLayout>
    `,
  }),
};

export const SidebarZeroConfig: Story = {
  name: 'Sidebar with no overrides at all',
  parameters: {
    docs: {
      description: {
        story:
          'The same routes with nothing configured: neutral icons, the brand included, ' +
          'alphabetical order, one group, labels straight from the path. It works, and it is ' +
          'the floor a brand new application starts from. `/health` shows up ' +
          'here, which is exactly the kind of thing a two-line override fixes.',
      },
    },
  },
  render: () => ({
    components: { DlNavDrawer, DlPageHeader },
    setup() {
      providePermissions(ref(krlocRoutes), ref('/api'));

      const open = ref(false);
      const collapsed = ref(false);
      const groups = computed(() => deriveNavGroups(krlocRoutes));

      return { groups, open, collapsed };
    },
    template: `
      <VLayout style="min-height: 460px;">
        <DlNavDrawer
          v-model:open="open"
          v-model:collapsed="collapsed"
          :groups="groups"
          title="New application"
          subtitle="Nothing configured"
        />
        <VMain style="background: var(--dl-background);">
          <div style="padding: 20px;">
            <DlPageHeader title="Zero configuration" description="Same routes, no overrides." @open-menu="open = true" />
          </div>
        </VMain>
      </VLayout>
    `,
  }),
};
