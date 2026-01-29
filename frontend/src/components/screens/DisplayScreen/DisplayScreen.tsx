import { useEffect, useRef, useState } from 'react';
import { fetchOrders } from '../../../services/orderService';
import { Order, OrderStatus } from '../../../types/order';
import styles from './DisplayScreen.module.css';
import logo from '../../../img/AI_Cha_logo.png';

const DEFAULT_WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
const WS_URL = (import.meta.env.VITE_WS_URL || DEFAULT_WS_URL).trim();

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Новый',
  paid: 'Оплачен',
  preparing: 'Готовится',
  ready: 'Готов',
  completed: 'Выдан',
  cancelled: 'Отменён'
};

function PreparingOrderItem({ order }: { order: Order }) {
  return (
    <div className={styles.orderRow}>
      <span className={styles.orderId}>#{order.order_number ?? '—'}</span>
      <span className={`${styles.badge} ${styles[order.status]}`}>{statusLabel[order.status]}</span>
    </div>
  );
}

function ReadyOrderItem({ order }: { order: Order }) {
  return (
    <div className={styles.orderRow}>
      <span className={styles.orderIdReady}>#{order.order_number ?? '—'}</span>
      <span className={`${styles.badge} ${styles.ready}`}>{statusLabel.ready}</span>
    </div>
  );
}

export default function DisplayScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const loadAllActiveOrders = async () => {
    try {
      const allOrders = await fetchOrders({ status: 'active' });
      setOrders(allOrders);
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  };

  useEffect(() => {
    loadAllActiveOrders();
    const interval = setInterval(loadAllActiveOrders, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      console.log('DisplayScreen WS connected');
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.event === 'order_updated' || msg?.event === 'new_order') {
          loadAllActiveOrders();
        }
      } catch (e) {
        console.warn('WS parse error', e);
      }
    };
    ws.onclose = () => {
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          window.location.reload();
        }
      }, 3000);
    };
    return () => ws.close();
  }, []);

  const preparingOrders = orders.filter((o) => o.status !== 'ready' && o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <h2 className={styles.columnTitlePreparing}>Готовятся</h2>
          <div className={styles.ordersList}>
            {preparingOrders.length === 0 ? (
              <div className={styles.empty}>Нет заказов</div>
            ) : (
              preparingOrders.map((order) => <PreparingOrderItem key={order.id} order={order} />)
            )}
          </div>
        </div>

        <div className={styles.column}>
          <h2 className={styles.columnTitleReady}>Готовы</h2>
          <div className={styles.ordersList}>
            {readyOrders.length === 0 ? (
              <div className={styles.empty}>Нет заказов</div>
            ) : (
              readyOrders.map((order) => <ReadyOrderItem key={order.id} order={order} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
