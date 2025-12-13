import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { useCartStore } from '../../../store/cartStore';
import { createOrder, processPayment } from '../../../services/orderService';

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
    <div className="flex min-h-screen flex-col bg-background text-textPrimary transition-colors">
      <header className="flex items-center justify-between bg-surface px-6 py-4 shadow-md">
        <div className="text-h2 font-bold text-primary">Оплата заказа</div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button type="button" onClick={() => navigate(-1)} className="text-button font-semibold text-textSecondary underline">
            Назад
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
        {items.length === 0 ? (
          <Card variant="elevated" className="text-textSecondary">
            Корзина пуста. Добавьте товары, чтобы оплатить.
          </Card>
        ) : (
          <>
            <Card variant="elevated" className="space-y-2">
              <div className="text-h3 font-semibold text-textPrimary">Сумма: {totalAmount.toFixed(0)} ₽</div>
              <div className="text-textSecondary">После оплаты вы перейдёте к оценке сервиса</div>
              {error && <div className="text-button text-primary">Ошибка: {error}</div>}
            </Card>

            <div className="flex flex-col gap-4">
              {['Банковская карта', 'AI Cha карта', 'Оплата по СБП'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full rounded-2xl bg-surface px-6 py-5 text-left text-h3 font-semibold text-textPrimary shadow-lg ring-1 ring-grayLight transition hover:-translate-y-0.5 hover:shadow-xl active:scale-98 disabled:opacity-60"
                >
                  {loading ? 'Обрабатываем...' : method}
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

