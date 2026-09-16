import type { Column } from '../components/DlDataTable.vue';
import { translate } from '../i18n/catalog';

/**
 * Descobre as colunas a partir da própria resposta.
 *
 * O objetivo é não existir uma tabela por projeto. O front consome
 * `GET /api/accessory`, recebe uma lista de objetos, e daqui saem o título e o
 * formato de cada coluna. Uma aplicação nova não escreve tabela nenhuma.
 *
 * ## O que é inferido
 *
 * | Sinal na amostra | Vira |
 * |---|---|
 * | só números | alinhado à direita, monoespaçado |
 * | `true`/`false` | Sim / Não, na língua de `locale` |
 * | data ISO | data formatada |
 * | UUID, ou hex de 32+ | monoespaçado e **secundário** |
 * | objeto ou lista | ignorado, ver abaixo |
 * | resto | texto |
 *
 * A amostra tem várias linhas, não uma. Inferir pela primeira faz um `null` no
 * primeiro registro apagar a coluna inteira, ou um inteiro numa coluna de
 * decimal decidir o formato errado.
 *
 * ## ⚠️ O que isto custa, e o controle que sobra
 *
 * A tela passa a mudar quando a API muda. Acrescentar um campo ao serializador
 * faz nascer uma coluna sem ninguém pedir, e um campo interno que vaze para a
 * resposta aparece na tela. Por isso existem `omit`, `only` e `max`: o padrão é
 * mostrar tudo, e quem precisa de controle tem onde pôr.
 *
 * ## Sobreposição pontual, não declaração inteira
 *
 * `overrides` ajusta uma coluna sem declarar as outras. É onde se conserta um
 * rótulo que a humanização erra, como `p_diary` virando "P diary". Corrigir uma
 * chave continua sendo muito menos que manter a lista toda.
 */

export interface InferOptions {
  /** Chaves a esconder. Útil para campo interno que vazou na resposta. */
  omit?: string[];
  /** Se presente, só estas chaves, nesta ordem. */
  only?: string[];
  /** Teto de colunas. Acima disso a tabela vira ilegível de qualquer jeito. */
  max?: number;
  /** Ajuste por chave, sem declarar o resto. */
  overrides?: Record<string, Partial<Column<Record<string, unknown>>>>;
  /** Quantas linhas olhar para decidir o tipo. */
  sample?: number;
  /**
   * Língua de data, número e sim/não. Passe a corrente da aplicação, senão a
   * coluna fica em inglês numa tela traduzida.
   */
  locale?: string;
}

/** Siglas que a humanização não deve capitalizar como palavra comum. */
const ACRONYMS = new Set([
  'id', 'url', 'uri', 'api', 'cpf', 'cnpj', 'cep', 'uf', 'sku', 'pdf', 'csv', 'ip',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONG_HEX = /^[0-9a-f]{16,}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}|$)/;

/**
 * `dailyRate` e `daily_rate` viram "Daily rate"; `clientId` vira "Client ID".
 *
 * Uma frase só em maiúscula na primeira letra, não Título Em Cada Palavra:
 * cabeçalho de tabela lê melhor assim, e a sigla continua gritando quando é
 * sigla de verdade.
 */
export const humanize = (key: string): string => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return key;

  return words
    .map((word, index) => {
      if (ACRONYMS.has(word)) return word.toUpperCase();
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);

      return word;
    })
    .join(' ');
};

type Kind = 'number' | 'boolean' | 'date' | 'identifier' | 'text' | 'skip';

const kindOf = (values: unknown[]): Kind => {
  const present = values.filter((v) => v !== null && v !== undefined && v !== '');

  // Coluna inteira vazia na amostra: mantém como texto, para não sumir com um
  // campo que só está sem valor nestas linhas.
  if (present.length === 0) return 'text';

  // Objeto e lista não cabem numa célula. Quem precisa disso passa um
  // `overrides` com `format`, ou usa o slot `col-<key>`.
  if (present.some((v) => typeof v === 'object')) return 'skip';

  if (present.every((v) => typeof v === 'boolean')) return 'boolean';
  if (present.every((v) => typeof v === 'number')) return 'number';

  if (present.every((v) => typeof v === 'string' && (UUID.test(v) || LONG_HEX.test(v)))) {
    return 'identifier';
  }

  if (present.every((v) => typeof v === 'string' && ISO_DATE.test(v))) return 'date';

  return 'text';
};

const formatterFor = (
  kind: Kind,
  key: string,
  locale: string,
): ((row: Record<string, unknown>) => string) | undefined => {
  if (kind === 'boolean') {
    return (row) => translate(locale, row[key] ? 'data.yes' : 'data.no');
  }

  if (kind === 'date') {
    return (row) => {
      const raw = row[key];

      if (typeof raw !== 'string') return '—';

      const parsed = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);

      return Number.isNaN(parsed.getTime())
        ? String(raw)
        : parsed.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
    };
  }

  if (kind === 'number') {
    return (row) => {
      const raw = row[key];

      return typeof raw === 'number' ? raw.toLocaleString(locale) : '—';
    };
  }

  return undefined;
};

/**
 * Colunas a partir das linhas. Lista vazia devolve lista vazia: sem dado não há
 * o que inferir, e a tabela já sabe mostrar o estado vazio.
 */
export function inferColumns<Row extends Record<string, unknown>>(
  rows: Row[],
  options: InferOptions = {},
): Column<Row>[] {
  if (rows.length === 0) return [];

  const {
    omit = [],
    only,
    max = 12,
    overrides = {},
    sample = 20,
    locale = 'en-US',
  } = options;

  const sampled = rows.slice(0, sample);

  // A ordem das chaves é a ordem do serializador do backend, que costuma ser a
  // ordem em que alguém pensou os campos. É um palpite melhor que alfabético.
  const keys: string[] = [];

  for (const row of sampled) {
    for (const key of Object.keys(row)) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  const chosen = (only ?? keys).filter((key) => !omit.includes(key));

  const columns: Column<Row>[] = [];

  for (const key of chosen) {
    const kind = kindOf(sampled.map((row) => row[key]));

    if (kind === 'skip') continue;

    const base: Column<Row> = {
      key,
      label: humanize(key),
      mono: kind === 'number' || kind === 'identifier',
      align: kind === 'number' ? 'end' : 'start',
      // Identificador é dado de apoio: some primeiro quando falta largura.
      secondary: kind === 'identifier',
      format: formatterFor(kind, key, locale) as Column<Row>['format'],
    };

    columns.push({ ...base, ...(overrides[key] as Partial<Column<Row>>) });

    if (columns.length >= max) break;
  }

  return columns;
}
