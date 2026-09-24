import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed, ref } from 'vue';
import { httpMethodStatus } from '../data/httpMethods';
import { buildRouteTree, findRouteNode, routeAncestorKeys, routeParams } from '../data/routeTree';
import { routeCatalog } from '../mocks';
import DlButton from './DlButton.vue';
import DlDescriptionList, { type DescriptionItem } from './DlDescriptionList.vue';
import DlEmptyState from './DlEmptyState.vue';
import DlMasterDetail from './DlMasterDetail.vue';
import DlRoutePath from './DlRoutePath.vue';
import DlRouteTree from './DlRouteTree.vue';
import DlSectionCard from './DlSectionCard.vue';
import DlStatusChip from './DlStatusChip.vue';
import DlTextField from './DlTextField.vue';

const meta: Meta = {
  title: 'Data/Route tree',
  parameters: {
    docs: {
      description: {
        component:
          'The routes of one application as a tree: a base path is the parent, and every path that ' +
          'starts with it lives inside. Every node is clickable and opens its details.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const card =
  'background: var(--dl-surface); border: 1px solid var(--dl-outline); border-radius: 16px; overflow: hidden;';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

export const Tree: Story = {
  name: 'Tree with filter',
  parameters: {
    docs: {
      description: {
        story:
          'Click a row to select it, the arrow to only open or close. Keyboard: arrows, Home, End, ' +
          'Enter. The filter keeps the path to each match and opens it; the amber mark flags a ' +
          'route no role can call.',
      },
    },
  },
  render: () => ({
    components: { DlRouteTree, DlTextField, DlRoutePath },
    setup() {
      const selected = ref<string | null>(null);
      const query = ref('');
      const methods = ref<string[]>([]);
      const tree = ref<{ expandAll: () => void; collapseAll: () => void } | null>(null);

      return { routes: routeCatalog, selected, query, methods, tree, METHODS };
    },
    template: `
      <div style="max-width: 720px; ${card}">
        <div style="display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--dl-outline);">
          <div style="flex: 1 1 240px;">
            <DlTextField v-model="query" icon="mdi-magnify" placeholder="Filter by path" density="compact" :reserve-error="false" />
          </div>
          <VChipGroup v-model="methods" multiple color="primary" aria-label="Filter by method">
            <VChip v-for="method in METHODS" :key="method" :value="method" filter size="small" variant="outlined">{{ method }}</VChip>
          </VChipGroup>
          <div style="display: flex; gap: 2px;">
            <VBtn icon="mdi-unfold-more-horizontal" aria-label="Expand all" title="Expand all" variant="text" size="small" density="comfortable" @click="tree?.expandAll()" />
            <VBtn icon="mdi-unfold-less-horizontal" aria-label="Collapse all" title="Collapse all" variant="text" size="small" density="comfortable" @click="tree?.collapseAll()" />
          </div>
        </div>

        <DlRouteTree ref="tree" v-model:selected="selected" :routes="routes" :query="query" :methods="methods" label="KRLoc routes" />

        <div style="padding: 12px 16px; border-top: 1px solid var(--dl-outline); font-size: 13px; color: var(--dl-on-surface-muted);">
          Selected: <DlRoutePath v-if="selected" :path="selected" /><span v-else>nothing yet</span>
        </div>
      </div>
    `,
  }),
};

const detailStage = (maxWidth: string) => ({
  components: {
    DlMasterDetail,
    DlRouteTree,
    DlSectionCard,
    DlDescriptionList,
    DlStatusChip,
    DlRoutePath,
    DlEmptyState,
    DlButton,
    DlTextField,
  },
  setup() {
    const selected = ref<string | null>('/equipment/:id');
    const query = ref('');
    const nodes = buildRouteTree(routeCatalog);

    const node = computed(() => (selected.value ? findRouteNode(nodes, selected.value) : null));
    const parent = computed(() => (selected.value ? routeAncestorKeys(nodes, selected.value).at(-1) ?? null : null));

    const facts = computed<DescriptionItem[]>(() => {
      const current = node.value;

      if (!current) return [];

      return [
        { key: 'path', label: 'Path', value: current.key, mono: true, copyable: true },
        {
          key: 'params',
          label: 'Parameters',
          value: routeParams(current.key).map((name) => `:${name}`).join(', ') || null,
          mono: true,
        },
        { key: 'parent', label: 'Parent', value: parent.value ?? 'Top level', mono: !!parent.value },
        { key: 'below', label: 'Paths below', value: current.descendants },
      ];
    });

    return { routes: routeCatalog, selected, query, node, facts, httpMethodStatus, maxWidth, card };
  },
  template: `
    <div :style="{ maxWidth }">
      <DlMasterDetail :detail-open="!!selected" :detail-key="selected" back-label="All routes" :sticky-top="16" @back="selected = null">
        <template #master>
          <DlSectionCard title="Routes" :count="routes.length" :padded="false">
            <div style="padding: 12px 16px 4px;">
              <DlTextField v-model="query" icon="mdi-magnify" placeholder="Filter by path" density="compact" :reserve-error="false" />
            </div>
            <DlRouteTree v-model:selected="selected" :routes="routes" :query="query" label="KRLoc routes" />
          </DlSectionCard>
        </template>

        <template #detail>
          <template v-if="node">
            <DlSectionCard :title="node.key">
              <template #title><DlRoutePath :path="node.key" size="large" /></template>
              <template #actions>
                <DlButton icon="mdi-source-branch" variant="tonal" size="small">Add sub-route</DlButton>
              </template>

              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px;">
                <span v-if="node.group" style="font-size: 13px; color: var(--dl-on-surface-muted);">
                  A group: no route of its own, it gathers the paths below.
                </span>
                <DlStatusChip v-for="route in node.routes" :key="route.id" :status="route.method" :map="httpMethodStatus" :with-icon="false" size="default" />
              </div>

              <DlDescriptionList :items="facts" />
            </DlSectionCard>

            <DlSectionCard v-if="node.children.length" title="Below this path" :count="node.descendants" :padded="false" :heading-level="3">
              <DlRouteTree :nodes="node.children" :selected="null" :label="'Routes below ' + node.key" @select="(child) => (selected = child.key)" />
            </DlSectionCard>
          </template>
        </template>

        <template #placeholder>
          <div :style="card">
            <DlEmptyState icon="mdi-gesture-tap" title="Select a route" description="Pick any path to see its methods, its parameters and what sits below it." compact />
          </div>
        </template>
      </DlMasterDetail>
    </div>
  `,
});

export const MasterDetail: Story = {
  name: 'Tree and details',
  parameters: {
    docs: {
      description: {
        story:
          'Side by side while there is room. The details follow the scroll, and the tree below a ' +
          'node is clickable too: selecting a child moves the details to it.',
      },
    },
  },
  render: () => detailStage('1080px'),
};

export const MasterDetailNarrow: Story = {
  name: 'Tree and details, narrow',
  parameters: {
    docs: {
      description: {
        story:
          'Without room for both, the details take the place of the tree, with a way back. Focus ' +
          'moves to the details, and returns to the row it came from.',
      },
    },
  },
  render: () => detailStage('420px'),
};

export const Paths: Story = {
  name: 'Route path',
  render: () => ({
    components: { DlRoutePath },
    template: `
      <div style="${card} padding: 20px; display: grid; gap: 16px; max-width: 560px;">
        <div>
          <div style="font-size: 12px; color: var(--dl-on-surface-muted); margin-bottom: 4px;">Parameters stand out</div>
          <DlRoutePath path="/equipment/:id/create" />
        </div>
        <div>
          <div style="font-size: 12px; color: var(--dl-on-surface-muted); margin-bottom: 4px;">What the parent already said is muted</div>
          <DlRoutePath path="/equipment/:id/create" base="/equipment/:id" />
        </div>
        <div>
          <div style="font-size: 12px; color: var(--dl-on-surface-muted); margin-bottom: 4px;">A search match, even across a slash</div>
          <DlRoutePath path="/lessee/lesseesbyclient/:clientId" highlight="client/:c" />
        </div>
        <div>
          <div style="font-size: 12px; color: var(--dl-on-surface-muted); margin-bottom: 4px;">Large, as a heading</div>
          <DlRoutePath path="/generate/contract/:id" size="large" />
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  name: 'Loading, empty and no match',
  render: () => ({
    components: { DlRouteTree },
    setup: () => ({ routes: routeCatalog }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        <div style="${card}"><DlRouteTree :routes="routes" loading /></div>
        <div style="${card}"><DlRouteTree :routes="[]" /></div>
        <div style="${card}"><DlRouteTree :routes="routes" query="/invoice" /></div>
      </div>
    `,
  }),
};

export const CustomEnd: Story = {
  name: 'Own controls per node',
  parameters: {
    docs: {
      description: {
        story:
          'With `selectable` off and `hide-methods`, a row only opens and closes, and the `node-end` ' +
          'slot draws its own controls. This is how a role checks the routes it unlocks.',
      },
    },
  },
  render: () => ({
    components: { DlRouteTree, DlStatusChip },
    setup() {
      const granted = ref(new Set(routeCatalog.filter((route) => route.method === 'GET').map((route) => route.id)));

      const toggle = (id: string, checked: boolean): void => {
        const next = new Set(granted.value);

        if (checked) next.add(id);
        else next.delete(id);

        granted.value = next;
      };

      return { routes: routeCatalog, granted, toggle, httpMethodStatus };
    },
    template: `
      <div style="max-width: 760px; ${card}">
        <DlRouteTree :routes="routes" :selectable="false" hide-methods label="Routes the Viewer role unlocks">
          <template #node-end="{ node }">
            <VCheckbox
              v-for="route in node.routes"
              :key="route.id"
              :model-value="granted.has(route.id)"
              :aria-label="'Viewer can ' + route.method + ' ' + route.path"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="(checked) => toggle(route.id, !!checked)"
            >
              <template #label>
                <DlStatusChip :status="route.method" :map="httpMethodStatus" :with-icon="false" />
              </template>
            </VCheckbox>
          </template>
        </DlRouteTree>
      </div>
    `,
  }),
};
