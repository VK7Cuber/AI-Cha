import { create } from 'zustand';
import { Product } from '../types/product';

type CartItem = { product: Product; quantity: number };

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const calcTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0);
  return { totalItems, totalAmount };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalAmount: 0,
  totalItems: 0,
  addItem: (product, qty = 1) => {
    const current = get().items;
    const existing = current.find((i) => i.product.id === product.id);
    let next: CartItem[];
    if (existing) {
      next = current.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      next = [...current, { product, quantity: qty }];
    }
    const totals = calcTotals(next);
    set({ items: next, ...totals });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      return get().removeItem(productId);
    }
    const next = get().items.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
    const totals = calcTotals(next);
    set({ items: next, ...totals });
  },
  removeItem: (productId) => {
    const next = get().items.filter((i) => i.product.id !== productId);
    const totals = calcTotals(next);
    set({ items: next, ...totals });
  },
  clearCart: () => set({ items: [], totalAmount: 0, totalItems: 0 })
}));

