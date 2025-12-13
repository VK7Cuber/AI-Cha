import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';

const stars = Array.from({ length: 10 }, (_, idx) => idx + 1);

function RatingScreen() {
  const navigate = useNavigate();

  const handleRate = () => {
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-textPrimary transition-colors">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="text-h2 font-bold">Как вы оцените процесс заказа?</div>
      <div className="text-button text-textSecondary">您如何评价AI Cha的订购流程?</div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={handleRate}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-primary via-primaryHover to-gold text-button font-bold text-white shadow-lg transition hover:scale-110 active:scale-95"
          >
            {star}
          </button>
        ))}
      </div>
      <Button variant="secondary" onClick={() => navigate('/')}>
        Пропустить
      </Button>
    </div>
  );
}

export default RatingScreen;

