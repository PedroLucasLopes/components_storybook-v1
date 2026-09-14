import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DlToastHost from './DlToastHost.vue';
import { toast } from './useToast';
import DlFormDialog from '../components/DlFormDialog.vue';
import DlConfirmDialog from '../components/DlConfirmDialog.vue';
import DlTextField from '../components/DlTextField.vue';
import DlSelect from '../components/DlSelect.vue';
import DlButton from '../components/DlButton.vue';
import DlSkeleton from '../components/DlSkeleton.vue';
import DlLoader from '../components/DlLoader.vue';

const meta: Meta = {
  title: 'Feedback/Overview',
  parameters: {
    docs: {
      description: {
        component:
          'Toasts, create and edit dialogs, the delete confirmation, and the ' +
          'three shapes of loading. Everything respects `prefers-reduced-motion`: ' +
          'the state stays, the movement goes.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* ------------------------------- toasts ------------------------------- */

export const Toasts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Success fades on its own; an error stays until dismissed. A failure ' +
          'notice that leaves before it is read is worse than none. Hovering or ' +
          'focusing a toast pauses its clock.',
      },
    },
  },
  render: () => ({
    components: { DlToastHost, DlButton },
    setup() {
      const saving = ref(false);

      const save = (): void => {
        saving.value = true;
        setTimeout(() => {
          saving.value = false;
          toast.success('Equipment saved', {
            description: 'KR-0142 is now available for contracts.',
            action: { label: 'View', handler: () => toast.info('Opening KR-0142…') },
          });
        }, 900);
      };

      return { toast, save, saving };
    },
    template: `
      <div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <DlButton label="Save (success)" :loading="saving" @click="save" />
          <DlButton label="Warning" color="warning" variant="outlined"
            @click="toast.warning('Two items are past due', { description: 'Contracts 4021 and 4033 ended yesterday.' })" />
          <DlButton label="Error (stays)" color="error" variant="outlined"
            @click="toast.error('Could not reach the server', {
              description: 'The request timed out after 30 seconds.',
              action: { label: 'Retry', handler: () => toast.info('Retrying…') },
            })" />
          <DlButton label="Info" color="info" variant="text"
            @click="toast.info('Import finished', { description: '128 rows added.' })" />
          <DlButton label="Burst of five" variant="text"
            @click="[1,2,3,4,5].forEach((n) => toast.error('Row ' + n + ' failed'))" />
          <DlButton label="Dismiss all" variant="text" @click="toast.dismissAll()" />
        </div>
        <p style="margin-top: 16px; font-size: 13px; color: var(--dl-on-surface-muted); max-width: 60ch;">
          The stack is capped at four. A burst of failures, which is what happens
          when the network drops mid-batch, would otherwise cover the screen.
        </p>
        <DlToastHost />
      </div>
    `,
  }),
};

/* ------------------------------ dialogs ------------------------------- */

const statuses = [
  { title: 'Available', value: 'AVAILABLE' },
  { title: 'Maintenance', value: 'MAINTENANCE' },
];

export const CreateAndEdit: Story = {
  name: 'Create and edit',
  parameters: {
    docs: {
      description: {
        story:
          'One component for both: the mode changes the title, the button label ' +
          'and what comes prefilled, not the structure. A server failure lands ' +
          'inside the dialog, never as a toast: the person is looking at the ' +
          'form, and the dialog must not close and lose what was typed.',
      },
    },
  },
  render: () => ({
    components: { DlFormDialog, DlTextField, DlSelect, DlButton, DlToastHost },
    setup() {
      const creating = ref(false);
      const editing = ref(false);
      const submitting = ref(false);
      const error = ref<string | null>(null);
      const name = ref('');
      const status = ref('AVAILABLE');

      const open = (mode: 'create' | 'edit'): void => {
        error.value = null;
        name.value = mode === 'edit' ? '400L concrete mixer' : '';
        status.value = 'AVAILABLE';
        (mode === 'create' ? creating : editing).value = true;
      };

      const submit = (open: typeof creating, ok: boolean): void => {
        submitting.value = true;
        error.value = null;

        setTimeout(() => {
          submitting.value = false;

          if (ok) {
            open.value = false;
            toast.success('Equipment saved');
          } else {
            error.value = 'An equipment with this name already exists.';
          }
        }, 1100);
      };

      return { creating, editing, submitting, error, name, status, statuses, open, submit };
    },
    template: `
      <div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <DlButton label="New equipment" icon="mdi-plus" @click="open('create')" />
          <DlButton label="Edit equipment" icon="mdi-pencil-outline" variant="outlined" @click="open('edit')" />
        </div>

        <DlFormDialog
          v-model="creating"
          mode="create"
          title="New equipment"
          description="It starts as available and can enter a contract right away."
          :submitting="submitting"
          :error="error"
          :dirty="!!name"
          @submit="submit(creating, false)"
        >
          <DlTextField v-model="name" label="Name" placeholder="400L concrete mixer" required />
          <DlSelect v-model="status" :options="statuses" label="Status" />
          <p style="font-size: 12px; color: var(--dl-on-surface-muted); margin: 0;">
            This example always fails, to show where the server message lands.
          </p>
        </DlFormDialog>

        <DlFormDialog
          v-model="editing"
          mode="edit"
          title="Edit equipment"
          description="KR-0142"
          :submitting="submitting"
          :dirty="true"
          @submit="submit(editing, true)"
        >
          <DlTextField v-model="name" label="Name" required />
          <DlSelect v-model="status" :options="statuses" label="Status" />
          <p style="font-size: 12px; color: var(--dl-on-surface-muted); margin: 0;">
            Try closing with Esc or a click outside: unsaved changes ask first.
          </p>
        </DlFormDialog>

        <DlToastHost />
      </div>
    `,
  }),
};

export const Delete: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The button says what it does, never just "Confirm". For what cannot ' +
          'be undone, typing the record name is friction on purpose.',
      },
    },
  },
  render: () => ({
    components: { DlConfirmDialog, DlButton, DlToastHost },
    setup() {
      const simple = ref(false);
      const severe = ref(false);
      const processing = ref(false);

      const confirm = (open: typeof simple, message: string): void => {
        processing.value = true;
        setTimeout(() => {
          processing.value = false;
          open.value = false;
          toast.success(message);
        }, 900);
      };

      return { simple, severe, processing, confirm };
    },
    template: `
      <div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <DlButton label="Retire equipment" color="error" variant="outlined" @click="simple = true" />
          <DlButton label="Revoke client key" color="error" @click="severe = true" />
        </div>

        <DlConfirmDialog
          v-model="simple"
          title="Retire this equipment?"
          message="It leaves the available list and cannot enter a new contract. History stays."
          confirm-label="Retire equipment"
          :processing="processing"
          destructive
          @confirm="confirm(simple, 'Equipment retired')"
        />

        <DlConfirmDialog
          v-model="severe"
          title="Revoke the KRLoc key?"
          message="The application stops authenticating immediately. Only a new key, handed over in person, restores access."
          confirm-label="Revoke key"
          require-text="KRLoc"
          :processing="processing"
          destructive
          @confirm="confirm(severe, 'Key revoked')"
        />

        <DlToastHost />
      </div>
    `,
  }),
};

/* ------------------------------ loading ------------------------------- */

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Nothing appears before about 220ms. A spinner that flashes for a ' +
          '100ms response reads as a fault, not as progress. The button keeps ' +
          'its width so neighbours do not move under the cursor.',
      },
    },
  },
  render: () => ({
    components: { DlButton, DlSkeleton, DlLoader, DlTextField },
    setup() {
      const busy = ref(false);
      const overlay = ref(false);
      const bar = ref(false);

      const run = (flag: { value: boolean }, ms = 2200): void => {
        flag.value = true;
        setTimeout(() => (flag.value = false), ms);
      };

      return { busy, overlay, bar, run };
    },
    template: `
      <div style="display: grid; gap: 28px; max-width: 620px;">
        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Button
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <DlButton label="Save changes" :loading="busy" @click="run(busy)" />
            <DlButton label="Generate document" icon="mdi-file-download-outline" variant="outlined" :loading="busy" @click="run(busy)" />
            <DlButton label="Delete" color="error" variant="text" :loading="busy" @click="run(busy)" />
          </div>
        </section>

        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Field
          </p>
          <DlTextField label="Client" loading placeholder="Loading…" style="max-width: 320px;" />
        </section>

        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Content skeleton
          </p>
          <div style="display: grid; gap: 16px; grid-template-columns: 56px 1fr; align-items: start;">
            <DlSkeleton variant="circle" width="56px" />
            <DlSkeleton :lines="4" />
          </div>
        </section>

        <section style="position: relative; border: 1px solid var(--dl-outline); border-radius: 16px; padding: 20px; min-height: 160px; background: var(--dl-surface);">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Blocking overlay
          </p>
          <p style="font-size: 14px; color: var(--dl-on-surface-muted); margin: 0 0 14px; max-width: 46ch;">
            Only for what must not be interrupted: generating a document,
            importing a sheet, revoking a key.
          </p>
          <DlButton label="Generate contract" variant="outlined" @click="run(overlay, 2600)" />
          <DlLoader :active="overlay" variant="overlay" message="Generating the contract. This can take a few seconds." />
        </section>

        <section>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--dl-on-surface-muted); margin: 0 0 10px;">
            Top bar, for navigation
          </p>
          <DlButton label="Show the bar" variant="text" @click="run(bar)" />
          <DlLoader :active="bar" variant="bar" />
        </section>
      </div>
    `,
  }),
};
