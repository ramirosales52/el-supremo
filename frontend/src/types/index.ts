export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CutOption {
  id: number;
  name: string;
  description?: string;
  priceModifier: number | null;
  requiresNotes: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  unit: string;
  images?: string[];
  isAvailable: boolean;
  isOnSale: boolean;
  discountPercentage: number | null;
  category: Category;
  categoryId: number;
  cutOptions: CutOption[];
}

export interface CartItem {
  product: Product;
  cutOption: CutOption | null;
  quantity: number;
  notes: string;
  supremoListo?: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  cutOptionId: number | null;
  cutOption: CutOption | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes: string | null;
}

export type OrderStatus = 'pending' | 'delivered';
export type PaymentMethod = 'cash' | 'transfer' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type DeliveryTimeSlot = 'morning' | 'afternoon';

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  notes?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: DeliveryTimeSlot;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
