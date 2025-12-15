import api from './api';
import { Category, Product } from '../types/product';

export async function fetchProducts(params?: {
  category?: string;
  temperature?: string;
  search?: string;
  tags?: string[];
}): Promise<Product[]> {
  const query: Record<string, string | undefined> = {};
  if (params?.category) query.category = params.category;
  if (params?.temperature) query.temperature = params.temperature;
  if (params?.search) query.search = params.search;
  if (params?.tags?.length) query.tags = params.tags.join(',');

  const res = await api.get<Product[]>('/products', {
    params: query
  });
  return res.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories');
  return res.data;
}

export async function fetchRecommended(limit = 6): Promise<Product[]> {
  const res = await api.get<Product[]>('/products/recommended', { params: { limit } });
  return res.data;
}

