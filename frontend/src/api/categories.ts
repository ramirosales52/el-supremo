import { apiFetch } from './client';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: () => apiFetch<Category[]>('/categories'),
  getById: (id: number) => apiFetch<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) =>
    apiFetch<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Category>) =>
    apiFetch<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/categories/${id}`, { method: 'DELETE' }),
};
