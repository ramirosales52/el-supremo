import { apiFetch } from './client';
import type { Product } from '../types';

export const productsApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return apiFetch<Product[]>(`/products${params}`);
  },
  getAllAdmin: () => apiFetch<Product[]>('/products/admin'),
  getById: (id: number) => apiFetch<Product>(`/products/${id}`),
  create: (data: Partial<Product>) =>
    apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/products/${id}`, { method: 'DELETE' }),
};
