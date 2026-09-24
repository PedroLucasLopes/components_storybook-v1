import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlButton from './DlButton.vue';
import DlSignIn, { type SignInProvider } from './DlSignIn.vue';
import DlTextField from './DlTextField.vue';

const google: SignInProvider = { id: 'google', label: 'Google', icon: 'mdi-google' };

const meta: Meta<typeof DlSignIn> = {
  title: 'Authentication/Sign in',
  component: DlSignIn,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The identity provider screen. It only offers providers while an application ' +
          'is waiting for the person; opened directly, it explains that sign-in starts ' +
          'in the application. Errors come from known codes, never from free text in the URL.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlSignIn>;

export const Ready: Story = {
  name: 'Request from an application',
  args: { state: 'ready', application: 'KRLoc', providers: [google] },
};

export const WithCredentials: Story = {
  name: 'Email and password, with a provider',
  parameters: {
    docs: {
      description: {
        story:
          'The default slot carries the credential form. The divider only appears when ' +
          'the card offers both a form and a provider.',
      },
    },
  },
  render: (args) => ({
    components: { DlSignIn, DlTextField, DlButton },
    setup: () => ({ args, email: ref(''), password: ref('') }),
    template: `
      <DlSignIn v-bind="args">
        <DlTextField v-model="email" label="Email" type="email" autocomplete="username" />
        <DlTextField v-model="password" label="Password" type="password" autocomplete="current-password" />
        <DlButton block size="large" color="primary">Sign in</DlButton>
      </DlSignIn>
    `,
  }),
  args: { state: 'ready', application: 'KRLoc', providers: [google] },
};

export const SecondFactor: Story = {
  name: 'Second factor',
  parameters: {
    docs: {
      description: {
        story:
          'A step of its own: no provider, and the heading and description replace the ' +
          'default ones. Same card, so the person does not feel moved to another place.',
      },
    },
  },
  render: (args) => ({
    components: { DlSignIn, DlTextField, DlButton },
    setup: () => ({ args, code: ref('') }),
    template: `
      <DlSignIn v-bind="args">
        <DlTextField v-model="code" label="Six digit code" inputmode="numeric" autocomplete="one-time-code" />
        <DlButton block size="large" color="primary">Confirm</DlButton>
      </DlSignIn>
    `,
  }),
  args: {
    state: 'ready',
    providers: [],
    heading: 'Two step verification',
    description: 'Type the code from your authenticator app.',
  },
};

export const ConsoleRequest: Story = {
  name: 'Request from the SSO console',
  args: { state: 'ready', application: 'SSO', providers: [google] },
};

export const Redirecting: Story = {
  name: 'Choosing a provider',
  parameters: {
    docs: {
      description: {
        story:
          'Click the button. It keeps its width and shows progress, and a second click ' +
          'does nothing, so no second trip to the provider starts on top of the first.',
      },
    },
  },
  render: () => ({
    components: { DlSignIn },
    setup() {
      const pending = ref<string | null>(null);

      return { pending, google };
    },
    template: `
      <DlSignIn
        state="ready"
        application="KRLoc"
        :providers="[google]"
        :pending-provider="pending"
        @select="(provider) => (pending = provider.id)"
      />
    `,
  }),
};

export const AccountNotRegistered: Story = {
  name: 'Account not registered',
  args: {
    state: 'ready',
    application: 'KRLoc',
    providers: [google],
    error: {
      title: 'This Google account is not registered',
      description: 'Ask an administrator to add your e-mail to the SSO, then try again.',
    },
  },
};

export const Blocked: Story = {
  name: 'Opened without a request',
  args: { state: 'blocked' },
};

export const Expired: Story = {
  name: 'Request expired',
  args: {
    state: 'blocked',
    error: {
      title: 'The sign-in request expired',
      description: 'It lasts five minutes. Go back to the application and start again.',
    },
  },
};

export const Loading: Story = {
  args: { state: 'loading' },
};
