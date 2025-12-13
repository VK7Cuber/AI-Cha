import { Link } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';

const placeholderItems = [
  { id: 'r1', nameRu: 'Успокаивающий сбор', nameZh: '舒缓茶', reason: 'Подходит вашему настроению' },
  { id: 'r2', nameRu: 'Ягодный чай', nameZh: '浆果茶', reason: 'Легкий и фруктовый вкус' }
];

function RecommendationsScreen() {
  return (
    <div className="min-h-screen bg-background text-textPrimary transition-colors">
      <header className="flex items-center justify-between bg-surface px-6 py-4 shadow-md">
        <div className="text-h2 font-bold text-primary">Рекомендации для вас</div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {placeholderItems.map((item) => (
            <Card key={item.id} variant="elevated">
              <div className="text-h3 font-semibold">{item.nameRu}</div>
              <div className="text-textSecondary">{item.nameZh}</div>
              <div className="mt-2 text-small text-green">{item.reason}</div>
            </Card>
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 flex justify-end bg-surface px-6 py-4 shadow-inner">
        <Button as="a" href="/catalog" size="large">
          Добавить другие товары
        </Button>
      </footer>
    </div>
  );
}

export default RecommendationsScreen;

