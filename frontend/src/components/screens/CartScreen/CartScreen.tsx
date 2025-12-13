import { Link } from 'react-router-dom';

function CartScreen() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 bg-white px-6 py-8">
      <header className="flex items-center justify-between">
        <div className="text-3xl font-bold text-[#D32F2F]">Ваш заказ</div>
        <Link to="/catalog" className="text-lg font-semibold text-[#757575] underline">
          Назад к каталогу
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
        <div className="text-center text-xl text-[#757575]">Корзина пока пуста</div>
      </div>

      <footer className="flex justify-end">
        <Link
          to="/payment"
          className="rounded-full bg-[#D32F2F] px-8 py-4 text-xl font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Оплатить
        </Link>
      </footer>
    </div>
  );
}

export default CartScreen;

