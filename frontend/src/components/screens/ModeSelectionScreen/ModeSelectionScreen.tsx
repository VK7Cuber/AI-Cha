import { useNavigate } from 'react-router-dom';

function ModeSelectionScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mb-8 text-4xl font-bold text-[#D32F2F]">Выберите режим</div>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="w-80 rounded-2xl bg-[#D32F2F] px-6 py-5 text-2xl font-semibold text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          Подобрать товар (скоро)
        </button>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="w-80 rounded-2xl bg-[#757575] px-6 py-5 text-2xl font-semibold text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          Обычный заказ
        </button>
      </div>
    </div>
  );
}

export default ModeSelectionScreen;

