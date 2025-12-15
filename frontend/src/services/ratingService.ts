import api from './api';

export async function submitRating(payload: { orderId: string; rating: number; terminalId?: string }) {
  const res = await api.post('/ratings', {
    order_id: payload.orderId,
    rating: payload.rating,
    terminal_id: payload.terminalId || 'terminal-1'
  });
  return res.data;
}
