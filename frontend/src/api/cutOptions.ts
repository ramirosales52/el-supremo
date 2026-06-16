import { apiFetch } from './client';
import type { CutOption } from '../types';

export const cutOptionsApi = {
  getAll: () => apiFetch<CutOption[]>('/cut-options'),
  getById: (id: number) => apiFetch<CutOption>(`/cut-options/${id}`),
  create: (data: Partial<CutOption>) =>
    apiFetch<CutOption>('/cut-options', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CutOption>) =>
    apiFetch<CutOption>(`/cut-options/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/cut-options/${id}`, { method: 'DELETE' }),
};
