import api from './api';
import { Order } from '../types/order';

export async function createOrder(payload: {
  terminal_id?: string;
  items: { product_id: string; quantity: number }[];
}): Promise<Order> {
  const res = await api.post<Order>('/orders', payload);
  return res.data;
}

export async function processPayment(orderId: string, payment_method: 'card' | 'aicha_card' | 'sbp'): Promise<Order> {
  const res = await api.post<Order>(`/orders/${orderId}/payment`, { payment_method });
  return res.data;
}

