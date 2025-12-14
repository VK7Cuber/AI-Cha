import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';
import logo from '../../../img/AI_Cha_logo.png';

const stars = Array.from({ length: 10 }, (_, idx) => idx + 1);

function RatingScreen() {
  const navigate = useNavigate();
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleRate = (value: number) => {
    setSelected(value);
    setTimeout(() => navigate('/'), 800);
  };

  const label = useMemo(() => {
    if (selected) return `Спасибо! Оценка: ${selected}/10`;
    if (hover) return `Ваша оценка: ${hover}/10`;
    return 'Как вы оцените процесс заказа?';
  }, [hover, selected]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-primary/10 via-surface to-background text-textPrimary transition-colors">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-8 top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-6 bottom-16 h-72 w-72 rounded-full bg-gold/12 blur-3xl" />
        <div className="absolute left-10 bottom-12 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,255,255,0.07),transparent_32%),radial-gradient(circle_at_25%_80%,rgba(255,255,255,0.06),transparent_28%)]" />
      </div>

      <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur-md shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Cha" className="h-10 w-auto object-contain" />
            <div className="text-h2 font-bold text-primary">Оценка сервиса</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-6 pb-14 pt-10 text-center">
        <div className="text-h1 font-bold text-primary">{label}</div>
        <div className="text-h3 text-textSecondary">您如何评价AI Cha的订购流程?</div>

        <div className="flex flex-wrap items-center justify-center gap-4 rounded-3xl bg-surface/80 px-6 py-6 shadow-lg backdrop-blur">
          {stars.map((star) => {
            const active = selected ? star <= selected : hover ? star <= hover : false;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleRate(star)}
                className={`h-16 w-16 rounded-full text-h2 font-bold shadow-lg transition hover:scale-110 active:scale-95 ${
                  active
                    ? 'bg-gradient-to-br from-primary via-primaryHover to-gold text-white'
                    : 'bg-surfaceElevated text-textPrimary ring-1 ring-grayLight'
                }`}
                aria-label={`Оценка ${star}`}
              >
                {star}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 rounded-3xl bg-surface/75 px-6 py-4 text-button text-textSecondary shadow-lg backdrop-blur">
          <span className="text-textPrimary font-semibold">Совет:</span>
          <span>Высокая оценка ускорит повторную подачу заказов и улучшит сервис</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-2 text-h2 font-semibold text-textSecondary/70 transition hover:scale-105 active:scale-95"
        >
          Пропустить
        </button>
      </main>
    </div>
  );
}

export default RatingScreen;

