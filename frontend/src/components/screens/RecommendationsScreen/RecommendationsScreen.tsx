import { Link } from 'react-router-dom';

const placeholderItems = [
  { id: 'r1', nameRu: 'Успокаивающий сбор', nameZh: '舒缓茶', reason: 'Подходит вашему настроению' },
  { id: 'r2', nameRu: 'Ягодный чай', nameZh: '浆果茶', reason: 'Легкий и фруктовый вкус' }
];

function RecommendationsScreen() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-white px-6 py-8">
      <header className="text-3xl font-bold text-[#D32F2F]">Рекомендации для вас</header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {placeholderItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-100 bg-[#fff8f6] p-4 shadow-sm">
            <div className="text-xl font-semibold">{item.nameRu}</div>
            <div className="text-[#757575]">{item.nameZh}</div>
            <div className="mt-2 text-sm text-[#388E3C]">{item.reason}</div>
          </div>
        ))}
      </div>

      <footer className="mt-auto flex justify-end">
        <Link
          to="/catalog"
          className="rounded-full bg-[#D32F2F] px-8 py-4 text-xl font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Добавить другие товары
        </Link>
      </footer>
    </div>
  );
}

export default RecommendationsScreen;

