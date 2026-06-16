import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartItem, Product, CutOption } from '../types';
import { SUPREMO_LISTO_PRICE } from '../lib/utils';

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
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

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

  const totalItems = state.items.length;

  const totalPrice = state.items.reduce((sum, item) => {
    const modifier = item.cutOption?.priceModifier ?? 0;
    return sum + (Number(item.product.basePrice) + Number(modifier)) * item.quantity + (item.supremoListo ? SUPREMO_LISTO_PRICE : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
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
