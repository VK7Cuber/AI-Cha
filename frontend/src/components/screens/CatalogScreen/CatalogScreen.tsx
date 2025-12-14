import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Loading from '../../common/Loading/Loading';
import { useProductsStore } from '../../../store/productsStore';
import { useCartStore } from '../../../store/cartStore';
import ProductCard from '../../products/ProductCard/ProductCard';
import Button from '../../common/Button/Button';
import logo from '../../../img/AI_Cha_logo.png';

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
    <div className="relative min-h-screen bg-gradient-to-b from-primary/10 via-surface to-background text-textPrimary transition-colors">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-6 bottom-16 h-72 w-72 rounded-full bg-gold/12 blur-3xl" />
        <div className="absolute left-10 bottom-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,255,255,0.07),transparent_32%),radial-gradient(circle_at_25%_80%,rgba(255,255,255,0.06),transparent_28%)]" />
      </div>

      <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur-md shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Cha" className="h-11 w-auto object-contain" />
            <div className="text-h1 font-bold text-primary">Каталог</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <input
                className="w-72 rounded-2xl border border-grayLight bg-surfaceElevated/90 px-4 py-4 text-h3 text-textPrimary shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 pb-10 pt-6">
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

        {loading && (
          <div className="rounded-3xl bg-surface/70 p-6 shadow-lg backdrop-blur">
            <Loading text="Загружаем каталог..." />
          </div>
        )}
        {error && <div className="rounded-3xl bg-surface/80 p-6 text-h3 text-primary shadow-lg backdrop-blur">Ошибка: {error}</div>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-3xl bg-surface/80 p-8 text-center text-h3 text-textSecondary shadow-lg backdrop-blur">
                Товары не найдены. Измените поиск или категорию.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={(p) => addItem(p, 1)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Link
        to="/payment"
        aria-label="Перейти к оплате"
        className="fixed bottom-6 right-6 z-30 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-h1 text-white shadow-xl transition hover:scale-105 active:scale-95"
      >
        💰
      </Link>
    </div>
  );
}

export default CatalogScreen;

