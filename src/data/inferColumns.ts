import type { Column } from '../components/DlDataTable.vue';
import { translate } from '../i18n/catalog';

export interface InferOptions {
  omit?: string[];
  only?: string[];
  max?: number;
  overrides?: Record<string, Partial<Column<Record<string, unknown>>>>;
  sample?: number;
  locale?: string;
}

const ACRONYMS = new Set([
  'id', 'url', 'uri', 'api', 'cpf', 'cnpj', 'cep', 'uf', 'sku', 'pdf', 'csv', 'ip',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONG_HEX = /^[0-9a-f]{16,}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}|$)/;

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

  if (present.length === 0) return 'text';

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
      secondary: kind === 'identifier',
      format: formatterFor(kind, key, locale) as Column<Row>['format'],
    };

    columns.push({ ...base, ...(overrides[key] as Partial<Column<Row>>) });

    if (columns.length >= max) break;
  }

  return columns;
}
