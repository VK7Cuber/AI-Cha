import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';
import { useCartStore } from '../../../store/cartStore';

function CartScreen() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, updateQuantity, removeItem, clearCart } = useCartStore();

  const goToPayment = () => {
    if (items.length === 0) return;
    navigate('/payment');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-textPrimary transition-colors">
      <header className="flex items-center justify-between bg-surface px-6 py-5 shadow-md">
        <div className="text-h1 font-bold text-primary">Ваш заказ</div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/catalog" className="text-button font-semibold text-textSecondary underline">
            Назад к каталогу
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-8">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-grayLight bg-surface px-6 py-12">
          <div className="flex flex-col items-center gap-3 text-center text-textSecondary">
            <div className="text-h2">Корзина пока пуста</div>
              <Button variant="secondary" onClick={() => navigate('/catalog')}>
                Перейти к каталогу
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-grayLight bg-surface p-4 shadow-sm">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col gap-3 rounded-2xl border border-grayLighter bg-surfaceElevated p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="text-left">
                  <div className="text-h1 font-semibold">{item.product.name_ru}</div>
                  <div className="text-h3 text-textSecondary">{item.product.name_zh}</div>
                  <div className="mt-1 text-h3 text-textPrimary">Цена: {item.product.price} ₽</div>
                </div>
                <div className="flex flex-col items-start gap-2 text-left sm:items-start sm:gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-14 w-14 rounded-full bg-grayLighter text-h1 font-bold text-textPrimary shadow hover:scale-105 active:scale-95"
                      aria-label="Уменьшить"
                    >
                      –
                    </button>
                    <div className="w-16 text-left text-h1 font-bold">{item.quantity}</div>
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
                    className="rounded-full bg-grayLighter px-4 py-2 text-h2 text-textSecondary hover:scale-105 active:scale-95"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 flex justify-end bg-surface px-6 py-5 shadow-inner">
        <div className="flex w-full max-w-4xl items-center justify-between gap-3">
          <div className="text-button text-textSecondary text-left">
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
      </footer>
    </div>
  );
}

export default CartScreen;

