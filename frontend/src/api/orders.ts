import { supabase } from '../utils/supabase';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem, Product, CutOption } from '../types';

interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    unit?: string;
    unitPrice: number;
    cutOptionId?: number;
    notes?: string;
  }[];
}

function mapOrderItem(raw: any): OrderItem {
  return {
    id: raw.id,
    productId: raw.productId,
    product: raw.product as Product,
    cutOptionId: raw.cutOptionId,
    cutOption: raw.cutOption as CutOption | null,
    quantity: raw.quantity,
    unit: raw.unit,
    unitPrice: raw.unitPrice,
    notes: raw.notes,
  };
}

function mapOrder(raw: any): Order {
  return {
    id: raw.id,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    customerAddress: raw.customerAddress || undefined,
    status: raw.status as OrderStatus,
    paymentMethod: raw.paymentMethod as PaymentMethod,
    paymentStatus: raw.paymentStatus as PaymentStatus ?? 'pending',
    subtotal: Number(raw.subtotal),
    discount: Number(raw.discount),
    shippingCost: Number(raw.shippingCost),
    total: Number(raw.total),
    notes: raw.notes || undefined,
    items: (raw.items ?? []).map(mapOrderItem),
    createdAt: raw.createdat,
    updatedAt: raw.updatedat,
  };
}

export const ordersApi = {
  getAll: async (status?: OrderStatus) => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:productId(*),
          cutOption:cutOptionId(*)
        )
      `)
      .order('id', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapOrder);
  },

  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:productId(*),
          cutOption:cutOptionId(*)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapOrder(data);
  },

  create: async (input: CreateOrderPayload) => {
    const { items, ...orderFields } = input;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderFields)
      .select()
      .single();
    if (orderError) throw orderError;

    if (items.length) {
      const orderItems = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        cutOptionId: item.cutOptionId ?? null,
        quantity: item.quantity,
        unit: item.unit ?? 'kg',
        unitPrice: item.unitPrice,
        notes: item.notes ?? null,
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    return ordersApi.getById(order.id);
  },

  updateStatus: async (id: number, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return ordersApi.getById(id);
  },

  delete: async (id: number) => {
    await supabase.from('order_items').delete().eq('orderId', id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },
};
