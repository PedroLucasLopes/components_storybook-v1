import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { h, ref } from 'vue';
import DlDataTable, { type Column, type RowAction } from './DlDataTable.vue';
import DlStatusChip from './DlStatusChip.vue';
import { providePermissions, type Permission } from '../access/usePermissions';
import {
  currency,
  date,
  equipment,
  equipmentStatus,
  projects,
  projectStatus,
  type MockEquipment,
  type MockProject,
} from '../mocks';

/**
 * A tabela não sabe nada sobre equipamento nem sobre projeto. As duas primeiras
 * stories mostram o mesmo componente com conjuntos de coluna completamente
 * diferentes, um de cada aplicação.
 */

/* ------------------------- colunas do KRLoc -------------------------- */

const equipmentColumns: Column<MockEquipment>[] = [
  { key: 'code', label: 'Code', width: '120px', mono: true },
  { key: 'name', label: 'Equipment' },
  { key: 'status', label: 'Status', width: '160px' },
  { key: 'dailyRate', label: 'Daily rate', width: '120px', align: 'end', mono: true, format: (row) => currency(row.dailyRate) },
  { key: 'lastSeen', label: 'Last seen', width: '130px', secondary: true, format: (row) => date(row.lastSeen) },
];

const equipmentActions: RowAction<MockEquipment>[] = [
  { key: 'open', label: 'Open', icon: 'mdi-open-in-new', method: 'GET', path: '/equipment/:id' },
  { key: 'edit', label: 'Edit', icon: 'mdi-pencil-outline', method: 'PUT', path: '/equipment/:id' },
  {
    key: 'retire',
    label: 'Retire',
    icon: 'mdi-archive-arrow-down-outline',
    method: 'DELETE',
    path: '/equipment/:id',
    color: 'error',
    // Indisponível por ESTADO, não por permissão: quem pode continua vendo o
    // botão, apagado, e entende que é o registro que não permite.
    unavailable: (row) => row.status === 'RETIRED',
  },
];

/**
 * A mesma tabela com uma ação principal. Aqui a linha existe para registrar a
 * volta do equipamento, e é isso que o botão redondo diz; abrir e editar
 * continuam discretos.
 */
const equipmentReturnActions: RowAction<MockEquipment>[] = [
  {
    key: 'return',
    label: 'Register return',
    icon: 'mdi-truck-check-outline',
    method: 'PUT',
    path: '/equipment/:id',
    primary: true,
    // Só o que está na obra volta. Desabilitado por ESTADO, como o retire.
    unavailable: (row) => row.status !== 'LEASED',
  },
  { key: 'open', label: 'Open', icon: 'mdi-open-in-new', method: 'GET', path: '/equipment/:id' },
  { key: 'edit', label: 'Edit', icon: 'mdi-pencil-outline', method: 'PUT', path: '/equipment/:id' },
];

/* -------------------------- colunas do SSO --------------------------- */

const projectColumns: Column<MockProject>[] = [
  { key: 'name', label: 'Project', width: '200px' },
  { key: 'clientId', label: 'Client ID', mono: true },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'users', label: 'Users', width: '90px', align: 'end', mono: true },
  { key: 'createdAt', label: 'Created', width: '130px', secondary: true, format: (row) => date(row.createdAt) },
];

const projectActions: RowAction<MockProject>[] = [
  { key: 'overview', label: 'Overview', icon: 'mdi-information-outline', method: 'GET', path: '/project/:id/overview' },
  { key: 'activate', label: 'Change status', icon: 'mdi-toggle-switch-outline', method: 'PATCH', path: '/project/:id/status' },
  { key: 'remove', label: 'Delete', icon: 'mdi-trash-can-outline', method: 'DELETE', path: '/project/:id', color: 'error' },
];

/* ------------------------------ palco -------------------------------- */

const FULL_EQUIPMENT: Permission[] = [
  { path: '/equipment', method: 'GET' },
  { path: '/equipment/:id', method: 'GET' },
  { path: '/equipment', method: 'POST' },
  { path: '/equipment/:id', method: 'PUT' },
  { path: '/equipment/:id', method: 'DELETE' },
];

const READ_ONLY_EQUIPMENT: Permission[] = [
  { path: '/equipment', method: 'GET' },
  { path: '/equipment/:id', method: 'GET' },
];

const FULL_PROJECT: Permission[] = [
  { path: '/project', method: 'GET' },
  { path: '/project/:id/overview', method: 'GET' },
  { path: '/project/:id/status', method: 'PATCH' },
  { path: '/project/:id', method: 'DELETE' },
];

/**
 * Mesmo componente, dados e colunas vindos de fora. É o ponto de toda esta
 * story, e é por isso que existe um palco por conjunto: eles não compartilham
 * um único campo.
 *
 * O `as never` no slot é a fronteira onde o genérico da tabela encontra o mapa
 * de situação, que é um `Record` solto. Fora daqui, tudo continua tipado.
 */
const equipmentStage = (
  permissions: Permission[],
  actions: RowAction<MockEquipment>[] = equipmentActions,
) => ({
  components: { DlDataTable, DlStatusChip },
  setup() {
    providePermissions(ref(permissions), ref('/api'));

    const page = ref(1);

    return () =>
      h(
        DlDataTable<MockEquipment>,
        {
          columns: equipmentColumns,
          rows: equipment,
          actions,
          page: page.value,
          'onUpdate:page': (value: number) => (page.value = value),
        },
        {
          // A coluna de situação é um slot: a tabela entrega a linha e quem usa
          // decide como desenhar. É assim que a pastilha entra sem a tabela
          // conhecer nenhum status.
          'col-status': ({ row }: { row: MockEquipment }) =>
            h(DlStatusChip, { status: row.status, map: equipmentStatus }),
        } as never,
      );
  },
});

const projectStage = (permissions: Permission[]) => ({
  components: { DlDataTable, DlStatusChip },
  setup() {
    providePermissions(ref(permissions), ref('/sso'));

    const page = ref(1);

    return () =>
      h(
        DlDataTable<MockProject>,
        {
          columns: projectColumns,
          rows: projects,
          actions: projectActions,
          page: page.value,
          'onUpdate:page': (value: number) => (page.value = value),
        },
        {
          'col-status': ({ row }: { row: MockProject }) =>
            h(DlStatusChip, { status: row.status, map: projectStatus }),
        } as never,
      );
  },
});
/* `DlDataTable` e generico, e componente generico nao casa com `Meta<typeof>`.
   O `as never` fica so no metadado; as stories seguem tipadas pelos palcos. */
const meta: Meta = {
  title: 'Data/Table',
  component: DlDataTable as never,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main screen of every application in the ecosystem. Columns, rows ' +
          'and actions all come from props, so nothing here knows about ' +
          'equipment or projects. Below 840px it turns into a card list.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const EquipmentKrloc: Story = {
  name: 'KRLoc columns',
  parameters: {
    docs: {
      description: {
        story:
          'Code, equipment, status, daily rate, last seen. The status column ' +
          'uses the requested colours: green available, blue leased, amber ' +
          'maintenance, near-black retired, red stolen.',
      },
    },
  },
  render: () => equipmentStage(FULL_EQUIPMENT),
};

export const ProjectsSso: Story = {
  name: 'SSO columns',
  parameters: {
    docs: {
      description: {
        story:
          'Same component, a completely different column set from another ' +
          'application: project, client id, status, users, created. No shared ' +
          'field with the story above.',
      },
    },
  },
  render: () => projectStage(FULL_PROJECT),
};

export const PrimaryAction: Story = {
  name: 'Primary action in the row',
  parameters: {
    docs: {
      description: {
        story:
          'One action per row can be the primary one, and it becomes a filled ' +
          'round button while the others stay quiet. A dim icon among dim icons ' +
          'does not say what the row is for. Disabled by state still applies: it ' +
          'only lights up for what is actually out on a job site.',
      },
    },
  },
  render: () => equipmentStage(FULL_EQUIPMENT, equipmentReturnActions),
};

export const ReadOnly: Story = {
  name: 'Read only',
  parameters: {
    docs: {
      description: {
        story:
          'Same table, same person, different role: `GET` only. Edit and retire ' +
          'are not disabled, they are absent from the DOM. A greyed-out button ' +
          'says "not right now", which would be a lie here.',
      },
    },
  },
  render: () => equipmentStage(READ_ONLY_EQUIPMENT),
};

export const Loading: Story = {
  render: () => ({
    components: { DlDataTable },
    setup() {
      providePermissions(ref([]), ref('/api'));

      return { equipmentColumns };
    },
    template: '<DlDataTable :columns="equipmentColumns" :rows="[]" loading />',
  }),
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An empty list is a normal situation in this ecosystem, not an error: ' +
          'the backend answers 404 when there is no result.',
      },
    },
  },
  render: () => ({
    components: { DlDataTable },
    setup() {
      providePermissions(ref([{ path: '/equipment', method: 'POST' }]), ref('/api'));

      return { equipmentColumns };
    },
    template: `
      <DlDataTable
        :columns="equipmentColumns"
        :rows="[]"
        empty-title="No equipment"
        empty-description="Adjust the filters or register the first item."
      >
        <template #empty-action>
          <VBtn color="primary" prepend-icon="mdi-plus">Add equipment</VBtn>
        </template>
      </DlDataTable>
    `,
  }),
};

export const Phone: Story = {
  name: 'Phone (cards)',
  globals: { viewport: { value: 'mobile1' } },
  parameters: {
    docs: {
      description: {
        story:
          'Below the breakpoint the table becomes a card list. A table with ' +
          'horizontal scrolling on a phone hides the very column that matters.',
      },
    },
  },
  render: () => equipmentStage(FULL_EQUIPMENT),
};
