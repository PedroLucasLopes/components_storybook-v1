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
    'hover-opacity': dark ? 0.08 : 0.04,
    'focus-opacity': dark ? 0.14 : 0.1,
    'selected-opacity': dark ? 0.16 : 0.08,
    'disabled-opacity': 0.38,
    'medium-emphasis-opacity': 1,
  },
});

export const lightTheme = toVuetifyTheme(lightColors, false);
export const darkTheme = toVuetifyTheme(darkColors, true);

export const THEME_LIGHT = 'dotlogLight';
export const THEME_DARK = 'dotlogDark';

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

export const createDotlogVuetify = () => createVuetify(vuetifyOptions);

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
