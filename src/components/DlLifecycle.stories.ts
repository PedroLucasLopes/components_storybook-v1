import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { contractExits, contractSteps } from '../mocks';
import DlLifecycle, { type LifecycleExit, type LifecycleStep } from './DlLifecycle.vue';

const meta: Meta<typeof DlLifecycle> = {
  title: 'Data/Lifecycle',
  component: DlLifecycle,
  parameters: {
    docs: {
      description: {
        component:
          'Where a record stands in its lifecycle: steps in order, the current one marked, ' +
          'and an exit that ends the path early. The steps arrive through props, so the ' +
          'same component draws a rental contract and a project on the SSO.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlLifecycle>;

const card =
  'background: var(--dl-surface); border: 1px solid var(--dl-outline); border-radius: 16px; padding: 20px;';

const caption = 'margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted);';

const withCaptions = (captions: Record<string, string>): LifecycleStep[] =>
  contractSteps.map((step) => ({ ...step, caption: captions[step.key] }));

export const Contract: Story = {
  name: 'Rental contract',
  parameters: {
    docs: {
      description: {
        story:
          'Every state a contract goes through. A cancelled contract does not show Active and ' +
          'Completed as pending: they are skipped, dashed, because they will never happen.',
      },
    },
  },
  render: () => ({
    components: { DlLifecycle },
    setup: () => ({
      card,
      caption,
      contractExits,
      pending: withCaptions({ PENDING: 'Since Sep 12, 2026' }),
      active: withCaptions({ PENDING: 'Sep 12, 2026', ACTIVE: 'Since Sep 15, 2026' }),
      completed: withCaptions({ PENDING: 'Sep 12, 2026', ACTIVE: 'Sep 15, 2026', COMPLETED: 'Oct 30, 2026' }),
      cancelled: withCaptions({ PENDING: 'Sep 12, 2026' }),
      cancelledExits: contractExits.map((exit) => ({ ...exit, caption: 'Sep 13, 2026' })),
    }),
    template: `
      <div style="display: grid; gap: 16px; max-width: 760px;">
        <section :style="card">
          <p :style="caption">Pending</p>
          <DlLifecycle :steps="pending" current="PENDING" :exits="contractExits" />
        </section>
        <section :style="card">
          <p :style="caption">Active</p>
          <DlLifecycle :steps="active" current="ACTIVE" :exits="contractExits" />
        </section>
        <section :style="card">
          <p :style="caption">Completed</p>
          <DlLifecycle :steps="completed" current="COMPLETED" :exits="contractExits" />
        </section>
        <section :style="card">
          <p :style="caption">Cancelled before starting</p>
          <DlLifecycle :steps="cancelled" current="CANCELLED" :exits="cancelledExits" exited-from="PENDING" />
        </section>
      </div>
    `,
  }),
};

const projectSteps: LifecycleStep[] = [
  { key: 'PENDING', label: 'Registered', icon: 'mdi-clock-outline' },
  { key: 'ACTIVE', label: 'Active', icon: 'mdi-check-circle-outline' },
];

const projectExits: LifecycleExit[] = [
  { key: 'SUSPENDED', label: 'Suspended', icon: 'mdi-pause', tone: 'error', caption: 'Key leaked, revoked' },
];

export const OtherFlow: Story = {
  name: 'Another application',
  parameters: {
    docs: {
      description: {
        story: 'A project on the SSO, suspended after going live. The exit tone comes from the caller.',
      },
    },
  },
  render: () => ({
    components: { DlLifecycle },
    setup: () => ({ card, projectSteps, projectExits }),
    template: `
      <section :style="card" style="max-width: 560px;">
        <DlLifecycle :steps="projectSteps" current="SUSPENDED" :exits="projectExits" exited-from="ACTIVE" label="Project status" />
      </section>
    `,
  }),
};

export const Narrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Inside a narrow card the steps stack, even when the window is wide: the component ' +
          'looks at its own width, not the viewport.',
      },
    },
  },
  render: () => ({
    components: { DlLifecycle },
    setup: () => ({
      card,
      contractExits,
      steps: withCaptions({ PENDING: 'Sep 12, 2026', ACTIVE: 'Since Sep 15, 2026' }),
    }),
    template: `
      <section :style="card" style="max-width: 300px;">
        <DlLifecycle :steps="steps" current="ACTIVE" :exits="contractExits" />
      </section>
    `,
  }),
};
