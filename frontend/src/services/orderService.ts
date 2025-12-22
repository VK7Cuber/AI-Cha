import api from './api';
import { Order, OrderStatus } from '../types/order';

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

export async function fetchOrders(filter?: { status?: 'active' | OrderStatus }): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.set('status', filter.status);
  const res = await api.get<Order[]>(`/orders${params.toString() ? `?${params.toString()}` : ''}`);
  return res.data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const res = await api.patch<Order>(`/orders/${orderId}/status`, { status });
  return res.data;
}

