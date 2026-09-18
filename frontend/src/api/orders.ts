import { supabase } from '../utils/supabase';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus, DeliveryTimeSlot, OrderItem, Product, CutOption, ComboSnapshot, ComboSelectionPayload } from '../types';
import { mapSnapshot } from './combos';

export interface ComboOrderInput {
  comboId: number;
  quantity: number;
  options: ComboSelectionPayload;
}

export interface CreateCombosOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  idempotencyKey?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: DeliveryTimeSlot;
  products: {
    productId: number;
    quantity: number;
    cutOptionId?: number;
    notes?: string;
  }[];
  combos: ComboOrderInput[];
}

function mapOrderItem(raw: any): OrderItem {
  const isCombo = raw.itemType === 'combo';
  const snapshot: ComboSnapshot | null = raw.comboSnapshot ? mapSnapshot(raw.comboSnapshot) : null;
  return {
    id: raw.id,
    itemType: isCombo ? 'combo' : 'product',
    productId: raw.productId ?? null,
    product: isCombo ? null : (raw.product as Product) ?? null,
    cutOptionId: raw.cutOptionId ?? null,
    cutOption: isCombo ? null : (raw.cutOption as CutOption | null),
    quantity: raw.quantity,
    unit: raw.unit,
    unitPrice: raw.unitPrice,
    notes: raw.notes,
    comboId: raw.comboId ?? null,
    comboName: raw.comboName ?? snapshot?.comboName ?? null,
    comboSnapshot: snapshot,
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
    deliveryDate: raw.deliveryDate || undefined,
    deliveryTimeSlot: raw.deliveryTimeSlot || undefined,
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

  createWithCombos: async (input: CreateCombosOrderPayload) => {
    const { data, error } = await supabase.rpc('create_order_with_combos', {
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_customer_address: input.customerAddress ?? null,
      p_payment_method: input.paymentMethod,
      p_notes: input.notes ?? null,
      p_idempotency_key: input.idempotencyKey ?? null,
      p_delivery_date: input.deliveryDate ?? null,
      p_delivery_time_slot: input.deliveryTimeSlot ?? null,
      p_items: input.products,
      p_combos: input.combos,
    });
    if (error) throw error;
    const orderId: number = typeof data === 'object' && data && 'id' in data ? Number((data as any).id) : Number(data);
    return ordersApi.getById(orderId);
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
