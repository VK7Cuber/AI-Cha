import { create } from 'zustand';
import { fetchCategories, fetchProducts } from '../services/productService';
import { Category, Product } from '../types/product';

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error?: string;
  loadAll: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: undefined,
  loadAll: async () => {
    set({ loading: true, error: undefined });
    try {
      const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
      set({
        categories: Array.isArray(categories) ? categories : [],
        products: Array.isArray(products) ? products : [],
        loading: false
      });
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
      set({ error: err?.message || 'Не удалось загрузить каталог', loading: false, products: [], categories: [] });
    }
  }
}));

