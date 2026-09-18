import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product, CutOption, ComboSnapshot } from '../types';
import { getEffectivePrice } from '../lib/utils';
import { combosApi, parseComboError } from '../api/combos';
import type { ComboSelectionPayload } from '../types';
import { comboCartKey } from '../lib/combo';
import { supabase } from '../utils/supabase';

const STORAGE_KEY = 'elsupremo_cart';

// Migra carritos guardados antes de los combos (items sin "kind").
function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as any[];
      return parsed.map((item) =>
        item.kind === 'combo' ? item : { kind: 'product', ...item },
      );
    }
  } catch {}
  return [];
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_PRODUCT'; payload: { product: Product; cutOption: CutOption | null; quantity: number; notes: string; supremoListo?: boolean } }
  | { type: 'REMOVE_PRODUCT'; payload: { productId: number; cutOptionId: number | null } }
  | { type: 'UPDATE_PRODUCT_QTY'; payload: { productId: number; cutOptionId: number | null; quantity: number } }
  | { type: 'ADD_COMBO'; payload: { key: string; comboId: number; slug: string; snapshot: ComboSnapshot; options: ComboSelectionPayload; quantity: number } }
  | { type: 'REMOVE_COMBO'; payload: { key: string } }
  | { type: 'UPDATE_COMBO_QTY'; payload: { key: string; quantity: number } }
  | { type: 'REPLACE_COMBO'; payload: { key: string; comboId: number; slug: string; snapshot: ComboSnapshot; options: ComboSelectionPayload; quantity: number } }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const { product, cutOption, quantity, notes, supremoListo } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) =>
          item.kind === 'product' &&
          item.product.id === product.id &&
          item.cutOption?.id === cutOption?.id
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        const prev = newItems[existingIndex] as Extract<CartItem, { kind: 'product' }>;
        newItems[existingIndex] = {
          ...prev,
          quantity: prev.quantity + quantity,
          notes: notes || prev.notes,
          supremoListo: supremoListo ?? prev.supremoListo,
        };
        return { items: newItems };
      }

      return {
        items: [...state.items, { kind: 'product', product, cutOption, quantity, notes, supremoListo }],
      };
    }
    case 'REMOVE_PRODUCT':
      return {
        items: state.items.filter(
          (item) =>
            !(item.kind === 'product' &&
              item.product.id === action.payload.productId &&
              item.cutOption?.id === action.payload.cutOptionId)
        ),
      };
    case 'UPDATE_PRODUCT_QTY':
      return {
        items: state.items.map((item) =>
          item.kind === 'product' &&
          item.product.id === action.payload.productId &&
          item.cutOption?.id === action.payload.cutOptionId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'ADD_COMBO': {
      const existingIndex = state.items.findIndex(
        (item) => item.kind === 'combo' && item.key === action.payload.key
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        const prev = newItems[existingIndex] as Extract<CartItem, { kind: 'combo' }>;
        newItems[existingIndex] = {
          ...prev,
          snapshot: action.payload.snapshot,
          quantity: prev.quantity + action.payload.quantity,
        };
        return { items: newItems };
      }
      return {
        items: [
          ...state.items,
          {
            kind: 'combo',
            key: action.payload.key,
            comboId: action.payload.comboId,
            slug: action.payload.slug,
            snapshot: action.payload.snapshot,
            options: action.payload.options,
            quantity: action.payload.quantity,
          },
        ],
      };
    }
    case 'REMOVE_COMBO':
      return {
        items: state.items.filter((item) => !(item.kind === 'combo' && item.key === action.payload.key)),
      };
    case 'UPDATE_COMBO_QTY':
      return {
        items: state.items.map((item) =>
          item.kind === 'combo' && item.key === action.payload.key
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case 'REPLACE_COMBO':
      return {
        items: state.items.map((item) =>
          item.kind === 'combo' && item.key === action.payload.key
            ? {
                kind: 'combo',
                key: action.payload.key,
                comboId: action.payload.comboId,
                slug: action.payload.slug,
                snapshot: action.payload.snapshot,
                options: action.payload.options,
                quantity: action.payload.quantity,
              }
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
  addCombo: (comboId: number, slug: string, options: ComboSelectionPayload, quantity: number) => Promise<void>;
  updateComboQuantity: (key: string, quantity: number) => void;
  removeCombo: (key: string) => void;
  updateCombo: (key: string, comboId: number, slug: string, options: ComboSelectionPayload, quantity: number) => Promise<void>;
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

    const productItems = state.items.filter((item): item is Extract<CartItem, { kind: 'product' }> => item.kind === 'product');
    if (productItems.length === 0) return;

    const productIds = [...new Set(productItems.map((item) => item.product.id))];
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
        for (const item of productItems) {
          if (unavailableIds.has(item.product.id)) {
            dispatch({
              type: 'REMOVE_PRODUCT',
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
    dispatch({ type: 'ADD_PRODUCT', payload: { product, cutOption, quantity, notes, supremoListo } });
  };

  const removeItem = (productId: number, cutOptionId: number | null) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: { productId, cutOptionId } });
  };

  const updateQuantity = (productId: number, cutOptionId: number | null, quantity: number) => {
    dispatch({ type: 'UPDATE_PRODUCT_QTY', payload: { productId, cutOptionId, quantity } });
  };

  // Valida en el servidor (precio real + disponibilidad) y concreta la línea.
  const addCombo = async (comboId: number, slug: string, options: ComboSelectionPayload, quantity: number) => {
    try {
      const snapshot = await combosApi.resolve(comboId, options);
      dispatch({
        type: 'ADD_COMBO',
        payload: {
          key: comboCartKey(comboId, options),
          comboId,
          slug,
          snapshot,
          options,
          quantity,
        },
      });
    } catch (err) {
      const { message } = parseComboError(err);
      throw new Error(message);
    }
  };

  const updateComboQuantity = (key: string, quantity: number) => {
    dispatch({ type: 'UPDATE_COMBO_QTY', payload: { key, quantity } });
  };

  const removeCombo = (key: string) => {
    dispatch({ type: 'REMOVE_COMBO', payload: { key } });
  };

  // Reemplaza las selecciones de una línea sin duplicarla (edición desde el carrito).
  const updateCombo = async (key: string, comboId: number, slug: string, options: ComboSelectionPayload, quantity: number) => {
    try {
      const snapshot = await combosApi.resolve(comboId, options);
      dispatch({
        type: 'REPLACE_COMBO',
        payload: { key, comboId, slug, snapshot, options, quantity: Math.max(1, quantity) },
      });
    } catch (err) {
      const { message } = parseComboError(err);
      throw new Error(message);
    }
  };

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const clearRemovedNotice = () => setRemovedCount(0);

  const totalItems = state.items.length;

  const subtotal = state.items.reduce((sum, item) => {
    if (item.kind === 'combo') return sum + Number(item.snapshot.price) * item.quantity;
    return sum + getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        addCombo,
        updateComboQuantity,
        removeCombo,
        updateCombo,
        clearCart,
        totalItems,
        subtotal,
        removedCount,
        clearRemovedNotice,
      }}
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