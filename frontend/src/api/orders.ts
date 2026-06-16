import { apiFetch } from './client';
import type { Order, OrderStatus } from '../types';

interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    unit?: string;
    cutOptionId?: number;
    notes?: string;
  }[];
}

export const ordersApi = {
  getAll: (status?: OrderStatus) => {
    const params = status ? `?status=${status}` : '';
    return apiFetch<Order[]>(`/orders${params}`);
  },
  getById: (id: number) => apiFetch<Order>(`/orders/${id}`),
  create: (data: CreateOrderPayload) =>
    apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: OrderStatus) =>
    apiFetch<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/orders/${id}`, { method: 'DELETE' }),
};
