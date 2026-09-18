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

export type ComboSelectionKind = 'choice' | 'preparation';

export interface ComboOption {
  id: number;
  name: string;
  productId: number | null;
  productName?: string | null;
  productAvailable?: boolean | null;
  cutOptionId: number | null;
  cutOptionName?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ComboSelectionGroup {
  id: number;
  name: string;
  kind: ComboSelectionKind;
  sortOrder: number;
  parentOptionId: number | null;
  options: ComboOption[];
}

export interface ComboComponent {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  sortOrder: number;
  fixedProductId: number | null;
  fixedProductName?: string | null;
  dayLabel?: string | null;
  groups: ComboSelectionGroup[];
}

export interface Combo {
  id: number;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  price: number;
  totalKg: number;
  image?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  freeShipping: boolean;
  variantGroup?: string | null;
  variantLabel?: string | null;
  components: ComboComponent[];
}

// --- snapshot devuelto por resolve_combo (server-side) ---
export interface ComboSelection {
  groupId: number;
  groupName: string;
  optionId: number;
  optionName: string;
  productId: number | null;
  productName: string | null;
  cutOptionId: number | null;
  cutOptionName: string | null;
}

export interface ComboSnapshotComponent {
  componentId: number;
  name: string;
  quantity: number;
  unit: string;
  dayLabel: string | null;
  productId: number | null;
  productName: string | null;
  selections: ComboSelection[];
}

export interface ComboSnapshot {
  comboId: number;
  comboName: string;
  slug: string;
  description: string;
  price: number;
  totalKg: number;
  freeShipping: boolean;
  image: string | null;
  components: ComboSnapshotComponent[];
}

// --- payload de selección enviado a resolve_combo / create_order_with_combos ---
export interface ComboSelectionEntry {
  groupId: number;
  optionId: number;
}

export interface ComboComponentPick {
  componentId: number;
  selections: ComboSelectionEntry[];
}

export type ComboSelectionPayload = ComboComponentPick[];

// --- carrito: producto común o combo como una sola línea ---
export interface ProductCartItem {
  kind: 'product';
  product: Product;
  cutOption: CutOption | null;
  quantity: number;
  notes: string;
  supremoListo?: boolean;
}

export interface ComboCartItem {
  kind: 'combo';
  key: string;
  comboId: number;
  slug: string;
  snapshot: ComboSnapshot;
  options: ComboSelectionPayload;
  quantity: number;
}

export type CartItem = ProductCartItem | ComboCartItem;

export interface OrderItem {
  id: number;
  itemType: 'product' | 'combo';
  productId: number | null;
  product: Product | null;
  cutOptionId: number | null;
  cutOption: CutOption | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes: string | null;
  comboId: number | null;
  comboName: string | null;
  comboSnapshot: ComboSnapshot | null;
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
