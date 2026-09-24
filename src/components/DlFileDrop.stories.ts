import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { equipmentCsv } from '../mocks';
import DlFileDrop from './DlFileDrop.vue';

const TWO_MB = 2 * 1024 * 1024;

const meta: Meta<typeof DlFileDrop> = {
  title: 'Form/File drop',
  component: DlFileDrop,
  parameters: {
    docs: {
      description: {
        component:
          'One file to upload, dropped or browsed. Type and size are checked before ' +
          'anything is sent, and the extension counts as much as the MIME type: on ' +
          'Windows a CSV often arrives as `application/vnd.ms-excel`. A server error ' +
          'comes in through `error` and wins over the local checks.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlFileDrop>;

const csvFile = (): File => new File([equipmentCsv], 'equipment-september.csv', { type: 'text/csv' });

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drop a CSV of up to 2 MB, or use the link. Try dropping an image or two files ' +
          'at once: the message names the file and the rule, and nothing is chosen.',
      },
    },
  },
  render: () => ({
    components: { DlFileDrop },
    setup() {
      const file = ref<File | null>(null);

      return { file, TWO_MB };
    },
    template: `
      <div style="max-width: 520px;">
        <DlFileDrop
          v-model="file"
          label="Spreadsheet"
          accept=".csv,text/csv"
          :max-size="TWO_MB"
          hint="Columns: name, code, p_diary, p_weekly, p_biweekly, p_monthly, p_indemnity, status."
          required
        />
      </div>
    `,
  }),
};

export const Selected: Story = {
  name: 'File selected',
  parameters: {
    docs: {
      description: {
        story:
          'With a file, the drop area becomes the file row. Removing it puts focus back on ' +
          'the link, so the keyboard never lands on an element that no longer exists.',
      },
    },
  },
  render: () => ({
    components: { DlFileDrop },
    setup() {
      const file = ref<File | null>(csvFile());

      return { file, TWO_MB };
    },
    template: `
      <div style="max-width: 520px;">
        <DlFileDrop v-model="file" label="Spreadsheet" accept=".csv,text/csv" :max-size="TWO_MB" />
      </div>
    `,
  }),
};

export const ServerError: Story = {
  name: 'Server error',
  render: () => ({
    components: { DlFileDrop },
    setup() {
      const file = ref<File | null>(csvFile());

      return { file, TWO_MB };
    },
    template: `
      <div style="max-width: 520px;">
        <DlFileDrop
          v-model="file"
          label="Spreadsheet"
          accept=".csv,text/csv"
          :max-size="TWO_MB"
          error="The code needs at least 3 characters."
        />
      </div>
    `,
  }),
};

export const Uploading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Locked while the upload runs: dropping another file would not replace the one on its way.',
      },
    },
  },
  render: () => ({
    components: { DlFileDrop },
    setup() {
      const file = ref<File | null>(csvFile());
      const empty = ref<File | null>(null);

      return { file, empty, TWO_MB };
    },
    template: `
      <div style="display: grid; gap: 20px; max-width: 520px;">
        <DlFileDrop v-model="file" label="Spreadsheet" accept=".csv,text/csv" :max-size="TWO_MB" disabled />
        <DlFileDrop v-model="empty" label="Spreadsheet" accept=".csv,text/csv" :max-size="TWO_MB" disabled />
      </div>
    `,
  }),
};
