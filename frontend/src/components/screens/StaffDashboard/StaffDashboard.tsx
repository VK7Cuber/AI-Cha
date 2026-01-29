import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../../../services/orderService';
import { Order, OrderStatus } from '../../../types/order';
import styles from './StaffDashboard.module.css';
import { Loading } from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import logo from '../../../img/AI_Cha_logo.png';

type FilterKey = 'active' | OrderStatus | 'all';

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

const badgeOrder: Record<OrderStatus, number> = {
  pending: 1,
  paid: 2,
  preparing: 3,
  ready: 4,
  completed: 5,
  cancelled: 6
};

function Toast({ text }: { text: string }) {
  return <div className={styles.toast}>{text}</div>;
}

function formatTime(value?: string) {
  if (!value) return '--:--';
  const date = new Date(value);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value?: number) {
  return `${Number(value || 0).toFixed(2)} ₽`;
}

function OrderCard({
  order,
  onAction,
  onDetailsClick
}: {
  order: Order;
  onAction: (id: string, status: OrderStatus) => void;
  onDetailsClick: () => void;
}) {
  const items = order.items || [];

  const buttons: { label: string; tone: 'warn' | 'primary' | 'success'; next: OrderStatus }[] = [];
  const isNew = order.status === 'pending' || order.status === 'paid';
  if (isNew) buttons.push({ label: 'В работу', tone: 'warn', next: 'preparing' });
  else if (order.status === 'preparing') buttons.push({ label: 'Готово', tone: 'primary', next: 'ready' });
  else if (order.status === 'ready') buttons.push({ label: 'Выдано', tone: 'success', next: 'completed' });

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.orderNumber}>#{order.order_number ?? '—'}</span>
        <span className={`${styles.badge} ${styles[order.status]}`}>{statusLabel[order.status]}</span>
      </div>
      <div className={styles.meta}>
        <span>{formatTime(order.created_at)}</span>
        <span>{formatCurrency(order.total_amount)}</span>
      </div>
      <ul className={styles.items}>
        {items.map((item) => {
          const name =
            item.product?.name_ru ||
            item.generatedRecipe?.name_ru ||
            item.product_name_ru ||
            item.product?.name_zh ||
            item.generatedRecipe?.name_zh ||
            'Позиция';
          return (
            <li key={item.id}>
              <span>{name}</span>
              <span>×{item.quantity}</span>
            </li>
          );
        })}
      </ul>
      <div className={styles.actions}>
        {buttons.map((btn) => (
          <button key={btn.label} className={`${styles.btn} ${styles[btn.tone]}`} onClick={() => onAction(order.id, btn.next)}>
            {btn.label}
          </button>
        ))}
        <button className={`${styles.btn} ${styles.primary}`} onClick={onDetailsClick}>
          К заказу
        </button>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const [filter, setFilter] = useState<FilterKey>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [now, setNow] = useState(() => formatTime(new Date().toISOString()));
  const [statusModal, setStatusModal] = useState<{ open: boolean; order?: Order; value?: OrderStatus }>({ open: false });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; order?: Order }>({ open: false });

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const aRank = badgeOrder[a.status] ?? 99;
        const bRank = badgeOrder[b.status] ?? 99;
        if (aRank !== bRank) return aRank - bRank;
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      }),
    [orders]
  );

  const load = async (f: FilterKey = filter) => {
    setLoading(true);
    try {
      const data = await fetchOrders(f === 'all' ? {} : { status: f });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    setToast(`Статус: ${statusLabel[status]}`);
    await load(filter);
    setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  useEffect(() => {
    const interval = setInterval(() => setNow(formatTime(new Date().toISOString())), 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => load(filter), 30_000);
    return () => clearInterval(poll);
  }, [filter]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.event === 'new_order' || msg?.event === 'order_updated') {
          load(filter);
        }
      } catch (e) {
        // ignore parse errors
      }
    };
    ws.onclose = () => {
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          // retry
          window.location.reload();
        }
      }, 1500);
    };
    return () => ws.close();
  }, [filter]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.logoWrap}>
            <img src={logo} alt="AI-Cha" className={styles.logoImg} />
            <div className={styles.logo}>Заказы</div>
          </div>
          <div className={styles.time}>{now}</div>
        </header>

        <div className={styles.filters}>
          {[
            { key: 'active' as FilterKey, label: 'Новые' },
            { key: 'preparing' as FilterKey, label: 'Готовятся' },
            { key: 'ready' as FilterKey, label: 'Готовые' },
            { key: 'all' as FilterKey, label: 'Все' }
          ].map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${filter === t.key ? styles.tabActive : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className={styles.grid}>
            {sortedOrders.length === 0 ? (
              <div className={styles.empty}>Нет заказов в выбранном статусе</div>
            ) : (
              sortedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={changeStatus}
                  onDetailsClick={() => setDetailsModal({ open: true, order })}
                />
              ))
            )}
          </div>
        )}
      </div>
      {toast && <Toast text={toast} />}

      <Modal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false })}
        title={`Статус заказа #${statusModal.order?.order_number ?? '—'}`}
      >
        <div className={styles.modalRow}>
          <span>Текущий:</span>
          <span className={`${styles.badge} ${styles[statusModal.order?.status || 'pending']}`}>
            {statusModal.order ? statusLabel[statusModal.order.status] : ''}
          </span>
        </div>
        <div className={styles.statusButtons}>
          {(['pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((st) => (
            <button
              key={st}
              className={`${styles.statusBtn} ${styles[st === 'pending' ? 'warn' : st === 'preparing' ? 'primary' : st === 'ready' ? 'success' : 'neutral']}`}
              onClick={() => setStatusModal((s) => ({ ...s, value: st }))}
              style={statusModal.value === st ? { boxShadow: '0 0 0 3px rgba(211,47,47,0.2)' } : undefined}
            >
              {statusLabel[st]}
            </button>
          ))}
        </div>
        <div className={styles.saveRow}>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={async () => {
              if (!statusModal.order || !statusModal.value) return;
              await changeStatus(statusModal.order.id, statusModal.value);
              setStatusModal({ open: false });
            }}
          >
            Сохранить
          </button>
        </div>
      </Modal>

      <Modal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false })}
        title={`Заказ #${detailsModal.order?.order_number ?? '—'}`}
      >
        <div className={styles.modalRow}>
          <span>Сумма</span>
          <span className={styles.nameStrong}>{formatCurrency(detailsModal.order?.total_amount)}</span>
        </div>
        <div className={styles.modalRow}>
          <span>Статус</span>
          <span className={`${styles.badge} ${styles[detailsModal.order?.status || 'pending']}`}>
            {detailsModal.order ? statusLabel[detailsModal.order.status] : ''}
          </span>
        </div>
        <ul className={styles.modalList}>
          {(detailsModal.order?.items || []).map((item) => {
            const name =
              item.product?.name_ru ||
              item.generatedRecipe?.name_ru ||
              item.product_name_ru ||
              item.product?.name_zh ||
              item.generatedRecipe?.name_zh ||
              'Позиция';
            const desc = item.product?.description_ru || item.generatedRecipe?.description_ru || '';
            return (
              <li key={item.id} className={styles.modalItem}>
                <div>
                  <div className={styles.nameStrong}>{name}</div>
                  {desc ? <div className={styles.subText}>{desc}</div> : null}
                </div>
                <div className={styles.qty}>×{item.quantity}</div>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
