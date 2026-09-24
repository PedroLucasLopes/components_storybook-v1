import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlButton from './DlButton.vue';
import DlSecretDialog from './DlSecretDialog.vue';

const FAKE_KEY = btoa(
  '-----BEGIN PRIVATE KEY-----\n' +
    'STORYBOOK-EXAMPLE-THIS-IS-NOT-A-REAL-KEY-000000000000000000000000000000\n' +
    '-----END PRIVATE KEY-----\n',
);

const meta: Meta<typeof DlSecretDialog> = {
  title: 'Feedback/Secret dialog',
  component: DlSecretDialog,
  parameters: {
    docs: {
      description: {
        component:
          'Shows a secret once. It starts masked, copying does not require revealing it, ' +
          'and closing requires confirming it was stored, because nobody keeps a copy.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlSecretDialog>;

export const GeneratedKey: Story = {
  name: 'Generated client key',
  render: () => ({
    components: { DlSecretDialog, DlButton },
    setup() {
      const open = ref(true);

      return { open, secret: FAKE_KEY };
    },
    template: `
      <div>
        <DlButton icon="mdi-key-plus" variant="tonal" @click="open = true">Reopen (story only)</DlButton>
        <DlSecretDialog
          v-model="open"
          title="Private key for KRLoc"
          label="Private key (base64, PKCS#8)"
          :secret="secret"
          description="Hand it to the application owner through a secure channel. The SSO keeps only the public half."
          warning="This key is shown once and is not stored in the SSO. If it goes through chat, a ticket, a commit or a CI log, revoke it and generate another."
          acknowledge-label="I stored this key in a safe place"
        />
      </div>
    `,
  }),
};
