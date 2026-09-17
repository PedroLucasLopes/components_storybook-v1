import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlMoneyField from './DlMoneyField.vue';

const meta: Meta<typeof DlMoneyField> = {
  title: 'Form/Money field',
  component: DlMoneyField,
  parameters: {
    docs: {
      description: {
        component:
          'An amount typed the way the screen language writes it. Switch the language in ' +
          'the toolbar: separators and the symbol position follow it, while the currency ' +
          'stays the one the business charges in. The value that comes out is a number, ' +
          'rounded to the currency digits, or `null`.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlMoneyField>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Type "1250,5" in Portuguese or "1,250.5" in English: both give the same number. ' +
          'Pasting "12.50" into a Portuguese screen still means twelve and a half. The text ' +
          'is formatted when the field loses focus, never while typing.',
      },
    },
  },
  render: () => ({
    components: { DlMoneyField },
    setup() {
      const daily = ref<number | null>(85);

      return { daily };
    },
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px;">
        <DlMoneyField
          v-model="daily"
          currency="BRL"
          label="Daily rate"
          hint="Frozen into the contract when the equipment is leased."
          required
        />
        <p style="margin: 0; font-size: 13px; color: var(--dl-on-surface-muted);">
          Value sent to the API: <code>{{ daily === null ? 'null' : daily }}</code>
        </p>
      </div>
    `,
  }),
};

export const Currencies: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same amount in three currencies. In Spanish the euro symbol moves after the ' +
          'number; the yen has no decimal places.',
      },
    },
  },
  render: () => ({
    components: { DlMoneyField },
    setup() {
      const real = ref<number | null>(1250.5);
      const euro = ref<number | null>(1250.5);
      const yen = ref<number | null>(125050);

      return { real, euro, yen };
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 720px;">
        <DlMoneyField v-model="real" currency="BRL" label="Monthly rate (BRL)" />
        <DlMoneyField v-model="euro" currency="EUR" label="Monthly rate (EUR)" />
        <DlMoneyField v-model="yen" currency="JPY" label="Monthly rate (JPY)" />
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { DlMoneyField },
    setup() {
      const empty = ref<number | null>(null);
      const fixed = ref<number | null>(9800);

      return { empty, fixed };
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 320px;">
        <DlMoneyField
          v-model="empty"
          currency="BRL"
          label="Indemnity"
          error="Enter the indemnity value."
          required
        />
        <DlMoneyField
          v-model="fixed"
          currency="BRL"
          label="Indemnity"
          hint="Read-only: the contract already froze this value."
          readonly
        />
        <DlMoneyField v-model="fixed" currency="BRL" label="Indemnity" disabled />
      </div>
    `,
  }),
};
