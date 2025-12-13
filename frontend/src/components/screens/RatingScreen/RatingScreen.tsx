import { useNavigate } from 'react-router-dom';

const stars = Array.from({ length: 10 }, (_, idx) => idx + 1);

function RatingScreen() {
  const navigate = useNavigate();

  const handleRate = () => {
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <div className="text-3xl font-bold text-[#212121]">Как вы оцените процесс заказа?</div>
      <div className="text-xl text-[#757575]">您如何评价AI Cha的订购流程?</div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={handleRate}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D32F2F] via-[#FFD700] to-[#388E3C] text-xl font-bold text-white shadow-lg transition hover:scale-110 active:scale-95"
          >
            {star}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="rounded-full bg-[#757575] px-6 py-3 text-lg font-semibold text-white transition hover:scale-105 active:scale-95"
      >
        Пропустить
      </button>
    </div>
  );
}

export default RatingScreen;

