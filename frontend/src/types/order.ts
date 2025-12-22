import { Product } from './product';

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'card' | 'aicha_card' | 'sbp';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

export interface GeneratedRecipe {
  id: string;
  name_ru: string;
  name_zh: string;
  total_price?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type?: 'product' | 'generated_recipe';
  product_id?: string | null;
  generated_recipe_id?: string | null;
  quantity: number;
  price_at_order: number;
  product_name_ru: string;
  product_name_zh: string;
  product?: Product;
  generatedRecipe?: GeneratedRecipe;
}

export interface Order {
  id: string;
  order_number: number;
  terminal_id?: string;
  status: OrderStatus;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  rating?: number;
  session_id?: string;
  paid_at?: string;
  completed_at?: string;
  created_at?: string;
  items?: OrderItem[];
}

export type CartItem = { product: Product; quantity: number };

