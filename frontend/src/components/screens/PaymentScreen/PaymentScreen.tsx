import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { useCartStore } from '../../../store/cartStore';
import { createOrder, processPayment } from '../../../services/orderService';
import logo from '../../../img/AI_Cha_logo.png';

function PaymentScreen() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = () => {
    if (!items.length) {
      navigate('/catalog');
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      terminal_id: 'terminal-1',
      items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
    };

    createOrder(payload)
      .then((order) => processPayment(order.id, 'card'))
      .then(() => {
        clearCart();
        navigate('/rating');
      })
      .catch((err: any) => {
        setError(err?.message || 'Ошибка оплаты');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-primary/10 via-surface to-background text-textPrimary transition-colors">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-6 bottom-16 h-72 w-72 rounded-full bg-gold/12 blur-3xl" />
        <div className="absolute left-10 bottom-12 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,var(--glow-1),transparent_32%),radial-gradient(circle_at_25%_80%,var(--glow-2),transparent_28%)]" />
      </div>

      <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur-md shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Cha" className="h-10 w-auto object-contain" />
            <div className="text-h2 font-bold text-primary">Оплата заказа</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full bg-surfaceElevated/80 px-5 py-3 text-button font-semibold text-textPrimary shadow-inner transition hover:scale-105 active:scale-95"
            >
              Назад
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-16 pt-6">
        {items.length === 0 ? (
          <Card variant="elevated" className="text-textSecondary">
            Корзина пуста. Добавьте товары, чтобы оплатить.
          </Card>
        ) : (
          <>
            <Card variant="elevated" className="space-y-2 bg-surface/85 shadow-lg backdrop-blur">
              <div className="text-h3 font-semibold text-textPrimary">Сумма: {totalAmount.toFixed(0)} ₽</div>
              <div className="text-textSecondary">После оплаты вы перейдёте к оценке сервиса</div>
              {error && <div className="text-button text-primary">Ошибка: {error}</div>}
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Банковская карта', icon: '💳' },
                { label: 'AI Cha карта', icon: '🪪' },
                { label: 'Оплата по СБП', icon: '📱' }
              ].map((method) => (
                <button
                  key={method.label}
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="flex h-full flex-col items-start justify-center rounded-3xl bg-surface/90 px-6 py-6 text-left text-h3 font-semibold text-textPrimary shadow-lg ring-1 ring-grayLight transition hover:-translate-y-1 hover:shadow-xl active:scale-98 disabled:opacity-60"
                >
                  <span className="text-4xl">{method.icon}</span>
                  <span className="mt-2">{loading ? 'Обрабатываем...' : method.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default PaymentScreen;

