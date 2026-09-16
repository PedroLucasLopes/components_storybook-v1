import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import type { ThemeMode } from '../theme/useTheme';
import DlUserMenu from './DlUserMenu.vue';

/**
 * O menu de quem entrou, já aberto.
 *
 * A seção de língua não é declarada em lugar nenhum: sai dos JSON que a
 * aplicação registrou no vue-i18n. Aqui são os três de `src/mocks/locales`, os
 * mesmos que o Storybook usa. Trocar a língua no menu troca o próprio menu, e a
 * barra de cima escolhe a língua de qualquer outra story.
 */

const meta: Meta<typeof DlUserMenu> = {
  title: 'Navigation/User menu',
  component: DlUserMenu,
  parameters: {
    layout: 'padded',
    docs: {
      // Cada story no próprio quadro: dois menus abertos na mesma página se sobreporiam.
      story: { inline: false, iframeHeight: 600 },
      description: {
        component:
          'Who is signed in, the theme, the language and sign-out. The languages are the ' +
          'translations the application registered, each with its own name and the flag of ' +
          'its country. With a single language the section is not shown.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DlUserMenu>;

const menu = (wrapper: { open: string; close: string }) => () => ({
  components: { DlUserMenu },
  setup() {
    const open = ref(true);
    const theme = ref<ThemeMode>('system');
    const chosen = ref<string | null>(null);

    return { open, theme, chosen };
  },
  template: `
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-height: 540px;">
      ${wrapper.open}
        <DlUserMenu
          v-model:open="open"
          v-model:theme-mode="theme"
          name="Marina Albuquerque"
          email="marina.albuquerque@example.com"
          role="Superadmin"
          @update:locale="(code) => (chosen = code)"
        />
      ${wrapper.close}
      <small style="color: var(--dl-on-surface-muted);">update:locale: {{ chosen ?? '—' }}</small>
    </div>
  `,
});

export const Languages: Story = {
  name: 'Registered languages',
  render: menu({ open: '', close: '' }),
};

export const OneLanguage: Story = {
  name: 'One language',
  parameters: {
    docs: {
      description: {
        story:
          'An application that registered a single translation. There is nothing to choose, ' +
          'so the language section is not rendered.',
      },
    },
  },
  render: menu({ open: `<VLocaleProvider locale="en" :messages="{ en: {} }">`, close: '</VLocaleProvider>' }),
};
