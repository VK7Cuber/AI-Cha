import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';

function WelcomeScreen() {
  const navigate = useNavigate();

  const handleStart = () => navigate('/mode');

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-surface text-center text-textPrimary transition-colors"
      onClick={handleStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleStart()}
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-6 text-h1 font-bold text-primary animate-fadeIn">AI-Cha</div>
      <div className="space-y-2 text-h2 font-semibold animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div>Добро пожаловать в AI Cha!</div>
        <div className="text-h3 text-textSecondary">欢迎来到爱茶!</div>
      </div>
      <Button className="mt-10" size="large">
        Нажмите, чтобы начать
      </Button>

      <div className="absolute bottom-8 text-button text-textSecondary animate-pulseSoft">Нажмите на экран для начала</div>
    </div>
  );
}

export default WelcomeScreen;

