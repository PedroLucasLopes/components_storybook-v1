/**
 * Tokens de design do ecossistema.
 *
 * Uma fonte de verdade para cor, raio, espaçamento e tipografia. Tudo o que
 * aparece na tela sai daqui: componente não escreve hex, escreve token.
 *
 * ## Como as cores foram escolhidas
 *
 * Os pares foram conferidos contra a WCAG 2.1 antes de entrar, com
 * `npm run check:contrast`. O mínimo é 4.5:1 para texto corrido e 3:1 para
 * texto grande e para componente de interface (bordas, ícones, estados).
 *
 * **Claro.** O fundo da página é levemente acinzentado e a superfície é branca.
 * A hierarquia vem do contraste entre os dois, não de sombra pesada: cartão
 * branco sobre fundo cinza lê como elevado mesmo sem `box-shadow`.
 *
 * **Escuro.** O fundo é quase preto, nunca `#000000`. Preto puro causa halação
 * em tela OLED, cansa a vista e destrói a percepção de elevação, porque não
 * sobra para onde escurecer. O Material Design fixa `#121212` por essas razões,
 * e a base aqui fica na mesma vizinhança.
 *
 * As cores de destaque do tema escuro são mais CLARAS e menos saturadas que as
 * do claro. Cor saturada sobre fundo escuro vibra e fica difícil de ler; a
 * regra prática é subir na escala de luminosidade e descer na de saturação.
 */

export interface ThemeColors {
  /** Fundo da página. */
  background: string;
  /** Cartão, tabela, painel: o que fica sobre o fundo. */
  surface: string;
  /** Cabeçalho de tabela, linha zebrada, estado hover. */
  surfaceVariant: string;
  /** Texto principal e ícone de alta ênfase. */
  onSurface: string;
  /** Texto de apoio, rótulo, dado secundário. */
  onSurfaceMuted: string;
  /** Borda, divisor, contorno de campo em repouso. */
  outline: string;
  /** Ação principal, item de navegação ativo, foco. */
  primary: string;
  /** O que fica em cima do `primary`. */
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

/** Branco levemente quebrado, como pedido: entre `#F9F9F9` e um pouco mais escuro. */
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
  // Escurecido ate passar 4.5:1 quando vira fundo tonal de pastilha, que e o
  // uso mais apertado desta cor. Em #9A6400 dava 4.26:1.
  warning: '#8F5D00',
  error: '#C02626',
  info: '#1A6BAA',
};

/** Quase preto, nunca `#000000`. Ver a explicação no topo do arquivo. */
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

/**
 * Escala de espaçamento em passos de 4px.
 *
 * Passo único evita o "quase alinhado" que aparece quando cada tela inventa a
 * própria margem. Quatro pixels é fino o bastante para ajuste e grosso o
 * bastante para manter ritmo.
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

/** Raio de canto. `sm` para campo e botão, `md` para cartão, `pill` para chip. */
export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  pill: '999px',
} as const;

/**
 * Elevação por sombra, discreta de propósito.
 *
 * No tema escuro a sombra quase não aparece, porque sombra sobre fundo escuro
 * não comunica nada. Lá a elevação vem de `surfaceVariant`, que é mais claro
 * que `surface`. É a mesma lógica do Material: no escuro sobe-se a superfície,
 * não se escurece em volta.
 */
export const elevation = {
  none: 'none',
  sm: '0 1px 2px rgba(16, 18, 28, 0.06), 0 1px 3px rgba(16, 18, 28, 0.04)',
  md: '0 2px 6px rgba(16, 18, 28, 0.08), 0 6px 16px rgba(16, 18, 28, 0.06)',
  lg: '0 8px 24px rgba(16, 18, 28, 0.12)',
} as const;

/**
 * Tipografia.
 *
 * Uma família só para texto e uma monoespaçada para dado técnico: id, chave,
 * token, código. Distinguir os dois evita que alguém leia um identificador
 * errado por causa de `l` e `1` na mesma forma.
 */
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

/**
 * Pontos de quebra, iguais aos que o `sso_plataforma` já usa no Vuetify.
 *
 * Repetidos aqui porque os componentes precisam deles em CSS, onde a API do
 * Vuetify não alcança.
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 840,
  lg: 1145,
  xl: 1545,
  xxl: 2138,
} as const;

/** Duração de transição. Curta: interface de gestão não deve fazer esperar. */
export const motion = {
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
  easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
} as const;
