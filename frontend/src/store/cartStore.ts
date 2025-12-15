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
  getItemCount: () => number;
}

const calcTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0);
  return { totalItems, totalAmount };
};

const STORAGE_KEY = 'ai-cha-cart';

const loadStored = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i?.product?.id && typeof i?.quantity === 'number');
  } catch {
    return [];
  }
};

const persist = (items: CartItem[], totals: { totalItems: number; totalAmount: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(`${STORAGE_KEY}-totals`, JSON.stringify(totals));
  } catch {
    // ignore storage errors (e.g., quota)
  }
};

export const useCartStore = create<CartState>((set, get) => {
  const initialItems = loadStored();
  const initialTotals = calcTotals(initialItems);

  const setAndPersist = (nextItems: CartItem[]) => {
    const totals = calcTotals(nextItems);
    persist(nextItems, totals);
    set({ items: nextItems, ...totals });
  };

  return {
    items: initialItems,
    ...initialTotals,
    addItem: (product, qty = 1) => {
      if (product.is_available === false) return;
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
      setAndPersist(next);
    },
    updateQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        return get().removeItem(productId);
      }
      const next = get().items.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
      setAndPersist(next);
    },
    removeItem: (productId) => {
      const next = get().items.filter((i) => i.product.id !== productId);
      setAndPersist(next);
    },
    clearCart: () => setAndPersist([]),
    getItemCount: () => get().totalItems
  };
});

