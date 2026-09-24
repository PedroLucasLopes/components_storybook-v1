import { formatMessage, type MessageParams } from './format';
import { matchLocale } from './languages';
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

type Messages = typeof en;

type Leaves<Tree, Prefix extends string = ''> = {
  [Key in keyof Tree & string]: Tree[Key] extends string ? `${Prefix}${Key}` : Leaves<Tree[Key], `${Prefix}${Key}.`>;
}[keyof Tree & string];

export type DotlogTextKey = Leaves<Messages>;

const CATALOG: Readonly<Record<string, Messages>> = { en, es, 'pt-BR': ptBR };

const DOTLOG_LOCALES: readonly string[] = Object.freeze(Object.keys(CATALOG));

const FALLBACK = 'en';

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
