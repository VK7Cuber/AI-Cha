import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../img/AI_Cha_logo.png';

type HealthState = 'checking' | 'ok' | 'fail';

function WelcomeScreen() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthState>('checking');
  const startedRef = useRef(false);

  const handleStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    navigate('/mode');
  };

  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        if (!cancelled) setHealth(data?.status === 'ok' ? 'ok' : 'fail');
      } catch (_err) {
        if (!cancelled) setHealth('fail');
      }
    };
    checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const healthText = useMemo(() => {
    if (health === 'checking') return 'Проверяем соединение...';
    if (health === 'ok') return 'Связь с сервером установлена';
    return 'Нет связи с сервером';
  }, [health]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-surface to-background text-center text-textPrimary transition-colors"
      onClick={handleStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleStart()}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 h-64 w-64 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute right-4 top-16 h-52 w-52 rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute right-10 bottom-12 h-72 w-72 rounded-full bg-gold/14 blur-3xl" />
        <div className="absolute left-6 bottom-10 h-60 w-60 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.06),transparent_28%)]" />
      </div>

      <div className="z-10 flex max-w-3xl flex-col items-center gap-6 px-6">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="AI Cha logo" className="max-h-80 w-full max-w-3xl animate-fadeIn drop-shadow-xl object-contain" />
        </div>

        <div className="space-y-2 text-h2 font-semibold animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div>Добро пожаловать в кафе AI Cha!</div>
          <div className="text-h3 text-textSecondary">欢迎来到爱茶!</div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 flex items-center gap-3 text-button text-textSecondary animate-pulseSoft">
        <span className="text-small font-medium text-textSecondary/70">{healthText}</span>
      </div>
    </div>
  );
}

export default WelcomeScreen;

