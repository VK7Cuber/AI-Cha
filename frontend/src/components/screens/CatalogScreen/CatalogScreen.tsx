import { Link } from 'react-router-dom';

const mockProducts = [
  { id: '1', nameRu: 'Лунцзин', nameZh: '龙井茶', price: 250 },
  { id: '2', nameRu: 'Молочный улун', nameZh: '乌龙茶', price: 280 },
  { id: '3', nameRu: 'Матча латте', nameZh: '抹茶拿铁', price: 320 }
];

function CatalogScreen() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-white px-6 py-8">
      <header className="flex items-center justify-between">
        <div className="text-3xl font-bold text-[#D32F2F]">Каталог</div>
        <Link
          to="/cart"
          className="rounded-full bg-[#D32F2F] px-6 py-3 text-lg font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Корзина
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mockProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-gray-100 bg-[#fff8f6] p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-xl font-semibold">{product.nameRu}</div>
            <div className="text-[#757575]">{product.nameZh}</div>
            <div className="mt-3 text-2xl font-bold text-[#212121]">{product.price} ₽</div>
          </div>
        ))}
      </div>

      <footer className="mt-auto flex justify-end">
        <Link
          to="/payment"
          className="rounded-full bg-[#D32F2F] px-8 py-4 text-xl font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Перейти к оплате
        </Link>
      </footer>
    </div>
  );
}

export default CatalogScreen;

