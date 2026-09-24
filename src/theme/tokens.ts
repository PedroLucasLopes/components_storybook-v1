export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceMuted: string;
  outline: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceVariant: '#ECECEF',
  onSurface: '#1B1B1F',
  onSurfaceMuted: '#5A5A66',
  outline: '#C9C9D0',
  primary: '#3B5BDB',
  onPrimary: '#FFFFFF',
  success: '#1F7A4D',
  warning: '#8F5D00',
  error: '#C02626',
  info: '#1A6BAA',
};

export const darkColors: ThemeColors = {
  background: '#121216',
  surface: '#1A1A20',
  surfaceVariant: '#25252D',
  onSurface: '#E6E6EA',
  onSurfaceMuted: '#A0A0AE',
  outline: '#3A3A45',
  primary: '#93A8FF',
  onPrimary: '#10121C',
  success: '#5FD39B',
  warning: '#E9B44C',
  error: '#FF8A8A',
  info: '#7CC0F0',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  pill: '999px',
} as const;

export const elevation = {
  none: 'none',
  sm: '0 1px 2px rgba(16, 18, 28, 0.06), 0 1px 3px rgba(16, 18, 28, 0.04)',
  md: '0 2px 6px rgba(16, 18, 28, 0.08), 0 6px 16px rgba(16, 18, 28, 0.06)',
  lg: '0 8px 24px rgba(16, 18, 28, 0.12)',
} as const;

export const typography = {
  fontFamily:
    "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontFamilyMono: "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  size: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    display: '28px',
  },
  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
  },
} as const;

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 840,
  lg: 1145,
  xl: 1545,
  xxl: 2138,
} as const;

export const motion = {
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
} as const;
