import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlSelect from './DlSelect.vue';
import DlRange from './DlRange.vue';
import DlStatusChip from './DlStatusChip.vue';
import DlExpansion from './DlExpansion.vue';
import DlConfirmDialog from './DlConfirmDialog.vue';
import { currency, equipmentStatus, projectStatus } from '../mocks';

const meta: Meta = {
  title: 'Form/Controls',
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown, numeric range, status chip, expansion panel and ' +
          'confirmation. Switch the theme in the toolbar above: every one of ' +
          'them has to work in both.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* ------------------------------ dropdown ------------------------------ */

const statuses = [
  { title: 'Available', value: 'AVAILABLE' },
  { title: 'Leased', value: 'LEASED' },
  { title: 'Maintenance', value: 'MAINTENANCE' },
  { title: 'Retired', value: 'RETIRED' },
];

const clients = Array.from({ length: 24 }, (_, i) => ({
  title: `${String.fromCharCode(65 + (i % 26))}${i} Construction Ltd`,
  value: `cli-${i}`,
}));

export const Dropdown: Story = {
  render: () => ({
    components: { DlSelect },
    setup() {
      const short = ref('AVAILABLE');
      const long = ref<string | null>(null);
      const many = ref<string[]>(['AVAILABLE', 'LEASED']);

      return { short, long, many, statuses, clients };
    },
    template: `
      <div style="display: grid; gap: 20px; max-width: 420px;">
        <DlSelect
          v-model="short"
          :options="statuses"
          label="Status"
          hint="Four options: no search field, which would only get in the way."
        />
        <DlSelect
          v-model="long"
          :options="clients"
          label="Client"
          placeholder="Type to filter"
          hint="Twenty-four options: search turns itself on from eight upwards."
        />
        <DlSelect
          v-model="many"
          :options="statuses"
          label="Filter by status"
          multiple
          hint="Multiple choice becomes removable chips."
        />
        <DlSelect
          :options="[]"
          label="Lessee"
          loading
          hint="Loading is a state. An empty list would say 'there is nothing', which is false."
        />
        <DlSelect
          :options="statuses"
          label="Status"
          error="Pick a status to continue."
          required
        />
      </div>
    `,
  }),
};

/* -------------------------------- range ------------------------------- */

export const Range: Story = {
  name: 'Numeric range',
  render: () => ({
    components: { DlRange },
    setup() {
      const rate = ref<[number, number]>([80, 260]);
      const days = ref<[number, number]>([7, 30]);

      return { rate, days, currency };
    },
    template: `
      <div style="display: grid; gap: 28px; max-width: 420px;">
        <DlRange
          v-model="rate"
          :min="0"
          :max="500"
          :step="5"
          :format="currency"
          label="Daily rate"
          hint="Drag to explore, type to be precise. Both edit the same value."
        />
        <DlRange
          v-model="days"
          :min="1"
          :max="90"
          :format="(v) => v + ' days'"
          label="Contract length"
          slider-only
          hint="Slider only, when precision does not matter."
        />
      </div>
    `,
  }),
};

/* ------------------------------- status ------------------------------- */

export const Status: Story = {
  name: 'Status chip',
  parameters: {
    docs: {
      description: {
        story:
          'Three intensities of the same colour: full for text and icon, 42% ' +
          'for the border, 12% for the background. The border matters inside a ' +
          'table, where the row changes background on hover and a fill-only ' +
          'chip would vanish. Colour never travels alone: there is always text.',
      },
    },
  },
  render: () => ({
    components: { DlStatusChip },
    setup: () => ({ equipmentStatus, projectStatus }),
    template: `
      <div style="display: grid; gap: 24px;">
        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Equipment (KRLoc)
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <DlStatusChip v-for="s in Object.keys(equipmentStatus)" :key="s" :status="s" :map="equipmentStatus" />
          </div>
        </section>

        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Project (SSO)
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <DlStatusChip v-for="s in Object.keys(projectStatus)" :key="s" :status="s" :map="projectStatus" />
          </div>
        </section>

        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Default size, and a status outside the map
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <DlStatusChip status="AVAILABLE" :map="equipmentStatus" size="default" />
            <DlStatusChip status="STOLEN" :map="equipmentStatus" size="default" />
            <DlStatusChip status="SOMETHING_ELSE" :map="equipmentStatus" />
          </div>
        </section>

        <section style="background: var(--dl-surface-variant); padding: 14px; border-radius: 10px;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Over a hovered row, where the border earns its keep
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <DlStatusChip v-for="s in Object.keys(equipmentStatus)" :key="s" :status="s" :map="equipmentStatus" />
          </div>
        </section>
      </div>
    `,
  }),
};

/* ------------------------------ expansion ----------------------------- */

export const Expansion: Story = {
  render: () => ({
    components: { DlExpansion },
    setup() {
      const open = ref<string[]>(['identity']);

      const panels = [
        { key: 'identity', title: 'Identity', summary: 'KR-0142 · 400L concrete mixer', icon: 'mdi-identifier' },
        { key: 'pricing', title: 'Pricing', summary: 'Daily $85.00', icon: 'mdi-cash-multiple' },
        { key: 'audit', title: 'Audit trail', summary: 'Changed 3 days ago', icon: 'mdi-history' },
      ];

      return { open, panels };
    },
    template: `
      <div style="max-width: 560px;">
        <DlExpansion v-model:open="open" :panels="panels">
          <template #identity>
            <p style="font-size: 14px; margin: 0; color: var(--dl-on-surface-muted);">
              Code normalised with the KR prefix and a sequential suffix.
            </p>
          </template>
          <template #pricing>
            <p style="font-size: 14px; margin: 0; color: var(--dl-on-surface-muted);">
              Decreasing bands of 30, 15, 7 and 1 day.
            </p>
          </template>
          <template #audit>
            <p style="font-size: 14px; margin: 0; color: var(--dl-on-surface-muted);">
              Every relevant transition writes an audit row.
            </p>
          </template>
        </DlExpansion>
      </div>
    `,
  }),
};

/* ----------------------------- confirmation --------------------------- */

export const Confirmation: Story = {
  render: () => ({
    components: { DlConfirmDialog },
    setup() {
      const simple = ref(false);
      const severe = ref(false);

      return { simple, severe };
    },
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <VBtn color="primary" variant="outlined" @click="simple = true">Retire equipment</VBtn>
        <VBtn color="error" variant="outlined" @click="severe = true">Revoke client key</VBtn>

        <DlConfirmDialog
          v-model="simple"
          title="Retire this equipment?"
          message="It leaves the available list and cannot enter a new contract. History stays."
          confirm-label="Retire equipment"
          destructive
          @confirm="simple = false"
        />

        <DlConfirmDialog
          v-model="severe"
          title="Revoke the KRLoc key?"
          message="The application stops authenticating immediately. Only a new key, handed over in person, restores access."
          confirm-label="Revoke key"
          require-text="KRLoc"
          destructive
          @confirm="severe = false"
        />
      </div>
    `,
  }),
};
