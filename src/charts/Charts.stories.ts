import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';
import DlChartFrame from './DlChartFrame.vue';
import DlBarChart from './DlBarChart.vue';
import DlDonutChart from './DlDonutChart.vue';
import DlAreaChart from './DlAreaChart.vue';
import DlSkeleton from '../components/DlSkeleton.vue';
import { seriesColor } from './palette';
import { currency } from '../mocks';

/**
 * A paleta de séries é separada da paleta de estado. Verde de sucesso não vira
 * "série 3": usar cor reservada numa barra qualquer faz um dado comum parecer
 * alerta.
 */

const meta: Meta = {
  title: 'Charts/Overview',
  parameters: {
    docs: {
      description: {
        component:
          'Bar for magnitude, donut for composition, line and area for change ' +
          'over time. The palette was run through the validator against both ' +
          'surfaces. On the light surface three hues sit below 3:1, so every ' +
          'chart here carries direct labels and a table view, which is not ' +
          'optional relief.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* ------------------------------ dados ------------------------------- */

const byCategory = [
  { label: 'Scaffolding', value: 48200 },
  { label: 'Concrete mixers', value: 31450 },
  { label: 'Compactors', value: 24800 },
  { label: 'Generators', value: 18900 },
  { label: 'Hand tools', value: 9600 },
];

const byStatus = [
  { label: 'Available', value: 128 },
  { label: 'Leased', value: 74 },
  { label: 'Maintenance', value: 19 },
  { label: 'Retired', value: 11 },
];

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const revenue = [72000, 81500, 78900, 94200, 101300, 118400];
const contracts = [41, 47, 44, 52, 58, 63];

const useDark = (globals: Record<string, unknown>) => globals.theme === 'dark';

export const Bar: Story = {
  name: 'Bar',
  parameters: {
    docs: {
      description: {
        story:
          'Horizontal, because a category label in a management screen is text, ' +
          'and text turned on its side makes people tilt their head. Zero is ' +
          'always the origin: a cropped bar lies about proportion.',
      },
    },
  },
  render: (_args, { globals }) => ({
    components: { DlChartFrame, DlBarChart },
    setup() {
      const dark = computed(() => useDark(globals));
      const data = computed(() =>
        byCategory.map((d, i) => ({ ...d, color: seriesColor(i, dark.value) })),
      );

      return {
        data,
        currency,
        series: computed(() => data.value.map((d) => ({ label: d.label, color: d.color }))),
        rows: byCategory.map((d) => [d.label, currency(d.value)]),
      };
    },
    template: `
      <div style="max-width: 620px;">
        <DlChartFrame
          title="Revenue by category"
          description="Last 30 days"
          :series="series"
          :table-headers="['Category', 'Revenue']"
          :table-rows="rows"
        >
          <DlBarChart :data="data" :format="currency" />
        </DlChartFrame>
      </div>
    `,
  }),
};

export const Donut: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The hole gives the total a place to live, and the total is usually ' +
          'the number people actually want. Comparing angles is what the eye ' +
          'does worst, so every slice carries its number in the legend.',
      },
    },
  },
  render: (_args, { globals }) => ({
    components: { DlChartFrame, DlDonutChart },
    setup() {
      const dark = computed(() => useDark(globals));
      const data = computed(() =>
        byStatus.map((d, i) => ({ ...d, color: seriesColor(i, dark.value) })),
      );
      const total = byStatus.reduce((sum, d) => sum + d.value, 0);

      return {
        data,
        series: computed(() =>
          data.value.map((d) => ({
            label: d.label,
            color: d.color,
            value: `${d.value} · ${((d.value / total) * 100).toFixed(0)}%`,
          })),
        ),
        rows: byStatus.map((d) => [
          d.label,
          String(d.value),
          `${((d.value / total) * 100).toFixed(1)}%`,
        ]),
      };
    },
    template: `
      <div style="max-width: 420px;">
        <DlChartFrame
          title="Fleet by status"
          description="232 items"
          :series="series"
          :table-headers="['Status', 'Items', 'Share']"
          :table-rows="rows"
        >
          <DlDonutChart :data="data" total-label="Items" />
        </DlChartFrame>
      </div>
    `,
  }),
};

export const Area: Story = {
  name: 'Area (single series)',
  parameters: {
    docs: {
      description: {
        story:
          'Fill only with one series. Two loose areas cover each other and the ' +
          'lower one becomes unreadable. Hovering picks the nearest point in ' +
          'time and shows that whole instant, which is the question people ask ' +
          'of a time chart.',
      },
    },
  },
  render: (_args, { globals }) => ({
    components: { DlChartFrame, DlAreaChart },
    setup() {
      const dark = computed(() => useDark(globals));
      const series = computed(() => [
        { label: 'Revenue', color: seriesColor(0, dark.value), values: revenue },
      ]);

      return {
        months,
        series,
        currency,
        rows: months.map((m, i) => [m, currency(revenue[i])]),
      };
    },
    template: `
      <div style="max-width: 680px;">
        <DlChartFrame
          title="Monthly revenue"
          description="Six months"
          :series="series"
          :table-headers="['Month', 'Revenue']"
          :table-rows="rows"
        >
          <DlAreaChart :labels="months" :series="series" :format="currency" filled />
        </DlChartFrame>
      </div>
    `,
  }),
};

export const Lines: Story = {
  name: 'Lines (two series)',
  parameters: {
    docs: {
      description: {
        story:
          'Two measures of different magnitude are two charts, never one with ' +
          'two y-axes. A dual axis is the easiest way to suggest a correlation ' +
          'that is not there, so this library has no such option. Here both ' +
          'series are indexed to a common base instead.',
      },
    },
  },
  render: (_args, { globals }) => ({
    components: { DlChartFrame, DlAreaChart },
    setup() {
      const dark = computed(() => useDark(globals));

      // Indexado à primeira observação: uma escala só, como manda o método.
      const indexed = (values: number[]) =>
        values.map((v) => Math.round((v / values[0]) * 100));

      const series = computed(() => [
        { label: 'Revenue (index)', color: seriesColor(0, dark.value), values: indexed(revenue) },
        { label: 'Contracts (index)', color: seriesColor(1, dark.value), values: indexed(contracts) },
      ]);

      return {
        months,
        series,
        rows: months.map((m, i) => [
          m,
          String(indexed(revenue)[i]),
          String(indexed(contracts)[i]),
        ]),
      };
    },
    template: `
      <div style="max-width: 680px;">
        <DlChartFrame
          title="Revenue and contracts, indexed to April"
          description="April = 100"
          :series="series"
          :table-headers="['Month', 'Revenue', 'Contracts']"
          :table-rows="rows"
        >
          <DlAreaChart :labels="months" :series="series" />
        </DlChartFrame>
      </div>
    `,
  }),
};

export const LoadingAndEmpty: Story = {
  name: 'Loading and empty',
  render: () => ({
    components: { DlChartFrame, DlSkeleton },
    setup: () => ({ series: [] }),
    template: `
      <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        <DlChartFrame title="Revenue by category" :series="series" loading>
          <template #loading>
            <DlSkeleton :lines="5" height="22px" />
          </template>
        </DlChartFrame>

        <DlChartFrame
          title="Fleet by status"
          :series="series"
          empty
          empty-message="No equipment matches the selected filters."
        />
      </div>
    `,
  }),
};
