import type { StatusDefinition } from '../components/DlStatusChip.vue';

/**
 * Aparência dos métodos HTTP como pastilha, para toda tela que lista rota.
 *
 * O tom segue o efeito do método, não a ordem alfabética: ler é informativo,
 * criar é positivo, alterar pede atenção e apagar é destrutivo. É a mesma
 * leitura que a pessoa faria de um log, e ela sobrevive entre aplicações.
 *
 * `UPDATE` existe porque o enum `Method` do catálogo do SSO o declara.
 */
export const httpMethodStatus: Record<string, StatusDefinition> = {
  GET: { label: 'GET', tone: 'info' },
  POST: { label: 'POST', tone: 'success' },
  PUT: { label: 'PUT', tone: 'warning' },
  PATCH: { label: 'PATCH', tone: 'warning' },
  UPDATE: { label: 'UPDATE', tone: 'warning' },
  DELETE: { label: 'DELETE', tone: 'error' },
};
