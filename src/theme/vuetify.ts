import { createVuetify, type ThemeDefinition, type VuetifyOptions } from 'vuetify';
import {
  breakpoints,
  darkColors,
  lightColors,
  motion,
  radius,
  spacing,
  typography,
  type ThemeColors,
} from './tokens';

/**
 * Ponte entre os tokens e o Vuetify.
 *
 * O Vuetify tem nomes próprios para cor (`surface`, `on-surface`, `primary`) e
 * gera classes utilitárias a partir deles. Em vez de manter duas paletas, esta
 * função traduz a nossa para o formato dele, e só ela conhece os dois lados.
 *
 * As mesmas cores saem também como variáveis CSS (`--dl-*`), para o que o
 * Vuetify não cobre: CSS escopado de componente nosso, gradiente, sombra.
 */

const toVuetifyTheme = (colors: ThemeColors, dark: boolean): ThemeDefinition => ({
  dark,
  colors: {
    background: colors.background,
    surface: colors.surface,
    'surface-variant': colors.surfaceVariant,
    'on-background': colors.onSurface,
    'on-surface': colors.onSurface,
    'on-surface-variant': colors.onSurfaceMuted,
    primary: colors.primary,
    'on-primary': colors.onPrimary,
    secondary: colors.onSurfaceMuted,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  variables: {
    'border-color': colors.outline,
    'border-opacity': 1,
    // O Vuetify escurece o fundo para indicar hover. No tema escuro isso some,
    // porque não há para onde escurecer; lá a indicação vem de clarear.
    'hover-opacity': dark ? 0.08 : 0.04,
    'focus-opacity': dark ? 0.14 : 0.1,
    'selected-opacity': dark ? 0.16 : 0.08,
    'disabled-opacity': 0.38,
    'medium-emphasis-opacity': 1,
  },
});

export const lightTheme = toVuetifyTheme(lightColors, false);
export const darkTheme = toVuetifyTheme(darkColors, true);

/** Nomes dos temas. Use estas constantes em vez de digitar a string. */
export const THEME_LIGHT = 'dotlogLight';
export const THEME_DARK = 'dotlogDark';

/**
 * Opções do Vuetify para as aplicações do ecossistema.
 *
 * ⚠️ **`utilities` fica LIGADO**, apesar do Tailwind. Foi tentador desligar para
 * evitar duas folhas de utilitário, e isso quebra o framework inteiro: o `color`
 * de qualquer componente do Vuetify é aplicado por uma classe gerada
 * (`text-success`, `bg-primary`). Sem elas o componente recebe a classe, a
 * variável do tema existe, e nada acontece: chip de erro sai cinza, botão
 * destrutivo sai neutro. O sintoma não aponta para a causa.
 *
 * A sobreposição real com o Tailwind é pequena, e onde existe o Tailwind vence
 * por ordem de importação.
 *
 * `mobileBreakpoint: 'md'` porque as telas são de gestão: tabela e formulário
 * denso precisam de largura, e abaixo de 840px a navegação vira gaveta.
 */
export const vuetifyOptions: VuetifyOptions = {
  theme: {
    defaultTheme: THEME_LIGHT,
    themes: {
      [THEME_LIGHT]: lightTheme,
      [THEME_DARK]: darkTheme,
    },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: { ...breakpoints },
  },
  defaults: {
    global: {
      // Sem ondulação por padrão. Em painel de gestão o clique é frequente e o
      // efeito vira ruído; quem quiser liga por componente.
      ripple: false,
    },
    VBtn: {
      variant: 'flat',
      rounded: 'md',
      height: 38,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VCard: {
      rounded: 'lg',
      flat: true,
    },
  },
};

/** Atalho para quem só quer o padrão do ecossistema. */
export const createDotlogVuetify = () => createVuetify(vuetifyOptions);

/**
 * Emite os tokens como variáveis CSS no escopo pedido.
 *
 * Necessário porque CSS escopado de componente não enxerga o tema do Vuetify.
 * Chamado uma vez pelo plugin de tema, ao trocar de modo.
 */
export const cssVariables = (colors: ThemeColors): Record<string, string> => ({
  '--dl-background': colors.background,
  '--dl-surface': colors.surface,
  '--dl-surface-variant': colors.surfaceVariant,
  '--dl-on-surface': colors.onSurface,
  '--dl-on-surface-muted': colors.onSurfaceMuted,
  '--dl-outline': colors.outline,
  '--dl-primary': colors.primary,
  '--dl-on-primary': colors.onPrimary,
  '--dl-success': colors.success,
  '--dl-warning': colors.warning,
  '--dl-error': colors.error,
  '--dl-info': colors.info,

  '--dl-space-xs': spacing.xs,
  '--dl-space-sm': spacing.sm,
  '--dl-space-md': spacing.md,
  '--dl-space-lg': spacing.lg,
  '--dl-space-xl': spacing.xl,

  '--dl-radius-sm': radius.sm,
  '--dl-radius-md': radius.md,
  '--dl-radius-lg': radius.lg,
  '--dl-radius-pill': radius.pill,

  '--dl-font': typography.fontFamily,
  '--dl-font-mono': typography.fontFamilyMono,

  '--dl-motion-fast': motion.fast,
  '--dl-motion-normal': motion.normal,
  '--dl-easing': motion.easing,
});
