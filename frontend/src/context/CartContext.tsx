import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product, CutOption } from '../types';
import { getEffectivePrice } from '../lib/utils';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'elsupremo_cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; cutOption: CutOption | null; quantity: number; notes: string; supremoListo?: boolean } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number; cutOptionId: number | null } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; cutOptionId: number | null; quantity: number } }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, cutOption, quantity, notes, supremoListo } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.cutOption?.id === cutOption?.id
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          notes: notes || newItems[existingIndex].notes,
          supremoListo: supremoListo ?? newItems[existingIndex].supremoListo,
        };
        return { items: newItems };
      }

      return {
        items: [...state.items, { product, cutOption, quantity, notes, supremoListo }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) =>
            !(item.product.id === action.payload.productId &&
              item.cutOption?.id === action.payload.cutOptionId)
        ),
      };
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map((item) =>
          item.product.id === action.payload.productId &&
          item.cutOption?.id === action.payload.cutOptionId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, cutOption: CutOption | null, quantity: number, notes: string, supremoListo?: boolean) => void;
  removeItem: (productId: number, cutOptionId: number | null) => void;
  updateQuantity: (productId: number, cutOptionId: number | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  removedCount: number;
  clearRemovedNotice: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: loadCart() });
  const [removedCount, setRemovedCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    if (state.items.length === 0) return;

    const productIds = [...new Set(state.items.map((item) => item.product.id))];
    supabase
      .from('products')
      .select('id, isAvailable')
      .in('id', productIds)
      .then(({ data }) => {
        if (!data) return;
        const unavailableIds = new Set(
          data.filter((p) => !p.isAvailable).map((p) => p.id)
        );
        if (unavailableIds.size === 0) return;

        let count = 0;
        for (const item of state.items) {
          if (unavailableIds.has(item.product.id)) {
            dispatch({
              type: 'REMOVE_ITEM',
              payload: { productId: item.product.id, cutOptionId: item.cutOption?.id ?? null },
            });
            count++;
          }
        }
        setRemovedCount(count);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = (product: Product, cutOption: CutOption | null, quantity: number, notes: string, supremoListo?: boolean) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, cutOption, quantity, notes, supremoListo } });
  };

  const removeItem = (productId: number, cutOptionId: number | null) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, cutOptionId } });
  };

  const updateQuantity = (productId: number, cutOptionId: number | null, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, cutOptionId, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const clearRemovedNotice = () => setRemovedCount(0);

  const totalItems = state.items.length;

  const subtotal = state.items.reduce((sum, item) => {
    return sum + getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, removedCount, clearRemovedNotice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
