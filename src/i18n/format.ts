/**
 * Formato das mensagens: o mesmo subconjunto do vue-i18n.
 *
 * Quem traduz a biblioteca e quem traduz a aplicação escrevem do mesmo jeito,
 * e uma frase pode mudar de arquivo sem ser reescrita.
 *
 * - `{name}` troca pelo parâmetro de mesmo nome. Parâmetro ausente fica como
 *   está, para o erro aparecer na tela em vez de sumir.
 * - `a | b` é plural, escolhido por `count` com a regra padrão do vue-i18n:
 *   com duas formas, a primeira só para 1; com três, zero, um e o resto.
 */

export type MessageParams = Readonly<Record<string, string | number>>;

const pluralIndex = (count: number, forms: number): number => {
  const choice = Math.abs(count);

  if (forms === 2) return choice ? (choice > 1 ? 1 : 0) : 1;

  return choice ? Math.min(choice, 2) : 0;
};

export function formatMessage(template: string, params: MessageParams = {}): string {
  const forms = template.split('|').map((form) => form.trim());
  const count = params.count;

  const chosen =
    forms.length > 1
      ? (forms[typeof count === 'number' ? Math.min(pluralIndex(count, forms.length), forms.length - 1) : 0] ?? '')
      : template;

  return chosen.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}
