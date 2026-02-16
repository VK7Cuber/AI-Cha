import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';
import { fetchRecommended } from '../../../services/productService';
import { Product } from '../../../types/product';
import ProductCard from '../../products/ProductCard/ProductCard';
import Loading from '../../common/Loading/Loading';
import logo from '../../../img/AI_Cha_logo.png';
import { useCartStore } from '../../../store/cartStore';

function RecommendationsScreen() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRecommended(6)
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || 'Не удалось загрузить рекомендации');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary/10 via-surface to-background text-textPrimary transition-colors">
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
            <div className="text-h2 font-bold text-primary max-[1100px]:text-h3">Рекомендации для вас</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/catalog"
              className="rounded-full bg-surfaceElevated/80 px-5 py-3 text-button font-semibold text-textPrimary shadow-inner transition hover:scale-105 active:scale-95 max-[1100px]:px-4 max-[1100px]:py-2 max-[1100px]:text-small"
            >
              Каталог
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 pb-16 pt-6 max-[1100px]:gap-4 max-[1100px]:px-4 max-[1100px]:pt-4 max-[1100px]:pb-12">
        {loading && (
          <div className="rounded-3xl bg-surface/80 p-6 shadow-lg backdrop-blur max-[1100px]:p-4">
            <Loading text="Подбираем рекомендации..." />
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-surface/80 p-6 text-h3 text-primary shadow-lg backdrop-blur max-[1100px]:p-4 max-[1100px]:text-button">
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="text-h3 text-textSecondary max-[1100px]:text-button">6 напитков, которые могут вам понравиться</div>
            {items.length === 0 ? (
              <div className="rounded-3xl bg-surface/80 p-8 text-center text-h3 text-textSecondary shadow-lg backdrop-blur max-[1100px]:p-6 max-[1100px]:text-button">
                Пока нет рекомендаций. Вернитесь в каталог.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-[1100px]:gap-3">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={(p) => addItem(p, 1)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Link
        to="/catalog"
        className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-h1 text-white shadow-xl transition hover:scale-105 active:scale-95 max-[1100px]:bottom-4 max-[1100px]:right-4 max-[1100px]:h-14 max-[1100px]:w-14 max-[1100px]:text-h2"
        aria-label="К каталогу"
      >
        ↩
      </Link>
    </div>
  );
}

export default RecommendationsScreen;

