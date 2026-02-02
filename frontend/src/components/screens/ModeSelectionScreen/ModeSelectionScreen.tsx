import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import Button from '../../common/Button/Button';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import animaBot from '../../../Lottie/Anima Bot.json';

type Mode = 'ai' | 'manual';

function ModeSelectionScreen() {
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMode = (mode: Mode) => {
    sessionStorage.setItem('ai-cha-mode', mode);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => navigate('/'), 60000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate]);

  const onAiSoon = () => {
    setMode('ai');
    setTimeout(() => navigate('/catalog'), 1200);
  };

  const onManual = () => {
    setMode('manual');
    navigate('/catalog');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/12 via-surface to-background px-4 text-center text-textPrimary transition-colors">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute left-10 top-20 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute left-12 bottom-14 h-72 w-72 rounded-full bg-gold/14 blur-3xl" />
        <div className="absolute right-8 bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,var(--glow-1),transparent_32%),radial-gradient(circle_at_25%_75%,var(--glow-2),transparent_28%)]" />
      </div>

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="z-10 flex max-w-4xl flex-col items-center gap-8">
        <div className="relative flex flex-col items-center gap-5 px-6 text-textSecondary">
          <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-primary/12 shadow-inner">
            <Lottie animationData={animaBot} loop autoplay className="h-80 w-80" />
          </div>
          <div className="relative text-h2 font-semibold text-textPrimary">AI или обычный заказ?</div>
          <div className="relative max-w-2xl text-h3 text-textSecondary/80">
            ИИ может придумать для вас подходящий напиток. Попробуем?
          </div>
        </div>

        <div className="flex w-full max-w-3xl flex-col gap-4">
          <Button size="large" className="w-full py-5 text-h2" onClick={onAiSoon}>
            Подобрать товар
          </Button>
          <Button size="large" variant="secondary" className="w-full py-5 text-h2" onClick={onManual}>
            Обычный заказ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ModeSelectionScreen;

