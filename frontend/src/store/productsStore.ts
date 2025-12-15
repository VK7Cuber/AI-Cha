import { create } from 'zustand';
import { fetchCategories, fetchProducts } from '../services/productService';
import { Category, Product } from '../types/product';

type Filters = {
  category?: string | null;
  temperature?: string | null;
  tags?: string[];
};

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error?: string;
  filters: Filters;
  searchQuery: string;
  hasLoaded: boolean;
  loadAll: (force?: boolean) => Promise<void>;
  setFilter: (filter: keyof Filters, value: string | string[] | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: undefined,
  filters: { category: null, temperature: null, tags: [] },
  searchQuery: '',
  hasLoaded: false,

  loadAll: async (force = false) => {
    if (get().hasLoaded && !force) return;
    set({ loading: true, error: undefined });
    try {
      const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
      set({
        categories: Array.isArray(categories) ? categories : [],
        products: Array.isArray(products) ? products : [],
        loading: false,
        hasLoaded: true
      });
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
      set({
        error: err?.message || 'Не удалось загрузить каталог',
        loading: false,
        products: [],
        categories: [],
        hasLoaded: false
      });
    }
  },

  setFilter: (filter, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filter]: Array.isArray(value)
          ? value
          : value === undefined
          ? state.filters[filter]
          : value
      }
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredProducts: () => {
    const { products, filters, searchQuery } = get();
    const list = Array.isArray(products) ? products : [];
    const byCategory = filters.category ? list.filter((p) => p.category_id === filters.category) : list;
    const byTemperature = filters.temperature
      ? byCategory.filter((p) => p.temperature === filters.temperature)
      : byCategory;
    const byTags =
      filters.tags && filters.tags.length
        ? byTemperature.filter((p) => {
            const tags = p.tags || [];
            return filters.tags!.every((t) => tags.includes(t));
          })
        : byTemperature;
    if (!searchQuery.trim()) return byTags;
    const q = searchQuery.toLowerCase();
    return byTags.filter(
      (p) =>
        p.name_ru.toLowerCase().includes(q) ||
        (p.name_zh && p.name_zh.toLowerCase().includes(q)) ||
        (p.description_ru && p.description_ru.toLowerCase().includes(q))
    );
  }
}));

