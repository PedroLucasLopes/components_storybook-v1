import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { darkColors, lightColors, radius, spacing, typography } from './tokens';

const contrast = (a: string, b: string): number => {
  const lum = (hex: string) => {
    const c = hex.replace('#', '');
    const [r, g, bl] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
    const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);

  return (x + 0.05) / (y + 0.05);
};

const meta: Meta = {
  title: 'Foundation/Colors',
  parameters: {
    docs: {
      description: {
        component:
          'Paleta do ecossistema. Cada par de texto sobre fundo foi conferido ' +
          'contra a WCAG 2.1 antes de entrar: 4.5:1 para texto corrido, 3:1 ' +
          'para componente de interface.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const samples = (dark: boolean) => {
  const c = dark ? darkColors : lightColors;

  return [
    { name: 'background', value: c.background, over: c.onSurface, role: 'Page background' },
    { name: 'surface', value: c.surface, over: c.onSurface, role: 'Card, table, panel' },
    { name: 'surface-variant', value: c.surfaceVariant, over: c.onSurfaceMuted, role: 'Header, zebra, hover' },
    { name: 'primary', value: c.primary, over: c.onPrimary, role: 'Primary action, active item' },
    { name: 'success', value: c.success, over: c.surface, role: 'Confirmation, active state' },
    { name: 'warning', value: c.warning, over: c.surface, role: 'Attention, pending' },
    { name: 'error', value: c.error, over: c.surface, role: 'Failure, destructive action' },
    { name: 'info', value: c.info, over: c.surface, role: 'Neutral notice' },
  ];
};

export const Palette: Story = {
  render: (_args, { globals }) => ({
    setup() {
      const dark = globals.theme === 'dark';
      const base = dark ? darkColors : lightColors;

      return { items: samples(dark), base, dark, contrast, spacing, radius, typography };
    },
    template: `
      <section :style="{ fontFamily: typography.fontFamily }">
        <h2 :style="{ margin: '0 0 4px', fontSize: typography.size.xl, color: base.onSurface }">
          {{ dark ? 'Dark' : 'Light' }} theme
        </h2>
        <p :style="{ margin: '0 0 24px', fontSize: typography.size.md, color: base.onSurfaceMuted }">
          Switch the theme in the toolbar above. The same component has to work in both.
        </p>

        <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: spacing.md }">
          <article
            v-for="item in items"
            :key="item.name"
            :style="{
              border: '1px solid ' + base.outline,
              borderRadius: radius.md,
              overflow: 'hidden',
              background: base.surface,
            }"
          >
            <div :style="{ background: item.value, height: '72px' }"></div>
            <div :style="{ padding: spacing.md }">
              <div :style="{ fontFamily: typography.fontFamilyMono, fontSize: typography.size.sm, color: base.onSurface }">
                {{ item.name }}
              </div>
              <div :style="{ fontFamily: typography.fontFamilyMono, fontSize: typography.size.xs, color: base.onSurfaceMuted }">
                {{ item.value }}
              </div>
              <div :style="{ marginTop: spacing.sm, fontSize: typography.size.xs, color: base.onSurfaceMuted }">
                {{ item.role }}
              </div>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Contrast: Story = {
  name: 'Contrast, verified',
  render: (_args, { globals }) => ({
    setup() {
      const dark = globals.theme === 'dark';
      const c = dark ? darkColors : lightColors;

      const pairs = [
        { pair: 'Text on surface', fg: c.onSurface, bg: c.surface, min: 4.5 },
        { pair: 'Muted text on surface', fg: c.onSurfaceMuted, bg: c.surface, min: 4.5 },
        { pair: 'Muted text on variant', fg: c.onSurfaceMuted, bg: c.surfaceVariant, min: 4.5 },
        { pair: 'Primary on surface', fg: c.primary, bg: c.surface, min: 3 },
        { pair: 'onPrimary on primary', fg: c.onPrimary, bg: c.primary, min: 4.5 },
        { pair: 'Error on surface', fg: c.error, bg: c.surface, min: 3 },
        { pair: 'Success on surface', fg: c.success, bg: c.surface, min: 3 },
        { pair: 'Warning on surface', fg: c.warning, bg: c.surface, min: 3 },
      ].map((p) => ({ ...p, ratio: contrast(p.fg, p.bg) }));

      return { pairs, base: c, spacing, radius, typography };
    },
    template: `
      <table :style="{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: typography.fontFamily,
        fontSize: typography.size.md,
        color: base.onSurface,
        background: base.surface,
        border: '1px solid ' + base.outline,
        borderRadius: radius.md,
        overflow: 'hidden',
      }">
        <thead>
          <tr :style="{ background: base.surfaceVariant, textAlign: 'left' }">
            <th :style="{ padding: spacing.sm + ' ' + spacing.md, fontWeight: 500 }">Pair</th>
            <th :style="{ padding: spacing.sm + ' ' + spacing.md, fontWeight: 500 }">Sample</th>
            <th :style="{ padding: spacing.sm + ' ' + spacing.md, fontWeight: 500 }">Ratio</th>
            <th :style="{ padding: spacing.sm + ' ' + spacing.md, fontWeight: 500 }">Minimum</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pairs" :key="p.pair" :style="{ borderTop: '1px solid ' + base.outline }">
            <td :style="{ padding: spacing.sm + ' ' + spacing.md }">{{ p.pair }}</td>
            <td :style="{ padding: spacing.sm + ' ' + spacing.md }">
              <span :style="{ background: p.bg, color: p.fg, padding: '4px 10px', borderRadius: radius.sm }">
                Sample
              </span>
            </td>
            <td :style="{ padding: spacing.sm + ' ' + spacing.md, fontFamily: typography.fontFamilyMono }">
              {{ p.ratio.toFixed(2) }}:1
            </td>
            <td :style="{ padding: spacing.sm + ' ' + spacing.md, color: p.ratio >= p.min ? base.success : base.error }">
              {{ p.ratio >= p.min ? 'passes ' : 'below ' }}{{ p.min }}:1
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
