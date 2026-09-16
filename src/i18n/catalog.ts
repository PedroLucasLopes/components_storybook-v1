import { formatMessage, type MessageParams } from './format';
import { matchLocale } from './languages';
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

/**
 * Os textos dos próprios componentes, um JSON por língua em `locales/`.
 *
 * **Não passam pelo vue-i18n da aplicação.** A biblioteca resolve os dela pela
 * língua corrente e mais nada: quem consome não registra, não mescla e não
 * conhece estas chaves. Língua que a aplicação tem e a biblioteca não tem cai
 * no inglês, só nos textos dos componentes.
 *
 * Língua nova aqui é um JSON com as mesmas chaves do `en.json`, registrado no
 * `CATALOG`. O TypeScript recusa arquivo com chave faltando, e
 * `npm run check:locales` recusa chave sobrando e parâmetro diferente.
 */

type Messages = typeof en;

type Leaves<Tree, Prefix extends string = ''> = {
  [Key in keyof Tree & string]: Tree[Key] extends string ? `${Prefix}${Key}` : Leaves<Tree[Key], `${Prefix}${Key}.`>;
}[keyof Tree & string];

export type DotlogTextKey = Leaves<Messages>;

const CATALOG: Readonly<Record<string, Messages>> = { en, es, 'pt-BR': ptBR };

/**
 * Línguas em que os componentes da biblioteca têm texto próprio. Fica fora do
 * `index.ts`: a declaração deste arquivo importa os JSON, que não vão no pacote.
 */
const DOTLOG_LOCALES: readonly string[] = Object.freeze(Object.keys(CATALOG));

const FALLBACK = 'en';

/* A mesma língua é resolvida a cada texto da tela; a conta fica guardada. */
const resolved = new Map<string, string>();

const catalogLocale = (locale: string): string => {
  let code = resolved.get(locale);

  if (!code) {
    code = matchLocale([locale], DOTLOG_LOCALES) ?? FALLBACK;
    resolved.set(locale, code);
  }

  return code;
};

const lookup = (messages: Messages, key: string): string | undefined => {
  let node: unknown = messages;

  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object' || !Object.hasOwn(node, part)) return undefined;

    node = (node as Record<string, unknown>)[part];
  }

  return typeof node === 'string' ? node : undefined;
};

export function translate(locale: string | null | undefined, key: DotlogTextKey, params?: MessageParams): string {
  const messages = CATALOG[catalogLocale(locale || FALLBACK)] ?? en;
  const template = lookup(messages, key) ?? lookup(en, key) ?? key;

  return formatMessage(template, params);
}
