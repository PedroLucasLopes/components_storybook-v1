import type { StatusDefinition } from '../components/DlStatusChip.vue';

export const httpMethodStatus: Record<string, StatusDefinition> = {
  GET: { label: 'GET', tone: 'info' },
  POST: { label: 'POST', tone: 'success' },
  PUT: { label: 'PUT', tone: 'warning' },
  PATCH: { label: 'PATCH', tone: 'warning' },
  UPDATE: { label: 'UPDATE', tone: 'warning' },
  DELETE: { label: 'DELETE', tone: 'error' },
};
