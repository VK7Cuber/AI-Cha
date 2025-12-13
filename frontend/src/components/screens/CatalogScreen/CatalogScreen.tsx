import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Loading from '../../common/Loading/Loading';
import { useProductsStore } from '../../../store/productsStore';
import { useCartStore } from '../../../store/cartStore';
import ProductCard from '../../products/ProductCard/ProductCard';
import Button from '../../common/Button/Button';

function CatalogScreen() {
  const { products, loading, error, loadAll, categories } = useProductsStore();
  const addItem = useCartStore((s) => s.addItem);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const list = Array.isArray(products) ? products : [];

  const filtered = useMemo(() => {
    const byCategory = activeCategory ? list.filter((p) => p.category_id === activeCategory) : list;
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(
      (p) =>
        p.name_ru.toLowerCase().includes(q) ||
        (p.name_zh && p.name_zh.toLowerCase().includes(q)) ||
        (p.description_ru && p.description_ru.toLowerCase().includes(q))
    );
  }, [activeCategory, list, search]);

  return (
    <div className="min-h-screen bg-background text-textPrimary transition-colors">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-surface px-6 py-4 shadow-md">
        <div className="text-h1 font-bold text-primary">Каталог</div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <input
              className="w-72 rounded-2xl border border-grayLight bg-surfaceElevated px-4 py-4 text-h3 text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ThemeToggle />
          <Link
            to="/cart"
            className="rounded-full bg-primary px-7 py-4 text-h2 font-semibold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            Корзина
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6">
        <div className="sm:hidden">
          <input
            className="w-full rounded-2xl border border-grayLight bg-surface px-4 py-4 text-h3 text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === null ? 'primary' : 'outline'}
              size="small"
              onClick={() => setActiveCategory(null)}
            >
              Все
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'primary' : 'outline'}
                size="small"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name_ru}
              </Button>
            ))}
          </div>
        )}

        {loading && <Loading text="Загружаем каталог..." />}
        {error && <div className="rounded-2xl bg-surface p-4 text-textSecondary">Ошибка: {error}</div>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-surface p-6 text-h3 text-textSecondary">
                Товары не найдены. Измените поиск или категорию.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={(p) => addItem(p, 1)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="sticky bottom-0 flex justify-end bg-surface px-6 py-5 shadow-inner">
        <Link
          to="/payment"
          className="rounded-full bg-primary px-8 py-5 text-h2 font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Перейти к оплате
        </Link>
      </footer>
    </div>
  );
}

export default CatalogScreen;

