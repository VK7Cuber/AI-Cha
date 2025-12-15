import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';
import { useCartStore } from '../../../store/cartStore';
import logo from '../../../img/AI_Cha_logo.png';

function CartScreen() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, updateQuantity, removeItem, clearCart } = useCartStore();

  const goToPayment = () => {
    if (items.length === 0) return;
    navigate('/payment');
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
            <div className="text-h1 font-bold text-primary">Ваш заказ</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/catalog"
              className="rounded-full bg-surfaceElevated/80 px-5 py-3 text-button font-semibold text-textPrimary shadow-inner transition hover:scale-105 active:scale-95"
            >
              Назад в каталог
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-6 pb-24 pt-6">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-grayLight bg-surface/80 px-8 py-16 shadow-lg backdrop-blur">
            <div className="flex flex-col items-center gap-4 text-center text-textSecondary">
              <div className="text-h2">Корзина пока пуста</div>
              <Button size="large" variant="secondary" onClick={() => navigate('/catalog')}>
                Перейти к каталогу
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-3xl bg-surface/80 p-5 shadow-lg backdrop-blur">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col gap-3 rounded-2xl border border-grayLighter bg-surfaceElevated/90 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="text-left">
                  <div className="text-h1 font-semibold">{item.product.name_ru}</div>
                  <div className="text-h3 text-textSecondary">{item.product.name_zh}</div>
                  <div className="mt-1 text-h3 text-textPrimary">Цена: {item.product.price} ₽</div>
                </div>
                <div className="flex flex-col items-start gap-3 text-left sm:items-end sm:gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-14 w-14 rounded-full bg-grayLighter text-h1 font-bold text-textPrimary shadow hover:scale-105 active:scale-95"
                      aria-label="Уменьшить"
                    >
                      –
                    </button>
                    <div className="w-16 text-center text-h1 font-bold">{item.quantity}</div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-14 w-14 rounded-full bg-primary text-h1 font-bold text-white shadow hover:scale-105 active:scale-95"
                      aria-label="Увеличить"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-h1 font-semibold text-textPrimary">
                    {(Number(item.product.price) * item.quantity).toFixed(0)} ₽
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-full bg-grayLighter px-4 py-2 text-h2 text-textSecondary shadow hover:scale-105 active:scale-95"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-5 left-1/2 z-30 w-[min(90%,720px)] -translate-x-1/2 rounded-3xl bg-surface/90 px-5 py-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-button text-textSecondary">
            Кол-во: <span className="font-semibold text-textPrimary">{totalItems}</span> · Сумма:{' '}
            <span className="font-semibold text-textPrimary">{totalAmount.toFixed(0)} ₽</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={clearCart}>
              Очистить
            </Button>
            <Button size="large" onClick={goToPayment} disabled={items.length === 0}>
              Оплатить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartScreen;

