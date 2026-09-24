import type { Meta, StoryObj } from '@storybook/vue3-vite';
import DlTextField from './DlTextField.vue';

const meta: Meta<typeof DlTextField> = {
  title: 'Form/Text field',
  component: DlTextField,
  args: { label: 'Equipment name', placeholder: '400L concrete mixer' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date'] },
    density: { control: 'select', options: ['default', 'comfortable', 'compact'] },
  },
};

export default meta;

type Story = StoryObj<typeof DlTextField>;

export const Default: Story = { name: 'Default' };

export const WithHint: Story = {
  name: 'With hint',
  args: { hint: 'Shows up in the list and in the generated contract.' },
};

export const Required: Story = {
  args: { required: true, hint: 'Required by the record.' },
};

export const WithError: Story = {
  name: 'With error',
  args: { required: true, error: 'An equipment with this name already exists.' },
};

export const Identifier: Story = {
  name: 'Copyable identifier',
  args: {
    label: 'Client ID',
    modelValue: '68cb386ac54e76c16a12369ecd0b2d84',
    mono: true,
    copyable: true,
    readonly: true,
    hint: 'Public identifier. Monospaced so l and 1 do not look alike.',
  },
};

export const Password: Story = {
  args: { label: 'Senha', type: 'password', modelValue: 'example-secret' },
};

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'Not editable in this state' },
};

export const WithIcon: Story = {
  name: 'With icon',
  args: { label: 'Search', icon: 'mdi-magnify', placeholder: 'Code, name or identifier' },
};

export const Multiline: Story = {
  name: 'Multiline',
  parameters: {
    docs: {
      description: {
        story:
          'With `rows` the field becomes a text area that grows with the content. ' +
          'Monospaced here because a PEM key is compared character by character.',
      },
    },
  },
  args: {
    label: 'Public key (PEM, SPKI)',
    rows: 5,
    mono: true,
    required: true,
    placeholder: '-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----',
    hint: 'Generated on the application owner machine. The private half never leaves it.',
  },
};

export const DateField: Story = {
  name: 'Date',
  args: { label: 'Expires on', type: 'date', hint: 'Leave empty for a key without expiry.' },
};
