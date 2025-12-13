import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';

function ModeSelectionScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-textPrimary transition-colors">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-h1 font-bold text-primary">Выберите режим</div>
      <div className="flex flex-col gap-4">
        <Button size="large" onClick={() => navigate('/catalog')}>
          Подобрать товар (скоро)
        </Button>
        <Button size="large" variant="secondary" onClick={() => navigate('/catalog')}>
          Обычный заказ
        </Button>
      </div>
    </div>
  );
}

export default ModeSelectionScreen;

