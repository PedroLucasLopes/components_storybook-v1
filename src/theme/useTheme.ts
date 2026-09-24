import { computed, ref, watch } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { darkColors, lightColors } from './tokens';
import { cssVariables, THEME_DARK, THEME_LIGHT } from './vuetify';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreferences {
  mode?: ThemeMode;
  accent?: string | null;
}

const STORAGE_KEY = 'dl.theme';

const isMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

const readStored = (): ThemePreferences => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed = JSON.parse(raw) as ThemePreferences;

    return {
      mode: isMode(parsed.mode) ? parsed.mode : undefined,
      accent: typeof parsed.accent === 'string' ? parsed.accent : null,
    };
  } catch {
    return {};
  }
};

const writeStored = (preferences: ThemePreferences): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
  }
};

const prefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;

const stored = readStored();

const mode = ref<ThemeMode>(stored.mode ?? 'system');
const accent = ref<string | null>(stored.accent ?? null);
const systemIsDark = ref(prefersDark());

if (typeof window !== 'undefined' && window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      systemIsDark.value = event.matches;
    });
}

const resolved = computed<'light' | 'dark'>(() =>
  mode.value === 'system' ? (systemIsDark.value ? 'dark' : 'light') : mode.value,
);

const applyCssVariables = (dark: boolean, accentColor: string | null): void => {
  if (typeof document === 'undefined') return;

  const base = dark ? darkColors : lightColors;
  const variables = cssVariables(
    accentColor ? { ...base, primary: accentColor } : base,
  );

  for (const [name, value] of Object.entries(variables)) {
    document.documentElement.style.setProperty(name, value);
  }

  document.documentElement.dataset.dlTheme = dark ? 'dark' : 'light';
};

export function useThemePreferences() {
  const hydrate = (preferences: ThemePreferences | null | undefined): void => {
    if (!preferences) return;

    if (isMode(preferences.mode)) mode.value = preferences.mode;
    if (preferences.accent !== undefined) accent.value = preferences.accent;

    writeStored({ mode: mode.value, accent: accent.value });
  };

  const setMode = (next: ThemeMode): ThemePreferences => {
    mode.value = next;
    writeStored({ mode: mode.value, accent: accent.value });

    return { mode: mode.value, accent: accent.value };
  };

  const setAccent = (next: string | null): ThemePreferences => {
    accent.value = next;
    writeStored({ mode: mode.value, accent: accent.value });

    return { mode: mode.value, accent: accent.value };
  };

  const toggle = (): ThemePreferences =>
    setMode(resolved.value === 'dark' ? 'light' : 'dark');

  return {
    mode,
    accent,
    resolved,
    isDark: computed(() => resolved.value === 'dark'),
    hydrate,
    setMode,
    setAccent,
    toggle,
    preferences: computed<ThemePreferences>(() => ({
      mode: mode.value,
      accent: accent.value,
    })),
  };
}

export function bindVuetifyTheme(): void {
  const vuetify = useVuetifyTheme();

  const apply = (): void => {
    const dark = resolved.value === 'dark';

    vuetify.change(dark ? THEME_DARK : THEME_LIGHT);
    applyCssVariables(dark, accent.value);
  };

  apply();
  watch([resolved, accent], apply);
}
