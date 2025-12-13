export interface Category {
  id: string;
  name_ru: string;
  name_zh: string;
  slug: string;
  icon_url?: string;
  display_order?: number;
}

export interface Product {
  id: string;
  category_id: string;
  name_ru: string;
  name_zh: string;
  description_ru?: string;
  description_zh?: string;
  price: number;
  image_url?: string;
  ingredients_ru?: string | null;
  ingredients_zh?: string | null;
  temperature: 'hot' | 'cold' | 'both';
  is_available: boolean;
  is_recommended?: boolean;
  tags?: string[];
  display_order?: number;
}

