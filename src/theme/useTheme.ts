import { computed, ref, watch } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { darkColors, lightColors } from './tokens';
import { cssVariables, THEME_DARK, THEME_LIGHT } from './vuetify';

/**
 * Tema por usuário, com três estados e duas fontes.
 *
 * ## Os três estados
 *
 * `system` é o padrão e acompanha o sistema operacional em tempo real, sem
 * precisar recarregar. `light` e `dark` são escolha explícita e mandam mais que
 * o sistema. Guardar "seguir o sistema" como um estado próprio, em vez de
 * resolver para claro ou escuro na hora de salvar, é o que permite a preferência
 * continuar acompanhando o sistema depois.
 *
 * ## As duas fontes, e por que as duas
 *
 * O **navegador** (`localStorage`) é lido de forma síncrona no boot. Sem isso a
 * página pinta clara e troca para escura quando a resposta do backend chega, e
 * esse piscar branco é exatamente o que incomoda quem escolheu o tema escuro.
 *
 * O **backend** é a verdade entre dispositivos. Chega junto da sessão, em
 * `GET /auth/me`, e reconcilia o que estava guardado localmente. Trocar o tema
 * grava nos dois: local primeiro, para a interface responder na hora, e remoto
 * depois, sem bloquear.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

/** O que o backend manda junto com a sessão. */
export interface ThemePreferences {
  mode?: ThemeMode;
  /** Cor de destaque própria do usuário, em hex. Opcional. */
  accent?: string | null;
}

const STORAGE_KEY = 'dl.theme';

const isMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Leitura tolerante: `localStorage` pode lançar em aba anônima, em navegador
 * com dados de site bloqueados, e dentro de captura de miniatura. Falhar aqui
 * não pode derrubar o boot da aplicação.
 */
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
    /* Conveniência, não requisito: sem armazenamento a interface segue. */
  }
};

const prefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;

const armazenado = readStored();

const mode = ref<ThemeMode>(armazenado.mode ?? 'system');
const accent = ref<string | null>(armazenado.accent ?? null);
const systemIsDark = ref(prefersDark());

// Acompanha o sistema enquanto a página estiver aberta. Quem escolheu `light`
// ou `dark` não é afetado, porque `resolved` só olha isto no modo `system`.
if (typeof window !== 'undefined' && window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      systemIsDark.value = event.matches;
    });
}

/** O modo que está de fato na tela, com `system` já resolvido. */
const resolved = computed<'light' | 'dark'>(() =>
  mode.value === 'system' ? (systemIsDark.value ? 'dark' : 'light') : mode.value,
);

/**
 * Aplica os tokens como variáveis CSS na raiz do documento.
 *
 * O Vuetify cuida das cores dos componentes dele. Isto existe para o CSS
 * escopado dos nossos componentes, que não enxerga o tema do Vuetify.
 */
const applyCssVariables = (dark: boolean, accentColor: string | null): void => {
  if (typeof document === 'undefined') return;

  const base = dark ? darkColors : lightColors;
  const variables = cssVariables(
    accentColor ? { ...base, primary: accentColor } : base,
  );

  for (const [nome, valor] of Object.entries(variables)) {
    document.documentElement.style.setProperty(nome, valor);
  }

  // Para CSS que precise reagir sem JavaScript, e para o Storybook.
  document.documentElement.dataset.dlTheme = dark ? 'dark' : 'light';
};

/**
 * Composable de tema. Chame `bindVuetify()` uma vez, dentro de um componente,
 * para ligar ao Vuetify; o resto funciona em qualquer lugar.
 */
export function useThemePreferences() {
  /** Aplica o que veio do backend sem sobrescrever escolha local mais nova. */
  const hydrate = (preferences: ThemePreferences | null | undefined): void => {
    if (!preferences) return;

    if (isMode(preferences.mode)) mode.value = preferences.mode;
    if (preferences.accent !== undefined) accent.value = preferences.accent;

    writeStored({ mode: mode.value, accent: accent.value });
  };

  /**
   * Troca o modo. Grava local na hora e devolve o que deve ir para o backend,
   * para quem chama decidir como persistir. A biblioteca não escolhe rota nem
   * cliente HTTP da aplicação.
   */
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

  /** Alterna entre claro e escuro a partir do que está na tela. */
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

/**
 * Liga o composable ao Vuetify. Só pode ser chamado de dentro de um componente,
 * porque `useTheme` do Vuetify depende do contexto de injeção.
 */
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
