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

    const payloadItems = items.map((i) => {
      const rawId = i.product.id;
      if (rawId.startsWith('generated-')) {
        return {
          item_type: 'generated_recipe',
          generated_recipe_id: rawId.replace('generated-', ''),
          quantity: i.quantity
        };
      }
      return { product_id: rawId, quantity: i.quantity };
    });

    const payload = {
      terminal_id: 'terminal-1',
      items: payloadItems
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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 max-[1100px]:px-4 max-[1100px]:py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Cha" className="h-10 w-auto object-contain max-[1100px]:h-8" />
            <div className="text-h2 font-bold text-primary max-[1100px]:text-h3">Оплата заказа</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full bg-surfaceElevated/80 px-5 py-3 text-button font-semibold text-textPrimary shadow-inner transition hover:scale-105 active:scale-95 max-[1100px]:px-4 max-[1100px]:py-2 max-[1100px]:text-small"
            >
              Назад
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-16 pt-6 max-[1100px]:gap-4 max-[1100px]:px-4 max-[1100px]:pt-4 max-[1100px]:pb-12">
        {items.length === 0 ? (
          <Card variant="elevated" className="text-textSecondary">
            Корзина пуста. Добавьте товары, чтобы оплатить.
          </Card>
        ) : (
          <>
            <Card variant="elevated" className="space-y-2 bg-surface/85 shadow-lg backdrop-blur max-[1100px]:space-y-1">
              <div className="text-h3 font-semibold text-textPrimary max-[1100px]:text-button">Сумма: {totalAmount.toFixed(0)} ₽</div>
              <div className="text-textSecondary max-[1100px]:text-small">После оплаты вы перейдёте к оценке сервиса</div>
              {error && <div className="text-button text-primary max-[1100px]:text-small">Ошибка: {error}</div>}
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-[1100px]:gap-3">
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
                  className="flex h-full flex-col items-start justify-center rounded-3xl bg-surface/90 px-6 py-6 text-left text-h3 font-semibold text-textPrimary shadow-lg ring-1 ring-grayLight transition hover:-translate-y-1 hover:shadow-xl active:scale-98 disabled:opacity-60 max-[1100px]:px-4 max-[1100px]:py-4 max-[1100px]:text-button"
                >
                  <span className="text-4xl max-[1100px]:text-3xl">{method.icon}</span>
                  <span className="mt-2 max-[1100px]:mt-1">{loading ? 'Обрабатываем...' : method.label}</span>
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

