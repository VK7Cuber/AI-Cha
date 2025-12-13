import { Product } from './product';

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  product_name_ru: string;
  product_name_zh: string;
}

export interface Order {
  id: string;
  order_number: number;
  terminal_id?: string;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  payment_method?: 'card' | 'aicha_card' | 'sbp';
  payment_status: 'pending' | 'success' | 'failed';
  rating?: number;
  session_id?: string;
  paid_at?: string;
  completed_at?: string;
  created_at?: string;
  items?: OrderItem[];
}

export type CartItem = { product: Product; quantity: number };

